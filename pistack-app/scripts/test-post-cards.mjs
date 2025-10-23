import fs from 'node:fs'
import path from 'node:path'

function sanitizeValue(value) {
  if (typeof value === 'string') {
    let cleaned = value
    // JSON inline → tenta parse
    const trimmed = cleaned.trim()
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']')) ) {
      try { return JSON.parse(trimmed) } catch {}
    }
    // Remoções de ruído e rótulos
    cleaned = cleaned.replace(/\{[^}]*"[^"]*"[^}]*\}/g, '')
    cleaned = cleaned.replace(/^(?:Prim[áa]rio|Secund[áa]rio)\s*:\s*/iu, '')
    cleaned = cleaned.replace(/([\p{L}\p{N}_-]+):\s*\1:\s*\1:/giu, '')
    cleaned = cleaned.replace(/\b([\p{L}\p{N}_-]+)(\s+\1){2,}\b/giu, '$1')
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
    return cleaned
  }
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = sanitizeValue(v)
    return out
  }
  return value
}

function toArrayOfStrings(value) {
  const result = []
  const pushStr = (s) => {
    const cleaned = String(s)
      .replace(/^[-*•\d]+[).\-\s]*/, '')
      .trim()
    if (cleaned) result.push(cleaned)
  }
  if (!value) return result
  if (typeof value === 'string') {
    const s = value.trim()
    try { if (s.startsWith('[')) { const arr = JSON.parse(s); if (Array.isArray(arr)) arr.forEach(pushStr); return result } } catch {}
    s.split(/\r?\n|;/).forEach((seg) => { const part = seg.trim(); if (!part) return; const pieces = part.split(/:\s+/); pushStr(pieces.length > 1 ? pieces.slice(1).join(': ') : pieces[0]) })
    return result
  }
  if (Array.isArray(value)) { value.forEach((item) => { if (typeof item === 'string') pushStr(item); else if (item && typeof item === 'object') pushStr(item.name || item.value || JSON.stringify(item)) }) ; return result }
  if (typeof value === 'object') { for (const [, v] of Object.entries(value)) pushStr(v) }
  return result
}

function normalizeKpis(value) {
  const list = []
  const pushKpi = (name, target) => {
    const n = String(name || '').trim(); const t = String(target || '').trim(); if (!n) return
    list.push({ name: n, target: t })
  }
  if (!value) return list
  if (typeof value === 'string') {
    const s = value.trim()
    try {
      if (s.startsWith('{')) { const parsed = JSON.parse(s); if (Array.isArray(parsed.kpis)) { parsed.kpis.forEach((i) => pushKpi(i.name || i.metric, i.target || i.value)); return list } }
      if (s.startsWith('[')) { const arr = JSON.parse(s); if (Array.isArray(arr)) { arr.forEach((i) => pushKpi(i.name || i.metric, i.target || i.value)); return list } }
    } catch {}
    s.split(/\r?\n|;/).forEach((seg) => { const [namePart, ...rest] = seg.split(/[:|-]/); pushKpi(namePart, rest.join(':')) })
    return list
  }
  if (Array.isArray(value)) { value.forEach((i) => { if (typeof i === 'string') { const [namePart, ...rest] = i.split(/[:|-]/); pushKpi(namePart, rest.join(':')) } else if (i && typeof i === 'object') { pushKpi(i.name || i.metric, i.target || i.value) } }) ; return list }
  if (typeof value === 'object') { for (const [k, v] of Object.entries(value)) { if (v && typeof v === 'object') pushKpi(v.name || k, v.target || v.value); else pushKpi(k, v) } }
  return list
}

function toList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') {
    try { const arr = JSON.parse(value); return toList(arr) } catch { return value.split(/\r?\n|;/).map((s) => s.trim()).filter(Boolean) }
  }
  if (typeof value === 'object') return toList(value.list ?? value.value)
  return []
}

