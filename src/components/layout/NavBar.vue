<template>
  <nav class="bg-gray-900 md:bg-gray-900/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-[100]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo et navigation principale -->
        <div class="flex items-center flex-shrink-0">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span class="text-sm font-bold text-white">P</span>
            </div>
            <span class="text-lg font-bold text-white hidden sm:block">Parlamos</span>
          </router-link>
        </div>

        <!-- Bouton menu mobile -->
        <div class="flex items-center md:hidden">
          <button
            @click="isOpen = !isOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            aria-expanded="false"
          >
            <span class="sr-only">Ouvrir le menu</span>
            <svg
              class="h-6 w-6 transition-transform duration-300"
              :class="{ 'rotate-180': isOpen }"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="!isOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Navigation desktop -->
        <div class="hidden md:flex md:items-center md:space-x-4">
          <!-- Navigation items -->
          <div class="flex space-x-4">
            <Menu v-for="group in filteredNavItems" :key="group.name" as="div" class="relative inline-block text-left">
              <div>
                <MenuButton
                  class="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
                >
                  {{ group.name }}
                </MenuButton>
              </div>

              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems
                  class="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                >
                  <div class="py-1">
                    <MenuItem v-for="item in group.items" :key="item.path" v-slot="{ active }">
                      <router-link
                        :to="item.path"
                        :class="[
                          active ? 'bg-gray-700 text-white' : 'text-gray-300',
                          'block px-4 py-2 text-sm flex items-center justify-between'
                        ]"
                      >
                        {{ item.name }}
                        <span 
                          v-if="item.beta"
                          class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        >
                          beta
                        </span>
                        <span 
                          v-if="item.soon"
                          class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                          soon
                        </span>
                      </router-link>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- Profil et déconnexion -->
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <router-link 
              to="/profile"
              class="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div class="w-7 h-7 rounded-full bg-gray-700 ring-2 ring-primary/20 flex items-center justify-center overflow-hidden">
                <img
                  v-if="profile?.avatar_url"
                  :src="profile.avatar_url"
                  :alt="profile?.username"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-sm font-medium">
                  {{ profile?.username?.[0]?.toUpperCase() }}
                </span>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-200">{{ profile?.username }}</span>
                <span v-if="isAdmin" class="text-xs text-yellow-500">Admin</span>
                <span v-else-if="isVip" class="text-xs text-purple-500">VIP</span>
              </div>
            </router-link>

            <button
              @click="handleLogout"
              class="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-red-500/10 text-gray-300 hover:text-red-500 transition-all duration-300"
            >
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <!-- Boutons de connexion -->
          <div v-else class="flex items-center space-x-4">
            <router-link 
              to="/login"
              class="text-sm font-medium text-gray-300 hover:text-white"
            >
              Se connecter
            </router-link>
            <router-link 
              to="/register"
              class="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:opacity-90"
            >
              S'inscrire
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu mobile -->
    <TransitionRoot appear :show="isOpen" as="template">
      <div class="fixed inset-0 z-40 md:hidden">
        <!-- Fond sombre -->
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div 
            class="fixed inset-0 bg-black/80"
            @click="isOpen = false"
          ></div>
        </TransitionChild>

        <!-- Menu -->
        <TransitionChild
          as="template"
          enter="transform transition ease-in-out duration-300"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transform transition ease-in-out duration-300"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <div class="relative">
            <div class="fixed right-0 w-full max-w-sm bg-gray-900/95 shadow-xl">
              <!-- En-tête du menu mobile -->
              <div class="px-4 py-4 border-b border-gray-800">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <router-link 
                      v-if="isAuthenticated" 
                      to="/profile"
                      class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                      @click="isOpen = false"
                    >
                      <div class="w-10 h-10 rounded-full bg-gray-700 ring-2 ring-primary/20 flex items-center justify-center overflow-hidden">
                        <img
                          v-if="profile?.avatar_url"
                          :src="profile.avatar_url"
                          :alt="profile?.username"
                          class="w-full h-full object-cover"
                        />
                        <span v-else class="text-lg font-medium">
                          {{ profile?.username?.[0]?.toUpperCase() }}
                        </span>
                      </div>
                      <div class="flex flex-col">
                        <span class="font-medium text-white">{{ profile?.username }}</span>
                        <span v-if="isAdmin" class="text-xs text-yellow-500">Admin</span>
                        <span v-else-if="isVip" class="text-xs text-purple-500">VIP</span>
                      </div>
                    </router-link>
                  </div>
                  <button 
                    @click="isOpen = false"
                    class="rounded-md p-2 text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Remplacer la section "Liste des liens" dans le menu mobile -->
              <div class="px-2 py-3 space-y-4">
                <div v-for="group in filteredNavItems" :key="group.name" class="space-y-2">
                  <!-- Titre du groupe -->
                  <div class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {{ group.name }}
                  </div>
                  
                  <!-- Liens du groupe -->
                  <div class="space-y-1">
                    <router-link
                      v-for="item in group.items"
                      :key="item.path"
                      :to="item.path"
                      class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      :class="[
                        isCurrentRoute(item.path)
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      ]"
                      @click="isOpen = false"
                    >
                      <div class="flex items-center justify-between">
                        <span>{{ item.name }}</span>
                        <span 
                          v-if="item.beta"
                          class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        >
                          beta
                        </span>
                        <span 
                          v-if="item.soon"
                          class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                          soon
                        </span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Footer du menu mobile -->
              <div class="border-t border-gray-800 px-4 py-4">
                <div v-if="isAuthenticated">
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-red-400 hover:bg-gray-800"
                  >
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Se déconnecter</span>
                  </button>
                </div>
                <div v-else class="flex flex-col space-y-2">
                  <router-link
                    to="/login"
                    class="w-full text-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800"
                    @click="isOpen = false"
                  >
                    Se connecter
                  </router-link>
                  <router-link
                    to="/register"
                    class="w-full text-center px-4 py-2 rounded-md bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                    @click="isOpen = false"
                  >
                    S'inscrire
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const profile = computed(() => authStore.profile)
const loading = computed(() => authStore.loading)
const isAdmin = computed(() => authStore.isAdmin)
const isVip = computed(() => profile.value?.role === 'vip')

