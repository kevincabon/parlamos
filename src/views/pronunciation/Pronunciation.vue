<template>
  <div class="space-y-12 max-w-7xl mx-auto mt-3 px-4 sm:px-6 lg:px-8">
    <!-- Bandeau d'avertissement -->
    <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="text-yellow-500 font-medium">Version Beta</h3>
          <p class="text-yellow-500/80 text-sm">
            Cette fonctionnalité est en cours de développement et peut contenir des bugs. 
            Nous travaillons à son amélioration.
          </p>
        </div>
      </div>
    </div>

    <header class="text-center space-y-6">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
        Prononciation des Verbes
      </h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto">
        Améliorez votre prononciation avec nos exercices audio interactifs
      </p>
    </header>

    <!-- Bouton d'administration -->
    <div v-if="isAdmin" class="flex justify-end">
      <button 
        @click="showAddVerbModal = true"
        class="group px-6 py-2.5 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 transition-all duration-300"
      >
        <span class="flex items-center justify-center gap-2 text-white font-medium">
          <svg 
            class="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un verbe
        </span>
      </button>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="text-center py-12">
      <div class="inline-block p-6 rounded-lg bg-red-500/10 border border-red-500/20">
        <p class="text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Grille de verbes -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Premier groupe -->
      <VerbGroup 
        title="Premier Groupe (-ER)" 
        :verbs="groupedVerbs.group1"
        :is-admin="isAdmin"
        @play-audio="playAudio"
        @edit="editVerb"
        @delete="deleteVerb"
      />

      <!-- Deuxième groupe -->
      <VerbGroup 
        title="Deuxième Groupe (-IR)" 
        :verbs="groupedVerbs.group2"
        :is-admin="isAdmin"
        @play-audio="playAudio"
        @edit="editVerb"
        @delete="deleteVerb"
      />

      <!-- Troisième groupe -->
      <VerbGroup 
        title="Troisième Groupe" 
        :verbs="groupedVerbs.group3"
        :is-admin="isAdmin"
        @play-audio="playAudio"
        @edit="editVerb"
        @delete="deleteVerb"
      />
    </div>

    <!-- Modal d'ajout/édition -->
    <VerbModal
      v-if="showAddVerbModal || editingVerb"
      :verb="editingVerb"
      @close="closeModal"
      @save="saveVerb"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/auth'
import VerbGroup from '@/components/pronunciation/VerbGroup.vue'
import VerbModal from '@/components/pronunciation/VerbModal.vue'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const loading = ref(true)
const error = ref(null)
const verbs = ref([])
const showAddVerbModal = ref(false)
const editingVerb = ref(null)

// Gérer l'audio en cours de lecture
const currentAudio = ref(null)

// Grouper les verbes par type
const groupedVerbs = computed(() => {
  return {
    group1: verbs.value.filter(v => v.group_number === 1),
    group2: verbs.value.filter(v => v.group_number === 2),
    group3: verbs.value.filter(v => v.group_number === 3)
  }
})

// Charger les verbes depuis Supabase
async function loadVerbs() {
  try {
    loading.value = true
    error.value = null

    const { data, error: supabaseError } = await supabase
      .from('verbs')
      .select('*')
      .order('fr', { ascending: true })

    if (supabaseError) throw supabaseError

    verbs.value = data.map(verb => ({
      id: verb.id,
      fr: verb.fr,
      es: verb.es,
      group_number: verb.group_number,
      audio_fr: verb.audio_fr,
      audio_es: verb.audio_es
    }))

  } catch (err) {
    console.error('Erreur lors du chargement des verbes:', err)
    error.value = "Impossible de charger les verbes"
  } finally {
    loading.value = false
  }
}

// Fonction pour jouer l'audio
const playAudio = (audioPath) => {
  if (!audioPath) return

  // Arrêter l'audio en cours s'il y en a un
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
  }

  // Créer et jouer le nouvel audio
  currentAudio.value = new Audio(audioPath)
  currentAudio.value.play().catch(err => {
    console.error('Erreur lors de la lecture audio:', err)
  })
}

async function saveVerb(verbData) {
  try {
    if (!verbData) return

    if (editingVerb.value) {
      const { error } = await supabase
        .from('verbs')
        .update(verbData)
        .eq('id', editingVerb.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('verbs')
        .insert(verbData)
      
      if (error) throw error
    }

    await loadVerbs()
    closeModal()
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err)
    error.value = "Impossible de sauvegarder le verbe"
  }
}

async function deleteVerb(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce verbe ?')) return

  try {
    const { error: deleteError } = await supabase
      .from('verbs')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    await loadVerbs()
  } catch (err) {
    console.error('Erreur lors de la suppression:', err)
    error.value = "Impossible de supprimer le verbe"
  }
}

function editVerb(verb) {
  editingVerb.value = verb
  showAddVerbModal.value = true
}

function closeModal() {
  showAddVerbModal.value = false
  editingVerb.value = null
}

// Nettoyer l'audio lors du démontage du composant
onUnmounted(() => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value = null
  }
})

onMounted(() => {
  loadVerbs()
})
</script> 