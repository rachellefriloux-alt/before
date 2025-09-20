/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced animated card component with dynamic theming and visual effects
 * Got it, love.
 */

import React, { useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
    StyleProp,
    Animated,
    GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { usePressAnimation, useEntranceAnimation } from './AnimationSystem';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { Feather } from '@expo/vector-icons';

// Card elevation levels
export type CardElevation = 'flat' | 'low' | 'medium' | 'high';

// Card variants
export type CardVariant =
    'default' |
    'primary' |
    'secondary' |
    'subtle' |
    'outline' |
    'glass' |
    'success' |
    'warning' |
    'error';

interface EnhancedCardProps {
    /** Card title */
    title?: string;
    /** Card subtitle */
    subtitle?: string;
    /** Card content */
    children?: React.ReactNode;
    /** Card header content */
    header?: React.ReactNode;
    /** Card footer content */
    footer?: React.ReactNode;
    /** Card variant */
    variant?: CardVariant;
    /** Card elevation */
    elevation?: CardElevation;
    /** Icon name */
    icon?: keyof typeof Feather.glyphMap;
    /** Custom styles for the card */
    style?: StyleProp<ViewStyle>;
    /** Custom styles for the card title */
    titleStyle?: StyleProp<TextStyle>;
    /** Custom styles for the card subtitle */
    subtitleStyle?: StyleProp<TextStyle>;
    /** Whether the card is pressable */
    pressable?: boolean;
    /** Action when card is pressed */
    onPress?: (event: GestureResponderEvent) => void;
    /** Whether to show gradient background */
    gradient?: boolean;
    /** Gradient colors */
    gradientColors?: string[];
    /** Whether card is full width */
    fullWidth?: boolean;
    /** Whether to animate card entrance */
    animate?: boolean;
    /** Animation delay for entrance */
    animationDelay?: number;
    /** Card corner radius */
    borderRadius?: number;
    /** Whether to apply hover effect */
    hover?: boolean;
    /** Whether to show a glow effect */
    glow?: boolean;
    /** Whether to remove all padding */
    noPadding?: boolean;
    /** Whether the card spans the full height of its container */
    fullHeight?: boolean;
    /** Whether to add a border */
    border?: boolean;
    /** Custom border color */
    borderColor?: string;
    /** Image source for the background */
    backgroundImage?: any;
    /** Aspect ratio of the card */
    aspectRatio?: number;
    /** Actions to show in the top-right corner */
    actions?: Array<{
        icon: keyof typeof Feather.glyphMap;
        onPress: () => void;
        color?: string;
    }>;
}

/**
 * Enhanced card component with animations, theming, and visual effects
 */
const EnhancedCard: React.FC<EnhancedCardProps> = ({
    title,
    subtitle,
    children,
    header,
    footer,
    variant = 'default',
    elevation = 'medium',
    icon,
    style,
    titleStyle,
    subtitleStyle,
    pressable = false,
    onPress,
    gradient = false,
    gradientColors,
    fullWidth = false,
    animate = false,
    animationDelay = 0,
    borderRadius,
    hover = true,
    glow = false,
    noPadding = false,
    fullHeight = false,
    border = false,
    borderColor,
    backgroundImage,
    aspectRatio,
    actions = [],
}) => {
    const { theme } = useTheme();

    // Determine shadow and colors based on elevation and variant
    const getShadowStyle = () => {
        if (elevation === 'flat') return theme.shadows.none;
        if (elevation === 'low') return theme.shadows.small;
        if (elevation === 'high') return theme.shadows.large;
        return theme.shadows.medium; // Default is medium
    };

    const getBackgroundColor = () => {
        switch (variant) {
            case 'primary':
                return theme.colors.primary;
            case 'secondary':
                return theme.colors.secondary;
            case 'subtle':
                return theme.colors.subtle;
            case 'outline':
                return 'transparent';
            case 'glass':
                return 'transparent';
            case 'success':
                return theme.colors.success;
            case 'warning':
                return theme.colors.warning;
            case 'error':
                return theme.colors.error;
            case 'default':
            default:
                return theme.colors.surface;
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'primary':
                return theme.colors.onPrimary;
            case 'secondary':
                return theme.colors.onSecondary;
            case 'subtle':
                return theme.colors.text.primary;
            case 'outline':
                return theme.colors.text.primary;
            case 'glass':
                return theme.colors.text.primary;
            case 'success':
                return '#FFFFFF';
            case 'warning':
                return '#000000';
            case 'error':
                return theme.colors.onError;
            case 'default':
            default:
                return theme.colors.text.primary;
        }
    };

    const getBorderColor = () => {
        if (borderColor) return borderColor;
        if (variant === 'outline') return theme.colors.border.medium;
        return border ? theme.colors.border.light : 'transparent';
    };

    const getGradientColors = (): [string, string, ...string[]] => {
        if (gradientColors && gradientColors.length >= 2) {
            return gradientColors as [string, string, ...string[]];
        }

        switch (variant) {
            case 'primary':
                return [theme.colors.primary, theme.colors.primaryVariant];
            case 'secondary':
                return [theme.colors.secondary, theme.colors.secondaryVariant];
            case 'success':
                return ['#4CAF50', '#2E7D32'];
            case 'warning':
                return ['#FFC107', '#FFA000'];
            case 'error':
                return ['#F44336', '#C62828'];
            default:
                return [
                    theme.dark ? '#2C2C2C' : '#FFFFFF',
                    theme.dark ? '#1E1E1E' : '#F5F5F5',
                ];
        }
    };

    const getGlowColor = () => {
        switch (variant) {
            case 'primary':
                return theme.colors.primary;
            case 'secondary':
                return theme.colors.secondary;
            case 'success':
                return theme.colors.success;
            case 'warning':
                return theme.colors.warning;
            case 'error':
                return theme.colors.error;
            default:
                return theme.colors.primary;
        }
    };

    const getGlowStyle = () => {
        if (!glow) return {};

        const color = getGlowColor();
        return {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 8,
        };
    };

    // Configure press animation
    const pressAnimation = usePressAnimation({
        scale: 0.98,
        duration: 150,
        enabled: pressable,
        haptic: pressable ? 'light' : undefined,
    });

    // Configure entrance animation
    const entranceAnimation = useEntranceAnimation({
        preset: 'FADE_IN',
        delay: animationDelay,
    });

    // Handle card press
    const handlePress = useCallback((event: GestureResponderEvent) => {
        if (pressable && onPress) {
            onPress(event);
        }
    }, [pressable, onPress]);

    // Determine the border radius to use
    const cardBorderRadius = borderRadius !== undefined
        ? borderRadius
        : theme.borderRadius.medium;

    // Card content with background and styling
    const cardContent = (
        <Animated.View
            style={[
                styles.card,
                {
                    backgroundColor: getBackgroundColor(),
                    borderRadius: cardBorderRadius,
                    borderWidth: variant === 'outline' || border ? 1 : 0,
                    borderColor: getBorderColor(),
                    padding: noPadding ? 0 : theme.spacing.m,
                    width: fullWidth ? '100%' : undefined,
                    height: fullHeight ? '100%' : undefined,
                    aspectRatio: aspectRatio,
                },
                getShadowStyle(),
                getGlowStyle(),
                pressable ? pressAnimation.style : animate ? entranceAnimation.style : {},
                style,
            ]}
        >
            {variant === 'glass' && (
                <BlurView
                    intensity={80}
                    tint={theme.dark ? 'dark' : 'light'}
                    style={styles.blurView}
                />
            )}

            {gradient && (
                <LinearGradient
                    colors={getGradientColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                />
            )}

            {backgroundImage && (
                <Animated.Image
                    source={backgroundImage}
                    style={styles.backgroundImage}
                    blurRadius={variant === 'glass' ? 3 : 0}
                />
            )}

            <View style={styles.contentContainer}>
                {(title || subtitle || icon || actions.length > 0) && (
                    <View style={styles.headerContainer}>
                        <View style={styles.titleContainer}>
                            {icon && (
                                <Feather
                                    name={icon}
                                    size={24}
                                    color={getTextColor()}
                                    style={styles.icon}
                                />
                            )}

                            <View style={styles.titleTextContainer}>
                                {title && (
                                    <Text
                                        style={[
                                            styles.title,
                                            { color: getTextColor(), ...getFontStyle(theme.type, 'medium') },
                                            titleStyle,
                                        ]}
                                    >
                                        {title}
                                    </Text>
                                )}

                                {subtitle && (
                                    <Text
                                        style={[
                                            styles.subtitle,
                                            { color: getTextColor(), opacity: 0.8, ...getFontStyle(theme.type, 'regular') },
                                            subtitleStyle,
                                        ]}
                                    >
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {actions.length > 0 && (
                            <View style={styles.actionsContainer}>
                                {actions.map((action, index) => (
                                    <TouchableOpacity
                                        key={`action-${index}`}
                                        onPress={action.onPress}
                                        style={styles.actionButton}
                                    >
                                        <Feather
                                            name={action.icon}
                                            size={20}
                                            color={action.color || getTextColor()}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {header}

                <View style={styles.childrenContainer}>
                    {children}
                </View>

                {footer && (
                    <View style={styles.footerContainer}>
                        {footer}
                    </View>
                )}
            </View>
        </Animated.View>
    );

    // Return the card, wrapped in TouchableOpacity if pressable
    if (pressable) {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePress}
                onPressIn={pressAnimation.onPressIn}
                onPressOut={pressAnimation.onPressOut}
                style={fullWidth ? styles.fullWidth : undefined}
            >
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        position: 'relative',
    },
    fullWidth: {
        width: '100%',
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    contentContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    titleTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    icon: {
        marginRight: 8,
    },
    childrenContainer: {
        flex: 1,
    },
    footerContainer: {
        marginTop: 12,
    },
    actionsContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 16,
        padding: 4,
    },
});

export { EnhancedCard };
