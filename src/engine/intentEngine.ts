import type { Tone } from './toneEngine'

export interface Intent {
  goal: string
  scope: string
  requiresConsent?: boolean
  tone?: Tone
}

export interface IntentCheck {
  ok: boolean
  confirmations: string[]
  risks: string[]
  recommendedTone: Tone
}

export function verifyIntent(i: Intent, context: { recentTrigger?: string } = {}): IntentCheck {
  const confirmations: string[] = []
  const risks: string[] = []

  if (!i.goal?.trim()) risks.push('Missing goal')
  if (!i.scope?.trim()) risks.push('Missing scope')

  if (i.requiresConsent) confirmations.push('Obtain explicit consent')
  confirmations.push('Verify tone alignment')
  confirmations.push('Confirm scope boundaries')

  let recommendedTone: Tone = 'Empowered'
  if (context.recentTrigger === 'overwhelm') recommendedTone = 'Fallback'
  else if (i.goal.toLowerCase().includes('audit')) recommendedTone = 'Focused'
  else if (i.goal.toLowerCase().includes('celebrate')) recommendedTone = 'Resonant'

  return {
    ok: risks.length === 0,
    confirmations,
    risks,
    recommendedTone
  }
}

export const intentEngine = { verifyIntent }
