<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
      <h2 class="text-2xl font-bold mb-4">
        {{ word ? 'Modifier le mot' : 'Ajouter un mot' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block mb-2">Français</label>
          <input 
            v-model="formData.fr" 
            type="text" 
            required
            class="input w-full"
          >
        </div>

        <div>
          <label class="block mb-2">Espagnol</label>
          <input 
            v-model="formData.es" 
            type="text" 
            required
            class="input w-full"
          >
        </div>

        <!-- Audio Français -->
        <div class="space-y-2">
          <label class="block mb-2">Audio Français</label>
          <div class="flex items-center gap-4">
            <input 
              type="file" 
              ref="audioFrInput"
              accept="audio/*"
              @change="handleAudioChange('fr', $event)"
              class="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-700 file:text-gray-300
                hover:file:bg-gray-600
                cursor-pointer
              "
            />
            <div v-if="formData.audio_fr" class="flex items-center gap-2">
              <button 
                type="button"
                @click="playAudio(formData.audio_fr)"
                class="text-green-500 hover:text-green-400"
              >
                🔊
              </button>
              <button 
                type="button"
                @click="removeAudio('fr')"
                class="text-red-500 hover:text-red-400"
              >
                ❌
              </button>
            </div>
          </div>
        </div>

        <!-- Audio Espagnol -->
        <div class="space-y-2">
          <label class="block mb-2">Audio Espagnol</label>
          <div class="flex items-center gap-4">
            <input 
              type="file" 
              ref="audioEsInput"
              accept="audio/*"
              @change="handleAudioChange('es', $event)"
              class="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-700 file:text-gray-300
                hover:file:bg-gray-600
                cursor-pointer
              "
            />
            <div v-if="formData.audio_es" class="flex items-center gap-2">
              <button 
                type="button"
                @click="playAudio(formData.audio_es)"
                class="text-green-500 hover:text-green-400"
              >
                🔊
              </button>
              <button 
                type="button"
                @click="removeAudio('es')"
                class="text-red-500 hover:text-red-400"
              >
                ❌
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <button 
            type="button" 
            @click="$emit('close')"
            class="btn bg-gray-700"
          >
            Annuler
          </button>
          <button 
            type="submit"
            class="btn btn-primary"
            :disabled="uploading"
          >
            {{ uploading ? 'Enregistrement...' : (word ? 'Modifier' : 'Ajouter') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

const props = defineProps({
  word: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])
const uploading = ref(false)

const formData = ref({
  fr: '',
  es: '',
  audio_fr: null,
  audio_es: null,
  newAudioFr: null,
  newAudioEs: null
})

async function handleAudioChange(lang, event) {
  const file = event.target.files[0]
  if (!file) return

  formData.value[`newAudio${lang.toUpperCase()}`] = file
}

function playAudio(url) {
  const audio = new Audio(url)
  audio.play()
}

function removeAudio(lang) {
  formData.value[`audio_${lang}`] = null
  formData.value[`newAudio${lang.toUpperCase()}`] = null
}

async function uploadAudio(file, wordId, language) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${wordId}-${language}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('audio-words')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('audio-words')
    .getPublicUrl(fileName)

  return publicUrl
}

async function handleSubmit() {
  try {
    uploading.value = true
    const wordData = {
      fr: formData.value.fr,
      es: formData.value.es,
      audio_fr: formData.value.audio_fr,
      audio_es: formData.value.audio_es
    }

    // Si c'est une modification
    if (props.word) {
      // Gérer les nouveaux fichiers audio
      if (formData.value.newAudioFR) {
        wordData.audio_fr = await uploadAudio(formData.value.newAudioFR, props.word.id, 'fr')
      }
      if (formData.value.newAudioES) {
        wordData.audio_es = await uploadAudio(formData.value.newAudioES, props.word.id, 'es')
      }
    }

    emit('save', wordData)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  if (props.word) {
    formData.value = {
      fr: props.word.fr,
      es: props.word.es,
      audio_fr: props.word.audio_fr,
      audio_es: props.word.audio_es,
      newAudioFR: null,
      newAudioES: null
    }
  }
})
</script> 