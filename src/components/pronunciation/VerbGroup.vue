<template>
  <div class="card">
    <h2 class="text-2xl font-bold text-primary mb-6">{{ title }}</h2>
    
    <div class="space-y-4">
      <div 
        v-for="verb in verbs" 
        :key="verb.id"
        class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/75 transition-colors"
      >
        <div class="space-y-1">
          <div class="text-lg text-green-500">
            {{ verb.fr }}
            <button 
              v-if="verb.audio_fr"
              @click="$emit('play-audio', verb.audio_fr)"
              class="btn btn-sm ml-2"
              title="Écouter en français"
            >
              🔊
            </button>
          </div>
          <div class="text-lg text-red-500">
            {{ verb.es }}
            <button 
              v-if="verb.audio_es"
              @click="$emit('play-audio', verb.audio_es)"
              class="btn btn-sm ml-2"
              title="Écouter en espagnol"
            >
              🔊
            </button>
          </div>
        </div>

        <!-- Boutons d'administration -->
        <div v-if="isAdmin" class="flex gap-2">
          <button 
            @click="$emit('edit', verb)"
            class="btn btn-sm"
            title="Modifier"
          >
            ✏️
          </button>
          <button 
            @click="$emit('delete', verb.id)"
            class="btn btn-sm text-red-500"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  verbs: {
    type: Array,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['play-audio', 'edit', 'delete'])
</script> 