<template>
  <q-page class="obras-page q-pa-xl column q-gutter-lg">
    <section class="hero">
      <div class="hero__eyebrow">Painel operacional</div>
      <div class="hero__title">Obras</div>
    </section>

    <q-card flat bordered class="full-width dashboard-panel">
      <q-card-section class="summary-toolbar row items-center q-col-gutter-sm">
        <div class="summary-toolbar__title text-h6">Resumo dos envios</div>
        <q-space />
        <div class="summary-toolbar__meta row items-center q-gutter-sm">
          <q-badge v-if="currentSheet" color="secondary" class="summary-toolbar__badge">
            Planilha: <span>{{ currentSheet }}</span>
          </q-badge>
          <q-badge
            v-if="lastSync"
            color="grey-8"
            outline
            class="summary-toolbar__badge summary-toolbar__badge--muted"
          >
            Atualizado <span>{{ formattedLastSync }}</span>
          </q-badge>
          <q-btn
            color="primary"
            icon="refresh"
            label="Atualizar"
            unelevated
            :loading="isLoading"
            class="summary-toolbar__action"
            @click="loadExcel"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div v-for="card in summaryCards" :key="card.label" class="col-12 col-sm-4">
            <div
              class="summary-card q-pa-md column q-gutter-sm"
              :class="`summary-card--${card.accent}`"
            >
              <div class="summary-card__icon">
                <q-icon :name="card.icon" size="28px" />
              </div>
              <div class="summary-card__label">{{ card.label }}</div>
              <div class="summary-card__value">{{ card.value }}</div>
              <div class="summary-card__caption">{{ card.caption }}</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-banner v-if="!dropboxConfigured" class="bg-orange-1 text-orange-10">
        <template #avatar>
          <q-icon name="warning" color="orange-10" />
        </template>
        Defina a variavel de ambiente VITE_DROPBOX_OBRAS_URL com o link compartilhado do Excel no
        Dropbox.
      </q-banner>

      <q-banner v-else-if="loadError" class="bg-red-1 text-negative">
        <template #avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ loadError }}
      </q-banner>
    </q-card>

    <q-card flat bordered class="full-width filters-panel">
      <q-card-section class="filters-panel__toolbar column q-gutter-md">
        <div class="filters-panel__heading row items-center">
          <div class="column">
            <div class="filters-panel__eyebrow">Refine seus critérios</div>
            <div class="filters-panel__title">Detalhamento das obras</div>
          </div>
          <q-space />
          <q-chip color="primary" text-color="white" icon="view_comfy" class="filters-panel__chip">
            {{ filteredObras.length }} registros ativos
          </q-chip>
        </div>

        <div class="filters-panel__controls row items-center q-col-gutter-md">
          <q-input
            v-model="tableFilter"
            dense
            filled
            placeholder="Filtrar por SI/INC, local ou motivo"
            class="col-12 col-lg-5 filter-input"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-input
            v-model="dateFilterText"
            dense
            filled
            clearable
            readonly
            placeholder="Filtrar por data"
            class="col-12 col-sm-4 col-lg-3 filter-input"
            @clear="clearDateFilter"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale" cover>
                  <q-date
                    v-model="dateFilterISO"
                    mask="YYYY-MM-DD"
                    flat
                    square
                    @update:model-value="handleDatePick"
                    v-close-popup
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="col-12 col-lg-4 mode-toggle-wrapper">
            <div class="mode-toggle-label">Modo de visualização</div>
            <div class="mode-switch" role="tablist" aria-label="Modo de visualização">
              <button
                v-for="option in viewModeOptions"
                :key="option.value"
                class="mode-switch__option"
                :class="{ 'mode-switch__option--active': viewMode === option.value }"
                type="button"
                @click="viewMode = option.value"
              >
                {{ option.label }}
              </button>
              <span class="mode-switch__slider" :style="modeSwitchStyle" aria-hidden="true" />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-expansion-item
        icon="tune"
        label="Filtro avançado"
        dense
        expand-icon-toggle
        header-class="text-primary text-weight-medium"
        class="advanced-filter"
      >
        <div class="row q-col-gutter-md q-pa-md">
          <q-select
            v-model="advancedFilter.pep"
            :options="filterOptions.pep"
            label="PEP"
            dense
            clearable
            filled
            class="col-12 col-sm-4"
          />
          <q-select
            v-model="advancedFilter.encarregado"
            :options="filterOptions.encarregado"
            label="Encarregado"
            dense
            clearable
            filled
            class="col-12 col-sm-4"
          />
          <q-select
            v-model="advancedFilter.status"
            :options="filterOptions.status"
            label="Status"
            dense
            clearable
            filled
            class="col-12 col-sm-4"
          />
          <q-select
            v-model="advancedFilter.local"
            :options="filterOptions.local"
            label="Local"
            dense
            clearable
            filled
            class="col-12 col-sm-4"
          />
          <q-select
            v-model="advancedFilter.siInc"
            :options="filterOptions.siInc"
            label="SI/INC"
            dense
            clearable
            filled
            class="col-12 col-sm-4"
          />
          <div class="col-12 col-sm-4 flex items-end">
            <q-btn
              outline
              color="primary"
              icon="filter_alt_off"
              label="Limpar filtros"
              class="full-width"
              @click="clearAdvancedFilters"
            />
          </div>
        </div>
      </q-expansion-item>

      <q-table
        flat
        bordered
        :rows="filteredObras"
        :columns="columns"
        row-key="id"
        :filter="tableFilter"
        :loading="isLoading"
        no-data-label="Nenhuma obra encontrada"
        class="obras-table"
      >
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip dense :color="statusColor(props.row.status)" text-color="white">
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div v-if="viewMode === 'TRATADAS'" class="column items-center q-gutter-xs">
              <q-btn
                dense
                :outline="!props.row.lastSendIso"
                color="positive"
                :label="props.row.lastSendIso ? 'Enviado' : 'Enviar'"
                :class="['enviado-btn', { 'enviado-btn--done': props.row.lastSendIso }]"
                @click="openEnviarDialog(props.row)"
              />
              <div v-if="props.row.lastSendDisplay" class="enviado-log text-caption">
                Enviado em {{ props.row.lastSendDisplay }}
              </div>
            </div>
          </q-td>
        </template>

        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>

      <q-dialog v-model="enviarDialog" persistent>
        <q-card class="enviar-dialog">
          <q-card-section>
            <div class="text-caption text-uppercase text-weight-bold">Registrar envio</div>
            <div class="text-h6 q-mt-xs">
              {{
                enviarDialogRow
                  ? enviarDialogRow.siInc || enviarDialogRow.nota || 'Registro selecionado'
                  : 'Selecione um registro'
              }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Informe a data do envio para manter o histórico atualizado.
            </div>
            <div class="q-mt-md">
              <q-date v-model="enviarDate" mask="YYYY-MM-DD" color="primary" flat bordered />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="grey" @click="closeEnviarDialog" />
            <q-btn
              color="positive"
              label="Registrar"
              :disable="!enviarDate || isRegistering"
              :loading="isRegistering"
              @click="confirmEnviar"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { fetchDropboxExcel } from 'src/services/dropboxExcel'

const dropboxExcelUrl = import.meta.env.VITE_DROPBOX_OBRAS_URL || ''
const dropboxSheetName = import.meta.env.VITE_DROPBOX_OBRAS_SHEET || ''
const $q = useQuasar()

const obras = ref([])
const isLoading = ref(false)
const loadError = ref(null)
const lastSync = ref(null)
const currentSheet = ref(dropboxSheetName)
const tableFilter = ref('')
const viewMode = ref('PROGRAMADOR')
const dateFilterText = ref('')
const dateFilterISO = ref('')
const advancedFilter = reactive({
  pep: '',
  encarregado: '',
  status: '',
  local: '',
  siInc: '',
})
const enviarDialog = ref(false)
const enviarDialogRow = ref(null)
const enviarDate = ref('')
const isRegistering = ref(false)

const columns = [
  { name: 'data', label: 'DATA', field: 'data', align: 'left', sortable: true },
  {
    name: 'encarregado',
    label: 'ENCARREGADO',
    field: 'encarregado',
    align: 'left',
    sortable: true,
  },
  { name: 'siInc', label: 'SI/INC', field: 'siInc', align: 'left', sortable: true },
  { name: 'pep', label: 'PEP', field: 'pep', align: 'left', sortable: true },
  { name: 'nota', label: 'NOTA', field: 'nota', align: 'left', sortable: true },
  { name: 'local', label: 'LOCAL', field: 'local', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'status', align: 'left', sortable: true },
  { name: 'motivo', label: 'MOTIVO', field: 'motivo', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'center' },
]

const viewModeOptions = [
  { label: 'PROGRAMADOR', value: 'PROGRAMADOR' },
  { label: 'TRATADAS', value: 'TRATADAS' },
]

const dropboxConfigured = computed(() => Boolean(dropboxExcelUrl))

const summaryCards = computed(() => {
  const total = obras.value.length
  const enviados = obras.value.filter((row) => row.entregue).length
  const pendentes = obras.value.filter((row) => row.pendente).length

  return [
    {
      label: 'Registros no Excel',
      value: total,
      caption: 'Total de linhas lidas',
      icon: 'table_chart',
      accent: 'primary',
    },
    {
      label: 'Envios confirmados',
      value: enviados,
      caption: 'Status marcados como enviados',
      icon: 'check_circle',
      accent: 'success',
    },
    {
      label: 'Pendencias',
      value: pendentes,
      caption: 'Itens aguardando envio',
      icon: 'pending_actions',
      accent: 'warning',
    },
  ]
})

const filteredObras = computed(() => {
  let dataset = obras.value

  if (viewMode.value === 'TRATADAS') {
    dataset = dataset
      .filter((row) => isConcludedStatus(row.status))
      .filter((row) => isWithinLastMonth(row.dateIso))
  }

  if (dateFilterISO.value) {
    dataset = dataset.filter((row) => row.dateIso === dateFilterISO.value)
  }

  return dataset.filter((row) => matchesAdvancedFilters(row))
})

const filterOptions = computed(() => ({
  pep: uniqueValues('pep'),
  encarregado: uniqueValues('encarregado'),
  status: uniqueValues('status'),
  local: uniqueValues('local'),
  siInc: uniqueValues('siInc'),
}))

const modeSwitchStyle = computed(() => {
  const index = viewModeOptions.findIndex((option) => option.value === viewMode.value)
  const widthPercent = 100 / viewModeOptions.length
  return {
    width: `${widthPercent}%`,
    transform: `translateX(${index * 100}%)`,
  }
})

watch(viewMode, (mode) => {
  if (mode === 'PROGRAMADOR') {
    tableFilter.value = ''
  }

  if (mode === 'TRATADAS') {
    loadExcel()
  }
})

const formattedLastSync = computed(() => {
  if (!lastSync.value) {
    return 'Nunca sincronizado'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(lastSync.value)
})

async function loadExcel() {
  if (!dropboxConfigured.value) {
    loadError.value = 'Configure a URL do Dropbox antes de sincronizar.'
    return
  }

  isLoading.value = true
  loadError.value = null

  try {
    const { rows, sheetName } = await fetchDropboxExcel({
      url: dropboxExcelUrl,
      sheetName: dropboxSheetName,
    })

    obras.value = rows.map(normalizeRow)
    currentSheet.value = sheetName
    lastSync.value = new Date()
  } catch (error) {
    console.error(error)
    loadError.value = error.message || 'Erro ao carregar dados do Dropbox.'
  } finally {
    isLoading.value = false
  }
}

function normalizeRow(row, index) {
  const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
    const cleanKey = normalizeKey(key)
    if (!cleanKey) {
      return acc
    }

    const cleanValue = typeof value === 'string' ? value.trim() : value

    if (cleanValue !== undefined && cleanValue !== null && cleanValue !== '') {
      acc[cleanKey] = cleanValue
    }

    return acc
  }, {})

  const siInc = getValue(normalizedRow, ['si/inc', 'si inc', 'si', 'inc'])
  const pep = getValue(normalizedRow, ['pep'])
  const nota = getValue(normalizedRow, ['nota', 'nota fiscal', 'nota nf'])
  const local = getValue(normalizedRow, ['local', 'cidade', 'base'])
  const encarregadoValue = getValue(normalizedRow, ['encarregado', 'responsavel', 'responsável'])
  const status = getValue(normalizedRow, ['status', 'situacao', 'situação'], 'Sem status')
  const motivo = getValue(normalizedRow, ['motivo', 'justificativa'])
  const data = getValue(normalizedRow, ['data'])
  const { isoDate, displayDate } = parseDateCell(data)

  const entregue = isDelivered(status)

  return {
    id: siInc || pep || nota || `registro-${index}`,
    data: displayDate,
    dateIso: isoDate,
    encarregado: encarregadoValue,
    siInc,
    pep,
    nota,
    local,
    status,
    motivo,
    entregue,
    pendente: !entregue,
    lastSendIso: '',
    lastSendDisplay: '',
    raw: row,
  }
}

