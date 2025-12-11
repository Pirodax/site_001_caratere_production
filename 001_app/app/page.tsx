import { NavbarCinema } from "../components/template_cinema/NavbarCinema";
import { HeroVideo } from "../components/template_cinema/HeroVideo";
import { AboutCinema } from "../components/template_cinema/AboutCinema";
import { Works } from "../components/template_cinema/Works";
import { InProduction } from "../components/template_cinema/InProduction";
import { ContactCinema } from "../components/template_cinema/ContactCinema";
import { FooterCinema } from "../components/template_cinema/FooterCinema";
import { Films } from "../data/films";

export default function Home() {
  // Configuration du thème
  const theme = {
    primary: '#0a0a0a',
    accent: '#ffffff',
    text: '#ffffff'
  };

  // Données pour HeroVideo
  const heroData = {
    videoUrl: '',
    imageUrl: 'http://caracteresproductions.com/wp-content/uploads/2025/01/SliderLe-Pacte-dAlep-1.jpg',
    overlayText: 'Productions Cinématographiques',
    title: 'CARACTÈRE'
  };

  // Données pour About
  const aboutData = {
    title: 'À propos',
    text: 'Caractère Productions est une société de production cinématographique dédiée à la création de contenus originaux et innovants.\n\nNotre mission est de raconter des histoires qui touchent et inspirent le public.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'
  };

  // Données pour Works - utilise les données du fichier films.ts
  const worksData = {
    title: 'Nos Films',
    items: Films.map(film => ({
      title: film.title,
      year: String(film.year),
      image: film.poster,
      description: film.description,
      director: film.director,
      slug: film.slug
    }))
  };

  

  // Données pour InProduction
  const inProductionData = {
    title: 'En Production',
    film: {
      title: 'Nouveau Projet',
      directors: 'Réalisateur Principal',
      poster: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600&q=80',
      synopsis: 'Synopsis du film en cours de production...',
      trailer: ''
    }
  };

  // Données pour Contact
  const contactData = {
    email: 'contact@caractere-productions.fr',
    address: 'Paris, France',
    phone: '+33 1 23 45 67 89',
    mapEmbed: ''
  };

  // Données pour Footer
  const footerData = {
    copyright: '© 2025 Caractères Productions — Site propulsé par Sosoft',
    links: []
  };

  return (
    <main className="relative bg-black flex justify-center items-center flex-col mx-auto overflow-clip">
      <div className="w-full">
        <NavbarCinema theme={theme} logo="CARACTÈRE" />
        <HeroVideo data={heroData} theme={theme} />
        <AboutCinema data={aboutData} theme={theme} />
        <Works data={worksData} theme={theme} />
        <InProduction data={inProductionData} theme={theme} />
        <ContactCinema data={contactData} theme={theme} />
      </div>
      <FooterCinema data={footerData} theme={theme} />
    </main>
  );
}
