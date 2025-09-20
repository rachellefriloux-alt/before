/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced theming system with dynamic color schemes, semantic colors, and theme switching
 * Got it, love.
 */

import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';

// Define color types for type safety
export type ThemeColors = {
    primary: string;
    primaryVariant: string;
    secondary: string;
    secondaryVariant: string;
    background: string;
    surface: string;
    error: string;
    onPrimary: string;
    onSecondary: string;
    onBackground: string;
    onSurface: string;
    onError: string;
    elevation: {
        level0: string;
        level1: string;
        level2: string;
        level3: string;
        level4: string;
        level5: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
    };
    border: {
        light: string;
        medium: string;
        heavy: string;
    };
    intensity: {
        low: string;
        medium: string;
        high: string;
    };
    success: string;
    warning: string;
    info: string;
    subtle: string;
    accent1: string;
    accent2: string;
};

export type ThemeType = 'default' | 'southernGrit' | 'graceGrind' | 'soulSweat' | 'mysticForest' | 'cyberNeon' | 'desertOasis' | 'aurora' | 'system';

// Define the shape of our full theme object
export interface Theme {
    colors: ThemeColors;
    dark: boolean;
    name: string;
    type: ThemeType;
    spacing: {
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
        xxl: number;
    };
    borderRadius: {
        small: number;
        medium: number;
        large: number;
        pill: number;
        circular: number;
    };
    typography: {
        sizes: {
            caption: number;
            body2: number;
            body1: number;
            subtitle: number;
            title: number;
            h3: number;
            h2: number;
            h1: number;
        };
        weights: {
            thin: string;
            light: string;
            regular: string;
            medium: string;
            bold: string;
            black: string;
        };
        lineHeights: {
            tight: number;
            normal: number;
            relaxed: number;
            loose: number;
        };
    };
    animation: {
        durations: {
            veryFast: number;
            fast: number;
            normal: number;
            slow: number;
            verySlow: number;
        };
        curves: {
            standard: string;
            decelerate: string;
            accelerate: string;
            sharp: string;
            spring: string;
        };
    };
    shadows: {
        none: {};
        small: {};
        medium: {};
        large: {};
        extraLarge: {};
        intense: {};
        subtle: {};
    };
}

// Define the default light theme
export const lightTheme: Theme = {
    colors: {
        primary: '#512DA8',
        primaryVariant: '#311B92',
        secondary: '#FF5722',
        secondaryVariant: '#E64A19',
        background: '#FFFFFF',
        surface: '#FAFAFA',
        error: '#B00020',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onBackground: '#212121',
        onSurface: '#212121',
        onError: '#FFFFFF',
        elevation: {
            level0: 'transparent',
            level1: '#F5F5F5',
            level2: '#EEEEEE',
            level3: '#E0E0E0',
            level4: '#D6D6D6',
            level5: '#C2C2C2',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
            tertiary: '#9E9E9E',
            disabled: '#BDBDBD',
        },
        border: {
            light: '#E0E0E0',
            medium: '#BDBDBD',
            heavy: '#9E9E9E',
        },
        intensity: {
            low: 'rgba(0, 0, 0, 0.05)',
            medium: 'rgba(0, 0, 0, 0.1)',
            high: 'rgba(0, 0, 0, 0.15)',
        },
        success: '#4CAF50',
        warning: '#FF9800',
        info: '#2196F3',
        subtle: '#E8EAF6',
        accent1: '#00BCD4',
        accent2: '#FFC107',
    },
    dark: false,
    name: 'Default Light',
    type: 'default',
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        small: 4,
        medium: 8,
        large: 16,
        pill: 500,
        circular: 1000,
    },
    typography: {
        sizes: {
            caption: 12,
            body2: 14,
            body1: 16,
            subtitle: 18,
            title: 20,
            h3: 24,
            h2: 28,
            h1: 34,
        },
        weights: {
            thin: '100',
            light: '300',
            regular: '400',
            medium: '500',
            bold: '700',
            black: '900',
        },
        lineHeights: {
            tight: 1.15,
            normal: 1.4,
            relaxed: 1.6,
            loose: 1.8,
        },
    },
    animation: {
        durations: {
            veryFast: 100,
            fast: 200,
            normal: 300,
            slow: 500,
            verySlow: 800,
        },
        curves: {
            standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
            accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
            spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        },
    },
    shadows: {
        none: {},
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
        },
        extraLarge: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.44,
            shadowRadius: 10.32,
            elevation: 16,
        },
        intense: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.58,
            shadowRadius: 16.0,
            elevation: 24,
        },
        subtle: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
            elevation: 1,
        },
    },
};

