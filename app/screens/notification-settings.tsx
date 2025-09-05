/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Screen for notification settings management.
 * Got it, love.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import NotificationSettings from '../../features/Notifications/NotificationSettings';
import theme from '../../constants/theme';

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {/* Header */}
      <BlurView
        intensity={isDark ? 40 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? theme.colors.textDark : theme.colors.text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Notifications
        </Text>
        <View style={styles.placeholder} />
      </BlurView>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark ? styles.textDark : styles.textLight]}>
            Loading notification settings...
          </Text>
        </View>
      ) : (
        <NotificationSettings 
          onSave={() => {
            // Handle save completion
            router.back();
          }} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: theme.colors.background,
  },
  containerDark: {
    backgroundColor: theme.colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  textLight: {
    color: theme.colors.text,
  },
  textDark: {
    color: theme.colors.textDark,
  },
});
