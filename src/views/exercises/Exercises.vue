<template>
  <div class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Bandeau d'avertissement -->
    <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="text-yellow-500 font-medium">Version Beta - Exercices en développement</h3>
          <p class="text-yellow-500/80 text-sm">
            Cette section est en cours de développement. Certains bugs peuvent être présents, notamment :
          </p>
          <ul class="mt-2 text-yellow-500/80 text-sm list-disc list-inside ml-4">
            <li>Le glisser-déposer peut parfois nécessiter plusieurs tentatives</li>
            <li>Les animations peuvent être saccadées sur certains navigateurs</li>
            <li>Le chargement des mots peut prendre un peu de temps</li>
          </ul>
          <p class="mt-2 text-yellow-500/80 text-sm">
            Nous travaillons activement à l'amélioration de ces fonctionnalités.
          </p>
        </div>
      </div>
    </div>

    <header class="text-center space-y-6">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
        Exercices
      </h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto">
        Pratiquez votre français et espagnol avec des exercices interactifs
      </p>
    </header>

    <div class="max-w-4xl mx-auto">
      <!-- Sélection du type d'exercice -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button 
          v-for="type in exerciseTypes" 
          :key="type.id"
          @click="selectExerciseType(type)"
          class="card p-6 text-left hover:shadow-lg transition-all duration-300 bg-gray-800/40"
          :class="[
            currentExerciseType?.id === type.id ? 'ring-2 ring-primary' : ''
          ]"
        >
          <div class="text-3xl mb-2">{{ type.icon }}</div>
          <h3 class="text-xl font-bold text-primary mb-2">{{ type.name }}</h3>
          <p class="text-gray-400">{{ type.description }}</p>
        </button>
      </div>

      <!-- Exercice en cours -->
      <div v-if="currentExerciseType && !loading" class="space-y-8">
        <component 
          :is="currentExerciseType.component"
          :exercise-data="currentExerciseData"
          @complete="handleExerciseComplete"
        />
      </div>

      <!-- Loader -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import { supabase } from '@/config/supabase'
import DragDropExercise from '@/components/exercises/DragDropExercise.vue'
import QuizExercise from '@/components/exercises/QuizExercise.vue'

const loading = ref(false)
const words = ref([])

const exerciseTypes = [
  {
    id: 'drag-drop',
    name: 'Glisser-Déposer',
    icon: '🔄',
    description: 'Associez les mots français avec leur traduction en espagnol.',
    component: markRaw(DragDropExercise)
  },
  {
    id: 'quiz',
    name: 'Quiz',
    icon: '❓',
    description: 'Testez vos connaissances avec des questions à choix multiples.',
    component: markRaw(QuizExercise)
  }
]

const currentExerciseType = ref(null)
const currentScore = ref(0)

// Charger les mots depuis Supabase
async function loadWords() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .rpc('get_random_words', { limit_count: 100 })

    if (error) throw error
    words.value = data
  } catch (err) {
    console.error('Erreur lors du chargement des mots:', err)
  } finally {
    loading.value = false
  }
}

// Préparer les données pour l'exercice sélectionné
const currentExerciseData = computed(() => {
  if (!currentExerciseType.value || !words.value.length) return null

  switch (currentExerciseType.value.id) {
    case 'drag-drop':
      return {
        words: words.value.sort(() => Math.random() - 0.5).slice(0, 5)
      }
    case 'quiz':
      return {
        questions: words.value.slice(0, 5).map(word => ({
          id: word.id,
          question: `Comment dit-on "${word.fr}" en espagnol ?`,
          options: [
            word.es,
            ...words.value
              .filter(w => w.id !== word.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map(w => w.es)
          ].sort(() => Math.random() - 0.5),
          correctAnswer: word.es
        }))
      }
    default:
      return null
  }
})

const selectExerciseType = async (type) => {
  currentExerciseType.value = type
  currentScore.value = 0
  if (words.value.length === 0) {
    await loadWords()
  }
}

const handleExerciseComplete = (result) => {
  currentScore.value = result.score
  // TODO: Sauvegarder la progression
  console.log('Exercice terminé avec le score:', result.score)
}
</script> 