import { NavbarCinema } from "../components/template_cinema/NavbarCinema";
import { HeroVideo } from "../components/template_cinema/HeroVideo";
import { AboutCinema } from "../components/template_cinema/AboutCinema";
import { Works } from "../components/template_cinema/Works";
import { InProduction } from "../components/template_cinema/InProduction";
import { ContactCinema } from "../components/template_cinema/ContactCinema";
import { FooterCinema } from "../components/template_cinema/FooterCinema";
import { createClient } from "../lib/supabase/server";
import { siteDefaults } from "../lib/config/site-defaults";
import type { SiteSettings } from "../types/site";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Récupérer les settings du site (le premier site pour l'instant)
  const { data: site } = await supabase
    .from('sites')
    .select('settings')
    .limit(1)
    .maybeSingle()

  // Utiliser les settings de la DB ou les defaults
  const settings: SiteSettings = site?.settings as SiteSettings || siteDefaults

  // Données pour Works - utilise les films des settings
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
  };

  return (
    <main className="relative bg-black flex justify-center items-center flex-col mx-auto overflow-clip">
      <div className="w-full">
        <NavbarCinema theme={settings.theme} logo={settings.logo || settings.siteName} />
        <HeroVideo data={settings.hero} theme={settings.theme} />
        <AboutCinema data={settings.about} theme={settings.theme} />
        <Works data={worksData} theme={settings.theme} />
        {settings.inProduction && (
          <InProduction data={settings.inProduction} theme={settings.theme} />
        )}
        <ContactCinema data={settings.contact} theme={settings.theme} />
      </div>
      <FooterCinema data={settings.footer} theme={settings.theme} />
    </main>
  );
}
