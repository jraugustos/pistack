'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ListViewContainer, SearchInput, FiltersBar } from './list-view'
import { useCardSearch } from '@/hooks/use-card-search'
import type { CardRecord } from '@/lib/types/card'
import type { SortOption } from '@/lib/card-sorting'
import { CardEditModal } from './card-edit-modal'
import { CardViewModal } from './card-view-modal'
import { getCardStageNumber, CARD_TITLES, STAGE_COLORS, STAGE_NAMES } from '@/lib/card-constants'

interface StageRecord {
  id: string
  stage_number: number
  stage_name: string
  stage_color: string
}

interface CanvasAreaListViewProps {
  projectId: string
  stages: StageRecord[]
}

export function CanvasAreaListView({ projectId, stages }: CanvasAreaListViewProps) {
  const [allCards, setAllCards] = useState<CardRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOption, setSortOption] = useState<SortOption>('stage-asc')
  const [viewingCard, setViewingCard] = useState<CardRecord | null>(null)
  const [editingCard, setEditingCard] = useState<CardRecord | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Use the card search hook
  const {
    filters,
    filteredCards,
    setSearchQuery,
    toggleStage,
    setStatusFilter,
    resetFilters,
  } = useCardSearch(allCards)

  // Fetch all cards from all stages
  const fetchAllCards = useCallback(async () => {
    try {
      setIsLoading(true)
      const allCardsData: CardRecord[] = []

      for (const stage of stages) {
        const response = await fetch(`/api/cards?stageId=${stage.id}`)
        const data = await response.json()
        if (data.cards && Array.isArray(data.cards)) {
          allCardsData.push(...data.cards)
        }
      }

      setAllCards(allCardsData)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }, [stages])

  // Initial load and listen for updates
  useEffect(() => {
    fetchAllCards()

    const handleRefresh = () => {
      fetchAllCards()
    }

    window.addEventListener('pistack:cards:refresh', handleRefresh)
    return () => {
      window.removeEventListener('pistack:cards:refresh', handleRefresh)
    }
  }, [fetchAllCards])

  // Handle card view
  const handleView = useCallback((card: CardRecord) => {
    setViewingCard(card)
  }, [])

  // Handle card edit
  const handleEdit = useCallback((card: CardRecord) => {
    setViewingCard(null) // Close view modal if open
    setEditingCard(card)
  }, [])

  // Handle edit from view modal
  const handleEditFromView = useCallback(() => {
    if (viewingCard) {
      setEditingCard(viewingCard)
      setViewingCard(null)
    }
  }, [viewingCard])

  // Handle AI autofill
  const handleAI = useCallback(async (card: CardRecord) => {
    try {
      const response = await fetch(`/api/cards/${card.id}/autofill`, {
        method: 'POST',
      })

      if (response.ok) {
        // Refresh cards after autofill
        window.dispatchEvent(new Event('pistack:cards:refresh'))
      }
    } catch (error) {
      console.error('Error autofilling card:', error)
    }
  }, [])

  // Handle card delete
  const handleDelete = useCallback(async (card: CardRecord) => {
    if (!confirm('Tem certeza que deseja excluir este card?')) {
      return
    }

    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh cards after delete
        window.dispatchEvent(new Event('pistack:cards:refresh'))
      }
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }, [])

  // Handle card save from edit modal
  const handleSaveCard = useCallback(async (content: Record<string, any>) => {
    if (!editingCard) return

    setIsSavingEdit(true)
    try {
      const response = await fetch(`/api/cards/${editingCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setEditingCard(null)
        window.dispatchEvent(new Event('pistack:cards:refresh'))
      }
    } catch (error) {
      console.error('Error saving card:', error)
    } finally {
      setIsSavingEdit(false)
    }
  }, [editingCard])

  const closeEditModal = useCallback(() => {
    setEditingCard(null)
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0B0E]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#7AA2FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#E6E9F2]/60">Carregando cards...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-auto bg-[#0A0B0E] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search */}
          <SearchInput
            value={filters.searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar cards por título ou conteúdo..."
          />

          {/* Filters */}
          <FiltersBar
            filters={filters}
            onStageToggle={toggleStage}
            onStatusChange={setStatusFilter}
            onReset={resetFilters}
            resultCount={filteredCards.length}
          />

          {/* List View */}
          <ListViewContainer
            cards={filteredCards}
            onView={handleView}
            onEdit={handleEdit}
            onAI={handleAI}
            onDelete={handleDelete}
            sortOption={sortOption}
            onSortChange={setSortOption}
            emptyMessage={
              filters.searchQuery || filters.status !== 'all' || filters.stages.length < 6
                ? 'Nenhum card encontrado com os filtros aplicados'
                : 'Nenhum card criado ainda'
            }
          />
        </div>
      </div>

      {/* View Modal */}
      {viewingCard && typeof window !== 'undefined' &&
        createPortal(
          <CardViewModal
            card={viewingCard}
            stageName={STAGE_NAMES[getCardStageNumber(viewingCard.card_type) || 1]}
            stageColor={STAGE_COLORS[getCardStageNumber(viewingCard.card_type) || 1]}
            isOpen={!!viewingCard}
            onClose={() => setViewingCard(null)}
            onEdit={handleEditFromView}
            onAI={() => {
              handleAI(viewingCard)
              setViewingCard(null)
            }}
          />,
          document.body
        )}

      {/* Edit Modal */}
      {editingCard && typeof window !== 'undefined' &&
        createPortal(
          <CardEditModal
            cardType={editingCard.card_type}
            cardTitle={CARD_TITLES[editingCard.card_type] || editingCard.card_type}
            content={editingCard.content}
            stageColor={STAGE_COLORS[getCardStageNumber(editingCard.card_type) || 1]}
            isOpen={!!editingCard}
            isSaving={isSavingEdit}
            onClose={closeEditModal}
            onSave={handleSaveCard}
          />,
          document.body
        )}
    </>
  )
}
