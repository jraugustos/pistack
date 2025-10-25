'use client'

import { Plus, Library, Sparkles, X } from 'lucide-react'
import { TemplateStage } from '@/lib/types/card-definition'
import * as LucideIcons from 'lucide-react'

interface StageConfigPanelProps {
  stage: TemplateStage | undefined
  onUpdate: (updates: Partial<TemplateStage>) => void
  onOpenCardLibrary: () => void
  onCreateCard: () => void
  onRemoveCard?: (cardId: string) => void
}

const STAGE_COLORS = [
  '#7AA2FF',
  '#5AD19A',
  '#FFC24B',
  '#FF6B6B',
  '#9B8AFB',
  '#FF9FF3',
]

/**
 * Stage Config Panel
 * Pixel-perfect implementation of HTML lines 252-318
 */
export function StageConfigPanel({
  stage,
  onUpdate,
  onOpenCardLibrary,
  onCreateCard,
  onRemoveCard,
}: StageConfigPanelProps) {
  if (!stage) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <LucideIcons.Layers className="w-8 h-8 text-[#E6E9F2]/40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Configure as Etapas</h3>
          <p className="text-sm text-[#E6E9F2]/60 max-w-md">
            Adicione etapas ao seu template e configure os cards e assistentes para cada uma
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stage Info */}
        <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
          <h3 className="text-sm font-semibold mb-4">Informações da Etapa</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                Nome da Etapa
              </label>
              <input
                type="text"
                placeholder="Ex: Ideia Base"
                value={stage.stage_name}
                onChange={(e) => onUpdate({ stage_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                Descrição
              </label>
              <textarea
                placeholder="Descreva o objetivo desta etapa..."
                value={stage.stage_description || ''}
                onChange={(e) => onUpdate({ stage_description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                Cor da Etapa
              </label>
              <div className="flex items-center gap-2">
                {STAGE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdate({ stage_color: color })}
                    className={`w-10 h-10 rounded-lg border-2 hover:scale-110 transition-transform ${
                      stage.stage_color === color
                        ? 'border-white/50'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#7AA2FF]" />
            <h3 className="text-sm font-semibold">Assistente de IA</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#E6E9F2]/60 mb-1.5 block">
                Instruções do Assistente
              </label>
              <textarea
                placeholder="Defina como o assistente deve ajudar nesta etapa..."
                value={stage.assistant_instructions || ''}
                onChange={(e) =>
                  onUpdate({ assistant_instructions: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors resize-none"
              />
              <p className="text-xs text-[#E6E9F2]/40 mt-1.5">
                O assistente usará estas instruções para ajudar o usuário nesta
                etapa específica
              </p>
            </div>
          </div>
        </div>

        {/* Cards Library */}
        <div className="bg-[#151821] rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Cards da Etapa</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onCreateCard}
                className="px-3 py-1.5 text-xs font-medium bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Card
              </button>
              <button
                onClick={onOpenCardLibrary}
                className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Library className="w-3.5 h-3.5" />
                Biblioteca
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-2">
            {!stage.cards || stage.cards.length === 0 ? (
              <div className="text-sm text-[#E6E9F2]/40 text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
                Nenhum card adicionado. Use a biblioteca ou crie um novo card.
              </div>
            ) : (
              stage.cards.map((card) => {
                const definition = card.definition
                if (!definition) return null

                const IconComponent = (LucideIcons[
                  definition.icon as keyof typeof LucideIcons
                ] || LucideIcons.Hash) as any

                return (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 group hover:border-white/20 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${stage.stage_color}10`,
                        borderColor: `${stage.stage_color}20`,
                      }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: stage.stage_color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#E6E9F2]">
                        {definition.name}
                      </div>
                      <div className="text-xs text-[#E6E9F2]/40">
                        {definition.fields.length} campos
                      </div>
                    </div>
                    {onRemoveCard && (
                      <button
                        onClick={() => onRemoveCard(card.id)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
