/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Font management system for dynamic font loading and theme integration
 * Got it, love.
 */

import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ThemeType } from './ThemeSystem';

// Define the font families used in the app
export enum FontFamily {
    DEFAULT = 'DefaultFont',
    SOUTHERN_GRIT = 'SouthernGrit',
    GRACE_GRIND = 'GraceGrind',
}

// Define font weights
export type FontWeight = 'thin' | 'light' | 'regular' | 'medium' | 'bold' | 'black';

// Define font styles
export type FontStyle = 'normal' | 'italic';

// Interface for font asset
export interface FontAsset {
    family: FontFamily;
    weight: FontWeight;
    style: FontStyle;
    asset: NodeRequire;
}

// Define the key type for font mapping
export type FontKey = `${FontFamily}-${FontWeight}-${FontStyle}`;

// Type for font mapping
export type FontMapping = {
    [key in FontKey]?: string;
};

// Font assets registry
const fontAssets: FontAsset[] = [
    // Default font (Inter)
    {
        family: FontFamily.DEFAULT,
        weight: 'thin',
        style: 'normal',
        asset: require('../assets/fonts/default/Inter-Thin.ttf'),
    },
    {
        family: FontFamily.DEFAULT,
        weight: 'light',
        style: 'normal',
        asset: require('../assets/fonts/default/Inter-Light.ttf'),
    },
    {
        family: FontFamily.DEFAULT,
        weight: 'regular',
        style: 'normal',
        asset: require('../assets/fonts/default/Inter-Regular.ttf'),
    },
    {
        family: FontFamily.DEFAULT,
        weight: 'medium',
        style: 'normal',
        asset: require('../assets/fonts/default/Inter-Medium.ttf'),
    },
    {
        family: FontFamily.DEFAULT,
        weight: 'bold',
        style: 'normal',
        asset: require('../assets/fonts/default/Inter-Bold.ttf'),
    },
    {
        family: FontFamily.DEFAULT,
        weight: 'black',
        style: 'normal',
        asset: require('../assets/fonts/default/Inter-Black.ttf'),
    },

    // Southern Grit font
    {
        family: FontFamily.SOUTHERN_GRIT,
        weight: 'regular',
        style: 'normal',
        asset: require('../assets/fonts/southern-grit/SouthernGrit-Regular.ttf'),
    },
    {
        family: FontFamily.SOUTHERN_GRIT,
        weight: 'bold',
        style: 'normal',
        asset: require('../assets/fonts/southern-grit/SouthernGrit-Bold.ttf'),
    },

    // Grace Grind font
    {
        family: FontFamily.GRACE_GRIND,
        weight: 'light',
        style: 'normal',
        asset: require('../assets/fonts/grace-grind/GraceGrind-Light.ttf'),
    },
    {
        family: FontFamily.GRACE_GRIND,
        weight: 'regular',
        style: 'normal',
        asset: require('../assets/fonts/grace-grind/GraceGrind-Regular.ttf'),
    },
    {
        family: FontFamily.GRACE_GRIND,
        weight: 'medium',
        style: 'normal',
        asset: require('../assets/fonts/grace-grind/GraceGrind-Medium.ttf'),
    },
    {
        family: FontFamily.GRACE_GRIND,
        weight: 'bold',
        style: 'normal',
        asset: require('../assets/fonts/grace-grind/GraceGrind-Bold.ttf'),
    },
];

// Create font name mapping for each asset
export const fontMapping: FontMapping = {};

// Generate the font names for each asset
fontAssets.forEach(font => {
    const key: FontKey = `${font.family}-${font.weight}-${font.style}`;
    fontMapping[key] = `${font.family}-${font.weight}${font.style === 'italic' ? 'Italic' : ''}`;
});

// Theme font mapping for each theme
export const themeFontMapping: Record<ThemeType, FontFamily> = {
    default: FontFamily.DEFAULT,
    southernGrit: FontFamily.SOUTHERN_GRIT,
    graceGrind: FontFamily.GRACE_GRIND,
    soulSweat: FontFamily.DEFAULT, // Soul Sweat uses default fonts
    system: FontFamily.DEFAULT, // System theme uses default fonts
};

/**
 * Load all fonts for the application
 * @returns Promise that resolves when fonts are loaded
 */
export const loadAllFonts = async (): Promise<void> => {
    const fontMap: Record<string, NodeRequire> = {};

    // Create the font map for loading
    fontAssets.forEach(font => {
        const fontName = fontMapping[`${font.family}-${font.weight}-${font.style}` as FontKey];
        if (fontName) {
            fontMap[fontName] = font.asset;
        }
    });

    // Load all fonts
    await Font.loadAsync(fontMap);
};

/**
 * Hook to load fonts and track loading state
 * @returns Object containing loading state and error
 */
export const useFonts = (): { loaded: boolean; error: Error | null } => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadAllFonts()
            .then(() => {
                setLoaded(true);
            })
            .catch(err => {
                console.error('Failed to load fonts:', err);
                setError(err);
                // Fall back to system fonts if loading fails
                setLoaded(true);
            });
    }, []);

    return { loaded, error };
};

/**
 * Get font family for a specific theme and weight
 * @param theme - Current theme type
 * @param weight - Font weight to use
 * @returns Font family string for use in styles
 */
export const getFontForTheme = (
    theme: ThemeType,
    weight: FontWeight = 'regular',
    style: FontStyle = 'normal'
): string => {
    const fontFamily = themeFontMapping[theme];
    const key = `${fontFamily}-${weight}-${style}` as FontKey;
    const fontName = fontMapping[key];

    // If we have a specific font for this combination, use it
    if (fontName) {
        return fontName;
    }

    // Otherwise fall back to default font with the specified weight
    const defaultKey = `${FontFamily.DEFAULT}-${weight}-${style}` as FontKey;
    const defaultFontName = fontMapping[defaultKey];

    if (defaultFontName) {
        return defaultFontName;
    }

    // Ultimate fallback to system fonts
    if (Platform.OS === 'ios') {
        return weight === 'bold' ? 'System-Bold' : 'System';
    }

    return 'sans-serif';
};

/**
 * Create style object with font family for the current theme
 * @param theme - Current theme type
 * @param weight - Font weight to use
 * @param style - Font style to use
 * @returns Style object with fontFamily property
 */
export const getFontStyle = (
    theme: ThemeType,
    weight: FontWeight = 'regular',
    style: FontStyle = 'normal'
): { fontFamily: string } => {
    return {
        fontFamily: getFontForTheme(theme, weight, style),
    };
};

export default {
    FontFamily,
    fontMapping,
    themeFontMapping,
    loadAllFonts,
    useFonts,
    getFontForTheme,
    getFontStyle,
};
