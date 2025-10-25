'use client'

import { Plus } from 'lucide-react'
import { Template, TemplateStage } from '@/lib/types/card-definition'
import { StageItem } from './stage-item'

interface StagesSidebarProps {
  template: Template
  activeStageId: string | null
  onStageSelect: (stageId: string) => void
  onAddStage: () => void
  onTemplateUpdate: (updates: Partial<Template>) => void
  onStageDelete?: (stageId: string) => void
}

/**
 * Stages Sidebar Component
 * Pixel-perfect implementation of HTML lines 203-224
 */
export function StagesSidebar({
  template,
  activeStageId,
  onStageSelect,
  onAddStage,
  onTemplateUpdate,
  onStageDelete,
}: StagesSidebarProps) {
  return (
    <aside className="w-80 border-r border-white/5 bg-[#0F1115] flex flex-col">
      {/* Template Meta */}
      <div className="p-4 border-b border-white/5">
        <input
          type="text"
          placeholder="Nome do Template"
          value={template.name}
          onChange={(e) => onTemplateUpdate({ name: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors font-semibold"
        />
        <textarea
          placeholder="Descrição do template..."
          value={template.description || ''}
          onChange={(e) => onTemplateUpdate({ description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors mt-2 resize-none"
        />
      </div>

      {/* Stages List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs font-semibold text-[#E6E9F2]/40 uppercase tracking-wider mb-3 px-2">
          Etapas do Template
        </div>
        <div className="space-y-2">
          {template.stages && template.stages.length > 0 ? (
            template.stages.map((stage) => (
              <StageItem
                key={stage.id}
                stage={stage}
                isActive={stage.id === activeStageId}
                onClick={() => onStageSelect(stage.id)}
                onDelete={
                  onStageDelete ? () => onStageDelete(stage.id) : undefined
                }
              />
            ))
          ) : (
            <div className="text-center py-8 text-sm text-[#E6E9F2]/40">
              Nenhuma etapa adicionada
            </div>
          )}
        </div>
      </div>

      {/* Add Stage Button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onAddStage}
          className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Etapa
        </button>
      </div>
    </aside>
  )
}
