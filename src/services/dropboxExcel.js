import * as XLSX from 'xlsx'

function ensureDirectDownloadLink(url) {
  if (!url) {
    return ''
  }

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('dropbox.com')) {
      parsed.hostname = 'dl.dropboxusercontent.com'

      if (parsed.searchParams.has('dl')) {
        parsed.searchParams.delete('dl')
      }

      if (!parsed.searchParams.has('raw')) {
        parsed.searchParams.append('raw', '1')
      }
    }

    return parsed.toString()
  } catch (error) {
    console.warn('Invalid Dropbox URL, using original string', error)
    return url
  }
}

export async function fetchDropboxExcel({ url, sheetName }) {
  const directUrl = ensureDirectDownloadLink(url)

  if (!directUrl) {
    throw new Error('Dropbox Excel URL not configured.')
  }

  const response = await fetch(directUrl)

  if (!response.ok) {
    throw new Error('Falha ao baixar o arquivo do Dropbox.')
  }

  const arrayBuffer = await response.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const targetSheetName = sheetName && workbook.SheetNames.includes(sheetName)
    ? sheetName
    : workbook.SheetNames[0]

  if (!targetSheetName) {
    throw new Error('Nenhuma aba encontrada no Excel.')
  }

  const worksheet = workbook.Sheets[targetSheetName]
  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
    raw: true,
  })

  const headerRowIndex = findHeaderRow(matrix)

  if (headerRowIndex === -1) {
    throw new Error('Cabecalho nao encontrado na planilha.')
  }

  const headers = matrix[headerRowIndex]
  const dataRows = matrix.slice(headerRowIndex + 1)

  const rows = dataRows
    .filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined))
    .map((row) => mapRowFromHeaders(headers, row))

  return {
    rows,
    sheetName: targetSheetName,
    lastUpdated: new Date(),
  }
}

export const dropboxExcelService = {
  fetchDropboxExcel,
}

const headerTargets = ['si/inc', 'pep', 'nota', 'local', 'status', 'motivo']

function findHeaderRow(matrix) {
  return matrix.findIndex((row) => {
    if (!Array.isArray(row)) {
      return false
    }

    const normalizedCells = row.map((cell) => normalizeHeaderCell(cell))
    const matches = headerTargets.filter((target) => normalizedCells.includes(target))

    return matches.length >= 3
  })
}

function mapRowFromHeaders(headers, row) {
  return headers.reduce((acc, header, index) => {
    const value = row[index] ?? ''
    const key = header || `col_${index}`
    acc[key] = typeof value === 'string' ? value.trim() : value
    return acc
  }, {})
}

function normalizeHeaderCell(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}
