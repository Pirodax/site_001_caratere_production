'use client'

import React from 'react'
import { EditorProvider } from '@/contexts/EditorContext'
import { EditorToolbar } from './EditorToolbar'
import { EditorPanel } from './EditorPanel'
import { Site, SiteSettings } from '@/types'

interface VisualEditorProps {
  site: Site
  onSettingsChange: (settings: SiteSettings) => Promise<void>
  children: React.ReactNode
}

export function VisualEditor({ site, onSettingsChange, children }: VisualEditorProps) {
  return (
    <EditorProvider
      siteId={site.id}
      siteDomain={site.domain || 'localhost:3000'}
      initialSettings={site.settings as SiteSettings}
      onSettingsChange={onSettingsChange}
    >
      {/* Layout principal en plein écran */}
      <div className="h-screen flex flex-col bg-gray-900">

        {/* Toolbar fixe en haut */}
        <EditorToolbar />

        {/* Zone principale avec preview et panel */}
        <div className="flex-1 flex overflow-hidden">

          {/* Zone de preview scrollable à gauche */}
          <div className="flex-1 overflow-y-auto bg-gray-100">
            {children}
          </div>

          {/* Panel d'édition fixe à droite */}
          <EditorPanel />

        </div>
      </div>
    </EditorProvider>
  )
}
