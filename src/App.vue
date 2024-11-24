<template>
  <div class="min-h-screen flex flex-col bg-gray-900">
    <Navbar />
    
    <main class="flex-grow mt-4">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component 
            :is="Component" 
            :key="$route.fullPath"
          />
        </keep-alive>
      </router-view>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import Navbar from '@/components/layout/NavBar.vue'
import Footer from '@/components/layout/Footer.vue'

// Gérer les timeouts et intervalles
let timeouts = []
let intervals = []

// Fonction pour nettoyer les timeouts et intervalles
function cleanup() {
  timeouts.forEach(timeout => clearTimeout(timeout))
  intervals.forEach(interval => clearInterval(interval))
  timeouts = []
  intervals = []
}

onMounted(() => {
  // Intercepter les setTimeout et setInterval
  const originalSetTimeout = window.setTimeout
  const originalSetInterval = window.setInterval

  window.setTimeout = (...args) => {
    const id = originalSetTimeout(...args)
    timeouts.push(id)
    return id
  }

  window.setInterval = (...args) => {
    const id = originalSetInterval(...args)
    intervals.push(id)
    return id
  }
})

onBeforeUnmount(() => {
  cleanup()
})
</script> 