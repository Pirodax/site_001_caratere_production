import type { SiteSettings, Film } from '@/types/site'

// Films par défaut pour l'initialisation
export const defaultFilms: Film[] = [
  {
    slug: 'film-exemple-1',
    title: 'Film Exemple 1',
    year: 2024,
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    description: 'Description du film exemple',
    synopsis: 'Synopsis complet du film. Une histoire captivante qui explore les thèmes de la vie, de l\'amour et de la rédemption à travers les yeux de personnages profondément humains.',
    trailer: '',
    duration: '120 min',
    genre: 'Drame',
    director: 'Réalisateur',
    crew: [
      {
        name: 'Jean Dupont',
        role: 'Réalisateur',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'
      },
      {
        name: 'Marie Martin',
        role: 'Productrice',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80'
      }
    ]
  }
]

export const siteDefaults: SiteSettings = {
  // Informations générales
  siteName: 'CARACTÈRE',
  logo: 'http://caracteresproductions.com/wp-content/uploads/2020/12/cropped-cropped-logo-1-1-1-2.png',

  // Thème
  theme: {
    primary: '#0a0a0a',
    accent: '#ffffff',
    text: '#ffffff',
    background: '#000000'
  },

  // Section Hero
  hero: {
    videoUrl: '',
    imageUrl: 'http://caracteresproductions.com/wp-content/uploads/2025/01/SliderLe-Pacte-dAlep-1.jpg',
    overlayText: 'Productions Cinématographiques',
    title: 'CARACTÈRE'
  },

  // Section À propos
  about: {
    title: 'À propos',
    text: 'Caractère Productions est une société de production cinématographique dédiée à la création de contenus originaux et innovants.\n\nNotre mission est de raconter des histoires qui touchent et inspirent le public.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'
  },

  // Section Films
  works: {
    title: 'Nos Films'
  },

  // Contact
  contact: {
    email: 'contact@caractere-productions.fr',
    address: 'Paris, France',
    phone: '+33 1 23 45 67 89',
    mapEmbed: ''
  },

  // Footer
  footer: {
    copyright: '© 2025 Caractères Productions — Site propulsé par Ludovic Bergeron',
    links: []
  },

  // Réseaux sociaux
  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: ''
  }
}
