<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-primary">Quiz de vocabulaire</h2>
      <div class="text-gray-300">
        Question {{ currentQuestionIndex + 1 }}/{{ exerciseData.questions.length }}
      </div>
    </div>

    <!-- Question courante -->
    <div v-if="currentQuestion" class="card p-6 space-y-6">
      <h3 class="text-xl text-gray-200">
        {{ currentQuestion.question }}
      </h3>

      <!-- Options de réponse -->
      <div class="space-y-3">
        <button
          v-for="option in currentQuestion.options"
          :key="option"
          @click="selectAnswer(option)"
          :class="[
            'w-full text-left p-4 rounded-lg transition-colors',
            getOptionClass(option)
          ]"
          :disabled="selectedAnswer !== null"
        >
          {{ option }}
        </button>
      </div>

      <!-- Feedback -->
      <div v-if="showFeedback" :class="[
        'p-4 rounded-lg text-center',
        isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      ]">
        <p class="text-xl font-bold">
          {{ isCorrect ? 'Bravo !' : 'Pas tout à fait...' }}
        </p>
        <p v-if="!isCorrect" class="mt-2">
          La bonne réponse était : {{ currentQuestion.correctAnswer }}
        </p>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between">
      <button
        v-if="currentQuestionIndex > 0"
        @click="previousQuestion"
        class="btn bg-gray-700 hover:bg-gray-600"
      >
        ← Question précédente
      </button>
      <div class="flex-grow"></div>
      <button
        v-if="selectedAnswer !== null && !isLastQuestion"
        @click="nextQuestion"
        class="btn btn-primary"
      >
        Question suivante →
      </button>
      <button
        v-if="selectedAnswer !== null && isLastQuestion"
        @click="finishQuiz"
        class="btn btn-primary"
      >
        Terminer le quiz
      </button>
    </div>

    <!-- Score final -->
    <div v-if="quizCompleted" class="card p-6 text-center space-y-4">
      <h3 class="text-2xl font-bold text-primary">Quiz terminé !</h3>
      <p class="text-xl text-gray-300">
        Votre score : {{ score }}/{{ exerciseData.questions.length }}
      </p>
      <button
        @click="resetQuiz"
        class="btn btn-primary"
      >
        Recommencer le quiz
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  exerciseData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])

const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showFeedback = ref(false)
const score = ref(0)
const quizCompleted = ref(false)
const answeredQuestions = ref(new Set())

const currentQuestion = computed(() => 
  props.exerciseData.questions[currentQuestionIndex.value]
)

const isLastQuestion = computed(() => 
  currentQuestionIndex.value === props.exerciseData.questions.length - 1
)

const isCorrect = computed(() => 
  selectedAnswer.value === currentQuestion.value?.correctAnswer
)

const getOptionClass = (option) => {
  if (selectedAnswer.value === null) {
    return 'bg-gray-700 hover:bg-gray-600'
  }
  if (option === currentQuestion.value.correctAnswer) {
    return 'bg-green-500/20 text-green-400'
  }
  if (option === selectedAnswer.value && !isCorrect.value) {
    return 'bg-red-500/20 text-red-400'
  }
  return 'bg-gray-700 opacity-50'
}

const selectAnswer = (answer) => {
  if (selectedAnswer.value !== null) return
  
  selectedAnswer.value = answer
  showFeedback.value = true
  
  if (isCorrect.value) {
    score.value++
  }
  
  answeredQuestions.value.add(currentQuestionIndex.value)
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < props.exerciseData.questions.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    showFeedback.value = false
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedAnswer.value = null
    showFeedback.value = false
  }
}

const finishQuiz = () => {
  quizCompleted.value = true
  emit('complete', { score: score.value })
}

const resetQuiz = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showFeedback.value = false
  score.value = 0
  quizCompleted.value = false
  answeredQuestions.value.clear()
}
</script> 