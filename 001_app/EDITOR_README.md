# Système d'édition du site - Guide complet

## 🎯 Architecture

Le système d'édition permet à l'utilisateur de modifier le contenu de son site via une interface admin, avec les données stockées dans Supabase.

## 📁 Structure des fichiers

### Types et configuration
- `types/site.ts` - Tous les types TypeScript pour les settings
- `lib/config/site-defaults.ts` - Valeurs par défaut du site
- `lib/config/get-site-settings.ts` - Fonctions pour lire/écrire les settings

### Pages admin
- `app/admin/page.tsx` - Page de connexion
- `app/admin/dashboard/page.tsx` - Dashboard principal
- `app/admin/editor/page.tsx` - Éditeur visuel

### Page publique
- `app/page.tsx` - Page d'accueil (lit les settings depuis la DB)

### Middleware
- `middleware.ts` - Protège les routes admin

## 🔄 Flux de données

### 1. Premier login
```
Utilisateur se connecte → Dashboard vérifie s'il a un site
├─ Oui → Charge les settings existants
└─ Non → Crée un site avec siteDefaults
```

### 2. Édition du site
```
Dashboard → Bouton "Éditer le site" → /admin/editor
└─ Charge les settings depuis la DB
   Utilisateur modifie les champs
   Clique sur "Sauvegarder"
   └─ update sites.settings avec les nouvelles valeurs
```

### 3. Affichage public
```
Visiteur accède à / → page.tsx (Server Component)
└─ Récupère les settings depuis la DB
   Passe les settings aux composants
   └─ Affiche le site avec les données personnalisées
```

## 🗄️ Base de données

### Table sites
```sql
id: uuid (PK)
owner_id: uuid (FK → auth.users)
settings: jsonb
created_at: timestamptz
updated_at: timestamptz
```

Le champ `settings` contient tout l'objet `SiteSettings` en JSON :
```json
{
  "siteName": "CARACTÈRE",
  "theme": {
    "primary": "#0a0a0a",
    "accent": "#ffffff",
    "text": "#ffffff"
  },
  "hero": { ... },
  "about": { ... },
  "films": [ ... ],
  "contact": { ... },
  "footer": { ... }
}
```

## 🔧 Utilisation

### Ajouter un nouveau champ éditable

1. **Ajouter le type dans `types/site.ts`** :
```typescript
export interface HeroSettings {
  videoUrl?: string
  imageUrl?: string
  overlayText?: string
  title?: string
  nouveauChamp?: string  // ← Nouveau champ
}
```

2. **Ajouter la valeur par défaut dans `lib/config/site-defaults.ts`** :
```typescript
hero: {
  // ... autres champs
  nouveauChamp: 'Valeur par défaut'
}
```

3. **Ajouter le champ dans l'éditeur `app/admin/editor/page.tsx`** :
```tsx
{activeTab === 'hero' && (
  <div className="space-y-6">
    {/* ... autres champs */}

    <div>
      <label className="block text-sm text-white/60 mb-2">
        Nouveau champ
      </label>
      <input
        type="text"
        value={settings.hero.nouveauChamp || ''}
        onChange={(e) => updateSettings(['hero', 'nouveauChamp'], e.target.value)}
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
      />
    </div>
  </div>
)}
```

4. **Utiliser le champ dans les composants** :
Le champ sera automatiquement disponible via les props passées depuis `page.tsx`.

### Ajouter une nouvelle section

1. Ajouter l'interface dans `types/site.ts`
2. Ajouter les valeurs par défaut dans `site-defaults.ts`
3. Ajouter dans l'interface `SiteSettings`
4. Créer l'onglet dans l'éditeur
5. Utiliser dans `page.tsx`

## 🎨 Sections disponibles dans l'éditeur

- **Hero** : Titre, texte de superposition, image/vidéo de fond
- **À propos** : Titre, texte, image
- **Contact** : Email, téléphone, adresse, carte
- **Thème** : Couleurs principales, accent, texte, nom du site

## 🔐 Sécurité

- Les routes `/admin/dashboard` et `/admin/editor` sont protégées par le middleware
- Seuls les utilisateurs authentifiés peuvent accéder à l'éditeur
- Row Level Security (RLS) activé sur Supabase
- Chaque utilisateur ne peut modifier que son propre site

## 📝 Notes importantes

- La page d'accueil est un Server Component (force-dynamic) pour toujours avoir les données à jour
- Les settings sont mergés avec les defaults pour éviter les valeurs manquantes
- Le dashboard crée automatiquement un site au premier login
- Les modifications sont sauvegardées uniquement quand l'utilisateur clique sur "Sauvegarder"

## 🚀 Prochaines étapes possibles

- [ ] Ajouter la gestion des films depuis l'éditeur
- [ ] Upload d'images/vidéos via Supabase Storage
- [ ] Prévisualisation en temps réel dans l'éditeur
- [ ] Historique des modifications
- [ ] Export/Import de configuration
- [ ] Multi-sites par utilisateur
