/*
 * Sallie AI App Settings Component
 * Comprehensive settings management for notifications, privacy, and preferences
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Switch,
    TextInput,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export interface AppSettings {
    notifications: {
        enabled: boolean;
        conversationAlerts: boolean;
        dailyReminders: boolean;
        achievementNotifications: boolean;
        soundEnabled: boolean;
        vibrationEnabled: boolean;
    };
    privacy: {
        dataCollection: boolean;
        analyticsEnabled: boolean;
        crashReporting: boolean;
        locationAccess: boolean;
        microphoneAccess: boolean;
        cameraAccess: boolean;
    };
    preferences: {
        theme: 'default' | 'southernGrit' | 'graceGrind' | 'soulSweat' | 'mysticForest' | 'cyberNeon' | 'desertOasis' | 'aurora' | 'system';
        language: string;
        fontSize: 'small' | 'medium' | 'large';
        autoSave: boolean;
        offlineMode: boolean;
        highContrast: boolean;
    };
    data: {
        autoBackup: boolean;
        backupFrequency: 'daily' | 'weekly' | 'monthly';
        exportFormat: 'json' | 'csv' | 'pdf';
        clearCacheOnExit: boolean;
        maxStorageSize: number; // MB
    };
    accessibility: {
        screenReader: boolean;
        reduceMotion: boolean;
        largerText: boolean;
        voiceCommands: boolean;
    };
}

interface AppSettingsManagerProps {
    onSettingsUpdate?: (settings: AppSettings) => void;
    style?: any;
}

const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({
    onSettingsUpdate,
    style,
}) => {
    const { theme, changeTheme } = useTheme();
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cacheSize, setCacheSize] = useState(0);

    // Load settings
    useEffect(() => {
        loadSettings();
        calculateCacheSize();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const stored = await AsyncStorage.getItem('app_settings');
            if (stored) {
                const parsedSettings = JSON.parse(stored);
                setSettings(parsedSettings);
            } else {
                // Default settings
                const defaultSettings: AppSettings = {
                    notifications: {
                        enabled: true,
                        conversationAlerts: true,
                        dailyReminders: false,
                        achievementNotifications: true,
                        soundEnabled: true,
                        vibrationEnabled: true,
                    },
                    privacy: {
                        dataCollection: true,
                        analyticsEnabled: true,
                        crashReporting: true,
                        locationAccess: false,
                        microphoneAccess: true,
                        cameraAccess: true,
                    },
                    preferences: {
                        theme: 'default',
                        language: 'en',
                        fontSize: 'medium',
                        autoSave: true,
                        offlineMode: false,
                        highContrast: false,
                    },
                    data: {
                        autoBackup: true,
                        backupFrequency: 'weekly',
                        exportFormat: 'json',
                        clearCacheOnExit: false,
                        maxStorageSize: 500,
                    },
                    accessibility: {
                        screenReader: false,
                        reduceMotion: false,
                        largerText: false,
                        voiceCommands: false,
                    },
                };
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const calculateCacheSize = async () => {
        try {
            // In a real app, this would calculate actual cache size
            // For now, we'll simulate it
            const size = Math.floor(Math.random() * 100) + 10; // 10-110 MB
            setCacheSize(size);
        } catch (error) {
            console.error('Failed to calculate cache size:', error);
        }
    };

    const saveSettings = async (newSettings: AppSettings) => {
        try {
            setSaving(true);
            await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
            setSettings(newSettings);
            onSettingsUpdate?.(newSettings);

            // Apply theme change immediately
            if (newSettings.preferences.theme !== settings?.preferences.theme) {
                changeTheme(newSettings.preferences.theme);
            }

            Alert.alert('Success', 'Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = <K extends keyof AppSettings>(
        category: K,
        key: keyof AppSettings[K],
        value: any
    ) => {
        if (!settings) return;

        const newSettings = {
            ...settings,
            [category]: {
                ...settings[category],
                [key]: value,
            },
        };

        setSettings(newSettings);
        saveSettings(newSettings);
    };

    const clearCache = async () => {
        Alert.alert(
            'Clear Cache',
            'This will remove temporary files and cached data. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // In a real app, this would clear actual cache
                            setCacheSize(0);
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

    const exportData = async () => {
        if (!settings) return;

        try {
            const exportData = {
                settings,
                exportDate: new Date().toISOString(),
                version: '1.0.0',
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            // In a real app, this would save to file or share
            Alert.alert('Export Complete', `Data exported in ${settings.data.exportFormat.toUpperCase()} format`);
        } catch (error) {
            console.error('Failed to export data:', error);
            Alert.alert('Error', 'Failed to export data');
        }
    };

    const resetToDefaults = () => {
        Alert.alert(
            'Reset Settings',
            'This will reset all settings to their default values. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: loadSettings,
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                    Loading settings...
                </Text>
            </View>
        );
    }

    if (!settings) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    Failed to load settings
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                    onPress={loadSettings}
                >
                    <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
                        Retry
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, style]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Notifications Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="notifications" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Notifications
                    </Text>
                </View>

                <View style={styles.settingGroup}>
                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Enable Notifications
                        </Text>
                        <Switch
                            value={settings.notifications.enabled}
                            onValueChange={(value) => updateSetting('notifications', 'enabled', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>

                    {settings.notifications.enabled && (
                        <>
                            <View style={styles.settingItem}>
                                <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                                    Conversation Alerts
                                </Text>
                                <Switch
                                    value={settings.notifications.conversationAlerts}
                                    onValueChange={(value) => updateSetting('notifications', 'conversationAlerts', value)}
                                    trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                                    thumbColor={theme.colors.onPrimary}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                                    Daily Reminders
                                </Text>
                                <Switch
                                    value={settings.notifications.dailyReminders}
                                    onValueChange={(value) => updateSetting('notifications', 'dailyReminders', value)}
                                    trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                                    thumbColor={theme.colors.onPrimary}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                                    Achievement Notifications
                                </Text>
                                <Switch
                                    value={settings.notifications.achievementNotifications}
                                    onValueChange={(value) => updateSetting('notifications', 'achievementNotifications', value)}
                                    trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                                    thumbColor={theme.colors.onPrimary}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                                    Sound
                                </Text>
                                <Switch
                                    value={settings.notifications.soundEnabled}
                                    onValueChange={(value) => updateSetting('notifications', 'soundEnabled', value)}
                                    trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                                    thumbColor={theme.colors.onPrimary}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                                    Vibration
                                </Text>
                                <Switch
                                    value={settings.notifications.vibrationEnabled}
                                    onValueChange={(value) => updateSetting('notifications', 'vibrationEnabled', value)}
                                    trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                                    thumbColor={theme.colors.onPrimary}
                                />
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* Privacy Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="privacy-tip" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Privacy & Security
                    </Text>
                </View>

                <View style={styles.settingGroup}>
                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Data Collection
                        </Text>
                        <Switch
                            value={settings.privacy.dataCollection}
                            onValueChange={(value) => updateSetting('privacy', 'dataCollection', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Analytics
                        </Text>
                        <Switch
                            value={settings.privacy.analyticsEnabled}
                            onValueChange={(value) => updateSetting('privacy', 'analyticsEnabled', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Crash Reporting
                        </Text>
                        <Switch
                            value={settings.privacy.crashReporting}
                            onValueChange={(value) => updateSetting('privacy', 'crashReporting', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Location Access
                        </Text>
                        <Switch
                            value={settings.privacy.locationAccess}
                            onValueChange={(value) => updateSetting('privacy', 'locationAccess', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>
                </View>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Feather name="settings" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Preferences
                    </Text>
                </View>

                <View style={styles.settingGroup}>
                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Theme
                        </Text>
                        <View style={styles.pickerContainer}>
                            {(['default', 'southernGrit', 'graceGrind', 'soulSweat', 'mysticForest', 'cyberNeon', 'desertOasis', 'aurora', 'system'] as const).map((themeOption) => (
                                <TouchableOpacity
                                    key={themeOption}
                                    style={[
                                        styles.pickerOption,
                                        {
                                            backgroundColor: settings.preferences.theme === themeOption
                                                ? theme.colors.primary
                                                : theme.colors.surface,
                                            borderColor: theme.colors.primary,
                                        }
                                    ]}
                                    onPress={() => updateSetting('preferences', 'theme', themeOption)}
                                >
                                    <Text style={[
                                        styles.pickerOptionText,
                                        {
                                            color: settings.preferences.theme === themeOption
                                                ? theme.colors.onPrimary
                                                : theme.colors.text.primary,
                                        }
                                    ]}>
                                        {themeOption === 'southernGrit' ? 'Southern Grit' :
                                            themeOption === 'graceGrind' ? 'Grace & Grind' :
                                                themeOption === 'soulSweat' ? 'Soul Sweat' :
                                                    themeOption === 'mysticForest' ? 'Mystic Forest' :
                                                        themeOption === 'cyberNeon' ? 'Cyber Neon' :
                                                            themeOption === 'desertOasis' ? 'Desert Oasis' :
                                                                themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Font Size
                        </Text>
                        <View style={styles.pickerContainer}>
                            {(['small', 'medium', 'large'] as const).map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.pickerOption,
                                        {
                                            backgroundColor: settings.preferences.fontSize === size
                                                ? theme.colors.primary
                                                : theme.colors.surface,
                                            borderColor: theme.colors.primary,
                                        }
                                    ]}
                                    onPress={() => updateSetting('preferences', 'fontSize', size)}
                                >
                                    <Text style={[
                                        styles.pickerOptionText,
                                        {
                                            color: settings.preferences.fontSize === size
                                                ? theme.colors.onPrimary
                                                : theme.colors.text.primary,
                                        }
                                    ]}>
                                        {size.charAt(0).toUpperCase() + size.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Auto Save
                        </Text>
                        <Switch
                            value={settings.preferences.autoSave}
                            onValueChange={(value) => updateSetting('preferences', 'autoSave', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Offline Mode
                        </Text>
                        <Switch
                            value={settings.preferences.offlineMode}
                            onValueChange={(value) => updateSetting('preferences', 'offlineMode', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>
                </View>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="storage" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Data Management
                    </Text>
                </View>

                <View style={styles.settingGroup}>
                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Cache Size: {cacheSize} MB
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                            onPress={clearCache}
                        >
                            <Text style={[styles.actionButtonText, { color: theme.colors.onError }]}>
                                Clear Cache
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Auto Backup
                        </Text>
                        <Switch
                            value={settings.data.autoBackup}
                            onValueChange={(value) => updateSetting('data', 'autoBackup', value)}
                            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                            thumbColor={theme.colors.onPrimary}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                            Export Data
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            onPress={exportData}
                        >
                            <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                                Export
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Reset Section */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.resetButton, { borderColor: theme.colors.error }]}
                    onPress={resetToDefaults}
                >
                    <MaterialIcons name="restore" size={20} color={theme.colors.error} />
                    <Text style={[styles.resetButtonText, { color: theme.colors.error }]}>
                        Reset to Defaults
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    settingGroup: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 15,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    settingLabel: {
        fontSize: 16,
        flex: 1,
        marginRight: 10,
    },
    pickerContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    pickerOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    pickerOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 20,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default AppSettingsManager;
