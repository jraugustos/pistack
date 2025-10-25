'use client'

import { ChevronRight } from 'lucide-react'
import { Template } from '@/lib/types/card-definition'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import * as LucideIcons from 'lucide-react'

interface TemplateCardProps {
  template: Template
  onActivate?: (templateId: string) => void
}

/**
 * Template Card Component
 * Pixel-perfect implementation of HTML lines 61-83 from template-card-creator.html
 */
export function TemplateCard({ template, onActivate }: TemplateCardProps) {
  const router = useRouter()

  // Calculate stats
  const stagesCount = template.stages?.length || 0
  const cardsCount =
    template.stages?.reduce((sum, stage) => sum + (stage.cards?.length || 0), 0) || 0

  // Get template color (first stage color or default)
  const templateColor = template.stages?.[0]?.stage_color || '#7AA2FF'

  // Get Lucide icon dynamically
  const IconComponent = template.icon
    ? (LucideIcons[template.icon as keyof typeof LucideIcons] as any)
    : LucideIcons.Smartphone

  const handleClick = () => {
    router.push(`/admin/templates/editor/${template.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="group text-left bg-[#151821] border border-white/10 rounded-xl p-6 hover:border-[#7AA2FF]/50 transition-all hover:shadow-lg w-full"
      style={{
        borderColor: template.is_active ? `${templateColor}40` : undefined,
      }}
    >
      {/* Icon + Active Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl border flex items-center justify-center"
          style={{
            backgroundColor: `${templateColor}10`,
            borderColor: `${templateColor}20`,
          }}
        >
          {IconComponent && (
            <IconComponent
              className="w-6 h-6"
              style={{ color: templateColor }}
            />
          )}
        </div>

        {template.is_active && (
          <div className="px-2 py-1 bg-[#5AD19A]/10 rounded text-xs text-[#5AD19A] font-medium">
            Ativo
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
      <p className="text-sm text-[#E6E9F2]/60 mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-2 text-xs text-[#E6E9F2]/40 mb-3">
        <span>{stagesCount} etapas</span>
        <span>•</span>
        <span>{cardsCount} cards</span>
      </div>

      {/* Hover Action */}
      <div className="flex items-center gap-1.5 text-xs">
        <ChevronRight
          className="w-3.5 h-3.5 text-[#7AA2FF] opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <span className="text-[#7AA2FF] opacity-0 group-hover:opacity-100 transition-opacity">
          Editar template
        </span>
      </div>
    </button>
  )
}
