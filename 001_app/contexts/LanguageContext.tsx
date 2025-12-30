'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')

  // Charger la langue depuis localStorage ou détecter du navigateur au montage
  useEffect(() => {
    // Vérifier localStorage d'abord
    const savedLang = localStorage.getItem('preferred-language') as Language
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguageState(savedLang)
      return
    }

    // Sinon détecter depuis le navigateur
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('en')) {
      setLanguageState('en')
    } else {
      setLanguageState('fr') // Par défaut français
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('preferred-language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
