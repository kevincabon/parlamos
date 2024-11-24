import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { supabase } from './config/supabase'

// Import des composants de pages
import Home from './views/Home.vue'
import Login from './views/auth/Login.vue'
import Register from './views/auth/Register.vue'
import DailyWords from './views/daily-words/DailyWords.vue'
import Pronunciation from './views/pronunciation/Pronunciation.vue'
import Spelling from './views/spelling/Spelling.vue'
import Revision from './views/revision/Revision.vue'
import Reading from './views/reading/Reading.vue'
import Exercises from './views/exercises/Exercises.vue'
import Profile from './views/auth/Profile.vue'
import ResetPassword from './views/auth/ResetPassword.vue'
import AdminDashboard from './views/admin/AdminDashboard.vue'
import Roadmap from './views/Roadmap.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, name: 'home' },
    { path: '/login', component: Login, name: 'login' },
    { path: '/register', component: Register, name: 'register' },
    { 
      path: '/mots-du-jour', 
      component: DailyWords, 
      name: 'daily-words',
      meta: { requiresAuth: true }
    },
    { 
      path: '/prononciation', 
      component: Pronunciation, 
      name: 'pronunciation',
      meta: { requiresAuth: true }
    },
    { 
      path: '/orthographe', 
      component: Spelling, 
      name: 'spelling',
      meta: { requiresAuth: true }
    },
    { 
      path: '/revisions', 
      component: Revision, 
      name: 'revision',
      meta: { requiresAuth: true }
    },
    { 
      path: '/lecture', 
      component: Reading, 
      name: 'reading',
      meta: { requiresAuth: true }
    },
    { 
      path: '/exercices', 
      component: Exercises, 
      name: 'exercises',
      meta: { requiresAuth: true }
    },
    { 
      path: '/profile', 
      component: Profile, 
      name: 'profile',
      meta: { requiresAuth: true }
    },
    {
      path: '/reset-password',
      component: ResetPassword,
      name: 'reset-password'
    },
    { 
      path: '/admin', 
      component: AdminDashboard, 
      name: 'admin',
      meta: { 
        requiresAuth: true,
        requiresAdmin: true 
      }
    },
    { 
      path: '/roadmap', 
      component: Roadmap, 
      name: 'roadmap'
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Attendre que l'auth soit initialisée
  if (authStore.loading) {
    // Attendre que l'initialisation soit terminée
    await authStore.initAuth()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }

  next()
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialiser l'auth avant de monter l'application
const authStore = useAuthStore()
await authStore.initAuth()

app.mount('#app') 