'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { uploadImage } from '@/lib/supabase/upload-image'

interface ImageUploadProps {
  currentImage?: string
  onImageUploaded: (url: string) => void
  label?: string
  className?: string
}

export function ImageUpload({
  currentImage,
  onImageUploaded,
  label = 'Image',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image doit faire moins de 5MB')
      return
    }

    // Créer un aperçu local
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload vers Supabase
    setUploading(true)
    try {
      const url = await uploadImage(file)
      if (url) {
        onImageUploaded(url)
      } else {
        alert('Erreur lors de l\'upload de l\'image')
        setPreview(currentImage || null)
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm text-white/60 mb-2">{label}</label>

      <div className="flex items-center gap-4">
        {/* Aperçu de l'image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/20 flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white/30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm rounded-lg border border-white/20 transition-colors"
          >
            {uploading ? 'Upload...' : 'Choisir une image'}
          </motion.button>

          {preview && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setPreview(null)
                onImageUploaded('')
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg border border-red-500/30 transition-colors"
            >
              Supprimer
            </motion.button>
          )}
        </div>
      </div>

      <p className="text-xs text-white/40 mt-2">
        Format acceptés: JPG, PNG, GIF (max 5MB)
      </p>
    </div>
  )
}
