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
                />

                {/* AI Features */}
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
            </Drawer>
        </ToastProvider>
    );
}