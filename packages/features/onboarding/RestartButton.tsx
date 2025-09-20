import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface RestartButtonProps {
    onRestart: () => void;
}

export const RestartButton: React.FC<RestartButtonProps> = ({ onRestart }) => {
    return (
        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
            <Text style={styles.restartText}>Restart Onboarding</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    restartButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    restartText: {
        color: '#FFD700',
        fontSize: 12,
        fontFamily: 'SpaceMono',
        fontWeight: 'bold',
    },
});
