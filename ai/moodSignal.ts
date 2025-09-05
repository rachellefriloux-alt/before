
// moodSignal.ts
// Real-time emotional signal parsing from phrasing, pacing, and context
// Optional: NLP hooks, memory fallback, override triggers, intent routing

export type MoodSignal = {
  tone: string;
  pacing: string;
  context: string;
  persona: string;
  override?: string;
  urgency?: string;
  validation?: string;
};

import { analyzeSentiment, extractKeywords } from './nlpEngine';

export interface MoodContext {
  stressLevel?: number;
  [key: string]: unknown;
}

export function parseMoodSignal(input: string, context: MoodContext = {}, persona: string): MoodSignal {

  const sentiment = analyzeSentiment(input);
  const keywords = extractKeywords(input);
    let tone = 'calm';
    let pacing = 'steady';
    let urgency = 'normal';
    let validation = 'gentle';
  if (sentiment.valence === 'negative' || (context.stressLevel || 0) > 7) {
      tone = 'sad';
    }
    if (sentiment.valence === 'positive' || persona === 'optimist' || keywords.topics.includes('happy')) {
      tone = 'joy';
    }
    if (keywords.topics.includes('angry') || sentiment.primaryEmotion === 'anger') {
      tone = 'anger';
    }
  if (input.match(/urgent|now|asap/i)) urgency = 'high';
  if (persona === 'Realist') {
    tone = 'direct';
    pacing = 'brisk';
    validation = 'clear';
  }
  return {
    tone,
    pacing,
    context: typeof context === 'string' ? context : 'default',
    persona,
    urgency,
    validation
  };
}

export function triggerOverride(signal: MoodSignal, override: string): MoodSignal {
  return { ...signal, override };
}

export function routeIntent(signal: MoodSignal): string {
  // Precedence: override > urgency > persona (stability)
  if (signal.override) return 'fallbackRoute';
  if (signal.urgency === 'high') return 'priorityQueue';
  if (signal.persona === 'Dreamer') return 'creativeFlow';
  return 'defaultRoute';
}
