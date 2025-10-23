import fs from 'node:fs'
import path from 'node:path'

// Local lightweight sanitization (kept in JS to avoid ts-node)
function sanitizeValue(value) {
  if (typeof value === 'string') {
    let cleaned = value
    try {
      const trimmed = cleaned.trim()
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed)
      }
    } catch {}

    cleaned = cleaned.replace(/\{[^}]*"[^"]*"[^}]*\}/g, '')
    cleaned = cleaned.replace(/^(?:Prim[áa]rio|Secund[áa]rio)\s*:\s*/iu, '')
    cleaned = cleaned.replace(/([\p{L}\p{N}_-]+):\s*\1:\s*\1:/giu, '')
    cleaned = cleaned.replace(/\b([\p{L}\p{N}_-]+)(\s+\1){2,}\b/giu, '$1')
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
    return cleaned
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

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
    try {
      // Attempt JSON array
      if (s.startsWith('[') && s.endsWith(']')) {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) arr.forEach(pushStr)
        return result
      }
    } catch {}

    s.split(/\r?\n|;/).forEach((seg) => {
      const part = seg.trim()
      if (!part) return
      // Split "name: value" keeping the value as list entry
      const pieces = part.split(/:\s+/)
      pushStr(pieces.length > 1 ? pieces.slice(1).join(': ') : pieces[0])
    })
    return result
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (typeof item === 'string') pushStr(item)
      else if (item && typeof item === 'object') pushStr(item.name || item.value || JSON.stringify(item))
    })
    return result
  }

  if (typeof value === 'object') {
    for (const [, v] of Object.entries(value)) pushStr(v)
  }
  return result
}

