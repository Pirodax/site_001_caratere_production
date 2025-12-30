import type { Language } from '@/contexts/LanguageContext'

export const uiTranslations = {
  // Navigation
  home: { fr: 'Accueil', en: 'Home' },
  about: { fr: 'À propos', en: 'About' },
  films: { fr: 'Films', en: 'Films' },
  contact: { fr: 'Contact', en: 'Contact' },

  // Boutons
  back: { fr: 'Retour', en: 'Back' },
  readMore: { fr: 'Lire la suite', en: 'Read more' },
  seeLess: { fr: 'Voir moins', en: 'See less' },
  seeDetails: { fr: 'VOIR DÉTAILS', en: 'SEE DETAILS' },
  watchTrailer: { fr: 'Bande-annonce', en: 'Watch Trailer' },

  // Film details
  synopsis: { fr: 'Synopsis', en: 'Synopsis' },
  contributors: { fr: 'Contributeurs', en: 'Contributors' },
  directedBy: { fr: 'Réalisé par', en: 'Directed by' },

  // Footer
  copyright: {
    fr: (year: number) => `© ${year} Caractères Productions — Site propulsé par Ludovic BERGERON Digital`,
    en: (year: number) => `© ${year} Caractères Productions — Powered by Ludovic BERGERON Digital`
  },

  // Loading
  loading: { fr: 'Chargement...', en: 'Loading...' },
  filmNotFound: { fr: 'Film non trouvé', en: 'Film not found' },
  backToHome: { fr: 'Retour à l\'accueil', en: 'Back to home' },

  // Language selector
  selectLanguage: { fr: 'Langue', en: 'Language' },
  french: { fr: 'Français', en: 'French' },
  english: { fr: 'Anglais', en: 'English' },
}

export function getUITranslation(
  key: keyof typeof uiTranslations,
  lang: Language,
  ...args: any[]
): string {
  const translation = uiTranslations[key]
  if (!translation) return key

  const value = translation[lang]

  // Si c'est une fonction, l'appeler avec les arguments
  if (typeof value === 'function') {
    return (value as any)(...args)
  }

  return value as string
}
