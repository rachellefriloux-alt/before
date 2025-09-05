/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Theme constants for consistent UI styling.
 * Got it, love.
 */

import { Platform } from 'react-native';

const palette = {
  // Primary colors
  primary: '#5e72e4',
  primaryLight: '#8f9ff3',
  primaryDark: '#324bd9',
  
  // Secondary colors
  secondary: '#f7fafc',
  secondaryLight: '#ffffff',
  secondaryDark: '#d4dadf',
  
  // Accent colors
  accent: '#11cdef',
  accentLight: '#4edcf5',
  accentDark: '#0ea5c2',
  
  // Success
  success: '#2dce89',
  successLight: '#59dba6',
  successDark: '#24a46d',
  
  // Info
  info: '#11cdef',
  infoLight: '#4edcf5',
  infoDark: '#0ea5c2',
  
  // Warning
  warning: '#fb6340',
  warningLight: '#fc8668',
  warningDark: '#ea3b15',
  
  // Danger
  danger: '#f5365c',
  dangerLight: '#f7678a',
  dangerDark: '#e3133d',
  
  // Neutrals
  black: '#12263f',
  white: '#ffffff',
  transparent: 'transparent',
  
  // Grays
  gray100: '#f6f9fc',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#8898aa',
  gray700: '#525f7f',
  gray800: '#32325d',
  gray900: '#212529',
  
  // Dark theme specific
  darkBackground: '#1a1b1e',
  darkBackgroundSecondary: '#252525',
  darkCard: '#2a2a2a',
  darkBorder: '#333333',
};

const theme = {
  colors: {
    ...palette,
    
    // UI Elements
    background: palette.white,
    backgroundDark: palette.darkBackground,
    card: palette.white,
    cardDark: palette.darkCard,
    text: palette.gray800,
    textDark: palette.gray200,
    textLight: palette.white,
    textMuted: palette.gray600,
    textMutedDark: palette.gray500,
    
    // Interactive elements
    button: palette.primary,
    buttonText: palette.white,
    buttonDisabled: palette.gray400,
    buttonTextDisabled: palette.gray600,
    
    // Inputs
    input: palette.white,
    inputDark: palette.darkCard,
    inputBorder: palette.gray300,
    inputBorderDark: palette.darkBorder,
    inputText: palette.gray800,
    inputTextDark: palette.gray200,
    inputPlaceholder: palette.gray500,
    
    // Status
    online: palette.success,
    offline: palette.gray500,
    busy: palette.warning,
    away: palette.warning,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    
    // Common layout spacing
    screenPadding: 16,
    sectionPadding: 24,
    cardPadding: 16,
  },
  
  typography: {
    // Font families
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontFamilyBold: Platform.OS === 'ios' ? 'System' : 'Roboto',
    
    // Font sizes
    fontSizeXs: 10,
    fontSizeSm: 12,
    fontSizeMd: 14,
    fontSizeLg: 16,
    fontSizeXl: 18,
    fontSize2xl: 20,
    fontSize3xl: 24,
    fontSize4xl: 32,
    
    // Line heights
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
    
    // Font weights
    fontWeightLight: '300',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    fontWeightSemiBold: '600',
    fontWeightBold: '700',
  },
  
  borders: {
    radiusXs: 2,
    radiusSm: 4,
    radiusMd: 8,
    radiusLg: 12,
    radiusXl: 16,
    radiusRound: 999,
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  animations: {
    timingFast: 150,
    timingNormal: 300,
    timingSlow: 500,
  },
  
  // Z-index values for consistent stacking
  zIndex: {
    base: 0,
    above: 1,
    below: -1,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    tooltip: 1400,
    toast: 1500,
  },
};

export default theme;
