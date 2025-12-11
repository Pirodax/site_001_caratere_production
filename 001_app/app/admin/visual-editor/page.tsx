'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { VisualEditor } from '../../../components/dashboard/editor/VisualEditor'
import type { SiteSettings } from '@/types/site'
import { siteDefaults } from '@/lib/config/site-defaults'

// Import des composants du site pour le preview
import { NavbarCinema } from "../../../components/template_cinema/NavbarCinema"
import { HeroVideo } from "../../../components/template_cinema/HeroVideo"
import { AboutCinema } from "../../../components/template_cinema/AboutCinema"
import { Works } from "../../../components/template_cinema/Works"
import { InProduction } from "../../../components/template_cinema/InProduction"
import { ContactCinema } from "../../../components/template_cinema/ContactCinema"
import { FooterCinema } from "../../../components/template_cinema/FooterCinema"

export default function VisualEditorPage() {
  const [loading, setLoading] = useState(true)
  const [siteData, setSiteData] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadSite = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin')
        return
      }

      // Récupérer le site de l'utilisateur
      const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (!site) {
        // Créer un site si n'existe pas
        const { data: newSite } = await supabase
          .from('sites')
          .insert({
            owner_id: user.id,
            settings: siteDefaults
          })
          .select()
          .single()

        if (newSite) {
          setSiteData({
            id: newSite.id,
            domain: 'localhost:3000', // À adapter selon votre domaine
            settings: siteDefaults
          })
        }
      } else {
        setSiteData({
          id: site.id,
          domain: 'localhost:3000', // À adapter selon votre domaine
          settings: { ...siteDefaults, ...(site.settings as SiteSettings) }
        })
      }

      setLoading(false)
    }

    loadSite()
  }, [router, supabase])

  const handleSettingsChange = async (settings: SiteSettings) => {
    if (!siteData) return

    // Mettre à jour la DB
    await supabase
      .from('sites')
      .update({ settings })
      .eq('id', siteData.id)

    // Mettre à jour l'état local
    setSiteData({ ...siteData, settings })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement de l'éditeur...</div>
      </div>
    )
  }

  if (!siteData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Erreur lors du chargement</div>
      </div>
    )
  }

  const settings = siteData.settings as SiteSettings

  // Données pour Works
  const worksData = {
    title: 'Nos Films',
    items: settings.films.map(film => ({
      title: film.title,
      year: String(film.year),
      image: film.poster,
      description: film.description,
      director: film.director,
      slug: film.slug
    }))
  }

  return (
    <VisualEditor
      site={siteData}
      onSettingsChange={handleSettingsChange}
    >
      {/* Preview du site */}
      <div className="bg-black">
        <NavbarCinema theme={settings.theme} logo={settings.logo || settings.siteName} />
        <HeroVideo data={settings.hero} theme={settings.theme} />
        <AboutCinema data={settings.about} theme={settings.theme} />
        <Works data={worksData} theme={settings.theme} />
        {settings.inProduction && (
          <InProduction data={settings.inProduction} theme={settings.theme} />
        )}
        <ContactCinema data={settings.contact} theme={settings.theme} />
        <FooterCinema data={settings.footer} theme={settings.theme} />
      </div>
    </VisualEditor>
  )
}
