<template>
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

    <!-- Modal Ajout/Edition -->
    <WordModal 
      v-if="showAddWordModal || editingWord"
      :word="editingWord"
      @close="closeModal"
      @save="saveWord"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import WordModal from './WordModal.vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const emit = defineEmits(['update-stats'])
const words = ref([])
const search = ref('')
const filter = ref('all')
const showAddWordModal = ref(false)
const editingWord = ref(null)

onMounted(async () => {
  await loadData()
})

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
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les mots',
      life: 3000
    })
  }
}

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
      
      if (error) {
        // Vérifier si c'est une erreur de doublon
        if (error.code === '23505') {
          const field = error.details.includes('fr') ? 'français' : 'espagnol'
          toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Ce mot existe déjà en ${field} dans la base de données.`,
            life: 5000
          })
          return
        }
        throw error
      }
    }

    await loadData()
    closeModal()
    emit('update-stats')
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: editingWord.value ? 'Mot modifié avec succès' : 'Mot ajouté avec succès',
      life: 3000
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de sauvegarder le mot',
      life: 3000
    })
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
    emit('update-stats')
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Mot supprimé avec succès',
      life: 3000
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de supprimer le mot',
      life: 3000
    })
  }
}

function editWord(word) {
  editingWord.value = word
  showAddWordModal.value = true
}

function closeModal() {
  showAddWordModal.value = false
  editingWord.value = null
}
</script>

<style scoped>
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

thead.sticky {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
