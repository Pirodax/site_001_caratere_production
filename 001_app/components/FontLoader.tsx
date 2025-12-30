'use client'

import { useEffect } from 'react'
import type { Typography } from '@/types/site'

interface FontLoaderProps {
  typography?: Typography
}

/**
 * Composant pour charger dynamiquement les Google Fonts
 * et appliquer les styles de typographie au site
 */
export default function FontLoader({ typography }: FontLoaderProps) {
  useEffect(() => {
    // Valeurs par défaut si typography n'est pas défini
    const fontFamily = typography?.fontFamily || 'Inter'
    const headingFont = typography?.headingFont || fontFamily

    // Charger les fonts depuis Google Fonts
    const fonts = [fontFamily]
    if (headingFont && headingFont !== fontFamily) {
      fonts.push(headingFont)
    }

    // Créer le lien pour Google Fonts avec préchargement
    const fontUrls = fonts.map(font => font.replace(/ /g, '+')).join('&family=')
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrls}:wght@300;400;500;600;700;800;900&display=swap`
    link.rel = 'stylesheet'
    link.crossOrigin = 'anonymous'

    // Précharger la font pour éviter le flash de texte
    const preconnect = document.createElement('link')
    preconnect.href = 'https://fonts.googleapis.com'
    preconnect.rel = 'preconnect'
    preconnect.crossOrigin = 'anonymous'

    const preconnectStatic = document.createElement('link')
    preconnectStatic.href = 'https://fonts.gstatic.com'
    preconnectStatic.rel = 'preconnect'
    preconnectStatic.crossOrigin = 'anonymous'

    // Vérifier si les liens n'existent pas déjà
    const existingLink = document.querySelector(`link[href*="${fonts[0]}"]`)
    if (!existingLink) {
      document.head.appendChild(preconnect)
      document.head.appendChild(preconnectStatic)
      document.head.appendChild(link)
    }

    // Appliquer immédiatement les styles CSS custom properties
    document.documentElement.style.setProperty('--font-body', `'${fontFamily}'`)
    document.documentElement.style.setProperty('--font-heading', `'${headingFont}'`)

    return () => {
      // Nettoyage si nécessaire
      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
    }
  }, [typography])

  return null
}
