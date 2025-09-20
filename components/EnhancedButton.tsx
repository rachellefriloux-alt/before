/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced animated button with multiple visual states and interactions
 * Got it, love.
 */

import React, {
    useState, useCallback
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp,
    GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { usePressAnimation, triggerHaptic } from './AnimationSystem';
import { useTheme } from './ThemeSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// Types for button variant and size
export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'subtle'
    | 'text'
    | 'success'
    | 'warning'
    | 'danger'
    | 'glass';

export type ButtonSize = 'small' | 'medium' | 'large';

interface EnhancedButtonProps {
    /** Button label text */
    label?: string;
    /** Icon to display before label */
    leftIcon?: keyof typeof Feather.glyphMap;
    /** Icon to display after label */
    rightIcon?: keyof typeof Feather.glyphMap;
    /** Visual variant of the button */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Whether button spans full width of container */
    fullWidth?: boolean;
    /** Whether button has rounded corners */
    rounded?: boolean;
    /** Whether button is disabled */
    disabled?: boolean;
    /** Whether button is in loading state */
    loading?: boolean;
    /** Whether button has elevated appearance */
    elevated?: boolean;
    /** Custom style for the button container */
    style?: StyleProp<ViewStyle>;
    /** Custom style for the button text */
    labelStyle?: StyleProp<TextStyle>;
    /** Press handler */
    onPress?: (event: GestureResponderEvent) => void;
    /** Long press handler */
    onLongPress?: (event: GestureResponderEvent) => void;
    /** Press-in handler */
    onPressIn?: (event: GestureResponderEvent) => void;
    /** Press-out handler */
    onPressOut?: (event: GestureResponderEvent) => void;
    /** Background gradient colors */
    gradientColors?: readonly string[];
    /** Whether to use haptic feedback on press */
    haptic?: boolean | 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy';
    /** Accessibility label for screen readers */
    accessibilityLabel?: string;
    /** TestID for testing */
    testID?: string;
    /** Whether to show glowing effect on button */
    glow?: boolean;
    /** Whether to animate button on mount */
    animate?: boolean;
    /** Children to render instead of text label */
    children?: React.ReactNode;
}

/**
 * Enhanced button component with animations, states, and themeable styles
 */
const EnhancedButton: React.FC<EnhancedButtonProps> = ({
    label,
    leftIcon,
    rightIcon,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    rounded = false,
    disabled = false,
    loading = false,
    elevated = false,
    style,
    labelStyle,
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    gradientColors,
    haptic = false,
    accessibilityLabel,
    testID,
    glow = false,
    animate = false,
    children,
}) => {
    const { theme } = useTheme();
    const [isPressed, setIsPressed] = useState(false);
    const pressAnimation = usePressAnimation({
        scale: 0.95,
        duration: 150,
        enabled: !disabled && !loading,
        haptic: haptic as any,
    });

    // Handle press events
    const handlePressIn = useCallback((event: GestureResponderEvent) => {
        if (disabled || loading) return;

        setIsPressed(true);
        pressAnimation.onPressIn?.();

        if (haptic && typeof haptic === 'boolean') {
            triggerHaptic('light');
        } else if (typeof haptic === 'string') {
            triggerHaptic(haptic as any);
        }

        onPressIn?.(event);
    }, [disabled, loading, pressAnimation, haptic, onPressIn]);

    const handlePressOut = useCallback((event: GestureResponderEvent) => {
        if (disabled || loading) return;

        setIsPressed(false);
        pressAnimation.onPressOut?.();
        onPressOut?.(event);
    }, [disabled, loading, pressAnimation, onPressOut]);

    const handlePress = useCallback((event: GestureResponderEvent) => {
        if (disabled || loading) return;

        if (haptic && typeof haptic === 'boolean') {
            triggerHaptic('light');
        } else if (typeof haptic === 'string') {
            triggerHaptic(haptic as any);
        }

        onPress?.(event);
    }, [disabled, loading, haptic, onPress]);

    // Get colors based on variant and state
    const getColors = useCallback(() => {
        switch (variant) {
            case 'primary':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.primary,
                    text: disabled ? theme.colors.text.disabled : theme.colors.onPrimary,
                    border: 'transparent',
                };
            case 'secondary':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.secondary,
                    text: disabled ? theme.colors.text.disabled : theme.colors.onSecondary,
                    border: 'transparent',
                };
            case 'outline':
                return {
                    background: 'transparent',
                    text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                    border: disabled ? theme.colors.border.light : theme.colors.primary,
                };
            case 'ghost':
                return {
                    background: 'transparent',
                    text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                    border: 'transparent',
                };
            case 'subtle':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.elevation.level1,
                    text: disabled ? theme.colors.text.disabled : theme.colors.onBackground,
                    border: 'transparent',
                };
            case 'success':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.success,
                    text: disabled ? theme.colors.text.disabled : '#FFFFFF',
                    border: 'transparent',
                };
            case 'warning':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.warning,
                    text: disabled ? theme.colors.text.disabled : '#000000',
                    border: 'transparent',
                };
            case 'danger':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.error,
                    text: disabled ? theme.colors.text.disabled : theme.colors.onError || '#FFFFFF',
                    border: 'transparent',
                };
            case 'glass':
                return {
                    background: 'transparent',
                    text: disabled ? theme.colors.text.disabled : theme.colors.onBackground,
                    border: disabled ? theme.colors.border.light : 'rgba(255, 255, 255, 0.2)',
                };
            case 'text':
            default:
                return {
                    background: 'transparent',
                    text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                    border: 'transparent',
                };
        }
    }, [variant, disabled, theme]);

    const colors = getColors();

    // Determine sizing based on button size
    const getPadding = useCallback(() => {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: theme.spacing.xs,
                    paddingHorizontal: theme.spacing.m,
                    minWidth: 70,
                };
            case 'large':
                return {
                    paddingVertical: theme.spacing.m,
                    paddingHorizontal: theme.spacing.xl,
                    minWidth: 120,
                };
            case 'medium':
            default:
                return {
                    paddingVertical: theme.spacing.s,
                    paddingHorizontal: theme.spacing.l,
                    minWidth: 90,
                };
        }
    }, [size, theme]);

    const padding = getPadding();

    // Determine text size based on button size
    const getTextSize = useCallback(() => {
        switch (size) {
            case 'small':
                return theme.typography.sizes.body2;
            case 'large':
                return theme.typography.sizes.subtitle;
            case 'medium':
            default:
                return theme.typography.sizes.body1;
        }
    }, [size, theme]);

    const fontSize = getTextSize();

    // Determine border radius based on button size and rounded prop
    const getBorderRadius = useCallback(() => {
        if (rounded) {
            return theme.borderRadius.pill;
        }

        switch (size) {
            case 'small':
                return theme.borderRadius.small;
            case 'large':
                return theme.borderRadius.large;
            case 'medium':
            default:
                return theme.borderRadius.medium;
        }
    }, [size, rounded, theme]);

    const borderRadius = getBorderRadius();

    // Generate shadow style if elevated
    const getShadowStyle = useCallback(() => {
        if (!elevated || disabled) {
            return {};
        }

        return variant === 'glass'
            ? theme.shadows?.subtle || {}
            : isPressed
                ? theme.shadows?.small || {}
                : theme.shadows?.medium || {};
    }, [elevated, disabled, variant, isPressed, theme]);

    const shadowStyle = getShadowStyle();

    // Generate glow effect if enabled
    const getGlowStyle = useCallback(() => {
        if (!glow || disabled) {
            return {};
        }

        return {
            shadowColor: colors.background,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isPressed ? 0.3 : 0.6,
            shadowRadius: isPressed ? 6 : 12,
            elevation: isPressed ? 6 : 12,
        };
    }, [glow, disabled, colors.background, isPressed]);

    const glowStyle = getGlowStyle();

    // Combine all styles
    const buttonStyle = [
        styles.button,
        {
            ...padding,
            borderRadius,
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: colors.border !== 'transparent' ? 1 : 0,
            opacity: disabled ? 0.6 : 1,
        },
        shadowStyle,
        glowStyle,
        fullWidth && styles.fullWidth,
        pressAnimation.style,
        style,
    ];

    const textStyle = [
        styles.text,
        {
            color: colors.text,
            fontSize,
            fontWeight: (variant === 'text' ? '400' : '600') as any,
        },
        labelStyle,
    ];

    // Render content
    const renderContent = () => {
        if (loading) {
            return (
                <ActivityIndicator
                    size="small"
                    color={colors.text}
                    style={styles.loading}
                />
            );
        }

        return (
            <View style={styles.content}>
                {leftIcon && (
                    <Feather
                        name={leftIcon}
                        size={fontSize}
                        color={colors.text}
                        style={styles.leftIcon}
                    />
                )}
                {children || (
                    <Text style={textStyle} numberOfLines={1}>
                        {label}
                    </Text>
                )}
                {rightIcon && (
                    <Feather
                        name={rightIcon}
                        size={fontSize}
                        color={colors.text}
                        style={styles.rightIcon}
                    />
                )}
            </View>
        );
    };

    // Render with gradient if specified
    if (gradientColors && !disabled) {
        return (
            <TouchableWithoutFeedback
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onLongPress={onLongPress}
                disabled={disabled || loading}
                accessibilityLabel={accessibilityLabel || label}
                testID={testID}
            >
                <Animated.View style={[buttonStyle]}>
                    <LinearGradient
                        colors={gradientColors as any}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {renderContent()}
                    </LinearGradient>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }

    // Render with blur effect for glass variant
    if (variant === 'glass') {
        return (
            <TouchableWithoutFeedback
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onLongPress={onLongPress}
                disabled={disabled || loading}
                accessibilityLabel={accessibilityLabel || label}
                testID={testID}
            >
                <Animated.View style={[buttonStyle]}>
                    <BlurView intensity={80} style={styles.blur}>
                        {renderContent()}
                    </BlurView>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }

    // Standard button render
    return (
        <TouchableWithoutFeedback
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={onLongPress}
            disabled={disabled || loading}
            accessibilityLabel={accessibilityLabel || label}
            testID={testID}
        >
            <Animated.View style={[buttonStyle]}>
                {renderContent()}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        fontFamily: 'System',
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
    fullWidth: {
        alignSelf: 'stretch',
    },
    gradient: {
        flex: 1,
        borderRadius: 0, // Border radius is handled by parent
        alignItems: 'center',
        justifyContent: 'center',
    },
    blur: {
        flex: 1,
        borderRadius: 0, // Border radius is handled by parent
        alignItems: 'center',
        justifyContent: 'center',
    },
    loading: {
        alignSelf: 'center',
    },
});

export { EnhancedButton };
