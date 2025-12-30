'use client'

import { useRef, useState } from 'react'
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
  const [isLoaded, setIsLoaded] = useState(false)

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
          onLoadedData={() => setIsLoaded(true)}
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
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
              style={{ color: theme.text }}
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

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
          style={{ borderColor: theme.accent }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: theme.accent }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
