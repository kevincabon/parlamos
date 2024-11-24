<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="card space-y-8">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <h1 class="text-3xl font-bold text-gradient">Profil Utilisateur</h1>
          <div
            v-if="isAdmin"
            class="px-2 py-1 rounded-md bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
          >
            <span class="text-sm font-medium text-yellow-500">Admin</span>
          </div>
          <div
            v-else-if="isVip"
            class="px-2 py-1 rounded-md bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <span class="text-sm font-medium text-purple-500">VIP</span>
          </div>
        </div>
        <button
          v-if="!isEditing"
          @click="startEditing"
          class="btn btn-primary"
        >
          Modifier le profil
        </button>
      </div>

      <!-- Mode affichage -->
      <div v-if="!isEditing" class="space-y-6">
        <div class="flex items-center space-x-4">
          <div class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            <img
              v-if="profile?.avatar_url"
              :src="profile.avatar_url"
              :alt="profile?.username"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-4xl">
              {{ profile?.username?.[0]?.toUpperCase() }}
            </span>
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ profile?.username }}</h2>
            <p class="text-gray-400">{{ user?.email }}</p>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-700/50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.exercisesCompleted }}</div>
            <div class="text-sm text-gray-400">Exercices complétés</div>
          </div>
          <div class="bg-gray-700/50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.wordsLearned }}</div>
            <div class="text-sm text-gray-400">Mots appris</div>
          </div>
          <div class="bg-gray-700/50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.averageScore }}%</div>
            <div class="text-sm text-gray-400">Score moyen</div>
          </div>
        </div>

        <!-- Statistiques supplémentaires -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="bg-gray-700/50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-red-400">{{ stats.totalLikes }}</div>
            <div class="text-sm text-gray-400">Likes donnés</div>
          </div>
          <div class="bg-gray-700/50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-yellow-400">{{ stats.savedWords }}</div>
            <div class="text-sm text-gray-400">Mots sauvegardés</div>
          </div>
          <div class="bg-gray-700/50 p-4 rounded-lg text-center">
            <div class="text-lg font-medium text-gray-300">
              {{ stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString('fr-FR') : 'Aucune' }}
            </div>
            <div class="text-sm text-gray-400">Dernière activité</div>
          </div>
        </div>
      </div>

      <!-- Mode édition -->
      <form v-else class="space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300">Avatar</label>
            <div class="mt-1 flex items-center space-x-4">
              <div class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  v-if="previewImage || profile?.avatar_url"
                  :src="previewImage || profile?.avatar_url"
                  :alt="profile?.username"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-4xl">
                  {{ profile?.username?.[0]?.toUpperCase() }}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="hidden"
                ref="fileInput"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="btn bg-gray-700 hover:bg-gray-600"
              >
                Changer l'avatar
              </button>
            </div>
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-300">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              class="input w-full mt-1"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="cancelEditing"
            class="btn bg-gray-700 hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>

      <div v-if="error" class="text-red-500 text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { uploadAvatar, deleteAvatar } from '@/services/storage'
import { supabase } from '@/config/supabase'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const profile = computed(() => authStore.profile)

const isEditing = ref(false)
const loading = ref(false)
const error = ref('')
const fileInput = ref(null)
const previewImage = ref(null)
const stats = ref({
  exercisesCompleted: 0,
  wordsLearned: 0,
  averageScore: 0,
  totalLikes: 0,
  savedWords: 0,
  lastActivity: null
})

const formData = ref({
  username: '',
  avatar_url: '',
  avatar_file: null
})

const isAdmin = computed(() => authStore.isAdmin)
const isVip = computed(() => authStore.isVip)

// Charger les statistiques de l'utilisateur
async function loadStats() {
  try {
    const userId = user.value?.id
    if (!userId) return

    // Récupérer les likes de l'utilisateur
    const { data: likes, error: likesError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('user_id', userId)

    if (likesError) throw likesError

    // Récupérer les mots sauvegardés
    const { data: savedWords, error: savedError } = await supabase
      .from('saved_words')
      .select('*')
      .eq('user_id', userId)

    if (savedError) throw savedError

    // Récupérer les exercices complétés
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercise_results')
      .select('*')
      .eq('user_id', userId)

    if (exercisesError) throw exercisesError

    // Calculer les statistiques
    const totalExercises = exercises?.length || 0
    const totalScore = exercises?.reduce((sum, ex) => sum + ex.score, 0) || 0
    const avgScore = totalExercises > 0 ? Math.round(totalScore / totalExercises) : 0

    // Récupérer la dernière activité
    const lastActivity = exercises?.length > 0 
      ? new Date(Math.max(...exercises.map(ex => new Date(ex.created_at))))
      : null

    // Mettre à jour les stats
    stats.value = {
      exercisesCompleted: totalExercises,
      wordsLearned: new Set(exercises?.map(ex => ex.word_id)).size,
      averageScore: avgScore,
      totalLikes: likes?.length || 0,
      savedWords: savedWords?.length || 0,
      lastActivity
    }

  } catch (err) {
    console.error('Erreur lors du chargement des statistiques:', err)
    error.value = 'Impossible de charger les statistiques'
  }
}

function startEditing() {
  formData.value = {
    username: profile.value?.username || '',
    avatar_url: profile.value?.avatar_url || '',
    avatar_file: null
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  previewImage.value = null
  error.value = ''
}

function handleImageChange(event) {
  const file = event.target.files[0]
  if (file) {
    previewImage.value = URL.createObjectURL(file)
    formData.value.avatar_file = file
  }
}

async function handleSubmit() {
  try {
    loading.value = true
    error.value = ''

    let avatarUrl = profile.value?.avatar_url

    if (formData.value.avatar_file) {
      // Upload du nouvel avatar
      avatarUrl = await uploadAvatar(formData.value.avatar_file, user.value.id)
    }

    // Mise à jour du profil
    await authStore.updateProfile({
      username: formData.value.username,
      avatar_url: avatarUrl
    })

    isEditing.value = false
    previewImage.value = null
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadStats()
})
</script> 