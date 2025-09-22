// intentRouter.ts
// Routes requests based on emotional urgency, strategic priority, or persona mode

export type IntentRoute = 'priorityQueue' | 'creativeFlow' | 'defaultRoute' | 'fallbackRoute';

export interface IntentSignal {
  urgency?: string;
  persona?: string;
  override?: boolean;
}

export function routeIntent(signal: IntentSignal): IntentRoute {
  // Precedence: override > urgency > persona
  if (signal.override) return 'fallbackRoute';
  if (signal.urgency === 'high') return 'priorityQueue';
  if (signal.persona === 'Dreamer') return 'creativeFlow';
  return 'defaultRoute';
}
