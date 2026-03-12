<template>
  <q-page class="q-pa-xl column q-gutter-md">
    <section>
      <div class="text-h4 text-primary">EME</div>
      <div class="text-subtitle2 text-grey-7">
        Acompanhe o que foi distribuido para as equipes EME e o que ainda falta enviar.
      </div>
    </section>

    <q-card flat bordered>
      <q-card-section class="text-body1">
        Esta area vai receber o resumo dos pacotes recebidos do Dropbox assim que a integracao estiver ativa.
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-btn color="primary" label="Atualizar status" flat dense icon="refresh" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
// Pagina placeholder ate que o consumo real do Dropbox seja implementado.
</script>
