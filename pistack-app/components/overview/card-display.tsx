import { CARD_TITLES } from '@/lib/card-constants'

interface Card {
  id: string
  card_type: string
  content: Record<string, any>
}

interface CardDisplayProps {
  card: Card
  stageColor: string
}

function getCardIcon(cardType: string): string {
  const iconMap: Record<string, string> = {
    'project-name': '💡',
    pitch: '🎯',
    problem: '⚠️',
    solution: '✨',
    'target-audience': '👥',
    'initial-kpis': '📊',
    'validation-hypotheses': '🔬',
    'primary-persona': '👤',
    'value-proposition': '💎',
    benchmarking: '📈',
    'mvp-definition': '🚀',
    'essential-features': '⭐',
    'user-stories': '📝',
    'acceptance-criteria': '✅',
    roadmap: '🗺️',
    'scope-constraints': '🎯',
    'user-flows': '🔄',
    wireframes: '🎨',
    'design-system': '🎭',
    components: '🧩',
    accessibility: '♿',
    'tech-stack': '⚙️',
    architecture: '🏗️',
    database: '💾',
    'api-design': '🔌',
    infrastructure: '☁️',
    security: '🔒',
    'sprint-planning': '📅',
    timeline: '⏱️',
    resources: '👔',
    budget: '💰',
    milestones: '🏁',
    'success-criteria': '🎯',
    'risk-management': '⚠️',
    'launch-plan': '🚀',
  }
  return iconMap[cardType] || '📄'
}

function renderCardContent(content: Record<string, any>) {
  if (!content || Object.keys(content).length === 0) {
    return (
      <p className="text-sm text-[#E6E9F2]/40 italic">
        Nenhum conteúdo adicionado ainda
      </p>
    )
  }

  // Try to find the main content field
  const mainFields = ['description', 'pitch', 'text', 'content', 'definition']
  const mainContent = mainFields
    .map((field) => content[field])
    .find((value) => value && typeof value === 'string' && value.trim().length > 0)

  if (mainContent) {
    return (
      <p className="text-sm text-[#E6E9F2]/70 leading-relaxed line-clamp-4">
        {mainContent}
      </p>
    )
  }

  // Try to display any arrays
  const arrays = Object.entries(content).filter(
    ([_, value]) => Array.isArray(value) && value.length > 0
  )

  if (arrays.length > 0) {
    const [fieldName, items] = arrays[0]
    return (
      <div className="space-y-2">
        {items.slice(0, 3).map((item: any, index: number) => {
          const text =
            typeof item === 'string'
              ? item
              : item.name || item.title || item.description || JSON.stringify(item)
          return (
            <div
              key={index}
              className="flex items-start gap-2 text-xs text-[#E6E9F2]/60"
            >
              <span className="text-[#5AD19A] mt-0.5">•</span>
              <span className="line-clamp-2">{text}</span>
            </div>
          )
        })}
        {items.length > 3 && (
          <p className="text-xs text-[#E6E9F2]/40">
            +{items.length - 3} itens
          </p>
        )}
      </div>
    )
  }

  // Fallback: show first few values
  const values = Object.entries(content)
    .filter(([key, value]) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (typeof value === 'object' && value !== null) return true
      return false
    })
    .slice(0, 2)

  if (values.length > 0) {
    return (
      <div className="space-y-2">
        {values.map(([key, value]) => (
          <div key={key}>
            <div className="text-xs font-medium text-[#E6E9F2]/40 mb-1">
              {key}
            </div>
            <p className="text-sm text-[#E6E9F2]/70 line-clamp-2">
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <p className="text-sm text-[#E6E9F2]/40 italic">
      Conteúdo estruturado disponível
    </p>
  )
}

export function CardDisplay({ card, stageColor }: CardDisplayProps) {
  const title = CARD_TITLES[card.card_type] || card.card_type
  const icon = getCardIcon(card.card_type)

  return (
    <div className="bg-[#151821] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center border text-xl"
          style={{
            backgroundColor: `${stageColor}10`,
            borderColor: `${stageColor}20`,
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div
            className="text-xs font-medium mb-1"
            style={{ color: stageColor }}
          >
            {title}
          </div>
        </div>
      </div>
      {renderCardContent(card.content)}
    </div>
  )
}
