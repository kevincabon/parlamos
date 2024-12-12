<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <div class="loader">Chargement...</div>
  </div>
  <AccessDenied v-else-if="!isAdmin" />
  <div v-else class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center space-y-6">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
        Dashboard Admin
      </h1>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div class="stats-card">
        <h3>Total Mots</h3>
        <p>{{ stats.totalWords }}</p>
      </div>
      <div class="stats-card">
        <h3>Total Citations</h3>
        <p>{{ stats.totalQuotes }}</p>
      </div>
      <div class="stats-card">
        <h3>Total Utilisateurs</h3>
        <p>{{ stats.totalUsers }}</p>
      </div>
    </div>

    <WordsManager @update-stats="updateStats" />
    <QuotesManager @update-stats="updateStats" />
    <UsersManager @update-stats="updateStats" />

    <Toast position="bottom-right" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import AccessDenied from '@/components/common/AccessDenied.vue'
import WordsManager from '@/components/admin/WordsManager.vue'
import QuotesManager from '@/components/admin/QuotesManager.vue'
import UsersManager from '@/components/admin/UsersManager.vue'
import Toast from 'primevue/toast'

const router = useRouter()
const isAdmin = ref(false)
const loading = ref(true)

const stats = ref({
  totalWords: 0,
  totalQuotes: 0,
  totalUsers: 0
})

async function checkPermissions() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin.value = profile?.role === 'admin'
    if (!isAdmin.value) {
      router.push('/')
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
}

async function updateStats() {
  try {
    // Compter les mots
    const { count: wordsCount, error: wordsError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })

    if (wordsError) throw wordsError
    stats.value.totalWords = wordsCount

    // Compter les citations
    const { count: quotesCount, error: quotesError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })

    if (quotesError) throw quotesError
    stats.value.totalQuotes = quotesCount

    // Compter les utilisateurs
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError
    stats.value.totalUsers = usersCount
  } catch (error) {
    console.error('Erreur lors de la mise à jour des stats:', error)
  }
}

onMounted(async () => {
  await checkPermissions()
  if (isAdmin.value) {
    await updateStats()
  }
})
</script>

<style scoped>
.stats-card {
  @apply bg-white/5 rounded-lg p-6 text-center;
}

.stats-card h3 {
  @apply text-lg font-medium text-gray-300 mb-2;
}

.stats-card p {
  @apply text-3xl font-bold text-primary;
}

.loader {
  @apply text-xl text-primary;
}
</style>