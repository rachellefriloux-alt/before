import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SkipButtonProps {
    onSkip: () => void;
}

export function SkipButton({ onSkip }: SkipButtonProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onSkip}>
            <Text style={styles.text}>Skip</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        right: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(245, 245, 245, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(245, 245, 245, 0.3)',
    },
    text: {
        color: '#f5f5f5',
        fontSize: 14,
        fontFamily: 'SpaceMono',
    },
});
