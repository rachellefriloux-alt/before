import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  size = 'default',
  children, 
  onPress, 
  disabled = false, 
  style 
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style
  ].filter(Boolean);

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    disabled && styles.textDisabled
  ].filter(Boolean);

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  default: {
    backgroundColor: '#3b82f6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: '#ef4444',
  },
  disabled: {
    opacity: 0.5,
  },
  size_default: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  size_lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  size_icon: {
    padding: 12,
    width: 44,
    height: 44,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  text_default: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#374151',
  },
  text_ghost: {
    color: '#374151',
  },
  text_destructive: {
    color: '#ffffff',
  },
  textDisabled: {
    opacity: 0.7,
  },
} as const);