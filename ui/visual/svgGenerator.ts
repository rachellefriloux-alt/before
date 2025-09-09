/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced SVG generation for avatars, patterns, and visual elements.
 * Got it, love.
 */

import { sanitizeSvg } from './sanitize';

interface SVGOptions {
  width?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
  animated?: boolean;
}

export function generateAvatarSVG(seed: number = 42, primaryColor: string = '#8b5cf6'): string {
  // Enhanced to work with new avatar system
  const colors = [
    primaryColor,
    adjustColorBrightness(primaryColor, 20),
    adjustColorBrightness(primaryColor, -20),
    adjustColorBrightness(primaryColor, 40),
    adjustColorBrightness(primaryColor, -40)
  ];
  
  // Generate deterministic patterns based on seed
  const rng = createSeededRandom(seed);
  const eyeType = Math.floor(rng() * 3); // Expanded eye types
  const hairType = Math.floor(rng() * 4); // Added hair variations
  const faceVariation = rng() > 0.5;
  
  let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="faceGrad" cx="50%" cy="40%">
        <stop offset="0%" stop-color="${colors[0]}" />
        <stop offset="70%" stop-color="${colors[1]}" />
        <stop offset="100%" stop-color="${colors[2]}" />
      </radialGradient>
      <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors[3]}" />
        <stop offset="100%" stop-color="${colors[4]}" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="softShadow">
        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <!-- Hair background -->
    ${generateSimpleHair(hairType, colors)}
    
    <!-- Face -->
    <circle cx="50" cy="45" r="${faceVariation ? 38 : 35}" 
            fill="url(#faceGrad)" filter="url(#softShadow)" />
    
    <!-- Eyes -->`;
  
  if (eyeType === 0) {
    svg += `<circle cx="42" cy="40" r="3" fill="${colors[2]}" />
            <circle cx="58" cy="40" r="3" fill="${colors[2]}" />
            <circle cx="43" cy="38" r="1" fill="white" opacity="0.8"/>
            <circle cx="59" cy="38" r="1" fill="white" opacity="0.8"/>`;
  } else if (eyeType === 1) {
    svg += `<ellipse cx="42" cy="40" rx="4" ry="3" fill="${colors[2]}" />
            <ellipse cx="58" cy="40" rx="4" ry="3" fill="${colors[2]}" />
            <ellipse cx="43" cy="38" rx="2" ry="1.5" fill="white" opacity="0.9"/>
            <ellipse cx="59" cy="38" rx="2" ry="1.5" fill="white" opacity="0.9"/>`;
  } else {
    svg += `<path d="M39 40 L45 40" stroke="${colors[2]}" stroke-width="2" stroke-linecap="round" />
            <path d="M55 40 L61 40" stroke="${colors[2]}" stroke-width="2" stroke-linecap="round" />`;
  }
  
  // Mouth
  svg += `<path d="M45 55 Q50 60 55 55" stroke="${colors[2]}" stroke-width="2" fill="none" />`;
  
  // Personality sparkles
  svg += `<circle cx="25" cy="25" r="1.5" fill="${primaryColor}" opacity="0.7">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="75" cy="30" r="1" fill="${primaryColor}" opacity="0.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>`;
  
  // Mouth
  svg += `<path d="M 45 55 Q 50 60 55 55" stroke="${colors[1]}" stroke-width="2" fill="none" stroke-linecap="round" />`;
  
  svg += `</svg>`;
  
  return sanitizeSvg(svg);
}

// Helper function for simple hair generation
function generateSimpleHair(hairType: number, colors: string[]): string {
  switch (hairType) {
    case 1:
      return `<ellipse cx="50" cy="30" rx="40" ry="25" fill="url(#hairGrad)" />`;
    case 2:
      return `<path d="M 50 20 Q 20 15 15 40 Q 15 60 25 65 Q 50 70 75 65 Q 85 60 85 40 Q 80 15 50 20" 
              fill="url(#hairGrad)" />`;
    case 3:
      return `<circle cx="35" cy="35" r="15" fill="${colors[3]}" />
              <circle cx="50" cy="25" r="18" fill="${colors[3]}" />
              <circle cx="65" cy="35" r="15" fill="${colors[3]}" />`;
    default:
      return `<path d="M 50 25 Q 25 20 20 45 Q 18 65 30 70 Q 50 75 70 70 Q 82 65 80 45 Q 75 20 50 25" 
              fill="url(#hairGrad)" />`;
  }
}

export function generatePatternSVG(options: SVGOptions = {}): string {
  const { width = 400, height = 300, color = '#8b5cf6', animated = true } = options;
  const secondaryColor = options.secondaryColor || adjustColorBrightness(color, 30);
  
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.1"/>
      </pattern>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.1" />
        <stop offset="50%" stop-color="${secondaryColor}" stop-opacity="0.2" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.1" />
      </linearGradient>
      ${animated ? `<animateTransform id="wave-anim" attributeName="transform" type="translate" values="0,0;10,5;0,0" dur="4s" repeatCount="indefinite" />` : ''}
    </defs>
    
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    <!-- Flowing waves -->
    <path d="M0,150 Q100,100 200,150 T400,150 L400,300 L0,300 Z" fill="url(#waveGrad)">
      ${animated ? '<animateTransform attributeName="transform" type="translate" values="0,0;20,10;0,0" dur="6s" repeatCount="indefinite" />' : ''}
    </path>
    
    <path d="M0,200 Q150,160 300,200 T600,200 L400,300 L0,300 Z" fill="${color}" opacity="0.05">
      ${animated ? '<animateTransform attributeName="transform" type="translate" values="0,0;-15,8;0,0" dur="8s" repeatCount="indefinite" />' : ''}
    </path>
    
    <!-- Decorative elements -->
    <circle cx="320" cy="80" r="2" fill="${color}" opacity="0.6">
      ${animated ? '<animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />' : ''}
    </circle>
    <circle cx="80" cy="60" r="1.5" fill="${secondaryColor}" opacity="0.8">
      ${animated ? '<animate attributeName="opacity" values="0.8;0.4;0.8" dur="3s" repeatCount="indefinite" />' : ''}
    </circle>
  </svg>`;
  
  return sanitizeSvg(svg);
}

export function generateGeometricSVG(type: 'hexagon' | 'triangle' | 'circle' = 'hexagon', options: SVGOptions = {}): string {
  const { width = 100, height = 100, color = '#8b5cf6', animated = false } = options;
  
  let shape = '';
  switch (type) {
    case 'hexagon':
      shape = `<polygon points="50,5 90,25 90,65 50,85 10,65 10,25" fill="${color}" opacity="0.8" />`;
      break;
    case 'triangle':
      shape = `<polygon points="50,10 90,80 10,80" fill="${color}" opacity="0.8" />`;
      break;
    case 'circle':
      shape = `<circle cx="50" cy="50" r="35" fill="${color}" opacity="0.8" />`;
      break;
  }
  
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="subtle-glow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    ${shape.replace('/>', ' filter="url(#subtle-glow)" />')}
    
    ${animated ? `<animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="20s" repeatCount="indefinite" />` : ''}
  </svg>`;
  
  return sanitizeSvg(svg);
}

// Utility functions
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}