function normalizeKey(key = '') {
  return key
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function getValue(rowMap, aliases, fallback = '') {
  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias)
    if (normalizedAlias && rowMap[normalizedAlias] !== undefined) {
      const value = rowMap[normalizedAlias]
      if (value !== '') {
        return value
      }
    }
  }

  return fallback
}

function isDelivered(statusText = '') {
  const normalized = statusText.toString().trim().toLowerCase()
  if (!normalized) {
    return false
  }

  return [
    'enviado',
    'enviada',
    'finalizado',
    'finalizada',
    'concluido',
    'concluida',
    'concluída',
    'ok',
    'programada',
    'programado',
  ].some((token) => normalized.includes(token))
}

function isConcludedStatus(statusText = '') {
  const normalized = statusText.toString().trim().toLowerCase()
  if (!normalized) {
    return false
  }

  return ['concluido', 'concluida', 'concluída'].includes(normalized)
}

function isWithinLastMonth(dateIso = '') {
  if (!dateIso) {
    return false
  }

  const recordDate = new Date(dateIso)
  if (Number.isNaN(recordDate.getTime())) {
    return false
  }

  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  return recordDate >= oneMonthAgo && recordDate <= today
}

function parseDateCell(value) {
  const isoDate = toIsoDateString(value)

  if (isoDate) {
    return {
      isoDate,
      displayDate: formatDisplayDate(isoDate),
    }
  }

  const fallback = value === undefined || value === null ? '' : value.toString().trim()

  return {
    isoDate: '',
    displayDate: fallback,
  }
}

