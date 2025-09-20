import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface FadeInViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    duration?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
    children,
    style,
    delay = 0,
    duration = 600,
}) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        const timer = setTimeout(() => {
            opacity.value = withTiming(1, {
                duration,
                easing: Easing.out(Easing.ease),
            });
            translateY.value = withTiming(0, {
                duration,
                easing: Easing.out(Easing.ease),
            });
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, duration, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};
