import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  children, 
  style 
}) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: '#3b82f6',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  text_default: {
    color: '#ffffff',
  },
  text_secondary: {
    color: '#374151',
  },
  text_destructive: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#374151',
  },
});