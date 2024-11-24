<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-primary">Association de mots</h2>
      <div class="text-gray-300">
        Score: {{ score }}/{{ words.length }}
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-8">
      <!-- Mots français -->
      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-green-500">Français</h3>
        <div 
          v-for="word in frenchWords" 
          :key="word.id"
          class="card p-4 cursor-move bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 transition-all duration-300"
          draggable="true"
          @dragstart="handleDragStart($event, word)"
          @dragend="handleDragEnd"
          :class="{ 
            'opacity-50 scale-95': word.matched,
            'ring-2 ring-primary shadow-lg scale-105 z-50': isDragging && draggedId === word.id,
            'cursor-grab': !word.matched,
            'cursor-grabbing': isDragging && draggedId === word.id,
            'bg-green-600/20 border-green-500/30': word.matched && word.isCorrect,
            'bg-red-600/20 border-red-500/30': word.matched && !word.isCorrect,
          }"
        >
          <div class="select-none relative">
            {{ word.fr }}
            <!-- Indicateur de résultat -->
            <div 
              v-if="word.matched"
              class="absolute -right-2 -top-2"
            >
              <span v-if="word.isCorrect" class="text-green-400 text-lg">✓</span>
              <span v-else class="text-red-400 text-lg">✗</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mots espagnols -->
      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-red-500">Español</h3>
        <div 
          v-for="word in spanishWords" 
          :key="word.id"
          class="relative card p-6 min-h-[80px] bg-gray-700/50 border border-gray-600/30 transition-all duration-300 flex items-center"
          @dragenter.prevent="handleDragEnter($event, word)"
          @dragover.prevent="handleDragOver($event, word)"
          @dragleave.prevent="handleDragLeave($event, word)"
          @drop.prevent="handleDrop($event, word)"
          :class="{
            'opacity-50 scale-95': word.matched,
            'ring-2 ring-primary bg-primary/10 scale-[1.02] transform': isDraggingOver === word.id,
            'hover:bg-gray-600/50': !word.matched && isDraggingOver !== word.id,
            'bg-green-600/20 border-green-500/30': word.matched && word.isCorrect,
            'bg-red-600/20 border-red-500/30': word.matched && !word.isCorrect
          }"
        >
          <!-- Contenu du mot -->
          <div class="flex items-center justify-between w-full select-none">
            <span class="text-lg">{{ word.es }}</span>
            
            <!-- Badge du mot français associé -->
            <div 
              v-if="word.matchedWith" 
              class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full matched-badge"
              :class="{
                'bg-green-500/20 text-green-400 border border-green-500/30': word.isCorrect,
                'bg-red-500/20 text-red-400 border border-red-500/30': !word.isCorrect
              }"
            >
              {{ word.matchedWith }}
            </div>
          </div>

          <!-- Zone de drop active avec animation -->
          <div 
            v-if="isDraggingOver === word.id && !word.matched"
            class="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden"
          >
            <!-- Fond animé -->
            <div class="absolute inset-0 bg-primary/5 animate-pulse"></div>
            
            <!-- Bordure animée -->
            <div class="absolute inset-0 border-2 border-dashed border-primary/40 animate-border-dance"></div>
            
            <!-- Indicateur de drop -->
            <div class="relative px-4 py-2 rounded-full bg-gray-800/90 text-primary text-sm font-medium border border-primary/30 drop-indicator flex items-center gap-2">
              <svg 
                class="w-5 h-5 animate-bounce"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Déposer ici
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-4">
      <button 
        @click="checkAnswers"
        class="group px-6 py-2.5 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-white transition-all duration-300"
        :disabled="!hasMatches"
      >
        <span class="flex items-center justify-center gap-2">
          <svg 
            class="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Vérifier
        </span>
      </button>
      <button 
        @click="loadNewWords"
        class="group px-6 py-2.5 rounded-full bg-gray-600/80 hover:bg-gray-500/80 border border-gray-500 text-white transition-all duration-300"
      >
        <span class="flex items-center justify-center gap-2">
          <svg 
            class="w-5 h-5 transform transition-transform group-hover:rotate-180 duration-500"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Nouveaux mots
        </span>
      </button>
    </div>

    <!-- Feedback -->
    <div v-if="showFeedback" :class="[
      'text-center p-4 rounded-lg',
      isExerciseComplete ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
    ]">
      <p class="text-xl font-bold">
        {{ feedbackMessage }}
      </p>
      <p v-if="isExerciseComplete" class="mt-2">
        Bravo ! Vous avez terminé l'exercice.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

