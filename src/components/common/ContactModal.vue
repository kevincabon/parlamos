<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gradient">Contactez-nous</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Email -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Email</label>
          <input 
            v-model="formData.email"
            type="email"
            required
            class="input w-full"
            :placeholder="authStore.user?.email || 'Votre email'"
          >
        </div>

        <!-- Type de message -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Type de message</label>
          <select 
            v-model="formData.type"
            required
            class="input w-full"
          >
            <option value="bug">Signaler un bug</option>
            <option value="suggestion">Suggestion</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <!-- Sujet -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Sujet</label>
          <input 
            v-model="formData.subject"
            type="text"
            required
            class="input w-full"
            placeholder="Résumé bref de votre message"
          >
        </div>

        <!-- Message -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Message</label>
          <textarea 
            v-model="formData.message"
            required
            rows="4"
            class="input w-full"
            placeholder="Décrivez en détail votre problème ou suggestion..."
          ></textarea>
        </div>

        <!-- Boutons -->
        <div class="flex justify-end gap-4">
          <button 
            type="button"
            @click="$emit('close')"
            class="btn bg-gray-700 hover:bg-gray-600"
          >
            Annuler
          </button>
          <button 
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Envoi...' : 'Envoyer' }}
          </button>
        </div>
      </form>

      <!-- Message de succès -->
      <div 
        v-if="showSuccess"
        class="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center"
      >
        Message envoyé avec succès ! Merci de votre retour.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const showSuccess = ref(false)

const formData = ref({
  type: 'bug',
  subject: '',
  message: '',
  email: authStore.user?.email || ''
})

async function handleSubmit() {
  try {
    loading.value = true
    
    // Vérifier que l'URL du webhook est bien définie
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL
    if (!webhookUrl) {
      throw new Error('URL du webhook non définie')
    }
    
    // Préparer les données à envoyer
    const payload = {
      type: formData.value.type,
      subject: formData.value.subject,
      message: formData.value.message,
      email: formData.value.email,
      user: {
        id: authStore.user?.id,
        username: authStore.profile?.username
      },
      timestamp: new Date().toISOString()
    }

    // Envoyer au webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      formData.value = { 
        type: 'bug', 
        subject: '', 
        message: '', 
        email: authStore.user?.email || '' 
      }
      emit('close')
    }, 2000)

  } catch (error) {
    console.error('Erreur détaillée:', error)
    // Afficher un message d'erreur plus descriptif
    const errorMessage = error.response 
      ? `Erreur serveur: ${error.response.status}` 
      : error.message
    console.error('Erreur lors de l\'envoi du feedback:', errorMessage)
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['close'])
</script> 