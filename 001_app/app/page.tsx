import { NavbarCinema } from "../components/template_cinema/NavbarCinema";
import { HeroVideo } from "../components/template_cinema/HeroVideo";
import { AboutCinema } from "../components/template_cinema/AboutCinema";
import { Works } from "../components/template_cinema/Works";
import News from "../components/template_cinema/News";
import { ContactCinema } from "../components/template_cinema/ContactCinema";
import { FooterCinema } from "../components/template_cinema/FooterCinema";
import FontLoader from "../components/FontLoader";
import { createClient } from "../lib/supabase/server";
import { siteDefaults } from "../lib/config/site-defaults";
import type { SiteSettings } from "../types/site";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Récupérer le site par son ID fixe (défini dans .env.local par déploiement)
  // Si pas défini, fallback sur le premier site (rétrocompatibilité)
  const siteIdEnv = process.env.NEXT_PUBLIC_SITE_ID
  const siteQuery = supabase.from('sites').select('settings, id')
  const { data: site } = await (siteIdEnv
    ? siteQuery.eq('id', siteIdEnv).maybeSingle()
    : siteQuery.limit(1).maybeSingle())

  // Deep merge : defaults en base, valeurs DB par-dessus, champ par champ
  // Gère les settings manquants (null), vides ({}) ou partiels ({ theme: { primary } sans accent })
  const raw = (site?.settings || {}) as Partial<SiteSettings>
  const settings: SiteSettings = {
    siteName: raw.siteName || siteDefaults.siteName,
    logo: raw.logo || siteDefaults.logo,
    theme: {
      ...siteDefaults.theme,
      ...(raw.theme || {}),
      typography: {
        ...siteDefaults.theme.typography,
        ...(raw.theme?.typography || {}),
      },
    },
    hero: { ...siteDefaults.hero, ...(raw.hero || {}) },
    about: { ...siteDefaults.about, ...(raw.about || {}) },
    works: raw.works || siteDefaults.works,
    news: raw.news ?? siteDefaults.news,
    contact: { ...siteDefaults.contact, ...(raw.contact || {}) },
    footer: { ...siteDefaults.footer, ...(raw.footer || {}) },
  }
  const siteId = site?.id

  // Récupérer les works depuis la table works
  let worksData = {
    title: settings.works?.title || { fr: 'Nos Films', en: 'Our Films' },
    items: [] as Array<{
      id: string
      title: string
      year: string
      image: string
      description?: string
      director?: string
    }>
  }

  if (siteId) {
    const { data: works } = await supabase
      .from('works')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })

    if (works && works.length > 0) {
      worksData.items = works.map(work => ({
        id: work.id,
        title: typeof work.settings.title === 'string' ? work.settings.title : work.settings.title?.fr || '',
        year: String(work.settings.year),
        image: work.settings.poster,
        description: typeof work.settings.description === 'string' ? work.settings.description : work.settings.description?.fr,
        director: work.settings.director
      }))
    }
  }

  return (
    <main className="relative bg-black flex justify-center items-center flex-col mx-auto overflow-clip">
      {/* Charger les Google Fonts selon le thème */}
      <FontLoader typography={settings.theme?.typography} />

      <div className="w-full">
        <NavbarCinema theme={settings.theme} logo={settings.logo || settings.siteName} newsVisible={settings.news?.visible} />
        <HeroVideo data={settings.hero} theme={settings.theme} />
        <AboutCinema data={settings.about} theme={settings.theme} />
        <Works data={worksData} theme={settings.theme} />

        {/* Section Actualités (uniquement si visible) */}
        {settings.news && <News news={settings.news} />}

        <ContactCinema data={settings.contact} theme={settings.theme} />
      </div>
      <FooterCinema data={settings.footer} theme={settings.theme} />
    </main>
  );
}
