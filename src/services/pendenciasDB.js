// Serviço para persistência local (IndexedDB) e estrutura para integração futura com PostgreSQL
// Requer instalação de localforage: npm install localforage
import localforage from 'localforage'

const STORAGE_KEY = 'mesa_pendencias'

export const PendenciasDB = {
  async salvarPendencias(pendencias) {
    await localforage.setItem(STORAGE_KEY, pendencias)
  },
  async carregarPendencias() {
    return (await localforage.getItem(STORAGE_KEY)) || []
  },
  async limparPendencias() {
    await localforage.removeItem(STORAGE_KEY)
  },
}

// Estrutura para integração futura com PostgreSQL via API REST
export const PendenciasAPI = {
  // eslint-disable-next-line no-unused-vars
  async salvarPendenciasNoPostgres(_pendencias) {
    // Exemplo: await fetch('/api/pendencias', { method: 'POST', body: JSON.stringify(pendencias) })
    // Implemente a chamada real conforme seu backend
    throw new Error('Integração com PostgreSQL não implementada')
  },
  async carregarPendenciasDoPostgres() {
    // Exemplo: await fetch('/api/pendencias').then(res => res.json())
    throw new Error('Integração com PostgreSQL não implementada')
  },
}
