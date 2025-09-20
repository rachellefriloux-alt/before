/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced avatar component with various styles and animations
 * Got it, love.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ImageStyle,
    StyleProp,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeSystem';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePressAnimation } from './AnimationSystem';

// Avatar sizes
export type AvatarSize = 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'custom';

// Avatar shapes
export type AvatarShape = 'circle' | 'rounded' | 'square';

// Status indicator types
export type StatusType = 'online' | 'away' | 'busy' | 'offline' | 'custom';

// Avatar sources
export type AvatarSource =
    | { uri: string }
    | { initial: string }
    | { icon: keyof typeof Feather.glyphMap }
    | { gradient: string[] };

interface EnhancedAvatarProps {
    /** Avatar source */
    source: AvatarSource;
    /** Size of the avatar */
    size?: AvatarSize | number;
    /** Shape of the avatar */
    shape?: AvatarShape;
    /** Status indicator */
    status?: StatusType;
    /** Custom status color */
    statusColor?: string;
    /** Whether avatar has a border */
    bordered?: boolean;
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Custom styles for container */
    style?: StyleProp<ViewStyle>;
    /** Custom styles for the image */
    imageStyle?: StyleProp<ImageStyle>;
    /** Custom styles for initials text */
    textStyle?: StyleProp<TextStyle>;
    /** Loading state */
    loading?: boolean;
    /** Fallback when image fails to load */
    fallback?: 'initial' | 'icon';
    /** Custom icon when using icon or as fallback */
    fallbackIcon?: keyof typeof Feather.glyphMap;
    /** Custom background color */
    backgroundColor?: string;
    /** Whether to animate entrance */
    animate?: boolean;
    /** Whether to apply a glow effect */
    glow?: boolean;
    /** Glow color */
    glowColor?: string;
    /** Whether to apply a shadow */
    shadow?: boolean;
    /** Whether avatar is pressable */
    pressable?: boolean;
    /** Press handler */
    onPress?: () => void;
    /** Accessibility label */
    accessibilityLabel?: string;
    /** Custom overlay component */
    overlay?: React.ReactNode;
    /** Whether to show ring around avatar */
    ring?: boolean;
    /** Ring color */
    ringColor?: string;
    /** Ring width */
    ringWidth?: number;
    /** Whether ring pulses */
    ringPulse?: boolean;
    /** Whether avatar can be interacted with (e.g. for badges) */
    interactive?: boolean;
    /** Badge component */
    badge?: React.ReactNode;
    /** Badge position */
    badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Enhanced avatar component with animations and visual effects
 */
const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
    source,
    size = 'medium',
    shape = 'circle',
    status,
    statusColor,
    bordered = false,
    borderColor,
    borderWidth = 2,
    style,
    imageStyle,
    textStyle,
    loading = false,
    fallback = 'initial',
    fallbackIcon = 'user',
    backgroundColor,
    animate = false,
    glow = false,
    glowColor,
    shadow = false,
    pressable = false,
    onPress,
    accessibilityLabel,
    overlay,
    ring = false,
    ringColor,
    ringWidth = 3,
    ringPulse = false,
    interactive = false,
    badge,
    badgePosition = 'top-right',
}) => {
    const { theme } = useTheme();
    const [imageError, setImageError] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [pulseAnim] = useState(new Animated.Value(1));

    // Get avatar dimension based on size prop
    const getAvatarSize = (): number => {
        if (typeof size === 'number') return size;

        switch (size) {
            case 'xs': return 24;
            case 'small': return 36;
            case 'medium': return 48;
            case 'large': return 64;
            case 'xl': return 96;
            default: return 48;
        }
    };

    const avatarSize = getAvatarSize();

    // Get border radius based on shape and size
    const getBorderRadius = (): number => {
        if (shape === 'circle') return avatarSize / 2;
        if (shape === 'rounded') return avatarSize / 6;
        return 0; // square
    };

    // Get status color
    const getStatusColor = (): string => {
        if (statusColor) return statusColor;

        switch (status) {
            case 'online': return theme.colors.success;
            case 'away': return theme.colors.warning;
            case 'busy': return theme.colors.error;
            case 'offline': return theme.colors.text.disabled;
            default: return 'transparent';
        }
    };

    // Get appropriate background color
    const getBackgroundColor = (): string => {
        if (backgroundColor) return backgroundColor;

        if ('gradient' in source) return 'transparent';
        if ('initial' in source) {
            // Generate consistent color based on initial
            const initial = source.initial.toLowerCase();
            const hue = initial.charCodeAt(0) % 360;
            return theme.dark ? `hsl(${hue}, 70%, 30%)` : `hsl(${hue}, 70%, 75%)`;
        }

        return theme.colors.elevation.level2;
    };

    // Get appropriate text color
    const getTextColor = (): string => {
        if ('initial' in source) {
            // Ensure text is visible on background
            const bg = getBackgroundColor();
            if (bg.includes('hsl')) {
                // For HSL backgrounds we generated
                return theme.dark ? theme.colors.text.primary : theme.colors.text.primary;
            }
        }
        return theme.colors.text.primary;
    };

    // Get appropriate border color
    const getBorderColor = (): string => {
        if (borderColor) return borderColor;
        return theme.colors.border.medium;
    };

    // Get appropriate ring color
    const getRingColor = (): string => {
        if (ringColor) return ringColor;
        return theme.colors.primary;
    };

    // Get appropriate glow color
    const getGlowColor = (): string => {
        if (glowColor) return glowColor;
        if ('gradient' in source && source.gradient.length > 0) {
            return source.gradient[0];
        }
        return theme.colors.primary;
    };

    // Calculate shadow style
    const getShadowStyle = () => {
        if (!shadow) return {};

        return theme.shadows.medium;
    };

    // Calculate glow style
    const getGlowStyle = () => {
        if (!glow) return {};

        const color = getGlowColor();
        return {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 7,
        };
    };

    // Start pulse animation for ring
    useEffect(() => {
        if (ring && ringPulse) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }

        return () => {
            pulseAnim.stopAnimation();
        };
    }, [ring, ringPulse]);

    // Fade in animation
    useEffect(() => {
        if (animate) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(1);
        }
    }, [animate]);

    // Configure press animation
    const pressAnimation = usePressAnimation({
        scale: 0.95,
        duration: 100,
        enabled: pressable || interactive,
    });

    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
    };

    // Render the appropriate content based on source and loading state
    const renderContent = () => {
        if (loading) {
            return (
                <View style={[styles.center, { width: avatarSize, height: avatarSize }]}>
                    <ActivityIndicator
                        color={theme.colors.primary}
                        size={avatarSize / 3}
                    />
                </View>
            );
        }

        if ('uri' in source && !imageError) {
            return (
                <Image
                    source={{ uri: source.uri }}
                    style={[
                        styles.image,
                        { width: avatarSize, height: avatarSize },
                        imageStyle,
                    ]}
                    onError={handleImageError}
                />
            );
        }

        if (imageError && fallback === 'icon' || 'icon' in source) {
            const iconName = 'icon' in source ? source.icon : fallbackIcon;
            return (
                <View style={[styles.center, { width: avatarSize, height: avatarSize }]}>
                    <Feather
                        name={iconName}
                        size={avatarSize / 2}
                        color={getTextColor()}
                    />
                </View>
            );
        }

        if (imageError && fallback === 'initial' || 'initial' in source) {
            const initial = 'initial' in source
                ? source.initial.charAt(0).toUpperCase()
                : 'uri' in source
                    ? source.uri.split('/').pop()?.charAt(0).toUpperCase() || 'U'
                    : 'U';

            return (
                <View style={[styles.center, { width: avatarSize, height: avatarSize }]}>
                    <Text
                        style={[
                            styles.initial,
                            {
                                color: getTextColor(),
                                fontSize: avatarSize / 2,
                            },
                            textStyle
                        ]}
                    >
                        {initial}
                    </Text>
                </View>
            );
        }

        if ('gradient' in source) {
            return (
                <LinearGradient
                    colors={source.gradient as [string, string, ...string[]]}
                    style={[styles.center, { width: avatarSize, height: avatarSize }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {overlay}
                </LinearGradient>
            );
        }

        // Fallback for any other case
        return (
            <View style={[styles.center, { width: avatarSize, height: avatarSize }]}>
                <Feather
                    name={fallbackIcon}
                    size={avatarSize / 2}
                    color={getTextColor()}
                />
            </View>
        );
    };

    // Calculate badge position styles
    const getBadgePosition = () => {
        switch (badgePosition) {
            case 'top-left':
                return { top: 0, left: 0 };
            case 'bottom-left':
                return { bottom: 0, left: 0 };
            case 'bottom-right':
                return { bottom: 0, right: 0 };
            case 'top-right':
            default:
                return { top: 0, right: 0 };
        }
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                },
                pressable || interactive ? pressAnimation.style : { transform: [{ scale: 1 }] },
                style,
            ]}
        >
            {/* Ring */}
            {ring && (
                <Animated.View
                    style={[
                        styles.ring,
                        {
                            width: avatarSize + (ringWidth * 2),
                            height: avatarSize + (ringWidth * 2),
                            borderRadius: getBorderRadius() + ringWidth,
                            borderColor: getRingColor(),
                            borderWidth: ringWidth,
                            transform: [{ scale: ringPulse ? pulseAnim : 1 }],
                        }
                    ]}
                />
            )}

            {/* Avatar Container */}
            <Animated.View
                style={[
                    styles.container,
                    {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: getBorderRadius(),
                        backgroundColor: getBackgroundColor(),
                        borderColor: bordered ? getBorderColor() : 'transparent',
                        borderWidth: bordered ? borderWidth : 0,
                    },
                    getShadowStyle(),
                    getGlowStyle(),
                    interactive || pressable ? pressAnimation.style : {},
                ]}
                onTouchStart={pressable || interactive ? pressAnimation.onPressIn : undefined}
                onTouchEnd={pressable || interactive ? pressAnimation.onPressOut : undefined}
            >
                {renderContent()}

                {/* Overlay content */}
                {overlay && !('gradient' in source) && (
                    <View style={[styles.overlay, { borderRadius: getBorderRadius() }]}>
                        {overlay}
                    </View>
                )}
            </Animated.View>

            {/* Status Indicator */}
            {status && (
                <View
                    style={[
                        styles.status,
                        {
                            backgroundColor: getStatusColor(),
                            width: avatarSize / 4,
                            height: avatarSize / 4,
                            borderRadius: avatarSize / 8,
                            borderColor: theme.colors.background,
                            right: 0,
                            bottom: 0,
                        }
                    ]}
                />
            )}

            {/* Badge */}
            {badge && (
                <View
                    style={[
                        styles.badge,
                        getBadgePosition(),
                    ]}
                >
                    {badge}
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    initial: {
        fontWeight: '600',
        textAlign: 'center',
    },
    status: {
        position: 'absolute',
        borderWidth: 2,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    ring: {
        position: 'absolute',
        alignSelf: 'center',
    },
    badge: {
        position: 'absolute',
        zIndex: 1,
    },
});

export { EnhancedAvatar };
