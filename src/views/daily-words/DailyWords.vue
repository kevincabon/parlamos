<template>
  <div class="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


    <!-- En-tête -->


    <header class="text-center space-y-6">


      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
        Mots et Citations du Jour
      </h1>


      <p class="text-xl text-gray-300 max-w-2xl mx-auto">
        Découvrez chaque jour de nouveaux mots et citations en français et espagnol
      </p>


      <button @click="copyDailyContent" class="mt-4 group relative px-6 py-2 rounded-full overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 hover:border-primary/40 transition-all duration-500">


        <div class="relative flex items-center space-x-2">


          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>


          <span class="font-medium text-primary">Copier le contenu du jour</span>


        </div>


      </button>


      
      <!-- Bouton Admin -->


      <div v-if="isAdmin" class="flex justify-center">


        <button
          @click="generateNewContent"
          class="group relative px-8 py-3 rounded-full overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 hover:border-primary/40 transition-all duration-500"
          :disabled="generating"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative flex items-center space-x-3">
            <svg 
              v-if="generating"
              class="animate-spin h-5 w-5 text-primary" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 transform transition-transform group-hover:rotate-180 duration-500 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span class="font-medium text-primary">
              {{ generating ? 'Génération...' : 'Générer du nouveau contenu' }}
            </span>
          </div>
        </button>
      </div>
    </header>


    <!-- Notification -->


    <Notification
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
    />


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


    <!-- Contenu principal -->


    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <DailyWord 
        v-if="dailyWord"
        :word="dailyWord" 
        @like="handleLike('word', dailyWord.id)" 
        @save="handleSave('word', dailyWord.id)"
        @update="handleUpdate"
      />


      <DailyQuote 
        v-if="dailyQuote"
        :quote="dailyQuote"
        @like="handleLike('quote', dailyQuote.id)"
        @save="handleSave('quote', dailyQuote.id)"
      />
    </div>


    <!-- Section Historique -->


    <HistorySection 
      v-if="previousWords.length > 0 || previousQuotes.length > 0"
      :words="previousWords"
      :quotes="previousQuotes"
      @load-more="loadMore"
      :has-more="hasMore"
      :loading="loadingMore"
    />
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/auth'
import DailyWord from '@/components/daily-words/DailyWord.vue'
import DailyQuote from '@/components/daily-words/DailyQuote.vue'
import HistorySection from '@/components/daily-words/HistorySection.vue'
import Notification from '@/components/common/Notification.vue'


const loading = ref(true)


const error = ref(null)


const loadingMore = ref(false)


const dailyWord = ref(null)


const dailyQuote = ref(null)


const previousWords = ref([])


const previousQuotes = ref([])


const hasMore = ref(true)


const currentPage = ref(1)


const PAGE_SIZE = 10


const authStore = useAuthStore()


const isAdmin = computed(() => authStore.isAdmin)


const generating = ref(false)


const notification = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})


async function fetchTodayContent() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const userId = authStore.user?.id


    // D'abord récupérer le mot du jour
    const { data: word, error: wordError } = await supabase
      .from('daily_words')
      .select('*')
      .eq('date', today)
      .single()


    if (wordError && !wordError.message.includes('No rows found')) {
      throw wordError
    }


    // Ensuite vérifier si l'utilisateur a liké ce mot
    if (word && userId) {
      const { data: likes } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('content_type', 'word')
        .eq('content_id', word.id)
        .single()


      dailyWord.value = { ...word, liked: !!likes }
    } else {
      dailyWord.value = word || null
    }


    // Même chose pour la citation
    const { data: quote, error: quoteError } = await supabase
      .from('daily_quotes')
      .select('*')
      .eq('date', today)
      .single()


    if (quoteError && !quoteError.message.includes('No rows found')) {
      throw quoteError
    }


    // Vérifier si l'utilisateur a liké cette citation
    if (quote && userId) {
      const { data: likes } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('content_type', 'quote')
        .eq('content_id', quote.id)
        .single()


      dailyQuote.value = { ...quote, liked: !!likes }
    } else {
      dailyQuote.value = quote || null
    }


  } catch (err) {
    error.value = "Erreur lors du chargement du contenu du jour"
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}


async function fetchHistory() {
  try {
    loadingMore.value = true
    const offset = (currentPage.value - 1) * PAGE_SIZE


    // Récupérer l'historique des mots
    const { data: words, error: wordsError } = await supabase
      .from('daily_words')
      .select('*')
      .order('date', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)


    if (wordsError) throw wordsError
    previousWords.value = [...previousWords.value, ...(words || [])]


    // Récupérer l'historique des citations
    const { data: quotes, error: quotesError } = await supabase
      .from('daily_quotes')
      .select('*')
      .order('date', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)


    if (quotesError) throw quotesError
    previousQuotes.value = [...previousQuotes.value, ...(quotes || [])]


    hasMore.value = (words?.length === PAGE_SIZE) || (quotes?.length === PAGE_SIZE)
  } catch (err) {
    error.value = "Erreur lors du chargement de l'historique"
    console.error('Erreur:', err)
  } finally {
    loadingMore.value = false
  }
}


