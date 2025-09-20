export type Tone = 'Empowered' | 'Resonant' | 'Focused' | 'Fallback'

export interface ToneContext {
  taskType?: 'audit' | 'celebration' | 'execution' | 'stabilize'
  recentTrigger?: 'overwhelm' | 'justiceConflict' | 'alignmentSuccess'
  preferred?: Tone
}

const toneWeights: Record<Tone, number> = {
  Empowered: 2,
  Resonant: 3,
  Focused: 3,
  Fallback: 1
}

const taskAffinity: Record<NonNullable<ToneContext['taskType']>, Partial<Record<Tone, number>>> = {
  audit: { Focused: 3, Empowered: 2 },
  celebration: { Resonant: 3, Empowered: 2 },
  execution: { Empowered: 3, Focused: 2 },
  stabilize: { Fallback: 3, Resonant: 2 }
}

const triggerAffinity: Record<NonNullable<ToneContext['recentTrigger']>, Partial<Record<Tone, number>>> = {
  overwhelm: { Fallback: 3, Focused: 2 },
  justiceConflict: { Focused: 3, Empowered: 2 },
  alignmentSuccess: { Resonant: 3, Empowered: 2 }
}

export function scoreTone(tone: Tone, ctx: ToneContext = {}) {
  let score = toneWeights[tone]
  if (ctx.taskType && taskAffinity[ctx.taskType]?.[tone]) score += taskAffinity[ctx.taskType]![tone]!
  if (ctx.recentTrigger && triggerAffinity[ctx.recentTrigger]?.[tone]) score += triggerAffinity[ctx.recentTrigger]![tone]!
  if (ctx.preferred === tone) score += 1
  return score
}

export function suggestTone(ctx: ToneContext = {}): Tone {
  const tones: Tone[] = ['Empowered', 'Resonant', 'Focused', 'Fallback']
  return tones
    .map(t => ({ t, s: scoreTone(t, ctx) }))
    .sort((a, b) => b.s - a.s)[0].t
}

export const toneEngine = { scoreTone, suggestTone }
