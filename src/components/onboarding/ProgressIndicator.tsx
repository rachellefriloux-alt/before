import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.stepIndicators}>
                {Array.from({ length: totalSteps }, (_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.stepDot,
                            index <= currentStep ? styles.stepDotActive : styles.stepDotInactive
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 40,
    },
    progressBar: {
        width: 200,
        height: 4,
        backgroundColor: 'rgba(245, 245, 245, 0.2)',
        borderRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 2,
    },
    stepIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    stepDotActive: {
        backgroundColor: '#FFD700',
    },
    stepDotInactive: {
        backgroundColor: 'rgba(245, 245, 245, 0.3)',
    },
});
