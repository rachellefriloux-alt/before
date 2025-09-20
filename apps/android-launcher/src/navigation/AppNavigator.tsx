/*
 * Sallie Sovereign - App Navigator
 * Main navigation structure for the Sallie AI launcher
 */

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import SalliePanelScreen from '../screens/SalliePanelScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PersonalityScreen from '../screens/PersonalityScreen';
import MemoryScreen from '../screens/MemoryScreen';
import DeviceControlScreen from '../screens/DeviceControlScreen';

// Custom Drawer Content
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Sallie') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Personality') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Memory') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Device') {
            iconName = focused ? 'phone-portrait' : 'phone-portrait-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Sallie" 
        component={SalliePanelScreen} 
        options={{ title: 'Chat with Sallie' }}
      />
      <Tab.Screen 
        name="Personality" 
        component={PersonalityScreen}
        options={{ title: 'Personality' }}
      />
      <Tab.Screen 
        name="Memory" 
        component={MemoryScreen}
        options={{ title: 'Memories' }}
      />
      <Tab.Screen 
        name="Device" 
        component={DeviceControlScreen}
        options={{ title: 'Device Control' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#1F2937',
          width: 280,
        },
        drawerActiveTintColor: '#6366F1',
        drawerInactiveTintColor: '#9CA3AF',
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ 
          title: 'Sallie Sovereign',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}