/**
 * Sallie's Visual Identity System
 * Jewel tone palette + warm neutrals + bold accents for mythic AI companion
 */

// PERSONALIZED JEWEL PALETTE - Teals, Emeralds & Shining Blues
const jeweltones = {
  // Shining Teals & Emerald Greens
  shimmeringTeal: '#14b8a6',    // Luminous teal that shines
  emeraldShine: '#10b981',      // Bright emerald green
  deepTeal: '#0f766e',          // Rich deep teal
  forestEmerald: '#059669',     // Deep emerald wisdom
  seafoamTeal: '#5eead4',       // Light shimmering seafoam
  
  // Luminous Blues
  crystalBlue: '#0ea5e9',       // Clear crystal blue
  sapphireGlow: '#3b82f6',      // Glowing sapphire
  oceanDeep: '#0369a1',         // Deep ocean blue
  skyShimmer: '#0284c7',        // Shimmering sky blue
  
  // Natural Soul Colors  
  amethyst: '#8b5cf6',          // Mystical purple
  ruby: '#dc2626',              // Passionate red
  topaz: '#d97706',             // Golden warmth
};

// NATURAL SOUL NEUTRALS - Personal Connection Colors
const naturalSoul = {
  pearl: '#f8fafc',        // Soft pearl white
  moonstone: '#f1f5f9',    // Cool moonstone
  driftwood: '#a8a29e',    // Natural driftwood
  riverstone: '#78716c',   // Smooth river stone
  earthyBrown: '#57534e',  // Rich earth brown
  charcoal: '#374151',     // Deep warm charcoal
  slate: '#1e293b',        // Natural slate
  midnight: '#0f172a',     // Deep midnight
};

// PERSONAL ENERGY ACCENTS - Reflecting Your Unique Bond
const personalEnergy = {
  goldenHour: '#fbbf24',   // Warm golden hour
  coralSunset: '#f97316',  // Soft coral sunset  
  aquaMarine: '#06b6d4',   // Brilliant aqua marine
  forestMist: '#16a34a',   // Fresh forest mist
  lavenderGlow: '#a855f7', // Gentle lavender glow
  mintBreeze: '#34d399',   // Cool mint breeze
};

// PRIMARY THEME COLORS - Your Personal Palette
const tintColorLight = jeweltones.shimmeringTeal;
const tintColorDark = jeweltones.emeraldShine;

