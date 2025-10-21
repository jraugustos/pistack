'use client'

import { TrendingUp } from 'lucide-react'
import { BaseCard } from '../base-card'

interface KPI {
  name: string
  target: string
}

interface InitialKPIsCardProps {
  cardId: string
  kpis?: KPI[] | string
  onAiClick?: () => void
  onSave?: (content: { kpis: KPI[] }) => Promise<void>
}

/**
 * InitialKPIsCard - Card 6 of Etapa 1: Ideia Base
 *
 * Follows HTML structure from canvas-1-2.html lines 374-411
 * - List of KPIs with targets
 * - Display as rows with name and value
 *
 * IMPORTANT: Pixel-perfect implementation from HTML prototype
 */
export function InitialKPIsCard({
  cardId,
  kpis = [],
  onAiClick,
  onSave,
}: InitialKPIsCardProps) {
  const defaultKpis: KPI[] = [
    { name: 'Usuários Ativos (MAU)', target: '—' },
    { name: 'Retenção D7', target: '—' },
    { name: 'NPS', target: '—' },
  ]

  let displayKpis: KPI[] = defaultKpis

  const normalizeKpiEntry = (entry: any): KPI | null => {
    if (!entry) return null
    if (typeof entry === 'string') {
      const [namePart, ...targetParts] = entry.split(/[:|-]/)
      const name = namePart.trim()
      const target = targetParts.join(':').trim() || '—'
      return name ? { name, target } : null
    }

    if (typeof entry === 'object') {
      const name = (entry.name ?? entry.metric ?? '').toString().trim()
      const target = (entry.target ?? entry.value ?? '—').toString().trim()
      return name ? { name, target: target || '—' } : null
    }

    return null
  }

  if (Array.isArray(kpis)) {
    const normalized = kpis
      .map(normalizeKpiEntry)
      .filter((item): item is KPI => item !== null)
    if (normalized.length > 0) {
      displayKpis = normalized
    }
  } else if (typeof kpis === 'string' && kpis.trim()) {
    try {
      const parsed = JSON.parse(kpis)
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .map(normalizeKpiEntry)
          .filter((item): item is KPI => item !== null)
        if (normalized.length > 0) {
          displayKpis = normalized
        }
      }
    } catch {
      const normalized = kpis
        .split(/\r?\n|;/)
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => normalizeKpiEntry(segment))
        .filter((item): item is KPI => item !== null)

      if (normalized.length > 0) {
        displayKpis = normalized
      }
    }
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="KPIs Iniciais"
      icon={TrendingUp}
      stageColor="#7AA2FF"
      showAiButton={false}
    >
      <div className="space-y-2.5">
        {displayKpis.map((kpi, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-white/5 rounded"
          >
            <span className="text-xs text-[#E6E9F2]/70">{kpi.name}</span>
            <span className="text-xs font-semibold">{kpi.target}</span>
          </div>
        ))}
      </div>
    </BaseCard>
  )
}
