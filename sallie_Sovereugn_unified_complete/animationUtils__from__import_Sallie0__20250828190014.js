/*
 * Persona: Tough love meets soul care.
 * Module: animationUtils
 * Intent: Handle functionality for animationUtils
 * Provenance-ID: f87441d6-d410-4b61-a604-f8fffeb7688f
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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
