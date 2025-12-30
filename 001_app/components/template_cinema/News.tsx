'use client'

import { motion } from 'framer-motion'
import type { NewsSettings } from '@/types/site'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/i18n/translate'

interface NewsProps {
  news: NewsSettings
}

export default function News({ news }: NewsProps) {
  const { language } = useLanguage()

  // Ne rien afficher si la section est cachée ou s'il n'y a pas d'articles
  if (!news.visible || !news.articles || news.articles.length === 0) {
    return null
  }

  return (
    <section className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre de la section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {news.title ? t(news.title, language) : (language === 'fr' ? 'Actualités' : 'News')}
          </h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </motion.div>

        {/* Grille d'articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all duration-300"
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
    </section>
  )
}
