'use client'

import { LayoutGrid, List } from 'lucide-react'
import type { ViewMode } from '@/lib/canvas-view-state'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded transition-colors ${
          mode === 'grid'
            ? 'bg-white/10 text-[#E6E9F2]'
            : 'text-[#E6E9F2]/40 hover:text-[#E6E9F2]/60'
        }`}
        title="Visualização em Grid"
        aria-label="Visualização em Grid"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-1.5 rounded transition-colors ${
          mode === 'list'
            ? 'bg-white/10 text-[#E6E9F2]'
            : 'text-[#E6E9F2]/40 hover:text-[#E6E9F2]/60'
        }`}
        title="Visualização em Lista"
        aria-label="Visualização em Lista"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  )
}
