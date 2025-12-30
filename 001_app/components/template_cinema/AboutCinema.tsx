'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n/translate'
import type { TranslatableText } from '@/types/site'

interface AboutCinemaProps {
  data: {
    title?: TranslatableText | string
    text: TranslatableText | string
    image?: string
  }
  theme: {
    primary: string
    accent: string
    text: string
  }
}

export function AboutCinema({ data, theme }: AboutCinemaProps) {
  const { language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const title = t(data.title, language) || 'About'
  const translatedText = t(data.text, language)
  const paragraphs = translatedText.split('\n\n').filter(p => p.trim())

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 lg:py-32"
      style={{ backgroundColor: theme.primary }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl lg:text-5xl font-bold mb-16 lg:mb-20"
          style={{ color: theme.accent }}
        >
          {title}
        </motion.h2>

        {/* Content Grid - Image at 1/3 width on desktop, full width on mobile */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Image - Reduced size: max-w-sm (~384px) on desktop */}
          {data.image && data.image.trim() !== '' && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full lg:w-auto lg:max-w-sm flex-shrink-0"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={data.image}
                  alt={title}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </motion.div>
          )}

          {/* Text Content - Takes remaining space */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6 flex-1"
          >
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="text-base lg:text-lg leading-relaxed text-justify"
                style={{ color: theme.text }}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
