import { NavbarCinema } from "../components/template_cinema/NavbarCinema";
import { HeroVideo } from "../components/template_cinema/HeroVideo";
import { AboutCinema } from "../components/template_cinema/AboutCinema";
import { Works } from "../components/template_cinema/Works";
import { InProduction } from "../components/template_cinema/InProduction";
import { ContactCinema } from "../components/template_cinema/ContactCinema";
import { FooterCinema } from "../components/template_cinema/FooterCinema";

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
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80',
    overlayText: 'Productions Cinématographiques',
    title: 'CARACTÈRE'
  };

  // Données pour About
  const aboutData = {
    title: 'À propos',
    text: 'Caractère Productions est une société de production cinématographique dédiée à la création de contenus originaux et innovants.\n\nNotre mission est de raconter des histoires qui touchent et inspirent le public.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'
  };

  // Données pour Works
  const worksData = {
    title: 'Nos Films',
    items: [
      {
        title: 'Film 1',
        year: '2024',
        image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
        description: 'Description du film 1',
        director: 'Réalisateur 1'
      },
      {
        title: 'Film 2',
        year: '2023',
        image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80',
        description: 'Description du film 2',
        director: 'Réalisateur 2'
      }
    ]
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
