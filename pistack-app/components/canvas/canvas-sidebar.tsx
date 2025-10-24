'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Plus, X, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ViewModeToggle } from './list-view/view-mode-toggle'
import type { ViewMode } from '@/lib/canvas-view-state'

interface Stage {
  number: number
  name: string
  color: string
  cardsCount: number
}

const STAGES: Stage[] = [
  { number: 1, name: 'Ideia Base', color: '#7AA2FF', cardsCount: 6 },
  { number: 2, name: 'Entendimento', color: '#5AD19A', cardsCount: 4 },
  { number: 3, name: 'Escopo', color: '#FFC24B', cardsCount: 6 },
  { number: 4, name: 'Design', color: '#FF6B6B', cardsCount: 5 },
  { number: 5, name: 'Tech', color: '#E879F9', cardsCount: 6 },
  { number: 6, name: 'Planejamento', color: '#9B8AFB', cardsCount: 8 },
]

interface CanvasSidebarProps {
  activeStage?: number
  onStageChange?: (stageNumber: number) => void
  stages?: Stage[]
  projectId?: string
  totalCards?: number
  completedCards?: number
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
}

export function CanvasSidebar({
  activeStage = 1,
  onStageChange,
  stages,
  projectId,
  totalCards = 35,
  completedCards = 0,
  viewMode = 'grid',
  onViewModeChange,
}: CanvasSidebarProps) {
  const router = useRouter()
  const [selectedStage, setSelectedStage] = useState(activeStage)
  const stageList = useMemo(() => stages ?? STAGES, [stages])
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestName, setRequestName] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [requestStatus, setRequestStatus] = useState<string | null>(null)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const selectedStageInfo = useMemo(
    () => stageList.find((stage) => stage.number === selectedStage),
    [stageList, selectedStage]
  )

  // Calculate progress percentage
  const progressPercentage = Math.round((completedCards / totalCards) * 100)
  const canAccessOverview = progressPercentage >= 50

  useEffect(() => {
    setSelectedStage(activeStage)
  }, [activeStage])

  const handleStageClick = (stageNumber: number) => {
    setSelectedStage(stageNumber)
    onStageChange?.(stageNumber)
  }

  const handleNewStageClick = () => {
    setIsRequestModalOpen(true)
    setRequestStatus(null)
  }

  const handleRequestClose = () => {
    setIsRequestModalOpen(false)
    setRequestStatus(null)
  }

  const handleSubmitRequest = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!projectId) {
      setRequestStatus('Projeto inválido para solicitar nova etapa.')
      return
    }

    if (!requestName.trim()) {
      setRequestStatus('Informe um nome para a nova etapa.')
      return
    }

    setIsSubmittingRequest(true)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/stage-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: requestName.trim(),
            description: requestDescription.trim(),
            stageNumber: selectedStage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Stage request failed: ${response.status}`)
      }

      setRequestStatus(
        'Solicitação enviada! Entraremos em contato assim que possível.'
      )
      setRequestName('')
      setRequestDescription('')
    } catch (error) {
      console.error('Stage request error:', error)
      setRequestStatus('Não foi possível enviar sua solicitação.')
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  return (
    <>
      <aside className="w-64 border-r border-white/5 bg-[#0F1115] flex flex-col transition-colors duration-200">
      {/* Header with Progress Bar */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-[#E6E9F2]/40 uppercase tracking-wider">
            Etapas do Projeto
          </h2>
          {onViewModeChange && (
            <ViewModeToggle mode={viewMode} onChange={onViewModeChange} />
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#E6E9F2]/60">Progresso</span>
            <span className="font-semibold" style={{
              color: progressPercentage >= 50 ? '#5AD19A' : '#FFC24B'
            }}>
              {progressPercentage}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: progressPercentage >= 50 ? '#5AD19A' : '#FFC24B'
              }}
            />
          </div>
          <div className="text-xs text-[#E6E9F2]/40">
            {completedCards}/{totalCards} cards criados
          </div>

          {/* Mensagem informativa sobre Overview (aparece apenas quando <50%) */}
          {!canAccessOverview && (
            <div className="mt-3 px-3 py-2 bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 rounded-lg">
              <p className="text-xs text-[#7AA2FF] leading-relaxed">
                💡 Complete 50% dos cards ({Math.ceil(totalCards * 0.5)}/{totalCards}) para desbloquear o Project Overview
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {stageList.map((stage) => {
          const isActive = selectedStage === stage.number

          return (
            <button
              key={stage.number}
              onClick={() => handleStageClick(stage.number)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg border transition-colors',
                isActive
                  ? 'border-opacity-30 hover:border-opacity-50'
                  : 'hover:bg-white/5 border-transparent hover:border-white/10'
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${stage.color}10`,
                      borderColor: `${stage.color}4D`, // 4D = 30% opacity
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: stage.color }}
                >
                  Etapa {stage.number}
                </span>
              </div>
              <div className="text-sm font-medium">{stage.name}</div>
              <div className="text-xs text-[#E6E9F2]/40 mt-1">
                {stage.cardsCount} cards
              </div>
            </button>
          )
        })}
      </div>

      {/* Overview Button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => {
            if (canAccessOverview && projectId) {
              router.push(`/canvas/${projectId}/overview`)
            }
          }}
          disabled={!canAccessOverview}
          title={!canAccessOverview ? `Complete ${Math.ceil(totalCards * 0.5)} cards (50%) para desbloquear` : 'Ver visão geral do projeto'}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            canAccessOverview
              ? 'bg-[#7AA2FF] hover:bg-[#6690E8] text-white'
              : 'bg-white/5 text-[#E6E9F2]/30 cursor-not-allowed'
          }`}
        >
          <FileText className="w-4 h-4" />
          {canAccessOverview ? 'Project Overview' : `Bloqueado (${progressPercentage}%)`}
        </button>
      </div>
      </aside>

      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={handleSubmitRequest}
            className="w-full max-w-md bg-[#0F1115] border border-white/10 rounded-xl shadow-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Solicitar nova etapa</h3>
                <p className="text-xs text-[#E6E9F2]/40">
                  Conte o que você gostaria de adicionar após{' '}
                  {selectedStageInfo?.name ?? `a etapa ${selectedStage}`}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Fechar solicitação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#E6E9F2]/60 block mb-1">
                  Nome da nova etapa
                </label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(event) => setRequestName(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors"
                  placeholder="Ex: Validação de Mercado"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#E6E9F2]/60 block mb-1">
                  O que essa etapa precisa cobrir?
                </label>
                <textarea
                  value={requestDescription}
                  onChange={(event) =>
                    setRequestDescription(event.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#7AA2FF]/50 transition-colors min-h-[120px]"
                  placeholder="Descreva o objetivo da etapa e os principais entregáveis."
                />
              </div>
            </div>

            {requestStatus && (
              <p className="text-xs text-[#E6E9F2]/50">{requestStatus}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-3 py-1.5 text-xs font-medium text-[#E6E9F2]/70 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingRequest}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isSubmittingRequest
                    ? 'bg-[#7AA2FF]/40 text-white cursor-not-allowed'
                    : 'bg-[#7AA2FF] hover:bg-[#6690E8] text-white'
                }`}
              >
                {isSubmittingRequest ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