const navItems = [
  {
    name: 'Apprentissage',
    items: [
      { path: '/mots-du-jour', name: 'Mots du jour' },
      { path: '/prononciation', name: 'Prononciation', beta: true },
      { path: '/orthographe', name: 'Orthographe', soon: true },
    ]
  },
  {
    name: 'Pratique',
    items: [
      { path: '/revisions', name: 'Révisions' },
      { path: '/exercices', name: 'Exercices', beta: true },
    ]
  },
  {
    name: 'Ressources',
    items: [
      { path: '/lecture', name: 'Lecture' },
    ]
  },
  {
    name: 'Administration',
    adminOnly: true,
    items: [
      { path: '/admin', name: 'Dashboard Admin' },
    ]
  }
]

const filteredNavItems = computed(() => {
  return navItems.filter(group => !group.adminOnly || (group.adminOnly && isAdmin.value))
})

const isCurrentRoute = (path) => {
  return route.path === path
}

async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script>

<style scoped>
.router-link-active {
  @apply text-white;
}

/* Animation de l'indicateur de route active */
.router-link-active::after {
  content: '';
  @apply absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Animation pour l'icône de déconnexion */
.group:hover svg {
  @apply text-red-500;
}

/* Animation pour le menu burger */
.rotate-enter-active,
.rotate-leave-active {
  transition: transform 0.3s ease-in-out;
}

.rotate-enter-from,
.rotate-leave-to {
  transform: rotate(-180deg);
}

/* Style pour le menu mobile */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease-out;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Amélioration de l'animation du menu burger */
.menu-icon {
  transition: transform 0.3s ease;
}

.menu-icon.open {
  transform: rotate(180deg);
}

/* Animation pour le badge Beta */
.group:hover .bg-yellow-500\/10 {
  @apply bg-yellow-500/20;
  transition: background-color 0.3s ease;
}

/* Ajoutez ces styles pour améliorer les transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Style pour les badges Beta */
.beta-badge {
  @apply inline-flex items-center;
  font-size: 0.625rem; /* 10px */
  line-height: 1;
}

/* Animation hover pour les badges Beta */
.beta-badge:hover {
  @apply bg-yellow-500/15;
  transition: all 0.2s ease;
}
</style> 