<template>
  <q-page class="mesa-pendencias-page q-pa-xl column q-gutter-lg">
    <section class="hero">
      <div class="hero__eyebrow">Painel operacional</div>
      <div class="hero__title">Mesa de Pendências</div>
    </section>
    <q-card flat bordered class="full-width dashboard-panel q-mt-lg">
      <q-card-section>
        <div class="text-h6">Lista de Pendências</div>
        <q-table flat bordered :rows="rows" :columns="columns" row-key="pep" class="q-mt-md">
          <template v-slot:body-cell-pep="props">
            <q-td :props="props">
              <q-input v-model="props.row.pep" dense borderless />
            </q-td>
          </template>
          <template v-slot:body-cell-local="props">
            <q-td :props="props">
              <q-input v-model="props.row.local" dense borderless />
            </q-td>
          </template>
          <template v-slot:body-cell-observacao="props">
            <q-td :props="props">
              <q-input v-model="props.row.observacao" dense borderless />
            </q-td>
          </template>
          <template v-slot:body-cell-acessar="props">
            <q-td :props="props">
              <q-input
                v-model="props.row.acessar"
                dense
                borderless
                placeholder="Cole o link aqui"
              />
              <div v-if="props.row.acessar" class="q-mt-xs">
                <a
                  :href="props.row.acessar"
                  target="_blank"
                  style="color: #1976d2; text-decoration: underline"
                >
                  Abrir localização
                </a>
              </div>
            </q-td>
          </template>
        </q-table>
        <div class="q-mt-md">
          <q-btn color="primary" label="Salvar Alterações" @click="salvarPendencias" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PendenciasDB } from 'src/services/pendenciasDB'

const columns = [
  { name: 'pep', label: 'PEP', align: 'left', field: 'pep' },
  { name: 'local', label: 'Local', align: 'left', field: 'local' },
  { name: 'observacao', label: 'Observação', align: 'left', field: 'observacao' },
  { name: 'acessar', label: 'Acessar', align: 'left', field: 'acessar' },
]

const rows = ref([
  { pep: '1001', local: 'Sala 1', observacao: 'Falta material', acessar: '' },
  { pep: '1002', local: 'Sala 2', observacao: 'Aguardando aprovação', acessar: '' },
  { pep: '1003', local: 'Sala 3', observacao: 'Concluído', acessar: '' },
])

onMounted(async () => {
  const pendenciasSalvas = await PendenciasDB.carregarPendencias()
  if (pendenciasSalvas && pendenciasSalvas.length > 0) {
    rows.value = pendenciasSalvas
  }
})

async function salvarPendencias() {
  await PendenciasDB.salvarPendencias(rows.value)
}
</script>

<style scoped>
.mesa-pendencias-page {
  background: var(--page-bg, #f7f8fb);
}
</style>
