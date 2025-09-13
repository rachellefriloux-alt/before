import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
}

export function FadeInView({
    children,
    delay = 0,
    duration = 500,
    style
}: FadeInViewProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
            }).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [fadeAnim, delay, duration]);

    return (
        <Animated.View
            style={{
                ...style,
                opacity: fadeAnim,
                transform: [{
                    translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    }),
                }],
            }}
        >
            {children}
        </Animated.View>
    );
}
