<template>
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

    <!-- Modal pour les citations -->
    <QuoteModal 
      v-if="showAddQuoteModal || editingQuote"
      :quote="editingQuote"
      @close="closeQuoteModal"
      @save="saveQuote"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import QuoteModal from './QuoteModal.vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const emit = defineEmits(['update-stats'])
const quotes = ref([])
const showAddQuoteModal = ref(false)
const editingQuote = ref(null)
const quoteSearch = ref('')

onMounted(async () => {
  await loadQuotes()
})

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
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les citations',
      life: 3000
    })
  }
}

// Filtrage des citations
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
    emit('update-stats')
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: editingQuote.value ? 'Citation modifiée avec succès' : 'Citation ajoutée avec succès',
      life: 3000
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la citation:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de sauvegarder la citation',
      life: 3000
    })
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
    emit('update-stats')
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Citation supprimée avec succès',
      life: 3000
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la citation:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de supprimer la citation',
      life: 3000
    })
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
