<template>
  <div class="card backdrop-blur-sm bg-gray-800/40 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300">
    <div class="p-8 space-y-6">
      <!-- En-tête -->
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <h2 class="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Citation du Jour
          </h2>
          <div class="space-y-0.5">
            <p class="text-sm text-gray-400 font-medium">{{ formatDate(quote.date, 'fr') }}</p>
            <p class="text-sm text-gray-400/80 font-medium">{{ formatDate(quote.date, 'es') }}</p>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="$emit('like')"
            class="group flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-300"
            :class="{ 'text-red-500': quote.liked }"
          >
            <span class="transform transition-all duration-300" 
                  :class="{ 'scale-125 rotate-12': quote.liked }">
              {{ quote.liked ? '❤️' : '🤍' }}
            </span>
            <span class="text-sm font-medium">{{ quote.likes }}</span>
          </button>
          
          <button 
            @click="$emit('save')"
            class="px-4 py-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-300"
          >
            <span class="text-yellow-400">{{ quote.saved ? '★' : '☆' }}</span>
          </button>
        </div>
      </div>

      <!-- Contenu des citations -->
      <div class="space-y-6">
        <!-- Version française -->
        <div class="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/40 transition-all duration-300">
          <span class="text-sm font-medium text-primary">Français</span>
          <p class="mt-2 text-xl text-green-400 italic">« {{ quote.fr }} »</p>
        </div>

        <!-- Version espagnole -->
        <div class="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/40 transition-all duration-300">
          <span class="text-sm font-medium text-primary">Español</span>
          <p class="mt-2 text-xl text-red-400 italic">« {{ quote.es }} »</p>
        </div>

        <!-- Informations sur l'auteur -->
        <div class="p-4 rounded-lg bg-gradient-to-r from-gray-700/30 to-gray-600/30">
          <div class="font-semibold text-lg text-primary">{{ quote.author }}</div>
          <div class="text-sm text-gray-400 mt-1">
            {{ quote.profession }}
            <span v-if="quote.dates" class="text-gray-500">({{ quote.dates }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  quote: {
    type: Object,
    required: true
  }
})

defineEmits(['like', 'save'])

function formatDate(date, locale = 'fr') {
  return new Date(date).toLocaleDateString(`${locale}-${locale.toUpperCase()}`, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>