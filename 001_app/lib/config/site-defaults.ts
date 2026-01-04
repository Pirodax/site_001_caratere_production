import type { SiteSettings, Film } from '@/types/site'

// Films par défaut pour l'initialisation
export const defaultFilms: Film[] = [
  {
    slug: 'film-exemple-1',
    title: {
      fr: 'Film Exemple 1',
      en: 'Sample Film 1'
    },
    year: 2024,
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    description: {
      fr: 'Description du film exemple',
      en: 'Sample film description'
    },
    synopsis: {
      fr: 'Synopsis complet du film. Une histoire captivante qui explore les thèmes de la vie, de l\'amour et de la rédemption à travers les yeux de personnages profondément humains.',
      en: 'Complete film synopsis. A captivating story that explores themes of life, love, and redemption through the eyes of deeply human characters.'
    },
    trailer: '',
    duration: '120 min',
    genre: {
      fr: 'Drame',
      en: 'Drama'
    },
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
    background: '#000000',
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter'
    }
  },

  // Section Hero
  hero: {
    videoUrl: '',
    imageUrl: 'http://caracteresproductions.com/wp-content/uploads/2025/01/SliderLe-Pacte-dAlep-1.jpg',
    overlayText: {
      fr: 'Productions Cinématographiques',
      en: 'Film Productions'
    },
    title: {
      fr: 'CARACTÈRE',
      en: 'CHARACTER'
    }
  },

  // Section À propos
  about: {
    title: {
      fr: 'À propos',
      en: 'About'
    },
    text: {
      fr: 'Caractère Productions est une société de production cinématographique dédiée à la création de contenus originaux et innovants.\n\nNotre mission est de raconter des histoires qui touchent et inspirent le public.',
      en: 'Caractère Productions is a film production company dedicated to creating original and innovative content.\n\nOur mission is to tell stories that touch and inspire audiences.'
    },
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'
  },

  // Section Films
  works: {
    title: {
      fr: 'Nos Films',
      en: 'Our Films'
    }
  },

  // Section Actualités
  news: {
    visible: true,
    title: {
      fr: 'Actualités',
      en: 'News'
    },
    articles: [
      {
        id: '1',
        title: {
          fr: 'Premier article d\'actualité',
          en: 'First news article'
        },
        excerpt: {
          fr: 'Ceci est un extrait de notre première actualité. Découvrez les dernières nouvelles de Caractère Productions.',
          en: 'This is an excerpt of our first news article. Discover the latest news from Caractère Productions.'
        },
        content: {
          fr: 'Contenu complet de l\'article en français...',
          en: 'Full article content in English...'
        },
        image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
        date: new Date().toISOString(),
        slug: 'premier-article'
      }
    ]
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
    copyright: '© 2026 Caractères Productions — Site propulsé par Ludovic Bergeron',
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