function toIsoDateString(value) {
  if (value === undefined || value === null || value === '') {
    return ''
  }

  if (typeof value === 'number' && !Number.isNaN(value)) {
    return parseExcelSerialDate(value)
  }

  if (value instanceof Date && !Number.isNaN(value)) {
    return formatIsoFromParts(value.getFullYear(), value.getMonth() + 1, value.getDate())
  }

  const text = value.toString().trim()

  if (!text) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const sanitized = text.replace(/[^0-9/. -]+/g, ' ')
  const parts = sanitized.split(/[/. -]+/).filter(Boolean)

  if (parts.length !== 3) {
    return ''
  }

  const numbers = parts.map((part) => Number.parseInt(part, 10))

  if (numbers.some((num) => Number.isNaN(num))) {
    return ''
  }

  let [first, second, third] = numbers
  let year
  let month
  let day

  if (first >= 1900) {
    year = normalizeYear(first)
    month = second
    day = third
  } else {
    year = normalizeYear(third)

    const isDayFirst = first > 12 || (first <= 12 && second <= 12 && first >= second)

    if (isDayFirst) {
      day = first
      month = second
    } else {
      month = first
      day = second
    }
  }

  return formatIsoFromParts(year, month, day)
}

function normalizeYear(rawValue) {
  const numericYear = Number.parseInt(rawValue, 10)

  if (Number.isNaN(numericYear)) {
    return 0
  }

  if (numericYear >= 1900) {
    return numericYear
  }

  if (numericYear < 100) {
    return 2000 + numericYear
  }

  return numericYear
}

