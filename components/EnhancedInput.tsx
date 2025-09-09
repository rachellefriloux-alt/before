/*
 * Sallie AI Enhanced Input Component
 * Advanced text input with animations, validation, and theming
 */

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
    StyleProp,
    Animated,
    KeyboardTypeOptions,
    ReturnKeyTypeOptions,
} from 'react-native';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type InputVariant = 'default' | 'filled' | 'outlined' | 'underlined' | 'glass';
export type InputSize = 'small' | 'medium' | 'large';

interface EnhancedInputProps {
    /** Input label */
    label?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Input value */
    value?: string;
    /** Value change handler */
    onChangeText?: (text: string) => void;
    /** Input variant */
    variant?: InputVariant;
    /** Input size */
    size?: InputSize;
    /** Whether input is disabled */
    disabled?: boolean;
    /** Error message */
    error?: string;
    /** Success message */
    success?: string;
    /** Helper text */
    helperText?: string;
    /** Left icon */
    leftIcon?: keyof typeof Feather.glyphMap;
    /** Right icon */
    rightIcon?: keyof typeof Feather.glyphMap;
    /** Right icon press handler */
    onRightIconPress?: () => void;
    /** Keyboard type */
    keyboardType?: KeyboardTypeOptions;
    /** Return key type */
    returnKeyType?: ReturnKeyTypeOptions;
    /** Max length */
    maxLength?: number;
    /** Whether input is secure */
    secureTextEntry?: boolean;
    /** Auto capitalize */
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    /** Auto correct */
    autoCorrect?: boolean;
    /** Custom container style */
    style?: StyleProp<ViewStyle>;
    /** Custom input style */
    inputStyle?: StyleProp<TextStyle>;
    /** Custom label style */
    labelStyle?: StyleProp<TextStyle>;
    /** Test ID */
    testID?: string;
}

export interface EnhancedInputRef {
    focus: () => void;
    blur: () => void;
    clear: () => void;
}

const EnhancedInput = forwardRef<EnhancedInputRef, EnhancedInputProps>(({
    label,
    placeholder,
    value,
    onChangeText,
    variant = 'default',
    size = 'medium',
    disabled = false,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    keyboardType,
    returnKeyType,
    maxLength,
    secureTextEntry,
    autoCapitalize,
    autoCorrect = true,
    style,
    inputStyle,
    labelStyle,
    testID,
}, ref) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [inputHeight, setInputHeight] = useState(0);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear: () => inputRef.current?.clear(),
    }));

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    container: { minHeight: 36 },
                    input: { fontSize: 14, paddingVertical: 6, paddingHorizontal: 12 },
                    label: { fontSize: 12 },
                    icon: { size: 16 },
                };
            case 'large':
                return {
                    container: { minHeight: 56 },
                    input: { fontSize: 18, paddingVertical: 12, paddingHorizontal: 16 },
                    label: { fontSize: 16 },
                    icon: { size: 20 },
                };
            default: // medium
                return {
                    container: { minHeight: 48 },
                    input: { fontSize: 16, paddingVertical: 10, paddingHorizontal: 14 },
                    label: { fontSize: 14 },
                    icon: { size: 18 },
                };
        }
    };

    const sizeStyles = getSizeStyles();

    const getVariantStyles = () => {
        const baseBorderColor = error
            ? '#FF6B6B'
            : success
                ? '#51CF66'
                : isFocused
                    ? theme.colors.primary
                    : theme.colors.border.medium;

        switch (variant) {
            case 'filled':
                return {
                    container: {
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: baseBorderColor,
                        borderRadius: 8,
                    },
                    input: {
                        backgroundColor: 'transparent',
                    },
                };
            case 'outlined':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderColor: baseBorderColor,
                        borderRadius: 8,
                    },
                    input: {
                        backgroundColor: 'transparent',
                    },
                };
            case 'underlined':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderBottomWidth: 2,
                        borderBottomColor: baseBorderColor,
                        borderRadius: 0,
                    },
                    input: {
                        backgroundColor: 'transparent',
                    },
                };
            case 'glass':
                return {
                    container: {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 12,
                        backdropFilter: 'blur(10px)',
                    },
                    input: {
                        backgroundColor: 'transparent',
                        color: '#FFFFFF',
                    },
                };
            default: // default
                return {
                    container: {
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: baseBorderColor,
                        borderRadius: 8,
                    },
                    input: {
                        backgroundColor: 'transparent',
                    },
                };
        }
    };

    const variantStyles = getVariantStyles();

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const styles = StyleSheet.create({
        wrapper: {
            marginBottom: 16,
        },
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
        },
        label: {
            ...getFontStyle(theme.type, 'medium'),
            marginBottom: 8,
        },
        input: {
            flex: 1,
            ...getFontStyle(theme.type, 'regular'),
            color: theme.colors.text.primary,
        },
        leftIcon: {
            marginRight: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        rightIcon: {
            marginLeft: 8,
            padding: 4,
            justifyContent: 'center',
            alignItems: 'center',
        },
        disabled: {
            opacity: 0.6,
        },
        helperText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: 12,
            marginTop: 4,
        },
    });

    return (
        <View style={[styles.wrapper, style]}>
            {label && (
                <Text style={[
                    styles.label,
                    { color: error ? '#FF6B6B' : success ? '#51CF66' : theme.colors.text.primary },
                    sizeStyles.label,
                    labelStyle,
                ]}>
                    {label}
                </Text>
            )}

            <View style={[
                styles.container,
                sizeStyles.container,
                variantStyles.container,
                disabled && styles.disabled,
            ]}>
                {leftIcon && (
                    <View style={styles.leftIcon}>
                        <Feather
                            name={leftIcon}
                            size={sizeStyles.icon.size}
                            color={error ? '#FF6B6B' : success ? '#51CF66' : theme.colors.text.secondary}
                        />
                    </View>
                )}

                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        sizeStyles.input,
                        variantStyles.input,
                        inputStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.secondary}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    editable={!disabled}
                    keyboardType={keyboardType}
                    returnKeyType={returnKeyType}
                    maxLength={maxLength}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    testID={testID}
                />

                {rightIcon && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                    >
                        <Feather
                            name={rightIcon}
                            size={sizeStyles.icon.size}
                            color={error ? '#FF6B6B' : success ? '#51CF66' : theme.colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(error || success || helperText) && (
                <Text style={[
                    styles.helperText,
                    {
                        color: error ? '#FF6B6B' : success ? '#51CF66' : theme.colors.text.secondary
                    },
                ]}>
                    {error || success || helperText}
                </Text>
            )}
        </View>
    );
});

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput };
