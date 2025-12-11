/**
 * VISUAL EDITOR
 * Main visual editor component with all functionality
 */

'use client'

import React, { useEffect } from 'react'
import { EditorProvider, useEditor } from '@/contexts/EditorContext'
import { EditorToolbar } from './EditorToolbar'
import { EditorPanel } from './EditorPanel'
import { Site, SiteSettings } from '@/types'

function KeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useEditor()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z ou Cmd+Z pour undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (canUndo()) {
          e.preventDefault()
          undo()
        }
      }
      // Ctrl+Shift+Z ou Cmd+Shift+Z pour redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        if (canRedo()) {
          e.preventDefault()
          redo()
        }
      }
      // Ctrl+Y ou Cmd+Y pour redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (canRedo()) {
          e.preventDefault()
          redo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])

  return null
}

function ViewportWrapper({ children }: { children: React.ReactNode }) {
  const { state } = useEditor()

  return (
    <div className="flex-1 bg-gray-50 p-4 flex flex-col min-h-0">
      <div
        className="shadow-2xl transition-all duration-300 mx-auto flex-1 min-h-0 flex flex-col"
        style={{
          width: state.viewport === 'desktop' ? '100%' : '375px',
          maxWidth: state.viewport === 'desktop' ? '100%' : '375px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

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
      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts />

      <div className="min-h-screen flex flex-col">
        {/* Toolbar */}
        <EditorToolbar />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
          {/* Site preview area with viewport wrapper */}
          <ViewportWrapper>
            {children}
          </ViewportWrapper>

          {/* Editor panel */}
          <EditorPanel />
        </div>
      </div>
    </EditorProvider>
  )
}
