# Guide : Initialisation d'un nouveau projet client

Ce document explique l'architecture du système et les étapes pour déployer un nouveau site client à partir de ce codebase.

---

## 1. Architecture globale

### Principe

Un seul codebase Next.js → N clients → chaque client a son propre déploiement Vercel + ses propres variables d'environnement.

La base de données Supabase est **partagée** entre tous les clients. L'isolation est assurée par :
- `owner_id` sur la table `sites` (lié à `auth.users`)
- `site_id` sur la table `works` (lié à `sites`)
- RLS (Row Level Security) Supabase sur toutes les tables
- Variable `NEXT_PUBLIC_SITE_ID` pour ancrer chaque déploiement à son site

### Tables Supabase

```
auth.users          → comptes utilisateurs (géré par Supabase Auth)
  └── sites         → un site par client (owner_id → auth.users)
        └── works   → films du site (site_id → sites)
  └── keepalive     → maintien activité DB (plan free)
```

### Flux de données

```
Visiteur → page.tsx (server)
  → Supabase : SELECT sites WHERE id = NEXT_PUBLIC_SITE_ID
  → Render avec les settings du site

Admin → /admin/editor (client)
  → proxy.ts vérifie : user connecté + email = NEXT_PUBLIC_ALLOWED_ADMIN_EMAIL
  → Supabase : SELECT sites WHERE owner_id = user.id
  → Interface d'édition isolée par owner_id
```

---

## 2. Structure des données

### `sites.settings` (JSONB)

Chaque site stocke toute sa configuration dans un seul champ `settings` de type JSONB :

```typescript
{
  siteName: string
  logo?: string          // URL image ou texte

  theme: {
    primary: string      // couleur de fond (#0a0a0a)
    accent: string       // couleur d'accentuation (#ffffff)
    text: string         // couleur du texte
    background?: string
    typography: {
      fontFamily: string // police principale
      headingFont?: string
    }
  }

  hero: {
    videoUrl?: string
    imageUrl?: string
    overlayText?: { fr: string, en: string }
    title?: { fr: string, en: string }
  }

  about: {
    title?: { fr: string, en: string }
    text: { fr: string, en: string }
    image?: string
  }

  works?: {
    title?: { fr: string, en: string }
  }

  news?: {
    visible: boolean
    title?: { fr: string, en: string }
    articles: Array<{
      id: string
      title: { fr: string, en: string }
      excerpt: { fr: string, en: string }
      content?: { fr: string, en: string }
      image?: string
      date: string       // ISO 8601
      slug: string
    }>
  }

  contact: {
    email: string
    address?: string
    phone?: string
    mapEmbed?: string
    socialLinks?: Array<{
      id: string
      platform: string   // "Instagram", "Facebook", etc.
      url: string
      icon: string       // URL de l'icône (ou vide)
    }>
  }

  footer: {
    copyright?: { fr: string, en: string }
    poweredByLink?: string
    legalNotices?: Array<{
      title: { fr: string, en: string }
      content: { fr: string, en: string }
    }>
  }
}
```

### `works.settings` (JSONB)

Chaque film est une ligne dans la table `works` :

```typescript
{
  slug: string           // identifiant URL (ex: "mon-film")
  title: { fr: string, en: string }
  year: number
  poster: string         // URL affiche
  backdrop?: string      // URL image immersive fond
  trailer?: string       // URL YouTube/Vimeo
  description?: { fr: string, en: string }
  synopsis: { fr: string, en: string }
  synopsisTitle?: { fr: string, en: string }
  duration?: string      // "90 min"
  genre?: { fr: string, en: string }
  director?: string
  crew?: Array<{
    name: string
    role: string
    image: string        // URL portrait
  }>
  pressReviews?: Array<{
    id: string
    title: string
    source: string
    url: string
    language: 'fr' | 'en'
  }>
  buyLinks?: Array<{
    id: string
    platform: string     // "Amazon", "Canal+", etc.
    url: string
    logo?: string        // URL logo plateforme
  }>
  customSections?: Array<{
    id: string
    title: { fr: string, en: string }
    content: { fr: string, en: string }
  }>
}
```

