<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <h1 class="text-4xl font-bold text-gradient text-center mb-12">
      Futures mises à jour
    </h1>

    <div class="space-y-16">
      <!-- Prochaine mise à jour -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-primary">Prochainement (v1.1)</h2>
        <div class="grid gap-6">
          <div class="card p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Exercices d'orthographe</h3>
            <p class="text-gray-300">
              Nouveaux exercices pour pratiquer l'orthographe avec dictée audio et correction instantanée.
            </p>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-400">En développement</span>
            </div>
          </div>

          <div class="card p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Phrase du jour</h3>
            <p class="text-gray-300">
              Une phrase quotidienne en plus des mots et citations pour enrichir votre apprentissage.
            </p>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-400">En développement</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Futures fonctionnalités -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-secondary">À venir (v1.2)</h2>
        <div class="grid gap-6">
          <div class="card p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Système de progression avancé</h3>
            <p class="text-gray-300">
              Suivi détaillé de votre progression avec des statistiques personnalisées, des badges de réussite, 
              et un système de niveaux par catégorie (orthographe, lecture, prononciation). 
              Débloquez des récompenses exclusives en atteignant certains objectifs.
            </p>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400">Planifié</span>
            </div>
          </div>

          <div class="card p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Version espagnole</h3>
            <p class="text-gray-300">
              Interface complète en espagnol incluant tous les exercices, le contenu audio, 
              et les corrections. Adaptation culturelle des exemples et possibilité de basculer 
              facilement entre les langues.
            </p>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400">Planifié</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Fonctionnalités futures -->
      <section class="space-y-6">
        <h2 class="text-2xl font-bold text-primary">Plus tard (v2.0)</h2>
        <div class="grid gap-6">
          <div class="card p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Mode compétition</h3>
            <p class="text-gray-300">
              Défiez d'autres utilisateurs en temps réel, participez à des tournois hebdomadaires,
              et grimpez dans le classement mondial. Créez ou rejoignez des équipes pour des défis collectifs
              et gagnez des trophées exclusifs.
            </p>
          </div>

          <div class="card p-6 space-y-4">
            <h3 class="text-xl font-semibold text-white">Application mobile native</h3>
            <p class="text-gray-300">
              Version mobile optimisée pour Android et iOS avec notifications personnalisées,
              widgets pour les mots du jour, et synchronisation instantanée avec la version web.
              Profitez d'exercices spécialement conçus pour l'utilisation mobile.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.text-gradient {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary;
}

.card {
  @apply bg-gray-800/40 border border-gray-700 hover:border-gray-600 transition-all duration-300;
}
</style> 