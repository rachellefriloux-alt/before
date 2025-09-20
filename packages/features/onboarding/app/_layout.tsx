import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Dynamic import for navigation themes to avoid CommonJS/ESM conflicts
  const [ThemeProvider, setThemeProvider] = useState<any>(null);
  const [DarkTheme, setDarkTheme] = useState<any>(null);
  const [DefaultTheme, setDefaultTheme] = useState<any>(null);

  useEffect(() => {
    const loadNavigationThemes = async () => {
      try {
        const { ThemeProvider: TP, DarkTheme: DT, DefaultTheme: DFT } = await import('@react-navigation/native');
        setThemeProvider(() => TP);
        setDarkTheme(DT);
        setDefaultTheme(DFT);
      } catch (error) {
        console.warn('Failed to load navigation themes:', error);
      }
    };
    loadNavigationThemes();
  }, []);

  if (!loaded || !ThemeProvider) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <OnboardingProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </OnboardingProvider>
  );
}
