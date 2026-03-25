// dropboxProxy.js
// Backend simples para servir arquivos do Dropbox via token seguro

import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()

const app = express()
const DEFAULT_PORT = process.env.DROPBOX_PROXY_PORT || process.env.PORT || 3333
let PORT = DEFAULT_PORT
const DROPBOX_TOKEN = "sl.u.AGbdHWW0YL2xL1GT3cMUI45A8iPvqzhYAWcRsvesl-27lWSJrfSR0AdXX61esHPdyjiNp0KMu4L8zt1W3tAKAVuXSsdHATLwZPu7ko2YAfZgY2tWZYtAJEJ0iSH_ovBzDG2SegYhWtneeJXejEuS5D02rL0vk0_3BVegGUCuQGoC9KDxhowUlXPQYSVwNUCv5KqOhIAn6qQbPYXVo0SsLD9MdCRblr06xpj6yB19Fu74coVzZnXsEG4EXoxOmFw1U-qaKnOUKonAkR1wS9K4XjCumAvzslydSWib9TiLjmmilMitgBwQGUcgjcflOL9IJJ5Q9XYp5N7-pVql9QT0s6QYN8R8-AGGN4YvzSUnQWvmgJBwKa6pL4mi3WZ4qzAFvm6mEjZsUyUVuQzLqWKE6iPSIpbdqQogJIjf4cyFa6N9oE9LhEgRes68U5prUn0snFd8LWefrmgBE8axf82LuQRSQBmTkNmw5nCZD4wofkXa3h61Wo1x9sx9I2Kb7cJnfboU3K9kH8W6HyUoYP-jSnetNIfjowecu04jnB9l5UIzHRcDevmU5dWth_dQroqCyqZAi66LfGQu0ov8W7xDRweDtM4ap8od2IqZzdSoBwVqLZLZJFO9Qghk1LYZaH8QpZpvm0Idcxg0vo2mhlMMCayG6sfke-j9SdhiSk2D-fgnU_WPNPN_oPyLid4DSl1II7P0C29vDPvvMS5RIe2Cqvsuwk00with2OUbT9pzPqD6UybVWnmWiCo6nJZSe9ujO8JjDGl5_7UnUW_OUPmJt4WXUpMKehtGjkZwVjMluVAWzKq-aUeb5Ez341CCpSaBhG_mX2mpGQLfBKA3s-mss4MK8nvSIrOM0560-9V4m0g0FoOB_VUXNiO5QFEC3Jp8ljKR165IY4gIQojPiSs9A4G0Qpn8C1IlUmRd0wPx0YfLgL1YfOtZZr_Ly06hth2znAIIeedFiUbLdaZfCWpW1vXYyeEpYwYEhuKm2oRDmuNUP6wdDSbBbLsFZILURT61FrX0Evy9S5HrK_VhRFASBz0zokQBBR4vUGbf1DQSaI-1_YcT83Qsk0LWS6iXUsMcH5SODSqDoEkK02e0ECtwmFMgMBwaIVljhb0Fh8kyDtOCZ06X2mjENfbw_5lEiguK8M6pAEv8ahdgjHWru0bgRnr97nWo3DADCp0VmcrjksTrQfHYDJVHgnbWoBbL8JVnayHesPu85-uwO2xz9Wcq2aXrZ676Rta92o2-A41SDduXT-F850oZTzo9yfPLTulB5D4bwN8bg5LEeg2lRCOwcw-C3-JoI5KSLJLp5i4Jgy2ypQ";

// Habilitar CORS para todas as origens
app.use(cors());

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