async function handleLike(type, id) {
  try {
    if (!authStore.isAuthenticated) {
      notification.value = {
        show: true,
        type: 'info',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour liker'
      }
      return
    }


    const { data, error } = await supabase
      .rpc('handle_like', {
        p_user_id: authStore.user.id,
        p_content_type: type === 'word' ? 'word' : 'quote',
        p_content_id: id
      })


    if (error) throw error


    // Mettre à jour l'état local
    if (type === 'word') {
      dailyWord.value = { 
        ...dailyWord.value, 
        likes: data.likes,
        liked: data.liked
      }
    } else {
      dailyQuote.value = { 
        ...dailyQuote.value, 
        likes: data.likes,
        liked: data.liked
      }
    }


    // Notification de succès
    notification.value = {
      show: true,
      type: 'success',
      title: data.liked ? 'Like ajouté' : 'Like retiré',
      message: data.liked ? 'Merci pour votre like !' : 'Like retiré avec succès'
    }


    setTimeout(() => {
      notification.value.show = false
    }, 3000)
  } catch (err) {
    console.error('Erreur lors du like:', err)
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors du like'
    }
  }
}


async function handleSave(type, id) {
  try {
    const userId = authStore.user?.id
    if (!userId) {
      notification.value = {
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Vous devez être connecté pour sauvegarder un mot'
      }
      return
    }


    const { data, error } = await supabase.rpc('handle_content_action', {
      p_user_id: userId,
      p_content_type: type,
      p_content_id: id,
      p_action_type: 'save'
    })


    if (error) throw error


    // Mettre à jour l'état local
    if (type === 'word') {
      dailyWord.value.saved = data.saved
    } else {
      dailyQuote.value.saved = data.saved
    }


    notification.value = {
      show: true,
      type: 'success',
      title: 'Succès',
      message: data.saved ? 'Contenu ajouté aux favoris' : 'Contenu retiré des favoris'
    }


    setTimeout(() => {
      notification.value.show = false
    }, 3000)


  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de sauvegarder le contenu'
    }
  }
}


async function checkSavedWords() {
  try {
    const userId = authStore.user?.id
    if (!userId) return


    const { data: savedWords, error } = await supabase
      .from('saved_words')
      .select('word_id')
      .eq('user_id', userId)


    if (error) throw error


    const savedWordIds = savedWords.map(sw => sw.word_id)


    // Mettre à jour l'état des mots
    if (dailyWord.value) {
      dailyWord.value.saved = savedWordIds.includes(dailyWord.value.id)
    }
    if (dailyQuote.value) {
      dailyQuote.value.saved = savedWordIds.includes(dailyQuote.value.id)
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des mots sauvegardés:', error)
  }
}


function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  currentPage.value++
  fetchHistory()
}


async function generateNewContent() {
  try {
    generating.value = true


    // Appeler la fonction RPC de Supabase
    const { error } = await supabase.rpc('generate_daily_word')


    if (error) throw error


    // Recharger le contenu
    await fetchTodayContent()


    // Afficher la notification de succès
    notification.value = {
      show: true,
      type: 'success',
      title: 'Contenu généré',
      message: 'Le nouveau contenu a été généré avec succès'
    }


    // Cacher la notification après 5 secondes
    setTimeout(() => {
      notification.value.show = false
    }, 5000)
  } catch (err) {
    console.error('Erreur lors de la génération:', err)
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors de la génération du contenu'
    }
  } finally {
    generating.value = false
  }
}


async function copyDailyContent() {
  try {
    // Formater la date espagnole avec majuscules
    const dateEs = new Date(dailyWord.value.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').replace(/De /g, 'De ')

    // Formater la date française
    const dateFr = new Date(dailyWord.value.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const content = [
      dateEs,
      '',
      dateFr,
      '',
      '',
      `${dailyWord.value.es} - ${dailyWord.value.fr}`,
      '',
      '',
      dailyWord.value.example_es || '',
      '',
      dailyWord.value.example_fr || '',
      '',
      '',
      dailyQuote.value.es,
      '',
      dailyQuote.value.fr,
      '',
      '',
      `— ${dailyQuote.value.author} (${dailyQuote.value.dates})`,
      '',
      `${dailyQuote.value.profession} (${dailyQuote.value.profession_fr})`
    ].filter(line => line !== '').join('\n')

    await navigator.clipboard.writeText(content)
    notification.value = {
      show: true,
      type: 'success',
      title: 'Copié !',
      message: 'Le contenu du jour a été copié dans le presse-papiers'
    }
    setTimeout(() => {
      notification.value.show = false
    }, 3000)
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de copier le contenu'
    }
  }
}


async function handleUpdate(updatedWord) {
  // Mettre à jour le mot dans la liste
  dailyWord.value = updatedWord
}


onMounted(async () => {
  await fetchTodayContent()
  await fetchHistory()
  await checkSavedWords()
})
</script>