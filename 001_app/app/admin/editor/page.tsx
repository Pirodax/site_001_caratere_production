'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings, Film, CrewMember } from '@/types/site'
import { siteDefaults } from '@/lib/config/site-defaults'
import { getWorksBySiteIdClient, createWork, updateWork, deleteWork, type Work } from '@/lib/config/get-works'

export default function EditorPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [siteId, setSiteId] = useState<string | null>(null)
  const [settings, setSettings] = useState<SiteSettings>(siteDefaults)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'theme' | 'films'>('hero')
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
      title: 'Nouveau film',
      year: new Date().getFullYear(),
      poster: '',
      synopsis: '',
      trailer: '',
      duration: '',
      genre: '',
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

  const updateWorkField = (field: keyof Film, value: any) => {
    if (!editingWork) return

    setEditingWork({
      ...editingWork,
      settings: {
        ...editingWork.settings,
        [field]: value
      }
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

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Titre</label>
                    <input
                      type="text"
                      value={settings.hero.title || ''}
                      onChange={(e) => updateSettings(['hero', 'title'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Texte de superposition</label>
                    <input
                      type="text"
                      value={settings.hero.overlayText || ''}
                      onChange={(e) => updateSettings(['hero', 'overlayText'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">URL de l'image</label>
                    <input
                      type="text"
                      value={settings.hero.imageUrl || ''}
                      onChange={(e) => updateSettings(['hero', 'imageUrl'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="https://..."
                    />
                  </div>

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

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Titre</label>
                    <input
                      type="text"
                      value={settings.about.title || ''}
                      onChange={(e) => updateSettings(['about', 'title'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Texte</label>
                    <textarea
                      value={settings.about.text}
                      onChange={(e) => updateSettings(['about', 'text'], e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">URL de l'image</label>
                    <input
                      type="text"
                      value={settings.about.image || ''}
                      onChange={(e) => updateSettings(['about', 'image'], e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="https://..."
                    />
                  </div>
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

                      {/* Titre de la section Films */}
                      <div className="mb-6">
                        <label className="block text-sm text-white/60 mb-2">Titre de la section</label>
                        <input
                          type="text"
                          value={settings.works?.title || ''}
                          onChange={(e) => updateSettings(['works', 'title'], e.target.value)}
                          placeholder="Nos Films"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        />
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
                                  alt={work.settings.title}
                                  className="w-full h-48 object-cover"
                                />
                              )}
                              <div className="p-4">
                                <h3 className="text-white font-semibold text-lg mb-1">
                                  {work.settings.title}
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
                            Éditer: {editingWork.settings.title}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-white/60 mb-2">Titre</label>
                            <input
                              type="text"
                              value={editingWork.settings.title}
                              onChange={(e) => updateWorkField('title', e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-white/60 mb-2">Année</label>
                            <input
                              type="number"
                              value={editingWork.settings.year}
                              onChange={(e) => updateWorkField('year', parseInt(e.target.value))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-white/60 mb-2">Réalisateur</label>
                            <input
                              type="text"
                              value={editingWork.settings.director || ''}
                              onChange={(e) => updateWorkField('director', e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-white/60 mb-2">Genre</label>
                            <input
                              type="text"
                              value={editingWork.settings.genre || ''}
                              onChange={(e) => updateWorkField('genre', e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-white/60 mb-2">Durée</label>
                            <input
                              type="text"
                              value={editingWork.settings.duration || ''}
                              onChange={(e) => updateWorkField('duration', e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                              placeholder="120 min"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-white/60 mb-2">URL de l'affiche</label>
                          <input
                            type="text"
                            value={editingWork.settings.poster}
                            onChange={(e) => updateWorkField('poster', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-white/60 mb-2">URL de la bande-annonce (optionnel)</label>
                          <input
                            type="text"
                            value={editingWork.settings.trailer || ''}
                            onChange={(e) => updateWorkField('trailer', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-white/60 mb-2">Synopsis</label>
                          <textarea
                            value={editingWork.settings.synopsis}
                            onChange={(e) => updateWorkField('synopsis', e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
                          />
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
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <div>
                                      <label className="block text-xs text-white/60 mb-2">URL Image</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={member.image}
                                          onChange={(e) => updateCrewMember(index, 'image', e.target.value)}
                                          className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/40"
                                          placeholder="https://..."
                                        />
                                        <button
                                          onClick={() => deleteCrewMember(index)}
                                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all"
                                        >
                                          🗑
                                        </button>
                                      </div>
                                    </div>
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
