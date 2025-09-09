/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced toast notification system with animations and haptics
 * Got it, love.
 */

import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableWithoutFeedback,
    ViewStyle,
    TextStyle,
    Dimensions,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from './ThemeSystem';

// Toast types
export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'custom';

// Toast positions
export type ToastPosition = 'top' | 'bottom' | 'center';

// Toast configuration
export interface ToastConfig {
    message: string;
    description?: string;
    type?: ToastType;
    duration?: number;
    position?: ToastPosition;
    icon?: keyof typeof Feather.glyphMap | React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    onPress?: () => void;
    action?: {
        text: string;
        onPress: () => void;
        style?: TextStyle;
    };
    haptic?: boolean | 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy';
    blurBackground?: boolean;
    hideIcon?: boolean;
    hideCloseButton?: boolean;
    swipeEnabled?: boolean;
    animationType?: 'slide' | 'fade' | 'bounce' | 'zoom';
    customContent?: React.ReactNode;
}

interface ToastContextValue {
    show: (config: ToastConfig) => void;
    hide: () => void;
    update: (config: Partial<ToastConfig>) => void;
    success: (message: string, description?: string, duration?: number) => void;
    info: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
}

// Create Toast Context
const ToastContext = createContext<ToastContextValue>({
    show: () => { },
    hide: () => { },
    update: () => { },
    success: () => { },
    info: () => { },
    warning: () => { },
    error: () => { },
});

