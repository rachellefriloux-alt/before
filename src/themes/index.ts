import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    overlay: string;
    mystical: string;
    shadow: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    background: string[];
    sallie: string[];
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    fontFamily: string;
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      hero: number;
    };
    weights: {
      light: string;
      regular: string;
      medium: string;
      bold: string;
      black: string;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
  shadow: string;
}

const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const baseBorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

const baseShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

const baseTypography = {
  fontFamily: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    hero: 32,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
};

export const themes: Record<string, Theme> = {
  'grace-grind': {
    name: 'grace-grind',
    displayName: 'Grace & Grind',
    colors: {
      primary: '#8B5A3C',
      secondary: '#D4AF37',
      accent: '#E6B88A',
      background: '#2C1810',
      surface: '#3D2820',
      card: '#4A3528',
      text: '#F5F5DC',
      textSecondary: '#D2B48C',
      border: '#8B5A3C',
      success: '#87D396',
      warning: '#F4A261',
      error: '#E76F51',
      info: '#87CEEB',
      overlay: 'rgba(44, 24, 16, 0.9)',
      mystical: '#D4AF37',
      shadow: '#000000',
    },
    gradients: {
      primary: ['#8B5A3C', '#D4AF37'],
      secondary: ['#D4AF37', '#E6B88A'],
      background: ['#2C1810', '#1A0F08'],
      sallie: ['#D4AF37', '#8B5A3C', '#E6B88A'],
    },
    spacing: baseSpacing,
    typography: baseTypography,
    borderRadius: baseBorderRadius,
    shadows: baseShadows,
    shadow: '#000000',
  },
  
  'southern-grit': {
    name: 'southern-grit',
    displayName: 'Southern Grit',
    colors: {
      primary: '#8B0000',
      secondary: '#CD853F',
      accent: '#FF6347',
      background: '#1C1C1C',
      surface: '#2F2F2F',
      card: '#3C3C3C',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#8B0000',
      success: '#32CD32',
      warning: '#FFA500',
      error: '#DC143C',
      info: '#4682B4',
      overlay: 'rgba(28, 28, 28, 0.9)',
      mystical: '#FF6347',
      shadow: '#000000',
    },
    gradients: {
      primary: ['#8B0000', '#CD853F'],
      secondary: ['#CD853F', '#FF6347'],
      background: ['#1C1C1C', '#0F0F0F'],
      sallie: ['#8B0000', '#CD853F', '#FF6347'],
    },
    spacing: baseSpacing,
    typography: baseTypography,
    borderRadius: baseBorderRadius,
    shadows: baseShadows,
    shadow: '#000000',
  },
  
  'hustle-legacy': {
    name: 'hustle-legacy',
    displayName: 'Hustle Legacy',
    colors: {
      primary: '#4B0082',
      secondary: '#FFD700',
      accent: '#9370DB',
      background: '#0F0F23',
      surface: '#1A1A2E',
      card: '#16213E',
      text: '#E6E6FA',
      textSecondary: '#B0B0D4',
      border: '#4B0082',
      success: '#00FF7F',
      warning: '#FFD700',
      error: '#FF1493',
      info: '#00BFFF',
      overlay: 'rgba(15, 15, 35, 0.9)',
      mystical: '#9370DB',
      shadow: '#000000',
    },
    gradients: {
      primary: ['#4B0082', '#FFD700'],
      secondary: ['#FFD700', '#9370DB'],
      background: ['#0F0F23', '#0A0A1A'],
      sallie: ['#4B0082', '#9370DB', '#FFD700'],
    },
    spacing: baseSpacing,
    typography: baseTypography,
    borderRadius: baseBorderRadius,
    shadows: baseShadows,
    shadow: '#000000',
  },
  
  'soul-care': {
    name: 'soul-care',
    displayName: 'Soul Care',
    colors: {
      primary: '#708090',
      secondary: '#F0E68C',
      accent: '#DDA0DD',
      background: '#2F4F4F',
      surface: '#3C5A5A',
      card: '#456565',
      text: '#F5F5F5',
      textSecondary: '#D3D3D3',
      border: '#708090',
      success: '#98FB98',
      warning: '#F0E68C',
      error: '#F08080',
      info: '#87CEEB',
      overlay: 'rgba(47, 79, 79, 0.9)',
      mystical: '#DDA0DD',
      shadow: '#000000',
    },
    gradients: {
      primary: ['#708090', '#F0E68C'],
      secondary: ['#F0E68C', '#DDA0DD'],
      background: ['#2F4F4F', '#1C3333'],
      sallie: ['#708090', '#DDA0DD', '#F0E68C'],
    },
    spacing: baseSpacing,
    typography: baseTypography,
    borderRadius: baseBorderRadius,
    shadows: baseShadows,
    shadow: '#000000',
  },
  
  'quiet-power': {
    name: 'quiet-power',
    displayName: 'Quiet Power',
    colors: {
      primary: '#2F2F2F',
      secondary: '#C0C0C0',
      accent: '#6A5ACD',
      background: '#1E1E1E',
      surface: '#2D2D2D',
      card: '#3A3A3A',
      text: '#FFFFFF',
      textSecondary: '#AAAAAA',
      border: '#555555',
      success: '#90EE90',
      warning: '#DAA520',
      error: '#CD5C5C',
      info: '#87CEFA',
      overlay: 'rgba(30, 30, 30, 0.9)',
      mystical: '#6A5ACD',
      shadow: '#000000',
    },
    gradients: {
      primary: ['#2F2F2F', '#C0C0C0'],
      secondary: ['#C0C0C0', '#6A5ACD'],
      background: ['#1E1E1E', '#0F0F0F'],
      sallie: ['#2F2F2F', '#6A5ACD', '#C0C0C0'],
    },
    spacing: baseSpacing,
    typography: baseTypography,
    borderRadius: baseBorderRadius,
    shadows: baseShadows,
    shadow: '#000000',
  },
  
  'midnight-hustle': {
    name: 'midnight-hustle',
    displayName: 'Midnight Hustle',
    colors: {
      primary: '#000080',
      secondary: '#FF4500',
      accent: '#40E0D0',
      background: '#0A0A0A',
      surface: '#1A1A1A',
      card: '#2A2A2A',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#000080',
      success: '#00FF00',
      warning: '#FF4500',
      error: '#FF0000',
      info: '#40E0D0',
      overlay: 'rgba(10, 10, 10, 0.9)',
      mystical: '#40E0D0',
      shadow: '#000000',
    },
    gradients: {
      primary: ['#000080', '#FF4500'],
      secondary: ['#FF4500', '#40E0D0'],
      background: ['#0A0A0A', '#000000'],
      sallie: ['#000080', '#40E0D0', '#FF4500'],
    },
    spacing: baseSpacing,
    typography: baseTypography,
    borderRadius: baseBorderRadius,
    shadows: baseShadows,
    shadow: '#000000',
  },
};

export const defaultTheme = themes['grace-grind'];