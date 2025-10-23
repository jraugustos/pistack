import { useCallback, useRef } from 'react'

interface DebouncedAIOptions {
  /**
   * Tempo de espera em ms antes de executar a requisição
   * @default 1000
   */
  delay?: number

  /**
   * Se true, executa imediatamente na primeira chamada
   * @default false
   */
  leading?: boolean
}

/**
 * Hook para debounce de requisições de IA
 * Previne múltiplas chamadas simultâneas ao clicar repetidamente
 */
export function useDebouncedAI<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: DebouncedAIOptions = {}
): T {
  const { delay = 1000, leading = false } = options

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallRef = useRef<number>(0)
  const inProgressRef = useRef<boolean>(false)

  const debouncedFn = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const now = Date.now()

      // Se já está em progresso, ignora nova chamada
      if (inProgressRef.current) {
        console.log('[DebouncedAI] Requisição já em andamento, ignorando...')
        return Promise.reject(new Error('Request already in progress'))
      }

      // Limpa timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Se é leading e tempo suficiente passou, executa imediatamente
      if (leading && now - lastCallRef.current > delay) {
        lastCallRef.current = now
        inProgressRef.current = true

        try {
          const result = await fn(...args)
          return result
        } finally {
          inProgressRef.current = false
        }
      }

      // Caso contrário, agenda para executar após delay
      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          lastCallRef.current = Date.now()
          inProgressRef.current = true

          try {
            const result = await fn(...args)
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            inProgressRef.current = false
          }
        }, delay)
      })
    },
    [fn, delay, leading]
  ) as T

  return debouncedFn
}

/**
 * Hook para prevenir múltiplos cliques em botões de IA
 */
export function useAIButtonGuard() {
  const lastClickRef = useRef<Record<string, number>>({})
  const MIN_INTERVAL = 2000 // 2 segundos entre cliques

  const canClick = useCallback((buttonId: string): boolean => {
    const now = Date.now()
    const lastClick = lastClickRef.current[buttonId] || 0

    if (now - lastClick < MIN_INTERVAL) {
      console.log(`[AIButtonGuard] Bloqueando clique rápido demais em ${buttonId}`)
      return false
    }

    lastClickRef.current[buttonId] = now
    return true
  }, [])

  const reset = useCallback((buttonId?: string) => {
    if (buttonId) {
      delete lastClickRef.current[buttonId]
    } else {
      lastClickRef.current = {}
    }
  }, [])

  return { canClick, reset }
}
