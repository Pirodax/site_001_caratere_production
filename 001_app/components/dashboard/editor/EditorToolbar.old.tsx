/**
 * EDITOR TOOLBAR
 * Top toolbar with mode switch and actions
 */

'use client'

import React from 'react'
import { useEditor } from '@/contexts/EditorContext'
import { Button } from '@/components/ui'

export function EditorToolbar() {
  const { state, siteDomain, setMode, setViewport, save } = useEditor()

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Éditeur Visuel</h1>

        {/* Mode Switch */}
        <div className="flex items-center gap-2 px-1 py-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              state.mode === 'edit'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✏️ Édition
          </button>
          <button
            onClick={() => setMode('navigate')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              state.mode === 'navigate'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🧭 Navigation
          </button>
        </div>

        {/* Viewport Switch */}
        <div className="flex items-center gap-2 px-1 py-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              state.viewport === 'desktop'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Desktop"
          >
            🖥️ Desktop
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              state.viewport === 'mobile'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Mobile"
          >
            📱 Mobile
          </button>
        </div>

        {/* Mode hint */}
        <div className="text-sm text-gray-500">
          {state.mode === 'edit' ? (
            <span>Survolez et cliquez sur les éléments pour les éditer</span>
          ) : (
            <span>Naviguez dans votre site normalement</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Manual save button */}
        <Button
          onClick={save}
          variant="outline"
          size="sm"
          disabled={state.isSaving || !state.hasUnsavedChanges}
        >
          {state.isSaving ? 'Enregistrement...' : 'Enregistrer maintenant'}
        </Button>

        {/* Preview button */}
        <Button
          onClick={() => window.open(`/preview/${siteDomain}`, '_blank')}
          variant="outline"
          size="sm"
        >
          👁️ Prévisualiser
        </Button>

        {/* Publish button */}
        <Button
          onClick={() => window.location.href = '/dashboard/publish'}
          size="sm"
        >
          🚀 Publier
        </Button>
      </div>
    </div>
  )
}
