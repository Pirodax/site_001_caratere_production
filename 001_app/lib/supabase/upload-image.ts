import { createClient } from './client'

/**
 * Upload une image vers Supabase Storage et retourne l'URL publique
 * @param file - Le fichier image à uploader
 * @param siteId - L'ID du site (pour lier l'image au site)
 * @param bucket - Le nom du bucket (défaut: 'images')
 * @param folder - Le dossier dans le bucket (défaut: 'crew')
 * @returns L'URL publique de l'image ou null en cas d'erreur
 */
export async function uploadImage(
  file: File,
  siteId: string,
  bucket: string = 'images',
  folder: string = 'crew'
): Promise<string | null> {
  try {
    const supabase = createClient()

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    // Chemin: site_id/folder/filename
    const filePath = `${siteId}/${folder}/${fileName}`

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erreur upload:', error)
      return null
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return null
  }
}

/**
 * Supprime une image de Supabase Storage
 * @param imageUrl - L'URL complète de l'image
 * @param bucket - Le nom du bucket (défaut: 'images')
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'images'
): Promise<boolean> {
  try {
    const supabase = createClient()

    // Extraire le chemin du fichier depuis l'URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split(`/${bucket}/`)
    if (pathParts.length < 2) return false

    const filePath = pathParts[1]

    // Supprimer le fichier
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Erreur suppression:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return false
  }
}
