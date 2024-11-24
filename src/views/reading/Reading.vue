<template>
  <div class="space-y-8">
    <header class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-gradient">Lecture de Textes</h1>
      <p class="text-xl text-gray-300">
        Améliorez votre compréhension avec des textes bilingues
      </p>
    </header>

    <div class="max-w-4xl mx-auto">
      <!-- Contrôles de filtrage -->
      <div class="flex flex-wrap gap-4 mb-8">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un texte..."
          class="input flex-grow"
          @input="handleSearch"
        />
        <select 
          v-model="selectedLevel"
          class="input w-auto"
          @change="handleSearch"
        >
          <option value="">Tous les niveaux</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="advanced">Avancé</option>
        </select>

        <!-- Filtre admin pour les textes non publiés -->
        <select 
          v-if="isAdmin"
          v-model="publishedFilter"
          class="input w-auto"
          @change="handleSearch"
        >
          <option value="all">Tous les textes</option>
          <option value="published">Publiés</option>
          <option value="unpublished">Non publiés</option>
        </select>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="text-center text-red-500 py-12">
        {{ error }}
      </div>

      <!-- Liste des textes -->
      <div v-else>
        <div class="space-y-8">
          <TextCard
            v-for="text in texts"
            :key="text.id"
            :text="text"
            @play-audio="playAudio"
            @toggle-favorite="toggleFavorite"
            @add-comment="addComment"
            @delete-comment="deleteComment"
            @edit-comment="editComment"
            @update-text="updateText"
          />

          <!-- Pagination -->
          <div v-if="texts.length" class="flex justify-center gap-4">
            <button 
              @click="loadMore"
              class="btn btn-primary"
              :disabled="loading || !hasMore"
            >
              {{ loading ? 'Chargement...' : 'Charger plus' }}
            </button>
          </div>

          <!-- Aucun résultat -->
          <div v-if="!texts.length" class="text-center text-gray-400 py-12">
            Aucun texte trouvé
          </div>
        </div>
      </div>

      <!-- Bouton pour ajouter un nouveau texte (admin) -->
      <button 
        v-if="isAdmin"
        @click="showAddTextForm = true"
        class="fixed bottom-8 right-8 btn btn-primary rounded-full p-4 shadow-lg"
      >
        + Ajouter un texte
      </button>
    </div>

    <!-- Modal pour ajouter un texte -->
    <AddTextModal
      v-if="showAddTextForm"
      @close="showAddTextForm = false"
      @submit="addNewText"
    />

    <!-- Notification -->
    <Notification
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
    />

    <!-- ConfirmDialog -->
    <ConfirmDialog
      v-model="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :cancel-text="confirmDialog.cancelText"
      :type="confirmDialog.type"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/config/supabase'
import TextCard from '@/components/reading/TextCard.vue'
import AddTextModal from '@/components/reading/AddTextModal.vue'
import Notification from '@/components/common/Notification.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useConfirm } from '@/composables/useConfirm'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const texts = ref([])
const loading = ref(false)
const error = ref(null)
const showAddTextForm = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const searchQuery = ref('')
const selectedLevel = ref('')
const PAGE_SIZE = 10

const notification = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

const { confirm, confirmDialog, handleConfirm, handleCancel } = useConfirm()

const publishedFilter = ref('published') // Par défaut, afficher les textes publiés

