'use client'

import { GripVertical, Trash2 } from 'lucide-react'
import { TemplateStage } from '@/lib/types/card-definition'

interface StageItemProps {
  stage: TemplateStage
  isActive: boolean
  onClick: () => void
  onDelete?: () => void
}

/**
 * Stage Item Component (for sidebar list)
 */
export function StageItem({ stage, isActive, onClick, onDelete }: StageItemProps) {
  return (
    <div
      className={`group relative rounded-lg border p-3 cursor-pointer transition-all ${
        isActive
          ? 'bg-white/5 border-[#7AA2FF]/50'
          : 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5'
      }`}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-[#E6E9F2]/30" />
      </div>

      {/* Stage Color Indicator */}
      <div className="flex items-center gap-2 pl-4">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: stage.stage_color }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#E6E9F2] truncate">
            {stage.stage_name || `Etapa ${stage.stage_number}`}
          </div>
          <div className="text-xs text-[#E6E9F2]/40">
            {stage.cards?.length || 0} cards
          </div>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        )}
      </div>
    </div>
  )
}
