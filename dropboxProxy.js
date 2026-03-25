// dropboxProxy.js
// Backend simples para servir arquivos do Dropbox via token seguro

import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const DEFAULT_PORT = process.env.DROPBOX_PROXY_PORT || process.env.PORT || 3333
let PORT = DEFAULT_PORT
const DROPBOX_TOKEN = process.env.VITE_DROPBOX_TOKEN

app.get('/dropbox/download', async (req, res) => {
  const filePath = req.query.path
  if (!filePath) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DROPBOX_TOKEN}`,
        'Dropbox-API-Arg': JSON.stringify({ path: filePath }),
      },
    })

    if (!response.ok) {
      return res.status(500).json({ error: 'Dropbox download failed' })
    }

    res.setHeader('Content-Disposition', 'attachment; filename="' + filePath.split('/').pop() + '"')
    response.body.pipe(res)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function startServer(port) {
  app
    .listen(port, () => {
      console.log(`Dropbox proxy server running on port ${port}`)
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && port === Number(DEFAULT_PORT)) {
        // Porta padrão ocupada, tenta próxima porta
        PORT = Number(DEFAULT_PORT) + 1
        console.log(`Porta ${DEFAULT_PORT} ocupada. Tentando porta ${PORT}...`)
        startServer(PORT)
      } else {
        console.error('Erro ao iniciar o servidor:', err)
        process.exit(1)
      }
    })
}
startServer(PORT)
