'use client'

import { useEffect, useRef } from 'react'
import { Search, Command as CommandIcon } from 'lucide-react'
import type { Command } from '@/lib/command-palette'
import { COMMAND_CATEGORIES } from '@/lib/command-palette'

interface CommandPaletteModalProps {
  isOpen: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  commands: Command[]
  selectedIndex: number
  onSelectCommand: (command: Command) => void
  onClose: () => void
  onNavigateDown: () => void
  onNavigateUp: () => void
  onExecuteSelected: () => void
}

export function CommandPaletteModal({
  isOpen,
  searchQuery,
  onSearchChange,
  commands,
  selectedIndex,
  onSelectCommand,
  onClose,
  onNavigateDown,
  onNavigateUp,
  onExecuteSelected,
}: CommandPaletteModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const selectedCommandRef = useRef<HTMLButtonElement>(null)

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Scroll selected command into view
  useEffect(() => {
    if (selectedCommandRef.current) {
      selectedCommandRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          onNavigateDown()
          break
        case 'ArrowUp':
          e.preventDefault()
          onNavigateUp()
          break
        case 'Enter':
          e.preventDefault()
          onExecuteSelected()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onNavigateDown, onNavigateUp, onExecuteSelected, onClose])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Group commands by category
  const groupedCommands: Record<string, Command[]> = {}
  commands.forEach(command => {
    const categoryLabel = COMMAND_CATEGORIES[command.category].label
    if (!groupedCommands[categoryLabel]) {
      groupedCommands[categoryLabel] = []
    }
    groupedCommands[categoryLabel].push(command)
  })

  const sortedCategories = Object.keys(groupedCommands).sort((a, b) => {
    const categoryA = Object.values(COMMAND_CATEGORIES).find(c => c.label === a)
    const categoryB = Object.values(COMMAND_CATEGORIES).find(c => c.label === b)
    return (categoryA?.order || 0) - (categoryB?.order || 0)
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#13161C] rounded-xl shadow-2xl border border-white/10 overflow-hidden"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E6E9F2]/40" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Digite para buscar comandos..."
              className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-[#E6E9F2] placeholder:text-[#E6E9F2]/40 focus:outline-none text-base"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-[#E6E9F2]/40 border border-white/10">
                Esc
              </kbd>
            </div>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {commands.length === 0 ? (
            <div className="text-center py-12">
              <CommandIcon className="w-12 h-12 text-[#E6E9F2]/20 mx-auto mb-3" />
              <p className="text-sm text-[#E6E9F2]/40">Nenhum comando encontrado</p>
            </div>
          ) : (
            sortedCategories.map(categoryLabel => {
              const categoryCommands = groupedCommands[categoryLabel]
              const startIndex = commands.findIndex(cmd => categoryCommands.includes(cmd))

              return (
                <div key={categoryLabel} className="mb-4 last:mb-0">
                  {/* Category Header */}
                  <div className="px-3 py-1.5 text-xs font-medium text-[#E6E9F2]/40 uppercase tracking-wider">
                    {categoryLabel}
                  </div>

                  {/* Category Commands */}
                  <div className="space-y-1">
                    {categoryCommands.map((command, idx) => {
                      const globalIndex = commands.indexOf(command)
                      const isSelected = globalIndex === selectedIndex
                      const Icon = command.icon

                      return (
                        <button
                          key={command.id}
                          ref={isSelected ? selectedCommandRef : null}
                          onClick={() => onSelectCommand(command)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'bg-[#7AA2FF]/20 border border-[#7AA2FF]/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-[#7AA2FF]/20'
                                : 'bg-white/5'
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 ${
                                isSelected
                                  ? 'text-[#7AA2FF]'
                                  : 'text-[#E6E9F2]/60'
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#E6E9F2] truncate">
                              {command.title}
                            </div>
                            <div className="text-xs text-[#E6E9F2]/40 truncate">
                              {command.description}
                            </div>
                          </div>

                          {/* Shortcut */}
                          {command.shortcut && (
                            <div className="flex-shrink-0">
                              <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-[#E6E9F2]/40 border border-white/10">
                                {command.shortcut}
                              </kbd>
                            </div>
                          )}

                          {/* Enter hint */}
                          {isSelected && !command.shortcut && (
                            <div className="flex-shrink-0 text-xs text-[#E6E9F2]/40">
                              ⏎
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-xs text-[#E6E9F2]/40">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] border border-white/10">
                  ↑↓
                </kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] border border-white/10">
                  Enter
                </kbd>
                selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] border border-white/10">
                  Esc
                </kbd>
                fechar
              </span>
            </div>
            <span>{commands.length} {commands.length === 1 ? 'comando' : 'comandos'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
