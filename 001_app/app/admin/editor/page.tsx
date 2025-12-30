'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings, Film, CrewMember } from '@/types/site'
import { siteDefaults } from '@/lib/config/site-defaults'
import { getWorksBySiteIdClient, createWork, updateWork, deleteWork, type Work } from '@/lib/config/get-works'
import { ImageUpload } from '@/components/ImageUpload'

export default function EditorPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [siteId, setSiteId] = useState<string | null>(null)
  const [settings, setSettings] = useState<SiteSettings>(siteDefaults)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'news' | 'contact' | 'theme' | 'films'>('hero')
  const [works, setWorks] = useState<Work[]>([])
  const [editingWork, setEditingWork] = useState<Work | null>(null)
  const [isCreatingWork, setIsCreatingWork] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadEditor = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin')
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
                  { id: 'theme', label: 'Thème', icon: '🎨' }
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
                              value={settings.works?.title?.fr || ''}
                              onChange={(e) => updateSettings(['works', 'title', 'fr'], e.target.value)}
                              placeholder="Nos Films"
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/40 mb-2">English</label>
                            <input
                              type="text"
                              value={settings.works?.title?.en || ''}
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
                                  src={work.settings.poster}
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

                        <ImageUpload
                          currentImage={editingWork.settings.poster}
                          onImageUploaded={(url) => updateWorkField(['poster'], url)}
                          siteId={siteId || ''}
                          folder="posters"
                          label="Affiche du film"
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

                        {/* Section Contributeurs */}
                        <div className="border-t border-white/10 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Contributeurs</h3>
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
                                    {/* Informations du contributeur */}
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
                                        label="Photo du contributeur"
                                      />
                                    </div>

                                    {/* Bouton supprimer */}
                                    <button
                                      onClick={() => deleteCrewMember(index)}
                                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all mt-6"
                                      title="Supprimer ce contributeur"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm text-center py-4">
                              Aucun contributeur. Cliquez sur "Ajouter" pour commencer.
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
                                <label className="block text-sm text-white/60 mb-2">Extrait</label>
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

                              {/* Image & Date */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-white/60 mb-2">Image URL</label>
                                  <input
                                    type="text"
                                    placeholder="https://..."
                                    value={article.image || ''}
                                    onChange={(e) => {
                                      const articles = [...(settings.news?.articles || [])]
                                      articles[index] = { ...articles[index], image: e.target.value }
                                      updateSettings(['news', 'articles'], articles)
                                    }}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                                  />
                                </div>
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
                    <label className="block text-sm text-white/60 mb-2">Logo (URL de l'image ou texte)</label>
                    <input
                      type="text"
                      value={settings.logo || ''}
                      onChange={(e) => updateSettings(['logo'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="https://... ou TEXTE"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      Entrez une URL d'image (http://...) ou du texte
                    </p>
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
