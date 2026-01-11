# Prompt pour ChatGPT - Extraction de données de films

Copie-colle ce prompt à ChatGPT avec l'URL de ton ancien site :

---

## PROMPT À DONNER À CHATGPT

```
Je veux que tu extraies les informations de tous les films depuis ce site web : [METTRE_URL_DE_L'ANCIEN_SITE]

Pour chaque film, tu dois extraire et formater les données dans le format JSON suivant :

{
  "slug": "titre-du-film-en-minuscules-avec-tirets",
  "title": {
    "fr": "Titre en français",
    "en": "Title in English"
  },
  "year": 2015,
  "poster": "",
  "backdrop": "",
  "trailer": "URL de la bande-annonce YouTube si disponible",
  "description": {
    "fr": "Description courte en français",
    "en": "Short description in English"
  },
  "synopsis": {
    "fr": "Synopsis complet en français",
    "en": "Full synopsis in English"
  },
  "duration": "88 min",
  "genre": {
    "fr": "Fiction / Documentaire / etc.",
    "en": "Fiction / Documentary / etc."
  },
  "director": "Nom du réalisateur",
  "crew": [
    {
      "name": "Nom de la personne ou société",
      "role": "Production / Cinematography / etc.",
      "image": ""
    }
  ],
  "pressReviews": [
    {
      "id": "timestamp-unique",
      "title": "Titre de l'article",
      "source": "Nom de la source (journal, site)",
      "url": "URL de l'article",
      "language": "fr ou en"
    }
  ],
  "buyLinks": [
    {
      "id": "timestamp-unique",
      "platform": "AMAZON / iTunes / etc.",
      "url": "URL du lien d'achat",
      "logo": "URL du logo de la plateforme si disponible"
    }
  ],
  "customSections": [
    {
      "id": "timestamp-unique",
      "title": {
        "fr": "Festival / Awards / etc.",
        "en": "Festival / Awards / etc."
      },
      "content": {
        "fr": "Contenu de la section en français",
        "en": "Content of the section in English"
      }
    }
  ]
}

RÈGLES IMPORTANTES :
1. Le champ "slug" doit être unique pour chaque film (titre en minuscules, sans accents, avec tirets)
2. Laisse "poster" et "backdrop" vides (chaînes vides "")
3. Laisse "image" vide pour les membres de crew
4. Pour les IDs (pressReviews, buyLinks, customSections), utilise un timestamp unique (ex: "1768139867890")
5. Si une information n'existe pas, omets le champ OU mets une chaîne vide
6. Traduis TOUT en français ET en anglais (utilise des traductions de qualité)
7. Pour le genre, choisis parmi : Fiction, Documentary, Short Film, Animation
8. La durée doit être au format : "XX min" (exemple: "88 min")

SECTIONS PERSONNALISÉES (customSections) :
- Utilise-les pour les informations supplémentaires comme : Festivals, Awards, Distribution, etc.
- Chaque section doit avoir un ID unique, un titre bilingue et un contenu bilingue

Retourne-moi UNIQUEMENT un fichier JSON avec cette structure :

{
  "siteId": "LAISSER_VIDE",
  "films": [
    { ...film 1... },
    { ...film 2... },
    { ...film 3... }
  ]
}

Commence maintenant avec tous les films du site.
```

---

## INSTRUCTIONS APRÈS AVOIR REÇU LE JSON DE CHATGPT

1. **Copie le JSON** retourné par ChatGPT
2. **Crée le fichier** `scripts/films.json`
3. **Remplace** `"LAISSER_VIDE"` par ton **siteId** Supabase (trouve-le dans ton dashboard admin ou dans Supabase)
4. **Lance le script** :

```bash
cd 001_app
npx tsx scripts/import-films.ts
```

5. **Ajoute les images** via l'interface admin pour chaque film (poster, backdrop, photos crew)

---

## COMMENT TROUVER TON SITE_ID

Option 1 - Via Supabase Dashboard :
1. Va sur supabase.com
2. Ouvre ta base de données
3. Table Editor → `sites`
4. Copie l'ID de ton site (première colonne)

Option 2 - Via le code :
```bash
cd 001_app
npx tsx -e "import {createClient} from '@supabase/supabase-js'; import {config} from 'dotenv'; config({path:'.env.local'}); const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY); s.from('sites').select('id').then(d=>console.log('Site ID:',d.data[0].id))"
```

---

## RÉSOLUTION DE PROBLÈMES

**Erreur "films.json non trouvé"** :
- Assure-toi que le fichier est dans `001_app/scripts/films.json`

**Erreur "siteId manquant"** :
- Remplace `"LAISSER_VIDE"` par ton vrai siteId dans films.json

**Erreur d'insertion** :
- Vérifie que le format JSON est correct
- Vérifie que tous les champs obligatoires sont présents (slug, title, year, synopsis)

**Certains films ne s'importent pas** :
- Lis les erreurs dans la console
- Vérifie que les slugs sont uniques
- Vérifie qu'il n'y a pas de caractères spéciaux problématiques
