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