function normalizeKpis(value) {
  const list = []
  const pushKpi = (name, target) => {
    const n = String(name || '').trim()
    const t = String(target || '').trim()
    if (!n) return
    list.push({ name: n, target: t })
  }

  if (!value) return list

  if (typeof value === 'string') {
    const s = value.trim()
    try {
      if (s.startsWith('{')) {
        const parsed = JSON.parse(s)
        if (Array.isArray(parsed.kpis)) {
          parsed.kpis.forEach((i) => pushKpi(i.name || i.metric, i.target || i.value))
          return list
        }
      }
      if (s.startsWith('[')) {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) arr.forEach((i) => pushKpi(i.name || i.metric, i.target || i.value))
        return list
      }
    } catch {}

    s.split(/\r?\n|;/).forEach((seg) => {
      const [namePart, ...rest] = seg.split(/[:|-]/)
      pushKpi(namePart, rest.join(':'))
    })
    return list
  }

  if (Array.isArray(value)) {
    value.forEach((i) => {
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
    for (const [k, v] of Object.entries(value)) {
      if (v && typeof v === 'object') pushKpi(v.name || k, v.target || v.value)
      else pushKpi(k, v)
    }
  }
  return list
}

function assert(name, condition) {
  if (!condition) throw new Error(name)
}

function run() {
  const fixturesPath = path.resolve(process.cwd(), 'scripts/fixtures/arrays.json')
  const raw = fs.readFileSync(fixturesPath, 'utf-8')
  const fx = JSON.parse(raw)

  const results = []

  // Problem: painPoints -> array de strings
  const painPoints = toArrayOfStrings(sanitizeValue(fx['problem'].painPoints))
  results.push({ test: 'problem.painPoints array', pass: Array.isArray(painPoints) && painPoints.length >= 2 })

  // Solution: differentiators -> array de strings
  const differentiators = toArrayOfStrings(sanitizeValue(fx['solution'].differentiators))
  results.push({ test: 'solution.differentiators array', pass: Array.isArray(differentiators) && differentiators.length >= 2 })

  // Initial KPIs: kpis -> array de objetos {name,target}
  // Não sanitizar antes para preservar JSON embutido e permitir parse
  const kpis = normalizeKpis(fx['initial-kpis'].kpis)
  results.push({ test: 'initial-kpis.kpis array', pass: Array.isArray(kpis) && kpis.length >= 2 && kpis.every((k) => k.name && 'target' in k) })

  // Validation Hypotheses: hypotheses -> array (aceita mix, sanitiza strings)
  const hypotheses = Array.isArray(fx['validation-hypotheses'].hypotheses)
    ? fx['validation-hypotheses'].hypotheses.map((h) => (typeof h === 'string' ? { statement: sanitizeValue(h) } : sanitizeValue(h)))
    : []
  results.push({ test: 'validation-hypotheses.hypotheses array', pass: Array.isArray(hypotheses) && hypotheses.length >= 2 })

  // Primary Persona: goals/frustrations/motivations -> arrays
  const persona = sanitizeValue(fx['primary-persona'])
  const goals = toArrayOfStrings(persona.goals)
  const frustrations = toArrayOfStrings(persona.frustrations)
  const motivations = toArrayOfStrings(persona.motivations)
  results.push({ test: 'primary-persona.goals array', pass: goals.length >= 1 })
  results.push({ test: 'primary-persona.frustrations array', pass: frustrations.length >= 1 })
  results.push({ test: 'primary-persona.motivations array', pass: motivations.length >= 1 })

  // Benchmarking: competitors -> array de objetos
  const competitorsSrc = fx['benchmarking'].competitors
  let competitors = []
  if (Array.isArray(competitorsSrc)) {
    competitors = competitorsSrc.map((c) => {
      if (typeof c === 'string') {
        const [name, ...rest] = c.split(':')
        return { name: name.trim(), pricing: rest.join(':').trim() }
      }
      return sanitizeValue(c)
    })
  }
  results.push({ test: 'benchmarking.competitors array', pass: Array.isArray(competitors) && competitors.length >= 1 && typeof competitors[0].name === 'string' })

  // Stage 3–6 checks (parameterized by type)
  // essential-features
  const features = Array.isArray(fx['essential-features']?.features)
    ? fx['essential-features'].features.map((f) => (typeof f === 'string' ? { name: f.trim() } : f))
    : []
  results.push({ test: 'essential-features.features array', pass: features.length >= 1 })

  // user-flows
  const flows = Array.isArray(fx['user-flows']?.flows)
    ? fx['user-flows'].flows.map((f) => ({ ...f, steps: toArrayOfStrings(f.steps) }))
    : []
  results.push({ test: 'user-flows.flows array', pass: flows.length >= 1 && Array.isArray(flows[0].steps) && flows[0].steps.length >= 2 })

  // architecture
  const arch = Array.isArray(fx['architecture']?.components)
    ? fx['architecture'].components.map((c) => (typeof c === 'string' ? { name: c } : c))
    : []
  results.push({ test: 'architecture.components array', pass: arch.length >= 1 })

  // database
  const db = Array.isArray(fx['database']?.tables)
    ? fx['database'].tables.map((t) => ({ ...t, fields: toArrayOfStrings(t.fields) }))
    : []
  results.push({ test: 'database.tables[].fields array', pass: db.length >= 1 && Array.isArray(db[0].fields) && db[0].fields.length >= 2 })

  // api-design
  const endpoints = Array.isArray(fx['api-design']?.endpoints)
    ? fx['api-design'].endpoints.map((e) => (typeof e === 'string' ? { method: 'GET', path: e.replace(/^GET\s+/, '').trim() } : e))
    : []
  results.push({ test: 'api-design.endpoints array', pass: endpoints.length >= 1 && typeof endpoints[0].path === 'string' })

  // infrastructure
  const inf = fx['infrastructure'] || {}
  const services = toArrayOfStrings(inf.services)
  const monitoring = toArrayOfStrings(inf.monitoring)
  results.push({ test: 'infrastructure.services array', pass: services.length >= 1 })
  results.push({ test: 'infrastructure.monitoring array', pass: monitoring.length >= 1 })

  // security
  const security = fx['security'] || {}
  const measures = toArrayOfStrings(security.measures)
  const compliance = toArrayOfStrings(security.compliance)
  results.push({ test: 'security.measures array', pass: measures.length >= 1 })
  results.push({ test: 'security.compliance array', pass: compliance.length >= 1 })

  // timeline
  const timeline = Array.isArray(fx['timeline']?.milestones)
    ? fx['timeline'].milestones.map((m) => ({ ...m, deliverables: toArrayOfStrings(m.deliverables) }))
    : []
  results.push({ test: 'timeline.milestones array', pass: timeline.length >= 1 })
  results.push({ test: 'timeline.milestones[].deliverables array', pass: timeline.length > 0 && Array.isArray(timeline[0].deliverables) })

  // resources
  const resources = Array.isArray(fx['resources']?.team)
    ? fx['resources'].team.map((t) => ({ ...t, skills: toArrayOfStrings(t.skills) }))
    : []
  const tools = toArrayOfStrings(fx['resources']?.tools)
  results.push({ test: 'resources.team array', pass: resources.length >= 1 })
  results.push({ test: 'resources.team[].skills array', pass: resources.length > 0 && Array.isArray(resources[0].skills) })
  results.push({ test: 'resources.tools array', pass: tools.length >= 1 })

  // budget
  const budget = Array.isArray(fx['budget']?.breakdown)
    ? fx['budget'].breakdown.map((b) => (typeof b === 'string' ? { category: b } : b))
    : []
  results.push({ test: 'budget.breakdown array', pass: budget.length >= 1 })

  // milestones
  const milestones = Array.isArray(fx['milestones']?.milestones)
    ? fx['milestones'].milestones.map((m) => (typeof m === 'string' ? { title: m } : m))
    : []
  results.push({ test: 'milestones.milestones array', pass: milestones.length >= 1 })

  // success-criteria
  const criteria = Array.isArray(fx['success-criteria']?.criteria)
    ? fx['success-criteria'].criteria.map((c) => (typeof c === 'string' ? { metric: c } : c))
    : []
  results.push({ test: 'success-criteria.criteria array', pass: criteria.length >= 1 })

  // launch-plan
  const launchPlan = Array.isArray(fx['launch-plan']?.phases)
    ? fx['launch-plan'].phases.map((p) => ({ ...p, activities: toArrayOfStrings(p.activities) }))
    : []
  results.push({ test: 'launch-plan.phases array', pass: launchPlan.length >= 1 })
  results.push({ test: 'launch-plan.phases[].activities array', pass: launchPlan.length > 0 && Array.isArray(launchPlan[0].activities) })

  // Print report
  const ok = results.every((r) => r.pass)
  console.log('\nArray Validation Report')
  console.log('-----------------------')
  for (const r of results) {
    console.log(`${r.pass ? '✅' : '❌'} ${r.test}`)
  }
  console.log('\nSummary:', ok ? 'PASS' : 'FAIL')
  process.exit(ok ? 0 : 1)
}

run()
