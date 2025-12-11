'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { EditorState, EditorHistory, EditableElement, Work } from '@/types/editor'
import type { SiteSettings } from '@/types/site'

interface EditorContextType {
  state: EditorState
  settings: SiteSettings
  history: EditorHistory
  siteDomain: string

  // Actions
  updateSettings: (newSettings: SiteSettings) => void
  setMode: (mode: EditorState['mode']) => void
  setViewport: (viewport: EditorState['viewport']) => void
  hoverElement: (id: string | null) => void
  selectElement: (id: string | null) => void
  getSelectedElement: () => EditableElement | null
  updateText: (elementId: string, value: string) => void
  updateImage: (elementId: string, url: string, alt?: string) => void
  updateVideo: (elementId: string, url: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  save: () => Promise<void>
  addWork: () => Promise<Work>
  updateWorkCover: (workId: string, coverUrl: string) => Promise<void>
  deleteWork: (workId: string) => Promise<void>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

interface EditorProviderProps {
  children: React.ReactNode
  siteId: string
  siteDomain: string
  initialSettings: SiteSettings
  onSettingsChange?: (settings: SiteSettings) => Promise<void>
}

export function EditorProvider({
  children,
  siteId,
  siteDomain,
  initialSettings,
  onSettingsChange
}: EditorProviderProps) {
  const [state, setState] = useState<EditorState>({
    mode: 'edit',
    viewport: 'desktop',
    hoveredElementId: null,
    selectedElementId: null,
    isSaving: false,
    lastSavedAt: null,
    hasUnsavedChanges: false
  })

  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [elements, setElements] = useState<Map<string, EditableElement>>(new Map())

  const [history, setHistory] = useState<EditorHistory>({
    past: [],
    present: null,
    future: []
  })

  // Debounced autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastSavedRef = useRef<SiteSettings>(initialSettings)

  const updateSettings = useCallback((newSettings: SiteSettings) => {
    setSettings(newSettings)
    setState(prev => ({ ...prev, hasUnsavedChanges: true }))

    // Debounced autosave (2 seconds)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (onSettingsChange && JSON.stringify(newSettings) !== JSON.stringify(lastSavedRef.current)) {
        try {
          setState(prev => ({ ...prev, isSaving: true }))
          await onSettingsChange(newSettings)
          lastSavedRef.current = newSettings
          setState(prev => ({
            ...prev,
            isSaving: false,
            hasUnsavedChanges: false,
            lastSavedAt: Date.now()
          }))
        } catch (error) {
          console.error('Autosave failed:', error)
          setState(prev => ({ ...prev, isSaving: false }))
        }
      }
    }, 2000)
  }, [onSettingsChange])

  const setMode = useCallback((mode: EditorState['mode']) => {
    setState(prev => ({ ...prev, mode }))
  }, [])

  const setViewport = useCallback((viewport: EditorState['viewport']) => {
    setState(prev => ({ ...prev, viewport }))
  }, [])

  const hoverElement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, hoveredElementId: id }))
  }, [])

  const selectElement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedElementId: id }))
  }, [])

  const getSelectedElement = useCallback((): EditableElement | null => {
    if (!state.selectedElementId) return null
    return elements.get(state.selectedElementId) || null
  }, [state.selectedElementId, elements])

  const updateText = useCallback((elementId: string, value: string) => {
    const element = elements.get(elementId)
    if (!element) return

    const newSettings = { ...settings }
    let current: any = newSettings

    // Navigate to the parent object
    for (let i = 0; i < element.path.length - 1; i++) {
      current = current[element.path[i]]
    }

    // Update the value
    const lastKey = element.path[element.path.length - 1]
    current[lastKey] = value

    updateSettings(newSettings)
  }, [elements, settings, updateSettings])

  const updateImage = useCallback((elementId: string, url: string, alt?: string) => {
    const element = elements.get(elementId)
    if (!element) return

    const newSettings = { ...settings }
    let current: any = newSettings

    // Navigate to the parent object
    for (let i = 0; i < element.path.length - 1; i++) {
      current = current[element.path[i]]
    }

    // Update the value
    const lastKey = element.path[element.path.length - 1]
    current[lastKey] = url

    updateSettings(newSettings)
  }, [elements, settings, updateSettings])

  const updateVideo = useCallback((elementId: string, url: string) => {
    const element = elements.get(elementId)
    if (!element) return

    const newSettings = { ...settings }
    let current: any = newSettings

    // Navigate to the parent object
    for (let i = 0; i < element.path.length - 1; i++) {
      current = current[element.path[i]]
    }

    // Update the value
    const lastKey = element.path[element.path.length - 1]
    current[lastKey] = url

    updateSettings(newSettings)
  }, [elements, settings, updateSettings])

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev

      const previous = prev.past[prev.past.length - 1]
      const newPast = prev.past.slice(0, prev.past.length - 1)

      return {
        past: newPast,
        present: previous,
        future: prev.present ? [prev.present, ...prev.future] : prev.future
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev

      const next = prev.future[0]
      const newFuture = prev.future.slice(1)

      return {
        past: prev.present ? [...prev.past, prev.present] : prev.past,
        present: next,
        future: newFuture
      }
    })
  }, [])

  const canUndo = useCallback(() => {
    return history.past.length > 0
  }, [history.past.length])

  const canRedo = useCallback(() => {
    return history.future.length > 0
  }, [history.future.length])

  const save = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    if (onSettingsChange) {
      try {
        setState(prev => ({ ...prev, isSaving: true }))
        await onSettingsChange(settings)
        lastSavedRef.current = settings
        setState(prev => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: false,
          lastSavedAt: Date.now()
        }))
      } catch (error) {
        console.error('Save failed:', error)
        setState(prev => ({ ...prev, isSaving: false }))
        throw error
      }
    }
  }, [settings, onSettingsChange])

  const addWork = useCallback(async (): Promise<Work> => {
    // Create a new work
    const newWork: Work = {
      id: `work-${Date.now()}`,
      title: 'Nouveau film',
      slug: `film-${Date.now()}`,
      coverImage: '',
      order: settings.films?.length || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newSettings = {
      ...settings,
      films: [...(settings.films || []), {
        title: newWork.title,
        slug: newWork.slug,
        year: new Date().getFullYear(),
        poster: newWork.coverImage,
        description: '',
        director: '',
        trailer: '',
        synopsis: '',
        crew: []
      }]
    }

    updateSettings(newSettings)
    return newWork
  }, [settings, updateSettings])

  const updateWorkCover = useCallback(async (workId: string, coverUrl: string) => {
    // Find and update the work
    const filmIndex = settings.films?.findIndex(f => `work-${f.slug}` === workId)
    if (filmIndex === undefined || filmIndex === -1) return

    const newFilms = [...(settings.films || [])]
    newFilms[filmIndex] = {
      ...newFilms[filmIndex],
      poster: coverUrl
    }

    updateSettings({
      ...settings,
      films: newFilms
    })
  }, [settings, updateSettings])

  const deleteWork = useCallback(async (workId: string) => {
    // Remove the work
    const newFilms = settings.films?.filter(f => `work-${f.slug}` !== workId) || []
    updateSettings({
      ...settings,
      films: newFilms
    })
  }, [settings, updateSettings])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z - Redo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      // Ctrl+S / Cmd+S - Save
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, save])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const value: EditorContextType = {
    state,
    settings,
    history,
    siteDomain,
    updateSettings,
    setMode,
    setViewport,
    hoverElement,
    selectElement,
    getSelectedElement,
    updateText,
    updateImage,
    updateVideo,
    undo,
    redo,
    canUndo,
    canRedo,
    save,
    addWork,
    updateWorkCover,
    deleteWork
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
