<template>
  <div class="audio-uploader">
    <input 
      type="file" 
      accept="audio/*"
      @change="handleFileChange"
      class="hidden"
      ref="fileInput"
    />
    <button 
      @click="$refs.fileInput.click()"
      class="btn btn-secondary text-sm"
    >
      📎 Ajouter un audio {{ language === 'fr' ? 'français' : 'espagnol' }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  wordId: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['upload'])

const handleFileChange = (event) => {
  emit('upload', event, props.wordId, props.language)
  // Réinitialiser l'input pour permettre de sélectionner le même fichier
  event.target.value = ''
}
</script> 