const WORDS_PER_EXERCISE = 5 // Nombre de mots par exercice

const loading = ref(true)
const words = ref([])
const score = ref(0)
const matches = ref(new Map())
const isDragging = ref(false)
const draggedId = ref(null)
const isDraggingOver = ref(null)
const showFeedback = ref(false)

const frenchWords = ref([])
const spanishWords = ref([])

const hasMatches = computed(() => matches.value.size > 0)
const isExerciseComplete = computed(() => score.value === words.value.length)

const feedbackMessage = computed(() => {
  if (isExerciseComplete.value) {
    return 'Parfait ! Vous avez trouvé toutes les correspondances !'
  }
  return `Vous avez trouvé ${score.value} correspondance${score.value > 1 ? 's' : ''}`
})

// Charger les mots depuis Supabase
async function loadWords() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('words')
      .select('id, fr, es')
      .limit(100) // Limiter pour de meilleures performances

    if (error) throw error

    // Mélanger et prendre un sous-ensemble de mots
    const shuffledWords = data.sort(() => Math.random() - 0.5)
    words.value = shuffledWords.slice(0, WORDS_PER_EXERCISE)

    // Préparer les mots pour l'affichage
    frenchWords.value = words.value.map(w => ({ ...w, matched: false }))
    spanishWords.value = [...words.value]
      .sort(() => Math.random() - 0.5)
      .map(w => ({ ...w, matched: false, matchedWith: null }))

  } catch (err) {
    console.error('Erreur lors du chargement des mots:', err)
  } finally {
    loading.value = false
  }
}

// Charger de nouveaux mots
async function loadNewWords() {
  score.value = 0
  matches.value.clear()
  showFeedback.value = false
  spanishWords.value.forEach(word => {
    word.matchedWith = null
  })
  await loadWords()
}

// Ajout d'une ref pour la position de la souris
const mousePosition = ref({ x: 0, y: 0 })

// Ajouter une ref pour le ghost element
const ghostElement = ref(null)

const handleDragStart = (event, word) => {
  if (word.matched) return
  
  isDragging.value = true
  draggedId.value = word.id
  
  // Créer un élément ghost personnalisé
  const ghost = event.target.cloneNode(true)
  ghost.style.position = 'fixed'
  ghost.style.top = '-1000px'
  ghost.style.opacity = '0.8'
  ghost.style.width = `${event.target.offsetWidth}px`
  ghost.style.transform = 'rotate(-2deg)'
  document.body.appendChild(ghost)
  ghostElement.value = ghost
  
  // Ajuster le point de saisie pour qu'il soit centré sur le curseur
  const rect = event.target.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  event.dataTransfer.setDragImage(ghost, centerX, centerY)
  event.dataTransfer.setData('text/plain', word.id)
  event.dataTransfer.effectAllowed = 'move'
  
  // Ajouter une classe au body pour le style du curseur
  document.body.classList.add('dragging')
}

const handleDragOver = (event, word) => {
  if (word.matched) return
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  // Mettre à jour la position de la souris
  mousePosition.value = { x: event.clientX, y: event.clientY }
}

const handleDragEnter = (event, word) => {
  if (word.matched) return
  event.preventDefault()
  isDraggingOver.value = word.id
}

