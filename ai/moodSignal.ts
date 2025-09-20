
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

// Removed circular import - will use local analysis instead
// import { analyzeSentiment, extractKeywords } from './nlpEngine';

export interface MoodContext {
  stressLevel?: number;
  [key: string]: unknown;
}

export function parseMoodSignal(input: string, context: MoodContext = {}, persona: string): MoodSignal {

  // Local sentiment analysis
  const sentiment = analyzeSentimentLocal(input);
  const keywords = extractKeywordsLocal(input);
    let tone = 'calm';
    let pacing = 'steady';
    let urgency = 'normal';
    let validation = 'gentle';
  if (sentiment === 'negative' || (context.stressLevel || 0) > 7) {
      tone = 'sad';
    }
    if (sentiment === 'positive' || persona === 'optimist' || keywords.includes('happy')) {
      tone = 'joy';
    }
    if (keywords.includes('angry') || sentiment === 'angry') {
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

// Local analysis functions to avoid circular imports
function analyzeSentimentLocal(input: string): string {
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'joy'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'upset'];

  const lowerInput = input.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerInput.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerInput.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function extractKeywordsLocal(input: string): string[] {
  // Simple keyword extraction - split by spaces and filter common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'];
  return input.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Limit to 10 keywords
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
