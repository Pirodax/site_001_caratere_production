import type { SiteSettings } from './site'
import type { ReactNode } from 'react'

export type EditorMode = 'edit' | 'navigate'
export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

export interface EditorState {
  mode: EditorMode
  viewport: ViewportMode
  hoveredElementId: string | null
  selectedElementId: string | null
  isSaving: boolean
  lastSavedAt: number | null
  hasUnsavedChanges: boolean
}

export interface EditorHistory {
  past: EditableElement[]
  present: EditableElement | null
  future: EditableElement[]
}

export type ElementType = 'text' | 'image' | 'video' | 'color'

export interface EditableElement {
  id: string
  type: ElementType
  path: string[]
  value: any
  label?: string
  metadata?: Record<string, any>
}

export interface EditableElementProps extends EditableElement {
  children: ReactNode
  className?: string
}

export interface Work {
  id: string
  title: string
  slug: string
  coverImage: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface EditorContextValue {
  state: EditorState
  history: EditorHistory
  settings: SiteSettings
  siteDomain: string
  updateSettings: (newSettings: SiteSettings) => void
  setMode: (mode: EditorMode) => void
  setViewport: (viewport: ViewportMode) => void
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
