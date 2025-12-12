/**
 * WORKS SECTION COMPONENT - Template Cinema
 * Grid of films/projects with clickable items and film details modal
 */

'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

interface CrewMember {
  name: string
  role: string
  image?: string
}

interface WorkItem {
  id?: string
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

  return (
    <section
      id="films"
      ref={ref}
      className="relative py-24 md:py-32"
      style={{
        backgroundColor: theme?.background || '#FFFFFF',
      }}
    >
      <div className="container mx-auto px-4 lg:px-8">
          {/* Section title - Same style as About section, aligned left */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold mb-16 lg:mb-20"
            style={{ color: theme?.accent || theme?.text || '#FFFFFF' }}
          >
            {title}
          </motion.h2>

          {/* Works grid - 2 columns on mobile, 4 on desktop */}
          <div className="grid gap-4 md:gap-5 grid-cols-2 lg:grid-cols-4">
            {validItems.map((item, index) => (
              <Link key={index} href={`/films/${item.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
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
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
  )
}
