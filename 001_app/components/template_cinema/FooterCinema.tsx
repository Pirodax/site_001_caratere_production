'use client'

import { motion } from 'framer-motion'

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
  const currentYear = new Date().getFullYear()
  const copyright = data.copyright || `© ${currentYear} Caractères Productions — Site propulsé par Sosoft`

  return (
    <footer
      className="py-12 lg:py-16 border-t"
      style={{
        backgroundColor: theme.primary,
        borderColor: theme.accent,
      }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Links (if any) */}
        {data.links && data.links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {data.links.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                whileHover={{ y: -2 }}
                className="text-sm lg:text-base hover:opacity-70 transition-opacity"
                style={{ color: theme.text }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p
            className="text-sm lg:text-base"
            style={{ color: theme.text }}
          >
            {copyright}
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
