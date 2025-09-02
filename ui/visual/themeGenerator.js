// Migrated and adapted from sallie_1.00/ui/visual/themeGenerator.ts
export function generateTheme(options) {
  return {
    primary: options.primary || '#6366f1',
    secondary: options.secondary || '#8b5cf6',
    accent: options.accent || '#06b6d4',
    background: options.background || '#0f172a',
    text: options.text || '#f8fafc',
    borderRadius: options.borderRadius || '8px',
    shadow: options.shadow || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  };
}
