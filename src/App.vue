<template>
  <div class="min-h-screen flex flex-col bg-gray-900">
    <Navbar />
    
    <main class="flex-grow mt-4">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/layout/NavBar.vue'
import Footer from '@/components/layout/Footer.vue'
</script> 