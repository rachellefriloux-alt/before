import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
}

export function OnboardingButton({ title, onPress, style }: OnboardingButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#0d0d0d',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});