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
            <span class="text-lg">🔊</span>
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
            class="p-3 rounded-full bg-gray-600/50 hover:bg-gray-500/50 transition-all duration-300 hover:scale-110"
            :disabled="isPlaying"
          >
            <span class="text-lg">🔊</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  }
})

defineEmits(['like', 'save'])

const isPlaying = ref(false)

function formatDate(date, locale = 'fr') {
  return new Date(date).toLocaleDateString(`${locale}-${locale.toUpperCase()}`, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function playAudio(lang) {
  if (isPlaying.value) return

  const audioPath = props.word[`audio_${lang}`]
  if (!audioPath) return

  isPlaying.value = true
  const audio = new Audio(audioPath)
  
  audio.addEventListener('ended', () => {
    isPlaying.value = false
  })

  audio.play().catch(error => {
    console.error('Erreur lors de la lecture audio:', error)
    isPlaying.value = false
  })
}
</script>