// Define the dark theme as a variation of the light theme
export const darkTheme: Theme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        primary: '#7B1FA2',
        primaryVariant: '#6A1B9A',
        secondary: '#FF9800',
        secondaryVariant: '#F57C00',
        background: '#121212',
        surface: '#1E1E1E',
        error: '#CF6679',
        onPrimary: '#FFFFFF',
        onSecondary: '#000000',
        onBackground: '#FFFFFF',
        onSurface: '#FFFFFF',
        onError: '#000000',
        elevation: {
            level0: 'transparent',
            level1: '#232323',
            level2: '#252525',
            level3: '#272727',
            level4: '#2C2C2C',
            level5: '#2F2F2F',
        },
        text: {
            primary: '#E0E0E0',
            secondary: '#A0A0A0',
            tertiary: '#6D6D6D',
            disabled: '#474747',
        },
        border: {
            light: '#2C2C2C',
            medium: '#3D3D3D',
            heavy: '#525252',
        },
        intensity: {
            low: 'rgba(255, 255, 255, 0.05)',
            medium: 'rgba(255, 255, 255, 0.1)',
            high: 'rgba(255, 255, 255, 0.15)',
        },
        success: '#66BB6A',
        warning: '#FFA726',
        info: '#42A5F5',
        subtle: '#392F5A',
        accent1: '#26C6DA',
        accent2: '#FFCA28',
    },
    dark: true,
    name: 'Default Dark',
    type: 'default',
};

// Southern Grit theme - bold, earthy, resilient
export const southernGritTheme: Theme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        primary: '#8B4513',
        primaryVariant: '#654321',
        secondary: '#F15A29',
        secondaryVariant: '#D15A29',
        background: '#F5F1E9',
        surface: '#FFFAF0',
        error: '#A02C2C',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onBackground: '#33281E',
        onSurface: '#33281E',
        onError: '#FFFFFF',
        elevation: {
            level0: 'transparent',
            level1: '#F0EAE0',
            level2: '#EBE2D5',
            level3: '#E6DACB',
            level4: '#E1D2C1',
            level5: '#DCCCB8',
        },
        text: {
            primary: '#33281E',
            secondary: '#5F4B32',
            tertiary: '#937348',
            disabled: '#C0B5A8',
        },
        border: {
            light: '#E6DACB',
            medium: '#D8C8B8',
            heavy: '#C9B8A8',
        },
        intensity: {
            low: 'rgba(51, 40, 30, 0.05)',
            medium: 'rgba(51, 40, 30, 0.1)',
            high: 'rgba(51, 40, 30, 0.15)',
        },
        success: '#6B8E23',
        warning: '#DAA520',
        info: '#5F9EA0',
        subtle: '#F2E8D5',
        accent1: '#D2691E',
        accent2: '#BDB76B',
    },
    dark: false,
    name: 'Southern Grit',
    type: 'southernGrit',
};

