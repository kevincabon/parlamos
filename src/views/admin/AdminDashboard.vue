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

    <!-- Stats générales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Stats des mots -->
      <div class="card p-4">
        <h3 class="text-xl font-bold mb-2">Total des mots</h3>
        <p class="text-3xl text-primary">{{ stats.totalWords }}</p>
        <div class="mt-2 text-sm text-gray-400">
          <p>{{ stats.wordsWithAudio }} avec audio</p>
          <p>{{ stats.wordsWithoutAudio }} sans audio</p>
        </div>
      </div>

      <!-- Stats des citations -->
      <div class="card p-4">
        <h3 class="text-xl font-bold mb-2">Citations</h3>
        <p class="text-3xl text-primary">{{ stats.totalQuotes }}</p>
        <div class="mt-2 text-sm text-gray-400">
          <p>{{ stats.uniqueAuthors }} auteurs différents</p>
        </div>
      </div>

      <!-- Stats des utilisateurs -->
      <div class="card p-4">
        <h3 class="text-xl font-bold mb-2">Utilisateurs</h3>
        <p class="text-3xl text-primary">{{ stats.totalUsers }}</p>
        <div class="mt-2 text-sm text-gray-400">
          <p>{{ stats.adminCount }} administrateurs</p>
          <p>{{ stats.vipCount }} utilisateurs VIP</p>
          <p>{{ stats.activeUsers }} actifs ce mois</p>
        </div>
      </div>

      <!-- Stats d'activité -->
      <div class="card p-4">
        <h3 class="text-xl font-bold mb-2">Activité</h3>
        <p class="text-3xl text-primary">{{ stats.lastUpdate }}</p>
        <div class="mt-2 text-sm text-gray-400">
          <p>{{ stats.newUsersThisMonth }} nouveaux utilisateurs ce mois</p>
          <p>{{ stats.newWordsThisMonth }} nouveaux mots ce mois</p>
        </div>
      </div>
    </div>

    <!-- Gestion des mots -->
    <div class="card p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Liste des mots</h2>
        <button @click="showAddWordModal = true" class="btn btn-primary">
          Ajouter un mot
        </button>
      </div>

      <!-- Filtres -->
      <div class="flex gap-4 mb-4">
        <input 
          v-model="search" 
          type="text" 
          placeholder="Rechercher..." 
          class="input"
        >
        <select 
          v-model="filter" 
          class="select bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2"
        >
          <option value="all">Tous</option>
          <option value="no-audio">Sans audio</option>
          <option value="with-audio">Avec audio</option>
        </select>
      </div>

      <!-- Table des mots -->
      <div class="overflow-x-auto">
        <div class="max-h-[400px] overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-gray-800 z-10">
              <tr>
                <th class="text-left p-2">Français</th>
                <th class="text-left p-2">Espagnol</th>
                <th class="text-left p-2">Audio FR</th>
                <th class="text-left p-2">Audio ES</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="word in filteredWords" :key="word.id" class="border-t">
                <td class="p-2">{{ word.fr }}</td>
                <td class="p-2">{{ word.es }}</td>
                <td class="p-2">
                  <span v-if="word.audio_fr" class="text-green-500">✓</span>
                  <span v-else class="text-red-500">✗</span>
                </td>
                <td class="p-2">
                  <span v-if="word.audio_es" class="text-green-500">✓</span>
                  <span v-else class="text-red-500">✗</span>
                </td>
                <td class="p-2">
                  <div class="flex gap-2">
                    <button @click="editWord(word)" class="btn btn-sm">
                      ✏️
                    </button>
                    <button @click="deleteWord(word.id)" class="btn btn-sm text-red-500">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Ajout/Edition -->
    <WordModal 
      v-if="showAddWordModal || editingWord"
      :word="editingWord"
      @close="closeModal"
      @save="saveWord"
    />

    <!-- Après la section des mots -->
    <div class="card p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Citations</h2>
        <button @click="showAddQuoteModal = true" class="btn btn-primary">
          Ajouter une citation
        </button>
      </div>

      <!-- Filtres et recherche -->
      <div class="flex gap-4 mb-4">
        <div class="relative flex-grow">
          <input 
            v-model="quoteSearch" 
            type="text" 
            placeholder="Rechercher une citation..." 
            class="w-full px-4 py-2 pl-10 rounded-full bg-gray-600/80 border border-gray-500 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 text-white placeholder-gray-400 transition-all duration-300"
          >
          <svg 
            class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Table des citations -->
      <div class="overflow-x-auto">
        <div class="max-h-[400px] overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-gray-800 z-10">
              <tr>
                <th class="text-left p-2">Français</th>
                <th class="text-left p-2">Espagnol</th>
                <th class="text-left p-2">Auteur</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quote in filteredQuotes" :key="quote.id" class="border-t">
                <td class="p-2">{{ quote.fr }}</td>
                <td class="p-2">{{ quote.es }}</td>
                <td class="p-2">{{ quote.author }}</td>
                <td class="p-2">
                  <div class="flex gap-2">
                    <button @click="editQuote(quote)" class="btn btn-sm">
                      ✏️
                    </button>
                    <button @click="deleteQuote(quote.id)" class="btn btn-sm text-red-500">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal pour les citations -->
    <QuoteModal 
      v-if="showAddQuoteModal || editingQuote"
      :quote="editingQuote"
      @close="closeQuoteModal"
      @save="saveQuote"
    />

    <!-- Ajouter cette section après la section des citations -->
    <div class="card p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Utilisateurs</h2>
      </div>

      <!-- Table des utilisateurs -->
      <div class="overflow-x-auto">
        <div class="max-h-[400px] overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-gray-800 z-10">
              <tr>
                <th class="text-left p-2">Email</th>
                <th class="text-left p-2">Nom d'utilisateur</th>
                <th class="text-left p-2">Rôle</th>
                <th class="text-left p-2">Inscription</th>
                <th class="text-left p-2">Dernière connexion</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-t">
                <td class="p-2">{{ user.email }}</td>
                <td class="p-2">{{ user.username }}</td>
                <td class="p-2">
                  <select 
                    v-model="user.role"
                    @change="updateUserRole(user.id, $event.target.value)"
                    class="bg-gray-700 text-white rounded px-2 py-1"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="vip">VIP</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="p-2">{{ formatDate(user.created_at) }}</td>
                <td class="p-2">{{ formatDate(user.last_sign_in_at) || 'Jamais' }}</td>
                <td class="p-2">
                  <div class="flex gap-2">
                    <button 
                      @click="deleteUser(user.id)"
                      class="btn btn-sm text-red-500"
                      :disabled="user.id === currentUserId"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/config/supabase'
