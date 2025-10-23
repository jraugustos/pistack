'use client'

import { useEffect, useState } from 'react'
import { Palette } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface DesignSystemCardProps {
  cardId: string
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  typography?: {
    headings?: string
    body?: string
  }
  spacing?: string
  borderRadius?: string
  onAiClick?: () => void
  onSave?: (content: {
    colors?: { primary?: string; secondary?: string; accent?: string }
    typography?: { headings?: string; body?: string }
    spacing?: string
    borderRadius?: string
  }) => Promise<void>
}

function normalizeContent(input: any) {
  if (!input) return {}

  // Se for string, tentar parsear como JSON
  if (typeof input === 'string') {
    try {
      return JSON.parse(input)
    } catch {
      return { colors: {}, typography: {}, spacing: '', borderRadius: '' }
    }
  }

  // Se for objeto, normalizar estrutura
  return {
    colors: input.colors || {},
    typography: input.typography || {},
    spacing: input.spacing || '',
    borderRadius: input.borderRadius || '',
  }
}

export function DesignSystemCard({
  cardId,
  colors = {},
  typography = {},
  spacing = '',
  borderRadius = '',
  onAiClick,
  onSave,
}: DesignSystemCardProps) {
  const [local, setLocal] = useState({
    colors: colors || {},
    typography: typography || {},
    spacing: spacing || '',
    borderRadius: borderRadius || '',
  })

  useEffect(() => {
    const normalized = normalizeContent({ colors, typography, spacing, borderRadius })
    setLocal(normalized)
  }, [colors, typography, spacing, borderRadius])

  useAutosave(local, {
    delay: 1500,
    onSave: async (data) => {
      if (onSave) {
        const clean = {
          colors: {
            primary: data.colors?.primary?.trim() || '',
            secondary: data.colors?.secondary?.trim() || '',
            accent: data.colors?.accent?.trim() || '',
          },
          typography: {
            headings: data.typography?.headings?.trim() || '',
            body: data.typography?.body?.trim() || '',
          },
          spacing: data.spacing?.trim() || '',
          borderRadius: data.borderRadius?.trim() || '',
        }
        await onSave(clean)
      }
    },
  })

  const Input = (props: {
    label: string
    value: string
    onChange: (v: string) => void
    placeholder: string
    type?: string
  }) => (
    <div>
      <div className="text-xs font-medium mb-1.5 text-[#E6E9F2]/80">{props.label}</div>
      <input
        type={props.type || 'text'}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full bg-white/10 border border-[#FF6B6B]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF6B6B]"
        placeholder={props.placeholder}
      />
    </div>
  )

  const TextArea = (props: {
    label: string
    value: string
    onChange: (v: string) => void
    placeholder: string
  }) => (
    <div>
      <div className="text-xs font-medium mb-1.5 text-[#E6E9F2]/80">{props.label}</div>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full bg-white/10 border border-[#FF6B6B]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF6B6B] min-h-[50px]"
        placeholder={props.placeholder}
      />
    </div>
  )

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Design System"
      icon={Palette}
      stageColor="#FF6B6B"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2 text-[#FF6B6B]">Cores</div>
          <div className="space-y-2">
            <Input
              label="Primária"
              value={local.colors?.primary || ''}
              onChange={(v) => setLocal((s) => ({ ...s, colors: { ...s.colors, primary: v } }))}
              placeholder="#hexadecimal ou nome"
              type="text"
            />
            <Input
              label="Secundária"
              value={local.colors?.secondary || ''}
              onChange={(v) => setLocal((s) => ({ ...s, colors: { ...s.colors, secondary: v } }))}
              placeholder="#hexadecimal ou nome"
              type="text"
            />
            <Input
              label="Accent"
              value={local.colors?.accent || ''}
              onChange={(v) => setLocal((s) => ({ ...s, colors: { ...s.colors, accent: v } }))}
              placeholder="#hexadecimal ou nome (opcional)"
              type="text"
            />
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2 text-[#FF6B6B]">Tipografia</div>
          <div className="space-y-2">
            <Input
              label="Fonte para Títulos"
              value={local.typography?.headings || ''}
              onChange={(v) => setLocal((s) => ({ ...s, typography: { ...s.typography, headings: v } }))}
              placeholder="ex: Inter, Roboto, etc."
            />
            <Input
              label="Fonte para Texto"
              value={local.typography?.body || ''}
              onChange={(v) => setLocal((s) => ({ ...s, typography: { ...s.typography, body: v } }))}
              placeholder="ex: Inter, Roboto, etc."
            />
          </div>
        </div>

        <TextArea
          label="Espaçamento"
          value={local.spacing || ''}
          onChange={(v) => setLocal((s) => ({ ...s, spacing: v }))}
          placeholder="Sistema de espaçamento: 4px, 8px, 16px, 24px, 32px..."
        />

        <TextArea
          label="Border Radius"
          value={local.borderRadius || ''}
          onChange={(v) => setLocal((s) => ({ ...s, borderRadius: v }))}
          placeholder="Valores de arredondamento: 4px, 8px, 12px, 16px... (opcional)"
        />
      </div>
    </BaseCard>
  )
}
