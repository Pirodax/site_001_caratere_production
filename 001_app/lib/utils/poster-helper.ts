import type { Language } from '@/contexts/LanguageContext'

/**
 * Retourne l'URL du poster selon la langue
 * Si poster est un string, le retourne directement
 * Si poster est un objet { fr?, en? }, retourne selon la langue
 * Si une seule langue est définie, l'utilise pour toutes les langues
 */
export function getPosterUrl(
  poster: string | { fr?: string; en?: string } | undefined,
  language: Language
): string {
  // Si poster n'est pas défini, retourner une image par défaut
  if (!poster) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'
  }

  // Si poster est un string simple, le retourner directement
  if (typeof poster === 'string') {
    return poster
  }

  // Si poster est un objet bilingue
  const frPoster = poster.fr
  const enPoster = poster.en

  // Si les deux sont définis, utiliser selon la langue
  if (frPoster && enPoster) {
    return language === 'fr' ? frPoster : enPoster
  }

  // Si seulement une est définie, l'utiliser pour toutes les langues
  if (frPoster) return frPoster
  if (enPoster) return enPoster

  // Fallback
  return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'
}
