// moduleStackVisualizer.ts
// Visualizes active, dormant, and fallback modules
import { getActiveModules } from './RuntimeSwitcher';

export type ModuleState = 'active' | 'dormant' | 'fallback';

export interface ModuleStack {
  name: string;
  state: ModuleState;
  lastChanged: number;
}

export function getModuleStack(): ModuleStack[] {
  const modules = getActiveModules();
  // Render or log the module stack for debugging/UX
  console.log('Active modules:', modules);
  return modules.map(m => ({
    name: m.name,
    state: (m.state === 'active' || m.state === 'dormant' || m.state === 'fallback') ? m.state : 'active',
    lastChanged: m.lastChanged
  }));
}
