'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface FooterCinemaProps {
  data: {
    copyright?: { fr: string; en: string } | string
    poweredByLink?: string
    links?: Array<{ label: string; href: string }>
  }
  theme: {
    primary: string
    accent: string
    text: string
  }
}

export function FooterCinema({ data, theme }: FooterCinemaProps) {
  const { language } = useLanguage()

  // Gérer le copyright (ancien format string ou nouveau format bilingue)
  const defaultCopyright = {
    fr: '© 2026 Caractères Productions',
    en: '© 2026 Caractères Productions'
  }

  const copyright = (() => {
    if (!data.copyright) return defaultCopyright[language]
    if (typeof data.copyright === 'string') return data.copyright
    return data.copyright[language] || defaultCopyright[language]
  })()

  const poweredByLink = data.poweredByLink || 'https://www.linkedin.com/in/bergeronludovic/'

  return (
    <footer
      className="w-full py-8 lg:py-12 border-t"
      style={{
        backgroundColor: theme.primary,
        borderColor: theme.accent,
      }}
    >
      <div className="w-full px-4 lg:px-8">
        {/* Links (if any) */}
        {data.links && data.links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mb-6 lg:mb-8">
            {data.links.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                whileHover={{ y: -2 }}
                className="text-xs lg:text-sm hover:opacity-70 transition-opacity"
                style={{ color: theme.text }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>
        )}

        {/* Copyright et lien mentions légales */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center w-full space-y-3"
        >
          {/* Copyright utilisateur */}
          <p
            className="text-xs lg:text-sm leading-relaxed px-2"
            style={{ color: theme.text }}
          >
            {copyright}
          </p>

          {/* Powered by - fixe et non modifiable */}
          <p
            className="text-xs lg:text-sm leading-relaxed px-2"
            style={{ color: theme.text }}
          >
            {language === 'fr' ? 'Site propulsé par ' : 'Site powered by '}
            <a
              href={poweredByLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity underline"
            >
              Ludovic Bergeron Digital
            </a>
          </p>

          <div>
            <Link
              href="/legal"
              className="text-xs lg:text-sm hover:opacity-70 transition-opacity underline"
              style={{ color: theme.text }}
            >
              {language === 'fr' ? 'Mentions légales' : 'Legal notices'}
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
