export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => typeof v === 'string' && v.trim().length > 0)
  )
}

export function isKpiArray(value: unknown): value is { name: string; target: string }[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (v) =>
        v &&
        typeof v === 'object' &&
        typeof (v as any).name === 'string' &&
        (v as any).name.trim().length > 0 &&
        typeof (v as any).target === 'string' &&
        (v as any).target.trim().length > 0
    )
  )
}

export function isHypothesesArray(
  value: unknown
): value is { label?: string; category?: string; statement?: string; successMetric?: string }[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => typeof v === 'object' && v !== null && ('statement' in (v as any) || 'successMetric' in (v as any)))
  )
}

export function isCompetitorsArray(
  value: unknown
): value is { name: string; strengths?: string[]; weaknesses?: string[]; pricing?: string }[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => typeof v === 'object' && v !== null && typeof (v as any).name === 'string')
  )
}

export function validPersonaArrays(persona: any) {
  return (
    persona &&
    typeof persona === 'object' &&
    isStringArray(persona.goals || []) &&
    isStringArray(persona.frustrations || []) &&
    isStringArray(persona.motivations || [])
  )
}

export function removeLabelNoise(text: string): string {
  if (typeof text !== 'string') return text as any
  let cleaned = text
  // remove label repetitions and JSON bits
  cleaned = cleaned.replace(/\{[^}]*"[^"]*"[^}]*\}/g, '')
  cleaned = cleaned.replace(/^(?:Prim[áa]rio|Secund[áa]rio)\s*:\s*/iu, '')
  cleaned = cleaned.replace(/([\p{L}\p{N}_-]+):\s*\1:\s*\1:/giu, '')
  cleaned = cleaned.replace(/\b([\p{L}\p{N}_-]+)(\s+\1){2,}\b/giu, '$1')
  cleaned = cleaned.replace(/\s{2,}/g, ' ')
  return cleaned.trim()
}

