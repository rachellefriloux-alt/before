import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Animated,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
    TextInputProps,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useThemeStore } from '../store/theme';

export type InputVariant =
    | 'default'
    | 'gradient'
    | 'neon'
    | 'glass'
    | 'minimal'
    | 'floating';

export type InputSize = 'sm' | 'md' | 'lg';

interface EnhancedInputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: InputVariant;
    size?: InputSize;
    animated?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
    helperStyle?: TextStyle;
}

export function EnhancedInput({
    label,
    error,
    helperText,
    variant = 'default',
    size = 'md',
    animated = true,
    leftIcon,
    rightIcon,
    containerStyle,
    inputStyle,
    labelStyle,
    errorStyle,
    helperStyle,
    value,
    placeholder,
    onFocus,
    onBlur,
    ...props
}: EnhancedInputProps) {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [isFocused, setIsFocused] = useState(false);
    const [inputHeight, setInputHeight] = useState(0);

    const labelAnimation = useRef(new Animated.Value(value || isFocused ? 1 : 0)).current;
    const borderAnimation = useRef(new Animated.Value(0)).current;
    const glowAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated) {
            Animated.timing(labelAnimation, {
                toValue: value || isFocused ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [value, isFocused, animated, labelAnimation]);

    useEffect(() => {
        if (animated && variant === 'neon') {
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
    }, [animated, variant, glowAnimation]);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (animated) {
            Animated.timing(borderAnimation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (animated) {
            Animated.timing(borderAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
        onBlur?.(e);
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    height: 36,
                    paddingHorizontal: 12,
                    fontSize: 14,
                    borderRadius: 6,
                };
            case 'md':
                return {
                    height: 44,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    borderRadius: 8,
                };
            case 'lg':
                return {
                    height: 52,
                    paddingHorizontal: 20,
                    fontSize: 18,
                    borderRadius: 10,
                };
            default:
                return {
                    height: 44,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    borderRadius: 8,
                };
        }
    };

    const getContainerStyles = (): ViewStyle => {
        const baseStyles = {
            ...getSizeStyles(),
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            position: 'relative' as const,
        };

        switch (variant) {
            case 'default':
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? '#333' : '#f5f5f5',
                    borderWidth: 1,
                    borderColor: error
                        ? '#EF4444'
                        : isFocused
                            ? (isDark ? '#FFD700' : '#1a1a1a')
                            : (isDark ? '#555' : '#ddd'),
                };
            case 'gradient':
                return {
                    ...baseStyles,
                    borderWidth: 0,
                    padding: 1,
                };
            case 'neon':
                return {
                    ...baseStyles,
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
            case 'glass':
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                };
            case 'minimal':
                return {
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: error
                        ? '#EF4444'
                        : isFocused
                            ? (isDark ? '#FFD700' : '#1a1a1a')
                            : (isDark ? '#555' : '#ddd'),
                    borderRadius: 0,
                };
            case 'floating':
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderWidth: 1,
                    borderColor: error
                        ? '#EF4444'
                        : isFocused
                            ? (isDark ? '#FFD700' : '#1a1a1a')
                            : 'transparent',
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isFocused ? 0.1 : 0.05,
                    shadowRadius: 4,
                    elevation: isFocused ? 4 : 2,
                };
            default:
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? '#333' : '#f5f5f5',
                    borderWidth: 1,
                    borderColor: error
                        ? '#EF4444'
                        : isFocused
                            ? (isDark ? '#FFD700' : '#1a1a1a')
                            : (isDark ? '#555' : '#ddd'),
                };
        }
    };

    const getInputStyles = (): TextStyle => {
        const baseStyles = {
            flex: 1,
            color: isDark ? '#f5f5f5' : '#1a1a1a',
            fontFamily: 'SpaceMono',
            paddingVertical: 0,
        };

        return {
            ...baseStyles,
            ...inputStyle,
        };
    };

    const getLabelStyles = (): TextStyle => {
        const baseStyles = {
            position: 'absolute' as const,
            left: leftIcon ? 40 : 16,
            color: error
                ? '#EF4444'
                : isFocused
                    ? (isDark ? '#FFD700' : '#1a1a1a')
                    : (isDark ? '#aaa' : '#666'),
            fontSize: 16, // Fixed fontSize
            fontFamily: 'SpaceMono',
            fontWeight: '500' as const,
            backgroundColor: variant === 'floating' ? (isDark ? '#1a1a1a' : '#ffffff') : 'transparent',
            paddingHorizontal: variant === 'floating' ? 4 : 0,
        };

        return {
            ...baseStyles,
            top: labelAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [getSizeStyles().height / 2 - 8, -8],
            }),
            ...labelStyle,
        };
    };

    const renderLabel = () => {
        if (!label) return null;

        const animatedFontSize = labelAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        });

        return (
            <Animated.Text
                style={[
                    getLabelStyles(),
                    {
                        fontSize: animatedFontSize,
                    },
                ]}
            >
                {label}
            </Animated.Text>
        );
    };

    const renderInput = () => {
        const inputElement = (
            <TextInput
                {...props}
                value={value}
                placeholder={isFocused ? placeholder : undefined}
                placeholderTextColor={isDark ? '#888' : '#999'}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={getInputStyles()}
                onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
            />
        );

        if (variant === 'gradient') {
            return (
                <LinearGradient
                    colors={isDark ? ['#FFD700', '#FFA500'] : ['#1a1a1a', '#333']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        flex: 1,
                        borderRadius: getSizeStyles().borderRadius - 1,
                        paddingHorizontal: getSizeStyles().paddingHorizontal - 1,
                        paddingVertical: (getSizeStyles().height - inputHeight) / 2,
                    }}
                >
                    {inputElement}
                </LinearGradient>
            );
        }

        return inputElement;
    };

    return (
        <View style={containerStyle}>
            <View style={getContainerStyles()}>
                {leftIcon && (
                    <View style={styles.iconContainer}>
                        {leftIcon}
                    </View>
                )}
                {renderLabel()}
                {renderInput()}
                {rightIcon && (
                    <View style={styles.iconContainer}>
                        {rightIcon}
                    </View>
                )}
            </View>
            {error && (
                <Text style={[styles.errorText, errorStyle]}>
                    {error}
                </Text>
            )}
            {helperText && !error && (
                <Text style={[styles.helperText, helperStyle]}>
                    {helperText}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: '#EF4444',
        fontFamily: 'SpaceMono',
    },
    helperText: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
        fontFamily: 'SpaceMono',
    },
});
