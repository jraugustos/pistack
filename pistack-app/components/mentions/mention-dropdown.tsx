'use client'

import { useEffect, useRef } from 'react'
import { Hash, Circle } from 'lucide-react'
import type { MentionSuggestion } from '@/hooks/use-mention-autocomplete'
import { STAGE_COLORS, STAGE_NAMES } from '@/lib/card-constants'
import { calculateCompletionStatus } from '@/lib/types/card'

interface MentionDropdownProps {
  suggestions: MentionSuggestion[]
  position: { top: number; left: number }
  selectedIndex: number
  onSelect: (suggestion: MentionSuggestion) => void
  onClose: () => void
}

export function MentionDropdown({
  suggestions,
  position,
  selectedIndex,
  onSelect,
  onClose,
}: MentionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && selectedIndex >= 0) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (suggestions.length === 0) {
    return (
      <div
        ref={dropdownRef}
        className="fixed z-50 w-80 bg-[#13161C] border border-white/10 rounded-lg shadow-2xl p-3"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <p className="text-sm text-[#E6E9F2]/40 text-center py-2">
          Nenhum card encontrado
        </p>
      </div>
    )
  }

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-80 max-h-64 overflow-y-auto bg-[#13161C] border border-white/10 rounded-lg shadow-2xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="p-2 border-b border-white/10">
        <p className="text-xs text-[#E6E9F2]/40 uppercase tracking-wider">
          Mencionar card
        </p>
      </div>

      <div className="p-1">
        {suggestions.map((suggestion, index) => {
          const isSelected = index === selectedIndex
          const stageColor = STAGE_COLORS[suggestion.stageNumber]
          const stageName = STAGE_NAMES[suggestion.stageNumber]

          // Calculate completion status if content exists
          const hasContent = Object.keys(suggestion.content || {}).length > 0

          return (
            <button
              key={suggestion.id}
              onClick={() => onSelect(suggestion)}
              className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-[#7AA2FF]/20 border border-[#7AA2FF]/30'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                style={{
                  backgroundColor: `${stageColor}20`,
                }}
              >
                <Hash
                  className="w-4 h-4"
                  style={{ color: stageColor }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-[#E6E9F2] truncate">
                    {suggestion.title}
                  </h4>
                  {hasContent && (
                    <Circle className="w-2 h-2 text-[#5AD19A] fill-current flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${stageColor}15`,
                      color: `${stageColor}`,
                    }}
                  >
                    {stageName}
                  </span>
                  <span className="text-xs text-[#E6E9F2]/30">
                    {suggestion.cardType}
                  </span>
                </div>
              </div>

              {/* Keyboard hint */}
              {isSelected && (
                <div className="flex-shrink-0 text-xs text-[#E6E9F2]/40 mt-1">
                  ⏎
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="p-2 border-t border-white/10">
        <p className="text-xs text-[#E6E9F2]/30 text-center">
          <span className="text-[#E6E9F2]/40">↑↓</span> navegar •{' '}
          <span className="text-[#E6E9F2]/40">Enter</span> selecionar •{' '}
          <span className="text-[#E6E9F2]/40">Esc</span> fechar
        </p>
      </div>
    </div>
  )
}
