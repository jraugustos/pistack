/**
 * Card Search Hook
 * Custom hook for searching and filtering cards with debouncing
 */

import { useState, useMemo, useCallback } from 'react'
import type { CardRecord } from '@/lib/types/card'
import type { FilterOptions } from '@/lib/card-filters'
import { applyFilters, DEFAULT_FILTERS } from '@/lib/card-filters'

export function useCardSearch(cards: CardRecord[]) {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }))

    // Debounce the actual filtering (300ms)
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  // Apply filters with debounced query
  const filteredCards = useMemo(() => {
    const filtersWithDebouncedQuery = {
      ...filters,
      searchQuery: debouncedQuery,
    }
    return applyFilters(cards, filtersWithDebouncedQuery)
  }, [cards, filters.stages, filters.status, debouncedQuery])

  // Set stage filter
  const setStageFilter = useCallback((stages: number[]) => {
    setFilters(prev => ({ ...prev, stages }))
  }, [])

  // Toggle specific stage
  const toggleStage = useCallback((stage: number) => {
    setFilters(prev => {
      const stages = prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage]

      // Ensure at least one stage is selected
      if (stages.length === 0) {
        return prev
      }

      return { ...prev, stages }
    })
  }, [])

  // Set status filter
  const setStatusFilter = useCallback((status: FilterOptions['status']) => {
    setFilters(prev => ({ ...prev, status }))
  }, [])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setDebouncedQuery('')
  }, [])

  // Toggle all stages
  const toggleAllStages = useCallback(() => {
    setFilters(prev => {
      const allSelected = prev.stages.length === 6
      return {
        ...prev,
        stages: allSelected ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6],
      }
    })
  }, [])

  return {
    filters,
    filteredCards,
    setSearchQuery,
    setStageFilter,
    toggleStage,
    setStatusFilter,
    resetFilters,
    toggleAllStages,
  }
}