function formatDisplayDate(normalized = '') {
  if (!normalized) {
    return ''
  }

  const [year, month, day] = normalized.split('-')
  return `${day}/${month}/${year}`
}

function formatIsoFromParts(year, month, day) {
  if (!year || !month || !day) {
    return ''
  }

  if (year < 100) {
    year += 2000
  }

  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return ''
  }

  return date.toISOString().split('T')[0]
}

function parseExcelSerialDate(serial) {
  if (!XLSX?.SSF?.parse_date_code) {
    return ''
  }

  const date = XLSX.SSF.parse_date_code(serial)

  if (!date) {
    return ''
  }

  return formatIsoFromParts(date.y, date.m, date.d)
}

function handleDatePick(value) {
  dateFilterISO.value = value || ''
  dateFilterText.value = value ? formatDisplayDate(value) : ''
}

function clearDateFilter() {
  dateFilterISO.value = ''
  dateFilterText.value = ''
}

function clearAdvancedFilters() {
  advancedFilter.pep = ''
  advancedFilter.encarregado = ''
  advancedFilter.status = ''
  advancedFilter.local = ''
  advancedFilter.siInc = ''
}

function matchesAdvancedFilters(row) {
  const pepMatch = !advancedFilter.pep || row.pep === advancedFilter.pep
  const encarregadoMatch =
    !advancedFilter.encarregado || row.encarregado === advancedFilter.encarregado
  const statusMatch = !advancedFilter.status || row.status === advancedFilter.status
  const localMatch = !advancedFilter.local || row.local === advancedFilter.local
  const siIncMatch = !advancedFilter.siInc || row.siInc === advancedFilter.siInc

  return pepMatch && encarregadoMatch && statusMatch && localMatch && siIncMatch
}

