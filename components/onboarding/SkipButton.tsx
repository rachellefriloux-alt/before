import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useUserStore } from '@/app/store/user';

interface SkipButtonProps {
    onSkip?: () => void;
    onRestart?: () => void;
    variant?: 'skip' | 'restart';
    style?: any;
}

export function SkipButton({
    onSkip,
    onRestart,
    variant = 'skip',
    style
}: SkipButtonProps) {
    const { completeOnboarding } = useUserStore();

    const handlePress = () => {
        if (variant === 'skip') {
            Alert.alert(
                'Skip Onboarding',
                'Are you sure you want to skip the onboarding process? You can always restart it later.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Skip',
                        style: 'destructive',
                        onPress: () => {
                            completeOnboarding();
                            onSkip?.();
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                'Restart Onboarding',
                'This will reset your onboarding progress. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Restart',
                        onPress: () => {
                            // Reset onboarding state
                            onRestart?.();
                        }
                    }
                ]
            );
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={handlePress}
        >
            <Text style={styles.buttonText}>
                {variant === 'skip' ? 'Skip' : 'Restart'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 50,
        right: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonText: {
        color: '#f5f5f5',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'SpaceMono',
    },
});
