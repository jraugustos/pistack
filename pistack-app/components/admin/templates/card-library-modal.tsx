'use client'

import { useState, useEffect } from 'react'
import { X, Search, Hash, Circle } from 'lucide-react'
import { CardDefinition, CARD_CATEGORY_LABELS, CardCategory } from '@/lib/types/card-definition'
import * as LucideIcons from 'lucide-react'

interface CardLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCards: (cardDefIds: string[]) => void
  selectedCardIds?: string[]
}

/**
 * Card Library Modal
 * Pixel-perfect implementation of HTML lines 586-823
 */
export function CardLibraryModal({
  isOpen,
  onClose,
  onAddCards,
  selectedCardIds = [],
}: CardLibraryModalProps) {
  const [definitions, setDefinitions] = useState<CardDefinition[]>([])
  const [filteredDefinitions, setFilteredDefinitions] = useState<CardDefinition[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedCardIds))
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCardDefinitions()
    }
  }, [isOpen])

  useEffect(() => {
    filterDefinitions()
  }, [searchQuery, categoryFilter, definitions])

  const fetchCardDefinitions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/card-definitions')
      const data = await res.json()
      setDefinitions(data.definitions || [])
    } catch (error) {
      console.error('Error fetching card definitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDefinitions = () => {
    let filtered = definitions

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((def) => def.category === categoryFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (def) =>
          def.name.toLowerCase().includes(query) ||
          def.description?.toLowerCase().includes(query)
      )
    }

    setFilteredDefinitions(filtered)
  }

  const toggleCard = (cardId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId)
    } else {
      newSelected.add(cardId)
    }
    setSelectedIds(newSelected)
  }

  const handleAddCards = () => {
    onAddCards(Array.from(selectedIds))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Biblioteca de Cards
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-[#E6E9F2]/60">
            Selecione os cards que deseja adicionar a esta etapa
          </p>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E6E9F2]/40" />
              <input
                type="text"
                placeholder="Buscar cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
            >
              <option value="all">Todas Categorias</option>
              {Object.entries(CARD_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#7AA2FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDefinitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#E6E9F2]/60">Nenhum card encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDefinitions.map((definition) => {
                const isSelected = selectedIds.has(definition.id)
                const IconComponent = (LucideIcons[
                  definition.icon as keyof typeof LucideIcons
                ] || LucideIcons.Hash) as any
                const categoryColor = getCategoryColor(definition.category)

                return (
                  <button
                    key={definition.id}
                    onClick={() => toggleCard(definition.id)}
                    className={`text-left bg-[#151821] border rounded-xl p-4 transition-all group ${
                      isSelected
                        ? 'border-[#7AA2FF] bg-[#7AA2FF]/5'
                        : 'border-white/10 hover:border-[#7AA2FF]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-8 h-8 rounded-lg border flex items-center justify-center"
                        style={{
                          backgroundColor: `${categoryColor}10`,
                          borderColor: `${categoryColor}20`,
                        }}
                      >
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: categoryColor }}
                        />
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#7AA2FF] border-[#7AA2FF]'
                            : 'border-white/20 group-hover:border-white/40'
                        }`}
                      >
                        {isSelected && <Circle className="w-3 h-3 text-white fill-current" />}
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-[#E6E9F2] mb-1">
                      {definition.name}
                    </h4>
                    <p className="text-xs text-[#E6E9F2]/60 mb-2 line-clamp-2">
                      {definition.description}
                    </p>
                    <span
                      className="inline-block text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${categoryColor}15`,
                        color: categoryColor,
                      }}
                    >
                      {CARD_CATEGORY_LABELS[definition.category]}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <div className="text-sm text-[#E6E9F2]/60">
            {selectedIds.size} {selectedIds.size === 1 ? 'card selecionado' : 'cards selecionados'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddCards}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-sm font-medium bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for category colors
function getCategoryColor(category: CardCategory): string {
  const colors: Record<CardCategory, string> = {
    ideation: '#7AA2FF',
    research: '#5AD19A',
    planning: '#FFC24B',
    design: '#FF6B6B',
    development: '#9B8AFB',
    marketing: '#E879F9',
  }
  return colors[category] || '#7AA2FF'
}
