'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'

interface LoadingCardProps {
  cardTitle: string
  stageColor: string
  messages?: string[]
}

const DEFAULT_MESSAGES = [
  'Processando contexto',
  'Gerando conteúdo com IA',
  'Estruturando informações',
  'Finalizando card',
]

const STEP_DURATION_MS = 2200

export function LoadingCard({
  cardTitle,
  stageColor,
  messages = DEFAULT_MESSAGES,
}: LoadingCardProps) {
  const [progressIndex, setProgressIndex] = useState(0)
  const serializedMessages = useMemo(() => messages.join('|'), [messages])
  const progressPercentage =
    messages.length > 0
      ? Math.min(progressIndex / messages.length, 1) * 100
      : 0
  const currentStep = messages.length
    ? Math.min(progressIndex + 1, messages.length)
    : 0

  useEffect(() => {
    if (messages.length === 0) {
      setProgressIndex(0)
      return
    }

    setProgressIndex(0)

    const interval = setInterval(() => {
      setProgressIndex((previous) => {
        if (previous >= messages.length) {
          clearInterval(interval)
          return previous
        }
        return previous + 1
      })
    }, STEP_DURATION_MS)

    return () => {
      clearInterval(interval)
    }
  }, [messages.length, serializedMessages])

  const getStepStatus = (index: number) => {
    if (index < progressIndex) {
      return 'completed'
    }
    if (index === progressIndex && progressIndex < messages.length) {
      return 'active'
    }
    return 'pending'
  }

  return (
    <div
      className="relative bg-[#0A0B14] rounded-2xl border border-white/5 overflow-hidden"
      style={{
        boxShadow: `0 0 20px ${stageColor}15`,
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-white/5 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${stageColor}10 0%, transparent 100%)`,
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${stageColor}20, ${stageColor}10)`,
            border: `1px solid ${stageColor}30`,
          }}
        >
          <Sparkles className="w-5 h-5" style={{ color: stageColor }} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[#E6E9F2]">{cardTitle}</h3>
          <p className="text-xs text-[#8B92B0] mt-0.5">
            {progressIndex >= messages.length
              ? 'Card finalizado'
              : 'Criando seu card...'}
          </p>
        </div>
        <div className="text-xs text-[#8B92B0]">
          Etapa {currentStep}/{messages.length}
        </div>
      </div>

      {/* Loading Content */}
      <div className="p-6 space-y-5">
        {/* Progress Steps */}
        <div className="space-y-3">
          {messages.map((message, index) => {
            const status = getStepStatus(index)
            return (
              <div
                key={`${message}-${index}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 border ${
                  status === 'active'
                    ? 'border-white/15 bg-white/5'
                    : 'border-white/5'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                  style={{
                    borderColor:
                      status === 'completed'
                        ? '#5AD19A'
                        : status === 'active'
                          ? stageColor
                          : 'rgba(255,255,255,0.2)',
                    backgroundColor:
                      status === 'completed'
                        ? '#5AD19A20'
                        : status === 'active'
                          ? `${stageColor}15`
                          : 'transparent',
                  }}
                >
                  {status === 'completed' ? (
                    <Check className="w-3 h-3 text-[#5AD19A]" />
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status === 'active' ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor:
                          status === 'active'
                            ? stageColor
                            : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-sm ${
                      status === 'pending'
                        ? 'text-[#8B92B0]'
                        : 'text-[#E6E9F2]'
                    }`}
                  >
                    {message}
                  </span>
                  {status === 'active' && (
                    <span className="text-[11px] text-[#9EA5C5]">
                      Isso leva poucos segundos
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8B92B0]">
            <span>Progresso da IA</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#9B8AFB] to-[#7AA2FF] transition-[width] duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Skeleton Lines */}
        <div className="space-y-3 pt-2">
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: '90%' }} />
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: '75%' }} />
          <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: '85%' }} />
        </div>

        {/* Info Text */}
        <div className="flex items-center gap-2 pt-1 text-xs text-[#8B92B0]/70">
          <div className="i-lucide-info w-3.5 h-3.5" />
          <span>Você pode continuar navegando. Avisaremos quando finalizar.</span>
        </div>
      </div>

      {/* Animated Border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${stageColor}20, transparent)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
