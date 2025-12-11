/**
 * EDITABLE ELEMENT
 * Wrapper component for editable elements with overlay and selection
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { useEditor } from '@/contexts/EditorContext'
import { EditableElementProps } from '@/types/editor'

export function EditableElement({
  id,
  type,
  path,
  value,
  children,
  className = '',
  metadata,
}: EditableElementProps) {
  const { state, hoverElement, selectElement } = useEditor()
  const elementRef = useRef<HTMLDivElement>(null)

  const isHovered = state.hoveredElementId === id
  const isSelected = state.selectedElementId === id
  const isEditMode = state.mode === 'edit'

  const handleMouseEnter = () => {
    if (isEditMode) {
      hoverElement(id)
    }
  }

  const handleMouseLeave = () => {
    if (isEditMode && isHovered) {
      hoverElement(null)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation()
      e.preventDefault()
      selectElement(id)
    }
  }

  // Register element with editor context
  useEffect(() => {
    // The element registration would happen in the EditorContext
    // This is just a placeholder for the registration logic
  }, [id, type, path, value, metadata])

  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <div
      ref={elementRef}
      data-editable-id={id}
      data-editable-type={type}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: isEditMode ? 'pointer' : 'default' }}
    >
      {children}

      {/* Hover overlay - Figma style */}
      {isHovered && !isSelected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            outline: '2px solid rgba(59, 130, 246, 0.5)',
            outlineOffset: '-2px',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '4px',
            zIndex: 999,
          }}
        >
          {/* Label tag */}
          <div
            className="absolute -top-6 left-0 px-2 py-1 text-xs font-medium text-white rounded-t"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              fontSize: '11px',
            }}
          >
            {type}
          </div>
        </div>
      )}

      {/* Selection overlay - Figma style */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            outline: '2px solid rgb(59, 130, 246)',
            outlineOffset: '-2px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          {/* Selection handles */}
          <div
            className="absolute top-0 left-0 w-2 h-2 bg-blue-600 rounded-full"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <div
            className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"
            style={{ transform: 'translate(50%, -50%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-2 h-2 bg-blue-600 rounded-full"
            style={{ transform: 'translate(-50%, 50%)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-2 h-2 bg-blue-600 rounded-full"
            style={{ transform: 'translate(50%, 50%)' }}
          />

          {/* Label tag */}
          <div
            className="absolute -top-6 left-0 px-2 py-1 text-xs font-medium text-white rounded-t"
            style={{
              backgroundColor: 'rgb(59, 130, 246)',
              fontSize: '11px',
            }}
          >
            {type} - selected
          </div>
        </div>
      )}
    </div>
  )
}
