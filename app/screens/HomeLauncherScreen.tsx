import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { usePersonaStore } from '../../store/persona';
import { useMemoryStore } from '../../store/memory';
import { useDeviceStore } from '../../store/device';
import { useThemeStore } from '../../store/theme';
import EnhancedSallieAvatar from '../components/EnhancedSallieAvatar';
import AdvancedVoiceInteraction from '../components/AdvancedVoiceInteraction';
import AppGrid from '../components/AppGrid';
import QuickActions from '../components/QuickActions';
import EmotionMeter from '../components/EmotionMeter';
import CameraVision from '../components/CameraVision';

const { width, height } = Dimensions.get('window');

export default function HomeLauncherScreen() {
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

    const { emotion, tone, mood, intensity } = usePersonaStore();
    const { shortTerm, episodic } = useMemoryStore();
    const { isLauncher, settings } = useDeviceStore();
    const { currentTheme, animations } = useThemeStore();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');
    const [showVoicePanel, setShowVoicePanel] = useState(false);
    const [showCameraVision, setShowCameraVision] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const fadeAnimation = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const hour = currentTime.getHours();
        if (hour < 12) {
            setGreeting('Good morning, love');
        } else if (hour < 17) {
            setGreeting('Good afternoon, sugar');
        } else {
            setGreeting('Good evening, honey');
        }
    }, [currentTime]);

    useEffect(() => {
        if (animations) {
            Animated.timing(fadeAnimation, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [currentTheme]);

    const handleSalliePress = () => {
        navigation.navigate('SalliePanel' as never);
    };

    const handleVoicePress = () => {
        setShowVoicePanel(!showVoicePanel);
    };

    const handleCameraPress = () => {
        setShowCameraVision(true);
    };

    const handleCameraClose = () => {
        setShowCameraVision(false);
    };

    const handleAppPress = async (appName: string) => {
        try {
            // Map app names to their package names or URLs
            const appMappings: { [key: string]: string } = {
                'phone': 'tel:',
                'messages': 'sms:',
                'camera': 'android.media.action.IMAGE_CAPTURE',
                'gallery': 'android.intent.action.PICK',
                'browser': 'https://www.google.com',
                'settings': 'android.settings.SETTINGS',
                'calculator': 'android.intent.action.MAIN',
                'calendar': 'android.intent.action.MAIN',
                'clock': 'android.intent.action.MAIN',
                'contacts': 'android.intent.action.VIEW',
                'email': 'mailto:',
                'maps': 'geo:0,0',
                'music': 'android.intent.action.MUSIC_PLAYER',
                'youtube': 'https://www.youtube.com',
                'whatsapp': 'https://wa.me/',
                'instagram': 'https://www.instagram.com',
                'facebook': 'https://www.facebook.com',
            };

            const appTarget = appMappings[appName.toLowerCase()];

            if (!appTarget) {
                Alert.alert('App Not Found', `Cannot launch ${appName}. App mapping not configured.`);
                return;
            }

            // Handle different types of launches
            if (appTarget.startsWith('https://') || appTarget.startsWith('tel:') || appTarget.startsWith('sms:') || appTarget.startsWith('mailto:') || appTarget.startsWith('geo:')) {
                // Use Linking for URLs and standard schemes
                const supported = await Linking.canOpenURL(appTarget);
                if (supported) {
                    await Linking.openURL(appTarget);
                } else {
                    Alert.alert('Cannot Open', `Unable to open ${appName}`);
                }
            } else {
                // Use IntentLauncher for Android intents
                try {
                    await IntentLauncher.startActivityAsync(appTarget);
                } catch (error) {
                    Alert.alert('Cannot Launch', `Unable to launch ${appName}. ${error}`);
                }
            }
        } catch (error) {
            console.error('Error launching app:', error);
            Alert.alert('Error', `Failed to launch ${appName}`);
        }
    };

    const handleVoiceStart = async () => {
        try {
            setIsListening(true);
            setTranscription('');
            setAiResponse('');

            // Request audio permissions
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Audio recording permission is required for voice interaction.');
                setIsListening(false);
                return;
            }

            // Start voice recognition (simulated for now)
            // In a real implementation, you would use a speech-to-text service
            Alert.alert('Voice Recognition', 'Voice recognition started. Say something...');

            // Simulate voice recognition delay
            setTimeout(() => {
                if (isListening) {
                    handleTranscription('Hello Sallie, how are you today?');
                }
            }, 2000);

        } catch (error) {
            console.error('Error starting voice recognition:', error);
            setIsListening(false);
            Alert.alert('Error', 'Failed to start voice recognition');
        }
    };

    const handleVoiceEnd = () => {
        setIsListening(false);
        // Stop voice recognition
        // In a real implementation, you would stop the speech recognition service
    };

    const handleTranscription = (text: string) => {
        setTranscription(text);
        setIsListening(false);

        // Process the transcription and generate AI response
        handleResponse(text);
    };

    const handleResponse = async (userInput: string) => {
        try {
            // Simulate AI processing
            setAiResponse('Processing your request...');

            // Simple response logic based on input
            let response = '';

            if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
                response = 'Hello! How can I help you today?';
            } else if (userInput.toLowerCase().includes('how are you')) {
                response = 'I\'m doing great, thank you for asking! How are you feeling?';
            } else if (userInput.toLowerCase().includes('time')) {
                response = `The current time is ${currentTime.toLocaleTimeString()}`;
            } else if (userInput.toLowerCase().includes('weather')) {
                response = 'I\'d love to help with weather information. Could you tell me your location?';
            } else if (userInput.toLowerCase().includes('remind')) {
                response = 'I can help you set a reminder. What would you like me to remind you about?';
            } else {
                response = `I heard you say: "${userInput}". How can I assist you with that?`;
            }

            setAiResponse(response);

            // Speak the response
            Speech.speak(response, {
                language: 'en',
                pitch: 1.0,
                rate: 0.8,
            });

        } catch (error) {
            console.error('Error processing AI response:', error);
            setAiResponse('Sorry, I encountered an error processing your request.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.background} />

            {/* Background Gradient */}
            <LinearGradient
                colors={currentTheme.gradients.background.length >= 2 ? currentTheme.gradients.background as readonly [string, string, ...string[]] : [currentTheme.colors.background, currentTheme.colors.surface] as readonly [string, string]}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Enhanced Header Section */}
                    <View style={styles.header}>
                        <View style={styles.timeSection}>
                            <Text style={[styles.time, { color: currentTheme.colors.text }]}>
                                {currentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </Text>
                            <Text style={[styles.date, { color: currentTheme.colors.textSecondary }]}>
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>

                        <View style={styles.avatarSection}>
                            <TouchableOpacity onPress={handleSalliePress} style={styles.sallieButton}>
                                <EnhancedSallieAvatar
                                    size={80}
                                    animated={animations}
                                    interactive={true}
                                    showEmotionRing={true}
                                    showPulse={intensity > 0.7}
                                    onPress={handleSalliePress}
                                    onLongPress={handleVoicePress}
                                />
                            </TouchableOpacity>
                            
                            {/* Camera Vision Button */}
                            <TouchableOpacity 
                                onPress={handleCameraPress} 
                                style={[styles.cameraButton, { backgroundColor: currentTheme.colors.accent }]}
                            >
                                <Ionicons 
                                    name="camera" 
                                    size={20} 
                                    color={currentTheme.colors.background} 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Enhanced Greeting Section */}
                    <View style={[styles.greetingSection, { backgroundColor: currentTheme.colors.surface }]}>
                        <Text style={[styles.greeting, { color: currentTheme.colors.text }]}>
                            {greeting}
                        </Text>
                        <Text style={[styles.subtitle, { color: currentTheme.colors.textSecondary }]}>
                            I'm here to help you conquer the day with grace and grit
                        </Text>
                        <View style={styles.emotionIndicator}>
                            <Text style={[styles.emotionText, { color: currentTheme.colors.accent }]}>
                                Feeling {emotion} • {Math.round(intensity * 100)}% intensity
                            </Text>
                        </View>
                    </View>

                    {/* Voice Interaction Panel */}
                    {showVoicePanel && (
                        <View style={[styles.voicePanel, { backgroundColor: currentTheme.colors.card }]}>
                            <AdvancedVoiceInteraction
                                onVoiceStart={handleVoiceStart}
                                onVoiceEnd={handleVoiceEnd}
                                onTranscription={handleTranscription}
                                onResponse={handleResponse}
                            />
                        </View>
                    )}

                    {/* Enhanced Emotion Meter */}
                    <View style={[styles.emotionSection, { backgroundColor: currentTheme.colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                            Emotional State
                        </Text>
                        <EmotionMeter />
                    </View>

                    {/* Enhanced Quick Actions */}
                    <View style={[styles.quickActionsSection, { backgroundColor: currentTheme.colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                            Quick Actions
                        </Text>
                        <QuickActions />
                    </View>

                    {/* Enhanced App Grid */}
                    <View style={[styles.appGridSection, { backgroundColor: currentTheme.colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                            Your Apps
                        </Text>
                        <AppGrid onAppPress={handleAppPress} />
                    </View>

                    {/* Enhanced Memory Summary */}
                    <View style={[styles.memorySection, { backgroundColor: currentTheme.colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                            Recent Memories
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {shortTerm.slice(-5).map((memory) => (
                                <LinearGradient
                                    key={memory.id}
                                    colors={[currentTheme.colors.card, currentTheme.colors.surface]}
                                    style={styles.memoryCard}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={[styles.memoryContent, { color: currentTheme.colors.text }]} numberOfLines={2}>
                                        {memory.content}
                                    </Text>
                                    <Text style={[styles.memoryTime, { color: currentTheme.colors.textSecondary }]}>
                                        {new Date(memory.timestamp).toLocaleTimeString()}
                                    </Text>
                                    <View style={[styles.memoryEmotionBadge, { backgroundColor: currentTheme.colors.accent }]}>
                                        <Text style={[styles.memoryEmotion, { color: currentTheme.colors.background }]}>
                                            {memory.emotion}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Camera Vision Modal */}
            <Modal
                visible={showCameraVision}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <CameraVision 
                    onClose={handleCameraClose}
                    embedded={false}
                />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    timeSection: {
        alignItems: 'flex-start',
    },
    time: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    date: {
        fontSize: 16,
        marginTop: 5,
        opacity: 0.8,
    },
    avatarSection: {
        alignItems: 'center',
        position: 'relative',
    },
    sallieButton: {
        padding: 5,
    },
    cameraButton: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    greetingSection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 24,
        marginBottom: 12,
    },
    emotionIndicator: {
        alignSelf: 'flex-start',
    },
    emotionText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    voicePanel: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emotionSection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionsSection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    appGridSection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },
    memorySection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    memoryCard: {
        padding: 16,
        marginRight: 12,
        borderRadius: 12,
        width: 220,
        minHeight: 100,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    memoryContent: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    memoryTime: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 8,
    },
    memoryEmotionBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    memoryEmotion: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});
