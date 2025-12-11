'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import type { Film } from '../../../types/site'

interface Work {
  id: string
  site_id: string
  settings: Film
  created_at: string
  updated_at: string
}

export default function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params Promise avec use()
  const { slug } = use(params)

  const [work, setWork] = useState<Work | null>(null)
  const [theme, setTheme] = useState({
    primary: '#0a0a0a',
    accent: '#ffffff',
    text: '#ffffff'
  })
  const [showTrailer, setShowTrailer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWork() {
      const supabase = createClient()

      // Récupérer le work
      const { data: workData, error } = await supabase
        .from('works')
        .select('*')
        .eq('id', slug)
        .maybeSingle()

      if (error || !workData) {
        setLoading(false)
        return
      }

      setWork(workData as Work)

      // Récupérer le thème du site
      const { data: siteData } = await supabase
        .from('sites')
        .select('settings')
        .eq('id', workData.site_id)
        .maybeSingle()

      if (siteData?.settings?.theme) {
        setTheme(siteData.settings.theme)
      }

      setLoading(false)
    }

    loadWork()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-white mb-4">Film non trouvé</h1>
          <Link href="/" className="text-white hover:opacity-70 underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const film = work.settings

  return (
    <div className="min-h-screen bg-black">
      {/* Bouton retour */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Retour</span>
          </motion.button>
        </Link>
      </div>

      {/* Section Bande-annonce / Image */}
      <section className="relative w-full h-screen">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${film.poster})`,
            filter: 'brightness(0.4)'
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Contenu */}
        <div className="relative h-full flex flex-col justify-end pb-20 px-8 lg:px-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Titre */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
              {film.title}
            </h1>

            {/* Infos du film */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 mb-8">
              {film.year && <span className="text-lg">{film.year}</span>}
              {film.duration && (
                <>
                  <span>•</span>
                  <span className="text-lg">{film.duration}</span>
                </>
              )}
              {film.genre && (
                <>
                  <span>•</span>
                  <span className="text-lg">{film.genre}</span>
                </>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-4">
              {film.trailer && film.trailer !== '' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                  Bande-annonce
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Synopsis */}
      <section className="py-20 lg:py-32 px-8 lg:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">Synopsis</h2>
          <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-4xl">
            {film.synopsis}
          </p>
          {film.director && (
            <p className="text-lg text-white/60 mt-6">
              Réalisé par <span className="text-white font-medium">{film.director}</span>
            </p>
          )}
        </motion.div>
      </section>

      {/* Section Contributeurs */}
      {film.crew && film.crew.length > 0 && (
        <section className="py-20 lg:py-32 px-8 lg:px-16 max-w-7xl mx-auto border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12">Contributeurs</h2>

            {/* Grille de contributeurs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
              {film.crew.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  {/* Portrait */}
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Nom */}
                  <h3 className="text-white font-medium text-base mb-1 group-hover:text-white/80 transition-colors">
                    {member.name}
                  </h3>

                  {/* Rôle */}
                  <p className="text-white/60 text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Modal Bande-annonce */}
      {showTrailer && film.trailer && film.trailer !== '' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full max-w-6xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white text-4xl hover:opacity-70 transition-opacity z-10"
            >
              ✕
            </button>

            {/* Vidéo */}
            <video
              src={film.trailer}
              controls
              autoPlay
              className="w-full h-full rounded-lg"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
