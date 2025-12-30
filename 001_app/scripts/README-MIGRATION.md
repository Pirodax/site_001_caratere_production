# Guide de Migration vers le Format Bilingue (FR/EN)

## 📋 Prérequis

Avant d'exécuter la migration, assurez-vous d'avoir :

1. **Variables d'environnement configurées** dans votre fichier `.env.local` :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
   ```

   ⚠️ **Important** : Pour modifier directement la base de données, vous aurez besoin de la clé `service_role` :
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
   ```

   Vous pouvez la trouver dans Supabase Dashboard → Settings → API → service_role key

2. **Sauvegarde de vos données** (recommandé) :
   - Allez dans votre Supabase Dashboard
   - Exportez vos tables `sites` et `works` au cas où

## 🚀 Exécution de la Migration

### Étape 1 : Installer les dépendances

```bash
cd 001_app
npm install
```

### Étape 2 : Lancer le script de migration

```bash
npm run migrate:i18n
```

Le script va :
- ✅ Récupérer tous vos sites
- ✅ Convertir les champs texte en objets `{ fr: "...", en: "..." }`
- ✅ Migrer automatiquement les films
- ✅ Dupliquer initialement le contenu FR en EN

### Étape 3 : Vérifier les résultats

Après la migration, vos données ressembleront à ceci :

**AVANT :**
```json
{
  "hero": {
    "title": "CARACTÈRES PRODUCTIONS",
    "overlayText": ""
  },
  "about": {
    "title": "À propos",
    "text": "Caractère Productions est une société..."
  }
}
```

**APRÈS :**
```json
{
  "hero": {
    "title": {
      "fr": "CARACTÈRES PRODUCTIONS",
      "en": "CARACTÈRES PRODUCTIONS"
    },
    "overlayText": {
      "fr": "",
      "en": ""
    }
  },
  "about": {
    "title": {
      "fr": "À propos",
      "en": "About"
    },
    "text": {
      "fr": "Caractère Productions est une société...",
      "en": "Caractère Productions is a company..."
    }
  }
}
```

## 📝 Prochaines étapes

1. **Vérifiez dans Supabase** :
   - Ouvrez votre table `sites`
   - Cliquez sur votre site
   - Vérifiez que les champs sont maintenant des objets `{ fr, en }`

2. **Traduisez le contenu** :
   - Connectez-vous à votre admin (`/admin`)
   - Allez dans "Éditer le site"
   - Vous verrez maintenant des champs FR/EN côte à côte
   - Remplissez les traductions EN

3. **Testez le sélecteur de langue** :
   - Visitez votre site
   - Cliquez sur FR/EN dans le menu
   - Vérifiez que le contenu change

## 🔍 Champs migrés

### Dans `sites.settings` :
- ✅ `hero.title`
- ✅ `hero.overlayText`
- ✅ `about.title`
- ✅ `about.text`
- ✅ `works.title`
- ✅ `gallery.title`
- ✅ `inProduction.title`
- ✅ `inProduction.film.title`
- ✅ `inProduction.film.synopsis`

### Dans `works.settings` :
- ✅ `title`
- ✅ `genre`
- ✅ `synopsis`
- ✅ `description`

### Champs NON migrés (restent en texte simple) :
- ❌ `director` (nom propre)
- ❌ `year` (nombre)
- ❌ `duration` (unité standard)
- ❌ URLs, emails, numéros de téléphone

## ⚠️ Dépannage

**Erreur "Cannot find module @supabase/supabase-js"**
```bash
npm install @supabase/supabase-js
```

**Erreur "Unauthorized"**
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien dans `.env.local`
- Redémarrez le terminal

**Les données ne s'affichent pas correctement**
- Videz le cache du navigateur
- Vérifiez que les composants utilisent bien `useLanguage()`
- Consultez la console pour les erreurs

## 🆘 Besoin d'aide ?

Si quelque chose ne fonctionne pas :
1. Vérifiez les logs du script
2. Consultez les données dans Supabase Dashboard
3. Restaurez votre backup si nécessaire
