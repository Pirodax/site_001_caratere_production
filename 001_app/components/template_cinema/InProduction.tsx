'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

interface InProductionProps {
  data: {
    title?: string
    film: {
      title: string
      directors: string
      poster: string
      synopsis?: string
      trailer?: string
    }
  }
  theme: {
    primary: string
    accent: string
    text: string
  }
}

export function InProduction({ data, theme }: InProductionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [showTrailer, setShowTrailer] = useState(false)

  const title = data.title || 'In Production'

  return (
    <section
      id="in-production"
      ref={ref}
      className="py-20 lg:py-32 relative overflow-hidden"
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

        {/* Film Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-[2/3] overflow-hidden shadow-2xl group"
          >
            <img
              src={data.film.poster}
              alt={data.film.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>

          {/* Film Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Title */}
            <div>
              <h3
                className="text-3xl lg:text-5xl font-bold mb-4"
                style={{ color: theme.text }}
              >
                {data.film.title}
              </h3>
              <p
                className="text-lg lg:text-xl font-light"
                style={{ color: theme.accent }}
              >
                {data.film.directors}
              </p>
            </div>

            {/* Synopsis */}
            {data.film.synopsis && (
              <p
                className="text-base lg:text-lg leading-relaxed"
                style={{ color: theme.text }}
              >
                {data.film.synopsis}
              </p>
            )}

            {/* Trailer Button */}
            {data.film.trailer && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTrailer(true)}
                className="px-8 py-4 text-sm lg:text-base font-semibold tracking-wide transition-all duration-300 border-2"
                style={{
                  color: theme.text,
                  borderColor: theme.accent,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent
                  e.currentTarget.style.color = theme.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.text
                }}
              >
                Regarder la bande-annonce
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && data.film.trailer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white text-4xl hover:opacity-70 transition-opacity"
            >
              ×
            </button>
            <video
              src={data.film.trailer}
              controls
              autoPlay
              className="w-full h-full"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
