<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
    <div class="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
      <h2 class="text-2xl font-bold mb-4">
        {{ quote ? 'Modifier la citation' : 'Ajouter une citation' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block mb-2">Français</label>
          <textarea 
            v-model="formData.fr" 
            required
            rows="3"
            class="input w-full"
          ></textarea>
        </div>

        <div>
          <label class="block mb-2">Espagnol</label>
          <textarea 
            v-model="formData.es" 
            required
            rows="3"
            class="input w-full"
          ></textarea>
        </div>

        <!-- Remplacer la section de recherche d'auteur par : -->
        <div class="relative">
          <label class="block mb-2">Auteur</label>
          <div class="relative">
            <input 
              v-model="formData.author"
              type="text"
              required
              class="input w-full pr-10"
              placeholder="Rechercher ou saisir un auteur..."
              @input="searchAuthors"
              @focus="showSuggestions = true"
            >
            <svg 
              class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Liste des suggestions -->
          <div 
            v-if="showSuggestions && filteredAuthors.length > 0" 
            class="absolute z-10 w-full mt-1 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <ul class="py-1">
              <li 
                v-for="author in filteredAuthors" 
                :key="author.id"
                class="px-4 py-2 hover:bg-gray-600 cursor-pointer transition-colors duration-150"
                @click="selectAuthor(author)"
              >
                <div class="font-medium">{{ author.name }}</div>
                <div class="text-sm text-gray-400">
                  {{ author.dates }} - {{ author.profession }}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Champs détaillés de l'auteur -->
        <div class="space-y-4">
          <div>
            <label class="block mb-2">Dates</label>
            <input 
              v-model="formData.dates" 
              type="text"
              placeholder="ex: 1844-1900"
              class="input w-full"
            >
          </div>

          <div>
            <label class="block mb-2">Profession</label>
            <input 
              v-model="formData.profession" 
              type="text"
              placeholder="ex: Philosophe allemand"
              class="input w-full"
            >
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <button 
            type="button" 
            @click="$emit('close')"
            class="btn bg-gray-700 text-white"
          >
            Annuler
          </button>
          <button 
            type="submit"
            class="btn btn-primary text-white"
          >
            {{ quote ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

const props = defineProps({
  quote: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  fr: '',
  es: '',
  author: '',
  dates: '',
  profession: ''
})

const showSuggestions = ref(false)
const existingAuthors = ref([])
const filteredAuthors = ref([])

// Charger les auteurs existants
async function loadExistingAuthors() {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('author, dates, profession')
      .not('author', 'is', null)

    if (error) throw error

    // Créer un Set unique d'auteurs
    const uniqueAuthors = new Set()
    existingAuthors.value = data
      .filter(quote => {
        const key = `${quote.author}-${quote.dates}-${quote.profession}`
        if (!uniqueAuthors.has(key)) {
          uniqueAuthors.add(key)
          return true
        }
        return false
      })
      .map((quote, index) => ({
        id: index,
        name: quote.author,
        dates: quote.dates,
        profession: quote.profession
      }))
  } catch (error) {
    console.error('Erreur lors du chargement des auteurs:', error)
  }
}

// Rechercher parmi les auteurs existants
function searchAuthors() {
  if (!formData.value.author?.trim()) {
    filteredAuthors.value = []
    return
  }

  const search = formData.value.author.toLowerCase()
  filteredAuthors.value = existingAuthors.value.filter(author => 
    author.name.toLowerCase().includes(search) ||
    author.profession?.toLowerCase().includes(search)
  )
}

// Sélectionner un auteur depuis les suggestions
function selectAuthor(author) {
  formData.value.author = author.name
  formData.value.dates = author.dates
  formData.value.profession = author.profession
  showSuggestions.value = false
}

function handleSubmit() {
  emit('save', {
    fr: formData.value.fr,
    es: formData.value.es,
    author: formData.value.author,
    dates: formData.value.dates,
    profession: formData.value.profession
  })
}

onMounted(async () => {
  await loadExistingAuthors()
  
  if (props.quote) {
    formData.value = {
      fr: props.quote.fr,
      es: props.quote.es,
      author: props.quote.author,
      dates: props.quote.dates,
      profession: props.quote.profession
    }
  }
})

// Fermer les suggestions si on clique en dehors
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showSuggestions.value = false
    }
  })
})
</script>

<style scoped>
.input {
  @apply bg-gray-700 border-gray-600 text-white placeholder-gray-400;
}

/* Style pour la scrollbar des suggestions */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  @apply bg-gray-700;
}

.overflow-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style> 