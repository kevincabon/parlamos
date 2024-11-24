<template>
  <div class="transform transition-all duration-300 hover:scale-[1.01]">
    <div class="card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-primary/40 shadow-xl hover:shadow-primary/20 transition-all duration-300 p-8">
      <!-- Mot principal avec animation -->
      <div class="text-center space-y-6">
        <div class="space-y-4 transform transition-all duration-300">
          <span 
            class="text-sm font-medium px-4 py-1 rounded-full"
            :class="currentLanguage === 'fr' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'"
          >
            {{ currentLanguage === 'fr' ? 'Français' : 'Español' }}
          </span>
          <div class="text-5xl font-bold mt-4">
            <span :class="currentLanguage === 'fr' ? 'text-green-400' : 'text-red-400'">
              {{ currentLanguage === 'fr' ? word.fr : word.es }}
            </span>
          </div>
        </div>
        
        <button 
          v-if="word.audio?.[currentLanguage]"
          @click="$emit('play-audio', word.audio[currentLanguage])"
          class="p-3 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-white transition-all duration-300 hover:scale-110"
          title="Écouter la prononciation"
        >
          <span class="text-lg text-white">🔊</span>
        </button>
      </div>

      <!-- Séparateur -->
      <div class="my-8 border-t border-gray-700/50"></div>

      <!-- Traduction -->
      <div class="text-center space-y-6">
        <button 
          v-if="!showTranslation"
          @click="$emit('toggle-translation')"
          class="group relative px-8 py-3 rounded-full overflow-hidden bg-gradient-to-r from-primary/40 to-secondary/40 hover:from-primary/50 hover:to-secondary/50 border border-primary/40 hover:border-primary/60 transition-all duration-500"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span class="relative text-white font-medium tracking-wide">Voir la traduction</span>
        </button>
        
        <div v-else class="space-y-6">
          <div class="space-y-4">
            <span 
              class="text-sm font-medium"
              :class="currentLanguage === 'fr' ? 'text-red-400' : 'text-green-400'"
            >
              {{ currentLanguage === 'fr' ? 'Español' : 'Français' }}
            </span>
            <div class="text-3xl">
              <span :class="currentLanguage === 'fr' ? 'text-red-400' : 'text-green-400'">
                {{ currentLanguage === 'fr' ? word.es : word.fr }}
              </span>
            </div>
          </div>
          
          <button 
            v-if="word.audio?.[currentLanguage === 'fr' ? 'es' : 'fr']"
            @click="$emit('play-audio', word.audio[currentLanguage === 'fr' ? 'es' : 'fr'])"
            class="p-3 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-300 hover:scale-110"
            title="Écouter la prononciation"
          >
            <span class="text-lg">🔊</span>
          </button>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="my-8 border-t border-gray-700/50"></div>

      <!-- Bouton suivant -->
      <button 
        @click="$emit('next-word')"
        class="w-full group relative px-8 py-3 rounded-full overflow-hidden bg-gradient-to-r from-primary/40 to-secondary/40 hover:from-primary/50 hover:to-secondary/50 border border-primary/40 hover:border-primary/60 transition-all duration-500"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <span class="relative flex items-center justify-center gap-2 text-white font-medium tracking-wide">
          Mot suivant
          <svg 
            class="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import AudioUploader from './AudioUploader.vue'

defineProps({
  word: {
    type: Object,
    required: true
  },
  showTranslation: {
    type: Boolean,
    default: false
  },
  currentLanguage: {
    type: String,
    required: true
  }
})

defineEmits(['play-audio', 'toggle-translation', 'next-word', 'audio-upload'])
</script> 