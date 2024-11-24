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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      profile.value = null
    } catch (error) {
      throw error
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
    fetchProfile
  }
}) 