/*
 * Sallie AI Profile Screen
 * User profile management screen with avatar, personal info, and statistics
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../../store/theme';
import UserProfileManager from '../../components/UserProfileManager';

export default function ProfileScreen() {
    const { currentTheme } = useThemeStore();

    const handleProfileUpdate = (profile: any) => {
        console.log('Profile updated:', profile);
        // Here you could dispatch to a store or make API calls
    };

    const handleAvatarUpdate = (avatarUri: string) => {
        console.log('Avatar updated:', avatarUri);
        // Here you could upload the avatar to a server
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
            <StatusBar
                style={currentTheme.name.includes('light') ? 'dark' : 'light'}
                backgroundColor={currentTheme.colors.background}
            />

            <UserProfileManager
                onProfileUpdate={handleProfileUpdate}
                onAvatarUpdate={handleAvatarUpdate}
                style={styles.profileManager}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileManager: {
        flex: 1,
    },
});
