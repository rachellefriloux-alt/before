/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced theme generation with mood-based palettes and gradients.
 * Got it, love.
 */

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface GradientTheme extends ThemeColors {
  gradient: string;
  cardGradient: string;
  shadowColor: string;
  name?: string;
}

const emotionColorMap: Record<string, Partial<ThemeColors>> = {
  calm: {
    primary: '#6366f1',
    accent: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff'
  },
  focused: {
    primary: '#0ea5e9',
    accent: '#06b6d4',
    background: '#f0f9ff',
    surface: '#e0f2fe'
  },
  energetic: {
    primary: '#f59e0b',
    accent: '#f97316',
    background: '#fffbeb',
    surface: '#fef3c7'
  },
  supportive: {
    primary: '#10b981',
    accent: '#059669',
    background: '#f0fdf4',
    surface: '#dcfce7'
  },
  protective: {
    primary: '#dc2626',
    accent: '#b91c1c',
    background: '#fef2f2',
    surface: '#fecaca'
  }
};

const presetThemes: Record<string, GradientTheme> = {
  'grace-grind': {
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#d946ef',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(217,70,239,0.1) 100%)',
    shadowColor: 'rgba(139,92,246,0.2)'
  },
  'southern-grit': {
    primary: '#92400e',
    secondary: '#b45309',
    accent: '#ea580c',
    background: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)',
    surface: '#fffbeb',
    text: '#451a03',
    textSecondary: '#92400e',
    border: '#fed7aa',
    success: '#166534',
    warning: '#a16207',
    error: '#dc2626',
    gradient: 'linear-gradient(135deg, #92400e 0%, #ea580c 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(146,64,14,0.1) 0%, rgba(234,88,12,0.1) 100%)',
    shadowColor: 'rgba(146,64,14,0.2)'
  },
  'midnight-hustle': {
    primary: '#1e40af',
    secondary: '#1e293b',
    accent: '#3b82f6',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(30,64,175,0.2) 0%, rgba(59,130,246,0.2) 100%)',
    shadowColor: 'rgba(59,130,246,0.3)'
  }
};

export function generateTheme(emotion: string = 'calm', preset?: string): GradientTheme {
  if (preset && presetThemes[preset]) {
    return presetThemes[preset];
  }

  const baseColors = emotionColorMap[emotion] || emotionColorMap.calm;
  
  return {
    primary: baseColors.primary || '#6366f1',
    secondary: '#64748b',
    accent: baseColors.accent || '#8b5cf6',
    background: baseColors.background || '#f8fafc',
    surface: baseColors.surface || '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: `linear-gradient(135deg, ${baseColors.primary || '#6366f1'} 0%, ${baseColors.accent || '#8b5cf6'} 100%)`,
    cardGradient: `linear-gradient(135deg, ${baseColors.primary || '#6366f1'}20 0%, ${baseColors.accent || '#8b5cf6'}20 100%)`,
    shadowColor: `${baseColors.primary || '#6366f1'}30`
  };
}

export function generateAccessibleTheme(emotion: string = 'calm'): GradientTheme {
  const theme = generateTheme(emotion);
  
  // Ensure high contrast for accessibility
  return {
    ...theme,
    text: '#0f172a',
    textSecondary: '#374151',
    border: '#9ca3af',
    background: '#ffffff',
    surface: '#f9fafb'
  };
}

export function getThemePresets(): string[] {
  return Object.keys(presetThemes);
}

export function applyThemeToDocument(theme: GradientTheme): void {
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--sallie-${key}`, value);
  });

  // Apply special properties
  if (theme.gradient) {
    document.body.style.background = theme.gradient;
  }

  // Apply card gradients to all card elements
  const cards = document.querySelectorAll('.sallie-card');
  cards.forEach(card => {
    if (card instanceof HTMLElement) {
      card.style.background = theme.cardGradient || '';
    }
  });
  
  // Apply text color
  document.body.style.color = theme.text;
  
  // Apply surface color to appropriate containers
  const surfaces = document.querySelectorAll('.sallie-surface');
  surfaces.forEach(surface => {
    if (surface instanceof HTMLElement) {
      surface.style.backgroundColor = theme.surface;
      surface.style.color = theme.text;
    }
  });
  
  // Add theme info as a data attribute on body
  document.body.dataset.sallieTheme = JSON.stringify({
    timestamp: Date.now(),
    themeName: theme.name || 'custom',
    isDark: isDarkTheme(theme)
  });
  
  // Add CSS custom properties for animations and shadows
  root.style.setProperty('--sallie-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
  root.style.setProperty('--sallie-shadow-elevated', `0 10px 15px -3px ${theme.shadowColor}, 0 4px 6px -2px ${theme.shadowColor}`);
}

// Helper function to determine if a theme is dark
function isDarkTheme(theme: GradientTheme): boolean {
  // Convert hex to RGB and check luminance
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calculate relative luminance (perceived brightness)
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0.5;
    
    // Using the formula for relative luminance from WCAG 2.0
    const { r, g, b } = rgb;
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const backgroundLuminance = getLuminance(theme.background);
  return backgroundLuminance < 0.5;
}