
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

import { useColorScheme } from '@/hooks/useColorScheme';
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

    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    // Hide splash screen when fonts are loaded
    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    // For now, default to drawer to show the working app
    // TODO: Add onboarding back when (onboarding) routes are implemented
    const initialRoute = '(drawer)';

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <OnboardingProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
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
                        <FloatingChatBubble visible={true} />
                    </SafeAreaProvider>
                </GestureHandlerRootView>
            </OnboardingProvider>
        </ThemeProvider>
    );
}
