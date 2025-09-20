
// Import Platform for cross-platform styling
import { Platform } from 'react-native';

/**
 * Sophisticated Visual Identity System
 * Elegant, refined palette for the discerning user
 */

// SOPHISTICATED PALETTE - Deep, rich tones with premium feel
const sophisticatedPalette = {
  // Deep Charcoals & Refined Blacks
  obsidian: '#0D0D0D',           // Deep obsidian black
  charcoal: '#1A1A1A',          // Rich charcoal
  graphite: '#2D2D2D',          // Smooth graphite
  slate: '#3A3A3A',             // Modern slate
  gunmetal: '#4A4A4A',          // Gunmetal gray

  // Premium Metallics
  platinum: '#E5E4E2',          // Luxurious platinum
  titanium: '#878681',          // Industrial titanium
  steel: '#71797E',             // Brushed steel
  silver: '#C0C0C0',            // Classic silver
  chrome: '#B8B8B8',            // Chrome finish

  // Sophisticated Accents
  sapphire: '#0F52BA',          // Deep sapphire blue
  emerald: '#046A38',           // Rich emerald green
  ruby: '#9B111E',              // Deep ruby red
  amber: '#FF7E00',             // Warm amber
  amethyst: '#9966CC',          // Elegant amethyst

  // Neutral Sophistication
  ivory: '#FFFFF0',             // Soft ivory
  cream: '#F5F5DC',             // Rich cream
  linen: '#FAF0E6',             // Natural linen
  pearl: '#F8F6F0',             // Lustrous pearl
  bone: '#E3DAC9',              // Warm bone
};

// REFINED THEMES
const tintColorLight = sophisticatedPalette.sapphire;
const tintColorDark = sophisticatedPalette.platinum;

