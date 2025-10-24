/**
 * PIStack-specific commands
 * Defines all available commands in the application
 */

import {
  Sparkles,
  Plus,
  Search,
  List,
  LayoutGrid,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  FileText,
  Layers,
} from 'lucide-react'
import { createCommand, type Command } from './commands'

export interface CommandContext {
  // Navigation
  onNavigateToStage?: (stageNumber: number) => void
  onToggleAiSidebar?: () => void

  // View
  onToggleViewMode?: (mode: 'grid' | 'list') => void
  onToggleShowOnlyFilled?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void

  // Cards
  onRefreshCards?: () => void
  onCreateCard?: (cardType: string) => void
  onClearSearch?: () => void

  // Project
  onExportProject?: () => void
  onGoToOverview?: () => void

  // State
  currentViewMode?: 'grid' | 'list'
  currentStage?: number
  isAiSidebarOpen?: boolean
  showOnlyFilled?: boolean
}

/**
 * Build all PIStack commands based on current context
 */
export function buildPIStackCommands(context: CommandContext = {}): Command[] {
  const commands: Command[] = []

  // ============ NAVIGATION COMMANDS ============
  commands.push(
    createCommand({
      id: 'navigate-stage-1',
      title: 'Ir para Etapa 1: Ideia Base',
      description: 'Navegue para a primeira etapa do projeto',
      category: 'navigation',
      icon: Layers,
      keywords: ['etapa', 'stage', '1', 'ideia', 'base'],
      action: () => context.onNavigateToStage?.(1),
      isAvailable: () => context.currentStage !== 1,
    })
  )

  commands.push(
    createCommand({
      id: 'navigate-stage-2',
      title: 'Ir para Etapa 2: Entendimento',
      description: 'Navegue para a segunda etapa do projeto',
      category: 'navigation',
      icon: Layers,
      keywords: ['etapa', 'stage', '2', 'entendimento'],
      action: () => context.onNavigateToStage?.(2),
      isAvailable: () => context.currentStage !== 2,
    })
  )

  commands.push(
    createCommand({
      id: 'navigate-stage-3',
      title: 'Ir para Etapa 3: Escopo',
      description: 'Navegue para a terceira etapa do projeto',
      category: 'navigation',
      icon: Layers,
      keywords: ['etapa', 'stage', '3', 'escopo'],
      action: () => context.onNavigateToStage?.(3),
      isAvailable: () => context.currentStage !== 3,
    })
  )

  commands.push(
    createCommand({
      id: 'navigate-stage-4',
      title: 'Ir para Etapa 4: Design',
      description: 'Navegue para a quarta etapa do projeto',
      category: 'navigation',
      icon: Layers,
      keywords: ['etapa', 'stage', '4', 'design', 'ui', 'ux'],
      action: () => context.onNavigateToStage?.(4),
      isAvailable: () => context.currentStage !== 4,
    })
  )

  commands.push(
    createCommand({
      id: 'navigate-stage-5',
      title: 'Ir para Etapa 5: Tech',
      description: 'Navegue para a quinta etapa do projeto',
      category: 'navigation',
      icon: Layers,
      keywords: ['etapa', 'stage', '5', 'tech', 'tecnologia', 'arquitetura'],
      action: () => context.onNavigateToStage?.(5),
      isAvailable: () => context.currentStage !== 5,
    })
  )

  commands.push(
    createCommand({
      id: 'navigate-stage-6',
      title: 'Ir para Etapa 6: Planejamento',
      description: 'Navegue para a sexta etapa do projeto',
      category: 'navigation',
      icon: Layers,
      keywords: ['etapa', 'stage', '6', 'planejamento', 'timeline'],
      action: () => context.onNavigateToStage?.(6),
      isAvailable: () => context.currentStage !== 6,
    })
  )

  // ============ VIEW COMMANDS ============
  commands.push(
    createCommand({
      id: 'toggle-view-mode',
      title: context.currentViewMode === 'grid' ? 'Mudar para Lista' : 'Mudar para Grade',
      description: 'Alterne entre visualização em grade e lista',
      category: 'view',
      icon: context.currentViewMode === 'grid' ? List : LayoutGrid,
      keywords: ['view', 'visualização', 'grade', 'lista', 'grid', 'list'],
      action: () => {
        const newMode = context.currentViewMode === 'grid' ? 'list' : 'grid'
        context.onToggleViewMode?.(newMode)
      },
    })
  )

  commands.push(
    createCommand({
      id: 'toggle-filled-filter',
      title: context.showOnlyFilled ? 'Mostrar Todos os Cards' : 'Mostrar Apenas Preenchidos',
      description: 'Filtre cards por status de preenchimento',
      category: 'view',
      icon: context.showOnlyFilled ? Eye : EyeOff,
      keywords: ['filter', 'filtro', 'preenchido', 'filled', 'vazio', 'empty'],
      action: () => context.onToggleShowOnlyFilled?.(),
    })
  )

  commands.push(
    createCommand({
      id: 'zoom-in',
      title: 'Aumentar Zoom',
      description: 'Aumenta o zoom da visualização do canvas',
      category: 'view',
      icon: ZoomIn,
      keywords: ['zoom', 'aumentar', 'ampliar'],
      shortcut: 'Cmd++',
      action: () => context.onZoomIn?.(),
    })
  )

  commands.push(
    createCommand({
      id: 'zoom-out',
      title: 'Diminuir Zoom',
      description: 'Diminui o zoom da visualização do canvas',
      category: 'view',
      icon: ZoomOut,
      keywords: ['zoom', 'diminuir', 'reduzir'],
      shortcut: 'Cmd+-',
      action: () => context.onZoomOut?.(),
    })
  )

  // ============ AI COMMANDS ============
  commands.push(
    createCommand({
      id: 'toggle-ai-sidebar',
      title: context.isAiSidebarOpen ? 'Fechar Copiloto' : 'Abrir Copiloto',
      description: 'Abra ou feche o assistente de IA',
      category: 'ai',
      icon: Sparkles,
      keywords: ['ia', 'ai', 'copiloto', 'copilot', 'assistente', 'assistant'],
      action: () => context.onToggleAiSidebar?.(),
    })
  )

  // ============ CARDS COMMANDS ============
  commands.push(
    createCommand({
      id: 'refresh-cards',
      title: 'Atualizar Cards',
      description: 'Recarregue todos os cards da etapa atual',
      category: 'cards',
      icon: RefreshCw,
      keywords: ['refresh', 'atualizar', 'reload', 'recarregar'],
      action: () => context.onRefreshCards?.(),
    })
  )

  commands.push(
    createCommand({
      id: 'clear-search',
      title: 'Limpar Busca',
      description: 'Remove o filtro de busca',
      category: 'cards',
      icon: Search,
      keywords: ['search', 'busca', 'limpar', 'clear'],
      action: () => context.onClearSearch?.(),
    })
  )

  // ============ PROJECT COMMANDS ============
  commands.push(
    createCommand({
      id: 'go-to-overview',
      title: 'Visão Geral do Projeto',
      description: 'Veja um resumo completo do projeto',
      category: 'project',
      icon: FileText,
      keywords: ['overview', 'visão', 'geral', 'resumo', 'summary'],
      action: () => context.onGoToOverview?.(),
    })
  )

  commands.push(
    createCommand({
      id: 'export-project',
      title: 'Exportar Projeto',
      description: 'Exporte o projeto em formato JSON',
      category: 'project',
      icon: Download,
      keywords: ['export', 'exportar', 'download', 'salvar', 'json'],
      action: () => context.onExportProject?.(),
    })
  )

  return commands
}