// Toast Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<ToastConfig>({
        message: '',
        type: 'info',
        duration: 3000,
        position: 'top',
        haptic: true,
        blurBackground: true,
        swipeEnabled: true,
        animationType: 'slide',
    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const panY = useRef(new Animated.Value(0)).current;

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Handle auto-hide timeout
    useEffect(() => {
        if (visible && config.duration !== 0) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                hideToast();
            }, config.duration);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [visible, config.duration]);

    // Trigger haptic feedback
    const triggerHaptic = useCallback((type?: ToastConfig['haptic']) => {
        if (!type) return;

        try {
            switch (type) {
                case 'success':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case 'warning':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    break;
                case 'error':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
                case 'light':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'medium':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case true:
                    // Use default haptic based on toast type
                    switch (config.type) {
                        case 'success':
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            break;
                        case 'warning':
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            break;
                        case 'error':
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            break;
                        default:
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    break;
            }
        } catch (error) {
            console.log('Haptics not supported or error:', error);
        }
    }, [config.type]);

    // Show toast
    const showToast = useCallback((newConfig: ToastConfig) => {
        setConfig({ ...config, ...newConfig });
        setVisible(true);

        // Trigger haptic feedback if enabled
        if (newConfig.haptic !== false) {
            triggerHaptic(newConfig.haptic || true);
        }

        // Start animation
        animateToast(true, newConfig.animationType || 'slide');
    }, [config]);

    // Hide toast
    const hideToast = useCallback(() => {
        animateToast(false, config.animationType || 'slide');

        // Reset pan position
        panY.setValue(0);
    }, [config.animationType]);

    // Update toast
    const updateToast = useCallback((newConfig: Partial<ToastConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));

        // Reset timeout if duration changed
        if (newConfig.duration && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                hideToast();
            }, newConfig.duration);
        }
    }, []);

    // Helper functions for predefined toast types
    const showSuccessToast = useCallback((message: string, description?: string, duration?: number) => {
        showToast({
            message,
            description,
            type: 'success',
            icon: 'check-circle',
            duration: duration || 3000,
            haptic: 'success',
        });
    }, []);

    const showInfoToast = useCallback((message: string, description?: string, duration?: number) => {
        showToast({
            message,
            description,
            type: 'info',
            icon: 'info',
            duration: duration || 3000,
            haptic: 'light',
        });
    }, []);

    const showWarningToast = useCallback((message: string, description?: string, duration?: number) => {
        showToast({
            message,
            description,
            type: 'warning',
            icon: 'alert-triangle',
            duration: duration || 4000,
            haptic: 'warning',
        });
    }, []);

    const showErrorToast = useCallback((message: string, description?: string, duration?: number) => {
        showToast({
            message,
            description,
            type: 'error',
            icon: 'alert-octagon',
            duration: duration || 5000,
            haptic: 'error',
        });
    }, []);

    // Animation handling
    const animateToast = (show: boolean, animationType: ToastConfig['animationType'] = 'slide') => {
        const { height } = Dimensions.get('window');
        const startValue = show ? 0 : 1;
        const endValue = show ? 1 : 0;

        // Reset animation value
        animatedValue.setValue(startValue);

        // Define animation based on type
        let animation;

        switch (animationType) {
            case 'fade':
                animation = Animated.timing(animatedValue, {
                    toValue: endValue,
                    duration: 300,
                    useNativeDriver: true,
                });
                break;

            case 'bounce':
                if (show) {
                    animation = Animated.spring(animatedValue, {
                        toValue: endValue,
                        friction: 6,
                        tension: 100,
                        useNativeDriver: true,
                    });
                } else {
                    animation = Animated.timing(animatedValue, {
                        toValue: endValue,
                        duration: 200,
                        useNativeDriver: true,
                    });
                }
                break;

            case 'zoom':
                animation = Animated.spring(animatedValue, {
                    toValue: endValue,
                    friction: 7,
                    tension: 70,
                    useNativeDriver: true,
                });
                break;

            case 'slide':
            default:
                animation = Animated.timing(animatedValue, {
                    toValue: endValue,
                    duration: 300,
                    useNativeDriver: true,
                });
        }

        animation.start(() => {
            if (!show) {
                setVisible(false);
            }
        });
    };

    // Calculate animation styles based on position and animation type
    const getAnimationStyle = () => {
        const { height } = Dimensions.get('window');

        switch (config.animationType) {
            case 'fade':
                return {
                    opacity: animatedValue,
                };

            case 'zoom':
                return {
                    opacity: animatedValue,
                    transform: [
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            })
                        }
                    ],
                };

            case 'bounce':
                return {
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: config.position === 'bottom'
                                    ? [height * 0.2, 0]
                                    : config.position === 'top'
                                        ? [-height * 0.2, 0]
                                        : [height * 0.1, 0],
                            })
                        },
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.8, 1.1, 1],
                            })
                        }
                    ],
                    opacity: animatedValue,
                };

            case 'slide':
            default:
                return {
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: config.position === 'bottom'
                                    ? [100, 0]
                                    : config.position === 'top'
                                        ? [-100, 0]
                                        : [50, 0],
                            })
                        },
                        { translateY: panY }
                    ],
                    opacity: animatedValue,
                };
        }
    };

    // Calculate position styles
    const getPositionStyle = (): ViewStyle => {
        switch (config.position) {
            case 'bottom':
                return { bottom: 50, left: 0, right: 0 };
            case 'center':
                return { top: '40%', left: 0, right: 0 };
            case 'top':
            default:
                return { top: 50, left: 0, right: 0 };
        }
    };

    // Get icon color based on toast type
    const getIconColor = () => {
        switch (config.type) {
            case 'success':
                return theme.colors.success;
            case 'info':
                return theme.colors.info;
            case 'warning':
                return theme.colors.warning;
            case 'error':
                return theme.colors.error;
            default:
                return theme.colors.primary;
        }
    };

    // Get toast background color based on type
    const getBackgroundColor = () => {
        if (config.blurBackground) return 'transparent';

        switch (config.type) {
            case 'success':
                return theme.dark ? 'rgba(30, 70, 32, 0.9)' : 'rgba(237, 247, 237, 0.9)';
            case 'info':
                return theme.dark ? 'rgba(13, 59, 102, 0.9)' : 'rgba(229, 246, 253, 0.9)';
            case 'warning':
                return theme.dark ? 'rgba(102, 60, 0, 0.9)' : 'rgba(255, 244, 229, 0.9)';
            case 'error':
                return theme.dark ? 'rgba(102, 12, 11, 0.9)' : 'rgba(253, 237, 237, 0.9)';
            default:
                return theme.dark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        }
    };

    // Render icon based on toast type or custom icon
    const renderIcon = () => {
        if (config.hideIcon) return null;

        // If custom react node is provided as icon
        if (config.icon && typeof config.icon !== 'string') {
            return config.icon;
        }

        let iconName: keyof typeof Feather.glyphMap = 'info';

        // Determine icon based on type or use provided string icon
        if (typeof config.icon === 'string') {
            iconName = config.icon as keyof typeof Feather.glyphMap;
        } else {
            switch (config.type) {
                case 'success':
                    iconName = 'check-circle';
                    break;
                case 'info':
                    iconName = 'info';
                    break;
                case 'warning':
                    iconName = 'alert-triangle';
                    break;
                case 'error':
                    iconName = 'alert-octagon';
                    break;
            }
        }

        return (
            <View style={styles.iconContainer}>
                <Feather name={iconName} size={24} color={getIconColor()} />
            </View>
        );
    };

    // Context value
    const contextValue = {
        show: showToast,
        hide: hideToast,
        update: updateToast,
        success: showSuccessToast,
        info: showInfoToast,
        warning: showWarningToast,
        error: showErrorToast,
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            {visible && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        getPositionStyle(),
                        getAnimationStyle(),
                        config.style,
                    ]}
                >
                    <TouchableWithoutFeedback
                        onPress={config.onPress}
                    >
                        <View>
                            {config.blurBackground ? (
                                <BlurView
                                    intensity={80}
                                    style={[styles.toastContent, { backgroundColor: 'rgba(0,0,0,0.1)' }]}
                                    tint={theme.dark ? 'dark' : 'light'}
                                >
                                    {config.customContent || (
                                        <>
                                            {renderIcon()}

                                            <View style={styles.textContainer}>
                                                <Text style={[styles.message, { color: theme.colors.text.primary }, config.textStyle]}>
                                                    {config.message}
                                                </Text>

                                                {config.description && (
                                                    <Text style={[styles.description, { color: theme.colors.text.secondary }, config.descriptionStyle]}>
                                                        {config.description}
                                                    </Text>
                                                )}
                                            </View>

                                            {config.action && (
                                                <TouchableWithoutFeedback onPress={config.action.onPress}>
                                                    <View style={styles.actionContainer}>
                                                        <Text
                                                            style={[
                                                                styles.actionText,
                                                                { color: theme.colors.primary },
                                                                config.action.style
                                                            ]}
                                                        >
                                                            {config.action.text}
                                                        </Text>
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            )}

                                            {!config.hideCloseButton && (
                                                <TouchableWithoutFeedback onPress={hideToast}>
                                                    <View style={styles.closeButton}>
                                                        <Feather name="x" size={18} color={theme.colors.text.secondary} />
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            )}
                                        </>
                                    )}
                                </BlurView>
                            ) : (
                                <View
                                    style={[
                                        styles.toastContent,
                                        { backgroundColor: getBackgroundColor() }
                                    ]}
                                >
                                    {config.customContent || (
                                        <>
                                            {renderIcon()}

                                            <View style={styles.textContainer}>
                                                <Text style={[styles.message, { color: theme.colors.text.primary }, config.textStyle]}>
                                                    {config.message}
                                                </Text>

                                                {config.description && (
                                                    <Text style={[styles.description, { color: theme.colors.text.secondary }, config.descriptionStyle]}>
                                                        {config.description}
                                                    </Text>
                                                )}
                                            </View>

                                            {config.action && (
                                                <TouchableWithoutFeedback onPress={config.action.onPress}>
                                                    <View style={styles.actionContainer}>
                                                        <Text
                                                            style={[
                                                                styles.actionText,
                                                                { color: theme.colors.primary },
                                                                config.action.style
                                                            ]}
                                                        >
                                                            {config.action.text}
                                                        </Text>
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            )}

                                            {!config.hideCloseButton && (
                                                <TouchableWithoutFeedback onPress={hideToast}>
                                                    <View style={styles.closeButton}>
                                                        <Feather name="x" size={18} color={theme.colors.text.secondary} />
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            )}
                                        </>
                                    )}
                                </View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

// Custom hook to use toast
export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        zIndex: 9999,
        alignItems: 'center',
        paddingHorizontal: 16,
        pointerEvents: 'box-none',
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
        minWidth: 250,
        maxWidth: 500,
        overflow: 'hidden',
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        fontSize: 13,
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
    actionContainer: {
        marginLeft: 16,
        paddingLeft: 16,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: 'rgba(0,0,0,0.1)',
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default {
    ToastProvider,
    useToast,
};
