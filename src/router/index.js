import { createRouter, createWebHistory } from 'vue-router'
// ... autres imports ...
import Roadmap from '@/views/Roadmap.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ... autres routes ...
    { 
      path: '/roadmap', 
      component: Roadmap, 
      name: 'roadmap'
    },
    // ... autres routes ...
  ]
})

// ... reste du code ... 