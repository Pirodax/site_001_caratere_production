import { createClient } from '@/lib/supabase/server'
import type { SiteSettings } from '@/types/site'
import { siteDefaults, defaultFilms } from './site-defaults'
import { createDefaultWorksForSite } from './get-works-server'

/**
 * Récupère les settings du site de l'utilisateur
 * Si aucun site n'existe, retourne les valeurs par défaut
 */
export async function getSiteSettings(userId: string): Promise<SiteSettings> {
  const supabase = await createClient()

  const { data: site, error } = await supabase
    .from('sites')
    .select('settings')
    .eq('owner_id', userId)
    .maybeSingle()

  if (error || !site) {
    return siteDefaults
  }

  return site.settings as SiteSettings
}

/**
 * Récupère l'ID du site de l'utilisateur
 */
export async function getUserSiteId(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()

  return site?.id || null
}

/**
 * Met à jour les settings du site
 */
export async function updateSiteSettings(
  siteId: string,
  settings: SiteSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sites')
    .update({ settings })
    .eq('id', siteId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Crée un nouveau site avec les settings par défaut
 */
export async function createUserSite(userId: string): Promise<{ success: boolean; siteId?: string; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sites')
    .insert({
      owner_id: userId,
      settings: siteDefaults
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Créer les works par défaut dans la table works
  if (defaultFilms && defaultFilms.length > 0) {
    await createDefaultWorksForSite(data.id, defaultFilms)
  }

  return { success: true, siteId: data.id }
}
