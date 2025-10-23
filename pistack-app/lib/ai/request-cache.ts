/**
 * Sistema de cache para requisições de IA
 * Evita requisições duplicadas e melhora a performance
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface RequestInProgress<T> {
  promise: Promise<T>
  timestamp: number
}

export class AIRequestCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private inProgress: Map<string, RequestInProgress<T>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutos

  /**
   * Gera uma chave de cache baseada nos parâmetros
   */
  private generateKey(params: Record<string, any>): string {
    // Ordena as chaves para garantir consistência
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key]
        return acc
      }, {} as Record<string, any>)

    return JSON.stringify(sorted)
  }

  /**
   * Obtém dados do cache se ainda válidos
   */
  get(params: Record<string, any>): T | null {
    const key = this.generateKey(params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Armazena dados no cache
   */
  set(params: Record<string, any>, data: T, ttl?: number): void {
    const key = this.generateKey(params)
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })
  }

  /**
   * Verifica se há uma requisição em andamento com os mesmos parâmetros
   * Se houver, retorna a Promise existente ao invés de criar nova requisição
   */
  async deduplicate<R extends T>(
    params: Record<string, any>,
    requestFn: () => Promise<R>
  ): Promise<R> {
    const key = this.generateKey(params)

    // Verifica se já existe requisição em andamento
    const existing = this.inProgress.get(key)
    if (existing) {
      console.log('[AICache] Requisição em andamento detectada, reutilizando...', {
        key: key.substring(0, 100),
        age: Date.now() - existing.timestamp,
      })
      return existing.promise as Promise<R>
    }

    // Cria nova requisição
    const promise = requestFn()
      .then((result) => {
        // Remove da lista de em andamento
        this.inProgress.delete(key)
        // Armazena no cache
        this.set(params, result)
        return result
      })
      .catch((error) => {
        // Remove da lista de em andamento em caso de erro
        this.inProgress.delete(key)
        throw error
      })

    // Registra como em andamento
    this.inProgress.set(key, {
      promise: promise as Promise<T>,
      timestamp: Date.now(),
    })

    return promise
  }

  /**
   * Limpa entradas expiradas do cache
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))

    if (keysToDelete.length > 0) {
      console.log(`[AICache] Limpou ${keysToDelete.length} entradas expiradas`)
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
    this.inProgress.clear()
  }

  /**
   * Invalida cache para parâmetros específicos
   */
  invalidate(params: Record<string, any>): void {
    const key = this.generateKey(params)
    this.cache.delete(key)
    this.inProgress.delete(key)
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      inProgressCount: this.inProgress.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key: key.substring(0, 100),
        age: Date.now() - entry.timestamp,
        ttl: entry.expiresAt - Date.now(),
      })),
    }
  }
}

// Instância global de cache para requisições de IA
export const aiRequestCache = new AIRequestCache()

// Limpa cache expirado a cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    aiRequestCache.cleanup()
  }, 10 * 60 * 1000)
}
