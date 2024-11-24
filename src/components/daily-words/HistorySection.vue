<template>
  <section class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Historique
      </h2>
      
      <!-- Barre de recherche -->
      <div class="flex gap-4 max-w-md flex-grow justify-end">
        <div class="relative flex-grow max-w-sm">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Rechercher..." 
            class="w-full px-4 py-2 rounded-full bg-gray-600/80 border border-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 text-gray-100 placeholder-gray-400 transition-all duration-300 pl-10"
          >
          <svg 
            class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Grille de contenu -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Section Mots -->
      <div v-if="filteredWords.length" class="space-y-6">
        <h3 class="text-xl font-semibold text-primary">Mots précédents</h3>
        <div class="space-y-4">
          <div 
            v-for="word in filteredWords" 
            :key="word.id"
            class="p-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 transition-all duration-300"
          >
            <div class="flex justify-between items-start mb-2">
              <p class="text-sm text-gray-400">{{ formatDate(word.date) }}</p>
              <div class="flex items-center space-x-2 text-sm text-gray-400">
                <span>{{ word.likes }} ❤️</span>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-lg text-green-400">{{ word.fr }}</p>
              <p class="text-lg text-red-400">{{ word.es }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Citations -->
      <div v-if="filteredQuotes.length" class="space-y-6">
        <h3 class="text-xl font-semibold text-primary">Citations précédentes</h3>
        <div class="space-y-4">
          <div 
            v-for="quote in filteredQuotes" 
            :key="quote.id"
            class="p-4 rounded-lg bg-gray-800/40 hover:bg-gray-700/40 transition-all duration-300"
          >
            <div class="flex justify-between items-start mb-2">
              <p class="text-sm text-gray-400">{{ formatDate(quote.date) }}</p>
              <div class="flex items-center space-x-2 text-sm text-gray-400">
                <span>{{ quote.likes }} ❤️</span>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-lg italic text-green-400">« {{ quote.fr }} »</p>
              <p class="text-lg italic text-red-400">« {{ quote.es }} »</p>
              <p class="text-sm text-gray-400 mt-2">— {{ quote.author }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton Charger plus -->
    <div v-if="hasMore" class="flex justify-center mt-8">
      <button 
        @click="$emit('load-more')"
        class="group px-6 py-2.5 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-white transition-all duration-300"
        :disabled="loading"
      >
        <span v-if="loading" class="flex items-center space-x-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Chargement...</span>
        </span>
        <span v-else class="flex items-center space-x-2">
          <span>Voir plus</span>
          <svg 
            class="w-4 h-4 transform group-hover:translate-y-1 transition-transform"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  words: {
    type: Array,
    default: () => []
  },
  quotes: {
    type: Array,
    default: () => []
  },
  hasMore: Boolean,
  loading: Boolean
})

defineEmits(['load-more'])

const searchQuery = ref('')

const filteredWords = computed(() => {
  if (!searchQuery.value) return props.words
  const query = searchQuery.value.toLowerCase()
  return props.words.filter(word => 
    word.fr.toLowerCase().includes(query) || 
    word.es.toLowerCase().includes(query)
  )
})

const filteredQuotes = computed(() => {
  if (!searchQuery.value) return props.quotes
  const query = searchQuery.value.toLowerCase()
  return props.quotes.filter(quote => 
    quote.fr.toLowerCase().includes(query) || 
    quote.es.toLowerCase().includes(query) ||
    quote.author.toLowerCase().includes(query)
  )
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}
</script> 