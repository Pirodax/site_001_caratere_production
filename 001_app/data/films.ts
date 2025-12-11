// Types pour les films
export interface CrewMember {
  name: string
  role: string
  image: string
}

export interface Film {
  slug: string
  title: string
  year: number | string
  poster: string
  trailer?: string
  description?: string
  synopsis: string
  duration?: string
  genre?: string
  director?: string
}

export interface FilmDetail {
  slug: string
  crew: CrewMember[]
}

// Données des films - correspond à ce qui est affiché dans Catalogue
export const Films: Film[] = [
  {
    slug: 'film-a',
    title: 'Film A',
    year: 2024,
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    description: 'Description du film A',
    synopsis: 'Synopsis complet du film A. Une histoire captivante qui explore les thèmes de la vie, de l\'amour et de la rédemption à travers les yeux de personnages profondément humains.',
    trailer: '',
    duration: '120 min',
    genre: 'Drame',
    director: 'Jean Dupont'
  },
  {
    slug: 'film-b',
    title: 'Film B',
    year: 2023,
    poster: 'https://images.unsplash.com/photo-1574267432644-f2ea63a5ee0c?w=600&q=80',
    description: 'Description du film B',
    synopsis: 'Synopsis complet du film B. Un thriller psychologique qui tient en haleine du début à la fin, explorant les limites de la conscience humaine.',
    trailer: '',
    duration: '105 min',
    genre: 'Thriller',
    director: 'Luc Moreau'
  }
]

// Détails des contributeurs par film
export const FilmsDetails: FilmDetail[] = [
  {
    slug: 'film-a',
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
      },
      {
        name: 'Pierre Bernard',
        role: 'Directeur de la photographie',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80'
      },
      {
        name: 'Sophie Laurent',
        role: 'Scénariste',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80'
      }
    ]
  },
  {
    slug: 'film-b',
    crew: [
      {
        name: 'Luc Moreau',
        role: 'Réalisateur',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80'
      },
      {
        name: 'Claire Dubois',
        role: 'Productrice',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
      },
      {
        name: 'Thomas Petit',
        role: 'Compositeur',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80'
      }
    ]
  }
]