function normalizeCardArrays(cardType, content) {
  const data = JSON.parse(JSON.stringify(content || {}))
  switch (cardType) {
    case 'problem':
      data.painPoints = toArrayOfStrings(data.painPoints)
      break
    case 'solution':
      data.differentiators = toArrayOfStrings(data.differentiators)
      break
    case 'initial-kpis':
      data.kpis = normalizeKpis(data.kpis ?? data.value)
      break
    case 'validation-hypotheses':
      if (Array.isArray(data.hypotheses)) data.hypotheses = data.hypotheses.map((h) => (typeof h === 'string' ? { statement: h } : h))
      break
    case 'primary-persona':
      if (data.persona) {
        data.persona.goals = toArrayOfStrings(data.persona.goals)
        data.persona.frustrations = toArrayOfStrings(data.persona.frustrations)
        data.persona.behaviors = toArrayOfStrings(data.persona.behaviors)
        data.persona.motivations = toArrayOfStrings(data.persona.motivations)
      }
      break
    case 'value-proposition':
      if (data.proposition && Array.isArray(data.proposition.valuePoints)) {
        data.proposition.valuePoints = data.proposition.valuePoints.map((v) => (typeof v === 'string' ? { text: v } : v))
      }
      break
    case 'benchmarking':
      if (Array.isArray(data.benchmarking)) {
        data.benchmarking = data.benchmarking.map((b) => {
          if (typeof b === 'string') {
            const [name, category] = b.split(':')
            return { name: name.trim(), category: category?.trim() || '' }
          }
          if (b && typeof b === 'object') {
            const obj = { ...b }
            obj.strengths = toArrayOfStrings(obj.strengths)
            obj.weaknesses = toArrayOfStrings(obj.weaknesses)
            obj.notes = toArrayOfStrings(obj.notes)
            return obj
          }
          return b
        })
      }
      break
    case 'acceptance-criteria':
      if (Array.isArray(data.criteria)) {
        data.criteria = data.criteria.map((c) => ({
          feature: typeof c === 'string' ? c : (c?.feature || ''),
          conditions: toList((c && typeof c === 'object') ? (c).conditions : undefined),
        }))
      }
      break
    case 'roadmap':
      if (Array.isArray(data.phases)) {
        data.phases = data.phases.map((p) => ({
          ...p,
          milestones: toList((p && typeof p === 'object') ? (p).milestones : undefined),
          deliverables: toList((p && typeof p === 'object') ? (p).deliverables : undefined),
        }))
      }
      break
  }
  return data
}

function assert(name, condition) { if (!condition) throw new Error(name) }

