<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-red-500">Accès Refusé</h1>
      <p class="text-xl text-gray-400">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <router-link to="/" class="btn btn-primary">
        Retourner à l'accueil
      </router-link>
    </div>
  </div>
</template> 