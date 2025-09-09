import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useTheme } from '@/components/ThemeSystem';
import { ToastProvider } from '@/components/ToastNotification';

export default function DrawerLayout() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { theme } = useTheme();

    return (
        <ToastProvider>
            <Drawer
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.surface,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border.medium,
                    },
                    headerTintColor: theme.colors.text.primary,
                    headerTitleStyle: {
                        fontFamily: 'SpaceMono',
                        fontSize: 18,
                        fontWeight: '600',
                    },
                    drawerStyle: {
                        backgroundColor: colors.surface,
                        width: 280,
                    },
                    drawerActiveTintColor: colors.tint,
                    drawerInactiveTintColor: colors.textSecondary,
                    drawerActiveBackgroundColor: colors.tint + '15', // 15% opacity
                    drawerLabelStyle: {
                        fontFamily: 'SpaceMono',
                        fontSize: 16,
                        fontWeight: '500',
                        marginLeft: -8,
                    },
                }}
                drawerContent={(props: any) => <CustomDrawerContent {...props} />}
            >
                {/* Main Navigation */}
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        title: 'Home',
                        drawerLabel: 'Home',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="house.fill" size={size} color={color} />
                        ),
                    }}
                />                    {/* AI Features */}
                <Drawer.Screen
                    name="ai-chat"
                    options={{
                        title: 'AI Companion',
                        drawerLabel: 'AI Companion',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="brain" size={size} color={color} />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="emotional-support"
                    options={{
                        title: 'Emotional Support',
                        drawerLabel: 'Emotional Support',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="heart.fill" size={size} color={color} />
                        ),
                    }}
                />

                {/* User Features */}
                <Drawer.Screen
                    name="profile"
                    options={{
                        title: 'My Profile',
                        drawerLabel: 'My Profile',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="person.circle.fill" size={size} color={color} />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="achievements"
                    options={{
                        title: 'Achievements',
                        drawerLabel: 'Achievements',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="trophy.fill" size={size} color={color} />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="journal"
                    options={{
                        title: 'Growth Journal',
                        drawerLabel: 'Growth Journal',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="book.fill" size={size} color={color} />
                        ),
                    }}
                />

                {/* Settings & Support */}
                <Drawer.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        drawerLabel: 'Settings',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="gear" size={size} color={color} />
                        ),
                    }}
                />

                <Drawer.Screen
                    name="help"
                    options={{
                        title: 'Help & Support',
                        drawerLabel: 'Help & Support',
                        drawerIcon: ({ color, size }: { color: string; size: number }) => (
                            <IconSymbol name="questionmark.circle.fill" size={size} color={color} />
                        ),
                    }}
                />

                {/* Custom Drawer Content */}
                <Drawer.Screen
                    name="drawer-content"
                    options={{
                        drawerLabel: () => null, // Hide from drawer
                        title: 'Drawer Content',
                        headerShown: false,
                    }}
                />
            </Drawer>
        </ToastProvider>
    );
}