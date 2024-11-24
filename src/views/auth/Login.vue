<template>
  <div class="min-h-screen flex items-center justify-center">
    <Notification
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
    />

    <div class="max-w-md w-full space-y-8 p-6 bg-gray-800 rounded-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gradient">Connexion</h2>
        <p class="mt-2 text-gray-300">
          Connectez-vous pour accéder à votre compte
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
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
        </div>

        <div v-if="error" class="text-red-500 text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <div class="text-center space-y-2">
          <router-link to="/register" class="text-primary hover:text-blue-400 block">
            Pas encore de compte ? S'inscrire
          </router-link>
          <button 
            type="button"
            @click="handleResetPassword"
            class="text-gray-400 hover:text-gray-300 text-sm"
          >
            Mot de passe oublié ?
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Notification from '@/components/common/Notification.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = computed(() => authStore.loading)

const notification = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

async function handleSubmit() {
  try {
    error.value = ''
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}

async function handleResetPassword() {
  if (!email.value) {
    error.value = 'Veuillez entrer votre email pour réinitialiser le mot de passe'
    return
  }

  try {
    error.value = ''
    const { error: resetError } = await authStore.resetPassword(email.value)
    if (resetError) throw resetError

    notification.value = {
      show: true,
      type: 'success',
      title: 'Email envoyé',
      message: 'Un email de réinitialisation a été envoyé à votre adresse'
    }

    setTimeout(() => {
      notification.value.show = false
    }, 5000)
  } catch (err) {
    error.value = err.message
  }
}
</script> 