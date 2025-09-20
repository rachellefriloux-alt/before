/*
 * Sallie AI User Profile Management Component
 * Comprehensive user profile with avatar, personal info, and settings
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    TextInput,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { OptimizedAvatar } from './ImageOptimizationSystem';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: string;
    location?: string;
    interests?: string[];
    preferences: {
        notifications: boolean;
        soundEffects: boolean;
        theme: string;
        language: string;
    };
    stats: {
        conversations: number;
        messages: number;
        daysActive: number;
    };
    createdAt: string;
    lastActive: string;
}

interface UserProfileManagerProps {
    userId?: string;
    onProfileUpdate?: (profile: UserProfile) => void;
    onAvatarUpdate?: (avatarUri: string) => void;
    style?: any;
}

const UserProfileManager: React.FC<UserProfileManagerProps> = ({
    userId = 'current_user',
    onProfileUpdate,
    onAvatarUpdate,
    style,
}) => {
    const { theme } = useTheme();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

    // Load user profile
    useEffect(() => {
        loadUserProfile();
    }, [userId]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            // In a real app, this would fetch from an API
            // For now, we'll create a default profile
            const defaultProfile: UserProfile = {
                id: userId,
                name: 'Sallie User',
                email: 'user@sallie-ai.com',
                bio: 'AI companion and conversation partner',
                location: 'Digital Realm',
                interests: ['AI', 'Technology', 'Conversation', 'Learning'],
                preferences: {
                    notifications: true,
                    soundEffects: true,
                    theme: 'default',
                    language: 'en',
                },
                stats: {
                    conversations: 42,
                    messages: 1250,
                    daysActive: 30,
                },
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date().toISOString(),
            };

            setProfile(defaultProfile);
            setEditedProfile(defaultProfile);
        } catch (error) {
            console.error('Failed to load profile:', error);
            Alert.alert('Error', 'Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        return cameraStatus === 'granted' && mediaStatus === 'granted';
    };

    const pickAvatar = async (fromCamera = false) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert(
                'Permissions Required',
                'Camera and media library permissions are required to change avatar.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            const result = fromCamera
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            if (!result.canceled && result.assets[0]) {
                const avatarUri = result.assets[0].uri;
                setEditedProfile(prev => ({ ...prev, avatar: avatarUri }));
                onAvatarUpdate?.(avatarUri);
            }
        } catch (error) {
            console.error('Avatar pick error:', error);
            Alert.alert('Error', 'Failed to pick avatar image');
        }
    };

    const saveProfile = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            const updatedProfile = { ...profile, ...editedProfile };

            // In a real app, this would save to an API
            setProfile(updatedProfile);
            setIsEditing(false);

            onProfileUpdate?.(updatedProfile);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Failed to save profile:', error);
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const togglePreference = (key: keyof UserProfile['preferences']) => {
        if (!profile) return;

        const currentValue = profile.preferences[key];
        const newValue = typeof currentValue === 'boolean' ? !currentValue : currentValue;

        setEditedProfile(prev => ({
            ...prev,
            preferences: {
                ...profile.preferences,
                ...prev.preferences,
                [key]: newValue,
            },
        }));
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                    Loading profile...
                </Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    Failed to load profile
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                    onPress={loadUserProfile}
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
            {/* Profile Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={() => isEditing && pickAvatar()}
                    disabled={!isEditing}
                >
                    <OptimizedAvatar
                        uri={editedProfile.avatar || profile.avatar}
                        size={80}
                        style={styles.avatar}
                    />
                    {isEditing && (
                        <View style={[styles.editOverlay, { backgroundColor: theme.colors.primary + '80' }]}>
                            <Feather name="camera" size={20} color={theme.colors.onPrimary} />
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={[styles.name, { color: theme.colors.text.primary }]}>
                        {editedProfile.name || profile.name}
                    </Text>
                    <Text style={[styles.email, { color: theme.colors.text.secondary }]}>
                        {editedProfile.email || profile.email}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => isEditing ? saveProfile() : setIsEditing(true)}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                    ) : (
                        <Feather
                            name={isEditing ? 'check' : 'edit-2'}
                            size={20}
                            color={theme.colors.onPrimary}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Avatar Change Options */}
            {isEditing && (
                <View style={styles.avatarOptions}>
                    <TouchableOpacity
                        style={[styles.avatarOption, { borderColor: theme.colors.primary }]}
                        onPress={() => pickAvatar(false)}
                    >
                        <Feather name="image" size={20} color={theme.colors.primary} />
                        <Text style={[styles.avatarOptionText, { color: theme.colors.primary }]}>
                            Gallery
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.avatarOption, { borderColor: theme.colors.primary }]}
                        onPress={() => pickAvatar(true)}
                    >
                        <Feather name="camera" size={20} color={theme.colors.primary} />
                        <Text style={[styles.avatarOptionText, { color: theme.colors.primary }]}>
                            Camera
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Profile Form */}
            <View style={styles.form}>
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Basic Information
                    </Text>

                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
                            Name
                        </Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.textInput, {
                                    color: theme.colors.text.primary,
                                    borderColor: theme.colors.primary,
                                    backgroundColor: theme.colors.surface,
                                }]}
                                value={editedProfile.name || ''}
                                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
                                placeholder="Enter your name"
                                placeholderTextColor={theme.colors.text.disabled}
                            />
                        ) : (
                            <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>
                                {profile.name}
                            </Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
                            Bio
                        </Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.textInput, styles.multilineInput, {
                                    color: theme.colors.text.primary,
                                    borderColor: theme.colors.primary,
                                    backgroundColor: theme.colors.surface,
                                }]}
                                value={editedProfile.bio || ''}
                                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
                                placeholder="Tell us about yourself"
                                placeholderTextColor={theme.colors.text.disabled}
                                multiline
                                numberOfLines={3}
                            />
                        ) : (
                            <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>
                                {profile.bio || 'No bio set'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
                            Location
                        </Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.textInput, {
                                    color: theme.colors.text.primary,
                                    borderColor: theme.colors.primary,
                                    backgroundColor: theme.colors.surface,
                                }]}
                                value={editedProfile.location || ''}
                                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, location: text }))}
                                placeholder="Your location"
                                placeholderTextColor={theme.colors.text.disabled}
                            />
                        ) : (
                            <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>
                                {profile.location || 'Not set'}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Preferences
                    </Text>

                    <View style={styles.preference}>
                        <Text style={[styles.preferenceLabel, { color: theme.colors.text.primary }]}>
                            Notifications
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.toggle,
                                {
                                    backgroundColor: (editedProfile.preferences?.notifications ?? profile.preferences.notifications)
                                        ? theme.colors.primary
                                        : theme.colors.surface,
                                    borderColor: theme.colors.primary,
                                }
                            ]}
                            onPress={() => togglePreference('notifications')}
                            disabled={!isEditing}
                        >
                            <View style={[
                                styles.toggleKnob,
                                {
                                    backgroundColor: theme.colors.onPrimary,
                                    transform: [{
                                        translateX: (editedProfile.preferences?.notifications ?? profile.preferences.notifications) ? 20 : 0
                                    }]
                                }
                            ]} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.preference}>
                        <Text style={[styles.preferenceLabel, { color: theme.colors.text.primary }]}>
                            Sound Effects
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.toggle,
                                {
                                    backgroundColor: (editedProfile.preferences?.soundEffects ?? profile.preferences.soundEffects)
                                        ? theme.colors.primary
                                        : theme.colors.surface,
                                    borderColor: theme.colors.primary,
                                }
                            ]}
                            onPress={() => togglePreference('soundEffects')}
                            disabled={!isEditing}
                        >
                            <View style={[
                                styles.toggleKnob,
                                {
                                    backgroundColor: theme.colors.onPrimary,
                                    transform: [{
                                        translateX: (editedProfile.preferences?.soundEffects ?? profile.preferences.soundEffects) ? 20 : 0
                                    }]
                                }
                            ]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Statistics */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Statistics
                    </Text>

                    <View style={styles.statsGrid}>
                        <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                                {profile.stats.conversations}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                                Conversations
                            </Text>
                        </View>

                        <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                                {profile.stats.messages}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                                Messages
                            </Text>
                        </View>

                        <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                                {profile.stats.daysActive}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                                Days Active
                            </Text>
                        </View>
                    </View>
                </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
    },
    editButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    avatarOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
    },
    avatarOptionText: {
        marginLeft: 8,
        fontSize: 16,
    },
    form: {
        flex: 1,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    field: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldValue: {
        fontSize: 16,
        lineHeight: 24,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    preferenceLabel: {
        fontSize: 16,
        flex: 1,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        padding: 2,
    },
    toggleKnob: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        marginHorizontal: 5,
        borderRadius: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
});

export default UserProfileManager;
