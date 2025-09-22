// Migrated and adapted from sallie_1.00/ui/visual/avatarGenerator.ts
export function generateAvatar(seed) {
  // Simple avatar generator using initials and color
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const color = colors[seed.length % colors.length];
  const initials = seed.split(' ').map(w => w[0]).join('').toUpperCase();
  return `<svg width='40' height='40'><circle cx='20' cy='20' r='18' fill='${color}'/><text x='50%' y='55%' text-anchor='middle' fill='#fff' font-size='18' font-family='Arial' dy='.3em'>${initials}</text></svg>`;
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\visual\avatarGenerator.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\visual\avatarGenerator.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\visual\avatarGenerator.js) --- */
/* Merged master for logical file: ui\visual\avatarGenerator
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\visual\avatarGenerator.js (hash:843087B5307470477788E5D8C2EF08821DB2926E1F494F1EE3E2C6FB53F8F3E5)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\visual\avatarGenerator.js (hash:9A2978E7CDC6CBE5CFB30123B38819A509E4AF4646CD4478C979374579FA7DC5)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\visual\avatarGenerator.js | ext: .js | sha: 843087B5307470477788E5D8C2EF08821DB2926E1F494F1EE3E2C6FB53F8F3E5 ---- */
[BINARY FILE - original copied to merged_sources: ui\visual\avatarGenerator.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\visual\avatarGenerator.js | ext: .js | sha: 9A2978E7CDC6CBE5CFB30123B38819A509E4AF4646CD4478C979374579FA7DC5 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\visual\avatarGenerator.js --- */
// Migrated and adapted from sallie_1.00/ui/visual/avatarGenerator.ts
export function generateAvatar(seed) {
  // Simple avatar generator using initials and color
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const color = colors[seed.length % colors.length];
  const initials = seed.split(' ').map(w => w[0]).join('').toUpperCase();
  return `<svg width='40' height='40'><circle cx='20' cy='20' r='18' fill='${color}'/><text x='50%' y='55%' text-anchor='middle' fill='#fff' font-size='18' font-family='Arial' dy='.3em'>${initials}</text></svg>`;
}
