// Types pour les settings du site

export interface CrewMember {
  name: string
  role: string
  image: string
}

export interface CustomSection {
  id: string
  title: TranslatableText
  content: TranslatableText
}

export interface PressReview {
  id: string
  title: string
  source: string
  url: string
  language: 'fr' | 'en'
}

export interface BuyLink {
  id: string
  platform: string
  url: string
  logo?: string
}

export interface Film {
  slug: string
  title: TranslatableText
  year: number | string
  poster: string | { fr?: string; en?: string } // Support bilingue pour affiches
  backdrop?: string // Image paysage immersive pour le background
  trailer?: string
  description?: TranslatableText
  synopsis: TranslatableText
  synopsisTitle?: TranslatableText
  customSections?: CustomSection[]
  duration?: string
  genre?: TranslatableText
  director?: string
  crew?: CrewMember[]
  pressReviews?: PressReview[]
  buyLinks?: BuyLink[]
}

export interface Typography {
  fontFamily: string
  headingFont?: string
}

export interface Theme {
  primary: string
  accent: string
  text: string
  background?: string
  typography: Typography
}

// Types pour les traductions
export interface TranslatableText {
  fr: string
  en: string
}

export interface HeroSettings {
  videoUrl?: string
  imageUrl?: string
  overlayText?: TranslatableText
  title?: TranslatableText
}

export interface AboutSettings {
  title?: TranslatableText
  text: TranslatableText
  image?: string
}

export interface WorksSettings {
  title?: TranslatableText
}

export interface NewsArticle {
  id: string
  title: TranslatableText
  excerpt: TranslatableText
  content?: TranslatableText
  image?: string
  date: string
  slug: string
}

export interface NewsSettings {
  visible: boolean
  title?: TranslatableText
  articles: NewsArticle[]
}

export interface ContactSettings {
  email: string
  address?: string
  mapEmbed?: string
  phone?: string
}

export interface LegalNotice {
  title: TranslatableText
  content: TranslatableText
}

export interface FooterSettings {
  copyright?: TranslatableText
  poweredByLink?: string // Lien vers LinkedIn de Ludovic Bergeron
  links?: Array<{ label: string; href: string }>
  legalNotices?: LegalNotice[]
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
  works?: WorksSettings
  news?: NewsSettings
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
