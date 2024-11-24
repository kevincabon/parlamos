<template>
  <div class="card hover:shadow-xl transition-shadow">
    <div class="p-6 space-y-6">
      <!-- En-tête avec les métadonnées -->
      <div class="flex justify-between items-start">
        <!-- Métadonnées -->
        <div class="flex items-center space-x-4">
          <!-- Niveau (seulement si défini) -->
          <span 
            v-if="text?.level"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="{
              'bg-green-500/10 text-green-400 ring-1 ring-green-400/30': text.level === 'A1',
              'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-400/30': text.level === 'A2',
              'bg-red-500/10 text-red-400 ring-1 ring-red-400/30': text.level === 'advanced'
            }"
          >
            {{ getLevelLabel(text.level) }}
          </span>

          <!-- Source et auteur -->
          <div class="flex items-center space-x-2 text-sm text-gray-400">
            <span v-if="text?.author" class="font-medium">{{ text.author }}</span>
            <span v-if="text?.author && text?.source" class="text-gray-600">•</span>
            <span v-if="text?.source" class="italic">{{ text.source }}</span>
          </div>
        </div>

        <!-- Indicateur de statut de publication pour les admins -->
        <div v-if="isAdmin" class="flex items-center space-x-2">
          <span 
            :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              text.is_published 
                ? 'bg-green-500/10 text-green-400 ring-1 ring-green-400/30'
                : 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-400/30'
            ]"
          >
            {{ text.is_published ? 'Publié' : 'Brouillon' }}
          </span>
          <button 
            v-if="isAdmin"
            @click="showEditModal = true"
            class="btn bg-gray-700 hover:bg-gray-600"
            title="Modifier le texte"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Reste du contenu (onglets, texte, etc.) -->
      <div class="space-y-6">
        <!-- Onglets -->
        <div class="flex space-x-4 border-b border-gray-700">
          <button 
            @click="activeLanguage = 'fr'"
            class="px-4 py-2 font-medium transition-colors relative"
            :class="[
              activeLanguage === 'fr' 
                ? 'text-green-500' 
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            Français
            <!-- Indicateur d'onglet actif -->
            <div 
              v-if="activeLanguage === 'fr'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
            />
          </button>
          <button 
            @click="activeLanguage = 'es'"
            class="px-4 py-2 font-medium transition-colors relative"
            :class="[
              activeLanguage === 'es' 
                ? 'text-red-500' 
                : 'text-gray-400 hover:text-gray-200'
            ]"
          >
            Español
            <!-- Indicateur d'onglet actif -->
            <div 
              v-if="activeLanguage === 'es'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
            />
          </button>
        </div>

        <!-- Contenu du texte -->
        <div class="space-y-4">
          <!-- Titre du texte dans la langue active -->
          <h3 v-if="text?.[`title_${activeLanguage}`]" class="text-xl font-bold" :class="activeLanguage === 'fr' ? 'text-green-500' : 'text-red-500'">
            {{ text[`title_${activeLanguage}`] }}
          </h3>

          <div class="flex justify-end">
            <button 
              v-if="text?.[`audio_${activeLanguage}`]"
              @click="$emit('play-audio', text[`audio_${activeLanguage}`])"
              class="btn bg-gray-700 hover:bg-gray-600"
            >
              🔊
            </button>
          </div>
          
          <p class="text-gray-300" v-html="text?.[activeLanguage]"></p>
        </div>
      </div>

      <!-- Section Commentaires -->
      <div class="pt-4 border-t border-gray-700">
        <!-- En-tête avec bouton pour afficher/masquer -->
        <div class="flex items-center mb-4">
          <button 
            @click="showComments = !showComments"
            class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <h4 class="font-semibold">
              Commentaires ({{ text.comments?.length || 0 }})
            </h4>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5 transform transition-transform duration-200"
              :class="{ 'rotate-180': showComments }"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fill-rule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clip-rule="evenodd" 
              />
            </svg>
          </button>
        </div>

        <!-- Liste des commentaires (visible uniquement si showComments est true) -->
        <div v-show="showComments" class="space-y-4">
          <!-- Bouton pour ajouter un commentaire en haut -->
          <button 
            v-if="!showTopCommentForm"
            @click="openTopCommentForm"
            class="w-full py-2 text-primary hover:text-primary-dark text-center border border-dashed border-gray-600 rounded-lg hover:border-primary/50 transition-colors"
          >
            Ajouter un commentaire
          </button>

          <!-- Formulaire de commentaire en haut -->
          <div v-if="showTopCommentForm" class="mb-4">
            <textarea
              v-model="topCommentText"
              rows="3"
              class="input w-full"
              placeholder="Votre commentaire..."
            ></textarea>
            <div class="flex justify-end mt-2 space-x-2">
              <button 
                @click="closeAllCommentForms"
                class="btn bg-gray-700 hover:bg-gray-600"
              >
                Annuler
              </button>
              <button 
                @click="submitComment('top')"
                class="btn btn-primary"
                :disabled="!topCommentText.trim()"
              >
                Envoyer
              </button>
            </div>
          </div>

          <!-- Liste des commentaires -->
          <div v-if="text.comments?.length" class="space-y-4">
            <div 
              v-for="comment in text.comments" 
              :key="comment.id"
              class="bg-gray-700/30 rounded-lg p-4 space-y-2"
            >
              <div class="flex justify-between items-start">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="comment.avatar_url"
                      :src="comment.avatar_url"
                      :alt="comment.username"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-lg">
                      {{ comment.username?.[0]?.toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-200">
                      {{ comment.username || 'Utilisateur inconnu' }}
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ formatDate(comment.created_at) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <!-- Bouton d'édition -->
                  <button 
                    v-if="canEditComment(comment)"
                    @click="startEditingComment(comment)"
                    class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                    title="Modifier le commentaire"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Bouton de suppression -->
                  <button 
                    v-if="isAdmin"
                    @click="handleDeleteComment(comment.id)"
                    class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Supprimer le commentaire"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Contenu du commentaire -->
              <div v-if="!isEditingComment(comment.id)" class="text-gray-300 ml-10">
                {{ comment.content }}
              </div>

              <!-- Formulaire d'édition -->
              <div v-else class="ml-10">
                <textarea
                  v-model="editedContent"
                  rows="3"
                  class="input w-full"
                  placeholder="Votre commentaire..."
                ></textarea>
                <div class="flex justify-end mt-2 space-x-2">
                  <button 
                    @click="cancelEditing"
                    class="btn bg-gray-700 hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button 
                    @click="saveEdit(comment)"
                    class="btn btn-primary"
                    :disabled="!editedContent.trim() || editedContent === comment.content"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>

            <!-- Bouton et formulaire de commentaire en bas (si 5+ commentaires) -->
            <div v-if="text.comments.length >= 5" class="mt-6">
              <button 
                v-if="!showBottomCommentForm"
                @click="openBottomCommentForm"
                class="w-full py-2 text-primary hover:text-primary-dark text-center border border-dashed border-gray-600 rounded-lg hover:border-primary/50 transition-colors"
              >
                Ajouter un commentaire
              </button>
              <div v-else class="space-y-2">
                <textarea
                  v-model="bottomCommentText"
                  rows="3"
                  class="input w-full"
                  placeholder="Votre commentaire..."
                ></textarea>
                <div class="flex justify-end space-x-2">
                  <button 
                    @click="closeAllCommentForms"
                    class="btn bg-gray-700 hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button 
                    @click="submitComment('bottom')"
                    class="btn btn-primary"
                    :disabled="!bottomCommentText.trim()"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si aucun commentaire -->
          <div v-else class="text-center text-gray-400 py-4">
            Aucun commentaire pour le moment
          </div>
        </div>
      </div>
    </div>
  </div>

  <EditTextModal
    v-if="showEditModal"
    :text="text"
    @close="showEditModal = false"
    @update="handleTextUpdate"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import EditTextModal from './EditTextModal.vue'

const props = defineProps({
  text: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits([
  'play-audio', 
  'toggle-favorite', 
  'update-text',
  'add-comment',
  'edit-comment',
  'delete-comment'
])
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const activeLanguage = ref('fr')
const showEditModal = ref(false)
const showComments = ref(false)
const showTopCommentForm = ref(false)
const showBottomCommentForm = ref(false)
const topCommentText = ref('')
const bottomCommentText = ref('')
const editingCommentId = ref(null)
const editedContent = ref('')

function getLevelLabel(level) {
  if (!level) return ''
  const labels = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé'
  }
  return labels[level] || level
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function canEditComment(comment) {
  if (!authStore.user) return false
  
  const isCommentAuthor = comment.user_id === authStore.user.id
  const commentAge = Date.now() - new Date(comment.created_at).getTime()
  const twoMinutes = 2 * 60 * 1000 // 2 minutes en millisecondes
  
  return isCommentAuthor && commentAge < twoMinutes
}

function isEditingComment(commentId) {
  return editingCommentId.value === commentId
}

function startEditingComment(comment) {
  editingCommentId.value = comment.id
  editedContent.value = comment.content
}

function cancelEditing() {
  editingCommentId.value = null
  editedContent.value = ''
}

function saveEdit(comment) {
  emit('edit-comment', comment.id, editedContent.value)
  editingCommentId.value = null
  editedContent.value = ''
}

function submitComment(position) {
  const commentText = position === 'top' ? topCommentText : bottomCommentText
  if (commentText.value.trim()) {
    emit('add-comment', props.text.id, commentText.value)
    if (position === 'top') {
      topCommentText.value = ''
      showTopCommentForm.value = false
    } else {
      bottomCommentText.value = ''
      showBottomCommentForm.value = false
    }
  }
}

function handleTextUpdate(updatedText) {
  emit('update-text', updatedText)
  showEditModal.value = false
}

// Fonction pour gérer la suppression d'un commentaire
function handleDeleteComment(commentId) {
  emit('delete-comment', commentId)
}

// Fonctions pour gérer les formulaires de commentaires
function openTopCommentForm() {
  closeAllCommentForms()
  showTopCommentForm.value = true
}

function openBottomCommentForm() {
  closeAllCommentForms()
  showBottomCommentForm.value = true
}

function closeAllCommentForms() {
  showTopCommentForm.value = false
  showBottomCommentForm.value = false
  topCommentText.value = ''
  bottomCommentText.value = ''
}
</script> 