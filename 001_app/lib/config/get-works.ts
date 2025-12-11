import { createClient } from '@/lib/supabase/client'
import type { Film } from '@/types/site'

export interface Work {
  id: string
  site_id: string
  settings: Film
  created_at: string
  updated_at: string
}

/**
 * Récupère tous les works d'un site (Client-side)
 */
export async function getWorksBySiteIdClient(siteId: string): Promise<Work[]> {
  const supabase = createClient()

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
 * Crée un nouveau work (Client-side)
 */
export async function createWork(
  siteId: string,
  workData: Film
): Promise<{ success: boolean; workId?: string; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('works')
    .insert({
      site_id: siteId,
      settings: workData
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, workId: data.id }
}

/**
 * Met à jour un work (Client-side)
 */
export async function updateWork(
  workId: string,
  workData: Film
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('works')
    .update({ settings: workData })
    .eq('id', workId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Supprime un work (Client-side)
 */
export async function deleteWork(
  workId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('works')
    .delete()
    .eq('id', workId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
