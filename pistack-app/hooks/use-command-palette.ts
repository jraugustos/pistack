/**
 * Hook for Command Palette functionality
 * Handles Cmd+K detection and palette state
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  buildPIStackCommands,
  searchCommands,
  type Command,
  type CommandContext,
} from '@/lib/command-palette'

interface UseCommandPaletteProps {
  context: CommandContext
  enabled?: boolean
}

export function useCommandPalette({ context, enabled = true }: UseCommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Build commands based on context
  const allCommands = useMemo(() => {
    return buildPIStackCommands(context)
  }, [context])

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    return searchCommands(allCommands, searchQuery, {
      limit: 10,
      minScore: 20,
    })
  }, [allCommands, searchQuery])

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  // Detect Cmd+K / Ctrl+K
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      const isCommandK =
        (event.metaKey || event.ctrlKey) && event.key === 'k'

      if (isCommandK) {
        event.preventDefault()
        setIsOpen(prev => !prev)
      }

      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, isOpen])

  // Handle command execution
  const executeCommand = useCallback(
    async (command: Command) => {
      try {
        await command.action()
        setIsOpen(false)
        setSearchQuery('')
        setSelectedIndex(0)
      } catch (error) {
        console.error('Error executing command:', error)
        // Keep palette open on error so user can see feedback
      }
    },
    []
  )

  // Execute selected command
  const executeSelected = useCallback(() => {
    const command = filteredCommands[selectedIndex]
    if (command) {
      executeCommand(command)
    }
  }, [filteredCommands, selectedIndex, executeCommand])

  // Navigate selection
  const navigateDown = useCallback(() => {
    setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
  }, [filteredCommands.length])

  const navigateUp = useCallback(() => {
    setSelectedIndex(prev =>
      prev === 0 ? filteredCommands.length - 1 : prev - 1
    )
  }, [filteredCommands.length])

  // Open palette programmatically
  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  // Close palette programmatically
  const close = useCallback(() => {
    setIsOpen(false)
    setSearchQuery('')
    setSelectedIndex(0)
  }, [])

  return {
    isOpen,
    searchQuery,
    setSearchQuery,
    filteredCommands,
    selectedIndex,
    executeCommand,
    executeSelected,
    navigateDown,
    navigateUp,
    open,
    close,
  }
}
