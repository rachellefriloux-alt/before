import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import HomeLauncherScreen from './src/screens/HomeLauncherScreen';
import SalliePanelScreen from './src/screens/SalliePanelScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MemoriesScreen from './src/screens/MemoriesScreen';
import DebugConsoleScreen from './src/screens/DebugConsoleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DataManagementScreen from './src/screens/DataManagementScreen';

// Import components
import EnhancedSallieOverlay from './src/components/EnhancedSallieOverlay';
import { preloadCriticalComponents } from './components/LazyLoadingSystem';

// Import stores
import { usePersonaStore } from './store/persona';
import { useMemoryStore } from './store/memory';
import { useDeviceStore } from './store/device';
import { useThemeStore } from './store/theme';

// Import orchestrator
import { systemOrchestrator } from './core/SystemOrchestrator';

// Dynamic imports for React Navigation to resolve CommonJS/ESM conflicts
let NavigationContainer: any = null;
let createNativeStackNavigator: any = null;
let createBottomTabNavigator: any = null;
let Stack: any = null;
let Tab: any = null;

interface TabBarIconProps {
  name: 'home' | 'brain' | 'cog';
  color: string;
}

function TabNavigator() {
  const { currentTheme } = useThemeStore();

  if (!Tab) return null;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentTheme.colors.surface,
          borderTopColor: currentTheme.colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: currentTheme.colors.primary,
        tabBarInactiveTintColor: currentTheme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeLauncherScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Memories"
        component={MemoriesScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="brain" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="cog" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabBarIcon({ name, color }: TabBarIconProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return '🏠';
      case 'brain':
        return '🧠';
      case 'cog':
        return '⚙️';
      default:
        return '❓';
    }
  };

  return (
    <Text style={{ color, fontSize: 20 }}>
      {getIcon(name)}
    </Text>
  );
}

export default function App() {
  const [navReady, setNavReady] = useState(false);
  const { emotion, tone } = usePersonaStore();
  const { shortTerm, episodic } = useMemoryStore();
  const { isLauncher, onboardingComplete } = useDeviceStore();
  const { currentTheme } = useThemeStore();

  // Load navigation components dynamically
  useEffect(() => {
    const loadNavigation = async () => {
      try {
        const [navModule, stackModule, tabModule] = await Promise.all([
          import('@react-navigation/native'),
          import('@react-navigation/native-stack'),
          import('@react-navigation/bottom-tabs')
        ]);

        NavigationContainer = navModule.NavigationContainer;
        createNativeStackNavigator = stackModule.createNativeStackNavigator;
        createBottomTabNavigator = tabModule.createBottomTabNavigator;

        Stack = createNativeStackNavigator();
        Tab = createBottomTabNavigator();

        setNavReady(true);
      } catch (error) {
        console.error('Failed to load navigation components:', error);
      }
    };

    loadNavigation();
  }, []);

  // Preload critical components for better performance
  React.useEffect(() => {
    preloadCriticalComponents();

    // Initialize system orchestrator
    systemOrchestrator.initialize().catch((error) => {
      console.error('Failed to initialize system orchestrator:', error);
    });
  }, []);

  if (!navReady || !NavigationContainer || !Stack) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: currentTheme.colors.background }}>
            <Text style={{ color: currentTheme.colors.text }}>Loading Sallie AI...</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          >
            {!onboardingComplete ? (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                  name="SalliePanel"
                  component={SalliePanelScreen}
                  options={{
                    animation: 'slide_from_bottom',
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="DebugConsole"
                  component={DebugConsoleScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name="Profile"
                  component={ProfileScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="DataManagement"
                  component={DataManagementScreen}
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
              </>
            )}
          </Stack.Navigator>

          {/* Enhanced Sallie Overlay - Always accessible with dragging support */}
          <EnhancedSallieOverlay />
        </NavigationContainer>

        <StatusBar
          style={currentTheme.name.includes('light') ? 'dark' : 'light'}
          backgroundColor={currentTheme.colors.background}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
