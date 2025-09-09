import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { EnhancedAvatar } from '@/components/EnhancedAvatar';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface CustomDrawerContentProps {
    [key: string]: any;
}

export default function CustomDrawerContent(props: CustomDrawerContentProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const [drawerComponents, setDrawerComponents] = useState<{
        DrawerContentScrollView: any;
        DrawerItemList: any;
    } | null>(null);

    useEffect(() => {
        // Dynamic import for drawer navigation to avoid CommonJS/ESM conflicts
        const loadDrawerComponents = async () => {
            try {
                const drawerModule = await import('@react-navigation/drawer');
                setDrawerComponents({
                    DrawerContentScrollView: drawerModule.DrawerContentScrollView,
                    DrawerItemList: drawerModule.DrawerItemList,
                });
            } catch (error) {
                console.error('Failed to load drawer components:', error);
            }
        };

        loadDrawerComponents();
    }, []);

    // Show loading while drawer components are being loaded
    if (!drawerComponents) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const { DrawerContentScrollView, DrawerItemList } = drawerComponents;

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={[
                styles.container,
                { backgroundColor: colors.surface, paddingTop: insets.top }
            ]}
        >
            {/* User Profile Section */}
            <View style={styles.profileSection}>
                <EnhancedAvatar
                    size="large"
                    source={{ initial: 'SU' }}
                    status="online"
                    style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>
                        Sallie User
                    </Text>
                    <Text style={[styles.userSubtitle, { color: colors.textSecondary }]}>
                        Growth Journey: Day 42
                    </Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                    <IconSymbol name="pencil" size={16} color={colors.tint} />
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsSection}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.tint }]}>15</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Milestones</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.tint }]}>7</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Challenges</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.tint }]}>23</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reflections</Text>
                </View>
            </View>

            {/* Navigation Items */}
            <View style={styles.navigationSection}>
                <DrawerItemList {...props} />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <TouchableOpacity style={[styles.quickAction, { borderColor: colors.border }]}>
                    <IconSymbol name="bell.fill" size={20} color={colors.tint} />
                    <Text style={[styles.quickActionText, { color: colors.text }]}>Daily Reminder</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.quickAction, { borderColor: colors.border }]}>
                    <IconSymbol name="target" size={20} color={colors.tint} />
                    <Text style={[styles.quickActionText, { color: colors.text }]}>Set Goal</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.quickAction, { borderColor: colors.border }]}>
                    <IconSymbol name="heart.fill" size={20} color={colors.tint} />
                    <Text style={[styles.quickActionText, { color: colors.text }]}>Check In</Text>
                </TouchableOpacity>
            </View>

            {/* App Version */}
            <View style={styles.footer}>
                <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                    Sallie AI v1.0.0
                </Text>
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    avatar: {
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'SpaceMono',
        marginBottom: 2,
    },
    userSubtitle: {
        fontSize: 14,
        fontFamily: 'SpaceMono',
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'SpaceMono',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'SpaceMono',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    navigationSection: {
        flex: 1,
        paddingTop: 8,
    },
    quickActionsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    quickActionText: {
        fontSize: 16,
        fontFamily: 'SpaceMono',
        marginLeft: 12,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        fontFamily: 'SpaceMono',
    },
});