import { useRouter } from 'vue-router'
import WordModal from '@/components/admin/WordModal.vue'
import AccessDenied from '@/components/common/AccessDenied.vue'
import QuoteModal from '@/components/admin/QuoteModal.vue'

const router = useRouter()
const isAdmin = ref(false)
const loading = ref(true)
const words = ref([])
const search = ref('')
const filter = ref('all')
const showAddWordModal = ref(false)
const editingWord = ref(null)
const stats = ref({
  totalWords: 0,
  wordsWithAudio: 0,
  wordsWithoutAudio: 0,
  newWordsThisMonth: 0,
  totalQuotes: 0,
  uniqueAuthors: 0,
  totalUsers: 0,
  adminCount: 0,
  vipCount: 0,
  activeUsers: 0,
  newUsersThisMonth: 0,
  lastUpdate: null
})
const quotes = ref([])
const showAddQuoteModal = ref(false)
const editingQuote = ref(null)
const users = ref([])
const currentUserId = ref(null)
const quoteSearch = ref('')

// Vérifier les permissions
async function checkPermissions() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return false
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (error || profile?.role !== 'admin') {
      isAdmin.value = false
      return false
    }

    isAdmin.value = true
    return true
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error)
    isAdmin.value = false
    return false
  }
}

// Filtrage des mots
const filteredWords = computed(() => {
  let filtered = words.value

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(word => 
      word.fr.toLowerCase().includes(searchLower) ||
      word.es.toLowerCase().includes(searchLower)
    )
  }

  if (filter.value === 'no-audio') {
    filtered = filtered.filter(word => !word.audio_fr && !word.audio_es)
  } else if (filter.value === 'with-audio') {
    filtered = filtered.filter(word => word.audio_fr || word.audio_es)
  }

  return filtered
})

// Chargement des données
async function loadData() {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    words.value = data
    updateStats()
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  }
}

// Mise à jour des stats
function updateStats() {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  stats.value = {
    // Stats des mots
    totalWords: words.value.length,
    wordsWithAudio: words.value.filter(w => w.audio_fr || w.audio_es).length,
    wordsWithoutAudio: words.value.filter(w => !w.audio_fr && !w.audio_es).length,
    newWordsThisMonth: words.value.filter(w => new Date(w.created_at) >= thisMonth).length,

    // Stats des citations
    totalQuotes: quotes.value.length,
    uniqueAuthors: new Set(quotes.value.map(q => q.author)).size,

    // Stats des utilisateurs
    totalUsers: users.value.length,
    adminCount: users.value.filter(u => u.role === 'admin').length,
    vipCount: users.value.filter(u => u.role === 'vip').length,
    activeUsers: users.value.filter(u => {
      const lastSignIn = new Date(u.last_sign_in_at)
      return lastSignIn >= thisMonth
    }).length,
    newUsersThisMonth: users.value.filter(u => 
      new Date(u.created_at) >= thisMonth
    ).length,

    // Dernière mise à jour
    lastUpdate: new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(now)
  }
}

