/**
 * WORKS SECTION COMPONENT - Template Cinema
 * Grid of films/projects with clickable items and film details modal
 */

'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { FilmDetail } from './FilmDetail'

interface CrewMember {
  name: string
  role: string
  image?: string
}

interface WorkItem {
  title: string
  year: string
  image: string
  description?: string
  trailer?: string
  director?: string
  crew?: CrewMember[]
}

interface WorksData {
  title?: string
  items: WorkItem[]
}

interface WorksProps {
  data: WorksData
  theme?: {
    primary?: string
    background?: string
    text?: string
    accent?: string
  }
}

export function Works({ data, theme }: WorksProps) {
  const { title = 'Films', items } = data
  // Filter out items with empty or invalid image URLs
  const validItems = items.filter(item => item.image && item.image.trim() !== '')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [selectedFilm, setSelectedFilm] = useState<WorkItem | null>(null)

  return (
    <>
      <section
        id="films"
        ref={ref}
        className="relative py-24 md:py-32"
        style={{
          backgroundColor: theme?.background || '#FFFFFF',
        }}
      >
        <div className="mx-auto max-w-7xl px-4">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2
              className="text-4xl font-light tracking-wide md:text-5xl"
              style={{
                color: theme?.text || '#111111',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              {title}
            </h2>
            <div
              className="mx-auto mt-6 h-1 w-24"
              style={{
                backgroundColor: theme?.primary || '#C0A060',
              }}
            />
          </motion.div>

          {/* Works grid - Reduced gap for tighter spacing */}
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {validItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedFilm(item)}
              >
                {/* Image */}
                <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/40 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="text-white text-sm font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      VOIR DÉTAILS
                    </motion.div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3
                    className="text-lg font-light tracking-wide"
                    style={{
                      color: theme?.text || '#111111',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm tracking-wider"
                    style={{
                      color: theme?.primary || '#C0A060',
                    }}
                  >
                    {item.year}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Film Detail Modal */}
      <FilmDetail
        film={selectedFilm}
        onClose={() => setSelectedFilm(null)}
        theme={{
          primary: theme?.primary || '#C0A060',
          accent: theme?.accent || theme?.primary || '#C0A060',
          text: theme?.text || '#FFFFFF',
        }}
      />
    </>
  )
}
