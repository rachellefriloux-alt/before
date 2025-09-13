import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface RestartButtonProps {
    onRestart: () => void;
}

export function RestartButton({ onRestart }: RestartButtonProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onRestart}>
            <Text style={styles.text}>🔄 Restart</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
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
