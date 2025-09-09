/*
 * Persona: Tough love meets soul care.
 * Module: ProgressBarAnimated
 * Intent: Animated progress bar component
 * Provenance-ID: 8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from './ThemeSystem';

interface ProgressBarAnimatedProps {
    progress: number; // 0 to 1
    height?: number;
    color?: string;
    backgroundColor?: string;
    animated?: boolean;
    duration?: number;
}

const ProgressBarAnimated: React.FC<ProgressBarAnimatedProps> = ({
    progress,
    height = 4,
    color,
    backgroundColor,
    animated = true,
    duration = 300,
}) => {
    const { theme } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated) {
            Animated.timing(animatedValue, {
                toValue: Math.max(0, Math.min(1, progress)),
                duration,
                useNativeDriver: false,
            }).start();
        } else {
            animatedValue.setValue(Math.max(0, Math.min(1, progress)));
        }
    }, [progress, animated, duration, animatedValue]);

    const progressColor = color || theme.colors.primary;
    const bgColor = backgroundColor || theme.colors.border.light;

    const widthInterpolation = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { height, backgroundColor: bgColor }]}>
            <Animated.View
                style={[
                    styles.progress,
                    {
                        backgroundColor: progressColor,
                        width: animated ? widthInterpolation : `${Math.max(0, Math.min(1, progress)) * 100}%`,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: 2,
    },
});

export default ProgressBarAnimated;