// Grace Grind theme - elegant, refined, determined
export const graceGrindTheme: Theme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        primary: '#6A0DAD',
        primaryVariant: '#4B0082',
        secondary: '#00CED1',
        secondaryVariant: '#008B8B',
        background: '#FFFFFF',
        surface: '#F8F8FF',
        error: '#DC143C',
        onPrimary: '#FFFFFF',
        onSecondary: '#000000',
        onBackground: '#2E2E38',
        onSurface: '#2E2E38',
        onError: '#FFFFFF',
        elevation: {
            level0: 'transparent',
            level1: '#F4F4FA',
            level2: '#EEEEF5',
            level3: '#E8E8F0',
            level4: '#E2E2EB',
            level5: '#DCDCE6',
        },
        text: {
            primary: '#2E2E38',
            secondary: '#5D5D6E',
            tertiary: '#8B8B9D',
            disabled: '#BEBEC7',
        },
        border: {
            light: '#E8E8F0',
            medium: '#DCDCE6',
            heavy: '#CECEDA',
        },
        intensity: {
            low: 'rgba(46, 46, 56, 0.05)',
            medium: 'rgba(46, 46, 56, 0.1)',
            high: 'rgba(46, 46, 56, 0.15)',
        },
        success: '#2E8B57',
        warning: '#FF7F50',
        info: '#5D9DD3',
        subtle: '#F0E6FF',
        accent1: '#FF69B4',
        accent2: '#FFD700',
    },
    dark: false,
    name: 'Grace Grind',
    type: 'graceGrind',
};

// Soul Sweat theme - passionate, energetic, intense
export const soulSweatTheme: Theme = {
    ...darkTheme,
    colors: {
        ...darkTheme.colors,
        primary: '#FF3366',
        primaryVariant: '#CC2952',
        secondary: '#33CCFF',
        secondaryVariant: '#29A3CC',
        background: '#1A1A2E',
        surface: '#232333',
        error: '#FF5252',
        onPrimary: '#FFFFFF',
        onSecondary: '#000000',
        onBackground: '#F0F0F0',
        onSurface: '#F0F0F0',
        onError: '#000000',
        elevation: {
            level0: 'transparent',
            level1: '#282838',
            level2: '#2E2E3F',
            level3: '#353546',
            level4: '#3C3C4D',
            level5: '#424255',
        },
        text: {
            primary: '#F0F0F0',
            secondary: '#C0C0CC',
            tertiary: '#9090A0',
            disabled: '#606070',
        },
        border: {
            light: '#353546',
            medium: '#424255',
            heavy: '#505060',
        },
        intensity: {
            low: 'rgba(240, 240, 240, 0.05)',
            medium: 'rgba(240, 240, 240, 0.1)',
            high: 'rgba(240, 240, 240, 0.15)',
        },
        success: '#33FF99',
        warning: '#FFCC33',
        info: '#66A3FF',
        subtle: '#2D2D44',
        accent1: '#FF6699',
        accent2: '#FFFF66',
    },
    dark: true,
    name: 'Soul Sweat',
    type: 'soulSweat',
};

// Mystic Forest theme - deep greens and mystical purples
export const mysticForestTheme: Theme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        primary: '#2E8B57',
        primaryVariant: '#1B5E3A',
        secondary: '#8A2BE2',
        secondaryVariant: '#6A1B9A',
        background: '#F0F8F0',
        surface: '#F8FFF8',
        error: '#DC143C',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onBackground: '#1C3A2E',
        onSurface: '#1C3A2E',
        onError: '#FFFFFF',
        elevation: {
            level0: 'transparent',
            level1: '#E8F5E8',
            level2: '#D4EDDA',
            level3: '#C3E6CB',
            level4: '#B8DFC4',
            level5: '#A8D5B8',
        },
        text: {
            primary: '#1C3A2E',
            secondary: '#4A6B5A',
            tertiary: '#6B8F7C',
            disabled: '#A8BFA8',
        },
        border: {
            light: '#C3E6CB',
            medium: '#A8D5B8',
            heavy: '#8FBF9F',
        },
        intensity: {
            low: 'rgba(28, 58, 46, 0.05)',
            medium: 'rgba(28, 58, 46, 0.1)',
            high: 'rgba(28, 58, 46, 0.15)',
        },
        success: '#32CD32',
        warning: '#FFD700',
        info: '#9370DB',
        subtle: '#E6F3E6',
        accent1: '#FF69B4',
        accent2: '#00CED1',
    },
    dark: false,
    name: 'Mystic Forest',
    type: 'mysticForest',
};