---

## 3. Variables d'environnement

Chaque déploiement Vercel doit avoir ces variables dans `.env.local` (local) et dans les **Environment Variables Vercel** (production) :

```bash
# Connexion Supabase (partagées entre tous les clients si même projet Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # scripts d'import uniquement

# Ancrage du déploiement au bon site (UNIQUE PAR CLIENT)
NEXT_PUBLIC_SITE_ID=uuid-du-site-dans-table-sites

# Sécurité admin (UNIQUE PAR CLIENT)
NEXT_PUBLIC_ALLOWED_ADMIN_EMAIL=email-du-client@exemple.com
```

---

## 4. Étapes pour un nouveau client

### Étape 1 — Créer le compte utilisateur

Dans Supabase Dashboard → Authentication → Users → "Add user" :
- Email : `client@exemple.com`
- Password : généré via `node scripts/set-password.mjs <userId> <password>`

### Étape 2 — Créer le site en base

Dans Supabase → Table Editor → `sites` → Insert row :
```json
{
  "owner_id": "uuid-du-user-créé-étape-1",
  "settings": {}
}
```
Noter l'`id` généré automatiquement → c'est le `NEXT_PUBLIC_SITE_ID`.

### Étape 3 — Déployer sur Vercel

1. Forker / dupliquer le repo GitHub
2. Créer un nouveau projet Vercel lié à ce repo
3. Ajouter les 5 variables d'environnement (voir section 3)
4. Déployer

### Étape 4 — Configurer le site via l'admin

Le client se connecte sur `son-domaine.com/admin` avec ses identifiants et configure son site via l'interface d'édition.

### Étape 5 — Importer les films (optionnel)

Utiliser le script d'import en masse :
```bash
# 1. Remplir scripts/films.json avec le contenu (voir scripts/films.json.example)
# 2. S'assurer que siteId dans films.json = NEXT_PUBLIC_SITE_ID du client
npm run import:films
```

---

## 5. Fichiers clés à connaître

| Fichier | Rôle |
|---|---|
| `app/page.tsx` | Page principale — charge les settings par SITE_ID |
| `app/admin/editor/page.tsx` | Interface d'administration du contenu |
| `proxy.ts` | Middleware — sécurise /admin par email autorisé |
| `lib/config/site-defaults.ts` | Valeurs par défaut si settings manquants |
| `types/site.ts` | Types TypeScript de toutes les structures |
| `scripts/import-films.ts` | Import en masse de films depuis JSON |
| `scripts/set-password.mjs` | Changer le mot de passe d'un user |
| `supabase/migrations/` | Historique des migrations DB |

---

## 6. Sécurité par couche

| Couche | Mécanisme | Protection |
|---|---|---|
| Middleware (proxy.ts) | Vérifie email avant chargement page | User B bloqué sur admin de User A |
| RLS Supabase | `owner_id = auth.uid()` | User B ne peut pas écrire les données de User A |
| Ancrage SITE_ID | Filtre par ID fixe | Les visiteurs voient toujours le bon site |
| Public read | `USING (true)` sur SELECT | Les visiteurs peuvent lire le contenu public |

---

## 7. Points d'attention

- **Ne jamais partager** `SUPABASE_SERVICE_ROLE_KEY` — il bypass toutes les RLS
- **`NEXT_PUBLIC_SITE_ID` est public** (préfixe NEXT_PUBLIC_) — c'est normal, c'est juste un UUID non sensible
- **`NEXT_PUBLIC_ALLOWED_ADMIN_EMAIL` est public** — c'est normal, ça ne donne pas accès, ça vérifie juste que l'email connecté correspond
- Le plan free Supabase met la DB en veille → la table `keepalive` + pg_cron tourne toutes les 12h pour éviter ça
