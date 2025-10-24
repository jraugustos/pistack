'use client'

import { useEffect } from 'react'
import { X, Check, Loader2, AlertCircle, Circle } from 'lucide-react'

type CardStatus = 'pending' | 'creating' | 'success' | 'error'

interface BatchCard {
  cardType: string
  title: string
  status: CardStatus
  error?: string
}

interface BatchProgress {
  current: number
  total: number
  currentCardType: string
  currentCardTitle: string
  cards: BatchCard[]
}

interface BatchCreationModalProps {
  isOpen: boolean
  onClose: () => void
  progress: BatchProgress | null
  stageColor: string
  stageName: string
}

export function BatchCreationModal({
  isOpen,
  onClose,
  progress,
  stageColor,
  stageName,
}: BatchCreationModalProps) {
  // Previne scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fecha modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !progress) return null

  const progressPercentage = (progress.current / progress.total) * 100
  const isComplete = progress.current === progress.total
  const allSuccess = progress.cards.every((c) => c.status === 'success')

  const getStatusIcon = (status: CardStatus) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-400" />
      case 'creating':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Circle className="w-4 h-4 text-[#E6E9F2]/30" />
    }
  }

  const getStatusLabel = (status: CardStatus) => {
    switch (status) {
      case 'success':
        return 'Concluído'
      case 'creating':
        return 'Criando...'
      case 'error':
        return 'Erro'
      default:
        return 'Pendente'
    }
  }

  const getStatusColor = (status: CardStatus) => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'creating':
        return 'text-blue-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-[#E6E9F2]/50'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1A1D29] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold">
              {isComplete && allSuccess ? 'Etapa Criada com Sucesso!' : `Criando ${stageName}`}
            </h2>
            <p className="text-sm text-[#E6E9F2]/60 mt-1">
              {isComplete
                ? `${progress.total} cards criados`
                : `Criando ${progress.current} de ${progress.total} cards`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          {!isComplete && (
            <div className="mb-3 px-3 py-2 bg-blue-400/10 border border-blue-400/20 rounded-lg">
              <p className="text-xs text-blue-400">
                ⏱️ Cada card leva ~60s para ser preenchido pela IA. Aguarde...
              </p>
            </div>
          )}
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: stageColor,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#E6E9F2]/60">
              {Math.round(progressPercentage)}% concluído
            </span>
            <span className="text-xs text-[#E6E9F2]/60">
              {progress.current}/{progress.total}
            </span>
          </div>
        </div>

        {/* Cards List */}
        <div className="px-6 pb-4 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {progress.cards.map((card, index) => (
              <div
                key={card.cardType}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  card.status === 'creating'
                    ? 'bg-blue-400/10 border border-blue-400/30'
                    : card.status === 'success'
                    ? 'bg-green-400/10 border border-green-400/30'
                    : card.status === 'error'
                    ? 'bg-red-400/10 border border-red-400/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">{getStatusIcon(card.status)}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{card.title}</div>
                    {card.error && (
                      <div className="text-xs text-red-400 mt-1">{card.error}</div>
                    )}
                  </div>
                </div>
                <div className={`text-xs ${getStatusColor(card.status)}`}>
                  {getStatusLabel(card.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          {isComplete ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{
                backgroundColor: `${stageColor}20`,
                color: stageColor,
                border: `1px solid ${stageColor}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${stageColor}30`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${stageColor}20`
              }}
            >
              Fechar
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
