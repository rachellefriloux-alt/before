import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'heading1' | 'heading2' | 'heading3' | 'body' | 'label';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  gradient?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  weight,
  gradient = false,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const getTypeStyle = () => {
    switch (type) {
      case 'heading1': return styles.heading1;
      case 'heading2': return styles.heading2;
      case 'heading3': return styles.heading3;
      case 'title': return styles.title;
      case 'subtitle': return styles.subtitle;
      case 'body': return styles.body;
      case 'caption': return styles.caption;
      case 'label': return styles.label;
      case 'link': return { ...styles.link, color: tintColor };
      case 'defaultSemiBold': return styles.defaultSemiBold;
      default: return styles.default;
    }
  };

  const getWeightStyle = () => {
    if (!weight) return {};
    return {
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      }[weight]
    };
  };

  return (
    <Text
      style={[
        { color: gradient ? undefined : color },
        getTypeStyle(),
        getWeightStyle(),
        gradient && styles.gradient,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  heading1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: 'Inter',
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: -0.25,
  },
  heading3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter',
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: 'Inter',
    textDecorationLine: 'underline',
  },
  gradient: {
    // Note: Gradient text requires native implementation or SVG
    textShadowColor: 'rgba(99, 102, 241, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});