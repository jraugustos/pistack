'use client'

import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface MvpDefinitionCardProps {
  cardId: string
  description?: string
  scope?: string
  outOfScope?: string
  timeline?: string
  onAiClick?: () => void
  onSave?: (content: { description?: string; scope?: string; outOfScope?: string; timeline?: string }) => Promise<void>
}

export function MvpDefinitionCard({ cardId, description = '', scope = '', outOfScope = '', timeline = '', onAiClick, onSave }: MvpDefinitionCardProps) {
  const [local, setLocal] = useState({ description, scope, outOfScope, timeline })

  useEffect(() => {
    setLocal({ description: description || '', scope: scope || '', outOfScope: outOfScope || '', timeline: timeline || '' })
  }, [description, scope, outOfScope, timeline])

  useAutosave(local, {
    delay: 1500,
    onSave: async (data) => {
      if (onSave) {
        const clean = {
          description: data.description?.trim() || '',
          scope: data.scope?.trim() || '',
          outOfScope: data.outOfScope?.trim() || '',
          timeline: data.timeline?.trim() || '',
        }
        await onSave(clean)
      }
    },
  })

  const TextArea = (props: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div>
      <div className="text-sm font-medium mb-1.5">{props.label}</div>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full bg-white/10 border border-[#FFC24B]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FFC24B] min-h-[60px]"
        placeholder={props.placeholder}
      />
    </div>
  )

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Definição do MVP"
      icon={Target}
      stageColor="#FFC24B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        <TextArea
          label="Descrição"
          value={local.description}
          onChange={(v) => setLocal((s) => ({ ...s, description: v }))}
          placeholder="Visão concisa do MVP (o que será entregue)."
        />
        <TextArea
          label="Escopo"
          value={local.scope}
          onChange={(v) => setLocal((s) => ({ ...s, scope: v }))}
          placeholder="Funcionalidades incluídas nesta versão inicial."
        />
        <TextArea
          label="Fora de Escopo"
          value={local.outOfScope}
          onChange={(v) => setLocal((s) => ({ ...s, outOfScope: v }))}
          placeholder="Itens explicitamente excluídos do MVP."
        />
        <TextArea
          label="Timeline"
          value={local.timeline}
          onChange={(v) => setLocal((s) => ({ ...s, timeline: v }))}
          placeholder="Prazo estimado para entrega do MVP."
        />
      </div>
    </BaseCard>
  )
}
