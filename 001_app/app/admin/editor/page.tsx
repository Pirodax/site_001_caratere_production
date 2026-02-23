'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings, Film, CrewMember, PressReview, BuyLink } from '@/types/site'
import { siteDefaults } from '@/lib/config/site-defaults'
import { getWorksBySiteIdClient, createWork, updateWork, deleteWork, type Work } from '@/lib/config/get-works'
import { ImageUpload } from '@/components/ImageUpload'
import { getPosterUrl } from '@/lib/utils/poster-helper'

export default function EditorPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [siteId, setSiteId] = useState<string | null>(null)
  const [settings, setSettings] = useState<SiteSettings>(siteDefaults)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'news' | 'contact' | 'theme' | 'films' | 'footer'>('hero')
  const [works, setWorks] = useState<Work[]>([])
  const [editingWork, setEditingWork] = useState<Work | null>(null)
  const [isCreatingWork, setIsCreatingWork] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Charger dynamiquement les Google Fonts pour l'aperçu
  useEffect(() => {
    const fontFamily = settings.theme.typography?.fontFamily || 'Inter'
    const headingFont = settings.theme.typography?.headingFont || fontFamily

    const fonts = [fontFamily]
    if (headingFont && headingFont !== fontFamily) {
      fonts.push(headingFont)
    }

    // Créer le lien pour Google Fonts
    const fontUrls = fonts.map(font => font.replace(/ /g, '+')).join('&family=')
    const linkId = 'google-fonts-preview'

    // Supprimer l'ancien lien s'il existe
    const oldLink = document.getElementById(linkId)
    if (oldLink) {
      oldLink.remove()
    }

    // Créer le nouveau lien
    const link = document.createElement('link')
    link.id = linkId
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrls}:wght@300;400;500;600;700;800;900&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [settings.theme.typography])

  useEffect(() => {
    const loadEditor = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin')
        return
      }

      // Vérifier que l'utilisateur est bien le propriétaire autorisé de CE déploiement
      const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_ADMIN_EMAIL
      if (allowedEmail && user.email !== allowedEmail) {
        await supabase.auth.signOut()
        router.push('/')
        return
      }

      setUser(user)

      // Récupérer le site de l'utilisateur
      const { data: site } = await supabase
        .from('sites')
        .select('id, settings')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (site) {
        setSiteId(site.id)
        // Merger les settings avec les defaults pour éviter les valeurs manquantes
        setSettings({ ...siteDefaults, ...site.settings as SiteSettings })

        // Charger les works
        const worksData = await getWorksBySiteIdClient(site.id)
        setWorks(worksData)
      }

      setLoading(false)
    }

    loadEditor()
  }, [router, supabase])

  const handleSave = async () => {
    if (!siteId) return

    setSaving(true)

    const { error } = await supabase
      .from('sites')
      .update({ settings })
      .eq('id', siteId)

    if (error) {
      alert('Erreur lors de la sauvegarde: ' + error.message)
    } else {
      alert('Modifications sauvegardées avec succès!')
    }

    setSaving(false)
  }

  const updateSettings = (path: string[], value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      let current: any = newSettings

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {}
        }
        current = current[path[i]]
      }

      current[path[path.length - 1]] = value
      return newSettings
    })
  }

  // Helper pour obtenir une valeur imbriquée avec fallback
  const getNestedValue = (obj: any, path: string[], fallback: any = ''): any => {
    let current = obj
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return fallback
      }
    }
    return current ?? fallback
  }

  // Fonctions de gestion des works
  const handleCreateWork = async () => {
    if (!siteId) return

    const newFilm: Film = {
      slug: '',
      title: {
        fr: 'Nouveau film',
        en: 'New film'
      },
      year: new Date().getFullYear(),
      poster: '',
      description: {
        fr: '',
        en: ''
      },
      synopsis: {
        fr: '',
        en: ''
      },
      trailer: '',
      duration: '',
      genre: {
        fr: '',
        en: ''
      },
      director: '',
      crew: []
    }

    const result = await createWork(siteId, newFilm)

    if (result.success && result.workId) {
      // Recharger les works
      const worksData = await getWorksBySiteIdClient(siteId)
      setWorks(worksData)
      // Ouvrir l'éditeur pour ce nouveau work
      const newWork = worksData.find(w => w.id === result.workId)
      if (newWork) {
        setEditingWork(newWork)
        setIsCreatingWork(false)
      }
    } else {
      alert('Erreur lors de la création: ' + result.error)
    }
  }

  const handleUpdateWork = async (workId: string, filmData: Film) => {
    const result = await updateWork(workId, filmData)

    if (result.success) {
      // Recharger les works
      if (siteId) {
        const worksData = await getWorksBySiteIdClient(siteId)
        setWorks(worksData)
        // Mettre à jour le work en édition
        const updatedWork = worksData.find(w => w.id === workId)
        if (updatedWork) {
          setEditingWork(updatedWork)
        }
      }
      alert('Film mis à jour avec succès!')
    } else {
      alert('Erreur lors de la mise à jour: ' + result.error)
    }
  }

  const handleDeleteWork = async (workId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) return

    const result = await deleteWork(workId)

    if (result.success) {
      // Recharger les works
      if (siteId) {
        const worksData = await getWorksBySiteIdClient(siteId)
        setWorks(worksData)
      }
      setEditingWork(null)
      alert('Film supprimé avec succès!')
    } else {
      alert('Erreur lors de la suppression: ' + result.error)
    }
  }

  const updateWorkField = (path: string[], value: any) => {
    if (!editingWork) return

    const newSettings = { ...editingWork.settings }
    let current: any = newSettings

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }

    current[path[path.length - 1]] = value

    setEditingWork({
      ...editingWork,
      settings: newSettings
    })
  }

  const addCrewMember = () => {
    if (!editingWork) return

    const newCrew: CrewMember = {
      name: '',
      role: '',
      image: ''
    }

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        crew: [...(editingWork.settings.crew || []), newCrew]
      }
    })
  }

  const updateCrewMember = (index: number, field: keyof CrewMember, value: string) => {
    if (!editingWork || !editingWork.settings.crew) return

    const updatedCrew = [...editingWork.settings.crew]
    updatedCrew[index] = {
      ...updatedCrew[index],
      [field]: value
    }

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        crew: updatedCrew
      }
    })
  }

  const deleteCrewMember = (index: number) => {
    if (!editingWork || !editingWork.settings.crew) return

    const updatedCrew = editingWork.settings.crew.filter((_, i) => i !== index)

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        crew: updatedCrew
      }
    })
  }

  // Press Reviews Management
  const addPressReview = () => {
    if (!editingWork) return

    const newReview: PressReview = {
      id: Date.now().toString(),
      title: '',
      source: '',
      url: '',
      language: 'fr'
    }

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        pressReviews: [...(editingWork.settings.pressReviews || []), newReview]
      }
    })
  }

  const updatePressReview = (index: number, field: keyof PressReview, value: string) => {
    if (!editingWork || !editingWork.settings.pressReviews) return

    const updatedReviews = [...editingWork.settings.pressReviews]
    updatedReviews[index] = {
      ...updatedReviews[index],
      [field]: value
    }

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        pressReviews: updatedReviews
      }
    })
  }

  const deletePressReview = (index: number) => {
    if (!editingWork || !editingWork.settings.pressReviews) return

    const updatedReviews = editingWork.settings.pressReviews.filter((_, i) => i !== index)

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        pressReviews: updatedReviews
      }
    })
  }

  // Buy Links Management
  const addBuyLink = () => {
    if (!editingWork) return

    const newLink: BuyLink = {
      id: Date.now().toString(),
      platform: '',
      url: '',
      logo: ''
    }

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        buyLinks: [...(editingWork.settings.buyLinks || []), newLink]
      }
    })
  }

  const updateBuyLink = (index: number, field: keyof BuyLink, value: string) => {
    if (!editingWork || !editingWork.settings.buyLinks) return

    const updatedLinks = [...editingWork.settings.buyLinks]
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    }

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        buyLinks: updatedLinks
      }
    })
  }

  const deleteBuyLink = (index: number) => {
    if (!editingWork || !editingWork.settings.buyLinks) return

    const updatedLinks = editingWork.settings.buyLinks.filter((_, i) => i !== index)

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        buyLinks: updatedLinks
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement de l'éditeur...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Éditeur de site</h1>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Prévisualiser
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Sections */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-white font-semibold mb-4">Sections</h2>
              <nav className="space-y-2">
                {[
                  { id: 'hero', label: 'Hero', icon: '🎬' },
                  { id: 'about', label: 'À propos', icon: '📖' },
                  { id: 'films', label: 'Films', icon: '🎥' },
                  { id: 'news', label: 'Actualités', icon: '📰' },
                  { id: 'contact', label: 'Contact', icon: '📧' },
                  { id: 'theme', label: 'Thème', icon: '🎨' },
                  { id: 'footer', label: 'Footer', icon: '©️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-black font-semibold'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              {/* Hero Section */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Section Hero</h2>

                  {/* Titre FR/EN */}
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Titre</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Français</label>
                        <input
                          type="text"
                          value={settings.hero.title?.fr || ''}
                          onChange={(e) => updateSettings(['hero', 'title', 'fr'], e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="CARACTÈRE"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">English</label>
                        <input
                          type="text"
                          value={settings.hero.title?.en || ''}
                          onChange={(e) => updateSettings(['hero', 'title', 'en'], e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="CHARACTER"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Texte de superposition FR/EN */}
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Texte de superposition</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Français</label>
                        <input
                          type="text"
                          value={settings.hero.overlayText?.fr || ''}
                          onChange={(e) => updateSettings(['hero', 'overlayText', 'fr'], e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="Productions Cinématographiques"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">English</label>
                        <input
                          type="text"
                          value={settings.hero.overlayText?.en || ''}
                          onChange={(e) => updateSettings(['hero', 'overlayText', 'en'], e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="Film Productions"
                        />
                      </div>
                    </div>
                  </div>

                  <ImageUpload
                    currentImage={settings.hero.imageUrl}
                    onImageUploaded={(url) => updateSettings(['hero', 'imageUrl'], url)}
                    siteId={siteId || ''}
                    folder="hero"
                    label="Image de fond"
                  />

                  <div>
                    <label className="block text-sm text-white/60 mb-2">URL de la vidéo (optionnel)</label>
                    <input
                      type="text"
                      value={settings.hero.videoUrl || ''}
                      onChange={(e) => updateSettings(['hero', 'videoUrl'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {/* About Section */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Section À propos</h2>

                  {/* Titre FR/EN */}
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Titre</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Français</label>
                        <input
                          type="text"
                          value={settings.about.title?.fr || ''}
                          onChange={(e) => updateSettings(['about', 'title', 'fr'], e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="À propos"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">English</label>
                        <input
                          type="text"
                          value={settings.about.title?.en || ''}
                          onChange={(e) => updateSettings(['about', 'title', 'en'], e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="About"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Texte FR/EN */}
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Texte</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Français</label>
                        <textarea
                          value={settings.about.text?.fr || ''}
                          onChange={(e) => updateSettings(['about', 'text', 'fr'], e.target.value)}
                          rows={8}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                          placeholder="Texte de présentation en français..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">English</label>
                        <textarea
                          value={settings.about.text?.en || ''}
                          onChange={(e) => updateSettings(['about', 'text', 'en'], e.target.value)}
                          rows={8}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                          placeholder="Presentation text in English..."
                        />
                      </div>
                    </div>
                  </div>

                  <ImageUpload
                    currentImage={settings.about.image}
                    onImageUploaded={(url) => updateSettings(['about', 'image'], url)}
                    siteId={siteId || ''}
                    folder="about"
                    label="Image de la section"
                  />
                </div>
              )}

              {/* Films Section */}
              {activeTab === 'films' && (
                <div className="space-y-6">
                  {!editingWork ? (
                    // Liste des films
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Gestion des Films</h2>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCreateWork}
                          className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all"
                        >
                          + Ajouter un film
                        </motion.button>
                      </div>

                      {/* Titre de la section Films FR/EN */}
                      <div className="mb-6">
                        <label className="block text-sm text-white/60 mb-3">Titre de la section</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-white/40 mb-2">Français</label>
                            <input
                              type="text"
                              value={getNestedValue(settings, ['works', 'title', 'fr'], 'Nos Films')}
                              onChange={(e) => updateSettings(['works', 'title', 'fr'], e.target.value)}
                              placeholder="Nos Films"
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/40 mb-2">English</label>
                            <input
                              type="text"
                              value={getNestedValue(settings, ['works', 'title', 'en'], 'Our Films')}
                              onChange={(e) => updateSettings(['works', 'title', 'en'], e.target.value)}
                              placeholder="Our Films"
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>
                        </div>
                      </div>

                      {works.length === 0 ? (
                        <div className="text-center py-12 text-white/60">
                          <p className="mb-4">Aucun film pour le moment</p>
                          <p className="text-sm">Cliquez sur "Ajouter un film" pour commencer</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {works.map((work) => (
                            <motion.div
                              key={work.id}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden cursor-pointer"
                              onClick={() => setEditingWork(work)}
                            >
                              {work.settings.poster && (
                                <img
                                  src={getPosterUrl(work.settings.poster, 'fr')}
                                  alt={typeof work.settings.title === 'object' ? work.settings.title.fr : work.settings.title}
                                  className="w-full h-48 object-cover"
                                />
                              )}
                              <div className="p-4">
                                <h3 className="text-white font-semibold text-lg mb-1">
                                  {typeof work.settings.title === 'object' ? work.settings.title.fr : work.settings.title}
                                </h3>
                                <p className="text-white/60 text-sm">
                                  {work.settings.year} • {work.settings.director || 'Réalisateur non défini'}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Éditeur de film
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setEditingWork(null)}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                          </button>
                          <h2 className="text-2xl font-bold text-white">
                            Éditer: {typeof editingWork.settings.title === 'object' ? editingWork.settings.title.fr : editingWork.settings.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteWork(editingWork.id)}
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
                          >
                            Supprimer
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateWork(editingWork.id, editingWork.settings)}
                            className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all"
                          >
                            Sauvegarder
                          </motion.button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Titre FR/EN */}
                        <div>
                          <label className="block text-sm text-white/60 mb-3">Titre</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-white/40 mb-2">Français</label>
                              <input
                                type="text"
                                value={editingWork.settings.title?.fr || ''}
                                onChange={(e) => updateWorkField(['title', 'fr'], e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                                placeholder="Le titre du film"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/40 mb-2">English</label>
                              <input
                                type="text"
                                value={editingWork.settings.title?.en || ''}
                                onChange={(e) => updateWorkField(['title', 'en'], e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                                placeholder="The film title"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-white/60 mb-2">Année</label>
                            <input
                              type="number"
                              value={editingWork.settings.year}
                              onChange={(e) => updateWorkField(['year'], parseInt(e.target.value))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-white/60 mb-2">Réalisateur</label>
                            <input
                              type="text"
                              value={editingWork.settings.director || ''}
                              onChange={(e) => updateWorkField(['director'], e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-white/60 mb-2">Durée</label>
                            <input
                              type="text"
                              value={editingWork.settings.duration || ''}
                              onChange={(e) => updateWorkField(['duration'], e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                              placeholder="120 min"
                            />
                          </div>
                        </div>

                        {/* Genre FR/EN */}
                        <div>
                          <label className="block text-sm text-white/60 mb-3">Genre</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-white/40 mb-2">Français</label>
                              <input
                                type="text"
                                value={editingWork.settings.genre?.fr || ''}
                                onChange={(e) => updateWorkField(['genre', 'fr'], e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                                placeholder="Drame"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/40 mb-2">English</label>
                              <input
                                type="text"
                                value={editingWork.settings.genre?.en || ''}
                                onChange={(e) => updateWorkField(['genre', 'en'], e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                                placeholder="Drama"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Affiche du film - Version bilingue */}
                        <div>
                          <label className="block text-sm text-white/60 mb-3">Affiche du film (portrait)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-white/40 mb-2">Français</label>
                              <ImageUpload
                                currentImage={
                                  typeof editingWork.settings.poster === 'object' && editingWork.settings.poster
                                    ? editingWork.settings.poster.fr || ''
                                    : typeof editingWork.settings.poster === 'string'
                                    ? editingWork.settings.poster
                                    : ''
                                }
                                onImageUploaded={(url) => {
                                  const current = editingWork.settings.poster
                                  const newPoster = {
                                    fr: url,
                                    en: typeof current === 'object' && current ? current.en || '' : ''
                                  }
                                  updateWorkField(['poster'], newPoster)
                                }}
                                siteId={siteId || ''}
                                folder="posters"
                                label=""
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/40 mb-2">English</label>
                              <ImageUpload
                                currentImage={
                                  typeof editingWork.settings.poster === 'object' && editingWork.settings.poster
                                    ? editingWork.settings.poster.en || ''
                                    : ''
                                }
                                onImageUploaded={(url) => {
                                  const current = editingWork.settings.poster
                                  const newPoster = {
                                    fr: typeof current === 'object' && current ? current.fr || '' : typeof current === 'string' ? current : '',
                                    en: url
                                  }
                                  updateWorkField(['poster'], newPoster)
                                }}
                                siteId={siteId || ''}
                                folder="posters"
                                label=""
                              />
                            </div>
                          </div>
                          <p className="text-xs text-white/40 mt-2">
                            Si une seule langue est définie, elle sera utilisée pour toutes les langues
                          </p>
                        </div>

                        <ImageUpload
                          currentImage={editingWork.settings.backdrop || ''}
                          onImageUploaded={(url) => updateWorkField(['backdrop'], url)}
                          siteId={siteId || ''}
                          folder="backdrops"
                          label="Image de fond paysage (optionnel - pour un rendu immersif)"
                        />

                        <div>
                          <label className="block text-sm text-white/60 mb-2">URL de la bande-annonce (optionnel)</label>
                          <input
                            type="text"
                            value={editingWork.settings.trailer || ''}
                            onChange={(e) => updateWorkField(['trailer'], e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            placeholder="https://..."
                          />
                        </div>

                        {/* Description FR/EN */}
                        <div>
                          <label className="block text-sm text-white/60 mb-3">Description courte</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-white/40 mb-2">Français</label>
                              <textarea
                                value={editingWork.settings.description?.fr || ''}
                                onChange={(e) => updateWorkField(['description', 'fr'], e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                                placeholder="Description courte..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/40 mb-2">English</label>
                              <textarea
                                value={editingWork.settings.description?.en || ''}
                                onChange={(e) => updateWorkField(['description', 'en'], e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                                placeholder="Short description..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Titre Synopsis personnalisé (optionnel) */}
                        <div>
                          <label className="block text-sm text-white/60 mb-3">Titre de la section Synopsis (optionnel)</label>
                          <p className="text-xs text-white/40 mb-3">Laissez vide pour utiliser "Synopsis" par défaut</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={editingWork.settings.synopsisTitle?.fr || ''}
                              onChange={(e) => updateWorkField(['synopsisTitle', 'fr'], e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                              placeholder="Synopsis (par défaut)"
                            />
                            <input
                              type="text"
                              value={editingWork.settings.synopsisTitle?.en || ''}
                              onChange={(e) => updateWorkField(['synopsisTitle', 'en'], e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                              placeholder="Synopsis (default)"
                            />
                          </div>
                        </div>

                        {/* Synopsis FR/EN */}
                        <div>
                          <label className="block text-sm text-white/60 mb-3">Synopsis</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-white/40 mb-2">Français</label>
                              <textarea
                                value={editingWork.settings.synopsis?.fr || ''}
                                onChange={(e) => updateWorkField(['synopsis', 'fr'], e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                                placeholder="Le synopsis en français..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/40 mb-2">English</label>
                              <textarea
                                value={editingWork.settings.synopsis?.en || ''}
                                onChange={(e) => updateWorkField(['synopsis', 'en'], e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                                placeholder="The synopsis in English..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Sections personnalisées */}
                        <div className="border-t border-white/10 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Sections personnalisées</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const newSection = {
                                  id: Date.now().toString(),
                                  title: { fr: 'Nouvelle section', en: 'New section' },
                                  content: { fr: '', en: '' }
                                }
                                const sections = editingWork.settings.customSections || []
                                updateWorkField(['customSections'], [...sections, newSection])
                              }}
                              className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all"
                            >
                              + Ajouter une section
                            </motion.button>
                          </div>

                          {editingWork.settings.customSections && editingWork.settings.customSections.length > 0 ? (
                            <div className="space-y-6">
                              {editingWork.settings.customSections.map((section, index) => (
                                <div key={section.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                                  <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-white font-semibold">Section {index + 1}</h4>
                                    <button
                                      onClick={() => {
                                        const sections = editingWork.settings.customSections?.filter((_, i) => i !== index) || []
                                        updateWorkField(['customSections'], sections)
                                      }}
                                      className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                      Supprimer
                                    </button>
                                  </div>

                                  <div className="space-y-4">
                                    {/* Titre FR/EN */}
                                    <div>
                                      <label className="block text-sm text-white/60 mb-2">Titre de la section</label>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                          type="text"
                                          placeholder="Titre (FR)"
                                          value={section.title.fr}
                                          onChange={(e) => {
                                            const sections = [...(editingWork.settings.customSections || [])]
                                            sections[index] = { ...sections[index], title: { ...sections[index].title, fr: e.target.value } }
                                            updateWorkField(['customSections'], sections)
                                          }}
                                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Title (EN)"
                                          value={section.title.en}
                                          onChange={(e) => {
                                            const sections = [...(editingWork.settings.customSections || [])]
                                            sections[index] = { ...sections[index], title: { ...sections[index].title, en: e.target.value } }
                                            updateWorkField(['customSections'], sections)
                                          }}
                                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                        />
                                      </div>
                                    </div>

                                    {/* Contenu FR/EN */}
                                    <div>
                                      <label className="block text-sm text-white/60 mb-2">Contenu</label>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <textarea
                                          placeholder="Contenu (FR)"
                                          value={section.content.fr}
                                          onChange={(e) => {
                                            const sections = [...(editingWork.settings.customSections || [])]
                                            sections[index] = { ...sections[index], content: { ...sections[index].content, fr: e.target.value } }
                                            updateWorkField(['customSections'], sections)
                                          }}
                                          rows={6}
                                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 resize-y"
                                        />
                                        <textarea
                                          placeholder="Content (EN)"
                                          value={section.content.en}
                                          onChange={(e) => {
                                            const sections = [...(editingWork.settings.customSections || [])]
                                            sections[index] = { ...sections[index], content: { ...sections[index].content, en: e.target.value } }
                                            updateWorkField(['customSections'], sections)
                                          }}
                                          rows={6}
                                          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 resize-y"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm text-center py-4">
                              Aucune section personnalisée. Cliquez sur "Ajouter une section" pour commencer.
                            </p>
                          )}
                        </div>

                        {/* Section Press Reviews */}
                        <div className="border-t border-white/10 pt-6 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Revues de presse</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={addPressReview}
                              className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all"
                            >
                              + Ajouter un article
                            </motion.button>
                          </div>

                          {editingWork.settings.pressReviews && editingWork.settings.pressReviews.length > 0 ? (
                            <div className="space-y-4">
                              {editingWork.settings.pressReviews.map((review, index) => (
                                <div key={review.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-1 space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-xs text-white/40 mb-2">Titre de l'article</label>
                                          <input
                                            type="text"
                                            value={review.title}
                                            onChange={(e) => updatePressReview(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                            placeholder="Ex: Une critique élogieuse"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-white/40 mb-2">Source</label>
                                          <input
                                            type="text"
                                            value={review.source}
                                            onChange={(e) => updatePressReview(index, 'source', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                            placeholder="Ex: Le Monde"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-xs text-white/40 mb-2">URL de l'article</label>
                                          <input
                                            type="url"
                                            value={review.url}
                                            onChange={(e) => updatePressReview(index, 'url', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                            placeholder="https://..."
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-white/40 mb-2">Langue</label>
                                          <select
                                            value={review.language}
                                            onChange={(e) => updatePressReview(index, 'language', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                          >
                                            <option value="fr">Français</option>
                                            <option value="en">English</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deletePressReview(index)}
                                      className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30 transition-all shrink-0"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm text-center py-4">
                              Aucun article de presse. Cliquez sur "Ajouter" pour commencer.
                            </p>
                          )}
                        </div>

                        {/* Section Buy Links */}
                        <div className="border-t border-white/10 pt-6 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Liens VOD / Achat</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={addBuyLink}
                              className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all"
                            >
                              + Ajouter une plateforme
                            </motion.button>
                          </div>

                          {editingWork.settings.buyLinks && editingWork.settings.buyLinks.length > 0 ? (
                            <div className="space-y-4">
                              {editingWork.settings.buyLinks.map((link, index) => (
                                <div key={link.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-1 space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-xs text-white/40 mb-2">Nom de la plateforme</label>
                                          <input
                                            type="text"
                                            value={link.platform}
                                            onChange={(e) => updateBuyLink(index, 'platform', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                            placeholder="Ex: Amazon Prime Video"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-white/40 mb-2">URL du lien</label>
                                          <input
                                            type="url"
                                            value={link.url}
                                            onChange={(e) => updateBuyLink(index, 'url', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                            placeholder="https://..."
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-xs text-white/40 mb-2">URL du logo (optionnel)</label>
                                        <input
                                          type="url"
                                          value={link.logo || ''}
                                          onChange={(e) => updateBuyLink(index, 'logo', e.target.value)}
                                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                          placeholder="https://... (logo de la plateforme)"
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deleteBuyLink(index)}
                                      className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30 transition-all shrink-0"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm text-center py-4">
                              Aucune plateforme VOD. Cliquez sur "Ajouter" pour commencer.
                            </p>
                          )}
                        </div>

                        {/* Section Équipe */}
                        <div className="border-t border-white/10 pt-6 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Équipe</h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={addCrewMember}
                              className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all"
                            >
                              + Ajouter
                            </motion.button>
                          </div>

                          {editingWork.settings.crew && editingWork.settings.crew.length > 0 ? (
                            <div className="space-y-4">
                              {editingWork.settings.crew.map((member, index) => (
                                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                  <div className="flex items-start gap-4">
                                    {/* Informations du membre de l'équipe */}
                                    <div className="flex-1 space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-xs text-white/60 mb-2">Nom</label>
                                          <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => updateCrewMember(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/40"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-white/60 mb-2">Rôle</label>
                                          <input
                                            type="text"
                                            value={member.role}
                                            onChange={(e) => updateCrewMember(index, 'role', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/40"
                                          />
                                        </div>
                                      </div>

                                      {/* Upload d'image */}
                                      <ImageUpload
                                        currentImage={member.image}
                                        onImageUploaded={(url) => updateCrewMember(index, 'image', url)}
                                        siteId={siteId || ''}
                                        folder="crew"
                                        label="Photo du membre de l'équipe"
                                      />
                                    </div>

                                    {/* Bouton supprimer */}
                                    <button
                                      onClick={() => deleteCrewMember(index)}
                                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all mt-6"
                                      title="Supprimer ce membre de l'équipe"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm text-center py-4">
                              Aucun membre de l'équipe. Cliquez sur "Ajouter" pour commencer.
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* News Section */}
              {activeTab === 'news' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Section Actualités</h2>

                    {/* Toggle Visibility */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/60">
                        {settings.news?.visible ? 'Visible' : 'Masquée'}
                      </span>
                      <button
                        onClick={() => updateSettings(['news', 'visible'], !settings.news?.visible)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.news?.visible ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                            settings.news?.visible ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Titre de la section FR/EN */}
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Titre de la section</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Français</label>
                        <input
                          type="text"
                          value={settings.news?.title?.fr || ''}
                          onChange={(e) => updateSettings(['news', 'title', 'fr'], e.target.value)}
                          placeholder="Actualités"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">English</label>
                        <input
                          type="text"
                          value={settings.news?.title?.en || ''}
                          onChange={(e) => updateSettings(['news', 'title', 'en'], e.target.value)}
                          placeholder="News"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Articles */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Articles</h3>
                      <button
                        onClick={() => {
                          const newArticle = {
                            id: Date.now().toString(),
                            title: { fr: 'Nouvel article', en: 'New article' },
                            excerpt: { fr: 'Extrait...', en: 'Excerpt...' },
                            content: { fr: 'Contenu...', en: 'Content...' },
                            image: '',
                            date: new Date().toISOString(),
                            slug: `article-${Date.now()}`
                          }
                          const articles = settings.news?.articles || []
                          updateSettings(['news', 'articles'], [...articles, newArticle])
                        }}
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-semibold"
                      >
                        + Ajouter un article
                      </button>
                    </div>

                    {settings.news?.articles && settings.news.articles.length > 0 ? (
                      <div className="space-y-4">
                        {settings.news.articles.map((article, index) => (
                          <div key={article.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-white font-semibold">Article {index + 1}</h4>
                              <button
                                onClick={() => {
                                  const articles = settings.news?.articles?.filter((_, i) => i !== index) || []
                                  updateSettings(['news', 'articles'], articles)
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Supprimer
                              </button>
                            </div>

                            <div className="space-y-4">
                              {/* Titre FR/EN */}
                              <div>
                                <label className="block text-sm text-white/60 mb-2">Titre</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input
                                    type="text"
                                    placeholder="Titre (FR)"
                                    value={article.title.fr}
                                    onChange={(e) => {
                                      const articles = [...(settings.news?.articles || [])]
                                      articles[index] = { ...articles[index], title: { ...articles[index].title, fr: e.target.value } }
                                      updateSettings(['news', 'articles'], articles)
                                    }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Title (EN)"
                                    value={article.title.en}
                                    onChange={(e) => {
                                      const articles = [...(settings.news?.articles || [])]
                                      articles[index] = { ...articles[index], title: { ...articles[index].title, en: e.target.value } }
                                      updateSettings(['news', 'articles'], articles)
                                    }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                  />
                                </div>
                              </div>

                              {/* Extrait FR/EN */}
                              <div>
                                <label className="block text-sm text-white/60 mb-2">Extrait (court texte affiché sur la carte)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <textarea
                                    placeholder="Extrait (FR)"
                                    value={article.excerpt.fr}
                                    onChange={(e) => {
                                      const articles = [...(settings.news?.articles || [])]
                                      articles[index] = { ...articles[index], excerpt: { ...articles[index].excerpt, fr: e.target.value } }
                                      updateSettings(['news', 'articles'], articles)
                                    }}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 resize-none"
                                  />
                                  <textarea
                                    placeholder="Excerpt (EN)"
                                    value={article.excerpt.en}
                                    onChange={(e) => {
                                      const articles = [...(settings.news?.articles || [])]
                                      articles[index] = { ...articles[index], excerpt: { ...articles[index].excerpt, en: e.target.value } }
                                      updateSettings(['news', 'articles'], articles)
                                    }}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 resize-none"
                                  />
                                </div>
                              </div>

                              {/* Contenu complet FR/EN */}
                              <div>
                                <label className="block text-sm text-white/60 mb-2">Contenu complet (affiché dans le popup)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <textarea
                                    placeholder="Contenu complet de l'article (FR)"
                                    value={article.content?.fr || ''}
                                    onChange={(e) => {
                                      const articles = [...(settings.news?.articles || [])]
                                      articles[index] = {
                                        ...articles[index],
                                        content: {
                                          fr: e.target.value,
                                          en: articles[index].content?.en || ''
                                        }
                                      }
                                      updateSettings(['news', 'articles'], articles)
                                    }}
                                    rows={8}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 resize-y"
                                  />
                                  <textarea
                                    placeholder="Full article content (EN)"
                                    value={article.content?.en || ''}
                                    onChange={(e) => {
                                      const articles = [...(settings.news?.articles || [])]
                                      articles[index] = {
                                        ...articles[index],
                                        content: {
                                          fr: articles[index].content?.fr || '',
                                          en: e.target.value
                                        }
                                      }
                                      updateSettings(['news', 'articles'], articles)
                                    }}
                                    rows={8}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 resize-y"
                                  />
                                </div>
                              </div>

                              {/* Image */}
                              <div>
                                <ImageUpload
                                  currentImage={article.image || ''}
                                  onImageUploaded={(url) => {
                                    const articles = [...(settings.news?.articles || [])]
                                    articles[index] = { ...articles[index], image: url }
                                    updateSettings(['news', 'articles'], articles)
                                  }}
                                  siteId={siteId || ''}
                                  folder="news"
                                  label="Image de l'article"
                                />
                              </div>

                              {/* Date */}
                              <div>
                                <label className="block text-sm text-white/60 mb-2">Date</label>
                                <input
                                  type="date"
                                  value={article.date.split('T')[0]}
                                  onChange={(e) => {
                                    const articles = [...(settings.news?.articles || [])]
                                    articles[index] = { ...articles[index], date: new Date(e.target.value).toISOString() }
                                    updateSettings(['news', 'articles'], articles)
                                  }}
                                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/60">
                        <p>Aucun article. Cliquez sur "Ajouter un article" pour commencer.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Section Contact</h2>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.contact.email}
                      onChange={(e) => updateSettings(['contact', 'email'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={settings.contact.phone || ''}
                      onChange={(e) => updateSettings(['contact', 'phone'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={settings.contact.address || ''}
                      onChange={(e) => updateSettings(['contact', 'address'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">URL de la carte (embed)</label>
                    <input
                      type="text"
                      value={settings.contact.mapEmbed || ''}
                      onChange={(e) => updateSettings(['contact', 'mapEmbed'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Section Réseaux Sociaux */}
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Réseaux Sociaux</h3>
                      <button
                        onClick={() => {
                          const newLink = {
                            id: Date.now().toString(),
                            platform: '',
                            url: '',
                            icon: ''
                          }
                          const links = settings.contact.socialLinks || []
                          updateSettings(['contact', 'socialLinks'], [...links, newLink])
                        }}
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-semibold"
                      >
                        + Ajouter un réseau
                      </button>
                    </div>

                    {settings.contact.socialLinks && settings.contact.socialLinks.length > 0 ? (
                      <div className="space-y-4">
                        {settings.contact.socialLinks.map((link, index) => (
                          <div key={link.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-white font-medium">Réseau {index + 1}</span>
                              <button
                                onClick={() => {
                                  const links = settings.contact.socialLinks?.filter((_, i) => i !== index) || []
                                  updateSettings(['contact', 'socialLinks'], links)
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Supprimer
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs text-white/40 mb-2">Nom du réseau</label>
                                <input
                                  type="text"
                                  placeholder="Instagram, Facebook, etc."
                                  value={link.platform}
                                  onChange={(e) => {
                                    const links = [...(settings.contact.socialLinks || [])]
                                    links[index] = { ...links[index], platform: e.target.value }
                                    updateSettings(['contact', 'socialLinks'], links)
                                  }}
                                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/40 mb-2">URL du profil</label>
                                <input
                                  type="url"
                                  placeholder="https://instagram.com/..."
                                  value={link.url}
                                  onChange={(e) => {
                                    const links = [...(settings.contact.socialLinks || [])]
                                    links[index] = { ...links[index], url: e.target.value }
                                    updateSettings(['contact', 'socialLinks'], links)
                                  }}
                                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/40 mb-2">URL de l&apos;icône</label>
                                <input
                                  type="url"
                                  placeholder="https://... ou laisser vide"
                                  value={link.icon}
                                  onChange={(e) => {
                                    const links = [...(settings.contact.socialLinks || [])]
                                    links[index] = { ...links[index], icon: e.target.value }
                                    updateSettings(['contact', 'socialLinks'], links)
                                  }}
                                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm">Aucun réseau social ajouté</p>
                    )}
                  </div>
                </div>
              )}

              {/* Theme Section */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Thème du site</h2>

                  {/* Typography Section */}
                  <div className="border-b border-white/10 pb-6 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Typographie</h3>

                    <div className="space-y-6">
                      {/* Police principale */}
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Police principale (corps de texte)</label>
                        <select
                          value={settings.theme.typography?.fontFamily || 'Inter'}
                          onChange={(e) => updateSettings(['theme', 'typography', 'fontFamily'], e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          style={{ backgroundColor: '#000' }}
                        >
                          <option value="Inter" style={{ backgroundColor: '#000', color: '#fff' }}>Inter</option>
                          <option value="Roboto" style={{ backgroundColor: '#000', color: '#fff' }}>Roboto</option>
                          <option value="Open Sans" style={{ backgroundColor: '#000', color: '#fff' }}>Open Sans</option>
                          <option value="Lato" style={{ backgroundColor: '#000', color: '#fff' }}>Lato</option>
                          <option value="Montserrat" style={{ backgroundColor: '#000', color: '#fff' }}>Montserrat</option>
                          <option value="Poppins" style={{ backgroundColor: '#000', color: '#fff' }}>Poppins</option>
                          <option value="Raleway" style={{ backgroundColor: '#000', color: '#fff' }}>Raleway</option>
                          <option value="Playfair Display" style={{ backgroundColor: '#000', color: '#fff' }}>Playfair Display</option>
                          <option value="Merriweather" style={{ backgroundColor: '#000', color: '#fff' }}>Merriweather</option>
                          <option value="Nunito" style={{ backgroundColor: '#000', color: '#fff' }}>Nunito</option>
                        </select>

                        {/* Aperçu de la police */}
                        <div className="mt-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                          <p className="text-xs text-white/40 mb-2">Aperçu :</p>
                          <p
                            className="text-white text-base"
                            style={{ fontFamily: `'${settings.theme.typography?.fontFamily || 'Inter'}', sans-serif` }}
                          >
                            Le renard brun rapide saute par-dessus le chien paresseux. 0123456789
                          </p>
                          <p
                            className="text-white/60 text-sm mt-1"
                            style={{ fontFamily: `'${settings.theme.typography?.fontFamily || 'Inter'}', sans-serif` }}
                          >
                            The quick brown fox jumps over the lazy dog.
                          </p>
                        </div>
                      </div>

                      {/* Police des titres */}
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Police des titres (optionnel)</label>
                        <select
                          value={settings.theme.typography?.headingFont || settings.theme.typography?.fontFamily || 'Inter'}
                          onChange={(e) => updateSettings(['theme', 'typography', 'headingFont'], e.target.value)}
                          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          style={{ backgroundColor: '#000' }}
                        >
                          <option value="Inter" style={{ backgroundColor: '#000', color: '#fff' }}>Inter</option>
                          <option value="Roboto" style={{ backgroundColor: '#000', color: '#fff' }}>Roboto</option>
                          <option value="Open Sans" style={{ backgroundColor: '#000', color: '#fff' }}>Open Sans</option>
                          <option value="Lato" style={{ backgroundColor: '#000', color: '#fff' }}>Lato</option>
                          <option value="Montserrat" style={{ backgroundColor: '#000', color: '#fff' }}>Montserrat</option>
                          <option value="Poppins" style={{ backgroundColor: '#000', color: '#fff' }}>Poppins</option>
                          <option value="Raleway" style={{ backgroundColor: '#000', color: '#fff' }}>Raleway</option>
                          <option value="Playfair Display" style={{ backgroundColor: '#000', color: '#fff' }}>Playfair Display</option>
                          <option value="Merriweather" style={{ backgroundColor: '#000', color: '#fff' }}>Merriweather</option>
                          <option value="Nunito" style={{ backgroundColor: '#000', color: '#fff' }}>Nunito</option>
                        </select>

                        {/* Aperçu des titres */}
                        <div className="mt-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                          <p className="text-xs text-white/40 mb-2">Aperçu titres :</p>
                          <h1
                            className="text-white text-3xl font-bold mb-2"
                            style={{ fontFamily: `'${settings.theme.typography?.headingFont || settings.theme.typography?.fontFamily || 'Inter'}', sans-serif` }}
                          >
                            Titre Principal
                          </h1>
                          <h2
                            className="text-white text-2xl font-semibold"
                            style={{ fontFamily: `'${settings.theme.typography?.headingFont || settings.theme.typography?.fontFamily || 'Inter'}', sans-serif` }}
                          >
                            Sous-titre Important
                          </h2>
                        </div>

                        <p className="text-xs text-white/40 mt-2">
                          Si non spécifié, la police principale sera utilisée
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Colors Section */}
                  <h3 className="text-xl font-semibold text-white mb-4">Couleurs</h3>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Couleur principale</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.theme.primary}
                        onChange={(e) => updateSettings(['theme', 'primary'], e.target.value)}
                        className="h-12 w-20 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.theme.primary}
                        onChange={(e) => updateSettings(['theme', 'primary'], e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Couleur accent</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.theme.accent}
                        onChange={(e) => updateSettings(['theme', 'accent'], e.target.value)}
                        className="h-12 w-20 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.theme.accent}
                        onChange={(e) => updateSettings(['theme', 'accent'], e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Couleur du texte</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={settings.theme.text}
                        onChange={(e) => updateSettings(['theme', 'text'], e.target.value)}
                        className="h-12 w-20 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.theme.text}
                        onChange={(e) => updateSettings(['theme', 'text'], e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Nom du site</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => updateSettings(['siteName'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <ImageUpload
                      currentImage={settings.logo?.startsWith('http') || settings.logo?.startsWith('/') ? settings.logo : ''}
                      onImageUploaded={(url) => updateSettings(['logo'], url)}
                      siteId={siteId || ''}
                      folder="logo"
                      label="Logo (image ou texte)"
                    />
                    {/* Option pour utiliser du texte au lieu d'une image */}
                    <div className="mt-4">
                      <label className="block text-sm text-white/60 mb-2">Ou utiliser du texte</label>
                      <input
                        type="text"
                        value={!settings.logo?.startsWith('http') && !settings.logo?.startsWith('/') ? settings.logo || '' : ''}
                        onChange={(e) => updateSettings(['logo'], e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        placeholder="CINEMA"
                      />
                      <p className="text-xs text-white/40 mt-2">
                        Laissez vide pour utiliser l'image uploadée ci-dessus
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Section */}
              {activeTab === 'footer' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Footer (Bas de page)</h2>

                  {/* Copyright FR/EN */}
                  <div>
                    <label className="block text-sm text-white/60 mb-3">Copyright</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Français</label>
                        <input
                          type="text"
                          value={
                            typeof settings.footer?.copyright === 'object' && settings.footer?.copyright
                              ? settings.footer.copyright.fr || ''
                              : typeof settings.footer?.copyright === 'string'
                              ? settings.footer.copyright
                              : ''
                          }
                          onChange={(e) => {
                            const current = settings.footer?.copyright
                            const newCopyright = {
                              fr: e.target.value,
                              en: typeof current === 'object' && current ? current.en || '' : ''
                            }
                            updateSettings(['footer', 'copyright'], newCopyright)
                          }}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="© 2026 Caractères Productions"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">English</label>
                        <input
                          type="text"
                          value={
                            typeof settings.footer?.copyright === 'object' && settings.footer?.copyright
                              ? settings.footer.copyright.en || ''
                              : ''
                          }
                          onChange={(e) => {
                            const current = settings.footer?.copyright
                            const newCopyright = {
                              fr: typeof current === 'object' && current ? current.fr || '' : typeof current === 'string' ? current : '',
                              en: e.target.value
                            }
                            updateSettings(['footer', 'copyright'], newCopyright)
                          }}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="© 2026 Caractères Productions"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      Laissez vide pour utiliser le copyright par défaut. Note: "Site propulsé par Ludovic Bergeron Digital" est automatiquement ajouté et ne peut être modifié.
                    </p>
                  </div>

                  {/* Mentions légales */}
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Mentions légales</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const newNotice = {
                            title: { fr: 'Nouvelle section', en: 'New section' },
                            content: { fr: '', en: '' }
                          }
                          const notices = settings.footer?.legalNotices || []
                          updateSettings(['footer', 'legalNotices'], [...notices, newNotice])
                        }}
                        className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all"
                      >
                        + Ajouter une section
                      </motion.button>
                    </div>

                    {settings.footer?.legalNotices && settings.footer.legalNotices.length > 0 ? (
                      <div className="space-y-6">
                        {settings.footer.legalNotices.map((notice, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-4">
                                {/* Titre FR/EN */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs text-white/40 mb-2">Titre (FR)</label>
                                    <input
                                      type="text"
                                      value={notice.title.fr}
                                      onChange={(e) => {
                                        const notices = [...(settings.footer?.legalNotices || [])]
                                        notices[index] = {
                                          ...notices[index],
                                          title: { ...notices[index].title, fr: e.target.value }
                                        }
                                        updateSettings(['footer', 'legalNotices'], notices)
                                      }}
                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                      placeholder="Ex: Éditeur du site"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-white/40 mb-2">Titre (EN)</label>
                                    <input
                                      type="text"
                                      value={notice.title.en}
                                      onChange={(e) => {
                                        const notices = [...(settings.footer?.legalNotices || [])]
                                        notices[index] = {
                                          ...notices[index],
                                          title: { ...notices[index].title, en: e.target.value }
                                        }
                                        updateSettings(['footer', 'legalNotices'], notices)
                                      }}
                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                      placeholder="Ex: Site Publisher"
                                    />
                                  </div>
                                </div>

                                {/* Contenu FR/EN */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs text-white/40 mb-2">Contenu (FR)</label>
                                    <textarea
                                      value={notice.content.fr}
                                      onChange={(e) => {
                                        const notices = [...(settings.footer?.legalNotices || [])]
                                        notices[index] = {
                                          ...notices[index],
                                          content: { ...notices[index].content, fr: e.target.value }
                                        }
                                        updateSettings(['footer', 'legalNotices'], notices)
                                      }}
                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                      placeholder="Contenu de la section..."
                                      rows={6}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-white/40 mb-2">Contenu (EN)</label>
                                    <textarea
                                      value={notice.content.en}
                                      onChange={(e) => {
                                        const notices = [...(settings.footer?.legalNotices || [])]
                                        notices[index] = {
                                          ...notices[index],
                                          content: { ...notices[index].content, en: e.target.value }
                                        }
                                        updateSettings(['footer', 'legalNotices'], notices)
                                      }}
                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                      placeholder="Section content..."
                                      rows={6}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Bouton supprimer */}
                              <button
                                onClick={() => {
                                  const notices = settings.footer?.legalNotices?.filter((_, i) => i !== index)
                                  updateSettings(['footer', 'legalNotices'], notices)
                                }}
                                className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30 transition-all shrink-0"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm text-center py-4">
                        Aucune section de mentions légales. Cliquez sur "Ajouter une section" pour commencer.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
