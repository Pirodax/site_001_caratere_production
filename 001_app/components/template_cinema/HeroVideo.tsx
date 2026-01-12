'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n/translate'
import type { TranslatableText } from '@/types/site'

interface HeroVideoProps {
  data: {
    videoUrl?: string
    imageUrl?: string
    overlayText?: TranslatableText | string
    title?: TranslatableText | string
  }
  theme: {
    primary: string
    accent: string
    text: string
  }
}

export function HeroVideo({ data, theme }: HeroVideoProps) {
  const { language } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)

  const hasVideo = data.videoUrl && data.videoUrl !== ''
  const fallbackImage = data.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80'

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Video or Image Background */}
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.7)' }}
        >
          <source src={data.videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${fallbackImage})`,
            filter: 'brightness(0.7)',
          }}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center max-w-4xl"
        >
          {data.title && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight drop-shadow-2xl"
              style={{ color: theme.text, textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}
            >
              {t(data.title, language)}
            </motion.h1>
          )}

          {data.overlayText && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-lg md:text-xl lg:text-2xl font-light tracking-wide"
              style={{ color: theme.accent }}
            >
              {t(data.overlayText, language)}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
