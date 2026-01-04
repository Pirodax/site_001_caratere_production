/**
 * Script de migration des images HTTP vers Supabase Storage
 *
 * Ce script :
 * 1. Récupère toutes les images HTTP depuis les settings
 * 2. Les télécharge
 * 3. Les upload sur Supabase Storage
 * 4. Met à jour les URLs dans la base de données
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Fonction pour télécharger une image depuis HTTP
async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  console.log(`📥 Téléchargement de ${url}...`)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erreur lors du téléchargement de ${url}: ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') || 'image/jpeg'

  // Extraire le nom du fichier depuis l'URL
  const urlPath = new URL(url).pathname
  const filename = urlPath.split('/').pop() || `image-${Date.now()}.jpg`

  return { buffer, contentType, filename }
}

// Fonction pour uploader une image sur Supabase
async function uploadToSupabase(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  console.log(`📤 Upload de ${filename} vers Supabase...`)

  const { data, error } = await supabase.storage
    .from('images')
    .upload(`migrated/${filename}`, buffer, {
      contentType,
      upsert: true
    })

  if (error) {
    throw new Error(`Erreur lors de l'upload: ${error.message}`)
  }

  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(`migrated/${filename}`)

  return publicUrl
}

// Fonction pour extraire toutes les URLs HTTP d'un objet
function extractHttpUrls(obj: any, urls: Set<string> = new Set()): Set<string> {
  if (typeof obj === 'string' && obj.startsWith('http://')) {
    // Vérifier que c'est une image
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(obj)) {
      urls.add(obj)
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => extractHttpUrls(item, urls))
  } else if (typeof obj === 'object' && obj !== null) {
    Object.values(obj).forEach(value => extractHttpUrls(value, urls))
  }
  return urls
}

// Fonction pour remplacer les URLs dans un objet
function replaceUrls(obj: any, urlMap: Map<string, string>): any {
  if (typeof obj === 'string') {
    return urlMap.get(obj) || obj
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceUrls(item, urlMap))
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {}
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = replaceUrls(value, urlMap)
    }
    return newObj
  }
  return obj
}

async function migrateImages() {
  console.log('🚀 Début de la migration des images...\n')

  try {
    // 1. Récupérer tous les sites
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*')

    if (sitesError) {
      throw new Error(`Erreur lors de la récupération des sites: ${sitesError.message}`)
    }

    if (!sites || sites.length === 0) {
      console.log('❌ Aucun site trouvé')
      return
    }

    console.log(`✅ ${sites.length} site(s) trouvé(s)\n`)

    // 2. Pour chaque site, extraire et migrer les images
    for (const site of sites) {
      console.log(`\n📦 Traitement du site ${site.id}...`)

      const httpUrls = extractHttpUrls(site.settings)

      if (httpUrls.size === 0) {
        console.log('   ℹ️  Aucune image HTTP trouvée')
        continue
      }

      console.log(`   📋 ${httpUrls.size} image(s) HTTP trouvée(s)`)

      // Map pour stocker les anciennes et nouvelles URLs
      const urlMap = new Map<string, string>()

      // 3. Télécharger et uploader chaque image
      for (const httpUrl of httpUrls) {
        try {
          const { buffer, contentType, filename } = await downloadImage(httpUrl)
          const newUrl = await uploadToSupabase(buffer, filename, contentType)
          urlMap.set(httpUrl, newUrl)
          console.log(`   ✅ ${httpUrl} → ${newUrl}`)
        } catch (error) {
          console.error(`   ❌ Erreur pour ${httpUrl}:`, error)
          // Continuer avec les autres images
        }
      }

      // 4. Mettre à jour les settings avec les nouvelles URLs
      if (urlMap.size > 0) {
        const updatedSettings = replaceUrls(site.settings, urlMap)

        const { error: updateError } = await supabase
          .from('sites')
          .update({ settings: updatedSettings })
          .eq('id', site.id)

        if (updateError) {
          console.error(`   ❌ Erreur lors de la mise à jour:`, updateError)
        } else {
          console.log(`   ✅ Settings mis à jour avec ${urlMap.size} nouvelle(s) URL(s)`)
        }
      }
    }

    // 5. Migrer les images des works aussi
    console.log('\n\n📦 Traitement des works...')
    const { data: works, error: worksError } = await supabase
      .from('works')
      .select('*')

    if (worksError) {
      console.error('❌ Erreur lors de la récupération des works:', worksError)
    } else if (works && works.length > 0) {
      console.log(`✅ ${works.length} work(s) trouvé(s)`)

      for (const work of works) {
        const httpUrls = extractHttpUrls(work.settings)

        if (httpUrls.size === 0) {
          continue
        }

        console.log(`\n   📋 Work ${work.id}: ${httpUrls.size} image(s) HTTP trouvée(s)`)

        const urlMap = new Map<string, string>()

        for (const httpUrl of httpUrls) {
          try {
            const { buffer, contentType, filename } = await downloadImage(httpUrl)
            const newUrl = await uploadToSupabase(buffer, filename, contentType)
            urlMap.set(httpUrl, newUrl)
            console.log(`   ✅ ${httpUrl} → ${newUrl}`)
          } catch (error) {
            console.error(`   ❌ Erreur pour ${httpUrl}:`, error)
          }
        }

        if (urlMap.size > 0) {
          const updatedSettings = replaceUrls(work.settings, urlMap)

          const { error: updateError } = await supabase
            .from('works')
            .update({ settings: updatedSettings })
            .eq('id', work.id)

          if (updateError) {
            console.error(`   ❌ Erreur lors de la mise à jour:`, updateError)
          } else {
            console.log(`   ✅ Settings mis à jour`)
          }
        }
      }
    }

    console.log('\n\n✅ Migration terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

// Exécuter la migration
migrateImages()
