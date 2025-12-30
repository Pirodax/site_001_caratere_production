# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 (App Router) full-stack web application for **CARACTÈRE Productions**, a cinema/film production company. The site features a public-facing cinema template and an admin dashboard that allows users to customize all site content via a database-driven settings system.

**Tech Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Supabase (PostgreSQL + Auth), Framer Motion

## Development Commands

```bash
npm run dev     # Start development server (http://localhost:3000)
npm run build   # Production build
npm start       # Start production server
npm run lint    # Run ESLint
```

## Project Architecture

### Core Concept: Database-Driven Settings

The site content is split between two main storage patterns:
1. **Site Settings**: Stored in `sites.settings` JSONB column (theme, hero, about, contact, footer)
2. **Works (Films)**: Stored in separate `works` table with their own JSONB `settings` column

Each authenticated user has their own site with customizable settings that merge with defaults.

**Data Flow - Site Settings**:
```
Database (sites.settings JSONB)
  ↓ getSiteSettings() / updateSiteSettings()
lib/config/get-site-settings.ts
  ↓
Components receive settings as props
```

**Data Flow - Works (Films)**:
```
Database (works table)
  ↓ Client-side: lib/config/get-works.ts (createWork, updateWork, deleteWork)
  ↓ Server-side: lib/config/get-works-server.ts (getWorkById, createDefaultWorksForSite)
  ↓
Homepage & Film detail pages
```

### Directory Structure

- **`app/`** - Next.js App Router
  - `page.tsx` - Public homepage (Server Component, force-dynamic)
  - `admin/page.tsx` - Login page
  - `admin/dashboard/page.tsx` - Admin dashboard (auto-creates site on first login)
  - `admin/editor/page.tsx` - Visual settings editor (~400 lines)
  - `films/[slug]/page.tsx` - Film detail pages

- **`components/template_cinema/`** - Cinema template components
  - All components are theme-aware and receive settings as props
  - Exported via barrel file at `components/index.ts`

- **`lib/`**
  - `supabase/server.ts` - Server-side Supabase client (cookies-based, for Server Components)
  - `supabase/client.ts` - Client-side Supabase client (browser, for Client Components)
  - `config/site-defaults.ts` - Default site settings + default films (merged with DB settings)
  - `config/get-site-settings.ts` - CRUD operations for site settings (server-side)
  - `config/get-works.ts` - CRUD operations for works/films (client-side)
  - `config/get-works-server.ts` - Server-side works operations (used in Server Components)

- **`types/site.ts`** - All TypeScript interfaces (SiteSettings, Theme, Film, etc.)

- **`middleware.ts`** - Protects `/admin/dashboard` and `/admin/editor` routes

### Database Schema

**Table: `sites`**
- `id` (uuid, PK)
- `owner_id` (uuid, FK → auth.users)
- `settings` (jsonb) - Entire SiteSettings object
- `created_at`, `updated_at` (timestamptz)
- RLS enabled: Users can only access their own site

**Table: `works`** (formerly `films`)
- `id` (uuid, PK)
- `site_id` (uuid, FK → sites)
- `settings` (jsonb) - Film object with title, year, poster, synopsis, director, genre, duration, trailer, crew[]
- `created_at`, `updated_at` (timestamptz)
- RLS enabled: Users can only access works of their sites
- **Important**: Films are stored here, NOT in `sites.settings`

**Table: `media`**
- `id`, `user_id`, `url`, `filename`, metadata, timestamps
- RLS enabled

### Authentication & Authorization

- Supabase Auth handles all authentication
- Middleware protects admin routes (`/admin/dashboard`, `/admin/editor`)
- Unauthenticated users → redirected to `/admin` (login)
- Authenticated users on `/admin` → redirected to `/admin/dashboard`
- RLS policies ensure users can only access their own data

## Key TypeScript Types

All types are in [types/site.ts](types/site.ts):

```typescript
SiteSettings {
  siteName: string
  logo?: string
  theme: Theme
  hero: HeroSettings
  about: AboutSettings
  // NOTE: films array removed - now in works table
  inProduction?: { title?: string; film: InProductionFilm }
  contact: ContactSettings
  footer: FooterSettings
  social?: SocialLinks
}

Film {
  slug: string  // Not used for routing (ID is used instead)
  title: string
  year: number | string
  poster: string
  synopsis: string
  trailer?: string
  duration?: string
  genre?: string
  director?: string
  crew?: CrewMember[]  // Array of { name, role, image }
}
```

**When adding new editable fields to site settings**:
1. Add type to [types/site.ts](types/site.ts) SiteSettings interface
2. Add default value to [lib/config/site-defaults.ts](lib/config/site-defaults.ts) siteDefaults
3. Add UI field to [app/admin/editor/page.tsx](app/admin/editor/page.tsx) in appropriate tab
4. Field automatically available in components via props

**When adding new fields to films/works**:
1. Add type to [types/site.ts](types/site.ts) Film interface
2. Add field to [lib/config/site-defaults.ts](lib/config/site-defaults.ts) defaultFilms
3. Add UI field to [app/admin/editor/page.tsx](app/admin/editor/page.tsx) in films tab work editor
4. Field automatically saved to works.settings JSONB column

## Important Patterns

### Server vs Client Components