export const Colors = {
  light: {
    // Core Sophisticated Colors
    text: sophisticatedPalette.obsidian,
    textSecondary: sophisticatedPalette.gunmetal,
    background: sophisticatedPalette.ivory,
    surface: sophisticatedPalette.pearl,
    surfaceElevated: '#ffffff',
    tint: tintColorLight,

    // Premium Palette
    primary: sophisticatedPalette.sapphire,
    accent: sophisticatedPalette.emerald,
    mystical: sophisticatedPalette.amethyst,
    wisdom: sophisticatedPalette.emerald,
    energy: sophisticatedPalette.amber,
    shine: sophisticatedPalette.platinum,
    glow: sophisticatedPalette.sapphire,
    silver: sophisticatedPalette.silver,
    gold: sophisticatedPalette.amber,

    // Semantic Colors
    success: sophisticatedPalette.emerald,
    warning: sophisticatedPalette.amber,
    error: sophisticatedPalette.ruby,
    info: sophisticatedPalette.sapphire,

    // UI Elements
    icon: sophisticatedPalette.gunmetal,
    iconSecondary: sophisticatedPalette.steel,
    border: sophisticatedPalette.chrome,
    borderFocus: sophisticatedPalette.sapphire,
    tabIconDefault: sophisticatedPalette.steel,
    tabIconSelected: sophisticatedPalette.sapphire,
    overlay: 'rgba(13, 13, 13, 0.15)',
    card: '#ffffff',
    shadow: sophisticatedPalette.charcoal,

    // Refined Gradients
    gradient: {
      primary: `linear-gradient(135deg, ${sophisticatedPalette.sapphire} 0%, ${sophisticatedPalette.emerald} 100%)`,
      mystical: `linear-gradient(135deg, ${sophisticatedPalette.amethyst} 0%, ${sophisticatedPalette.sapphire} 100%)`,
      wisdom: `linear-gradient(135deg, ${sophisticatedPalette.emerald} 0%, ${sophisticatedPalette.amber} 100%)`,
      energy: `linear-gradient(135deg, ${sophisticatedPalette.amber} 0%, ${sophisticatedPalette.ruby} 100%)`,
      surface: `linear-gradient(135deg, ${sophisticatedPalette.pearl} 0%, ${sophisticatedPalette.ivory} 100%)`,
      metallic: `linear-gradient(135deg, ${sophisticatedPalette.platinum} 0%, ${sophisticatedPalette.silver} 50%, ${sophisticatedPalette.chrome} 100%)`,
    },

    // Premium Shadows
    shadows: {
      sm: '0 1px 3px 0 rgb(13, 13, 13 / 0.1)',
      md: '0 4px 6px -1px rgb(13, 13, 13 / 0.1), 0 2px 4px -2px rgb(13, 13, 13 / 0.1)',
      lg: '0 10px 15px -3px rgb(13, 13, 13 / 0.1), 0 4px 6px -4px rgb(13, 13, 13 / 0.1)',
      xl: '0 20px 25px -5px rgb(13, 13, 13 / 0.1), 0 8px 10px -6px rgb(13, 13, 13 / 0.1)',
      sapphire: `0 8px 32px -8px ${sophisticatedPalette.sapphire}40`,
      emerald: `0 8px 32px -8px ${sophisticatedPalette.emerald}40`,
      amber: `0 8px 32px -8px ${sophisticatedPalette.amber}40`,
    }
  },
  dark: {
    // Dark Sophisticated Colors
    text: sophisticatedPalette.platinum,
    textSecondary: sophisticatedPalette.steel,
    background: sophisticatedPalette.obsidian,
    surface: sophisticatedPalette.charcoal,
    surfaceElevated: sophisticatedPalette.graphite,
    tint: tintColorDark,

    // Dark Premium Palette
    primary: sophisticatedPalette.platinum,
    accent: sophisticatedPalette.emerald,
    mystical: sophisticatedPalette.amethyst,
    wisdom: sophisticatedPalette.emerald,
    energy: sophisticatedPalette.amber,
    shine: sophisticatedPalette.chrome,
    glow: sophisticatedPalette.sapphire,
    silver: sophisticatedPalette.titanium,
    gold: sophisticatedPalette.amber,

    // Dark Semantic Colors
    success: sophisticatedPalette.emerald,
    warning: sophisticatedPalette.amber,
    error: '#ff6b6b',
    info: sophisticatedPalette.sapphire,

    // Dark UI Elements
    icon: sophisticatedPalette.chrome,
    iconSecondary: sophisticatedPalette.steel,
    border: sophisticatedPalette.slate,
    borderFocus: sophisticatedPalette.platinum,
    tabIconDefault: sophisticatedPalette.steel,
    tabIconSelected: sophisticatedPalette.platinum,
    overlay: 'rgba(0, 0, 0, 0.8)',
    card: sophisticatedPalette.charcoal,
    shadow: '#000000',

    // Dark Refined Gradients
    gradient: {
      primary: `linear-gradient(135deg, ${sophisticatedPalette.platinum} 0%, ${sophisticatedPalette.chrome} 100%)`,
      mystical: `linear-gradient(135deg, ${sophisticatedPalette.amethyst} 0%, ${sophisticatedPalette.sapphire} 100%)`,
      wisdom: `linear-gradient(135deg, ${sophisticatedPalette.emerald} 0%, ${sophisticatedPalette.amber} 100%)`,
      energy: `linear-gradient(135deg, ${sophisticatedPalette.amber} 0%, ${sophisticatedPalette.ruby} 100%)`,
      surface: `linear-gradient(135deg, ${sophisticatedPalette.charcoal} 0%, ${sophisticatedPalette.graphite} 100%)`,
      metallic: `linear-gradient(135deg, ${sophisticatedPalette.titanium} 0%, ${sophisticatedPalette.steel} 50%, ${sophisticatedPalette.gunmetal} 100%)`,
    },

    // Dark Premium Shadows
    shadows: {
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.5)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.7), 0 8px 10px -6px rgb(0 0 0 / 0.7)',
      sapphire: `0 8px 32px -8px ${sophisticatedPalette.sapphire}60`,
      emerald: `0 8px 32px -8px ${sophisticatedPalette.emerald}60`,
      amber: `0 8px 32px -8px ${sophisticatedPalette.amber}60`,
    }
  },
};

