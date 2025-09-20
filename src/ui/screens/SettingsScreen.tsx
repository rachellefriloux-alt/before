/*
 * Sallie AI Settings Screen Component
 * Comprehensive settings and profile management
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    Alert,
    TextInput,
    Modal,
    Dimensions,
    Image,
    Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../components/ThemeSystem';
import { getFontStyle } from '../components/FontManager';
import { usePressAnimation } from '../components/AnimationSystem';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MediaUpload, { UploadResult } from '../components/MediaUpload';

const { width, height } = Dimensions.get('window');

// Define styles outside component to avoid type issues
const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...getFontStyle(theme.type, 'regular'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.text.secondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.m,
    },
    profileSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: theme.spacing.m,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEditButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        ...getFontStyle(theme.type, 'medium'),
        fontSize: theme.typography.sizes.subtitle,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    profileEmail: {
        ...getFontStyle(theme.type, 'regular'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.text.secondary,
    },
    profileBio: {
        ...getFontStyle(theme.type, 'regular'),
        fontSize: theme.typography.sizes.caption,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
    },
    editButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.medium,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
    },
    editButtonText: {
        ...getFontStyle(theme.type, 'medium'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.onPrimary,
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.medium,
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.background,
    },
    sectionIcon: {
        marginRight: theme.spacing.s,
    },
    sectionTitle: {
        ...getFontStyle(theme.type, 'medium'),
        fontSize: theme.typography.sizes.subtitle,
        color: theme.colors.text.primary,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        ...getFontStyle(theme.type, 'regular'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.text.primary,
    },
    settingSubtitle: {
        ...getFontStyle(theme.type, 'regular'),
        fontSize: theme.typography.sizes.caption,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        ...getFontStyle(theme.type, 'regular'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.text.secondary,
        marginRight: theme.spacing.s,
    },
    dangerButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.m,
        alignItems: 'center',
        marginTop: theme.spacing.m,
    },
    dangerButtonText: {
        ...getFontStyle(theme.type, 'medium'),
        fontSize: theme.typography.sizes.body1,
        color: '#FFFFFF',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.large,
        padding: theme.spacing.l,
        margin: theme.spacing.l,
        width: width - theme.spacing.l * 2,
        maxHeight: height * 0.8,
    },
    modalTitle: {
        ...getFontStyle(theme.type, 'medium'),
        fontSize: theme.typography.sizes.subtitle,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.m,
        ...getFontStyle(theme.type, 'regular'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
    },
    modalTextArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.medium,
        alignItems: 'center',
        marginHorizontal: theme.spacing.xs,
    },
    cancelButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        ...getFontStyle(theme.type, 'medium'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.text.primary,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
    },
    confirmButtonText: {
        ...getFontStyle(theme.type, 'medium'),
        fontSize: theme.typography.sizes.body1,
        color: theme.colors.onPrimary,
    },
});

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    preferences: {
        notifications: boolean;
        soundEffects: boolean;
        hapticFeedback: boolean;
        autoSave: boolean;
        darkMode: boolean;
        language: string;
        timezone: string;
    };
    stats: {
        joinDate: string;
        totalSessions: number;
        totalInteractions: number;
        favoriteFeatures: string[];
    };
}

export interface AppSettings {
    version: string;
    buildNumber: string;
    cacheSize: number;
    dataUsage: number;
    privacy: {
        analytics: boolean;
        crashReporting: boolean;
        dataSharing: boolean;
    };
    advanced: {
        debugMode: boolean;
        experimentalFeatures: boolean;
        performanceMode: boolean;
    };
}

interface SettingsScreenProps {
    onProfileUpdate?: (profile: UserProfile) => void;
    onSettingsUpdate?: (settings: AppSettings) => void;
    onLogout?: () => void;
    onExportData?: () => void;
    onImportData?: () => void;
    style?: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
    onProfileUpdate,
    onSettingsUpdate,
    onLogout,
    onExportData,
    onImportData,
    style,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profileData = await AsyncStorage.getItem('user_profile');
            const settingsData = await AsyncStorage.getItem('app_settings');

            if (profileData) {
                const parsedProfile = JSON.parse(profileData);
                setProfile(parsedProfile);
                setEditForm(parsedProfile);
            } else {
                // Create default profile
                const defaultProfile: UserProfile = {
                    id: Date.now().toString(),
                    name: 'User',
                    email: '',
                    bio: '',
                    preferences: {
                        notifications: true,
                        soundEffects: true,
                        hapticFeedback: true,
                        autoSave: true,
                        darkMode: false,
                        language: 'en',
                        timezone: 'UTC',
                    },
                    stats: {
                        joinDate: new Date().toISOString(),
                        totalSessions: 0,
                        totalInteractions: 0,
                        favoriteFeatures: [],
                    },
                };
                setProfile(defaultProfile);
                setEditForm(defaultProfile);
                await AsyncStorage.setItem('user_profile', JSON.stringify(defaultProfile));
            }

            if (settingsData) {
                setSettings(JSON.parse(settingsData));
            } else {
                // Create default settings
                const defaultSettings: AppSettings = {
                    version: '1.0.0',
                    buildNumber: '1',
                    cacheSize: 0,
                    dataUsage: 0,
                    privacy: {
                        analytics: true,
                        crashReporting: true,
                        dataSharing: false,
                    },
                    advanced: {
                        debugMode: false,
                        experimentalFeatures: false,
                        performanceMode: false,
                    },
                };
                setSettings(defaultSettings);
                await AsyncStorage.setItem('app_settings', JSON.stringify(defaultSettings));
            }
        } catch (error) {
            console.error('Failed to load settings data:', error);
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    // Save profile
    const saveProfile = async () => {
        if (!profile) return;

        try {
            const updatedProfile = { ...profile, ...editForm };
            await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
            setProfile(updatedProfile);
            setEditingProfile(false);
            onProfileUpdate?.(updatedProfile);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Failed to save profile:', error);
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    // Save settings
    const saveSettings = async () => {
        if (!settings) return;

        try {
            await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
            onSettingsUpdate?.(settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    // Update profile preference
    const updateProfilePreference = (key: keyof UserProfile['preferences'], value: any) => {
        if (!profile) return;

        const updatedProfile = {
            ...profile,
            preferences: {
                ...profile.preferences,
                [key]: value,
            },
        };
        setProfile(updatedProfile);
        setEditForm(prev => ({
            ...prev,
            preferences: {
                notifications: prev.preferences?.notifications ?? false,
                soundEffects: prev.preferences?.soundEffects ?? false,
                hapticFeedback: prev.preferences?.hapticFeedback ?? false,
                autoSave: prev.preferences?.autoSave ?? false,
                darkMode: prev.preferences?.darkMode ?? false,
                language: prev.preferences?.language ?? 'en',
                timezone: prev.preferences?.timezone ?? 'UTC',
                [key]: value,
            },
        }));
        saveProfile();
    };

    // Update app setting
    const updateAppSetting = (category: keyof AppSettings, key: string, value: any) => {
        if (!settings) return;

        const updatedSettings = {
            ...settings,
            [category]: {
                ...(settings as any)[category],
                [key]: value,
            },
        };
        setSettings(updatedSettings);
        if (onSettingsUpdate) {
            onSettingsUpdate(updatedSettings);
        }
    };
    // Helper to calculate cache size
    const calculateCacheSize = async (): Promise<number> => {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(key => key.startsWith('cache_'));
        let totalSize = 0;
        for (const key of cacheKeys) {
            const value = await AsyncStorage.getItem(key);
            if (value) {
                totalSize += new Blob([value]).size;
            }
        }
        return totalSize;
    };

    // Clear cache
    const clearCache = async () => {
        Alert.alert(
            'Clear Cache',
            'This will remove all cached data. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Clear AsyncStorage cache
                            const keys = await AsyncStorage.getAllKeys();
                            const cacheKeys = keys.filter(key => key.startsWith('cache_'));
                            await AsyncStorage.multiRemove(cacheKeys);

                            // Recalculate cache size
                            const newCacheSize = await calculateCacheSize();

                            // Update settings
                            if (settings) {
                                const updatedSettings = { ...settings, cacheSize: newCacheSize };
                                setSettings(updatedSettings);
                                await AsyncStorage.setItem('app_settings', JSON.stringify(updatedSettings));
                            }

                            Alert.alert('Success', 'Cache cleared successfully');
                        } catch (error) {
                            console.error('Failed to clear cache:', error);
                            Alert.alert('Error', 'Failed to clear cache');
                        }
                    },
                },
            ]
        );
    };

    // Reset to defaults
    const resetToDefaults = () => {
        Alert.alert(
            'Reset Settings',
            'This will reset all settings to default values. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('user_profile');
                            await AsyncStorage.removeItem('app_settings');
                            await loadData();
                            Alert.alert('Success', 'Settings reset to defaults');
                        } catch (error) {
                            console.error('Failed to reset settings:', error);
                            Alert.alert('Error', 'Failed to reset settings');
                        }
                    },
                },
            ]
        );
    };

    // Memoized SettingItem component to use hooks properly
    const renderSettingItem = (
        title: string,
        value: any,
        onPress?: () => void,
        rightComponent?: React.ReactNode,
        subtitle?: string
    ) => {
        const pressAnimation = usePressAnimation();
        const scaleAnim = React.useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                tension: 300,
                friction: 10,
                useNativeDriver: false,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: false,
            }).start();
        };

        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[styles.settingItem, pressAnimation.style]}
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={!onPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{title}</Text>
                        {subtitle && (
                            <Text style={styles.settingSubtitle}>{subtitle}</Text>
                        )}
                    </View>
                    <View style={styles.settingRight}>
                        {rightComponent || (
                            <Text style={styles.settingValue}>
                                {typeof value === 'boolean' ? (value ? 'On' : 'Off') : value}
                            </Text>
                        )}
                        {onPress && (
                            <Feather name="chevron-right" size={20} color={theme.colors.text.secondary} />
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderSectionHeader = (title: string, icon?: string) => (
        <View style={styles.sectionHeader}>
            {icon && (
                <MaterialIcons name={icon as any} size={20} color={theme.colors.primary} style={styles.sectionIcon} />
            )}
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, style]}>
                <Text style={styles.loadingText}>Loading settings...</Text>
            </View>
        );
    }

    const handleAvatarChange = async (results: UploadResult[]) => {
        if (results.length > 0 && profile) {
            try {
                const updatedProfile = {
                    ...profile,
                    avatar: results[0].uri,
                };

                setProfile(updatedProfile);
                setEditForm(prev => ({ ...prev, avatar: results[0].uri }));
                setShowAvatarPicker(false);

                await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
                onProfileUpdate?.(updatedProfile);

                // Optional feedback
                Alert.alert('Success', 'Avatar updated successfully');
            } catch (error) {
                console.error('Failed to update avatar:', error);
                Alert.alert('Error', 'Failed to update avatar');
            }
        }
    };

    return (
        <View style={[styles.container, style]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            {profile?.avatar ? (
                                <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }}>
                                        {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.avatarEditButton}
                                onPress={() => setShowAvatarPicker(true)}
                            >
                                <Feather name="camera" size={12} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
                            <Text style={styles.profileEmail}>{profile?.email || 'No email set'}</Text>
                            {profile?.bio && (
                                <Text style={styles.profileBio} numberOfLines={2}>
                                    {profile.bio}
                                </Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setEditingProfile(true)}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Preferences', 'settings')}
                    {renderSettingItem(
                        'Notifications',
                        profile?.preferences.notifications,
                        () => updateProfilePreference('notifications', !profile?.preferences.notifications),
                        <Switch
                            value={profile?.preferences.notifications}
                            onValueChange={(value) => updateProfilePreference('notifications', value)}
                            trackColor={{ false: theme.colors.border.medium, true: '#4CAF50' }}
                            thumbColor={profile?.preferences.notifications ? theme.colors.primary : '#FFFFFF'}
                        />
                    )}
                    {renderSettingItem(
                        'Sound Effects',
                        profile?.preferences.soundEffects,
                        () => updateProfilePreference('soundEffects', !profile?.preferences.soundEffects),
                        <Switch
                            value={profile?.preferences.soundEffects}
                            onValueChange={(value) => updateProfilePreference('soundEffects', value)}
                            trackColor={{ false: theme.colors.border.medium, true: '#4CAF50' }}
                            thumbColor={profile?.preferences.soundEffects ? theme.colors.primary : '#FFFFFF'}
                        />
                    )}
                    {renderSettingItem(
                        'Haptic Feedback',
                        profile?.preferences.hapticFeedback,
                        () => updateProfilePreference('hapticFeedback', !profile?.preferences.hapticFeedback),
                        <Switch
                            value={profile?.preferences.hapticFeedback}
                            onValueChange={(value) => updateProfilePreference('hapticFeedback', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={profile?.preferences.hapticFeedback ? theme.colors.primary : '#FFFFFF'}
                        />
                    )}
                    {renderSettingItem(
                        'Auto Save',
                        profile?.preferences.autoSave,
                        () => updateProfilePreference('autoSave', !profile?.preferences.autoSave),
                        <Switch
                            value={profile?.preferences.autoSave}
                            onValueChange={(value) => updateProfilePreference('autoSave', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={profile?.preferences.autoSave ? theme.colors.primary : '#FFFFFF'}
                        />
                    )}
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Privacy', 'security')}
                    {renderSettingItem(
                        'Analytics',
                        settings?.privacy.analytics,
                        () => updateAppSetting('privacy', 'analytics', !settings?.privacy.analytics),
                        <Switch
                            value={settings?.privacy.analytics}
                            onValueChange={(value) => updateAppSetting('privacy', 'analytics', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={settings?.privacy.analytics ? theme.colors.primary : '#FFFFFF'}
                        />,
                        'Help improve the app with usage data'
                    )}
                    {renderSettingItem(
                        'Crash Reporting',
                        settings?.privacy.crashReporting,
                        () => updateAppSetting('privacy', 'crashReporting', !settings?.privacy.crashReporting),
                        <Switch
                            value={settings?.privacy.crashReporting}
                            onValueChange={(value) => updateAppSetting('privacy', 'crashReporting', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={settings?.privacy.crashReporting ? theme.colors.primary : '#FFFFFF'}
                        />,
                        'Send crash reports to help fix issues'
                    )}
                    {renderSettingItem(
                        'Data Sharing',
                        settings?.privacy.dataSharing,
                        () => updateAppSetting('privacy', 'dataSharing', !settings?.privacy.dataSharing),
                        <Switch
                            value={settings?.privacy.dataSharing}
                            onValueChange={(value) => updateAppSetting('privacy', 'dataSharing', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={settings?.privacy.dataSharing ? theme.colors.primary : '#FFFFFF'}
                        />,
                        'Share data with third-party services'
                    )}
                </View>

                {/* Advanced Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Advanced', 'build')}
                    {renderSettingItem(
                        'Debug Mode',
                        settings?.advanced.debugMode,
                        () => updateAppSetting('advanced', 'debugMode', !settings?.advanced.debugMode),
                        <Switch
                            value={settings?.advanced.debugMode}
                            onValueChange={(value) => updateAppSetting('advanced', 'debugMode', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={settings?.advanced.debugMode ? theme.colors.primary : '#FFFFFF'}
                        />,
                        'Enable debug logging and features'
                    )}
                    {renderSettingItem(
                        'Experimental Features',
                        settings?.advanced.experimentalFeatures,
                        () => updateAppSetting('advanced', 'experimentalFeatures', !settings?.advanced.experimentalFeatures),
                        <Switch
                            value={settings?.advanced.experimentalFeatures}
                            onValueChange={(value) => updateAppSetting('advanced', 'experimentalFeatures', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={settings?.advanced.experimentalFeatures ? theme.colors.primary : '#FFFFFF'}
                        />,
                        'Try new features before they are released'
                    )}
                    {renderSettingItem(
                        'Performance Mode',
                        settings?.advanced.performanceMode,
                        () => updateAppSetting('advanced', 'performanceMode', !settings?.advanced.performanceMode),
                        <Switch
                            value={settings?.advanced.performanceMode}
                            onValueChange={(value) => updateAppSetting('advanced', 'performanceMode', value)}
                            trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                            thumbColor={settings?.advanced.performanceMode ? theme.colors.primary : '#FFFFFF'}
                        />,
                        'Optimize for better performance'
                    )}
                    {renderSettingItem(
                        'Clear Cache',
                        `${(settings?.cacheSize || 0) / (1024 * 1024)} MB`,
                        clearCache,
                        null,
                        'Remove cached data to free up space'
                    )}
                </View>

                {/* Data Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Data', 'storage')}
                    {renderSettingItem(
                        'Export Data',
                        '',
                        onExportData,
                        <Feather name="download" size={20} color={theme.colors.primary} />
                    )}
                    {renderSettingItem(
                        'Import Data',
                        '',
                        onImportData,
                        <Feather name="upload" size={20} color={theme.colors.primary} />
                    )}
                    {renderSettingItem(
                        'Reset to Defaults',
                        '',
                        resetToDefaults,
                        <Feather name="refresh-ccw" size={20} color="#FF6B6B" />
                    )}
                </View>

                {/* App Info Section */}
                <View style={styles.section}>
                    {renderSectionHeader('About', 'info')}
                    {renderSettingItem('Version', settings?.version || '1.0.0')}
                    {renderSettingItem('Build', settings?.buildNumber || '1')}
                    {renderSettingItem('Data Usage', `${(settings?.dataUsage || 0) / (1024 * 1024)} MB`)}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={() => {
                        Alert.alert(
                            'Logout',
                            'Are you sure you want to logout?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Logout', style: 'destructive', onPress: onLogout },
                            ]
                        );
                    }}
                >
                    <Text style={styles.dangerButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={editingProfile}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditingProfile(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Name"
                            placeholderTextColor={theme.colors.text.secondary}
                            value={editForm.name || ''}
                            onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                        />

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Email"
                            placeholderTextColor={theme.colors.text.secondary}
                            value={editForm.email || ''}
                            onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={[styles.modalInput, styles.modalTextArea]}
                            placeholder="Bio"
                            placeholderTextColor={theme.colors.text.secondary}
                            value={editForm.bio || ''}
                            onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                            multiline={true}
                            numberOfLines={3}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setEditingProfile(false);
                                    setEditForm(profile || {});
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={saveProfile}
                            >
                                <Text style={styles.confirmButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Avatar Picker Modal */}
            <Modal
                visible={showAvatarPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAvatarPicker(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Avatar</Text>
                        <MediaUpload
                            uploadType="image"
                            multiple={false}
                            // export default SettingsScreen; // Removed redundant default export
                            onUploadComplete={handleAvatarChange}
                            style={{ marginBottom: theme.spacing.m }}
                        />
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowAvatarPicker(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SettingsScreen;

