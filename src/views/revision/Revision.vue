<template>
  <div class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center space-y-6 animate-fade-in">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
        Révisions de Mots
      </h1>
      <p class="text-xl text-gray-300 max-w-2xl mx-auto">
        Révisez votre vocabulaire en français et en espagnol
      </p>
      <p class="text-sm text-gray-400">
        {{ totalWords }} mots et expressions disponibles
      </p>
    </header>

    <div class="max-w-4xl mx-auto">
      <div class="flex justify-center gap-4 mb-8">
        <button 
          @click="currentLanguage = 'fr'"
          class="group relative px-8 py-3 rounded-xl overflow-hidden transition-all duration-300"
          :class="[
            currentLanguage === 'fr' 
              ? 'bg-gradient-to-r from-primary/40 to-purple-500/40 hover:from-primary/60 hover:to-purple-500/60 text-white border border-primary/40 hover:border-primary/60 shadow-lg shadow-primary/20' 
              : 'bg-gray-800/40 hover:bg-gray-700/40 border border-gray-700'
          ]"
        >
          <span class="relative z-10 text-white font-medium">Réviser l'espagnol</span>
        </button>
        <button 
          @click="currentLanguage = 'es'"
          class="group relative px-8 py-3 rounded-xl overflow-hidden transition-all duration-300"
          :class="[
            currentLanguage === 'es' 
              ? 'bg-gradient-to-r from-purple-500/20 to-secondary/20 hover:from-purple-500/30 hover:to-secondary/30 text-secondary border border-secondary/20 hover:border-secondary/40 shadow-lg shadow-secondary/20' 
              : 'bg-gray-800/40 hover:bg-gray-700/40 border border-gray-700'
          ]"
        >
          <span class="relative z-10">Réviser le français</span>
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <RevisionCard
          v-if="currentWord"
          :word="currentWord"
          :show-translation="showTranslation"
          :current-language="currentLanguage"
          @play-audio="playAudio"
          @toggle-translation="showTranslation = !showTranslation"
          @next-word="nextWord"
        />
      </transition>

      <div class="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button 
          @click="showLatestWords"
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Trier par date d'ajout
          </span>
        </button>
        <button 
          @click="shuffleWords"
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Mélanger les mots
          </span>
        </button>
      </div>

      <div class="mt-12 p-6 bg-gray-800/60 rounded-xl border border-gray-700">
        <h2 class="text-2xl font-semibold text-white mb-6">Mots révisés</h2>
        <div v-if="reviewedWords.length === 0" class="text-center text-gray-400 py-8">
          Aucun mot révisé pour le moment. Commencez à réviser pour voir apparaître les mots ici !
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(word, index) in reviewedWords" 
            :key="index"
            class="p-4 bg-gray-700/40 rounded-lg border border-gray-600 hover:border-primary/40 transition-all duration-300"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="text-green-400 font-medium">{{ word.fr }}</p>
                <p class="text-red-400">{{ word.es }}</p>
              </div>
              <button 
                v-if="word.audio?.fr || word.audio?.es"
                @click="playAudio(word.audio[currentLanguage])"
                class="p-2 rounded-full hover:bg-gray-600/50 transition-all"
              >
                🔊
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RevisionCard from '@/components/revision/RevisionCard.vue'
import { supabase } from '@/config/supabase'

const words = ref([])
const originalWords = ref([])
const loading = ref(true)
const error = ref(null)
const currentLanguage = ref('fr')
const currentWordIndex = ref(0)
const showTranslation = ref(false)
const reviewedWords = ref([])

const totalWords = computed(() => words.value.length)
const currentWord = computed(() => words.value[currentWordIndex.value])

async function loadWords() {
  try {
    loading.value = true
    const { data, error: supabaseError } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false })

    if (supabaseError) throw supabaseError

    originalWords.value = data.map(word => ({
      fr: word.fr,
      es: word.es,
      audio: {
        fr: word.audio_fr,
        es: word.audio_es
      },
      created_at: word.created_at
    }))

    words.value = [...originalWords.value].sort(() => Math.random() - 0.5)

  } catch (err) {
    console.error('Erreur lors du chargement des mots:', err)
    error.value = "Impossible de charger les mots"
  } finally {
    loading.value = false
  }
}

const playAudio = (audioPath) => {
  const audio = new Audio(audioPath)
  audio.play()
}

const nextWord = () => {
  if (currentWord.value && !reviewedWords.value.some(w => w.fr === currentWord.value.fr)) {
    reviewedWords.value.push(currentWord.value)
  }
  currentWordIndex.value = (currentWordIndex.value + 1) % words.value.length
  showTranslation.value = false
}

function showLatestWords() {
  words.value = [...originalWords.value].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  )
  currentWordIndex.value = 0
  showTranslation.value = false
}

function shuffleWords() {
  words.value = [...words.value].sort(() => Math.random() - 0.5)
  currentWordIndex.value = 0
  showTranslation.value = false
}

async function uploadAudio(file, wordId, language) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${wordId}-${language}.${fileExt}`
    const filePath = `${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-words')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('audio-words')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('words')
      .update({ 
        [`audio_${language}`]: publicUrl 
      })
      .eq('id', wordId)

    if (updateError) throw updateError

    return publicUrl
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    throw error
  }
}

const handleAudioUpload = async (event, wordId, language) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const audioUrl = await uploadAudio(file, wordId, language)
    await loadWords()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

onMounted(() => {
  loadWords()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 