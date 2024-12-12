<template>
  <div class="card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Utilisateurs</h2>
    </div>

    <!-- Table des utilisateurs -->
    <div class="overflow-x-auto">
      <div class="max-h-[400px] overflow-y-auto">
        <table class="w-full">
          <thead class="sticky top-0 bg-gray-800 z-10">
            <tr>
              <th class="text-left p-2">Email</th>
              <th class="text-left p-2">Nom d'utilisateur</th>
              <th class="text-left p-2">Rôle</th>
              <th class="text-left p-2">Inscription</th>
              <th class="text-left p-2">Dernière connexion</th>
              <th class="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-t">
              <td class="p-2">{{ user.email }}</td>
              <td class="p-2">{{ user.username }}</td>
              <td class="p-2">
                <select 
                  v-model="user.role"
                  @change="updateUserRole(user.id, $event.target.value)"
                  class="bg-gray-700 text-white rounded px-2 py-1"
                >
                  <option value="user">Utilisateur</option>
                  <option value="vip">VIP</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td class="p-2">{{ formatDate(user.created_at) }}</td>
              <td class="p-2">{{ formatDate(user.last_sign_in_at) || 'Jamais' }}</td>
              <td class="p-2">
                <div class="flex gap-2">
                  <button 
                    @click="deleteUser(user.id)"
                    class="btn btn-sm text-red-500"
                    :disabled="user.id === currentUserId"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const emit = defineEmits(['update-stats'])
const users = ref([])
const currentUserId = ref(null)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  currentUserId.value = session?.user?.id
  await loadUsers()
})

async function loadUsers() {
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    const { data: authUsers, error: authError } = await supabase
      .rpc('get_users')

    if (authError) throw authError

    users.value = profiles.map(profile => ({
      ...profile,
      email: authUsers.find(u => u.id === profile.id)?.email || 'Email non disponible',
      last_sign_in_at: authUsers.find(u => u.id === profile.id)?.last_sign_in_at
    }))

  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les utilisateurs',
      life: 3000
    })
  }
}

async function updateUserRole(userId, newRole) {
  try {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (updateError) throw updateError

    // Mettre à jour localement l'utilisateur dans le tableau
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }

    // Si l'utilisateur modifié est l'utilisateur courant, rafraîchir son profil
    if (userId === currentUserId.value) {
      const authStore = useAuthStore()
      await authStore.fetchProfile(userId)
    }

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Rôle mis à jour avec succès',
      life: 3000
    })

    emit('update-stats')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de mettre à jour le rôle',
      life: 3000
    })
    await loadUsers() // Recharger en cas d'erreur
  }
}

async function deleteUser(userId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
  if (userId === currentUserId.value) return

  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error

    await loadUsers()
    emit('update-stats')
    
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Utilisateur supprimé avec succès',
      life: 3000
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de supprimer l\'utilisateur',
      life: 3000
    })
  }
}

function formatDate(dateString) {
  if (!dateString) return null
  
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateString))
}
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.8);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8);
}

thead.sticky {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
