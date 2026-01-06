'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NewsSettings, NewsArticle } from '@/types/site'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n/translate'
import { X } from 'lucide-react'

interface NewsProps {
  news: NewsSettings
}

export default function News({ news }: NewsProps) {
  const { language } = useLanguage()
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedArticle])

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null)
      }
    }

    if (selectedArticle) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectedArticle])

  // Ne rien afficher si la section est cachée ou s'il n'y a pas d'articles
  if (!news.visible || !news.articles || news.articles.length === 0) {
    return null
  }

  // Trier les articles du plus récent au plus ancien
  const sortedArticles = [...news.articles].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <section className="relative py-24 bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Titre de la section - Aligné comme About et Works */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl lg:text-5xl font-bold mb-16 lg:mb-20 text-white"
        >
          {news.title ? t(news.title, language) : (language === 'fr' ? 'Actualités' : 'News')}
        </motion.h2>

        {/* Grille d'articles - Alignée comme Films */}
        <div className="grid gap-4 md:gap-5 grid-cols-2 lg:grid-cols-4">
          {sortedArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              {/* Image */}
              {article.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={t(article.title, language)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              )}

              {/* Contenu */}
              <div className="p-6">
                {/* Date */}
                <time className="text-sm text-white/60 mb-3 block">
                  {new Date(article.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>

                {/* Titre */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/80 transition-colors">
                  {t(article.title, language)}
                </h3>

                {/* Extrait */}
                <p className="text-white/70 text-sm line-clamp-3 mb-4">
                  {t(article.excerpt, language)}
                </p>

                {/* Lien Lire plus */}
                <div className="flex items-center text-white/90 text-sm font-medium group-hover:text-white transition-colors">
                  <span>{language === 'fr' ? 'Lire la suite' : 'Read more'}</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Message si pas d'articles (ne devrait jamais s'afficher car on check length === 0 plus haut) */}
        {news.articles.length === 0 && (
          <div className="text-center text-white/60 py-12">
            <p>{language === 'fr' ? 'Aucune actualité pour le moment' : 'No news at the moment'}</p>
          </div>
        )}
      </div>

      {/* Modal pour afficher l'article complet */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/20 rounded-2xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton fermer */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Fermer"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image de l'article */}
              {selectedArticle.image && (
                <div className="relative h-64 md:h-96 w-full overflow-hidden shrink-0">
                  <img
                    src={selectedArticle.image}
                    alt={t(selectedArticle.title, language)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                </div>
              )}

              {/* Contenu de l'article */}
              <div className="p-8 md:p-12 overflow-y-auto">
                {/* Date */}
                <time className="text-sm text-white/60 mb-4 block">
                  {new Date(selectedArticle.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>

                {/* Titre */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {t(selectedArticle.title, language)}
                </h2>

                {/* Contenu complet */}
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content
                      ? t(selectedArticle.content, language)
                      : t(selectedArticle.excerpt, language)
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
