<template>
  <div class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
    <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-primary">Modifier le texte</h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Informations générales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                Titre en français
              </label>
              <input 
                v-model="formData.title_fr"
                type="text"
                class="input w-full"
                placeholder="Titre en français (optionnel)"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                Título en español
              </label>
              <input 
                v-model="formData.title_es"
                type="text"
                class="input w-full"
                placeholder="Titre en espagnol (optionnel)"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                Auteur
              </label>
              <input 
                v-model="formData.author"
                type="text"
                class="input w-full"
                placeholder="Nom de l'auteur (optionnel)"
              />
            </div>
          </div>

          <!-- Source -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Source
            </label>
            <input 
              v-model="formData.source"
              type="text"
              class="input w-full"
              placeholder="Source du texte (optionnel)"
            />
          </div>

          <!-- Niveau -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Niveau
            </label>
            <select 
              v-model="formData.level"
              class="input w-full"
            >
              <option value="">Sélectionner un niveau (optionnel)</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>

          <!-- Texte français -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Texte en français
            </label>
            <textarea 
              v-model="formData.fr"
              required
              rows="4"
              class="input w-full"
              placeholder="Entrez le texte en français..."
            ></textarea>
          </div>

          <!-- Texte espagnol -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Texte en espagnol
            </label>
            <textarea 
              v-model="formData.es"
              required
              rows="4"
              class="input w-full"
              placeholder="Entrez le texte en espagnol..."
            ></textarea>
          </div>

          <!-- Fichiers audio -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                Audio frais
              </label>
              <div class="flex items-center space-x-2">
                <input 
                  type="file"
                  accept="audio/*"
                  @change="handleAudioUpload('fr', $event)"
                  class="input flex-grow"
                />
                <button 
                  v-if="formData.audio_fr"
                  type="button"
                  @click="playAudio('fr')"
                  class="btn bg-gray-700 hover:bg-gray-600"
                >
                  🔊
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                Audio espagnol
              </label>
              <div class="flex items-center space-x-2">
                <input 
                  type="file"
                  accept="audio/*"
                  @change="handleAudioUpload('es', $event)"
                  class="input flex-grow"
                />
                <button 
                  v-if="formData.audio_es"
                  type="button"
                  @click="playAudio('es')"
                  class="btn bg-gray-700 hover:bg-gray-600"
                >
                  🔊
                </button>
              </div>
            </div>
          </div>

          <!-- Statut de publication -->
          <div class="flex items-center space-x-2">
            <input 
              type="checkbox"
              id="is_published"
              v-model="formData.is_published"
              class="rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary"
            />
            <label for="is_published" class="text-sm font-medium text-gray-300">
              Publié
            </label>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end gap-4">
            <button 
              type="button"
              @click="$emit('close')"
              class="btn bg-gray-700 hover:bg-gray-600"
            >
              Annuler
            </button>
            <button 
              type="submit"
              class="btn btn-primary"
              :disabled="loading || !isFormValid"
            >
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>

        <div v-if="error" class="text-red-500 text-center mt-4">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

const props = defineProps({
  text: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update'])

const loading = ref(false)
const error = ref('')
const formData = ref({
  title_fr: props.text.title_fr || '',
  title_es: props.text.title_es || '',
  author: props.text.author || '',
  source: props.text.source || '',
  level: props.text.level || '',
  fr: props.text.fr || '',
  es: props.text.es || '',
  audio_fr: props.text.audio_fr || '',
  audio_es: props.text.audio_es || '',
  is_published: props.text.is_published
})

const isFormValid = computed(() => {
  return formData.value.fr.trim() && formData.value.es.trim()
})

async function handleSubmit() {
  try {
    loading.value = true
    error.value = ''

    const updateData = {
      title_fr: formData.value.title_fr || null,
      title_es: formData.value.title_es || null,
      author: formData.value.author || null,
      source: formData.value.source || null,
      level: formData.value.level || null,
      fr: formData.value.fr,
      es: formData.value.es,
      is_published: formData.value.is_published
    }

    const { data, error: updateError } = await supabase
      .from('reading_texts')
      .update(updateData)
      .match({ id: props.text.id })
      .select()

    if (updateError) throw updateError

    if (!data || data.length === 0) {
      throw new Error('Erreur lors de la mise à jour du texte')
    }

    emit('update', data[0])
    emit('close')

    notification.value = {
      show: true,
      type: 'success',
      title: 'Texte mis à jour',
      message: 'Le texte a été modifié avec succès'
    }
  } catch (err) {
    error.value = 'Une erreur est survenue lors de la mise à jour'
  } finally {
    loading.value = false
  }
}

function handleAudioUpload(lang, event) {
  // TODO: Implémenter l'upload des fichiers audio
  console.log(`Upload audio ${lang}:`, event.target.files[0])
}

function playAudio(lang) {
  const audio = new Audio(formData.value[`audio_${lang}`])
  audio.play()
}
</script> 