function run() {
  const fixturesPath = path.resolve(process.cwd(), 'scripts/fixtures/cards-post.json')
  const raw = fs.readFileSync(fixturesPath, 'utf-8')
  const fx = JSON.parse(raw)
  const results = []

  const cases = [
    'problem', 'solution', 'target-audience', 'initial-kpis',
    'validation-hypotheses', 'primary-persona', 'value-proposition', 'benchmarking',
    'acceptance-criteria', 'roadmap',
    'database', 'api-design', 'infrastructure', 'security',
    'timeline', 'resources', 'budget', 'milestones', 'success-criteria', 'launch-plan'
  ]

  for (const type of cases) {
    const input = JSON.parse(JSON.stringify(fx[type].content))
    const sanitized = sanitizeValue(input)
    let content = sanitized

    // special handling target-audience (extract audience string → primary/secondary)
    if (type === 'target-audience') {
      const s = String(content.audience || '')
      const m1 = s.match(/prim[áa]rio:?(.+?)(?:secund[áa]rio|$)/i)
      const m2 = s.match(/secund[áa]rio:?(.+)$/i)
      content = {
        primaryAudience: (m1 ? m1[1] : s).trim(),
        secondaryAudience: (m2 ? m2[1] : '').trim()
      }
    }

    if (type === 'initial-kpis') {
      // preserve original string for JSON parsing inside normalizer
      content.kpis = fx[type].content.kpis
    }
    const normalized = normalizeCardArrays(type, content)

    // Assertions per type
    try {
      switch (type) {
        case 'problem':
          assert('problem.problem string', typeof normalized.problem === 'string')
          assert('problem.painPoints array', Array.isArray(normalized.painPoints) && normalized.painPoints.length >= 2)
          break
        case 'solution':
          assert('solution.solution string', typeof normalized.solution === 'string')
          assert('solution.differentiators array', Array.isArray(normalized.differentiators) && normalized.differentiators.length >= 1)
          break
        case 'target-audience':
          assert('target-audience.primaryAudience', typeof normalized.primaryAudience === 'string')
          assert('target-audience.secondaryAudience string', typeof normalized.secondaryAudience === 'string')
          break
        case 'initial-kpis':
          if (process.env.DEBUG) {
            console.log('DEBUG kpis normalized =', JSON.stringify(normalized, null, 2))
          }
          assert('initial-kpis.kpis', Array.isArray(normalized.kpis) && normalized.kpis.length >= 2 && normalized.kpis.every(k => k.name && 'target' in k))
          break
        case 'validation-hypotheses':
          assert('validation-hypotheses.hypotheses', Array.isArray(normalized.hypotheses) && normalized.hypotheses.length >= 2)
          break
        case 'primary-persona':
          assert('primary-persona.persona', !!normalized.persona)
          assert('primary-persona.goals', Array.isArray(normalized.persona.goals))
          assert('primary-persona.frustrations', Array.isArray(normalized.persona.frustrations))
          break
        case 'value-proposition':
          assert('value-proposition.proposition', !!normalized.proposition)
          assert('value-proposition.valuePoints', Array.isArray(normalized.proposition.valuePoints) && normalized.proposition.valuePoints.length >= 1)
          break
        case 'benchmarking':
          assert('benchmarking list', Array.isArray(normalized.benchmarking) && normalized.benchmarking.length >= 1)
          assert('benchmarking item shape', typeof normalized.benchmarking[0].name === 'string')
          break
        case 'acceptance-criteria':
          if (process.env.DEBUG) console.log('DEBUG acceptance =', JSON.stringify(normalized, null, 2))
          assert('acceptance-criteria.criteria', Array.isArray(normalized.criteria) && normalized.criteria.length >= 1)
          assert('acceptance-criteria.conditions array', Array.isArray(normalized.criteria[0].conditions))
          break
        case 'roadmap':
          if (process.env.DEBUG) console.log('DEBUG roadmap =', JSON.stringify(normalized, null, 2))
          assert('roadmap.phases', Array.isArray(normalized.phases) && normalized.phases.length >= 1)
          assert('roadmap.milestones', Array.isArray(normalized.phases[0].milestones))
          assert('roadmap.deliverables', Array.isArray(normalized.phases[0].deliverables))
          break
        case 'database':
          assert('database.type', typeof normalized.type === 'string')
          assert('database.tables', Array.isArray(normalized.tables) && normalized.tables.length >= 1)
          assert('database.relationships', Array.isArray(normalized.relationships))
          break
        case 'api-design':
          assert('api-design.architecture', typeof normalized.architecture === 'string')
          assert('api-design.endpoints', Array.isArray(normalized.endpoints) && normalized.endpoints.length >= 1)
          break
        case 'infrastructure':
          assert('infrastructure.hosting', typeof normalized.hosting === 'string')
          assert('infrastructure.monitoring', Array.isArray(normalized.monitoring))
          assert('infrastructure.logging', Array.isArray(normalized.logging))
          break
        case 'security':
          assert('security.authentication', typeof normalized.authentication === 'string')
          assert('security.measures', Array.isArray(normalized.measures))
          assert('security.compliance', Array.isArray(normalized.compliance))
          break
        case 'timeline':
          assert('timeline.startDate', typeof normalized.startDate === 'string')
          assert('timeline.milestones', Array.isArray(normalized.milestones))
          break
        case 'resources':
          assert('resources.team', Array.isArray(normalized.team))
          assert('resources.tools', Array.isArray(normalized.tools))
          break
        case 'budget':
          assert('budget.totalBudget', typeof normalized.totalBudget === 'number')
          assert('budget.breakdown', Array.isArray(normalized.breakdown))
          break
        case 'milestones':
          assert('milestones.milestones', Array.isArray(normalized.milestones) && normalized.milestones.length >= 1)
          break
        case 'success-criteria':
          assert('success-criteria.criteria', Array.isArray(normalized.criteria) && normalized.criteria.length >= 1)
          break
        case 'launch-plan':
          assert('launch-plan.launchDate', typeof normalized.launchDate === 'string')
          assert('launch-plan.phases', Array.isArray(normalized.phases))
          break
      }
      results.push({ test: type, pass: true })
    } catch (e) {
      results.push({ test: type, pass: false, error: e.message })
    }
  }

  console.log('\nPOST /api/cards — Smoke (offline)')
  console.log('--------------------------------')
  for (const r of results) console.log(`${r.pass ? '✅' : '❌'} ${r.test}${r.error ? ' — ' + r.error : ''}`)
  const ok = results.every(r => r.pass)
  console.log('\nSummary:', ok ? 'PASS' : 'FAIL')
  process.exit(ok ? 0 : 1)
}

run()
