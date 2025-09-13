import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeSystem';

export default function Help() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.semantic.background.primary }]}>
      <Text style={[styles.title, { color: theme.colors.semantic.text.primary }]}>
        ❓ Help
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.semantic.text.secondary }]}>
        Get support and learn how to use Sallie
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