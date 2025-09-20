/*
 * Persona: Tough love meets soul care.
 * Module: themeGenerator
 * Intent: Handle functionality for themeGenerator
 * Provenance-ID: 8780c7e7-e6d7-4a42-9c1e-2b8fe59d82e9
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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

export function generatePatternSVG(options = {}) {
  const { size = 100, colors = ['#6366f1', '#8b5cf6', '#06b6d4'] } = options;
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="${colors[0]}"/>
          <circle cx="10" cy="10" r="8" fill="none" stroke="${colors[1]}" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pattern)"/>
    </svg>
  `;
}

export function generateAvatarSVG(options = {}) {
  const { size = 100, color = '#6366f1', initials = 'S' } = options;
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 5}" fill="${color}" stroke="#4f46e5" stroke-width="3"/>
      <text x="${size/2}" y="${size/2 + 8}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold">${initials}</text>
    </svg>
  `;
}

export function generateEmotionMeterSVG(options = {}) {
  const { size = 100, emotion = 'neutral', intensity = 0.5 } = options;
  const colors = {
    happy: '#10b981',
    sad: '#3b82f6',
    angry: '#ef4444',
    neutral: '#6b7280',
    excited: '#f59e0b'
  };

  const color = colors[emotion] || colors.neutral;
  const radius = (size/2 - 10) * intensity;

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 5}" fill="none" stroke="#e5e7eb" stroke-width="3"/>
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="${color}" opacity="0.7"/>
      <circle cx="${size/2}" cy="${size/2}" r="3" fill="${color}"/>
    </svg>
  `;
}

export function generateWaveformSVG(options = {}) {
  const { width = 200, height = 60, amplitude = 10, frequency = 0.02 } = options;
  let path = `M 0 ${height/2}`;

  for (let x = 0; x <= width; x += 2) {
    const y = height/2 + Math.sin(x * frequency) * amplitude;
    path += ` L ${x} ${y}`;
  }

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="${path}" stroke="#6366f1" stroke-width="2" fill="none"/>
    </svg>
  `;
}