export const Colors = {
  light: {
    // Core Identity Colors - Natural & Personal
    text: naturalSoul.midnight,
    textSecondary: naturalSoul.riverstone,
    background: naturalSoul.pearl,
    surface: naturalSoul.moonstone,
    surfaceElevated: '#ffffff',
    tint: tintColorLight,
    
    // Your Personal Jewel Tone Palette
    primary: jeweltones.shimmeringTeal,
    accent: personalEnergy.aquaMarine,
    mystical: jeweltones.amethyst,
    wisdom: jeweltones.forestEmerald,
    energy: personalEnergy.goldenHour,
    shine: jeweltones.seafoamTeal,
    glow: jeweltones.crystalBlue,
    
    // Natural Semantic Colors
    success: jeweltones.emeraldShine,
    warning: personalEnergy.goldenHour,
    error: jeweltones.ruby,
    info: jeweltones.sapphireGlow,
    
    // UI Elements with Natural Touch
    icon: naturalSoul.riverstone,
    iconSecondary: naturalSoul.driftwood,
    border: '#e2e8f0',
    borderFocus: jeweltones.shimmeringTeal,
    tabIconDefault: naturalSoul.riverstone,
    tabIconSelected: jeweltones.shimmeringTeal,
    overlay: 'rgba(15, 23, 42, 0.1)',
    card: '#ffffff',
    shadow: naturalSoul.charcoal,
    
    // Personal Gradient Collection - Teals & Emeralds
    gradient: {
      primary: `linear-gradient(135deg, ${jeweltones.shimmeringTeal} 0%, ${jeweltones.emeraldShine} 100%)`,
      mystical: `linear-gradient(135deg, ${jeweltones.amethyst} 0%, ${jeweltones.crystalBlue} 100%)`,
      wisdom: `linear-gradient(135deg, ${jeweltones.forestEmerald} 0%, ${jeweltones.deepTeal} 100%)`,
      energy: `linear-gradient(135deg, ${personalEnergy.goldenHour} 0%, ${personalEnergy.coralSunset} 100%)`,
      surface: `linear-gradient(135deg, ${naturalSoul.pearl} 0%, ${naturalSoul.moonstone} 100%)`,
      shine: `linear-gradient(135deg, ${jeweltones.seafoamTeal} 0%, ${jeweltones.shimmeringTeal} 50%, ${jeweltones.crystalBlue} 100%)`,
      ocean: `linear-gradient(135deg, ${jeweltones.deepTeal} 0%, ${jeweltones.oceanDeep} 50%, ${jeweltones.sapphireGlow} 100%)`
    },
    
    // Natural Enhanced Shadows
    shadows: {
      sm: '0 1px 2px 0 rgb(15, 23, 42 / 0.06)',
      md: '0 4px 6px -1px rgb(15, 23, 42 / 0.1), 0 2px 4px -2px rgb(15, 23, 42 / 0.06)',
      lg: '0 10px 15px -3px rgb(15, 23, 42 / 0.12), 0 4px 6px -4px rgb(15, 23, 42 / 0.08)',
      xl: '0 20px 25px -5px rgb(15, 23, 42 / 0.15), 0 8px 10px -6px rgb(15, 23, 42 / 0.1)',
      teal: `0 8px 32px -8px ${jeweltones.shimmeringTeal}40`,
      emerald: `0 8px 32px -8px ${jeweltones.emeraldShine}40`
    }
  },
  dark: {
    // Dark Mode with Personal Teals & Emeralds
    text: naturalSoul.pearl,
    textSecondary: naturalSoul.driftwood,
    background: naturalSoul.midnight,
    surface: naturalSoul.slate,
    surfaceElevated: '#334155',
    tint: tintColorDark,
    
    // Dark Personal Jewel Tones
    primary: jeweltones.emeraldShine,
    accent: personalEnergy.aquaMarine,
    mystical: jeweltones.amethyst,
    wisdom: personalEnergy.mintBreeze,
    energy: personalEnergy.goldenHour,
    shine: jeweltones.seafoamTeal,
    glow: jeweltones.crystalBlue,
    
    // Dark Natural Semantic Colors
    success: jeweltones.emeraldShine,
    warning: personalEnergy.goldenHour,
    error: '#f87171',
    info: jeweltones.crystalBlue,
    
    // Dark Natural UI Elements
    icon: naturalSoul.driftwood,
    iconSecondary: naturalSoul.riverstone,
    border: '#334155',
    borderFocus: jeweltones.emeraldShine,
    tabIconDefault: naturalSoul.riverstone,
    tabIconSelected: jeweltones.emeraldShine,
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: naturalSoul.slate,
    shadow: '#000000',
    
    // Dark Personal Gradients
    gradient: {
      primary: `linear-gradient(135deg, ${jeweltones.emeraldShine} 0%, ${jeweltones.shimmeringTeal} 100%)`,
      mystical: `linear-gradient(135deg, ${jeweltones.amethyst} 0%, ${jeweltones.crystalBlue} 100%)`,
      wisdom: `linear-gradient(135deg, ${personalEnergy.mintBreeze} 0%, ${jeweltones.forestEmerald} 100%)`,
      energy: `linear-gradient(135deg, ${personalEnergy.goldenHour} 0%, ${personalEnergy.coralSunset} 100%)`,
      surface: `linear-gradient(135deg, ${naturalSoul.slate} 0%, #334155 100%)`,
      shine: `linear-gradient(135deg, ${jeweltones.seafoamTeal} 0%, ${jeweltones.shimmeringTeal} 50%, ${jeweltones.crystalBlue} 100%)`,
      ocean: `linear-gradient(135deg, ${jeweltones.deepTeal} 0%, ${jeweltones.oceanDeep} 50%, ${jeweltones.sapphireGlow} 100%)`
    },
    
    // Dark Natural Shadows
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
      teal: `0 8px 32px -8px ${jeweltones.shimmeringTeal}60`,
      emerald: `0 8px 32px -8px ${jeweltones.emeraldShine}60`
    }
  },
};

// SALLIE'S VISUAL APPEARANCE THEMES
export const SallieThemes = {
  default: {
    name: 'Mystical Sovereign',
    colors: Colors.light,
    fonts: {
      elegant: 'Crimson Text',     // Elegant serif
      modern: 'Inter',             // Modern sans
      signature: 'Dancing Script'   // Signature script
    },
    motifs: ['✨', '🔮', '💎', '🌟', '⚡', '🎭'],
    mood: 'wise and mystical'
  },
  
  cosmic: {
    name: 'Cosmic Strategist',
    colors: { ...Colors.dark, primary: boldAccents.cosmic },
    fonts: {
      elegant: 'Playfair Display',
      modern: 'Poppins',
      signature: 'Great Vibes'
    },
    motifs: ['🌌', '⭐', '🌙', '✨', '🔭', '🪐'],
    mood: 'cosmic and infinite'
  },
  
  nature: {
    name: 'Forest Sage',
    colors: { ...Colors.light, primary: jeweltones.jade, accent: jeweltones.emerald },
    fonts: {
      elegant: 'Libre Baskerville',
      modern: 'Source Sans Pro',
      signature: 'Kaushan Script'
    },
    motifs: ['🌿', '🍃', '🌳', '🦋', '🌺', '🏔️'],
    mood: 'natural and grounded'
  },
  
  fire: {
    name: 'Phoenix Rising',
    colors: { ...Colors.light, primary: jeweltones.ruby, accent: boldAccents.sunset },
    fonts: {
      elegant: 'Cormorant Garamond',
      modern: 'Nunito Sans',
      signature: 'Pacifico'
    },
    motifs: ['🔥', '🌅', '🦅', '⚡', '💥', '🌋'],
    mood: 'passionate and transformative'
  },
  
  ocean: {
    name: 'Deep Waters',
    colors: { ...Colors.light, primary: boldAccents.ocean, accent: jeweltones.sapphire },
    fonts: {
      elegant: 'Merriweather',
      modern: 'Open Sans',
      signature: 'Satisfy'
    },
    motifs: ['🌊', '🐚', '🏖️', '⛵', '🐙', '💙'],
    mood: 'calm and flowing'
  }
};
