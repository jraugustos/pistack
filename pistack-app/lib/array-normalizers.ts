import { removeLabelNoise } from './array-validators'

export function toArrayOfStrings(value: unknown): string[] {
  const out: string[] = []
  const push = (s: unknown) => {
    if (s == null) return
    const cleaned = String(s)
      .replace(/^["']|["']$/g, '')
      .replace(/^[-*•\d]+[).\-\s]*/, '')
      .trim()
    if (cleaned) out.push(removeLabelNoise(cleaned))
  }

  if (!value) return out

  if (typeof value === 'string') {
    const s = value.trim()
    try {
      if (s.startsWith('[') && s.endsWith(']')) {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) arr.forEach(push)
        return out
      }
    } catch {}

    s.split(/\r?\n|;/)
      .map((seg) => seg.trim())
      .filter(Boolean)
      .forEach((seg) => {
        const parts = seg.split(/:\s+/)
        push(parts.length > 1 ? parts.slice(1).join(': ') : parts[0])
      })

    return out
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (typeof item === 'string') push(item)
      else if (item && typeof item === 'object') push((item as any).name || (item as any).value || JSON.stringify(item))
    })
    return out
  }

  if (typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach(push)
  }
  return out
}

export function normalizeKpis(value: unknown): { name: string; target: string }[] {
  const list: { name: string; target: string }[] = []
  const pushKpi = (name: unknown, target: unknown) => {
    const n = String(name ?? '').trim()
    const t = String(target ?? '').trim()
    if (!n) return
    list.push({ name: removeLabelNoise(n), target: removeLabelNoise(t) })
  }

  if (!value) return list

  if (typeof value === 'string') {
    const s = value.trim()
    try {
      if (s.startsWith('{')) {
        const parsed = JSON.parse(s)
        if (Array.isArray(parsed.kpis)) {
          parsed.kpis.forEach((i: any) => pushKpi(i.name || i.metric, i.target || i.value))
          return list
        }
      }
      if (s.startsWith('[')) {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) arr.forEach((i: any) => pushKpi(i.name || i.metric, i.target || i.value))
        return list
      }
    } catch {}

    s.split(/\r?\n|;/)
      .map((seg) => seg.trim())
      .filter(Boolean)
      .forEach((seg) => {
        const [namePart, ...rest] = seg.split(/[:|-]/)
        pushKpi(namePart, rest.join(':'))
      })
    return list
  }

  if (Array.isArray(value)) {
    value.forEach((i: any) => {
      if (typeof i === 'string') {
        const [namePart, ...rest] = i.split(/[:|-]/)
        pushKpi(namePart, rest.join(':'))
      } else if (i && typeof i === 'object') {
        pushKpi(i.name || i.metric, i.target || i.value)
      }
    })
    return list
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]: any) => {
      if (v && typeof v === 'object') pushKpi(v.name || k, v.target || v.value)
      else pushKpi(k, v)
    })
  }
  return list
}