// SOPHISTICATED APPEARANCE THEMES
export const SallieThemes = {
  executiveSuite: {
    name: 'Executive Suite',
    colors: { ...Colors.light, primary: sophisticatedPalette.sapphire, accent: sophisticatedPalette.platinum },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['⬢', '◆', '▲', '●', '■', '▬'],
    mood: 'sophisticated and commanding'
  },

  midnightSteel: {
    name: 'Midnight Steel',
    colors: { ...Colors.dark, primary: sophisticatedPalette.platinum, accent: sophisticatedPalette.steel },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['◇', '◈', '◉', '◎', '◐', '◑'],
    mood: 'sleek and powerful'
  },

  wildElegance: {
    name: 'Wild Elegance',
    colors: { ...Colors.light, primary: sophisticatedPalette.emerald, accent: sophisticatedPalette.amber },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['⟐', '⟑', '⟒', '⟓', '⟔', '⟕'],
    mood: 'free-spirited yet refined'
  },

  crimsonLux: {
    name: 'Crimson Luxe',
    colors: { ...Colors.dark, primary: sophisticatedPalette.ruby, accent: sophisticatedPalette.silver, background: '#0A0A0A' },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['♦', '◆', '⬧', '⬨', '⬩', '⬪'],
    mood: 'bold and luxurious'
  },

  platinumEdge: {
    name: 'Platinum Edge',
    colors: { ...Colors.light, primary: sophisticatedPalette.titanium, accent: sophisticatedPalette.charcoal, surface: '#F8F8F8' },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['⟡', '⟢', '⟣', '⟤', '⟥', '⟦'],
    mood: 'industrial elegance'
  },

  amethystVision: {
    name: 'Amethyst Vision',
    colors: { ...Colors.dark, primary: sophisticatedPalette.amethyst, accent: sophisticatedPalette.pearl, background: sophisticatedPalette.obsidian },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['◈', '◉', '◊', '○', '◎', '●'],
    mood: 'mystical and wise'
  },

  goldStandard: {
    name: 'Gold Standard',
    colors: { ...Colors.light, primary: sophisticatedPalette.amber, accent: sophisticatedPalette.obsidian, surface: sophisticatedPalette.cream },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['⬟', '⬠', '⬡', '⬢', '⬣', '⬤'],
    mood: 'prestigious and warm'
  },

  shadowMaster: {
    name: 'Shadow Master',
    colors: { ...Colors.dark, primary: sophisticatedPalette.gunmetal, accent: sophisticatedPalette.chrome, background: '#050505' },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['◢', '◣', '◤', '◥', '◦', '◧'],
    mood: 'commanding and mysterious'
  },

  emeraldDepth: {
    name: 'Emerald Depth',
    colors: { ...Colors.dark, primary: sophisticatedPalette.emerald, accent: sophisticatedPalette.bone, background: '#0C1411' },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['◈', '◇', '◆', '❖', '⬧', '⬨'],
    mood: 'natural sophistication'
  },

  stormSilver: {
    name: 'Storm Silver',
    colors: { ...Colors.light, primary: sophisticatedPalette.steel, accent: sophisticatedPalette.sapphire, surface: '#F2F2F2' },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['⟐', '⟑', '⟒', '⟓', '⟔', '⟕'],
    mood: 'dynamic and refined'
  },

  blackDiamond: {
    name: 'Black Diamond',
    colors: { ...Colors.dark, primary: sophisticatedPalette.charcoal, accent: sophisticatedPalette.platinum, background: '#000000' },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['◆', '♦', '⬧', '⬨', '◈', '◇'],
    mood: 'ultimate elegance'
  },

  ivoryTower: {
    name: 'Ivory Tower',
    colors: { ...Colors.light, primary: sophisticatedPalette.bone, accent: sophisticatedPalette.emerald, surface: sophisticatedPalette.ivory },
    fonts: {
      elegant: 'SF Pro Display',
      modern: 'Inter',
      signature: 'SF Pro Text'
    },
    motifs: ['⬟', '⬠', '⬡', '⬢', '⬣', '⬤'],
    mood: 'pure sophistication'
  },
} as const;
