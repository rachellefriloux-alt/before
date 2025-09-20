import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeSystem';

export default function EmotionalSupport() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.semantic.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.semantic.text.primary }]}>
        💖 Emotional Support
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.semantic.text.secondary }]}>
        Your safe space for emotional well-being
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});