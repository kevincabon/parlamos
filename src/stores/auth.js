import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/config/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isVip = computed(() => profile.value?.role === 'vip')

  // Initialiser l'état d'authentification
  async function initAuth() {
    try {
      // Éviter les initialisations multiples
      if (initialized.value) return

      loading.value = true
      
      // Récupérer la session active
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        user.value = session.user
        await fetchProfile(session.user.id)
      }

      // Écouter les changements d'auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        user.value = session?.user || null
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          profile.value = null
        }
      })

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth:', error)
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      profile.value = data
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
    }
  }

  // Autres fonctions existantes (login, logout, etc.)
  async function login(email, password) {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      user.value = data.user
      await fetchProfile(data.user.id)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      
      // Vérifier d'abord s'il y a une session active
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Si pas de session, réinitialiser l'état local sans appeler signOut
        user.value = null
        profile.value = null
        return
      }
      
      // Si une session existe, procéder à la déconnexion
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      profile.value = null
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Réinitialiser quand même l'état local en cas d'erreur
      user.value = null
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, username) {
    try {
      loading.value = true

      // Créer l'utilisateur avec les métadonnées username
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username // Stocké dans raw_user_meta_data
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (!data?.user) {
        throw new Error('Erreur lors de la création de l\'utilisateur')
      }

      return { 
        data, 
        error: null,
        message: 'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.'
      }

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      return { 
        data: null, 
        error: error.message || 'Une erreur est survenue lors de l\'inscription'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isVip,
    initAuth,
    login,
    logout,
    fetchProfile,
    register
  }
}) 