- **Server Components**: Use `lib/supabase/server.ts` (e.g., public homepage)
- **Client Components**: Use `lib/supabase/client.ts` (e.g., admin pages with `'use client'`)
- Public homepage is `export const dynamic = 'force-dynamic'` to always fetch fresh data
- **Works/Films separation**:
  - Client-side operations: `lib/config/get-works.ts` (used in admin editor)
  - Server-side operations: `lib/config/get-works-server.ts` (used in Server Components)
  - This separation is **critical** - mixing them causes build errors with `next/headers`

### Settings Merge Pattern

Settings from DB are merged with defaults to prevent missing values:
```typescript
const settings = { ...siteDefaults, ...dbSettings }
```

### Path Alias

Use `@/*` for imports (configured in tsconfig.json):
```typescript
import { getSiteSettings } from '@/lib/config/get-site-settings'
```

### Component Export Pattern

Components use barrel exports via [components/index.ts](components/index.ts):
```typescript
export { NavbarCinema, HeroVideo, AboutCinema, ... } from './template_cinema/...'
```

### Next.js 15+ Dynamic Routes

**IMPORTANT**: In Next.js 15+, `params` in dynamic routes is a Promise:

```typescript
// ❌ OLD (Next.js 14)
export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug
}

// ✅ NEW (Next.js 15+)
import { use } from 'react'

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)  // Must unwrap Promise with use()
  const id = slug
}
```

See [app/films/[slug]/page.tsx](app/films/[slug]/page.tsx) for implementation example.

## Editor System

The admin editor ([app/admin/editor/page.tsx](app/admin/editor/page.tsx)) provides a tabbed interface for editing:

### Site Settings Tabs
- **Hero**: Title, overlay text, background image/video
- **About**: Title, description, image
- **Contact**: Email, phone, address, map embed
- **Theme**: Site name, logo, primary/accent/text colors

Changes are saved to `sites.settings` JSONB column only when user clicks "Sauvegarder" (Save).

### Films/Works Management Tab

The **Films** tab provides complete CRUD operations for works:

**List View**:
- Grid of film cards with poster, title, year, director
- "Ajouter un film" button to create new work

**Edit View** (click on film card):
- **Basic fields**: Title, Year, Director, Genre, Duration
- **Media**: Poster URL, Trailer URL (optional)
- **Content**: Synopsis (textarea)
- **Crew Management**:
  - Add/remove crew members
  - Each member: Name, Role, Image URL
  - Delete button (🗑) for each member
- **Actions**: Save button, Delete film button

**Data Flow**:
1. Films fetched from `works` table on editor load
2. Create/Update/Delete operations use `lib/config/get-works.ts` client-side functions
3. All changes persist immediately to database (not batched with site settings save)
4. Homepage automatically reflects changes (force-dynamic)

**Routing**: Film detail pages use work ID, not slug (`/films/[id]`)

See [EDITOR_README.md](EDITOR_README.md) for detailed French documentation on the editor architecture.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://prcglbfytntnffrwwoot.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_MJLLubHepSpCHYs1wexLvg_Tz0FPov7
```

## Code Style Conventions

- TypeScript strict mode enabled
- Tailwind CSS utility-first approach (no custom CSS beyond globals.css)
- Framer Motion for animations
- Lucide React for icons
- Server Components by default, Client Components only when needed (state, browser APIs, Supabase client)

## Critical Files for Future Work

When modifying functionality, these files are most important:

**For Site Settings**:
1. [types/site.ts](types/site.ts) - SiteSettings interface
2. [lib/config/site-defaults.ts](lib/config/site-defaults.ts) - siteDefaults object
3. [app/admin/editor/page.tsx](app/admin/editor/page.tsx) - Editor UI (Hero/About/Contact/Theme tabs)
4. [lib/config/get-site-settings.ts](lib/config/get-site-settings.ts) - Server-side CRUD

**For Films/Works**:
1. [types/site.ts](types/site.ts) - Film interface
2. [lib/config/site-defaults.ts](lib/config/site-defaults.ts) - defaultFilms array
3. [app/admin/editor/page.tsx](app/admin/editor/page.tsx) - Films tab UI
4. [lib/config/get-works.ts](lib/config/get-works.ts) - Client-side CRUD
5. [lib/config/get-works-server.ts](lib/config/get-works-server.ts) - Server-side operations

**Public Site Rendering**:
1. [app/page.tsx](app/page.tsx) - Homepage (fetches works from DB)
2. [app/films/[slug]/page.tsx](app/films/[slug]/page.tsx) - Film detail page
3. [components/template_cinema/Works.tsx](components/template_cinema/Works.tsx) - Film cards with links

## Current Development Status

**✅ Working**:
- Complete authentication flow with Supabase Auth
- Database-driven site settings (hero, about, contact, theme)
- Visual editor with tabbed interface (Hero, About, Films, Contact, Theme)
- **Films/Works management** - Full CRUD in editor:
  - Create, edit, delete films
  - Manage crew members with images
  - All film metadata (title, year, genre, director, synopsis, etc.)
- Public site rendering with force-dynamic freshness
- Film detail pages with dynamic routes using work IDs
- Homepage displays films from `works` table

**🚧 Not Yet Implemented**:
- Image/video upload via Supabase Storage (media table exists, manual URLs for now)
- Real-time preview in editor (changes require page refresh)
- Modification history / versioning
- Import/export configurations
- Multi-site support per user (one site per user currently)

**⚠️ Known Limitations**:
- Film routing uses database ID in URL (not SEO-friendly slug)
- No image upload UI - must paste URLs manually
- Editor changes for films save immediately (not batched with site settings)