function uniqueValues(field) {
  return [...new Set(obras.value.map((row) => row[field]).filter(Boolean))].sort()
}

function statusColor(status = '') {
  const normalized = status.toString().trim().toLowerCase()

  if (normalized.includes('reprogram')) {
    return 'negative'
  }

  if (normalized.includes('andamento')) {
    return 'warning'
  }

  if (normalized.includes('programada')) {
    return 'grey-7'
  }

  if (isConcludedStatus(status)) {
    return 'positive'
  }

  return 'primary'
}

function openEnviarDialog(row) {
  enviarDialogRow.value = row
  enviarDate.value = row.lastSendIso || new Date().toISOString().split('T')[0]
  enviarDialog.value = true
}

function closeEnviarDialog() {
  enviarDialog.value = false
  enviarDialogRow.value = null
  enviarDate.value = ''
}

function confirmEnviar() {
  if (!enviarDialogRow.value) {
    return
  }

  const normalizedDate = toIsoDateString(enviarDate.value)

  if (!normalizedDate) {
    $q.notify({
      type: 'warning',
      color: 'warning',
      textColor: 'black',
      icon: 'warning',
      position: 'top-right',
      message: 'Selecione uma data válida antes de registrar.',
    })
    return
  }

  isRegistering.value = true

  try {
    registerSend(enviarDialogRow.value, normalizedDate)
    $q.notify({
      type: 'positive',
      color: 'positive',
      textColor: 'white',
      icon: 'check_circle',
      position: 'top-right',
      message: 'Enviado com sucesso',
    })
    closeEnviarDialog()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      color: 'negative',
      textColor: 'white',
      icon: 'report_problem',
      position: 'top-right',
      message: 'Não foi possível registrar o envio. Tente novamente.',
    })
  } finally {
    isRegistering.value = false
  }
}

function registerSend(row, normalizedIso) {
  row.lastSendIso = normalizedIso
  row.lastSendDisplay = formatDisplayDate(normalizedIso)
}

onMounted(() => {
  if (dropboxConfigured.value) {
    loadExcel()
  }
})
</script>

