/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Accessibility themes and contrast adjustments.
 * Got it, love.
 */

import { generateTheme, type GradientTheme } from './themeGenerator';

export function highContrast(emotion: string = 'calm'): GradientTheme {
  const baseTheme = generateTheme(emotion);
  
  return {
    ...baseTheme,
    background: '#000000',
    surface: '#111111',
    text: '#ffffff',
    textSecondary: '#e0e0e0',
    border: '#444444',
    primary: '#ffffff',
    secondary: '#cccccc',
    accent: '#ffff00', // High contrast yellow
    success: '#00ff00',
    warning: '#ffaa00',
    error: '#ff0000',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #ffff00 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,0,0.2) 100%)',
    shadowColor: '#ffffff40'
  };
}

export function reducedMotion(emotion: string = 'calm'): GradientTheme {
  const baseTheme = generateTheme(emotion);
  
  // Return same theme but with a flag to reduce animations
  return {
    ...baseTheme,
    // Add a special property to indicate reduced motion
    ...{ reducedMotion: true }
  };
}

export function largeText(emotion: string = 'calm'): GradientTheme {
  const baseTheme = generateTheme(emotion);
  
  // Theme optimized for large text/better readability
  return {
    ...baseTheme,
    // Add properties for larger text scaling
    ...{ textScale: 1.25 }
  };
}

export function darkMode(emotion: string = 'calm'): GradientTheme {
  const baseTheme = generateTheme(emotion);
  
  return {
    ...baseTheme,
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#eee6e6',
    textSecondary: '#b8b3b3',
    border: '#0f4c75',
    primary: '#bb86fc',
    secondary: '#03dac6',
    accent: '#cf6679',
    gradient: 'linear-gradient(135deg, #bb86fc 0%, #cf6679 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(187,134,252,0.1) 0%, rgba(207,102,121,0.1) 100%)',
    shadowColor: 'rgba(187,134,252,0.2)'
  };
}