// Cyber Neon theme - vibrant neons and dark backgrounds
export const cyberNeonTheme: Theme = {
    ...darkTheme,
    colors: {
        ...darkTheme.colors,
        primary: '#00FF41',
        primaryVariant: '#00CC33',
        secondary: '#FF0080',
        secondaryVariant: '#CC0066',
        background: '#0A0A0A',
        surface: '#1A1A1A',
        error: '#FF4444',
        onPrimary: '#000000',
        onSecondary: '#000000',
        onBackground: '#E0E0E0',
        onSurface: '#E0E0E0',
        onError: '#000000',
        elevation: {
            level0: 'transparent',
            level1: '#2A2A2A',
            level2: '#333333',
            level3: '#404040',
            level4: '#4A4A4A',
            level5: '#555555',
        },
        text: {
            primary: '#E0E0E0',
            secondary: '#B0B0B0',
            tertiary: '#808080',
            disabled: '#555555',
        },
        border: {
            light: '#404040',
            medium: '#555555',
            heavy: '#707070',
        },
        intensity: {
            low: 'rgba(0, 255, 65, 0.05)',
            medium: 'rgba(0, 255, 65, 0.1)',
            high: 'rgba(0, 255, 65, 0.15)',
        },
        success: '#00FF41',
        warning: '#FFFF00',
        info: '#0080FF',
        subtle: '#2A2A2A',
        accent1: '#FF8000',
        accent2: '#8000FF',
    },
    dark: true,
    name: 'Cyber Neon',
    type: 'cyberNeon',
};

// Desert Oasis theme - warm sands and cool waters
export const desertOasisTheme: Theme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        primary: '#D2691E',
        primaryVariant: '#A0522D',
        secondary: '#4682B4',
        secondaryVariant: '#2E5984',
        background: '#FDF5E6',
        surface: '#FFF8DC',
        error: '#CD5C5C',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onBackground: '#8B4513',
        onSurface: '#8B4513',
        onError: '#FFFFFF',
        elevation: {
            level0: 'transparent',
            level1: '#F5DEB3',
            level2: '#F0E68C',
            level3: '#EEE8AA',
            level4: '#F5DEB3',
            level5: '#DEB887',
        },
        text: {
            primary: '#8B4513',
            secondary: '#A0522D',
            tertiary: '#CD853F',
            disabled: '#D2B48C',
        },
        border: {
            light: '#EEE8AA',
            medium: '#DEB887',
            heavy: '#D2B48C',
        },
        intensity: {
            low: 'rgba(139, 69, 19, 0.05)',
            medium: 'rgba(139, 69, 19, 0.1)',
            high: 'rgba(139, 69, 19, 0.15)',
        },
        success: '#9ACD32',
        warning: '#FFA500',
        info: '#87CEEB',
        subtle: '#F0E68C',
        accent1: '#FF6347',
        accent2: '#20B2AA',
    },
    dark: false,
    name: 'Desert Oasis',
    type: 'desertOasis',
};

