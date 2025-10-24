/**
 * Command Palette - Command Structure
 * Defines available commands and their metadata
 */

import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  Plus,
  Search,
  List,
  LayoutGrid,
  Trash2,
  Download,
  Upload,
  Settings,
  HelpCircle,
  Zap,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react'

export type CommandCategory =
  | 'navigation'
  | 'creation'
  | 'view'
  | 'ai'
  | 'cards'
  | 'project'
  | 'help'

export interface Command {
  id: string
  title: string
  description: string
  category: CommandCategory
  icon: LucideIcon
  keywords: string[] // For fuzzy search
  shortcut?: string // Display shortcut (e.g., "Cmd+K")
  action: () => void | Promise<void>
  isAvailable?: () => boolean // Optional: dynamic availability
}

export const COMMAND_CATEGORIES: Record<
  CommandCategory,
  { label: string; order: number }
> = {
  navigation: { label: 'Navegação', order: 1 },
  view: { label: 'Visualização', order: 2 },
  creation: { label: 'Criação', order: 3 },
  ai: { label: 'IA', order: 4 },
  cards: { label: 'Cards', order: 5 },
  project: { label: 'Projeto', order: 6 },
  help: { label: 'Ajuda', order: 7 },
}

/**
 * Create a command definition
 */
export function createCommand(
  config: Omit<Command, 'keywords'> & { keywords?: string[] }
): Command {
  // Auto-generate keywords from title and description if not provided
  const autoKeywords = [
    config.title.toLowerCase(),
    config.description.toLowerCase(),
    config.category,
  ]

  return {
    ...config,
    keywords: config.keywords || autoKeywords,
  }
}

/**
 * Score a command based on search query
 * Returns 0-100, higher is better match
 */
export function scoreCommand(command: Command, query: string): number {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return 50 // Default score for no query
  }

  const title = command.title.toLowerCase()
  const description = command.description.toLowerCase()

  // Exact title match
  if (title === normalizedQuery) {
    return 100
  }

  // Title starts with query
  if (title.startsWith(normalizedQuery)) {
    return 90
  }

  // Title contains query
  if (title.includes(normalizedQuery)) {
    return 80
  }

  // Description contains query
  if (description.includes(normalizedQuery)) {
    return 60
  }

  // Keyword match
  const hasKeywordMatch = command.keywords.some(keyword =>
    keyword.includes(normalizedQuery)
  )
  if (hasKeywordMatch) {
    return 50
  }

  // Fuzzy match (all characters of query appear in order)
  let queryIndex = 0
  for (const char of title) {
    if (char === normalizedQuery[queryIndex]) {
      queryIndex++
      if (queryIndex === normalizedQuery.length) {
        return 40 // Fuzzy match
      }
    }
  }

  return 0 // No match
}

/**
 * Filter and sort commands based on search query
 */
export function searchCommands(
  commands: Command[],
  query: string,
  options: {
    limit?: number
    minScore?: number
  } = {}
): Command[] {
  const { limit = 10, minScore = 30 } = options

  // Score all commands
  const scored = commands
    .map(command => ({
      command,
      score: scoreCommand(command, query),
    }))
    .filter(item => item.score >= minScore)
    .filter(item => {
      // Check availability if defined
      if (item.command.isAvailable) {
        return item.command.isAvailable()
      }
      return true
    })

  // Sort by score (desc)
  scored.sort((a, b) => b.score - a.score)

  // Limit results
  return scored.slice(0, limit).map(item => item.command)
}

/**
 * Group commands by category
 */
export function groupCommandsByCategory(
  commands: Command[]
): Record<CommandCategory, Command[]> {
  const grouped = {} as Record<CommandCategory, Command[]>

  for (const command of commands) {
    if (!grouped[command.category]) {
      grouped[command.category] = []
    }
    grouped[command.category].push(command)
  }

  return grouped
}
