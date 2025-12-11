/**
 * WORKS MANAGER
 * Special editor for managing catalogue/works
 */

'use client'

import React, { useState, useRef } from 'react'
import { useEditor } from '@/contexts/EditorContext'
import { Button } from '@/components/ui'
import { Work } from '@/types/editor'

interface WorkCardProps {
  work: Work
  isEditMode: boolean
  onUpdateCover: (coverUrl: string) => void
  onDelete: () => void
}

function WorkCard({ work, isEditMode, onUpdateCover, onDelete }: WorkCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [coverUrl, setCoverUrl] = useState(work.coverImage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      onUpdateCover(data.url)
      setCoverUrl(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload')
    }
  }

  return (
    <div
      className={`group relative rounded-lg overflow-hidden ${
        isEditMode ? 'cursor-pointer' : ''
      }`}
      onClick={() => {
        if (isEditMode) {
          setIsEditing(true)
        }
      }}
    >
      {/* Work cover image */}
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        <img
          src={coverUrl}
          alt={work.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-work.jpg'
          }}
        />

        {/* Edit mode overlay */}
        {isEditMode && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="px-3 py-2 bg-white rounded-md text-sm font-medium hover:bg-gray-100"
              >
                📷 Changer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Supprimer "${work.title}" ?`)) {
                    onDelete()
                  }
                }}
                className="px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Work title */}
      <div className="p-3 bg-white">
        <h3 className="font-medium text-sm truncate">{work.title}</h3>
        <p className="text-xs text-gray-500 truncate">{work.slug}</p>
      </div>
    </div>
  )
}

interface WorksManagerProps {
  works: Work[]
}

export function WorksManager({ works: initialWorks }: WorksManagerProps) {
  const { state, addWork, updateWorkCover, deleteWork } = useEditor()
  const [works, setWorks] = useState<Work[]>(initialWorks)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddWork = async () => {
    setIsAdding(true)
    try {
      const newWork = await addWork()
      setWorks(prev => [...prev, newWork])
    } catch (error) {
      console.error('Error adding work:', error)
      alert('Erreur lors de l\'ajout du projet')
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateCover = async (workId: string, coverUrl: string) => {
    try {
      await updateWorkCover(workId, coverUrl)
      setWorks(prev =>
        prev.map(w => (w.id === workId ? { ...w, coverImage: coverUrl } : w))
      )
    } catch (error) {
      console.error('Error updating cover:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (workId: string) => {
    try {
      await deleteWork(workId)
      setWorks(prev => prev.filter(w => w.id !== workId))
    } catch (error) {
      console.error('Error deleting work:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const isEditMode = state.mode === 'edit'

  return (
    <div className="space-y-6">
      {/* Header */}
      {isEditMode && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Gestion du Catalogue</h2>
          <Button onClick={handleAddWork} disabled={isAdding}>
            {isAdding ? '⏳ Ajout...' : '➕ Ajouter un projet'}
          </Button>
        </div>
      )}

      {/* Works grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {works.map(work => (
          <WorkCard
            key={work.id}
            work={work}
            isEditMode={isEditMode}
            onUpdateCover={(url) => handleUpdateCover(work.id, url)}
            onDelete={() => handleDelete(work.id)}
          />
        ))}

        {/* Add new work card */}
        {isEditMode && (
          <button
            onClick={handleAddWork}
            disabled={isAdding}
            className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">➕</div>
              <p className="text-sm font-medium text-gray-600">
                {isAdding ? 'Ajout...' : 'Ajouter un projet'}
              </p>
            </div>
          </button>
        )}
      </div>

      {works.length === 0 && !isEditMode && (
        <div className="text-center py-12 text-gray-500">
          <p>Aucun projet pour le moment</p>
        </div>
      )}
    </div>
  )
}
