/*
 * Sallie AI Advanced Animation System
 * Comprehensive animation presets and utilities for React Native components
 */

import React, { useRef, useEffect } from 'react';
import {
    Animated,
    Easing,
    ViewStyle,
    StyleProp,
    Vibration,
    Platform,
} from 'react-native';

// Animation presets
export type AnimationPreset =
    | 'FADE_IN'
    | 'FADE_OUT'
    | 'SLIDE_IN_LEFT'
    | 'SLIDE_IN_RIGHT'
    | 'SLIDE_IN_TOP'
    | 'SLIDE_IN_BOTTOM'
    | 'SLIDE_OUT_LEFT'
    | 'SLIDE_OUT_RIGHT'
    | 'SLIDE_OUT_TOP'
    | 'SLIDE_OUT_BOTTOM'
    | 'SCALE_IN'
    | 'SCALE_OUT'
    | 'BOUNCE_IN'
    | 'BOUNCE_OUT'
    | 'ELASTIC_IN'
    | 'ELASTIC_OUT'
    | 'ROTATE_IN'
    | 'ROTATE_OUT'
    | 'FLIP_IN_X'
    | 'FLIP_IN_Y'
    | 'FLIP_OUT_X'
    | 'FLIP_OUT_Y';

// Haptic feedback types
export type HapticType =
    | 'light'
    | 'medium'
    | 'heavy'
    | 'success'
    | 'warning'
    | 'error'
    | 'selection';

interface PressAnimationConfig {
    scale?: number;
    duration?: number;
    enabled?: boolean;
    haptic?: HapticType | boolean;
    springConfig?: {
        tension?: number;
        friction?: number;
    };
}

interface EntranceAnimationConfig {
    preset?: AnimationPreset;
    duration?: number;
    delay?: number;
    easing?: (value: number) => number;
    useNativeDriver?: boolean;
}

interface AnimationState {
    style: StyleProp<ViewStyle>;
    pressStyle?: StyleProp<ViewStyle>;
    isAnimating: boolean;
    onPressIn?: () => void;
    onPressOut?: () => void;
    handlePressIn?: () => void;
    handlePressOut?: () => void;
}

/**
 * Hook for press animations with haptic feedback
 */
export function usePressAnimation(config: PressAnimationConfig = {}): AnimationState {
    const {
        scale = 0.95,
        duration = 150,
        enabled = true,
        haptic = false,
        springConfig = { tension: 300, friction: 10 },
    } = config;

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = React.useState(false);

    const animatePress = React.useCallback((pressed: boolean) => {
        if (!enabled) return;

        const toValue = pressed ? scale : 1;

        if (pressed && haptic) {
            triggerHaptic(haptic === true ? 'light' : haptic);
        }

        Animated.spring(scaleAnim, {
            toValue,
            ...springConfig,
            useNativeDriver: false,
        }).start();

        setIsPressed(pressed);
    }, [scaleAnim, scale, enabled, haptic, springConfig]);

    const style: StyleProp<ViewStyle> = {
        transform: [{ scale: scaleAnim }],
    };

    const onPressIn = React.useCallback(() => animatePress(true), [animatePress]);
    const onPressOut = React.useCallback(() => animatePress(false), [animatePress]);

    return {
        style,
        pressStyle: style,
        isAnimating: isPressed,
        onPressIn,
        onPressOut,
        handlePressIn: onPressIn,
        handlePressOut: onPressOut,
    };
}

/**
 * Hook for entrance animations with various presets
 */