// Ajouter un watcher pour mettre à jour les stats quand les données changent
watch([words, quotes, users], () => {
  updateStats()
})

// Gestion des mots
async function saveWord(wordData) {
  try {
    if (editingWord.value) {
      const { error } = await supabase
        .from('words')
        .update(wordData)
        .eq('id', editingWord.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('words')
        .insert(wordData)
      
      if (error) throw error
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

async function deleteWord(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce mot ?')) return

  try {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id)

    if (error) throw error
    await loadData()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

function editWord(word) {
  editingWord.value = word
}

function closeModal() {
  showAddWordModal.value = false
  editingWord.value = null
}

// Charger les citations
async function loadQuotes() {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    quotes.value = data
  } catch (error) {
    console.error('Erreur lors du chargement des citations:', error)
  }
}

// Gestion des citations
async function saveQuote(quoteData) {
  try {
    if (editingQuote.value) {
      const { error } = await supabase
        .from('quotes')
        .update(quoteData)
        .eq('id', editingQuote.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('quotes')
        .insert(quoteData)
      
      if (error) throw error
    }

    await loadQuotes()
    closeQuoteModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la citation:', error)
  }
}

async function deleteQuote(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette citation ?')) return

  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)

    if (error) throw error
    await loadQuotes()
  } catch (error) {
    console.error('Erreur lors de la suppression de la citation:', error)
  }
}

function editQuote(quote) {
  editingQuote.value = quote
  showAddQuoteModal.value = true
}

function closeQuoteModal() {
  showAddQuoteModal.value = false
  editingQuote.value = null
}

// Ajouter cette fonction pour charger les utilisateurs
async function loadUsers() {
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    const { data: authUsers, error: authError } = await supabase
      .rpc('get_users')

    if (authError) throw authError

    users.value = profiles.map(profile => ({
      ...profile,
      email: authUsers.find(u => u.id === profile.id)?.email || 'Email non disponible',
      last_sign_in_at: authUsers.find(u => u.id === profile.id)?.last_sign_in_at
    }))

  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  }
}

// Fonction pour mettre à jour le rôle d'un utilisateur
async function updateUserRole(userId, newRole) {
  try {

    // Mettre à jour dans la base de données
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select() // Ajouter .select() pour récupérer les données mises à jour

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError)
      throw updateError
    }

    // Mettre à jour localement l'utilisateur dans le tableau
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        role: newRole
      }
    }

    // Forcer la mise à jour des stats
    updateStats()

    // Si l'utilisateur modifié est l'utilisateur courant, rafraîchir son profil
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id === userId) {
      const authStore = useAuthStore()
      await authStore.fetchProfile(userId)
    }

    // Recharger la liste des utilisateurs pour s'assurer d'avoir les données à jour
    await loadUsers()

  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    // En cas d'erreur, recharger les utilisateurs pour revenir à l'état initial
    await loadUsers()
  }
}

// Fonction pour supprimer un utilisateur
async function deleteUser(userId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
  if (userId === currentUserId.value) return

  try {
    // Supprimer le profil (la suppression en cascade s'occupera du reste)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error

    await loadUsers()
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
  }
}

// Ajouter cette fonction pour formater les dates
function formatDate(dateString) {
  if (!dateString) return null
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

// Ajouter ce computed pour filtrer les citations
const filteredQuotes = computed(() => {
  if (!quoteSearch.value) return quotes.value
  
  const search = quoteSearch.value.toLowerCase()
  return quotes.value.filter(quote => 
    quote.fr.toLowerCase().includes(search) ||
    quote.es.toLowerCase().includes(search) ||
    quote.author.toLowerCase().includes(search) ||
    quote.profession?.toLowerCase().includes(search)
  )
})

// Modifier onMounted
onMounted(async () => {
  try {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    currentUserId.value = session?.user?.id

    const hasPermission = await checkPermissions()
    if (hasPermission) {
      await Promise.all([
        loadData(),
        loadQuotes(),
        loadUsers()
      ])
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
  } finally {
    loading.value = false
  }
})
</script> 

<style scoped>
/* Style pour la scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.8);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8);
}

/* Style pour que le header reste visible pendant le scroll */
thead.sticky {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card {
  @apply transition-all duration-300;
}

.card:hover {
  @apply transform scale-[1.01];
  box-shadow: 0 0 20px rgba(var(--color-primary), 0.1);
}

.text-primary {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary;
}
</style> 