async function fetchTexts(page = 1, append = false) {
  try {
    loading.value = true
    const offset = (page - 1) * PAGE_SIZE

    let query = supabase
      .from('reading_texts')
      .select(`
        *,
        comments:reading_comments_with_users(
          id,
          content,
          created_at,
          username,
          avatar_url,
          user_id
        )
      `)

    if (!isAdmin.value || publishedFilter.value === 'published') {
      query = query.eq('is_published', true)
    } else if (publishedFilter.value === 'unpublished') {
      query = query.eq('is_published', false)
    }

    if (searchQuery.value) {
      query = query.or(`title_fr.ilike.%${searchQuery.value}%,title_es.ilike.%${searchQuery.value}%,fr.ilike.%${searchQuery.value}%,es.ilike.%${searchQuery.value}%`)
    }

    if (selectedLevel.value) {
      query = query.eq('level', selectedLevel.value)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    const { data: textsData, error: textsError } = await query

    if (textsError) throw textsError

    if (append) {
      texts.value = [...texts.value, ...textsData]
    } else {
      texts.value = textsData
    }

    hasMore.value = textsData.length === PAGE_SIZE
  } catch (err) {
    error.value = "Erreur lors du chargement des textes"
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  currentPage.value = 1
  await fetchTexts(1, false)
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  currentPage.value++
  await fetchTexts(currentPage.value, true)
}

async function addNewText(textData) {
  try {
    loading.value = true
    const { data, error: uploadError } = await supabase
      .from('reading_texts')
      .insert([textData])
      .select()
      .single()

    if (uploadError) throw uploadError

    texts.value = [data, ...texts.value]
    showAddTextForm.value = false
  } catch (err) {
    error.value = "Erreur lors de l'ajout du texte"
  } finally {
    loading.value = false
  }
}

async function toggleFavorite(textId) {
  // Fonctionnalité à implémenter dans une future version
}

async function addComment(textId, comment) {
  try {
    if (!authStore.isAuthenticated) {
      notification.value = {
        show: true,
        type: 'info',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour commenter'
      }
      return
    }

    const { data: newComment, error: insertError } = await supabase
      .from('reading_comments')
      .insert([
        {
          text_id: textId,
          user_id: authStore.user.id,
          content: comment
        }
      ])
      .select()
      .single()

    if (insertError) throw insertError

    const { data: commentWithUser, error: viewError } = await supabase
      .from('reading_comments_with_users')
      .select('*')
      .eq('id', newComment.id)
      .single()

    if (viewError) throw viewError

    const text = texts.value.find(t => t.id === textId)
    if (text) {
      text.comments = [commentWithUser, ...(text.comments || [])]
    }

    notification.value = {
      show: true,
      type: 'success',
      title: 'Commentaire ajouté',
      message: 'Votre commentaire a été ajouté avec succès'
    }
  } catch (err) {
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors de l\'ajout du commentaire'
    }
  }
}

function playAudio(audioPath) {
  const audio = new Audio(audioPath)
  audio.play()
}

async function deleteComment(commentId) {
  try {
    // Vérifier que l'utilisateur est admin
    if (!isAdmin.value) {
      notification.value = {
        show: true,
        type: 'error',
        title: 'Erreur',
        message: 'Vous n\'avez pas les droits pour effectuer cette action'
      }
      return
    }

    // Demander confirmation avant de supprimer
    const confirmed = await confirm({
      title: 'Supprimer le commentaire',
      message: 'Êtes-vous sûr de vouloir supprimer ce commentaire ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    })

    if (!confirmed) return

    const { error: deleteError } = await supabase
      .from('reading_comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) throw deleteError

    // Mettre à jour l'interface utilisateur
    texts.value = texts.value.map(text => ({
      ...text,
      comments: text.comments?.filter(c => c.id !== commentId) || []
    }))

    notification.value = {
      show: true,
      type: 'success',
      title: 'Succès',
      message: 'Le commentaire a été supprimé avec succès'
    }
  } catch (err) {
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors de la suppression du commentaire'
    }
  }
}

async function editComment(commentId, newContent) {
  try {
    const { data, error } = await supabase
      .from('reading_comments')
      .update({ content: newContent })
      .eq('id', commentId)
      .select()
      .single()

    if (error) throw error

    // Mettre à jour le commentaire dans l'interface
    texts.value.forEach(text => {
      const comment = text.comments?.find(c => c.id === commentId)
      if (comment) {
        comment.content = newContent
      }
    })

    notification.value = {
      show: true,
      type: 'success',
      title: 'Commentaire modifié',
      message: 'Le commentaire a été modifié avec succès'
    }
  } catch (err) {
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors de la modification du commentaire'
    }
  }
}

async function updateText(updatedText) {
  try {
    const { data, error } = await supabase
      .from('reading_texts')
      .update(updatedText)
      .eq('id', updatedText.id)
      .select()
      .single()

    if (error) throw error

    // Mettre à jour le texte dans la liste locale
    const index = texts.value.findIndex(t => t.id === updatedText.id)
    if (index !== -1) {
      texts.value[index] = { ...texts.value[index], ...data }
    }

    notification.value = {
      show: true,
      type: 'success',
      title: 'Texte mis à jour',
      message: 'Le texte a été modifié avec succès'
    }
  } catch (err) {
    notification.value = {
      show: true,
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors de la mise à jour du texte'
    }
  }
}

onMounted(() => {
  fetchTexts()
})
</script> 