/**
 * EDITOR CONTEXT
 * Manages visual editor state and operations
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import {
  EditorMode,
  ViewportMode,
  EditorState,
  EditorHistory,
  EditorContextValue,
  EditableElement,
  Work,
} from '@/types/editor'
import { SiteSettings } from '@/types'

interface EditorProviderProps {
  children: React.ReactNode
  siteId: string
  siteDomain: string
  initialSettings: SiteSettings
  onSettingsChange: (settings: SiteSettings) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

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
    hasUnsavedChanges: false,
  })

  const [history, setHistory] = useState<EditorHistory>({
    past: [],
    present: null,
    future: [],
  })

  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [elements, setElements] = useState<Map<string, EditableElement>>(new Map())
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const saveFunctionRef = useRef<(() => Promise<void>) | null>(null)

  // Wrapper for updateSettings that triggers autosave
  const updateSettingsWithSave = useCallback((newSettings: SiteSettings) => {
    setSettings(newSettings)
    setState(prev => ({ ...prev, hasUnsavedChanges: true }))

    // Trigger autosave with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (saveFunctionRef.current) {
        saveFunctionRef.current()
      }
    }, 2000) // 2 second debounce
  }, [])

  // Register an editable element
  const registerElement = useCallback((element: EditableElement) => {
    setElements(prev => {
      const newMap = new Map(prev)
      newMap.set(element.id, element)
      return newMap
    })
  }, [])

  // Mode management
  const setMode = useCallback((mode: EditorMode) => {
    setState(prev => ({ ...prev, mode }))
    // Clear selection when switching modes
    if (mode === 'navigate') {
      setState(prev => ({
        ...prev,
        selectedElementId: null,
        hoveredElementId: null
      }))
    }
  }, [])

  const setViewport = useCallback((viewport: ViewportMode) => {
    setState(prev => ({ ...prev, viewport }))
  }, [])

  // Element management
  const hoverElement = useCallback((id: string | null) => {
    if (state.mode === 'edit') {
      setState(prev => ({ ...prev, hoveredElementId: id }))
    }
  }, [state.mode])

  const selectElement = useCallback((id: string | null) => {
    if (state.mode === 'edit') {
      setState(prev => ({ ...prev, selectedElementId: id }))
    }
  }, [state.mode])

  const getSelectedElement = useCallback(() => {
    if (!state.selectedElementId) return null
    return elements.get(state.selectedElementId) || null
  }, [state.selectedElementId, elements])

  // Update value at path in settings
  const updateAtPath = useCallback((path: string[], value: any) => {
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

    setState(prev => ({ ...prev, hasUnsavedChanges: true }))

    // Trigger autosave with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      save()
    }, 2000) // 2 second debounce
  }, [])

  // Content updates
  const updateText = useCallback((elementId: string, value: string) => {
    const element = elements.get(elementId)
    if (!element || element.type !== 'text') return

    // Save to history
    setHistory(prev => ({
      past: prev.present ? [...prev.past, prev.present] : prev.past,
      present: { ...element, value },
      future: [],
    }))

    // Update settings
    updateAtPath(element.path, value)

    // Update element
    setElements(prev => {
      const newMap = new Map(prev)
      newMap.set(elementId, { ...element, value })
      return newMap
    })
  }, [elements, updateAtPath])

  const updateImage = useCallback((elementId: string, url: string, alt?: string) => {
    const element = elements.get(elementId)
    if (!element || element.type !== 'image') return

    // Save to history
    setHistory(prev => ({
      past: prev.present ? [...prev.past, prev.present] : prev.past,
      present: { ...element, value: url, metadata: { ...element.metadata, alt } },
      future: [],
    }))

    // Update settings
    updateAtPath(element.path, url)

    // Update element
    setElements(prev => {
      const newMap = new Map(prev)
      newMap.set(elementId, { ...element, value: url, metadata: { ...element.metadata, alt } })
      return newMap
    })
  }, [elements, updateAtPath])

  const updateVideo = useCallback((elementId: string, url: string) => {
    const element = elements.get(elementId)
    if (!element || element.type !== 'video') return

    // Save to history
    setHistory(prev => ({
      past: prev.present ? [...prev.past, prev.present] : prev.past,
      present: { ...element, value: url },
      future: [],
    }))

    // Update settings
    updateAtPath(element.path, url)

    // Update element
    setElements(prev => {
      const newMap = new Map(prev)
      newMap.set(elementId, { ...element, value: url })
      return newMap
    })
  }, [elements, updateAtPath])

  // Undo/Redo
  const undo = useCallback(() => {
    if (history.past.length === 0) return

    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)

    setHistory({
      past: newPast,
      present: previous,
      future: history.present ? [history.present, ...history.future] : history.future,
    })

    // Apply the previous state
    updateAtPath(previous.path, previous.value)
  }, [history, updateAtPath])

  const redo = useCallback(() => {
    if (history.future.length === 0) return

    const next = history.future[0]
    const newFuture = history.future.slice(1)

    setHistory({
      past: history.present ? [...history.past, history.present] : history.past,
      present: next,
      future: newFuture,
    })

    // Apply the next state
    updateAtPath(next.path, next.value)
  }, [history, updateAtPath])

  const canUndo = useCallback(() => history.past.length > 0, [history.past])
  const canRedo = useCallback(() => history.future.length > 0, [history.future])

  // Save
  const save = useCallback(async () => {
    if (!state.hasUnsavedChanges) return

    setState(prev => ({ ...prev, isSaving: true }))

    try {
      const response = await fetch('/api/sites/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, settings }),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      // Call the callback
      onSettingsChange(settings)

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSavedAt: Date.now(),
        hasUnsavedChanges: false,
      }))

      onSettingsChange(settings)
    } catch (error) {
      console.error('Save error:', error)
      setState(prev => ({ ...prev, isSaving: false }))
      throw error
    }
  }, [siteId, settings, state.hasUnsavedChanges, onSettingsChange])

  // Works management
  const addWork = useCallback(async (): Promise<Work> => {
    const newWork: Work = {
      id: `work-${Date.now()}`,
      title: 'Nouveau Projet',
      slug: `project-${Date.now()}`,
      coverImage: '/placeholder-work.jpg',
      order: (settings.gallery?.images?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update settings with new work
    setSettings(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: [...(prev.gallery?.images || []), {
          url: newWork.coverImage,
          alt: newWork.title,
          metadata: { workId: newWork.id, slug: newWork.slug },
        }],
      } as any,
    }))

    setState(prev => ({ ...prev, hasUnsavedChanges: true }))
    await save()

    return newWork
  }, [settings, save])

  const updateWorkCover = useCallback(async (workId: string, coverUrl: string) => {
    setSettings(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: (prev.gallery?.images as any)?.map((img: any) =>
          img.metadata?.workId === workId
            ? { ...img, url: coverUrl }
            : img
        ),
      } as any,
    }))

    setState(prev => ({ ...prev, hasUnsavedChanges: true }))
    await save()
  }, [save])

  const deleteWork = useCallback(async (workId: string) => {
    // Remove from gallery
    setSettings(prev => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        images: (prev.gallery?.images as any)?.filter((img: any) => img.metadata?.workId !== workId),
      } as any,
    }))

    setState(prev => ({ ...prev, hasUnsavedChanges: true }))
    await save()

    // TODO: Also delete the work page/route if exists
  }, [save])

  // Assign save function to ref to avoid circular dependencies
  React.useEffect(() => {
    saveFunctionRef.current = save
  }, [save])

  const value: EditorContextValue = {
    state,
    history,
    settings,
    siteDomain,
    updateSettings: updateSettingsWithSave,
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
    deleteWork,
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider')
  }
  return context
}
