'use client'

import React from 'react'
import { useEditor } from '@/contexts/EditorContext'
import { Button } from '@/components/ui'

export function EditorToolbar() {
  const { state, setMode, setViewport, save, undo, redo, canUndo, canRedo, siteDomain } = useEditor()

  return (
    <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">

      {/* Gauche - Mode et Viewport */}
      <div className="flex items-center gap-4">

        {/* Toggle Edit/Preview */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              state.mode === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Éditer
          </button>
          <button
            onClick={() => setMode('navigate')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              state.mode === 'navigate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Prévisualiser
          </button>
        </div>

        {/* Viewport selector */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded transition-colors ${
              state.viewport === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Desktop"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded transition-colors ${
              state.viewport === 'tablet'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Tablette"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded transition-colors ${
              state.viewport === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Mobile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Centre - Titre */}
      <div className="text-white text-sm">
        {siteDomain}
      </div>

      {/* Droite - Actions */}
      <div className="flex items-center gap-2">

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700 transition-colors"
          title="Annuler (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="p-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700 transition-colors"
          title="Refaire (Ctrl+Shift+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        {/* Save */}
        <Button
          onClick={save}
          variant="primary"
          size="sm"
          className="ml-2"
        >
          {state.isSaving ? 'Sauvegarde...' : state.hasUnsavedChanges ? 'Sauvegarder *' : 'Sauvegardé'}
        </Button>
      </div>
    </div>
  )
}
