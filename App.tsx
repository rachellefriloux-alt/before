import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import HomeLauncherScreen from './app/screens/HomeLauncherScreen';
import SalliePanelScreen from './app/screens/SalliePanelScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import MemoriesScreen from './app/screens/MemoriesScreen';
import DebugConsoleScreen from './app/screens/DebugConsoleScreen';

// Import components
import EnhancedSallieOverlay from './app/components/EnhancedSallieOverlay';

// Import stores
import { usePersonaStore } from './app/store/persona';
import { useMemoryStore } from './app/store/memory';
import { useDeviceStore } from './app/store/device';
import { useThemeStore } from './app/store/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { currentTheme } = useThemeStore();
  
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
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Memories" 
        component={MemoriesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="brain" color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="cog" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text style={{ color, fontSize: 20 }}>
      {name === 'home' ? '🏠' : name === 'brain' ? '🧠' : '⚙️'}
    </Text>
  );
}

export default function App() {
  const { emotion, tone } = usePersonaStore();
  const { shortTerm, episodic } = useMemoryStore();
  const { isLauncher } = useDeviceStore();
  const { currentTheme } = useThemeStore();

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
