'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings } from '@/types/site'
import { siteDefaults } from '@/lib/config/site-defaults'

export default function EditorPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [siteId, setSiteId] = useState<string | null>(null)
  const [settings, setSettings] = useState<SiteSettings>(siteDefaults)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'theme'>('hero')
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
        current = current[path[i]]
      }

      current[path[path.length - 1]] = value
      return newSettings
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
