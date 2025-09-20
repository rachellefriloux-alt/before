import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'surface' | 'elevated' | 'glass';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  rounded = 'none',
  shadow = 'none',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 
    variant === 'surface' ? 'surface' : 
    variant === 'elevated' ? 'surfaceElevated' : 'background'
  );

  const borderRadius = {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999
  }[rounded];

  const shadowStyle = {
    none: {},
    sm: { 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 12,
    },
  }[shadow];

  const glassStyle = variant === 'glass' ? {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } : {};

  return (
    <View 
      style={[
        { 
          backgroundColor: variant === 'glass' ? undefined : backgroundColor,
          borderRadius,
          ...shadowStyle,
          ...glassStyle,
        }, 
        style
      ]} 
      {...otherProps} 
    />
  );
}