<style scoped>
.obras-page {
  --page-bg: linear-gradient(180deg, rgba(236, 244, 255, 0.8), #f7f8fb 45%, #ffffff 100%);
  --panel-bg: #ffffff;
  --panel-shadow: 0 25px 65px rgba(15, 33, 64, 0.08);
  --hero-title: #1e2a44;
  --hero-muted: #6b778c;
  --summary-text: #0f1f33;
  --hero-outline: rgba(21, 101, 192, 0.15);
  --hero-hover-glow: rgba(21, 101, 192, 0.35);
  --toolbar-divider: rgba(15, 31, 51, 0.05);
  --badge-bg: rgba(25, 118, 210, 0.08);
  --badge-text: #15558c;
  --badge-muted-bg: rgba(15, 31, 51, 0.05);
  --badge-muted-text: #243349;
  --filters-toolbar-bg: rgba(255, 255, 255, 0.78);
  --filters-toolbar-border: rgba(63, 81, 181, 0.08);
  --filters-title: #1f2b46;
  --filters-eyebrow: #6f7d95;
  --filters-chip-bg: rgba(25, 118, 210, 0.18);
  --filters-chip-text: #0b1d33;
  --filter-input-bg: rgba(255, 255, 255, 0.9);
  --filter-input-border: rgba(15, 31, 51, 0.1);
  --advanced-filter-bg: linear-gradient(120deg, rgba(33, 150, 243, 0.06), rgba(255, 255, 255, 0.8));
  --table-head-bg: #f1f5fb;
  --table-row-alt: rgba(15, 31, 51, 0.01);
  --summary-caption: rgba(15, 31, 51, 0.7);
  background: var(--page-bg);
}

:global(.body--dark) .obras-page,
:global(.q-dark) .obras-page {
  --page-bg: linear-gradient(180deg, #0b1120, #111b2f 55%, #0b1120);
  --panel-bg: #121a2c;
  --panel-shadow: 0 25px 65px rgba(0, 0, 0, 0.6);
  --hero-title: #eaf2ff;
  --hero-muted: #9da8c2;
  --summary-text: #f5f8ff;
  --hero-outline: rgba(255, 255, 255, 0.12);
  --hero-hover-glow: rgba(33, 150, 243, 0.4);
  --toolbar-divider: rgba(255, 255, 255, 0.08);
  --badge-bg: rgba(33, 150, 243, 0.2);
  --badge-text: #d0e8ff;
  --badge-muted-bg: rgba(255, 255, 255, 0.08);
  --badge-muted-text: #e0e6f7;
  --filters-toolbar-bg: rgba(10, 16, 32, 0.92);
  --filters-toolbar-border: rgba(255, 255, 255, 0.08);
  --filters-title: #f4f6ff;
  --filters-eyebrow: rgba(231, 238, 255, 0.65);
  --filters-chip-bg: rgba(33, 150, 243, 0.22);
  --filters-chip-text: #f3f7ff;
  --filter-input-bg: rgba(7, 12, 24, 0.85);
  --filter-input-border: rgba(123, 157, 255, 0.15);
  --advanced-filter-bg: linear-gradient(120deg, rgba(20, 68, 138, 0.45), rgba(12, 20, 36, 0.85));
  --table-head-bg: rgba(255, 255, 255, 0.08);
  --table-row-alt: rgba(255, 255, 255, 0.04);
  --summary-caption: rgba(239, 244, 255, 0.85);
}

.hero {
  background: transparent;
  border-radius: 28px;
  padding: 48px 32px;
  border: 1px solid var(--hero-outline);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease,
    border-color 0.35s ease;
  box-shadow: none;
  position: relative;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: inherit;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.08), rgba(21, 101, 192, 0.06));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

:global(.body--dark) .hero::after,
:global(.q-dark) .hero::after {
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.05), rgba(33, 150, 243, 0.07));
}

.hero:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 65px var(--hero-hover-glow);
  border-color: transparent;
}

.hero:hover::after {
  opacity: 1;
}

.hero__eyebrow {
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 6px;
  color: var(--hero-muted);
  font-weight: 600;
  font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
}

.hero__title {
  font-size: clamp(2.5rem, 4vw, 3.4rem);
  font-weight: 700;
  color: var(--hero-title);
  letter-spacing: -0.5px;
  font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
}

.dashboard-panel,
.filters-panel {
  border-radius: 20px;
  border: none;
  box-shadow: 0 25px 65px var(--panel-shadow);
  background: var(--panel-bg);
}

.summary-toolbar {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--toolbar-divider);
}

.summary-toolbar__meta {
  flex-wrap: wrap;
}

.summary-toolbar__badge {
  border-radius: 999px;
  padding: 6px 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  background: var(--badge-bg);
  color: var(--badge-text);
}

.summary-toolbar__badge span {
  margin-left: 4px;
}

.summary-toolbar__badge--muted {
  background: var(--badge-muted-bg);
  color: var(--badge-muted-text);
}

.summary-toolbar__action {
  border-radius: 14px;
  padding: 0 22px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-card {
  border-radius: 18px;
  position: relative;
  color: var(--summary-text);
  overflow: hidden;
  min-height: 160px;
  transform: translateY(0);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.summary-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.65;
  pointer-events: none;
}

.summary-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
}

.summary-card__label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
}

.summary-card__value {
  font-size: 2.5rem;
  font-weight: 700;
}

