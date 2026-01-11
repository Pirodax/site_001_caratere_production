'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/types/site'
import { siteDefaults } from '@/lib/config/site-defaults'

export default function LegalPage() {
  const { language } = useLanguage()
  const [settings, setSettings] = useState<SiteSettings>(siteDefaults)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()

      const { data: sites } = await supabase
        .from('sites')
        .select('settings')
        .limit(1)
        .maybeSingle()

      if (sites) {
        setSettings({ ...siteDefaults, ...sites.settings as SiteSettings })
      }

      setLoading(false)
    }

    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  // Sections par défaut si rien n'est configuré dans l'admin
  const defaultSectionsFr = [
    {
      title: 'Éditeur du site',
      content: `Caractères Productions\nSiège social : Paris, France\nEmail : contact@caractere-productions.fr`
    },
    {
      title: 'Directeur de publication',
      content: 'Caractères Productions'
    },
    {
      title: 'Hébergement',
      content: `Ce site est hébergé par :\nVercel Inc.\n340 S Lemon Ave #4133\nWalnut, CA 91789\nÉtats-Unis`
    },
    {
      title: 'Propriété intellectuelle',
      content: `L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.`
    },
    {
      title: 'Données personnelles',
      content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.\n\nPour exercer ce droit, contactez-nous à : contact@caractere-productions.fr`
    },
    {
      title: 'Cookies',
      content: `Ce site utilise des cookies strictement nécessaires à son fonctionnement. Aucun cookie de suivi ou de marketing n'est utilisé sans votre consentement.`
    },
    {
      title: 'Développement',
      content: `Site développé par Ludovic Bergeron Digital`
    }
  ]

  const defaultSectionsEn = [
    {
      title: 'Site Publisher',
      content: `Caractères Productions\nHeadquarters: Paris, France\nEmail: contact@caractere-productions.fr`
    },
    {
      title: 'Publication Director',
      content: 'Caractères Productions'
    },
    {
      title: 'Hosting',
      content: `This site is hosted by:\nVercel Inc.\n340 S Lemon Ave #4133\nWalnut, CA 91789\nUnited States`
    },
    {
      title: 'Intellectual Property',
      content: `This entire site falls under French and international legislation on copyright and intellectual property. All reproduction rights are reserved, including for downloadable documents and iconographic and photographic representations.`
    },
    {
      title: 'Personal Data',
      content: `In accordance with the General Data Protection Regulation (GDPR), you have the right to access, rectify and delete your personal data.\n\nTo exercise this right, contact us at: contact@caractere-productions.fr`
    },
    {
      title: 'Cookies',
      content: `This site uses cookies strictly necessary for its operation. No tracking or marketing cookies are used without your consent.`
    },
    {
      title: 'Development',
      content: `Website developed by Ludovic Bergeron Digital`
    }
  ]

  // Utiliser les sections personnalisées de l'admin ou les valeurs par défaut
  const customSections = settings.footer?.legalNotices || []
  const sections = customSections.length > 0
    ? customSections.map(notice => ({
        title: language === 'fr' ? notice.title.fr : notice.title.en,
        content: language === 'fr' ? notice.content.fr : notice.content.en
      }))
    : (language === 'fr' ? defaultSectionsFr : defaultSectionsEn)

  const content = {
    title: language === 'fr' ? 'Mentions Légales' : 'Legal Notices',
    backLink: language === 'fr' ? 'Retour à l\'accueil' : 'Back to home',
    sections
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: settings.theme.primary,
        color: settings.theme.text,
      }}
    >
      {/* Header avec retour */}
      <div className="border-b" style={{ borderColor: settings.theme.accent }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity text-sm"
            style={{ color: settings.theme.accent }}
          >
            ← {content.backLink}
          </Link>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-bold mb-12"
          style={{ color: settings.theme.text }}
        >
          {content.title}
        </motion.h1>

        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-semibold" style={{ color: settings.theme.accent }}>
                {section.title}
              </h2>
              <p className="text-sm lg:text-base leading-relaxed whitespace-pre-line opacity-80">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>

        {/* Dernière mise à jour */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t opacity-60 text-sm"
          style={{ borderColor: settings.theme.accent }}
        >
          {language === 'fr'
            ? 'Dernière mise à jour : Janvier 2026'
            : 'Last update: January 2026'}
        </motion.div>
      </div>
    </div>
  )
}
