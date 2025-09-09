/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced open-source avatar generation with user choice.
 * Got it, love.
 */

import { sanitizeSvg } from './sanitize';

export interface AvatarOptions {
  style?: 'geometric' | 'abstract' | 'portrait' | 'minimal' | 'artistic';
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  hairStyle?: number; // 0-9 different hair styles
  eyeStyle?: number;  // 0-4 different eye styles  
  faceShape?: number; // 0-3 different face shapes
  accessories?: ('glasses' | 'earrings' | 'necklace')[];
  mood?: 'confident' | 'calm' | 'focused' | 'creative' | 'determined';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  animated?: boolean;
  seed?: number;
}

export interface VisualPreference {
  id: string;
  name: string;
  description: string;
  preview: string; // SVG string for preview
  options: AvatarOptions;
}

/**
 * Generate a sophisticated avatar SVG based on user preferences and Sallie's personality
 */
export function generateAdvancedAvatar(options: AvatarOptions = {}): string {
  const {
    style = 'portrait',
    primaryColor = '#8b5cf6',
    secondaryColor = '#f59e0b',
    accentColor = '#ec4899',
    hairStyle = 0,
    eyeStyle = 0,
    faceShape = 0,
    accessories = [],
    mood = 'confident',
    season = 'summer',
    animated = false,
    seed = 42
  } = options;

  const rng = createSeededRandom(seed);
  const colors = generateColorPalette(primaryColor, secondaryColor, accentColor, season);
  
  let svg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    ${generateAvatarDefs(colors, animated)}
    ${generateBackground(colors, season, style)}
    ${generateFace(faceShape, colors, mood)}
    ${generateEyes(eyeStyle, colors, mood, animated)}
    ${generateHair(hairStyle, colors, season)}
    ${generateAccessories(accessories, colors)}
    ${animated ? generateAnimationElements() : ''}
  </svg>`;

  return sanitizeSvg(svg);
}

/**
 * Create a set of avatar presets that Sallie can choose from
 */
export function createAvatarPresets(): VisualPreference[] {
  const presets: VisualPreference[] = [
    {
      id: 'grace-and-grind',
      name: 'Grace & Grind',
      description: 'Professional with a touch of elegance',
      preview: generateAdvancedAvatar({
        style: 'portrait',
        primaryColor: '#8b5cf6',
        secondaryColor: '#f59e0b',
        hairStyle: 2,
        eyeStyle: 1,
        accessories: ['earrings'],
        mood: 'confident'
      }),
      options: {
        style: 'portrait',
        primaryColor: '#8b5cf6',
        secondaryColor: '#f59e0b',
        hairStyle: 2,
        eyeStyle: 1,
        accessories: ['earrings'],
        mood: 'confident'
      }
    },
    {
      id: 'southern-grit',
      name: 'Southern Grit',
      description: 'Warm, strong, and authentic',
      preview: generateAdvancedAvatar({
        style: 'artistic',
        primaryColor: '#d97706',
        secondaryColor: '#92400e',
        hairStyle: 4,
        eyeStyle: 2,
        accessories: [],
        mood: 'determined'
      }),
      options: {
        style: 'artistic',
        primaryColor: '#d97706',
        secondaryColor: '#92400e',
        hairStyle: 4,
        eyeStyle: 2,
        accessories: [],
        mood: 'determined'
      }
    },
    {
      id: 'midnight-hustle',
      name: 'Midnight Hustle',
      description: 'Sleek and mysterious for late-night productivity',
      preview: generateAdvancedAvatar({
        style: 'minimal',
        primaryColor: '#1f2937',
        secondaryColor: '#6366f1',
        accentColor: '#ec4899',
        hairStyle: 1,
        eyeStyle: 3,
        accessories: ['glasses'],
        mood: 'focused'
      }),
      options: {
        style: 'minimal',
        primaryColor: '#1f2937',
        secondaryColor: '#6366f1',
        accentColor: '#ec4899',
        hairStyle: 1,
        eyeStyle: 3,
        accessories: ['glasses'],
        mood: 'focused'
      }
    },
    {
      id: 'soul-care',
      name: 'Soul Care',
      description: 'Nurturing and peaceful energy',
      preview: generateAdvancedAvatar({
        style: 'abstract',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        accentColor: '#f472b6',
        hairStyle: 6,
        eyeStyle: 0,
        accessories: ['necklace'],
        mood: 'calm'
      }),
      options: {
        style: 'abstract',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        accentColor: '#f472b6',
        hairStyle: 6,
        eyeStyle: 0,
        accessories: ['necklace'],
        mood: 'calm'
      }
    },
    {
      id: 'creative-visionary',
      name: 'Creative Visionary',
      description: 'Artistic and innovative spirit',
      preview: generateAdvancedAvatar({
        style: 'geometric',
        primaryColor: '#7c3aed',
        secondaryColor: '#fbbf24',
        accentColor: '#ef4444',
        hairStyle: 8,
        eyeStyle: 4,
        accessories: ['earrings', 'glasses'],
        mood: 'creative',
        animated: true
      }),
      options: {
        style: 'geometric',
        primaryColor: '#7c3aed',
        secondaryColor: '#fbbf24',
        accentColor: '#ef4444',
        hairStyle: 8,
        eyeStyle: 4,
        accessories: ['earrings', 'glasses'],
        mood: 'creative',
        animated: true
      }
    }
  ];

  return presets;
}

/**
 * Generate avatar definitions (gradients, filters, patterns)
 */
function generateAvatarDefs(colors: string[], animated: boolean): string {
  return `
    <defs>
      <radialGradient id="faceGradient" cx="50%" cy="40%">
        <stop offset="0%" stop-color="${colors[0]}" />
        <stop offset="70%" stop-color="${colors[1]}" />
        <stop offset="100%" stop-color="${colors[2]}" />
      </radialGradient>
      
      <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors[3]}" />
        <stop offset="50%" stop-color="${colors[4]}" />
        <stop offset="100%" stop-color="${colors[5]}" />
      </linearGradient>
      
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.3"/>
      </filter>
      
      ${animated ? `
        <animate id="pulseAnimation" attributeName="opacity" 
                 values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
        <animateTransform id="floatAnimation" attributeName="transform" 
                         type="translate" values="0,0;0,-2;0,0" 
                         dur="4s" repeatCount="indefinite"/>
      ` : ''}
      
      <!-- Pattern definitions for different styles -->
      <pattern id="texturePattern" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="${colors[0]}" opacity="0.1"/>
        <circle cx="2" cy="2" r="1" fill="${colors[1]}" opacity="0.3"/>
      </pattern>
    </defs>
  `;
}

/**
 * Generate background based on season and style
 */
function generateBackground(colors: string[], season: string, style: string): string {
  const seasonalElements = getSeasonalElements(season, colors);
  
  switch (style) {
    case 'geometric':
      return `
        <rect width="200" height="200" fill="url(#faceGradient)" opacity="0.1"/>
        <polygon points="0,0 200,50 200,200 0,150" fill="${colors[1]}" opacity="0.2"/>
        ${seasonalElements}
      `;
    case 'abstract':
      return `
        <circle cx="100" cy="100" r="90" fill="url(#faceGradient)" opacity="0.15"/>
        <ellipse cx="150" cy="60" rx="40" ry="20" fill="${colors[2]}" opacity="0.3"/>
        ${seasonalElements}
      `;
    default:
      return `
        <circle cx="100" cy="100" r="95" fill="${colors[0]}" opacity="0.05"/>
        ${seasonalElements}
      `;
  }
}

/**
 * Generate seasonal background elements
 */
function getSeasonalElements(season: string, colors: string[]): string {
  switch (season) {
    case 'spring':
      return `
        <circle cx="30" cy="30" r="3" fill="${colors[4]}" opacity="0.6"/>
        <circle cx="170" cy="40" r="2" fill="${colors[5]}" opacity="0.8"/>
        <circle cx="180" cy="160" r="4" fill="${colors[4]}" opacity="0.5"/>
      `;
    case 'summer':
      return `
        <circle cx="100" cy="100" r="80" fill="none" stroke="${colors[3]}" stroke-width="1" opacity="0.3"/>
        <path d="M 160 40 L 165 45 L 160 50 L 155 45 Z" fill="${colors[4]}" opacity="0.7"/>
      `;
    case 'autumn':
      return `
        <path d="M 20 180 Q 30 170 40 180 T 60 180" fill="none" stroke="${colors[5]}" stroke-width="2" opacity="0.4"/>
        <circle cx="170" cy="30" r="5" fill="${colors[3]}" opacity="0.6"/>
      `;
    case 'winter':
      return `
        <polygon points="50,20 55,30 45,30" fill="${colors[2]}" opacity="0.5"/>
        <polygon points="160,40 165,50 155,50" fill="${colors[2]}" opacity="0.5"/>
        <polygon points="30,160 35,170 25,170" fill="${colors[2]}" opacity="0.5"/>
      `;
    default:
      return '';
  }
}

/**
 * Generate face shape based on selection
 */
function generateFace(faceShape: number, colors: string[], mood: string): string {
  const moodAdjustment = getMoodAdjustment(mood);
  
  switch (faceShape) {
    case 1: // Oval
      return `
        <ellipse cx="100" cy="110" rx="45" ry="55" 
                 fill="url(#faceGradient)" filter="url(#softShadow)" 
                 transform="${moodAdjustment.transform}"/>
      `;
    case 2: // Square
      return `
        <rect x="60" y="65" width="80" height="90" rx="20" 
              fill="url(#faceGradient)" filter="url(#softShadow)"
              transform="${moodAdjustment.transform}"/>
      `;
    case 3: // Heart
      return `
        <path d="M 100 65 Q 75 45 55 65 Q 55 85 100 120 Q 145 85 145 65 Q 125 45 100 65 Z"
              fill="url(#faceGradient)" filter="url(#softShadow)"
              transform="${moodAdjustment.transform}"/>
      `;
    default: // Round
      return `
        <circle cx="100" cy="110" r="50" 
                fill="url(#faceGradient)" filter="url(#softShadow)"
                transform="${moodAdjustment.transform}"/>
      `;
  }
}

/**
 * Generate eyes based on style and mood
 */
function generateEyes(eyeStyle: number, colors: string[], mood: string, animated: boolean): string {
  const moodAdjustment = getMoodAdjustment(mood);
  const eyeColor = colors[6] || colors[2];
  const animationAttr = animated ? 'filter="url(#glow)"' : '';
  
  switch (eyeStyle) {
    case 1: // Almond shaped
      return `
        <ellipse cx="85" cy="95" rx="8" ry="6" fill="${eyeColor}" ${animationAttr}/>
        <ellipse cx="115" cy="95" rx="8" ry="6" fill="${eyeColor}" ${animationAttr}/>
        <ellipse cx="87" cy="93" rx="3" ry="3" fill="white" opacity="0.8"/>
        <ellipse cx="117" cy="93" rx="3" ry="3" fill="white" opacity="0.8"/>
      `;
    case 2: // Wide
      return `
        <ellipse cx="85" cy="95" rx="12" ry="5" fill="${eyeColor}" ${animationAttr}/>
        <ellipse cx="115" cy="95" rx="12" ry="5" fill="${eyeColor}" ${animationAttr}/>
        <circle cx="85" cy="93" r="3" fill="white" opacity="0.9"/>
        <circle cx="115" cy="93" r="3" fill="white" opacity="0.9"/>
      `;
    case 3: // Focused/Intense
      return `
        <polygon points="75,90 95,85 95,100 75,105" fill="${eyeColor}" ${animationAttr}/>
        <polygon points="105,85 125,90 125,105 105,100" fill="${eyeColor}" ${animationAttr}/>
        <circle cx="85" cy="95" r="2" fill="white" opacity="0.9"/>
        <circle cx="115" cy="95" r="2" fill="white" opacity="0.9"/>
      `;
    case 4: // Artistic/Creative
      return `
        <path d="M 75 95 Q 85 85 95 95 Q 85 105 75 95" fill="${eyeColor}" ${animationAttr}/>
        <path d="M 105 95 Q 115 85 125 95 Q 115 105 105 95" fill="${eyeColor}" ${animationAttr}/>
        <circle cx="85" cy="95" r="2" fill="white" opacity="0.8"/>
        <circle cx="115" cy="95" r="2" fill="white" opacity="0.8"/>
      `;
    default: // Round
      return `
        <circle cx="85" cy="95" r="8" fill="${eyeColor}" ${animationAttr}/>
        <circle cx="115" cy="95" r="8" fill="${eyeColor}" ${animationAttr}/>
        <circle cx="85" cy="93" r="3" fill="white" opacity="0.9"/>
        <circle cx="115" cy="93" r="3" fill="white" opacity="0.9"/>
      `;
  }
}

/**
 * Generate hair styles
 */
function generateHair(hairStyle: number, colors: string[], season: string): string {
  const hairColor = colors[3];
  const highlightColor = colors[4];
  
  switch (hairStyle) {
    case 1: // Short pixie
      return `
        <path d="M 100 50 Q 60 30 55 60 Q 50 90 75 85 Q 100 80 125 85 Q 150 90 145 60 Q 140 30 100 50"
              fill="url(#hairGradient)" filter="url(#softShadow)"/>
      `;
    case 2: // Professional bob
      return `
        <path d="M 100 45 Q 50 25 45 65 Q 40 100 70 110 Q 100 115 130 110 Q 160 100 155 65 Q 150 25 100 45"
              fill="url(#hairGradient)" filter="url(#softShadow)"/>
        <ellipse cx="75" cy="75" rx="15" ry="8" fill="${highlightColor}" opacity="0.3"/>
      `;
    case 3: // Curly
      return `
        <circle cx="70" cy="60" r="15" fill="${hairColor}"/>
        <circle cx="100" cy="50" r="18" fill="${hairColor}"/>
        <circle cx="130" cy="60" r="15" fill="${hairColor}"/>
        <circle cx="85" cy="75" r="12" fill="${hairColor}"/>
        <circle cx="115" cy="75" r="12" fill="${hairColor}"/>
        <circle cx="100" cy="40" r="12" fill="${highlightColor}" opacity="0.7"/>
      `;
    case 4: // Braided
      return `
        <path d="M 100 45 Q 60 35 55 70 L 60 110 Q 100 120 140 110 L 145 70 Q 140 35 100 45"
              fill="url(#hairGradient)" filter="url(#softShadow)"/>
        <path d="M 80 60 Q 100 65 120 60" stroke="${highlightColor}" stroke-width="2" fill="none"/>
        <path d="M 82 75 Q 100 80 118 75" stroke="${highlightColor}" stroke-width="2" fill="none"/>
      `;
    case 5: // Long waves
      return `
        <path d="M 100 40 Q 45 30 40 70 Q 35 120 50 140 Q 80 150 100 145 Q 120 150 150 140 Q 165 120 160 70 Q 155 30 100 40"
              fill="url(#hairGradient)" filter="url(#softShadow)"/>
        <path d="M 60 80 Q 70 85 80 80 Q 90 75 100 80" stroke="${highlightColor}" stroke-width="1" fill="none" opacity="0.7"/>
      `;
    case 6: // Afro
      return `
        <circle cx="100" cy="60" r="40" fill="${hairColor}"/>
        <circle cx="80" cy="50" r="25" fill="${hairColor}"/>
        <circle cx="120" cy="50" r="25" fill="${hairColor}"/>
        <circle cx="70" cy="70" r="20" fill="${hairColor}"/>
        <circle cx="130" cy="70" r="20" fill="${hairColor}"/>
        <circle cx="100" cy="45" r="15" fill="${highlightColor}" opacity="0.4"/>
      `;
    case 7: // Updo
      return `
        <ellipse cx="100" cy="40" rx="30" ry="20" fill="${hairColor}"/>
        <path d="M 85 55 Q 100 45 115 55 Q 100 60 85 55" fill="${hairColor}"/>
        <circle cx="100" cy="40" r="8" fill="${highlightColor}" opacity="0.5"/>
      `;
    case 8: // Edgy/Modern
      return `
        <path d="M 100 45 Q 70 25 60 55 L 65 85 Q 85 90 100 85 Q 115 90 135 85 L 140 55 Q 130 25 100 45"
              fill="url(#hairGradient)" filter="url(#softShadow)"/>
        <polygon points="95,50 105,45 110,55 95,60" fill="${highlightColor}" opacity="0.8"/>
      `;
    default: // Classic
      return `
        <path d="M 100 50 Q 55 35 50 70 Q 45 105 75 115 Q 100 120 125 115 Q 155 105 150 70 Q 145 35 100 50"
              fill="url(#hairGradient)" filter="url(#softShadow)"/>
      `;
  }
}

/**
 * Generate accessories
 */
function generateAccessories(accessories: string[], colors: string[]): string {
  let accessoryElements = '';
  
  if (accessories.includes('glasses')) {
    accessoryElements += `
      <ellipse cx="85" cy="95" rx="15" ry="10" fill="none" stroke="${colors[2]}" stroke-width="2" opacity="0.8"/>
      <ellipse cx="115" cy="95" rx="15" ry="10" fill="none" stroke="${colors[2]}" stroke-width="2" opacity="0.8"/>
      <line x1="100" y1="95" x2="105" y2="95" stroke="${colors[2]}" stroke-width="2"/>
    `;
  }
  
  if (accessories.includes('earrings')) {
    accessoryElements += `
      <circle cx="65" cy="105" r="4" fill="${colors[5]}" filter="url(#glow)"/>
      <circle cx="135" cy="105" r="4" fill="${colors[5]}" filter="url(#glow)"/>
    `;
  }
  
  if (accessories.includes('necklace')) {
    accessoryElements += `
      <ellipse cx="100" cy="160" rx="25" ry="5" fill="none" stroke="${colors[4]}" stroke-width="2" opacity="0.7"/>
      <circle cx="100" cy="155" r="3" fill="${colors[5]}"/>
    `;
  }
  
  return accessoryElements;
}

/**
 * Generate animation elements for animated avatars
 */
function generateAnimationElements(): string {
  return `
    <g>
      <animateTransform attributeName="transform" type="rotate" 
                       values="0 100 100;1 100 100;0 100 100" 
                       dur="6s" repeatCount="indefinite"/>
    </g>
  `;
}

/**
 * Generate mood-based adjustments
 */
function getMoodAdjustment(mood: string): { transform: string; filter?: string } {
  switch (mood) {
    case 'confident':
      return { transform: 'scale(1.02) rotate(0.5deg)' };
    case 'calm':
      return { transform: 'scale(0.98) rotate(-0.3deg)' };
    case 'focused':
      return { transform: 'scale(1.01) rotate(0.2deg)' };
    case 'creative':
      return { transform: 'scale(1.03) rotate(1deg)' };
    case 'determined':
      return { transform: 'scale(1.04) rotate(0.8deg)' };
    default:
      return { transform: 'scale(1)' };
  }
}

/**
 * Generate a cohesive color palette based on primary colors and season
 */
function generateColorPalette(primary: string, secondary: string, accent: string, season: string): string[] {
  const baseColors = [primary, secondary, accent];
  
  // Generate complementary colors based on season
  const seasonalAdjustments = getSeasonalColorAdjustments(season);
  
  return [
    ...baseColors,
    adjustColorBrightness(primary, seasonalAdjustments.brightness),
    adjustColorBrightness(secondary, seasonalAdjustments.saturation),
    adjustColorBrightness(accent, seasonalAdjustments.warmth),
    blendColors(primary, secondary),
    blendColors(secondary, accent)
  ];
}

/**
 * Get seasonal color adjustments
 */
function getSeasonalColorAdjustments(season: string) {
  switch (season) {
    case 'spring':
      return { brightness: 20, saturation: 15, warmth: 10 };
    case 'summer':
      return { brightness: 25, saturation: 20, warmth: 5 };
    case 'autumn':
      return { brightness: -10, saturation: 10, warmth: 25 };
    case 'winter':
      return { brightness: -15, saturation: 5, warmth: -20 };
    default:
      return { brightness: 0, saturation: 0, warmth: 0 };
  }
}

/**
 * Utility functions
 */
function adjustColorBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function blendColors(color1: string, color2: string): string {
  const c1 = parseInt(color1.replace('#', ''), 16);
  const c2 = parseInt(color2.replace('#', ''), 16);
  
  const r = Math.floor(((c1 >> 16) + (c2 >> 16)) / 2);
  const g = Math.floor(((c1 >> 8 & 0x00FF) + (c2 >> 8 & 0x00FF)) / 2);
  const b = Math.floor(((c1 & 0x0000FF) + (c2 & 0x0000FF)) / 2);
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function createSeededRandom(seed: number): () => number {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

export default {
  generateAdvancedAvatar,
  createAvatarPresets,
  adjustColorBrightness,
  blendColors
};