/*
 * Sallie Sovereign - Main React Native App Entry Point
 * A sophisticated AI-powered Android launcher with advanced emotional intelligence
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Core App Components
import AppNavigator from './apps/android-launcher/src/navigation/AppNavigator';
import { PersonaProvider } from './apps/android-launcher/src/contexts/PersonaContext';
import { DeviceProvider } from './apps/android-launcher/src/contexts/DeviceContext';
import { MemoryProvider } from './apps/android-launcher/src/contexts/MemoryContext';
import { ThemeProvider } from './apps/android-launcher/src/contexts/ThemeContext';

// Initialize core systems
import './core/init';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PersonaProvider>
            <DeviceProvider>
              <MemoryProvider>
                <NavigationContainer>
                  <StatusBar style="auto" />
                  <AppNavigator />
                </NavigationContainer>
              </MemoryProvider>
            </DeviceProvider>
          </PersonaProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
