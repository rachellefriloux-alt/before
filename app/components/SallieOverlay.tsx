import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';

const { width, height } = Dimensions.get('window');

export default function SallieOverlay() {
    const [navigation, setNavigation] = useState<any>(null);

    useEffect(() => {
        const loadNavigation = async () => {
            const { useNavigation } = await import('@react-navigation/native');
            setNavigation(useNavigation());
        };
        loadNavigation();
    }, []);

    const { emotion, setEmotion } = usePersonaStore();
    const { addShortTerm } = useMemoryStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const translateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.8)).current;

    const handlePress = () => {
        if (isExpanded) {
            // Collapse and navigate to Sallie panel
            setIsExpanded(false);
            navigation?.navigate('SalliePanel' as never);
        } else {
            // Expand for quick interaction
            setIsExpanded(true);
            animateExpand();
        }
    };

    const handleLongPress = () => {
        // Start voice interaction
        setIsListening(true);
        addShortTerm({
            type: 'episodic',
            content: 'User initiated voice interaction with Sallie',
            tags: ['voice', 'interaction'],
            importance: 0.7,
            emotion: 'excited',
            confidence: 0.9,
            source: 'overlay',
            sha256: 'overlay_voice_' + Date.now(),
        });

        // Simulate voice processing
        setTimeout(() => {
            setIsListening(false);
            setEmotion('thoughtful', 0.8, 'voice_interaction');
        }, 2000);
    };

    const animateExpand = () => {
        Animated.parallel([
            Animated.timing(scale, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const animateCollapse = () => {
        Animated.parallel([
            Animated.timing(scale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {
        if (isExpanded) {
            animateExpand();
        } else {
            animateCollapse();
        }
    }, [isExpanded]);

    const getEmotionEmoji = () => {
        switch (emotion) {
            case 'happy': return '😊';
            case 'sad': return '😔';
            case 'angry': return '😠';
            case 'calm': return '😌';
            case 'excited': return '🤩';
            case 'thoughtful': return '🤔';
            case 'concerned': return '😟';
            default: return '🤖';
        }
    };

    const getStatusText = () => {
        if (isListening) return 'Listening...';
        if (isExpanded) return 'Tap to open';
        return 'Tap to chat';
    };

    return (
        <View style={styles.overlayContainer}>
            <Animated.View
                style={[
                    styles.overlay,
                    {
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.sallieButton,
                        isExpanded && styles.expandedButton,
                        isListening && styles.listeningButton,
                    ]}
                    onPress={handlePress}
                    onLongPress={handleLongPress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.sallieEmoji}>
                        {isListening ? '🎤' : getEmotionEmoji()}
                    </Text>

                    {isExpanded && (
                        <View style={styles.expandedContent}>
                            <Text style={styles.statusText}>{getStatusText()}</Text>
                            <Text style={styles.emotionText}>{emotion}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        zIndex: 1000,
    },
    overlay: {
        alignItems: 'center',
    },
    sallieButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#0f3460',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    expandedButton: {
        width: 120,
        height: 80,
        borderRadius: 20,
        paddingHorizontal: 15,
    },
    listeningButton: {
        backgroundColor: '#FF6B6B',
        transform: [{ scale: 1.1 }],
    },
    sallieEmoji: {
        fontSize: 24,
    },
    expandedContent: {
        alignItems: 'center',
        marginTop: 5,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 3,
    },
    emotionText: {
        color: '#a0a0a0',
        fontSize: 10,
        textTransform: 'capitalize',
    },
});
