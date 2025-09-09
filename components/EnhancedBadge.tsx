/*
 * Sallie AI Enhanced Badge Component
 * Advanced badge with animations, variants, and theming
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    StyleProp,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type BadgeVariant =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'glass'
    | 'outline'
    | 'dot';

export type BadgeSize = 'small' | 'medium' | 'large';

interface EnhancedBadgeProps {
    /** Badge label text */
    label?: string;
    /** Badge variant */
    variant?: BadgeVariant;
    /** Badge size */
    size?: BadgeSize;
    /** Left icon */
    leftIcon?: keyof typeof Feather.glyphMap;
    /** Right icon */
    rightIcon?: keyof typeof Feather.glyphMap;
    /** Whether badge is rounded */
    rounded?: boolean;
    /** Whether badge has glow effect */
    glow?: boolean;
    /** Whether badge is animated on mount */
    animate?: boolean;
    /** Whether badge is pressable */
    pressable?: boolean;
    /** Press handler */
    onPress?: () => void;
    /** Custom badge style */
    style?: StyleProp<ViewStyle>;
    /** Custom text style */
    textStyle?: StyleProp<TextStyle>;
    /** Test ID */
    testID?: string;
}

const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
    label,
    variant = 'default',
    size = 'medium',
    leftIcon,
    rightIcon,
    rounded = false,
    glow = false,
    animate = false,
    pressable = false,
    onPress,
    style,
    textStyle,
    testID,
}) => {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animate) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: false,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(1);
            opacityAnim.setValue(1);
        }
    }, [animate]);

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    minHeight: 20,
                    fontSize: 10,
                    iconSize: 12,
                    borderRadius: rounded ? 10 : 4,
                };
            case 'large':
                return {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    minHeight: 32,
                    fontSize: 14,
                    iconSize: 16,
                    borderRadius: rounded ? 16 : 6,
                };
            default: // medium
                return {
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    minHeight: 24,
                    fontSize: 12,
                    iconSize: 14,
                    borderRadius: rounded ? 12 : 5,
                };
        }
    };

    const getVariantStyles = () => {
        const baseTextColor = theme.colors.onPrimary;

        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: theme.colors.primary,
                    textColor: theme.colors.onPrimary,
                    borderColor: theme.colors.primary,
                    borderWidth: 0,
                };
            case 'secondary':
                return {
                    backgroundColor: theme.colors.secondary,
                    textColor: theme.colors.onSecondary,
                    borderColor: theme.colors.secondary,
                    borderWidth: 0,
                };
            case 'success':
                return {
                    backgroundColor: theme.colors.success,
                    textColor: '#FFFFFF',
                    borderColor: theme.colors.success,
                    borderWidth: 0,
                };
            case 'warning':
                return {
                    backgroundColor: '#FFA500',
                    textColor: '#FFFFFF',
                    borderColor: '#FFA500',
                    borderWidth: 0,
                };
            case 'error':
                return {
                    backgroundColor: theme.colors.error,
                    textColor: '#FFFFFF',
                    borderColor: theme.colors.error,
                    borderWidth: 0,
                };
            case 'info':
                return {
                    backgroundColor: '#17A2B8',
                    textColor: '#FFFFFF',
                    borderColor: '#17A2B8',
                    borderWidth: 0,
                };
            case 'glass':
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    textColor: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1,
                    backdropFilter: 'blur(10px)',
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    textColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                    borderWidth: 1,
                };
            case 'dot':
                return {
                    backgroundColor: theme.colors.primary,
                    textColor: theme.colors.onPrimary,
                    borderColor: theme.colors.primary,
                    borderWidth: 0,
                    width: size === 'small' ? 8 : size === 'large' ? 16 : 12,
                    height: size === 'small' ? 8 : size === 'large' ? 16 : 12,
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                    minHeight: undefined,
                    borderRadius: size === 'small' ? 4 : size === 'large' ? 8 : 6,
                };
            default: // default
                return {
                    backgroundColor: theme.colors.surface,
                    textColor: theme.colors.onSurface,
                    borderColor: theme.colors.border.medium,
                    borderWidth: 1,
                };
        }
    };

    const sizeStyles = getSizeStyles();
    const variantStyles = getVariantStyles();

    const animatedStyle = {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
    };

    const badgeContent = (
        <Animated.View
            style={[
                styles.badge,
                sizeStyles,
                variantStyles,
                glow && styles.glow,
                animatedStyle,
                style,
            ]}
            testID={testID}
        >
            {leftIcon && (
                <Feather
                    name={leftIcon}
                    size={sizeStyles.iconSize}
                    color={variantStyles.textColor}
                    style={styles.leftIcon}
                />
            )}

            {label && variant !== 'dot' && (
                <Text
                    style={[
                        styles.text,
                        {
                            color: variantStyles.textColor,
                            fontSize: sizeStyles.fontSize,
                            ...getFontStyle(theme.type, 'medium'),
                        },
                        textStyle,
                    ]}
                >
                    {label}
                </Text>
            )}            {rightIcon && (
                <Feather
                    name={rightIcon}
                    size={sizeStyles.iconSize}
                    color={variantStyles.textColor}
                    style={styles.rightIcon}
                />
            )}
        </Animated.View>
    );

    if (pressable && onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {badgeContent}
            </TouchableOpacity>
        );
    }

    return badgeContent;
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    text: {
        textAlign: 'center',
    },
    leftIcon: {
        marginRight: 4,
    },
    rightIcon: {
        marginLeft: 4,
    },
    glow: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
    },
});

export { EnhancedBadge };
