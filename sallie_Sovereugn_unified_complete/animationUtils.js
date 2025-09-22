// Migrated and adapted from sallie_1.00/ui/visual/animationUtils.ts
export function fadeIn(element, duration = 400) {
  element.style.opacity = 0;
  element.style.transition = `opacity ${duration}ms`;
  setTimeout(() => { element.style.opacity = 1; }, 10);
}

export function fadeOut(element, duration = 400) {
  element.style.opacity = 1;
  element.style.transition = `opacity ${duration}ms`;
  setTimeout(() => { element.style.opacity = 0; }, 10);
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\visual\animationUtils.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\visual\animationUtils.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\visual\animationUtils.js) --- */
/* Merged master for logical file: ui\visual\animationUtils
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\visual\animationUtils.js (hash:2090AED15580C2664F372220997D8BA71D54F8CC6FC5A63A6969CC56BF41AAEB)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\visual\animationUtils.js (hash:F8AD2B70A4321DF35500B2D640A1EFF959AB7E2F57B2AE7BB2553223BA3A2084)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\visual\animationUtils.js | ext: .js | sha: 2090AED15580C2664F372220997D8BA71D54F8CC6FC5A63A6969CC56BF41AAEB ---- */
[BINARY FILE - original copied to merged_sources: ui\visual\animationUtils.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\visual\animationUtils.js | ext: .js | sha: F8AD2B70A4321DF35500B2D640A1EFF959AB7E2F57B2AE7BB2553223BA3A2084 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\visual\animationUtils.js --- */
// Migrated and adapted from sallie_1.00/ui/visual/animationUtils.ts
export function fadeIn(element, duration = 400) {
  element.style.opacity = 0;
  element.style.transition = `opacity ${duration}ms`;
  setTimeout(() => { element.style.opacity = 1; }, 10);
}
export function fadeOut(element, duration = 400) {
  element.style.opacity = 1;
  setTimeout(() => { element.style.opacity = 0; }, 10);
