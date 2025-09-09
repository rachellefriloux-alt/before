import React, { useRef, useEffect } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useThemeStore } from '../store/theme';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'glass'
    | 'success'
    | 'warning'
    | 'danger'
    | 'gradient'
    | 'neon'
    | 'minimal';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface EnhancedButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    animated?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
    textStyle?: TextStyle;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: 'button';
}

export function EnhancedButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    animated = true,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole = 'button',
}: EnhancedButtonProps) {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const scaleAnimation = useRef(new Animated.Value(1)).current;
    const opacityAnimation = useRef(new Animated.Value(1)).current;
    const glowAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated && !disabled && !loading) {
            // Subtle glow animation for interactive buttons
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnimation, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        }
    }, [animated, disabled, loading, glowAnimation]);

    const handlePressIn = () => {
        if (animated && !disabled && !loading) {
            Animated.spring(scaleAnimation, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (animated && !disabled && !loading) {
            Animated.spring(scaleAnimation, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
    };

    const getButtonStyles = () => {
        const baseStyles: ViewStyle = {
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
            ...getSizeStyles(),
            ...(fullWidth && { width: '100%' }),
        };

        const variantStyles = getVariantStyles();
        return [baseStyles, variantStyles, style];
    };

    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'sm':
                return { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 };
            case 'md':
                return { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 };
            case 'lg':
                return { paddingHorizontal: 20, paddingVertical: 14, minHeight: 52 };
            case 'xl':
                return { paddingHorizontal: 24, paddingVertical: 16, minHeight: 60 };
            default:
                return { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 };
        }
    };

    const getVariantStyles = (): ViewStyle => {
        const isDark = currentTheme.name.toLowerCase().includes('dark');

        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: isDark ? '#FFD700' : '#1a1a1a',
                    borderWidth: 0,
                };
            case 'secondary':
                return {
                    backgroundColor: isDark ? '#333' : '#f5f5f5',
                    borderWidth: 0,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: isDark ? '#FFD700' : '#1a1a1a',
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                };
            case 'glass':
                return {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                };
            case 'success':
                return {
                    backgroundColor: '#10B981',
                    borderWidth: 0,
                };
            case 'warning':
                return {
                    backgroundColor: '#F59E0B',
                    borderWidth: 0,
                };
            case 'danger':
                return {
                    backgroundColor: '#EF4444',
                    borderWidth: 0,
                };
            case 'gradient':
                return {
                    borderWidth: 0,
                };
            case 'neon':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: '#FFD700',
                    shadowColor: '#FFD700',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: glowAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                    }),
                    shadowRadius: 10,
                    elevation: 10,
                };
            case 'minimal':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                };
            default:
                return {
                    backgroundColor: isDark ? '#FFD700' : '#1a1a1a',
                    borderWidth: 0,
                };
        }
    };

    const getTextStyles = (): TextStyle => {
        const isDark = currentTheme.name.toLowerCase().includes('dark');
        const baseStyles: TextStyle = {
            fontFamily: 'SpaceMono',
            fontWeight: '600',
            textAlign: 'center',
            ...getTextSizeStyles(),
        };

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyles,
                    color: isDark ? '#1a1a1a' : '#f5f5f5',
                };
            case 'secondary':
                return {
                    ...baseStyles,
                    color: isDark ? '#f5f5f5' : '#1a1a1a',
                };
            case 'outline':
            case 'ghost':
            case 'glass':
                return {
                    ...baseStyles,
                    color: isDark ? '#FFD700' : '#1a1a1a',
                };
            case 'success':
                return {
                    ...baseStyles,
                    color: '#ffffff',
                };
            case 'warning':
                return {
                    ...baseStyles,
                    color: '#1a1a1a',
                };
            case 'danger':
                return {
                    ...baseStyles,
                    color: '#ffffff',
                };
            case 'gradient':
                return {
                    ...baseStyles,
                    color: '#ffffff',
                };
            case 'neon':
                return {
                    ...baseStyles,
                    color: '#FFD700',
                    textShadowColor: '#FFD700',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 10,
                };
            case 'minimal':
                return {
                    ...baseStyles,
                    color: isDark ? '#f5f5f5' : '#666',
                    fontWeight: '400',
                };
            default:
                return {
                    ...baseStyles,
                    color: isDark ? '#1a1a1a' : '#f5f5f5',
                };
        }
    };

    const getTextSizeStyles = (): TextStyle => {
        switch (size) {
            case 'sm':
                return { fontSize: 12 };
            case 'md':
                return { fontSize: 14 };
            case 'lg':
                return { fontSize: 16 };
            case 'xl':
                return { fontSize: 18 };
            default:
                return { fontSize: 14 };
        }
    };

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator color={getTextStyles().color} size="small" />;
        }

        return (
            <>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={[getTextStyles(), textStyle]}>{title}</Text>
            </>
        );
    };

    const buttonContent = (
        <Animated.View
            style={[
                getButtonStyles(),
                {
                    transform: [{ scale: scaleAnimation }],
                    opacity: disabled ? 0.5 : opacityAnimation,
                },
            ]}
        >
            {renderContent()}
        </Animated.View>
    );

    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={disabled || loading ? undefined : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={{ borderRadius: 12 }}
                accessibilityLabel={accessibilityLabel || title}
                accessibilityHint={accessibilityHint}
                accessibilityRole={accessibilityRole}
                accessibilityState={{ disabled: disabled || loading }}
            >
                <LinearGradient
                    colors={isDark ? ['#FFD700', '#FFA500'] : ['#1a1a1a', '#333']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={getButtonStyles()}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={disabled || loading ? undefined : onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={{ borderRadius: 12 }}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint}
            accessibilityRole={accessibilityRole}
            accessibilityState={{ disabled: disabled || loading }}
        >
            {buttonContent}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        marginHorizontal: 8,
    },
});
