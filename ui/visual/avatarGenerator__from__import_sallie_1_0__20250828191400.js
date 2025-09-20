/*
 * Persona: Tough love meets soul care.
 * Module: avatarGenerator
 * Intent: Handle functionality for avatarGenerator
 * Provenance-ID: 35907f67-dd78-4520-be52-47cd8c671b88
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Migrated and adapted from sallie_1.00/ui/visual/avatarGenerator.ts
export function generateAvatar(seed) {
  // Simple avatar generator using initials and color
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const color = colors[seed.length % colors.length];
  const initials = seed.split(' ').map(w => w[0]).join('').toUpperCase();
  return `<svg width='40' height='40'><circle cx='20' cy='20' r='18' fill='${color}'/><text x='50%' y='55%' text-anchor='middle' fill='#fff' font-size='18' font-family='Arial' dy='.3em'>${initials}</text></svg>`;
}
