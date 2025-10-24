'use client'

/**
 * Client-only wrapper for AiSidebar to prevent hydration errors
 * This component only renders on the client side
 */

import dynamic from 'next/dynamic'
import type { CardRecord } from '@/lib/types/card'

interface AiSidebarProps {
  projectId: string
  activeStage: number
  isOpen: boolean
  onToggle: () => void
  allCards?: CardRecord[]
}

const AiSidebarDynamic = dynamic(
  () => import('./ai-sidebar').then(mod => ({ default: mod.AiSidebar })),
  {
    ssr: false,
    loading: () => (
      <aside className="w-14 border-l border-white/5 bg-[#0F1115] flex flex-col items-center py-4 transition-all duration-300">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7AA2FF]/20 to-[#5AD19A]/20 border border-[#7AA2FF]/30 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#7AA2FF] border-t-transparent rounded-full animate-spin" />
        </div>
      </aside>
    ),
  }
)

export function AiSidebarClient(props: AiSidebarProps) {
  return <AiSidebarDynamic {...props} />
}
