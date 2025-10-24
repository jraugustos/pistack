/**
 * Canvas View State Management
 * Gerencia o estado da visualização do canvas (grid vs list)
 */

export type ViewMode = 'grid' | 'list'

const STORAGE_KEY = 'pistack:canvas:viewMode'

/**
 * Obtém o modo de visualização do localStorage
 */
export function getViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'grid'

  const stored = localStorage.getItem(STORAGE_KEY)
  return (stored === 'list' ? 'list' : 'grid') as ViewMode
}

/**
 * Define o modo de visualização no localStorage
 */
export function setViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(STORAGE_KEY, mode)
}

/**
 * Toggle entre grid e list
 */
export function toggleViewMode(currentMode: ViewMode): ViewMode {
  const newMode = currentMode === 'grid' ? 'list' : 'grid'
  setViewMode(newMode)
  return newMode
}
