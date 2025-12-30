/**
 * Script de migration pour convertir les données existantes en format bilingue
 *
 * Ce script transforme les champs texte simples en objets TranslatableText { fr: string, en: string }
 *
 * Usage:
 * 1. Assurez-vous d'être dans le répertoire 001_app
 * 2. Exécutez: npx tsx scripts/migrate-to-i18n.ts
 */

// Charger les variables d'environnement depuis .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Vérifier que les variables sont bien chargées
if (!supabaseUrl) {
  console.error('❌ ERREUR: NEXT_PUBLIC_SUPABASE_URL n\'est pas défini dans .env.local')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ ERREUR: SUPABASE_SERVICE_ROLE_KEY n\'est pas défini dans .env.local')
  console.error('   Ajoutez cette clé depuis: Supabase Dashboard → Settings → API → service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TranslatableText {
  fr: string
  en: string
}

/**
 * Convertit une string en objet TranslatableText
 * Si c'est déjà un objet TranslatableText, le retourne tel quel
 */
function toTranslatable(text: string | TranslatableText | undefined): TranslatableText {
  if (!text) return { fr: '', en: '' }
  if (typeof text === 'object' && 'fr' in text && 'en' in text) {
    return text
  }
  // Par défaut, on met le texte français dans les deux langues
  // L'utilisateur pourra ensuite modifier la version anglaise via l'éditeur
  return { fr: text as string, en: text as string }
}

/**
 * Migre les paramètres d'un site vers le format bilingue
 */
function migrateSettings(settings: any): any {
  const migrated = { ...settings }

  // Migrer Theme - Ajouter typography si manquant
  if (migrated.theme && !migrated.theme.typography) {
    migrated.theme.typography = {
      fontFamily: 'Inter',
      headingFont: 'Inter'
    }
  }

  // Migrer Hero
  if (migrated.hero) {
    if (migrated.hero.title) {
      migrated.hero.title = toTranslatable(migrated.hero.title)
    }
    if (migrated.hero.overlayText !== undefined) {
      migrated.hero.overlayText = toTranslatable(migrated.hero.overlayText)
    }
  }

  // Migrer About
  if (migrated.about) {
    if (migrated.about.title) {
      migrated.about.title = toTranslatable(migrated.about.title)
    }
    if (migrated.about.text) {
      migrated.about.text = toTranslatable(migrated.about.text)
    }
  }

  // Migrer Works
  if (migrated.works) {
    if (migrated.works.title) {
      migrated.works.title = toTranslatable(migrated.works.title)
    }
  }

  // Migrer Gallery
  if (migrated.gallery) {
    if (migrated.gallery.title) {
      migrated.gallery.title = toTranslatable(migrated.gallery.title)
    }
  }

  // Migrer In Production
  if (migrated.inProduction) {
    if (migrated.inProduction.title) {
      migrated.inProduction.title = toTranslatable(migrated.inProduction.title)
    }
    if (migrated.inProduction.film) {
      if (migrated.inProduction.film.title) {
        migrated.inProduction.film.title = toTranslatable(migrated.inProduction.film.title)
      }
      if (migrated.inProduction.film.synopsis) {
        migrated.inProduction.film.synopsis = toTranslatable(migrated.inProduction.film.synopsis)
      }
    }
  }

  // Ajouter News section si manquante
  if (!migrated.news) {
    migrated.news = {
      visible: true,
      title: {
        fr: 'Actualités',
        en: 'News'
      },
      articles: []
    }
  }

  return migrated
}

/**
 * Migre les paramètres d'un film (work) vers le format bilingue
 */
function migrateWorkSettings(settings: any): any {
  const migrated = { ...settings }

  // Champs à traduire dans un film
  if (migrated.title) {
    migrated.title = toTranslatable(migrated.title)
  }
  if (migrated.genre) {
    migrated.genre = toTranslatable(migrated.genre)
  }
  if (migrated.synopsis) {
    migrated.synopsis = toTranslatable(migrated.synopsis)
  }
  if (migrated.description) {
    migrated.description = toTranslatable(migrated.description)
  }

  return migrated
}

async function migrateSites() {
  console.log('🚀 Démarrage de la migration vers le format bilingue...\n')

  // 1. Récupérer tous les sites
  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('id, owner_id, settings')

  if (sitesError) {
    console.error('❌ Erreur lors de la récupération des sites:', sitesError)
    return
  }

  console.log(`📦 ${sites.length} site(s) trouvé(s)\n`)

  // 2. Migrer chaque site
  for (const site of sites) {
    console.log(`🔄 Migration du site ${site.id}...`)

    const migratedSettings = migrateSettings(site.settings)

    const { error: updateError } = await supabase
      .from('sites')
      .update({ settings: migratedSettings })
      .eq('id', site.id)

    if (updateError) {
      console.error(`  ❌ Erreur pour le site ${site.id}:`, updateError)
    } else {
      console.log(`  ✅ Site ${site.id} migré avec succès`)
    }
  }

  console.log('\n')
}

async function migrateWorks() {
  console.log('🎬 Migration des films...\n')

  // 1. Récupérer tous les films
  const { data: works, error: worksError } = await supabase
    .from('works')
    .select('id, site_id, slug, settings')

  if (worksError) {
    console.error('❌ Erreur lors de la récupération des films:', worksError)
    return
  }

  console.log(`📦 ${works.length} film(s) trouvé(s)\n`)

  // 2. Migrer chaque film
  for (const work of works) {
    console.log(`🔄 Migration du film "${work.settings.title || work.slug}"...`)

    const migratedSettings = migrateWorkSettings(work.settings)

    const { error: updateError } = await supabase
      .from('works')
      .update({ settings: migratedSettings })
      .eq('id', work.id)

    if (updateError) {
      console.error(`  ❌ Erreur pour le film ${work.id}:`, updateError)
    } else {
      console.log(`  ✅ Film ${work.id} migré avec succès`)
    }
  }

  console.log('\n')
}

async function main() {
  console.log('=' .repeat(60))
  console.log('  MIGRATION VERS LE FORMAT BILINGUE (FR/EN)')
  console.log('=' .repeat(60))
  console.log()

  try {
    await migrateSites()
    await migrateWorks()

    console.log('=' .repeat(60))
    console.log('✅ Migration terminée avec succès!')
    console.log('=' .repeat(60))
    console.log()
    console.log('📝 Prochaines étapes:')
    console.log('   1. Vérifiez vos données dans Supabase')
    console.log('   2. Utilisez l\'éditeur pour ajouter les traductions EN')
    console.log('   3. Testez le sélecteur de langue sur votre site')
    console.log()

  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

main()
