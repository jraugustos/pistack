'use client'

import { ReactNode, createContext, useContext } from 'react'
import { LucideIcon, Sparkles, Pencil, Trash2 } from 'lucide-react'

interface BaseCardProps {
  // Card Identification
  cardId: string
  cardTitle: string
  icon: LucideIcon
  stageColor: string

  // Card Content
  children: ReactNode

  // Optional Actions
  showAiButton?: boolean
  onAiClick?: () => void
  onEdit?: () => void
  onDelete?: () => void

  // Optional Footer
  footer?: ReactNode

  // Optional Metadata
  metadata?: ReactNode
}

export interface CardActionsContextValue {
  onEdit?: () => void
  onDelete?: () => void
}

const CardActionsContext = createContext<CardActionsContextValue>({})

export const CardActionsProvider = CardActionsContext.Provider

/**
 * BaseCard - Base component for all canvas cards
 *
 * This component follows the exact structure from canvas-1-2.html (lines 176-205)
 * - Card container with border and hover effects
 * - Header with icon, title, and action buttons
 * - Content area (children)
 * - Optional footer and metadata
 *
 * IMPORTANT: This follows pixel-perfect styling from HTML prototype
 */
export function BaseCard({
  cardId,
  cardTitle,
  icon: Icon,
  stageColor,
  children,
  showAiButton = true,
  onAiClick,
  onEdit,
  onDelete,
  footer,
  metadata,
}: BaseCardProps) {
  const contextActions = useContext(CardActionsContext)
  const effectiveOnEdit = onEdit ?? contextActions.onEdit
  const effectiveOnDelete = onDelete ?? contextActions.onDelete

  return (
    <div
      className="bg-[#151821] rounded-xl border p-5 hover:border-opacity-50 transition-all hover:shadow-lg group"
      style={{
        borderColor: `${stageColor}30`,
        boxShadow: `0 0 0 0 ${stageColor}05`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${stageColor}80`
        e.currentTarget.style.boxShadow = `0 10px 20px -5px ${stageColor}08`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${stageColor}30`
        e.currentTarget.style.boxShadow = `0 0 0 0 ${stageColor}05`
      }}
    >
      {/* Header - Icon, Title, Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Icon */}
          <div
            className="w-8 h-8 rounded-lg border flex items-center justify-center"
            style={{
              backgroundColor: `${stageColor}10`,
              borderColor: `${stageColor}20`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: stageColor }} />
          </div>

          {/* Title */}
          <div>
            <div
              className="text-xs font-medium"
              style={{ color: stageColor }}
            >
              {cardTitle}
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden by default, shown on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {effectiveOnEdit && (
            <button
              onClick={effectiveOnEdit}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
              aria-label="Editar card"
              type="button"
            >
              <Pencil className="w-3.5 h-3.5" style={{ color: stageColor }} />
            </button>
          )}
          {showAiButton && onAiClick && (
            <button
              onClick={onAiClick}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
              aria-label="Ajuda da IA"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: stageColor }} />
            </button>
          )}
          {effectiveOnDelete && (
            <button
              onClick={effectiveOnDelete}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
              aria-label="Excluir card"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">{children}</div>

      {/* Footer */}
      {footer && <div className="mt-4">{footer}</div>}

      {/* Metadata */}
      {metadata && (
        <div className="flex items-center gap-2 text-xs mt-4">{metadata}</div>
      )}
    </div>
  )
}
