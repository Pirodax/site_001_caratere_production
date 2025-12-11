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

The entire site content is stored in a single JSONB column (`sites.settings`) in Supabase. Each authenticated user has their own site with customizable settings that merge with defaults.

**Data Flow**:
```
Database (sites.settings JSONB)
  ↓ getSiteSettings() / updateSiteSettings()
lib/config/get-site-settings.ts
  ↓
Components receive settings as props
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
  - `config/site-defaults.ts` - Default site settings (merged with DB settings)
  - `config/get-site-settings.ts` - CRUD operations for site settings

- **`types/site.ts`** - All TypeScript interfaces (SiteSettings, Theme, Film, etc.)

- **`middleware.ts`** - Protects `/admin/dashboard` and `/admin/editor` routes

### Database Schema

**Table: `sites`**
- `id` (uuid, PK)
- `owner_id` (uuid, FK → auth.users)
- `settings` (jsonb) - Entire SiteSettings object
- `created_at`, `updated_at` (timestamptz)
- RLS enabled: Users can only access their own site

**Table: `works`**
- `id`, `site_id`, `settings` (jsonb), timestamps
- RLS enabled

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
  films: Film[]
  inProduction?: { title?: string; film: InProductionFilm }
  contact: ContactSettings
  footer: FooterSettings
  social?: SocialLinks
}
```

**When adding new editable fields**:
1. Add type to [types/site.ts](types/site.ts)
2. Add default value to [lib/config/site-defaults.ts](lib/config/site-defaults.ts)
3. Add UI field to [app/admin/editor/page.tsx](app/admin/editor/page.tsx)
4. Field automatically available in components via props

## Important Patterns

### Server vs Client Components

- **Server Components**: Use `lib/supabase/server.ts` (e.g., public homepage)
- **Client Components**: Use `lib/supabase/client.ts` (e.g., admin pages with `'use client'`)
- Public homepage is `export const dynamic = 'force-dynamic'` to always fetch fresh data

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

## Editor System

The admin editor ([app/admin/editor/page.tsx](app/admin/editor/page.tsx)) provides a tabbed interface for editing:
- **Hero**: Title, overlay text, background image/video
- **About**: Title, description, image
- **Contact**: Email, phone, address, map embed
- **Theme**: Site name, primary/accent/text colors

Changes are saved to `sites.settings` JSONB column only when user clicks "Sauvegarder" (Save).

See [EDITOR_README.md](EDITOR_README.md) for detailed French documentation on the editor architecture and how to extend it.

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

1. [types/site.ts](types/site.ts) - All data model changes start here
2. [lib/config/site-defaults.ts](lib/config/site-defaults.ts) - Default values for new fields
3. [app/admin/editor/page.tsx](app/admin/editor/page.tsx) - Where UI fields are added
4. [app/page.tsx](app/page.tsx) - Public site rendering
5. [lib/config/get-site-settings.ts](lib/config/get-site-settings.ts) - Database operations

## Current Development Status

**Working**:
- Complete authentication flow
- Database-driven site settings
- Visual editor for hero, about, contact, theme sections
- Public site rendering with force-dynamic freshness

**Not Yet Implemented** (from EDITOR_README.md):
- Films management UI in editor (films table exists, no UI yet)
- Image/video upload via Supabase Storage (media table exists, no upload UI)
- Real-time preview in editor
- Modification history
- Import/export configurations
- Multi-site support per user