const handleDragLeave = (event, word) => {
  // Vérifier si on quitte réellement l'élément et pas un de ses enfants
  const rect = event.currentTarget.getBoundingClientRect()
  const { x, y } = mousePosition.value
  
  if (
    x < rect.left ||
    x > rect.right ||
    y < rect.top ||
    y > rect.bottom
  ) {
    isDraggingOver.value = null
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedId.value = null
  isDraggingOver.value = null
  document.body.classList.remove('dragging')
  
  // Nettoyer l'élément ghost
  if (ghostElement.value) {
    document.body.removeChild(ghostElement.value)
    ghostElement.value = null
  }
}

const handleDrop = (event, targetWord) => {
  if (targetWord.matched) return
  
  const sourceId = parseInt(event.dataTransfer.getData('text/plain'))
  const sourceWord = frenchWords.value.find(w => w.id === sourceId)
  
  matches.value.set(sourceId, targetWord.id)
  targetWord.matchedWith = sourceWord.fr
  
  isDraggingOver.value = null
  isDragging.value = false
  draggedId.value = null
  
  // Ajouter un effet de succès
  const element = event.currentTarget
  element.classList.add('drop-success')
  setTimeout(() => {
    element.classList.remove('drop-success')
  }, 500)
}

const checkAnswers = () => {
  score.value = 0
  matches.value.forEach((targetId, sourceId) => {
    const frWord = frenchWords.value.find(w => w.id === sourceId)
    const esWord = spanishWords.value.find(w => w.id === targetId)
    const isCorrect = sourceId === targetId

    if (isCorrect) {
      score.value++
    }

    if (frWord) {
      frWord.matched = true
      frWord.isCorrect = isCorrect
    }
    if (esWord) {
      esWord.matched = true
      esWord.isCorrect = isCorrect
      esWord.matchedWith = frWord?.fr
    }
  })
  
  showFeedback.value = true

  // Animation de vérification
  const elements = document.querySelectorAll('.card')
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('checking')
      setTimeout(() => el.classList.remove('checking'), 500)
    }, index * 100)
  })
}

onMounted(() => {
  loadWords()
})
</script>

<style scoped>
.card {
  @apply relative;
}

/* Animation pour l'effet de scale */
.scale-105 {
  transition: transform 0.2s ease-in-out;
}

/* Animation pour l'indicateur de drop */
.ring-dashed {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Animation pour le badge */
.bg-green-500\/20 {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Styles pour le drag and drop */
.dragging {
  cursor: grabbing !important;
}

.drop-success {
  animation: dropSuccess 0.5s ease-out;
}

@keyframes dropSuccess {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Désactiver la sélection de texte pendant le drag */
.select-none {
  user-select: none;
  -webkit-user-select: none;
}

/* Animation de la zone de drop */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.2;
  }
}

/* Animation de vérification */
@keyframes checking {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.checking {
  animation: checking 0.5s ease-in-out;
}

/* Animation pour les indicateurs de résultat */
.text-green-400, .text-red-400 {
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Amélioration de l'effet de hover sur les cartes non matchées */
.card:not(.matched):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary), 0.2);
}

/* Animation de l'élément en cours de drag */
.dragging {
  animation: float 2s ease-in-out infinite;
  filter: brightness(1.1);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Animation de la zone de drop */
.drop-zone-active {
  animation: pulse-border 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--color-primary), 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(var(--color-primary), 0.2);
  }
}

/* Animation de succès pour le drop */
.drop-success {
  animation: success-bounce 0.5s cubic-bezier(0.36, 0, 0.66, -0.56);
}

@keyframes success-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05) rotate(2deg); }
}

/* Animation d'erreur pour le mauvais match */
.drop-error {
  animation: error-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes error-shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Amélioration du hover sur les cartes */
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:not(.matched):hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 16px rgba(var(--color-primary), 0.15);
}

/* Effet de brillance lors du drag */
.dragging::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  animation: shine 1.5s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

/* Animation pour le badge de correspondance */
.matched-badge {
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Amélioration de l'indicateur de drop */
.drop-indicator {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Animation de la bordure en pointillés */
@keyframes border-dance {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 100;
  }
}

.animate-border-dance {
  stroke-dasharray: 10;
  animation: border-dance 1s linear infinite;
}

/* Amélioration de la zone de drop */
.drop-indicator {
  animation: pulse-scale 1.5s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Effet de hover amélioré pour les zones de drop */
.card {
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(var(--color-primary), 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.card:hover::before {
  transform: translateX(100%);
}

/* Style pour l'élément en cours de drag */
.dragging {
  cursor: grabbing !important;
  pointer-events: none;
  transform-origin: center center;
}

/* Améliorer la visibilité pendant le drag */
[draggable="true"] {
  cursor: grab;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

[draggable="true"]:active {
  cursor: grabbing;
}

/* Style global pour le curseur pendant le drag */
body.dragging * {
  cursor: grabbing !important;
}

/* Style pour l'élément en cours de drag */
[draggable="true"] {
  cursor: grab;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style> 