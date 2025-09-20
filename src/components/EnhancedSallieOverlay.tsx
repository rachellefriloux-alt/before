import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';
import { useThemeStore } from '../store/theme';
import EnhancedSallieAvatar from './EnhancedSallieAvatar';

const { width, height } = Dimensions.get('window');

interface Position {
    x: number;
    y: number;
}

export default function EnhancedSallieOverlay() {
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

    const { emotion, setEmotion, intensity } = usePersonaStore();
    const { addShortTerm } = useMemoryStore();
    const { currentTheme, animations } = useThemeStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<Position>({ x: width - 100, y: height - 200 });

    const translateX = useRef(new Animated.Value(position.x)).current;
    const translateY = useRef(new Animated.Value(position.y)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.9)).current;
    const pulseAnimation = useRef(new Animated.Value(1)).current;

    // Pan responder for dragging
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setIsDragging(true);
                if (animations) {
                    Animated.timing(scale, {
                        toValue: 1.1,
                        duration: 150,
                        useNativeDriver: true,
                    }).start();
                }
            },
            onPanResponderMove: (_, gestureState) => {
                const newX = Math.max(0, Math.min(width - 80, position.x + gestureState.dx));
                const newY = Math.max(50, Math.min(height - 150, position.y + gestureState.dy));

                translateX.setValue(newX);
                translateY.setValue(newY);
            },
            onPanResponderRelease: (_, gestureState) => {
                setIsDragging(false);

                const newX = Math.max(0, Math.min(width - 80, position.x + gestureState.dx));
                const newY = Math.max(50, Math.min(height - 150, position.y + gestureState.dy));

                // Snap to edge if close enough
                const snapX = newX < width / 2 ? 20 : width - 100;

                setPosition({ x: snapX, y: newY });

                if (animations) {
                    Animated.parallel([
                        Animated.spring(translateX, {
                            toValue: snapX,
                            useNativeDriver: true,
                            tension: 100,
                            friction: 8,
                        }),
                        Animated.spring(translateY, {
                            toValue: newY,
                            useNativeDriver: true,
                            tension: 100,
                            friction: 8,
                        }),
                        Animated.timing(scale, {
                            toValue: 1,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (animations && !isDragging) {
            // Breathing animation when idle
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 1.05,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [animations, isDragging]);

    const handlePress = () => {
        if (isDragging) return;

        if (isExpanded) {
            // Collapse and navigate to Sallie panel
            setIsExpanded(false);
            navigation.navigate('SalliePanel' as never);
        } else {
            // Expand for quick interaction
            setIsExpanded(true);
            animateExpand();
        }
    };

    const handleLongPress = () => {
        if (isDragging) return;

        // Start voice interaction
        setIsListening(true);
        setEmotion('excited', 0.9, 'voice_activation');

        addShortTerm({
            type: 'episodic',
            content: 'User initiated voice interaction with Sallie via floating overlay',
            tags: ['voice', 'interaction', 'overlay'],
            importance: 0.8,
            emotion: 'excited',
            confidence: 0.9,
            source: 'floating_overlay',
            sha256: 'overlay_voice_' + Date.now(),
        });

        // Simulate voice processing
        setTimeout(() => {
            setIsListening(false);
            setEmotion('thoughtful', 0.8, 'voice_interaction');
        }, 3000);
    };

    const animateExpand = () => {
        if (!animations) return;

        Animated.parallel([
            Animated.timing(scale, {
                toValue: 1.3,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-collapse after 3 seconds
        setTimeout(() => {
            if (isExpanded) {
                animateCollapse();
                setIsExpanded(false);
            }
        }, 3000);
    };

    const animateCollapse = () => {
        if (!animations) return;

        Animated.parallel([
            Animated.timing(scale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const getStatusText = () => {
        if (isListening) return 'Listening...';
        if (isExpanded) return 'Tap to open';
        if (isDragging) return 'Release to place';
        return 'Hey there!';
    };

    const getOverlaySize = () => {
        if (isExpanded) return 100;
        if (isListening) return 90;
        return 80;
    };

    return (
        <Animated.View
            style={[
                styles.overlayContainer,
                {
                    transform: [
                        { translateX },
                        { translateY },
                        { scale: animations ? scale : 1 },
                        { scale: animations && !isDragging ? pulseAnimation : 1 },
                    ],
                    opacity,
                },
            ]}
            {...panResponder.panHandlers}
        >
            {/* Background Glow */}
            {(isListening || isExpanded) && (
                <Animated.View
                    style={[
                        styles.glowBackground,
                        {
                            width: getOverlaySize() + 20,
                            height: getOverlaySize() + 20,
                            borderRadius: (getOverlaySize() + 20) / 2,
                            backgroundColor: isListening
                                ? currentTheme.colors.error + '30'
                                : currentTheme.colors.primary + '30',
                        },
                    ]}
                />
            )}

            {/* Main Overlay Button */}
            <TouchableOpacity
                onPress={handlePress}
                onLongPress={handleLongPress}
                activeOpacity={0.8}
                style={[
                    styles.overlayButton,
                    {
                        width: getOverlaySize(),
                        height: getOverlaySize(),
                        borderRadius: getOverlaySize() / 2,
                    },
                ]}
            >
                <LinearGradient
                    colors={
                        isListening
                            ? [currentTheme.colors.error, currentTheme.colors.warning] as const
                            : (currentTheme.gradients.sallie as any)
                    }
                    style={[
                        styles.gradient,
                        {
                            width: getOverlaySize(),
                            height: getOverlaySize(),
                            borderRadius: getOverlaySize() / 2,
                        },
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <EnhancedSallieAvatar
                        size={getOverlaySize() - 20}
                        animated={animations && !isDragging}
                        interactive={false}
                        showEmotionRing={true}
                        showPulse={isListening}
                    />
                </LinearGradient>
            </TouchableOpacity>

            {/* Status Text */}
            {(isExpanded || isListening || isDragging) && (
                <View
                    style={[
                        styles.statusContainer,
                        { backgroundColor: currentTheme.colors.overlay },
                    ]}
                >
                    <Text style={[styles.statusText, { color: currentTheme.colors.text }]}>
                        {getStatusText()}
                    </Text>
                </View>
            )}

            {/* Quick Actions */}
            {isExpanded && !isListening && (
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: currentTheme.colors.primary }]}
                        onPress={() => {
                            navigation.navigate('SalliePanel' as never);
                            setIsExpanded(false);
                        }}
                    >
                        <Text style={styles.quickActionText}>💬</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: currentTheme.colors.secondary }]}
                        onPress={() => {
                            // Open voice interaction
                            handleLongPress();
                        }}
                    >
                        <Text style={styles.quickActionText}>🎤</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: currentTheme.colors.accent }]}
                        onPress={() => {
                            navigation.navigate('Settings' as never);
                            setIsExpanded(false);
                        }}
                    >
                        <Text style={styles.quickActionText}>⚙️</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    glowBackground: {
        position: 'absolute',
        opacity: 0.6,
    },
    overlayButton: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 16,
    },
    gradient: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusContainer: {
        position: 'absolute',
        bottom: -40,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    quickActionsContainer: {
        position: 'absolute',
        top: -60,
        flexDirection: 'row',
        gap: 8,
    },
    quickAction: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    quickActionText: {
        fontSize: 16,
    },
});