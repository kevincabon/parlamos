<template>
  <div class="card backdrop-blur-sm bg-gray-800/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
    <div class="p-8 space-y-6">
      <!-- En-tête avec titre et boutons -->
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <h2 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mot du Jour
          </h2>
          <div class="space-y-0.5">
            <p class="text-sm text-gray-400 font-medium">{{ formatDate(word.date, 'fr') }}</p>
            <p class="text-sm text-gray-400/80 font-medium">{{ formatDate(word.date, 'es') }}</p>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="$emit('like')"
            class="group flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-white transition-all duration-300"
            :class="{ 'text-red-400 border-red-500/50': word.liked }"
          >
            <span class="transform transition-all duration-300" 
                  :class="{ 'scale-125 rotate-12': word.liked }">
              {{ word.liked ? '❤️' : '🤍' }}
            </span>
            <span class="text-sm font-medium">{{ word.likes }}</span>
          </button>
          
          <button 
            @click="$emit('save')"
            class="px-4 py-2 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-white transition-all duration-300"
          >
            <span class="text-yellow-400">{{ word.saved ? '★' : '☆' }}</span>
          </button>
        </div>
      </div>

      <!-- Contenu du mot -->
      <div class="space-y-6">
        <!-- Version française -->
        <div class="flex justify-between items-center p-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 transition-all duration-300">
          <div class="space-y-2">
            <span class="text-sm font-medium text-primary">Français</span>
            <p class="text-2xl font-semibold text-green-400">{{ word.fr }}</p>
          </div>
          <button 
            v-if="word.audio_fr"
            @click="playAudio('fr')"
            class="p-3 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-gray-100 transition-all duration-300 hover:scale-110"
            :disabled="isPlaying"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>

        <!-- Version espagnole -->
        <div class="flex justify-between items-center p-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 transition-all duration-300">
          <div class="space-y-2">
            <span class="text-sm font-medium text-primary">Español</span>
            <p class="text-2xl font-semibold text-red-400">{{ word.es }}</p>
          </div>
          <button 
            v-if="word.audio_es"
            @click="playAudio('es')"
            class="p-3 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-gray-100 transition-all duration-300 hover:scale-110"
            :disabled="isPlaying"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Phrases d'exemple -->
      <div class="space-y-4 mt-6">
        <div class="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-primary">Phrases d'exemple</h3>
            <button 
              v-if="authStore.isAdmin"
              @click="generateExamples"
              class="px-4 py-1.5 rounded-full bg-gray-700/30 hover:bg-gray-700/40 border border-gray-600/30 transition-all duration-300 text-primary/80 hover:text-primary flex items-center space-x-2 text-sm"
              :disabled="generatingExamples"
            >
              <svg v-if="generatingExamples" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else class="text-lg leading-none">✨</span>
              <span>{{ generatingExamples ? 'Génération...' : 'Générer des exemples' }}</span>
            </button>
          </div>
          
          <!-- Exemple en français -->
          <div v-if="word.example_fr" class="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/40 transition-all duration-300">
            <span class="text-sm font-medium text-primary">Français</span>
            <p class="mt-2 text-lg text-green-400/90 italic">{{ word.example_fr }}</p>
          </div>

          <!-- Exemple en espagnol -->
          <div v-if="word.example_es" class="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/40 transition-all duration-300">
            <span class="text-sm font-medium text-primary">Español</span>
            <p class="mt-2 text-lg text-red-400/90 italic">{{ word.example_es }}</p>
          </div>

          <!-- Message si pas d'exemples -->
          <div v-if="!word.example_fr && !word.example_es" class="text-center py-8 text-gray-400">
            <p>Cliquez sur le bouton pour générer des exemples</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const props = defineProps({
  word: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['like', 'save', 'update'])
const isPlaying = ref(false)
const generatingExamples = ref(false)

function formatDate(date, locale = 'fr') {
  return new Date(date).toLocaleDateString(`${locale}-${locale.toUpperCase()}`, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function playAudio(lang) {
  if (isPlaying.value) return
  
  const audioUrl = props.word[`audio_${lang}`]
  if (!audioUrl) return
  
  isPlaying.value = true
  try {
    const audio = new Audio(audioUrl)
    await audio.play()
  } catch (error) {
    console.error('Erreur lors de la lecture audio:', error)
  } finally {
    isPlaying.value = false
  }
}

async function generateExamples() {
  if (!props.word || generatingExamples.value) return
  
  generatingExamples.value = true
  try {
    // Générer d'abord l'exemple en espagnol
    const esResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Genera una frase de ejemplo en español usando la palabra "${props.word.es}".
          La frase debe ser simple, clara y mostrar el uso de la palabra en un contexto cotidiano.
          Devuelve solo la frase, sin comillas ni puntuación adicional.`
        }],
        temperature: 0.7
      })
    })
    
    const esData = await esResponse.json()
    const example_es = esData.choices[0]?.message?.content?.trim()

    if (!example_es) {
      throw new Error('Impossible de générer l\'exemple en espagnol')
    }

    // Traduire la phrase en français
    const frResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Traduis cette phrase en français en t'assurant d'utiliser le mot "${props.word.fr}" :
          "${example_es}"
          
          Retourne uniquement la traduction, sans guillemets ni ponctuation supplémentaire.`
        }],
        temperature: 0.3
      })
    })
    
    const frData = await frResponse.json()
    const example_fr = frData.choices[0]?.message?.content?.trim()

    if (!example_fr) {
      throw new Error('Impossible de traduire l\'exemple en français')
    }

    // Mettre à jour dans la base de données
    const { error: updateError } = await supabase
      .from('daily_words')
      .update({
        example_fr,
        example_es
      })
      .eq('id', props.word.id)

    if (updateError) throw updateError

    // Émettre l'événement de mise à jour
    emit('update', {
      ...props.word,
      example_fr,
      example_es
    })
  } catch (err) {
    console.error('Erreur lors de la génération des exemples:', err)
  } finally {
    generatingExamples.value = false
  }
}
</script>