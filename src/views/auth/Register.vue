<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8 p-6 bg-gray-800 rounded-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gradient">Inscription</h2>
        <p class="mt-2 text-gray-300">
          Créez votre compte pour commencer à apprendre
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="username" class="text-sm font-medium text-gray-300">Nom d'utilisateur</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="input w-full mt-1"
              placeholder="Votre nom d'utilisateur"
            />
          </div>

          <div>
            <label for="email" class="text-sm font-medium text-gray-300">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input w-full mt-1"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label for="password" class="text-sm font-medium text-gray-300">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input w-full mt-1"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label for="confirmPassword" class="text-sm font-medium text-gray-300">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="input w-full mt-1"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-center">
          {{ error }}
        </div>

        <div v-if="successMessage" class="text-green-500 text-center">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? 'Inscription...' : 'S\'inscrire' }}
        </button>

        <div class="text-center">
          <router-link to="/login" class="text-primary hover:text-blue-400">
            Déjà un compte ? Se connecter
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const successMessage = ref('')
const loading = computed(() => authStore.loading)

const isFormValid = computed(() => {
  return username.value.length >= 3 &&
    email.value.includes('@') &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value
})

async function handleSubmit() {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir correctement tous les champs'
    return
  }

  try {
    error.value = ''
    successMessage.value = ''
    
    const result = await authStore.register(
      email.value,
      password.value,
      username.value
    )

    successMessage.value = result.message
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.message
  }
}
</script> 