'use client'

import { Filter, X, Circle, CircleDot, CheckCircle2 } from 'lucide-react'
import type { FilterOptions } from '@/lib/card-filters'
import { STAGE_NAMES, STAGE_COLORS } from '@/lib/card-constants'
import { hasActiveFilters } from '@/lib/card-filters'

interface FiltersBarProps {
  filters: FilterOptions
  onStageToggle: (stage: number) => void
  onStatusChange: (status: FilterOptions['status']) => void
  onReset: () => void
  resultCount: number
}

const STATUS_OPTIONS = [
  { value: 'all' as const, label: 'Todos', icon: Filter },
  { value: 'empty' as const, label: 'Vazios', icon: Circle },
  { value: 'partial' as const, label: 'Parciais', icon: CircleDot },
  { value: 'complete' as const, label: 'Completos', icon: CheckCircle2 },
]

export function FiltersBar({
  filters,
  onStageToggle,
  onStatusChange,
  onReset,
  resultCount,
}: FiltersBarProps) {
  const isFiltered = hasActiveFilters(filters)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#E6E9F2]/60" />
          <span className="text-sm font-medium text-[#E6E9F2]/80">Filtros</span>
          {isFiltered && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[#7AA2FF]/20 text-[#7AA2FF] rounded">
              {resultCount} {resultCount === 1 ? 'card' : 'cards'}
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Stage Filters */}
      <div>
        <p className="text-xs text-[#E6E9F2]/40 mb-2">Por Etapa</p>
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3, 4, 5, 6] as const).map(stage => {
            const isSelected = filters.stages.includes(stage)
            const stageColor = STAGE_COLORS[stage]

            return (
              <button
                key={stage}
                onClick={() => onStageToggle(stage)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'text-[#E6E9F2]/40 bg-white/5 hover:bg-white/10'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: stageColor,
                      }
                    : undefined
                }
                title={STAGE_NAMES[stage]}
              >
                {STAGE_NAMES[stage]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <p className="text-xs text-[#E6E9F2]/40 mb-2">Por Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(option => {
            const isSelected = filters.status === option.value
            const Icon = option.icon

            return (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white/10 text-[#E6E9F2] border border-white/20'
                    : 'text-[#E6E9F2]/40 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
