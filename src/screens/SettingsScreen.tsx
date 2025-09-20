import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeviceStore } from '../store/device';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';
import { useThemeStore } from '../store/theme';
import SettingsSection from './components/SettingsSection';
import SettingsItem from './components/SettingsItem';
import AppSettingsManager from '../../components/AppSettingsManager';

export default function SettingsScreen() {
    const [navigation, setNavigation] = useState<any>(null);

    useEffect(() => {
        const loadNavigation = async () => {
            const { useNavigation } = await import('@react-navigation/native');
            setNavigation(useNavigation());
        };
        loadNavigation();
    }, []);

    const {
        settings,
        permissions,
        updateSettings,
        setPermission,
        isLauncher,
        setLauncherMode
    } = useDeviceStore();

    const { personality, setPersonality, clearEmotionHistory } = usePersonaStore();
    const { clearShortTerm } = useMemoryStore();

    const [showPersonalityModal, setShowPersonalityModal] = useState(false);

    const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
        updateSettings({ theme });
    };

    const handleLanguageChange = () => {
        Alert.alert(
            'Language Settings',
            'Language selection will be available in a future update.',
            [{ text: 'OK' }]
        );
    };

    const handlePersonalityChange = (newPersonality: string) => {
        setPersonality(newPersonality);
        setShowPersonalityModal(false);
        Alert.alert(
            'Personality Updated',
            `Sallie's personality has been updated to ${newPersonality.replace('_', ' ')}.`,
            [{ text: 'OK' }]
        );
    };

    const handleClearData = (type: 'memories' | 'emotions' | 'all') => {
        const actions = {
            memories: {
                title: 'Clear Memories',
                message: 'This will clear all short-term memories. Are you sure?',
                action: clearShortTerm,
            },
            emotions: {
                title: 'Clear Emotion History',
                message: 'This will clear all emotional history. Are you sure?',
                action: () => clearEmotionHistory?.(),
            },
            all: {
                title: 'Reset All Data',
                message: 'This will reset all data including memories, emotions, and settings. Are you sure?',
                action: () => {
                    clearShortTerm();
                    clearEmotionHistory?.();
                    updateSettings({
                        autoLaunch: true,
                        keepAwake: false,
                        batteryOptimization: false,
                        theme: 'auto',
                        language: 'en',
                        timezone: 'UTC',
                    });
                },
            },
        };

        const config = actions[type];

        Alert.alert(
            config.title,
            config.message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: config.action,
                },
            ]
        );
    };

    const personalityOptions = [
        {
            id: 'tough_love_soul_care',
            name: 'Tough Love & Soul Care',
            description: 'Honest, caring, and supportive with a firm but loving approach',
        },
        {
            id: 'gentle_companion',
            name: 'Gentle Companion',
            description: 'Soft, nurturing, and always understanding',
        },
        {
            id: 'wise_mentor',
            name: 'Wise Mentor',
            description: 'Knowledgeable, thoughtful, and guidance-focused',
        },
        {
            id: 'playful_friend',
            name: 'Playful Friend',
            description: 'Fun, energetic, and always ready for adventure',
        },
        {
            id: 'professional_assistant',
            name: 'Professional Assistant',
            description: 'Efficient, organized, and task-oriented',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                    <Text style={styles.subtitle}>Customize your Sallie experience</Text>
                </View>

                {/* Quick Navigation */}
                <SettingsSection title="Account & Data" icon="👤">
                    <SettingsItem
                        title="User Profile"
                        subtitle="Manage your personal information and avatar"
                        type="button"
                        onPress={() => navigation?.navigate('Profile' as never)}
                    />

                    <SettingsItem
                        title="Data Management"
                        subtitle="Export, import, and backup your data"
                        type="button"
                        onPress={() => navigation?.navigate('DataManagement' as never)}
                    />
                </SettingsSection>

                {/* Launcher Settings */}
                <SettingsSection title="Launcher" icon="🏠">
                    <SettingsItem
                        title="Enable Launcher Mode"
                        subtitle="Use Sallie as your default home screen"
                        type="switch"
                        value={isLauncher}
                        onValueChange={setLauncherMode}
                    />

                    <SettingsItem
                        title="Auto Launch"
                        subtitle="Automatically start when device boots"
                        type="switch"
                        value={settings.autoLaunch}
                        onValueChange={(value) => updateSettings({ autoLaunch: value })}
                        disabled={!isLauncher}
                    />

                    <SettingsItem
                        title="Keep Awake"
                        subtitle="Prevent screen from sleeping"
                        type="switch"
                        value={settings.keepAwake}
                        onValueChange={(value) => updateSettings({ keepAwake: value })}
                    />

                    <SettingsItem
                        title="Battery Optimization"
                        subtitle="Ignore battery optimization for background operation"
                        type="switch"
                        value={settings.batteryOptimization}
                        onValueChange={(value) => updateSettings({ batteryOptimization: value })}
                    />
                </SettingsSection>

                {/* Personality Settings */}
                <SettingsSection title="Personality" icon="🤖">
                    <SettingsItem
                        title="Personality Type"
                        subtitle={personality.replace('_', ' ')}
                        type="button"
                        onPress={() => setShowPersonalityModal(true)}
                    />
                </SettingsSection>

                {/* Appearance Settings */}
                <SettingsSection title="Appearance" icon="🎨">
                    <SettingsItem
                        title="Theme"
                        subtitle={settings.theme}
                        type="selector"
                        options={[
                            { label: 'Auto', value: 'auto' },
                            { label: 'Dark', value: 'dark' },
                            { label: 'Light', value: 'light' },
                        ]}
                        value={settings.theme}
                        onValueChange={handleThemeChange}
                    />

                    <SettingsItem
                        title="Language"
                        subtitle={settings.language.toUpperCase()}
                        type="button"
                        onPress={handleLanguageChange}
                    />
                </SettingsSection>

                {/* Permissions */}
                <SettingsSection title="Permissions" icon="🔒">
                    <SettingsItem
                        title="Camera"
                        subtitle="Allow camera access for photos and video"
                        type="switch"
                        value={permissions.camera}
                        onValueChange={(value) => setPermission('camera', value)}
                    />

                    <SettingsItem
                        title="Microphone"
                        subtitle="Allow microphone access for voice input"
                        type="switch"
                        value={permissions.microphone}
                        onValueChange={(value) => setPermission('microphone', value)}
                    />

                    <SettingsItem
                        title="Location"
                        subtitle="Allow location access for location-based features"
                        type="switch"
                        value={permissions.location}
                        onValueChange={(value) => setPermission('location', value)}
                    />

                    <SettingsItem
                        title="Contacts"
                        subtitle="Allow access to contacts for communication features"
                        type="switch"
                        value={permissions.contacts}
                        onValueChange={(value) => setPermission('contacts', value)}
                    />

                    <SettingsItem
                        title="Notifications"
                        subtitle="Allow notifications from Sallie"
                        type="switch"
                        value={permissions.notifications}
                        onValueChange={(value) => setPermission('notifications', value)}
                    />

                    <SettingsItem
                        title="Storage"
                        subtitle="Allow storage access for file management"
                        type="switch"
                        value={permissions.storage}
                        onValueChange={(value) => setPermission('storage', value)}
                    />
                </SettingsSection>

                {/* Data Management */}
                <SettingsSection title="Data Management" icon="💾">
                    <SettingsItem
                        title="Clear Short-term Memories"
                        subtitle="Remove all temporary memories"
                        type="button"
                        onPress={() => handleClearData('memories')}
                        destructive
                    />

                    <SettingsItem
                        title="Clear Emotion History"
                        subtitle="Remove all emotional tracking data"
                        type="button"
                        onPress={() => handleClearData('emotions')}
                        destructive
                    />

                    <SettingsItem
                        title="Reset All Data"
                        subtitle="Clear all data and reset to defaults"
                        type="button"
                        onPress={() => handleClearData('all')}
                        destructive
                    />
                </SettingsSection>

                {/* About */}
                <SettingsSection title="About" icon="ℹ️">
                    <SettingsItem
                        title="Version"
                        subtitle="1.0.0"
                        type="info"
                    />

                    <SettingsItem
                        title="Build"
                        subtitle="Sallie Sovereign - React Native Edition"
                        type="info"
                    />

                    <SettingsItem
                        title="Developer"
                        subtitle="Sallie Sovereign Team"
                        type="info"
                    />
                </SettingsSection>

                {/* Advanced Settings */}
                <SettingsSection title="Advanced Settings" icon="⚙️">
                    <View style={styles.advancedSettingsContainer}>
                        <AppSettingsManager
                            onSettingsUpdate={(settings: any) => {
                                console.log('Advanced settings updated:', settings);
                                // Here you could sync with existing stores or make API calls
                            }}
                        />
                    </View>
                </SettingsSection>
                <Modal
                    visible={showPersonalityModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowPersonalityModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Choose Personality</Text>
                                <TouchableOpacity onPress={() => setShowPersonalityModal(false)}>
                                    <Text style={styles.modalClose}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {personalityOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.personalityOption,
                                            personality === option.id && styles.selectedPersonality
                                        ]}
                                        onPress={() => handlePersonalityChange(option.id)}
                                    >
                                        <Text style={[
                                            styles.personalityName,
                                            personality === option.id && styles.selectedPersonalityText
                                        ]}>
                                            {option.name}
                                        </Text>
                                        <Text style={styles.personalityDescription}>
                                            {option.description}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#a0a0a0',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#16213e',
        borderRadius: 20,
        margin: 20,
        maxHeight: '80%',
        width: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    modalClose: {
        fontSize: 20,
        color: '#a0a0a0',
    },
    modalBody: {
        padding: 20,
    },
    personalityOption: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#1a1a2e',
    },
    selectedPersonality: {
        backgroundColor: '#0f3460',
    },
    personalityName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    selectedPersonalityText: {
        color: '#ffffff',
    },
    personalityDescription: {
        color: '#a0a0a0',
        fontSize: 14,
    },
    advancedSettingsContainer: {
        marginTop: 10,
    },
});
