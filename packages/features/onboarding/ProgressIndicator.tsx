import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    color?: string;
    backgroundColor?: string;
}

export function ProgressIndicator({
    currentStep,
    totalSteps,
    color = '#FFD700',
    backgroundColor = '#333'
}: ProgressIndicatorProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <View style={styles.container}>
            <View style={[styles.track, { backgroundColor }]}>
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            backgroundColor: color,
                            width: `${progress}%`,
                        },
                    ]}
                />
            </View>
            <View style={styles.stepsContainer}>
                {Array.from({ length: totalSteps }, (_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.step,
                            {
                                backgroundColor: index < currentStep ? color : backgroundColor,
                                borderColor: color,
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 30,
    },
    track: {
        height: 4,
        borderRadius: 2,
        marginBottom: 15,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 2,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    step: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
    },
});
