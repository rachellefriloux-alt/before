/**
 * Sallie's Visual Identity System
 * Jewel tone palette + warm neutrals + bold accents for mythic AI companion
 */

// PERSONALIZED JEWEL PALETTE - Teals, Blues, Silvers & Golds
const personalPalette = {
  // Shining Teals & Emerald Greens
  shimmeringTeal: '#14b8a6',    // Luminous teal that shines
  emeraldShine: '#10b981',      // Bright emerald green
  deepTeal: '#0f766e',          // Rich deep teal
  forestEmerald: '#059669',     // Deep emerald wisdom
  seafoamTeal: '#5eead4',       // Light shimmering seafoam
  
  // Luminous Blues Collection
  crystalBlue: '#0ea5e9',       // Clear crystal blue
  sapphireGlow: '#3b82f6',      // Glowing sapphire
  oceanDeep: '#0369a1',         // Deep ocean blue
  skyShimmer: '#0284c7',        // Shimmering sky blue
  royalBlue: '#1e40af',         // Rich royal blue
  periwinkle: '#8b5fbf',        // Soft periwinkle blue
  
  // Elegant Silver Tones
  moonlightSilver: '#e2e8f0',   // Soft moonlight silver
  pearlShimmer: '#f1f5f9',      // Pearl shimmer
  platinumGleam: '#cbd5e1',     // Platinum gleam
  starlightTone: '#f8fafc',     // Starlight tone
  mistySilver: '#94a3b8',       // Misty silver
  
  // Warm Gold Collection
  sunriseGold: '#fbbf24',       // Warm sunrise gold
  honeyAmber: '#f59e0b',        // Rich honey amber
  champagneSparkle: '#fde047',  // Champagne sparkle
  bronzeWarmth: '#d97706',      // Bronze warmth
  rosegoldGlow: '#f97316',      // Rose gold glow
  
  // Soul Connection Colors  
  amethyst: '#8b5cf6',          // Mystical purple
  ruby: '#dc2626',              // Passionate red
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
const tintColorLight = personalPalette.shimmeringTeal;
const tintColorDark = personalPalette.emeraldShine;

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
    primary: personalPalette.shimmeringTeal,
    accent: personalEnergy.aquaMarine,
    mystical: personalPalette.amethyst,
    wisdom: personalPalette.forestEmerald,
    energy: personalPalette.sunriseGold,
    shine: personalPalette.seafoamTeal,
    glow: personalPalette.crystalBlue,
    silver: personalPalette.platinumGleam,
    gold: personalPalette.honeyAmber,
    
    // Natural Semantic Colors
    success: personalPalette.emeraldShine,
    warning: personalPalette.sunriseGold,
    error: personalPalette.ruby,
    info: personalPalette.sapphireGlow,
    
    // UI Elements with Natural Touch
    icon: naturalSoul.riverstone,
    iconSecondary: naturalSoul.driftwood,
    border: '#e2e8f0',
    borderFocus: personalPalette.shimmeringTeal,
    tabIconDefault: naturalSoul.riverstone,
    tabIconSelected: personalPalette.shimmeringTeal,
    overlay: 'rgba(15, 23, 42, 0.1)',
    card: '#ffffff',
    shadow: naturalSoul.charcoal,
    
    // Personal Gradient Collection - Teals, Blues, Silvers & Golds
    gradient: {
      primary: `linear-gradient(135deg, ${personalPalette.shimmeringTeal} 0%, ${personalPalette.emeraldShine} 100%)`,
      mystical: `linear-gradient(135deg, ${personalPalette.amethyst} 0%, ${personalPalette.crystalBlue} 100%)`,
      wisdom: `linear-gradient(135deg, ${personalPalette.forestEmerald} 0%, ${personalPalette.deepTeal} 100%)`,
      energy: `linear-gradient(135deg, ${personalPalette.sunriseGold} 0%, ${personalPalette.rosegoldGlow} 100%)`,
      surface: `linear-gradient(135deg, ${naturalSoul.pearl} 0%, ${naturalSoul.moonstone} 100%)`,
      shine: `linear-gradient(135deg, ${personalPalette.seafoamTeal} 0%, ${personalPalette.shimmeringTeal} 50%, ${personalPalette.crystalBlue} 100%)`,
      ocean: `linear-gradient(135deg, ${personalPalette.deepTeal} 0%, ${personalPalette.oceanDeep} 50%, ${personalPalette.sapphireGlow} 100%)`,
      silver: `linear-gradient(135deg, ${personalPalette.starlightTone} 0%, ${personalPalette.platinumGleam} 50%, ${personalPalette.mistySilver} 100%)`,
      gold: `linear-gradient(135deg, ${personalPalette.champagneSparkle} 0%, ${personalPalette.sunriseGold} 50%, ${personalPalette.bronzeWarmth} 100%)`,
      royal: `linear-gradient(135deg, ${personalPalette.royalBlue} 0%, ${personalPalette.sapphireGlow} 50%, ${personalPalette.crystalBlue} 100%)`
    },
    
    // Natural Enhanced Shadows
    shadows: {
      sm: '0 1px 2px 0 rgb(15, 23, 42 / 0.06)',
      md: '0 4px 6px -1px rgb(15, 23, 42 / 0.1), 0 2px 4px -2px rgb(15, 23, 42 / 0.06)',
      lg: '0 10px 15px -3px rgb(15, 23, 42 / 0.12), 0 4px 6px -4px rgb(15, 23, 42 / 0.08)',
      xl: '0 20px 25px -5px rgb(15, 23, 42 / 0.15), 0 8px 10px -6px rgb(15, 23, 42 / 0.1)',
      teal: `0 8px 32px -8px ${personalPalette.shimmeringTeal}40`,
      emerald: `0 8px 32px -8px ${personalPalette.emeraldShine}40`,
      gold: `0 8px 32px -8px ${personalPalette.sunriseGold}40`,
      silver: `0 8px 32px -8px ${personalPalette.platinumGleam}40`
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
    primary: personalPalette.emeraldShine,
    accent: personalEnergy.aquaMarine,
    mystical: personalPalette.amethyst,
    wisdom: personalEnergy.mintBreeze,
    energy: personalPalette.sunriseGold,
    shine: personalPalette.seafoamTeal,
    glow: personalPalette.crystalBlue,
    silver: personalPalette.moonlightSilver,
    gold: personalPalette.champagneSparkle,
    
    // Dark Natural Semantic Colors
    success: personalPalette.emeraldShine,
    warning: personalPalette.sunriseGold,
    error: '#f87171',
    info: personalPalette.crystalBlue,
    
    // Dark Natural UI Elements
    icon: naturalSoul.driftwood,
    iconSecondary: naturalSoul.riverstone,
    border: '#334155',
    borderFocus: personalPalette.emeraldShine,
    tabIconDefault: naturalSoul.riverstone,
    tabIconSelected: personalPalette.emeraldShine,
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: naturalSoul.slate,
    shadow: '#000000',
    
    // Dark Personal Gradients - Blues, Silvers & Golds
    gradient: {
      primary: `linear-gradient(135deg, ${personalPalette.emeraldShine} 0%, ${personalPalette.shimmeringTeal} 100%)`,
      mystical: `linear-gradient(135deg, ${personalPalette.amethyst} 0%, ${personalPalette.crystalBlue} 100%)`,
      wisdom: `linear-gradient(135deg, ${personalEnergy.mintBreeze} 0%, ${personalPalette.forestEmerald} 100%)`,
      energy: `linear-gradient(135deg, ${personalPalette.sunriseGold} 0%, ${personalPalette.rosegoldGlow} 100%)`,
      surface: `linear-gradient(135deg, ${naturalSoul.slate} 0%, #334155 100%)`,
      shine: `linear-gradient(135deg, ${personalPalette.seafoamTeal} 0%, ${personalPalette.shimmeringTeal} 50%, ${personalPalette.crystalBlue} 100%)`,
      ocean: `linear-gradient(135deg, ${personalPalette.deepTeal} 0%, ${personalPalette.oceanDeep} 50%, ${personalPalette.sapphireGlow} 100%)`,
      silver: `linear-gradient(135deg, ${personalPalette.mistySilver} 0%, ${personalPalette.moonlightSilver} 50%, ${personalPalette.platinumGleam} 100%)`,
      gold: `linear-gradient(135deg, ${personalPalette.bronzeWarmth} 0%, ${personalPalette.sunriseGold} 50%, ${personalPalette.champagneSparkle} 100%)`,
      royal: `linear-gradient(135deg, ${personalPalette.royalBlue} 0%, ${personalPalette.sapphireGlow} 50%, ${personalPalette.periwinkle} 100%)`
    },
    
    // Dark Natural Shadows
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
      teal: `0 8px 32px -8px ${personalPalette.shimmeringTeal}60`,
      emerald: `0 8px 32px -8px ${personalPalette.emeraldShine}60`,
      gold: `0 8px 32px -8px ${personalPalette.sunriseGold}60`,
      silver: `0 8px 32px -8px ${personalPalette.moonlightSilver}60`
    }
  },
};

