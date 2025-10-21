'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10',
          theme === 'dark' && 'bg-white/10'
        )}
        aria-label="Dark mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10',
          theme === 'light' && 'bg-black/10'
        )}
        aria-label="Light mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
