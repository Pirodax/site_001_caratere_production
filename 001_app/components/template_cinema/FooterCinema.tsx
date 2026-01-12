'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface FooterCinemaProps {
  data: {
    copyright?: string
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
  const copyright = data.copyright || `© 2026 Caractères Productions — Site propulsé par Ludovic Bergeron Digital`

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
          <p
            className="text-xs lg:text-sm leading-relaxed px-2"
            style={{ color: theme.text }}
          >
            {copyright}
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