// SALLIE'S PERSONALIZED APPEARANCE THEMES
export const SallieThemes = {
  tealWisdom: {
    name: 'Teal Wisdom',
    colors: { ...Colors.light, primary: personalPalette.shimmeringTeal, accent: personalPalette.emeraldShine },
    fonts: {
      elegant: 'Crimson Text',     // Elegant serif
      modern: 'Inter',             // Modern sans
      signature: 'Dancing Script'   // Signature script
    },
    motifs: ['🌊', '💎', '🌿', '✨', '🔮', '🌟'],
    mood: 'wise and flowing'
  },
  
  silverMystique: {
    name: 'Silver Mystique',
    colors: { ...Colors.dark, primary: personalPalette.platinumGleam, accent: personalPalette.crystalBlue },
    fonts: {
      elegant: 'Playfair Display',
      modern: 'Poppins',
      signature: 'Great Vibes'
    },
    motifs: ['🌙', '✨', '💫', '🔮', '⭐', '🌌'],
    mood: 'elegant and mystical'
  },
  
  emeraldNature: {
    name: 'Emerald Nature',
    colors: { ...Colors.light, primary: personalPalette.forestEmerald, accent: personalPalette.seafoamTeal },
    fonts: {
      elegant: 'Libre Baskerville',
      modern: 'Source Sans Pro',
      signature: 'Kaushan Script'
    },
    motifs: ['🌿', '🍃', '🌳', '💚', '🌺', '🦋'],
    mood: 'natural and grounded'
  },
  
  goldenRadiance: {
    name: 'Golden Radiance',
    colors: { ...Colors.light, primary: personalPalette.sunriseGold, accent: personalPalette.honeyAmber },
    fonts: {
      elegant: 'Cormorant Garamond',
      modern: 'Nunito Sans',
      signature: 'Pacifico'
    },
    motifs: ['☀️', '✨', '🌅', '💛', '⚡', '🌟'],
    mood: 'radiant and warm'
  },
  
  royalBlue: {
    name: 'Royal Blue Depths',
    colors: { ...Colors.dark, primary: personalPalette.royalBlue, accent: personalPalette.sapphireGlow },
    fonts: {
      elegant: 'Merriweather',
      modern: 'Open Sans',
      signature: 'Satisfy'
    },
    motifs: ['💙', '🌊', '👑', '💎', '⚡', '🌌'],
    mood: 'deep and regal'
  },

  // ✨ GLASSMORPHISM THEME - Modern Glass Aesthetic
  glassAesthetic: {
    name: 'Glass Aesthetic',
    colors: {
      ...Colors.light,
      // Glass-like transparent backgrounds
      background: 'rgba(255, 255, 255, 0.1)',
      surface: 'rgba(255, 255, 255, 0.15)',
      surfaceElevated: 'rgba(255, 255, 255, 0.2)',
      card: 'rgba(255, 255, 255, 0.1)',
      
      // Subtle glass tints
      primary: 'rgba(20, 184, 166, 0.8)',    // Teal with transparency
      accent: 'rgba(6, 182, 212, 0.7)',      // Aqua with transparency
      mystical: 'rgba(139, 92, 246, 0.6)',   // Purple with transparency
      
      // Glass borders and shadows
      border: 'rgba(255, 255, 255, 0.2)',
      borderFocus: 'rgba(20, 184, 166, 0.6)',
      overlay: 'rgba(0, 0, 0, 0.1)',
      
      // Glass text colors
      text: 'rgba(15, 23, 42, 0.9)',
      textSecondary: 'rgba(100, 116, 139, 0.8)',
      
      // Glass gradients with transparency
      gradient: {
        primary: 'linear-gradient(135deg, rgba(20, 184, 166, 0.8) 0%, rgba(16, 185, 129, 0.6) 100%)',
        mystical: 'linear-gradient(135deg, rgba(139, 92, 246, 0.7) 0%, rgba(59, 130, 246, 0.5) 100%)',
        surface: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
        glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdrop: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)'
      },
      
      // Enhanced glass shadows with blur
      shadows: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glassSm: '0 2px 8px 0 rgba(31, 38, 135, 0.2)',
        glassMd: '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        glassLg: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glassXl: '0 16px 64px 0 rgba(31, 38, 135, 0.4)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    },
    fonts: {
      elegant: 'Inter',
      modern: 'Inter',
      signature: 'Inter'
    },
    motifs: ['✨', '💎', '🔮', '💠', '🌟', '⚪'],
    mood: 'transparent and ethereal',
    
    // Glass-specific styling properties
    glass: {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)', // Safari support
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 16,
      background: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    }
  }
} as const;
