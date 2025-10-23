'use client'

import { Check, Loader2, AlertCircle, Clock } from 'lucide-react'
import type { SaveStatus } from '@/hooks/use-autosave'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SaveIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
  error?: Error | null
  className?: string
}

/**
 * Indicador visual de status de autosave
 *
 * Estados:
 * - idle: não mostra nada
 * - pending: mostra relógio (aguardando debounce)
 * - saving: mostra spinner + "Salvando..."
 * - saved: mostra check verde + "Salvo" (fade após 2s)
 * - error: mostra alerta vermelho + mensagem de erro
 */
export function SaveIndicator({
  status,
  lastSaved,
  error,
  className = '',
}: SaveIndicatorProps) {
  // Não mostrar nada quando idle
  if (status === 'idle') {
    return null
  }

  // Formatar timestamp de última salvamento
  const lastSavedText = lastSaved
    ? `Última atualização: ${formatDistanceToNow(lastSaved, {
        addSuffix: true,
        locale: ptBR,
      })}`
    : 'Nunca salvo'

  return (
    <div
      className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-300 ${className}`}
      title={status === 'saved' ? lastSavedText : undefined}
    >
      {/* Estado: Pendente (aguardando debounce) */}
      {status === 'pending' && (
        <>
          <Clock className="w-3.5 h-3.5 text-gray-400 animate-pulse" />
          <span className="text-gray-400">Aguardando...</span>
        </>
      )}

      {/* Estado: Salvando */}
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span className="text-blue-400">Salvando...</span>
        </>
      )}

      {/* Estado: Salvo (fade out após 2s) */}
      {status === 'saved' && (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Salvo</span>
        </>
      )}

      {/* Estado: Erro */}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400" title={error?.message}>
            Erro ao salvar
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Variant compacta do indicador (apenas ícone, sem texto)
 */
export function SaveIndicatorCompact({
  status,
  lastSaved,
  error,
  className = '',
}: SaveIndicatorProps) {
  if (status === 'idle') {
    return null
  }

  const lastSavedText = lastSaved
    ? `Última atualização: ${formatDistanceToNow(lastSaved, {
        addSuffix: true,
        locale: ptBR,
      })}`
    : 'Nunca salvo'

  return (
    <div
      className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${className}`}
      title={
        status === 'error'
          ? error?.message || 'Erro ao salvar'
          : status === 'saved'
          ? lastSavedText
          : status === 'saving'
          ? 'Salvando...'
          : 'Aguardando...'
      }
    >
      {status === 'pending' && (
        <Clock className="w-3.5 h-3.5 text-gray-400 animate-pulse" />
      )}

      {status === 'saving' && (
        <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
      )}

      {status === 'saved' && <Check className="w-3.5 h-3.5 text-green-400" />}

      {status === 'error' && (
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      )}
    </div>
  )
}
