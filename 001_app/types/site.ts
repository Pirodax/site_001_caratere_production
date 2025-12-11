// Types pour les settings du site

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
  crew?: CrewMember[]
}

export interface Theme {
  primary: string
  accent: string
  text: string
  background?: string
}

export interface HeroSettings {
  videoUrl?: string
  imageUrl?: string
  overlayText?: string
  title?: string
}

export interface AboutSettings {
  title?: string
  text: string
  image?: string
}

export interface InProductionFilm {
  title: string
  directors: string
  poster: string
  synopsis?: string
  trailer?: string
}

export interface ContactSettings {
  email: string
  address?: string
  mapEmbed?: string
  phone?: string
}

export interface FooterSettings {
  copyright?: string
  links?: Array<{ label: string; href: string }>
}

export interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  linkedin?: string
}

export interface SiteSettings {
  // Informations générales
  siteName: string
  logo?: string

  // Thème
  theme: Theme

  // Sections
  hero: HeroSettings
  about: AboutSettings
  films: Film[]
  inProduction?: {
    title?: string
    film: InProductionFilm
  }
  contact: ContactSettings
  footer: FooterSettings

  // Réseaux sociaux
  social?: SocialLinks
}

// Type pour la table sites
export interface Site {
  id: string
  owner_id: string
  settings: SiteSettings
  created_at: string
  updated_at: string
}

// Type pour les préférences utilisateur
export interface UserPreferences {
  user_id: string
  active_site_id: string | null
  created_at: string
  updated_at: string
}