export function useEntranceAnimation(config: EntranceAnimationConfig = {}): AnimationState {
    const {
        preset = 'FADE_IN',
        duration = 500,
        delay = 0,
        easing = Easing.out(Easing.ease),
        useNativeDriver = false,
    } = config;

    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateXAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const [isAnimating, setIsAnimating] = React.useState(true);

    useEffect(() => {
        const animations: Animated.CompositeAnimation[] = [];

        // Configure animations based on preset
        switch (preset) {
            case 'FADE_IN':
                opacityAnim.setValue(0);
                animations.push(
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        easing,
                        useNativeDriver,
                    })
                );
                break;

            case 'FADE_OUT':
                opacityAnim.setValue(1);
                animations.push(
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration,
                        delay,
                        easing,
                        useNativeDriver,
                    })
                );
                break;

            case 'SLIDE_IN_LEFT':
                translateXAnim.setValue(-100);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.timing(translateXAnim, {
                            toValue: 0,
                            duration,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'SLIDE_IN_RIGHT':
                translateXAnim.setValue(100);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.timing(translateXAnim, {
                            toValue: 0,
                            duration,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'SLIDE_IN_TOP':
                translateYAnim.setValue(-100);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.timing(translateYAnim, {
                            toValue: 0,
                            duration,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'SLIDE_IN_BOTTOM':
                translateYAnim.setValue(100);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.timing(translateYAnim, {
                            toValue: 0,
                            duration,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'SCALE_IN':
                scaleAnim.setValue(0.8);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            tension: 100,
                            friction: 8,
                            delay,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'BOUNCE_IN':
                scaleAnim.setValue(0.3);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            tension: 200,
                            friction: 12,
                            delay,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.5,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'ELASTIC_IN':
                scaleAnim.setValue(0.5);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            tension: 300,
                            friction: 15,
                            delay,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.6,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'ROTATE_IN':
                rotateAnim.setValue(-180);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.timing(rotateAnim, {
                            toValue: 0,
                            duration,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'FLIP_IN_X':
                rotateAnim.setValue(-90);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.timing(rotateAnim, {
                            toValue: 0,
                            duration,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            case 'FLIP_IN_Y':
                rotateAnim.setValue(-90);
                opacityAnim.setValue(0);
                animations.push(
                    Animated.parallel([
                        Animated.timing(rotateAnim, {
                            toValue: 0,
                            duration,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: duration * 0.7,
                            delay,
                            easing,
                            useNativeDriver,
                        }),
                    ])
                );
                break;

            default:
                opacityAnim.setValue(0);
                animations.push(
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        easing,
                        useNativeDriver,
                    })
                );
        }

        // Start animations
        if (animations.length > 0) {
            Animated.parallel(animations).start(() => {
                setIsAnimating(false);
            });
        }

        return () => {
            animations.forEach(anim => anim.stop());
        };
    }, [preset, duration, delay, easing, useNativeDriver]);

    const style: StyleProp<ViewStyle> = {
        opacity: opacityAnim,
        transform: [
            { translateX: translateXAnim },
            { translateY: translateYAnim },
            { scale: scaleAnim },
            {
                rotate: rotateAnim.interpolate({
                    inputRange: [-180, 180],
                    outputRange: ['-180deg', '180deg'],
                }),
            },
        ],
    };

    return {
        style,
        isAnimating,
    };
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(type: HapticType = 'light'): void {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    switch (type) {
        case 'light':
            Vibration.vibrate(50);
            break;
        case 'medium':
            Vibration.vibrate(100);
            break;
        case 'heavy':
            Vibration.vibrate(200);
            break;
        case 'success':
            if (Platform.OS === 'ios') {
                // iOS success haptic
                Vibration.vibrate([0, 50, 50, 50]);
            } else {
                Vibration.vibrate(100);
            }
            break;
        case 'warning':
            if (Platform.OS === 'ios') {
                // iOS warning haptic
                Vibration.vibrate([0, 100, 50, 100]);
            } else {
                Vibration.vibrate(200);
            }
            break;
        case 'error':
            if (Platform.OS === 'ios') {
                // iOS error haptic
                Vibration.vibrate([0, 200, 50, 200]);
            } else {
                Vibration.vibrate(300);
            }
            break;
        case 'selection':
            Vibration.vibrate(25);
            break;
        default:
            Vibration.vibrate(50);
    }
}

/**
 * Create a custom animation sequence
 */
export function createAnimationSequence(
    animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation {
    return Animated.sequence(animations);
}

/**
 * Create a custom animation parallel
 */
export function createAnimationParallel(
    animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation {
    return Animated.parallel(animations);
}

/**
 * Create a looping animation
 */
export function createLoopingAnimation(
    animation: Animated.CompositeAnimation,
    iterations: number = -1
): Animated.CompositeAnimation {
    return Animated.loop(animation, { iterations });
}

/**
 * Stagger animations
 */
export function createStaggeredAnimation(
    animations: Animated.CompositeAnimation[],
    staggerDelay: number = 100
): Animated.CompositeAnimation {
    return Animated.stagger(staggerDelay, animations);
}

/**
 * Advanced animation presets for complex effects
 */
export const AnimationPresets = {
    // Bounce with elastic effect
    BOUNCE_ELASTIC: {
        preset: 'BOUNCE_IN' as AnimationPreset,
        duration: 800,
        easing: Easing.elastic(1.2),
    },

    // Smooth slide with fade
    SMOOTH_SLIDE_FADE: {
        preset: 'SLIDE_IN_BOTTOM' as AnimationPreset,
        duration: 600,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    },

    // Dramatic entrance
    DRAMATIC_ENTRANCE: {
        preset: 'SCALE_IN' as AnimationPreset,
        duration: 1000,
        delay: 200,
        easing: Easing.elastic(1.5),
    },

    // Subtle entrance
    SUBTLE_ENTRANCE: {
        preset: 'FADE_IN' as AnimationPreset,
        duration: 400,
        delay: 100,
        easing: Easing.out(Easing.ease),
    },

    // Quick entrance
    QUICK_ENTRANCE: {
        preset: 'FADE_IN' as AnimationPreset,
        duration: 200,
        easing: Easing.out(Easing.ease),
    },

    // Slow entrance
    SLOW_ENTRANCE: {
        preset: 'FADE_IN' as AnimationPreset,
        duration: 1200,
        delay: 300,
        easing: Easing.out(Easing.ease),
    },
};

/**
 * Utility function to get animation config by name
 */
export function getAnimationPreset(name: keyof typeof AnimationPresets): EntranceAnimationConfig {
    return AnimationPresets[name];
}
