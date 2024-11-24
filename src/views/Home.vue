<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Hero section -->
    <header class="text-center py-16 space-y-6">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
        Bienvenue sur Parlamos
      </h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto">
        Votre plateforme d'apprentissage bilingue français-espagnol interactive
      </p>
    </header>

    <!-- Cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
      <!-- Card Mots du jour -->
      <router-link 
        to="/mots-du-jour" 
        class="card backdrop-blur-sm bg-gray-800/40 hover:bg-gray-800/60 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
      >
        <div class="p-6 space-y-4">
          <h2 class="text-2xl font-bold text-primary">Mots du Jour</h2>
          <p class="text-gray-300">Découvrez chaque jour de nouveaux mots en français et en espagnol.</p>
        </div>
      </router-link>

      <!-- Card Révisions -->
      <router-link 
        to="/revisions" 
        class="card backdrop-blur-sm bg-gray-800/40 hover:bg-gray-800/60 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300"
      >
        <div class="p-6 space-y-4">
          <h2 class="text-2xl font-bold text-secondary">Révisions</h2>
          <p class="text-gray-300">Révisez votre vocabulaire avec des cartes de révision interactives.</p>
        </div>
      </router-link>

      <!-- Card Prononciation -->
      <router-link 
        to="/prononciation" 
        class="card backdrop-blur-sm bg-gray-800/40 hover:bg-gray-800/60 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
      >
        <div class="p-6 space-y-4">
          <h2 class="text-2xl font-bold text-purple-500">Prononciation</h2>
          <p class="text-gray-300">Améliorez votre prononciation avec des exercices audio.</p>
        </div>
      </router-link>
    </div>

    <!-- Features section -->
    <section class="py-16 space-y-12">
      <h2 class="text-3xl font-bold text-center text-white">Fonctionnalités</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature cards -->
        <div class="p-6 rounded-lg bg-gray-800/40 space-y-3">
          <h3 class="text-xl font-semibold text-primary">Apprentissage quotidien</h3>
          <p class="text-gray-300">Du nouveau contenu chaque jour pour progresser régulièrement.</p>
        </div>

        <div class="p-6 rounded-lg bg-gray-800/40 space-y-3">
          <h3 class="text-xl font-semibold text-secondary">Système de révision</h3>
          <p class="text-gray-300">Révisez efficacement avec notre système de cartes.</p>
        </div>

        <div class="p-6 rounded-lg bg-gray-800/40 space-y-3">
          <h3 class="text-xl font-semibold text-purple-500">Audio intégré</h3>
          <p class="text-gray-300">Écoutez la prononciation native des mots et expressions.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Logique du composant si nécessaire
</script> 