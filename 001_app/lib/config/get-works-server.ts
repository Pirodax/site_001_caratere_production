import { createClient } from '@/lib/supabase/server'
import type { Film } from '@/types/site'
import type { Work } from './get-works'

/**
 * Récupère tous les works d'un site (Server-side)
 */
export async function getWorksBySiteId(siteId: string): Promise<Work[]> {
  const supabase = await createClient()

  const { data: works, error } = await supabase
    .from('works')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching works:', error)
    return []
  }

  return works || []
}

/**
 * Récupère un work par ID (Server-side)
 */
export async function getWorkById(workId: string): Promise<Work | null> {
  const supabase = await createClient()

  const { data: work, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', workId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching work:', error)
    return null
  }

  return work
}

/**
 * Crée les works par défaut pour un nouveau site (Server-side)
 */
export async function createDefaultWorksForSite(siteId: string, defaultFilms: Film[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const worksToInsert = defaultFilms.map(film => ({
    site_id: siteId,
    settings: film
  }))

  const { error } = await supabase
    .from('works')
    .insert(worksToInsert)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
