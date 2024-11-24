<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div class="text-center space-y-6">
      <!-- Icône de construction -->
      <div class="text-6xl mb-4">🚧</div>
      
      <h1 class="text-4xl font-bold text-gradient">
        En cours de développement
      </h1>
      
      <p class="text-xl text-gray-400 max-w-2xl">
        Cette fonctionnalité est actuellement en cours de développement. 
        Elle permettra bientôt de pratiquer l'orthographe en français et en espagnol.
      </p>

      <!-- Aperçu des fonctionnalités à venir -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div class="card p-4">
          <h3 class="text-lg font-semibold text-primary mb-2">
            Dictée Audio
          </h3>
          <p class="text-gray-400">
            Écoutez et écrivez les mots pour améliorer votre orthographe
          </p>
        </div>

        <div class="card p-4">
          <h3 class="text-lg font-semibold text-primary mb-2">
            Correction instantanée
          </h3>
          <p class="text-gray-400">
            Recevez un feedback immédiat sur vos réponses
          </p>
        </div>
      </div>

      <!-- Bouton de retour -->
      <div class="mt-8">
        <router-link 
          to="/" 
          class="btn btn-primary"
        >
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-gradient {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary;
}

.card {
  @apply bg-gray-800/50 rounded-lg transition-transform hover:scale-105 duration-300;
}

.text-primary {
  @apply text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary;
}
</style> 