export function normalizeCardArrays(cardType: string, content: any) {
  if (!content || typeof content !== 'object') return content
  const data = { ...content }

  switch (cardType) {
    case 'problem':
      if (data.painPoints) data.painPoints = toArrayOfStrings(data.painPoints)
      break
    case 'solution':
      if (data.differentiators) data.differentiators = toArrayOfStrings(data.differentiators)
      break
    case 'initial-kpis':
      data.kpis = normalizeKpis(data.kpis ?? data.value)
      break
    case 'validation-hypotheses':
      if (Array.isArray(data.hypotheses)) {
        data.hypotheses = data.hypotheses.map((h: any) =>
          typeof h === 'string' ? { statement: removeLabelNoise(h) } : h
        )
      }
      break
    case 'primary-persona':
      data.goals = toArrayOfStrings(data.goals)
      data.frustrations = toArrayOfStrings(data.frustrations)
      data.motivations = toArrayOfStrings(data.motivations)
      break
    case 'value-proposition':
      data.benefits = toArrayOfStrings(data.benefits)
      break
    case 'benchmarking':
      if (Array.isArray(data.competitors)) {
        data.competitors = data.competitors.map((c: any) => {
          if (typeof c === 'string') {
            const [name, ...rest] = c.split(':')
            return { name: name.trim(), pricing: rest.join(':').trim() }
          }
          const obj = { ...c }
          obj.strengths = toArrayOfStrings(obj.strengths)
          obj.weaknesses = toArrayOfStrings(obj.weaknesses)
          obj.opportunities = toArrayOfStrings(obj.opportunities)
          return obj
        })
      }
      break
    case 'essential-features':
      if (Array.isArray(data.features)) {
        data.features = data.features.map((f: any) =>
          typeof f === 'string' ? { name: removeLabelNoise(f) } : f
        )
      }
      break
    case 'user-stories':
      if (Array.isArray(data.stories)) {
        data.stories = data.stories.map((s: any) => {
          if (typeof s === 'string') {
            return { title: removeLabelNoise(s), acceptanceCriteria: [] as string[] }
          }
          const obj = { ...s }
          obj.acceptanceCriteria = toArrayOfStrings(obj.acceptanceCriteria)
          return obj
        })
      }
      break
    case 'scope-constraints':
      data.constraints = toArrayOfStrings(data.constraints)
      data.assumptions = toArrayOfStrings(data.assumptions)
      data.dependencies = toArrayOfStrings(data.dependencies)
      break
    case 'user-flows':
      if (Array.isArray(data.flows)) {
        data.flows = data.flows.map((f: any) => ({
          ...f,
          steps: toArrayOfStrings(f?.steps),
        }))
      }
      break
    case 'architecture':
      if (Array.isArray(data.components)) {
        data.components = data.components.map((c: any) =>
          typeof c === 'string' ? { name: removeLabelNoise(c) } : c
        )
      }
      break
    case 'acceptance-criteria':
      if (Array.isArray(data.criteria)) {
        data.criteria = data.criteria.map((c: any) => ({
          feature: typeof c === 'string' ? removeLabelNoise(c) : (c?.feature ?? ''),
          conditions: toArrayOfStrings(c?.conditions),
        }))
      }
      break
    case 'roadmap':
      if (Array.isArray(data.phases)) {
        data.phases = data.phases.map((p: any) => ({
          ...p,
          milestones: toArrayOfStrings(p?.milestones),
          deliverables: toArrayOfStrings(p?.deliverables),
        }))
      }
      break
    case 'database':
      if (Array.isArray(data.tables)) {
        data.tables = data.tables.map((t: any) => ({
          ...t,
          fields: toArrayOfStrings(t?.fields),
        }))
      }
      break
    case 'api-design':
      if (Array.isArray(data.endpoints)) {
        data.endpoints = data.endpoints.map((e: any) =>
          typeof e === 'string' ? { method: 'GET', path: removeLabelNoise(e) } : e
        )
      }
      break
    case 'infrastructure':
      data.services = toArrayOfStrings(data.services)
      data.monitoring = toArrayOfStrings(data.monitoring)
      break
    // Etapa 4
    case 'wireframes':
      if (Array.isArray(data.screens)) {
        data.screens = data.screens.map((s: any) => ({
          ...s,
          elements: toArrayOfStrings(s?.elements),
        }))
      }
      break
    case 'components':
      if (Array.isArray(data.components)) {
        data.components = data.components.map((c: any) => ({
          ...c,
          variants: toArrayOfStrings(c?.variants),
        }))
      }
      break
    case 'accessibility':
      data.guidelines = toArrayOfStrings(data.guidelines)
      data.considerations = toArrayOfStrings(data.considerations)
      break
    // Etapa 5
    case 'tech-stack':
      data.frontend = toArrayOfStrings(data.frontend)
      data.backend = toArrayOfStrings(data.backend)
      data.infrastructure = toArrayOfStrings(data.infrastructure)
      break
    case 'security':
      data.measures = toArrayOfStrings(data.measures)
      data.compliance = toArrayOfStrings(data.compliance)
      break
    // Etapa 6
    case 'sprint-planning':
      if (Array.isArray(data.sprints)) {
        data.sprints = data.sprints.map((s: any) => ({
          ...s,
          goals: toArrayOfStrings(s?.goals),
          stories: toArrayOfStrings(s?.stories),
        }))
      }
      break
    case 'timeline':
    case 'milestones':
      if (Array.isArray(data.milestones)) {
        data.milestones = data.milestones.map((m: any) => ({
          ...m,
          deliverables: toArrayOfStrings(m?.deliverables),
        }))
      }
      break
    case 'resources':
      if (Array.isArray(data.team)) {
        data.team = data.team.map((t: any) => ({
          ...t,
          skills: toArrayOfStrings(t?.skills),
        }))
      }
      data.tools = toArrayOfStrings(data.tools)
      break
    case 'budget':
      if (Array.isArray(data.breakdown)) {
        data.breakdown = data.breakdown.map((b: any) => ({
          ...b,
          items: toArrayOfStrings(b?.items),
        }))
      }
      break
    case 'success-criteria':
      if (Array.isArray(data.criteria)) {
        data.criteria = data.criteria.map((c: any) =>
          typeof c === 'string' ? { metric: removeLabelNoise(c) } : c
        )
      }
      break
    case 'risk-management':
      if (Array.isArray(data.risks)) {
        data.risks = data.risks.map((r: any) =>
          typeof r === 'string' ? { description: removeLabelNoise(r) } : r
        )
      }
      break
    case 'database':
      if (Array.isArray(data.tables)) {
        data.tables = data.tables.map((t: any) => ({
          ...t,
          fields: Array.isArray(t?.fields)
            ? t.fields.map((f: any) =>
                typeof f === 'string' ? { name: f, type: '', constraints: '' } : f
              )
            : [],
        }))
      }
      data.relationships = toArrayOfStrings(data.relationships)
      break
    case 'api-design':
      if (Array.isArray(data.endpoints)) {
        data.endpoints = data.endpoints.map((e: any) =>
          typeof e === 'string'
            ? { method: 'GET', path: removeLabelNoise(e), description: '' }
            : e
        )
      }
      break
    case 'user-flows':
      if (Array.isArray(data.flows)) {
        data.flows = data.flows.map((f: any) => ({
          ...f,
          steps: toArrayOfStrings(f?.steps),
        }))
      }
      break
    case 'launch-plan':
      if (Array.isArray(data.phases)) {
        data.phases = data.phases.map((p: any) => ({
          ...p,
          activities: toArrayOfStrings(p?.activities),
        }))
      }
      break
    default:
      break
  }

  return data
}