// Aurora Borealis theme - northern lights inspired
export const auroraTheme: Theme = {
    ...darkTheme,
    colors: {
        ...darkTheme.colors,
        primary: '#00FF7F',
        primaryVariant: '#00CC66',
        secondary: '#FF1493',
        secondaryVariant: '#CC1177',
        background: '#0F0F23',
        surface: '#1A1A2E',
        error: '#FF6B6B',
        onPrimary: '#000000',
        onSecondary: '#000000',
        onBackground: '#E0E0E0',
        onSurface: '#E0E0E0',
        onError: '#000000',
        elevation: {
            level0: 'transparent',
            level1: '#2A2A40',
            level2: '#3A3A5C',
            level3: '#4A4A7A',
            level4: '#5A5A99',
            level5: '#6A6AB8',
        },
        text: {
            primary: '#E0E0E0',
            secondary: '#B0B0B0',
            tertiary: '#808080',
            disabled: '#555555',
        },
        border: {
            light: '#4A4A7A',
            medium: '#5A5A99',
            heavy: '#6A6AB8',
        },
        intensity: {
            low: 'rgba(0, 255, 127, 0.05)',
            medium: 'rgba(0, 255, 127, 0.1)',
            high: 'rgba(0, 255, 127, 0.15)',
        },
        success: '#00FF7F',
        warning: '#FFD700',
        info: '#00BFFF',
        subtle: '#2A2A40',
        accent1: '#FF4500',
        accent2: '#9370DB',
    },
    dark: true,
    name: 'Aurora Borealis',
    type: 'aurora',
};

// Map of all available themes
const themes: Record<ThemeType, Theme> = {
    default: lightTheme,
    southernGrit: southernGritTheme,
    graceGrind: graceGrindTheme,
    soulSweat: soulSweatTheme,
    mysticForest: mysticForestTheme,
    cyberNeon: cyberNeonTheme,
    desertOasis: desertOasisTheme,
    aurora: auroraTheme,
    system: lightTheme, // This will be dynamically set based on system preference
};

/**
 * Hook for using the theme system
 * @param initialTheme - Initial theme to use
 * @returns Theme object and functions to manipulate it
 */
export const useTheme = (initialTheme: ThemeType = 'default') => {
    const systemColorScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>(initialTheme);
    const [theme, setTheme] = useState<Theme>(() => {
        // If initial theme is 'system', use system preference
        if (initialTheme === 'system') {
            return systemColorScheme === 'dark' ? darkTheme : lightTheme;
        }
        return themes[initialTheme];
    });

    // Load custom fonts used in the themes - using available SpaceMono font
    const [fontsLoaded] = useFonts({
        'SouthernGrit-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
        'SouthernGrit-Bold': require('../assets/fonts/SpaceMono-Regular.ttf'),
        'GraceGrind-Light': require('../assets/fonts/SpaceMono-Regular.ttf'),
        'GraceGrind-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
        'GraceGrind-Medium': require('../assets/fonts/SpaceMono-Regular.ttf'),
        'GraceGrind-Bold': require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    // Update theme when system color scheme changes (if using system theme)
    useEffect(() => {
        if (themeType === 'system') {
            setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        }
    }, [systemColorScheme, themeType]);

    /**
     * Change the active theme
     * @param newThemeType - The theme type to switch to
     */
    const changeTheme = (newThemeType: ThemeType) => {
        setThemeType(newThemeType);

        if (newThemeType === 'system') {
            setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        } else {
            setTheme(themes[newThemeType]);
        }
    };

    /**
     * Toggle between light and dark mode
     */
    const toggleDarkMode = () => {
        if (theme.dark) {
            if (themeType === 'soulSweat') {
                // If in Soul Sweat (which is only dark), switch to Grace Grind (light)
                changeTheme('graceGrind');
            } else {
                // Otherwise switch to the light version of current theme
                changeTheme('default');
            }
        } else {
            if (themeType === 'southernGrit' || themeType === 'graceGrind') {
                // If in a light-only theme, switch to Soul Sweat (dark)
                changeTheme('soulSweat');
            } else {
                // Otherwise switch to dark version of current theme
                changeTheme('system');
                setTheme(darkTheme);
            }
        }
    };

    return {
        theme,
        changeTheme,
        toggleDarkMode,
        isDark: theme.dark,
        themeType,
        fontsLoaded,
        isSystemTheme: themeType === 'system',
    };
};

export default {
    lightTheme,
    darkTheme,
    southernGritTheme,
    graceGrindTheme,
    soulSweatTheme,
    mysticForestTheme,
    cyberNeonTheme,
    desertOasisTheme,
    auroraTheme,
    useTheme,
};
