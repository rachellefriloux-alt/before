import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { useUserStore } from '@/store/user';
import { FloatingChatBubble } from '@/components/FloatingChatBubble';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { profile } = useUserStore();
    const [navigationComponents, setNavigationComponents] = useState<{
        ThemeProvider: any;
        DarkTheme: any;
        DefaultTheme: any;
    } | null>(null);

    useEffect(() => {
        // Dynamic import for navigation components to avoid CommonJS/ESM conflicts
        const loadNavigationComponents = async () => {
            try {
                const navModule = await import('@react-navigation/native');
                setNavigationComponents({
                    ThemeProvider: navModule.ThemeProvider,
                    DarkTheme: navModule.DarkTheme,
                    DefaultTheme: navModule.DefaultTheme,
                });
            } catch (error) {
                console.error('Failed to load navigation components:', error);
            }
        };

        loadNavigationComponents();
    }, []);
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    // Expo Router uses Error Boundaries to catch errors in the routing components.

    // Hide splash screen immediately since we're not loading custom fonts
    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    // For now, default to drawer to show the working app
    // TODO: Add onboarding back when (onboarding) routes are implemented
    const initialRoute = '(drawer)';

    // Show loading while navigation components are being loaded
    if (!navigationComponents) {
        return null;
    }

    const { ThemeProvider, DarkTheme, DefaultTheme } = navigationComponents;

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <OnboardingProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
                        {/* Glass Background */}
                        <Stack
                            initialRouteName={initialRoute}
                            screenOptions={{
                                contentStyle: {
                                    backgroundColor: 'rgba(20, 184, 166, 0.08)', // Mystical teal glass backdrop
                                }
                            }}
                        >
                            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                            <Stack.Screen name="+not-found" />
                        </Stack>
                        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
                        {/* Floating Chat Bubble - Available everywhere in the app */}
                        <FloatingChatBubble visible={true} />
                    </SafeAreaProvider>
                </GestureHandlerRootView>
            </OnboardingProvider>
        </ThemeProvider>
    );
}