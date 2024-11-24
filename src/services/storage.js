import { supabase } from '@/config/supabase'

export async function uploadAvatar(file, userId) {
  try {
    // Créer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    throw error
  }
}

export async function deleteAvatar(filePath) {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    throw error
  }
} 