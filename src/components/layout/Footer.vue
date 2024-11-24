<template>
  <footer class="mt-16 py-8 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center space-y-4">
        <!-- Logo et copyright -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span class="text-sm font-bold text-white">P</span>
          </div>
          <span class="text-lg font-bold text-white">Parlamos</span>
        </div>

        <!-- Version de développement -->
        <div class="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <span class="text-sm font-medium text-yellow-500">Version de développement - Beta 1.0</span>
        </div>

        <!-- Copyright et liens -->
        <div class="flex flex-col items-center space-y-2">
          <span class="text-sm text-gray-400">
            © {{ new Date().getFullYear() }} Parlamos - Tous droits réservés
          </span>
          <div class="flex space-x-4">
            <button 
              @click="showContactModal = true"
              class="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            >
              Contact
            </button>
            <router-link 
              to="/roadmap"
              class="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            >
              Futures mises à jour
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de contact -->
    <ContactModal 
      v-if="showContactModal"
      @close="showContactModal = false"
    />
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import ContactModal from '@/components/common/ContactModal.vue'

const showContactModal = ref(false)
</script>

<style scoped>
.text-gradient {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary;
}
</style> 