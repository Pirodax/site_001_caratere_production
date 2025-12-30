import type { TranslatableText } from '@/types/site'
import type { Language } from '@/contexts/LanguageContext'

/**
 * Obtient le texte traduit selon la langue
 * @param text - Texte traduisible ou chaîne simple
 * @param lang - Langue courante
 * @returns Le texte dans la langue demandée, ou le texte original si non traduisible
 */
export function t(
  text: TranslatableText | string | undefined,
  lang: Language
): string {
  if (!text) return ''

  // Si c'est déjà une chaîne simple, la retourner
  if (typeof text === 'string') return text

  // Si c'est un objet de traduction, retourner la langue demandée
  return text[lang] || text.fr || ''
}

/**
 * Crée un objet de traduction avec les deux langues
 * @param fr - Texte français
 * @param en - Texte anglais
 * @returns Objet TranslatableText
 */
export function createTranslation(fr: string, en: string): TranslatableText {
  return { fr, en }
}

/**
 * Vérifie si un texte est traduisible
 * @param text - Texte à vérifier
 * @returns true si le texte est un objet TranslatableText
 */
export function isTranslatable(text: any): text is TranslatableText {
  return (
    typeof text === 'object' &&
    text !== null &&
    'fr' in text &&
    'en' in text
  )
}
