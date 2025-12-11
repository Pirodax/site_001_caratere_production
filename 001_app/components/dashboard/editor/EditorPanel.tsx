/**
 * EDITOR PANEL
 * Contextual side panel for editing selected elements
 */

'use client'

import React, { useState, useRef } from 'react'
import { useEditor } from '@/contexts/EditorContext'
import { Button } from '@/components/ui'
import { EditableElement } from '@/types/editor'
import { ImageUploadModal } from './ImageUploadModal'

export function EditorPanel() {
  const { state, settings, updateSettings, getSelectedElement, updateText, updateImage, updateVideo, undo, redo, canUndo, canRedo } = useEditor()
  const [localValue, setLocalValue] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [currentImageTarget, setCurrentImageTarget] = useState<{type: 'section', section: string, field: string} | {type: 'gallery', index: number} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedElement = getSelectedElement()

  // Helper to update section settings
  const updateSectionSettings = (section: string, data: any) => {
    updateSettings({
      ...settings,
      [section]: {
        ...((settings as any)[section] || {}),
        ...data,
      },
    })
  }

  React.useEffect(() => {
    if (selectedElement) {
      setLocalValue(selectedElement.value)
      if (selectedElement.type === 'image') {
        setImageUrl(selectedElement.value)
        setImageAlt(selectedElement.metadata?.alt || '')
      }
      if (selectedElement.type === 'video') {
        setVideoUrl(selectedElement.value)
      }
    }
  }, [selectedElement])

  const handleTextUpdate = () => {
    if (selectedElement && selectedElement.type === 'text') {
      updateText(selectedElement.id, localValue)
    }
  }

  const handleImageUrlUpdate = () => {
    if (selectedElement && selectedElement.type === 'image') {
      // Basic URL validation
      try {
        new URL(imageUrl)
        updateImage(selectedElement.id, imageUrl, imageAlt)
      } catch {
        alert('URL invalide. Veuillez entrer une URL valide.')
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedElement) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('siteId', 'current-site-id') // TODO: Get from context

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      updateImage(selectedElement.id, data.url, imageAlt)
      setImageUrl(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload. Veuillez réessayer.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoUpdate = () => {
    if (selectedElement && selectedElement.type === 'video') {
      // Basic URL validation
      if (videoUrl && !videoUrl.match(/^https?:\/\/.+/)) {
        alert('URL invalide. Veuillez entrer une URL valide.')
        return
      }
      updateVideo(selectedElement.id, videoUrl)
    }
  }

  const openImageModal = (target: {type: 'section', section: string, field: string} | {type: 'gallery', index: number}) => {
    setCurrentImageTarget(target)
    setIsImageModalOpen(true)
  }

  const handleImageSelect = (url: string) => {
    if (!currentImageTarget) return

    if (currentImageTarget.type === 'section') {
      updateSectionSettings(currentImageTarget.section, { [currentImageTarget.field]: url })
    } else if (currentImageTarget.type === 'gallery') {
      const newImages = [...((settings.gallery as any)?.images || [])]
      newImages[currentImageTarget.index] = url
      updateSectionSettings('gallery', { images: newImages })
    }

    setCurrentImageTarget(null)
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Éditeur</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Annuler (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Refaire (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Save status */}
        <div className="flex items-center gap-2 text-sm">
          {state.isSaving ? (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Enregistrement...</span>
            </>
          ) : state.hasUnsavedChanges ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-gray-600">Modifications non sauvegardées</span>
            </>
          ) : state.lastSavedAt ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">
                Sauvegardé {new Date(state.lastSavedAt).toLocaleTimeString('fr-FR')}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {!selectedElement ? (
          /* Formulaire de sections par défaut */
          <div className="space-y-4">
            <div className="pb-3 border-b border-gray-200">
              <h3 className="font-semibold text-sm text-gray-700">Éditer les sections</h3>
             
            </div>

            {/* Hero Section */}
            <div>
              <button
                onClick={() => setActiveSection(activeSection === 'hero' ? '' : 'hero')}
                className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'hero' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                🎯 Section Hero
              </button>
              {activeSection === 'hero' && (
                <div className="mt-3 space-y-3 pl-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Titre</label>
                    <input
                      type="text"
                      value={(settings.hero as any)?.title || ''}
                      onChange={(e) => updateSectionSettings('hero', { title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Sous-titre</label>
                    <input
                      type="text"
                      value={(settings.hero as any)?.subtitle || ''}
                      onChange={(e) => updateSectionSettings('hero', { subtitle: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Texte du bouton</label>
                    <input
                      type="text"
                      value={(settings.hero as any)?.ctaText || ''}
                      onChange={(e) => updateSectionSettings('hero', { ctaText: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Image de fond</label>
                    {(settings.hero as any)?.backgroundImage && (
                      <div className="mb-2 relative aspect-video rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={(settings.hero as any).backgroundImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => openImageModal({ type: 'section', section: 'hero', field: 'backgroundImage' })}
                      className="w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter une image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* About Section */}
            <div>
              <button
                onClick={() => setActiveSection(activeSection === 'about' ? '' : 'about')}
                className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'about' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                📝 Section À Propos
              </button>
              {activeSection === 'about' && (
                <div className="mt-3 space-y-3 pl-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Titre</label>
                    <input
                      type="text"
                      value={(settings.about as any)?.title || ''}
                      onChange={(e) => updateSectionSettings('about', { title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Contenu</label>
                    <textarea
                      value={(settings.about as any)?.content || ''}
                      onChange={(e) => updateSectionSettings('about', { content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Image</label>
                    {(settings.about as any)?.image && (
                      <div className="mb-2 relative aspect-[3/4] rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={(settings.about as any).image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => openImageModal({ type: 'section', section: 'about', field: 'image' })}
                      className="w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter une image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery/Works Section */}
            <div>
              <button
                onClick={() => setActiveSection(activeSection === 'gallery' ? '' : 'gallery')}
                className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'gallery' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                🎬 Section Films/Galerie
              </button>
              {activeSection === 'gallery' && (
                <div className="mt-3 space-y-3 pl-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Titre de la galerie</label>
                    <input
                      type="text"
                      value={(settings.gallery as any)?.title || ''}
                      onChange={(e) => updateSectionSettings('gallery', { title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Images de la galerie</label>
                    <div className="space-y-3">
                      {((settings.gallery as any)?.images || []).filter((url: string) => url && url.trim() !== '').map((imageUrl: string, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="relative aspect-[3/4] rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={imageUrl}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                const currentImages = ((settings.gallery as any)?.images || [])
                                const newImages = currentImages.filter((_: any, i: number) => i !== index)
                                updateSectionSettings('gallery', { images: newImages })
                              }}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                              title="Supprimer cette image"
                            >
                              ✕
                            </button>
                          </div>
                          <button
                            onClick={() => openImageModal({ type: 'gallery', index })}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
                          >
                            Changer l'image
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newImages = [...((settings.gallery as any)?.images || []), '']
                          updateSectionSettings('gallery', { images: newImages })
                          // Open modal immediately for the new image
                          setTimeout(() => {
                            const currentImages = (settings.gallery as any)?.images || []
                            openImageModal({ type: 'gallery', index: currentImages.length - 1 })
                          }, 100)
                        }}
                        className="w-full px-3 py-2 text-sm border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter une image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div>
              <button
                onClick={() => setActiveSection(activeSection === 'contact' ? '' : 'contact')}
                className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'contact' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                📧 Section Contact
              </button>
              {activeSection === 'contact' && (
                <div className="mt-3 space-y-3 pl-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={(settings.contact as any)?.email || ''}
                      onChange={(e) => updateSectionSettings('contact', { email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={(settings.contact as any)?.phone || ''}
                      onChange={(e) => updateSectionSettings('contact', { phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Theme Section */}
            <div>
              <button
                onClick={() => setActiveSection(activeSection === 'theme' ? '' : 'theme')}
                className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                  activeSection === 'theme' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                🎨 Thème
              </button>
              {activeSection === 'theme' && (
                <div className="mt-3 space-y-3 pl-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Couleur primaire</label>
                    <input
                      type="color"
                      value={(settings.theme as any)?.primaryColor || '#C0A060'}
                      onChange={(e) => updateSectionSettings('theme', { primaryColor: e.target.value })}
                      className="w-full h-10 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Couleur secondaire</label>
                    <input
                      type="color"
                      value={(settings.theme as any)?.secondaryColor || '#1a1a1a'}
                      onChange={(e) => updateSectionSettings('theme', { secondaryColor: e.target.value })}
                      className="w-full h-10 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="pb-3 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Type d'élément</p>
              <p className="text-sm font-semibold capitalize">{selectedElement.type}</p>
            </div>

            {/* Text editing */}
            {selectedElement.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Contenu</label>
                  <textarea
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleTextUpdate}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez le texte..."
                  />
                </div>
                <Button onClick={handleTextUpdate} size="sm" className="w-full">
                  Appliquer
                </Button>
              </div>
            )}

            {/* Image editing */}
            {selectedElement.type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL de l'image</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Texte alternatif</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description de l'image"
                  />
                </div>

                <Button onClick={handleImageUrlUpdate} size="sm" className="w-full">
                  Appliquer l'URL
                </Button>

                <div className="relative">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Upload en cours...' : 'Ou uploader un fichier'}
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                {imageUrl && (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-auto"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg'
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Video editing */}
            {selectedElement.type === 'video' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">URL de la vidéo</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/... ou https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formats supportés: YouTube, Vimeo, ou URL directe
                  </p>
                </div>

                <Button onClick={handleVideoUpdate} size="sm" className="w-full">
                  Appliquer
                </Button>
              </div>
            )}

            {/* Element path */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Chemin</p>
              <p className="text-xs font-mono text-gray-600">{selectedElement.path.join(' > ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false)
          setCurrentImageTarget(null)
        }}
        onSelectImage={handleImageSelect}
      />
    </div>
  )
}
