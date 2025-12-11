/**
 * FILM DETAIL COMPONENT - Template Cinema
 * Detailed view of a single film with trailer, info, and crew
 */

'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface CrewMember {
  name: string
  role: string
  image?: string
}

interface FilmDetailData {
  title: string
  year: string
  image: string
  description?: string
  trailer?: string // YouTube URL or video URL
  director?: string
  crew?: CrewMember[]
}

interface FilmDetailProps {
  film: FilmDetailData | null
  onClose: () => void
  theme: {
    primary: string
    accent: string
    text: string
  }
}

export function FilmDetail({ film, onClose, theme }: FilmDetailProps) {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (film) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [film])

  if (!film) return null

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null

    // Match various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
    }

    // If it's already an embed URL or a direct video file
    return url
  }

  const trailerEmbedUrl = film.trailer ? getYouTubeEmbedUrl(film.trailer) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
        style={{ backgroundColor: theme.primary }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <X size={24} style={{ color: theme.text }} />
        </button>

        {/* Trailer Section */}
        {trailerEmbedUrl && (
          <div className="relative w-full aspect-video bg-black">
            {trailerEmbedUrl.includes('youtube.com') || trailerEmbedUrl.includes('vimeo.com') ? (
              <iframe
                src={trailerEmbedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={trailerEmbedUrl}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* Film Info */}
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ color: theme.text, fontFamily: 'Playfair Display, serif' }}
            >
              {film.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl"
              style={{ color: theme.accent }}
            >
              {film.year}
            </motion.p>
          </div>

          {/* Poster & Description */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg"
            >
              <img
                src={film.image}
                alt={film.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2 space-y-6"
            >
              {film.director && (
                <div>
                  <h3
                    className="text-sm uppercase tracking-wider mb-2 font-semibold"
                    style={{ color: theme.accent }}
                  >
                    Réalisateur
                  </h3>
                  <p
                    className="text-lg"
                    style={{ color: theme.text }}
                  >
                    {film.director}
                  </p>
                </div>
              )}

              {film.description && (
                <div>
                  <h3
                    className="text-sm uppercase tracking-wider mb-2 font-semibold"
                    style={{ color: theme.accent }}
                  >
                    Synopsis
                  </h3>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: theme.text, opacity: 0.9 }}
                  >
                    {film.description}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Crew Section */}
          {film.crew && film.crew.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3
                className="text-2xl font-bold mb-6"
                style={{ color: theme.accent, fontFamily: 'Playfair Display, serif' }}
              >
                Équipe
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {film.crew.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="text-center"
                  >
                    {/* Member Photo */}
                    <div className="aspect-square mb-3 rounded-full overflow-hidden bg-gray-800 mx-auto w-24 h-24">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-2xl font-bold"
                          style={{ color: theme.accent }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Member Info */}
                    <h4
                      className="text-sm font-semibold mb-1"
                      style={{ color: theme.text }}
                    >
                      {member.name}
                    </h4>
                    <p
                      className="text-xs"
                      style={{ color: theme.accent, opacity: 0.8 }}
                    >
                      {member.role}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
