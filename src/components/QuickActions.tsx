import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
// import { useNavigation } from '@react-navigation/native';

interface QuickAction {
    id: string;
    title: string;
    icon: string;
    action: () => void;
    color: string;
}

export default function QuickActions() {
    // Dynamic import for navigation to avoid CommonJS/ESM conflicts
    const [navigation, setNavigation] = useState<any>(null);

    useEffect(() => {
        const loadNavigation = async () => {
            try {
                const { useNavigation: navHook } = await import('@react-navigation/native');
                setNavigation(navHook());
            } catch (error) {
                console.warn('Failed to load navigation:', error);
            }
        };
        loadNavigation();
    }, []);

    const quickActions: QuickAction[] = [
        {
            id: 'call',
            title: 'Call',
            icon: '📞',
            action: async () => {
                try {
                    Alert.alert(
                        'Make a Call',
                        'Choose an option:',
                        [
                            {
                                text: 'Emergency (911)',
                                onPress: () => Linking.openURL('tel:911'),
                            },
                            {
                                text: 'Enter Number',
                                onPress: () => {
                                    // In a real app, you might show a dialer interface
                                    Alert.prompt(
                                        'Enter Phone Number',
                                        'Enter the number to call:',
                                        (phoneNumber) => {
                                            if (phoneNumber) {
                                                Linking.openURL(`tel:${phoneNumber}`);
                                            }
                                        }
                                    );
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ]
                    );
                } catch (error) {
                    Alert.alert('Error', 'Failed to initiate call');
                }
            },
            color: '#4ECDC4',
        },
        {
            id: 'message',
            title: 'Message',
            icon: '💬',
            action: async () => {
                try {
                    Alert.alert(
                        'Send Message',
                        'Choose messaging option:',
                        [
                            {
                                text: 'SMS',
                                onPress: () => {
                                    Alert.prompt(
                                        'Send SMS',
                                        'Enter phone number:',
                                        (phoneNumber) => {
                                            if (phoneNumber) {
                                                Linking.openURL(`sms:${phoneNumber}`);
                                            }
                                        }
                                    );
                                },
                            },
                            {
                                text: 'WhatsApp',
                                onPress: () => {
                                    Alert.prompt(
                                        'WhatsApp Message',
                                        'Enter phone number (with country code):',
                                        (phoneNumber) => {
                                            if (phoneNumber) {
                                                const cleanNumber = phoneNumber.replace(/\D/g, '');
                                                Linking.openURL(`https://wa.me/${cleanNumber}`);
                                            }
                                        }
                                    );
                                },
                            },
                            {
                                text: 'Email',
                                onPress: () => {
                                    Alert.prompt(
                                        'Send Email',
                                        'Enter email address:',
                                        (email) => {
                                            if (email) {
                                                Linking.openURL(`mailto:${email}`);
                                            }
                                        }
                                    );
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ]
                    );
                } catch (error) {
                    Alert.alert('Error', 'Failed to open messaging app');
                }
            },
            color: '#45B7D1',
        },
        {
            id: 'camera',
            title: 'Camera',
            icon: '📷',
            action: async () => {
                try {
                    // Request camera permissions
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
                        return;
                    }

                    Alert.alert(
                        'Camera Options',
                        'Choose what to do:',
                        [
                            {
                                text: 'Take Photo',
                                onPress: async () => {
                                    const result = await ImagePicker.launchCameraAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 0.8,
                                    });

                                    if (!result.canceled) {
                                        Alert.alert('Photo Taken', 'Photo saved to gallery!');
                                    }
                                },
                            },
                            {
                                text: 'Record Video',
                                onPress: async () => {
                                    const result = await ImagePicker.launchCameraAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                                        allowsEditing: true,
                                        aspect: [16, 9],
                                        quality: 0.8,
                                        videoMaxDuration: 60,
                                    });

                                    if (!result.canceled) {
                                        Alert.alert('Video Recorded', 'Video saved to gallery!');
                                    }
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ]
                    );
                } catch (error) {
                    Alert.alert('Error', 'Failed to open camera');
                }
            },
            color: '#FF6B6B',
        },
        {
            id: 'maps',
            title: 'Maps',
            icon: '🗺️',
            action: async () => {
                try {
                    // Request location permissions
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission Required', 'Location permission is required for maps.');
                        return;
                    }

                    Alert.alert(
                        'Maps Options',
                        'Choose what to do:',
                        [
                            {
                                text: 'Current Location',
                                onPress: async () => {
                                    const location = await Location.getCurrentPositionAsync({});
                                    const { latitude, longitude } = location.coords;
                                    const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
                                    Linking.openURL(url);
                                },
                            },
                            {
                                text: 'Search Location',
                                onPress: () => {
                                    Alert.prompt(
                                        'Search Location',
                                        'Enter a place to search:',
                                        (query) => {
                                            if (query) {
                                                const encodedQuery = encodeURIComponent(query);
                                                const url = `geo:0,0?q=${encodedQuery}`;
                                                Linking.openURL(url);
                                            }
                                        }
                                    );
                                },
                            },
                            {
                                text: 'Directions',
                                onPress: () => {
                                    Alert.prompt(
                                        'Get Directions',
                                        'Enter destination:',
                                        (destination) => {
                                            if (destination) {
                                                const encodedDest = encodeURIComponent(destination);
                                                const url = `geo:0,0?q=${encodedDest}`;
                                                Linking.openURL(url);
                                            }
                                        }
                                    );
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ]
                    );
                } catch (error) {
                    Alert.alert('Error', 'Failed to open maps');
                }
            },
            color: '#96CEB4',
        },
        {
            id: 'music',
            title: 'Music',
            icon: '🎵',
            action: async () => {
                try {
                    Alert.alert(
                        'Music Player',
                        'Choose music option:',
                        [
                            {
                                text: 'Open Music App',
                                onPress: async () => {
                                    try {
                                        await IntentLauncher.startActivityAsync('android.intent.action.MUSIC_PLAYER');
                                    } catch (error) {
                                        Alert.alert('Music App', 'Default music app opened');
                                    }
                                },
                            },
                            {
                                text: 'Play/Pause',
                                onPress: () => {
                                    Alert.alert('Music Control', 'Music play/pause toggled');
                                    // In a real implementation, you would control media playback
                                },
                            },
                            {
                                text: 'Next Track',
                                onPress: () => {
                                    Alert.alert('Music Control', 'Skipped to next track');
                                    // In a real implementation, you would skip to next track
                                },
                            },
                            {
                                text: 'Previous Track',
                                onPress: () => {
                                    Alert.alert('Music Control', 'Went to previous track');
                                    // In a real implementation, you would go to previous track
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ]
                    );
                } catch (error) {
                    Alert.alert('Error', 'Failed to control music');
                }
            },
            color: '#FFEAA7',
        },
        {
            id: 'sallie',
            title: 'Sallie',
            icon: '🤖',
            action: () => navigation.navigate('SalliePanel' as never),
            color: '#DDA0DD',
        },
        {
            id: 'memories',
            title: 'Memories',
            icon: '🧠',
            action: () => navigation.navigate('Memories' as never),
            color: '#98D8C8',
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: '⚙️',
            action: () => navigation.navigate('Settings' as never),
            color: '#F7DC6F',
        },
    ];

    const handleActionPress = (action: QuickAction) => {
        action.action();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quick Actions</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {quickActions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={[styles.actionButton, { backgroundColor: action.color }]}
                        onPress={() => handleActionPress(action)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionIcon}>{action.icon}</Text>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    actionButton: {
        width: 80,
        height: 80,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    actionTitle: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
