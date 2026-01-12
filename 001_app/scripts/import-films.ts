import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface Film {
  slug: string
  title: { fr: string; en: string }
  year: number | string
  poster: string
  backdrop?: string
  trailer?: string
  description?: { fr: string; en: string }
  synopsis: { fr: string; en: string }
  synopsisTitle?: { fr: string; en: string }
  customSections?: Array<{
    id: string
    title: { fr: string; en: string }
    content: { fr: string; en: string }
  }>
  duration?: string
  genre?: { fr: string; en: string }
  director?: string
  crew?: Array<{
    name: string
    role: string
    image: string
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
    platform: string
    url: string
    logo?: string
  }>
}

async function importFilms() {
  console.log('🎬 Importation des films...\n')

  // Lire le fichier films.json
  const filmsPath = path.join(process.cwd(), 'scripts', 'films.json')

  if (!fs.existsSync(filmsPath)) {
    console.error('❌ Fichier films.json non trouvé dans scripts/films.json')
    console.log('📝 Créez le fichier avec le format suivant :')
    console.log(JSON.stringify({ films: [] }, null, 2))
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filmsPath, 'utf-8')
  const { films, siteId } = JSON.parse(fileContent) as { films: Film[]; siteId: string }

  if (!siteId) {
    console.error('❌ siteId manquant dans films.json')
    console.log('💡 Ajoutez votre siteId au début du fichier : { "siteId": "votre-site-id", "films": [...] }')
    process.exit(1)
  }

  if (!films || films.length === 0) {
    console.error('❌ Aucun film trouvé dans films.json')
    process.exit(1)
  }

  console.log(`📊 ${films.length} film(s) à importer\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < films.length; i++) {
    const film = films[i]
    console.log(`[${i + 1}/${films.length}] Importation de "${film.title.fr}"...`)

    try {
      // Créer le work dans la base de données
      const { data, error } = await supabase
        .from('works')
        .insert({
          site_id: siteId,
          settings: film
        })
        .select()
        .single()

      if (error) {
        console.error(`   ❌ Erreur: ${error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ Importé avec succès (ID: ${data.id})`)
        successCount++
      }
    } catch (error) {
      console.error(`   ❌ Erreur: ${error}`)
      errorCount++
    }

    console.log('')
  }

  console.log('═'.repeat(50))
  console.log(`✅ ${successCount} film(s) importé(s) avec succès`)
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erreur(s)`)
  }
  console.log('═'.repeat(50))
}

// Lancer l'importation
importFilms().catch(console.error)
