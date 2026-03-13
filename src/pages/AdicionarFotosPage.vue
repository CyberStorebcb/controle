<template>
  <q-page class="adicionar-fotos-page q-pa-xl column q-gutter-lg">
    <section>
      <div class="text-h5">Adicionar Fotos com Descritivo</div>
      <q-uploader
        url=""
        label="Selecione ou arraste as fotos"
        multiple
        :auto-upload="false"
        @added="onFilesAdded"
        accept="image/*"
        class="q-mt-md"
      />
      <div v-for="foto in fotos" :key="foto.id" class="q-mt-lg q-pa-md bg-grey-9 rounded-borders">
        <div class="row items-center q-gutter-md">
          <q-img :src="foto.url" style="width: 120px; height: 120px" :ratio="1" />
          <div class="col">
            <q-input
              v-model="foto.descricao"
              label="Descritivo da foto (inclua data/hora se desejar)"
              filled
              type="textarea"
              autogrow
            />
          </div>
        </div>
      </div>
      <q-btn color="primary" label="Salvar Fotos" class="q-mt-xl" @click="salvarFotos" />
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const fotos = ref([])

function onFilesAdded(files) {
  Array.from(files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      fotos.value.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        descricao: '',
      })
    }
    reader.readAsDataURL(file)
  })
}

async function salvarFotos() {
  for (const foto of fotos.value) {
    const img = new window.Image()
    img.src = foto.url
    await new Promise((resolve) => {
      img.onload = resolve
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    // Texto multi-linha, alinhado à direita, fonte branca
    const linhas = []
    // Todas as linhas: descritivo (quebra por \n)
    if (foto.descricao) {
      const descLinhas = foto.descricao
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      linhas.push(...descLinhas)
    }

    ctx.font = '28px Arial'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = '#fff'
    const padding = 32
    const lineHeight = 38
    // Desenhar de baixo para cima
    for (let i = 0; i < linhas.length; i++) {
      ctx.fillText(
        linhas[linhas.length - 1 - i],
        canvas.width - padding,
        canvas.height - padding - i * lineHeight,
      )
    }

    // Baixar imagem
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/jpeg')
    link.download = (foto.descricao ? foto.descricao.replace(/\s+/g, '_') : 'foto') + '.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.bg-grey-9 {
  background: #23272b;
}
.rounded-borders {
  border-radius: 8px;
}
</style>
