import { Check, Clock, Plus } from 'lucide-react'
import { CARD_TITLES, STAGE_CARD_TYPES } from '@/lib/card-constants'
import { CardDisplay } from './card-display'

interface Card {
  id: string
  card_type: string
  content: Record<string, any>
  stage_id: string
  position: number
}

interface Stage {
  id: string
  stage_number: number
  stage_name: string
  stage_color: string
}

interface StageProgress {
  stageNumber: number
  total: number
  completed: number
  isComplete: boolean
}

interface StageOverviewProps {
  stage: Stage
  cards: Card[]
  stageProgress?: StageProgress
  index: number
}

function getStageIcon(stageNumber: number): string {
  const icons: Record<number, string> = {
    1: 'lightbulb',
    2: 'brain',
    3: 'layout-grid',
    4: 'palette',
    5: 'code-2',
    6: 'calendar',
  }
  return icons[stageNumber] || 'circle'
}

export function StageOverview({
  stage,
  cards,
  stageProgress,
  index,
}: StageOverviewProps) {
  const expectedCardTypes = STAGE_CARD_TYPES[stage.stage_number] || []
  const missingCardTypes = expectedCardTypes.filter(
    (type) => !cards.some((card) => card.card_type === type)
  )

  const hasCards = cards.length > 0
  const isComplete = stageProgress?.isComplete ?? false

  return (
    <div className="mb-16">
      {/* Stage Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: `${stage.stage_color}10`,
              borderColor: `${stage.stage_color}30`,
            }}
          >
            <span
              className="text-2xl"
              style={{ color: stage.stage_color }}
            >
              {/* Icon placeholder - TODO: Use lucide icon based on getStageIcon */}
              {stage.stage_number}
            </span>
          </div>
          <div>
            <div
              className="text-sm font-medium"
              style={{ color: stage.stage_color }}
            >
              Etapa {stage.stage_number}
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {stage.stage_name}
            </h3>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            isComplete
              ? 'bg-[#5AD19A]/10 border-[#5AD19A]/30'
              : hasCards
                ? 'bg-[#FFC24B]/10 border-[#FFC24B]/30'
                : 'bg-white/5 border-white/10'
          }`}
        >
          {isComplete ? (
            <>
              <Check className="w-4 h-4 text-[#5AD19A]" />
              <span className="text-sm font-medium text-[#5AD19A]">
                Completo
              </span>
            </>
          ) : hasCards ? (
            <>
              <Clock className="w-4 h-4 text-[#FFC24B]" />
              <span className="text-sm font-medium text-[#FFC24B]">
                Em Andamento
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-[#E6E9F2]/40">
              Pendente
            </span>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {hasCards ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <CardDisplay
              key={card.id}
              card={card}
              stageColor={stage.stage_color}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className="border rounded-xl p-8 text-center"
          style={{
            background: `linear-gradient(to-br, ${stage.stage_color}05, transparent)`,
            borderColor: `${stage.stage_color}20`,
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
            style={{
              backgroundColor: `${stage.stage_color}10`,
              borderColor: `${stage.stage_color}30`,
            }}
          >
            <Plus className="w-8 h-8" style={{ color: stage.stage_color }} />
          </div>
          <h4 className="text-xl font-semibold mb-2">
            Complete esta etapa para finalizar
          </h4>
          <p className="text-[#E6E9F2]/60 mb-6 max-w-lg mx-auto">
            Adicione os cards desta etapa para ter uma visão completa do projeto.
          </p>
          {missingCardTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {missingCardTypes.map((cardType) => (
                <span
                  key={cardType}
                  className="px-3 py-1.5 bg-white/5 rounded-lg text-xs border border-white/10"
                >
                  {CARD_TITLES[cardType] || cardType}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