.summary-card__caption {
  color: var(--summary-caption);
}

.summary-card--primary {
  background: linear-gradient(135deg, #1e88e5, #42a5f5);
  color: #f0f6ff;
}

.summary-card--primary::after {
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.35), transparent 56%);
}

.summary-card--success {
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
  color: #f3fff6;
}

.summary-card--warning {
  background: linear-gradient(135deg, #f9a825, #ffd54f);
  color: #3a2a00;
}

:global(.body--dark) .summary-card--warning {
  color: #3b2400;
}

.summary-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 20px 35px rgba(15, 31, 51, 0.25);
}

:global(.body--dark) .summary-card:hover {
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.65);
}

.filters-panel__toolbar {
  background: var(--filters-toolbar-bg);
  border-radius: 20px;
  margin: 16px;
  padding: 24px;
  box-shadow: inset 0 0 0 1px var(--filters-toolbar-border);
  position: relative;
  overflow: hidden;
}

.filters-panel__toolbar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(63, 81, 181, 0.18), transparent 60%);
  opacity: 0.4;
  pointer-events: none;
}

:global(.body--dark) .filters-panel__toolbar::after,
:global(.q-dark) .filters-panel__toolbar::after {
  background: radial-gradient(circle at top right, rgba(33, 150, 243, 0.25), transparent 60%);
}

.filters-panel__heading,
.filters-panel__controls {
  position: relative;
  z-index: 1;
}

.filters-panel__eyebrow {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 4px;
  color: var(--filters-eyebrow);
  font-weight: 600;
}

.filters-panel__title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--filters-title);
  line-height: 1.2;
}

.filters-panel__chip {
  background: var(--filters-chip-bg) !important;
  color: var(--filters-chip-text) !important;
  font-weight: 600;
  border-radius: 999px;
  padding: 6px 16px;
}

.filter-input :deep(.q-field__control) {
  background: var(--filter-input-bg);
  border: 1px solid var(--filter-input-border);
  border-radius: 16px;
  min-height: 58px;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.filter-input :deep(.q-field__control:hover),
.filter-input :deep(.q-field--focused .q-field__control) {
  border-color: rgba(33, 150, 243, 0.6);
  box-shadow: 0 10px 25px rgba(33, 150, 243, 0.1);
}

.filter-input :deep(.q-field__append) {
  color: rgba(33, 150, 243, 0.8);
}

.enviado-btn {
  text-transform: uppercase;
  font-weight: 600;
  border-radius: 999px;
  padding: 0 18px;
}

.enviado-log {
  color: #8ab4ff;
}

.enviar-dialog {
  width: 360px;
}

:global(.body--dark) .q-date,
:global(.q-dark) .q-date {
  background: #0f192c;
  color: #e8f0ff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

:global(.body--dark) .q-date__calendar-days,
:global(.q-dark) .q-date__calendar-days {
  background: transparent;
}

:global(.body--dark) .q-date__navigation,
:global(.q-dark) .q-date__navigation {
  background: rgba(255, 255, 255, 0.05);
}

.mode-toggle-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mode-toggle-label {
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 2px;
  color: var(--filters-eyebrow);
}

.mode-switch {
  position: relative;
  border-radius: 999px;
  padding: 6px;
  background: rgba(15, 31, 51, 0.25);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.mode-switch__option {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 12px 0;
  cursor: pointer;
  transition: color 0.25s ease;
  font-family: inherit;
}

.mode-switch__option--active {
  color: #0b1d33;
}

.mode-switch__slider {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #64b5f6, #1e88e5);
  box-shadow: 0 12px 35px rgba(21, 101, 192, 0.4);
  transition:
    transform 0.35s ease,
    width 0.35s ease;
}

:global(.body--dark) .mode-switch {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.advanced-filter :deep(.q-item) {
  background: transparent;
}

.advanced-filter :deep(.q-expansion-item__content) {
  background: var(--advanced-filter-bg);
}

.obras-table :deep(thead tr) {
  background: var(--table-head-bg);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.obras-table :deep(tbody tr:nth-child(odd)) {
  background: var(--table-row-alt);
}

.obras-table :deep(.q-chip) {
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .hero {
    padding: 20px;
  }

  .summary-card {
    min-height: 140px;
  }
}
</style>
