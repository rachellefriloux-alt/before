import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePersonaStore } from '../../store/persona';

export default function EmotionMeter() {
  const { emotion, intensity, valence, arousal } = usePersonaStore();

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy':
        return '#FFD700';
      case 'sad':
        return '#87CEEB';
      case 'angry':
        return '#FF4500';
      case 'calm':
        return '#98FB98';
      case 'excited':
        return '#FF69B4';
      case 'thoughtful':
        return '#DDA0DD';
      case 'concerned':
        return '#F0E68C';
      default:
        return '#E6E6FA';
    }
  };

  const getEmotionDescription = () => {
    switch (emotion) {
      case 'happy':
        return 'Feeling joyful and content';
      case 'sad':
        return 'Feeling down or melancholic';
      case 'angry':
        return 'Feeling frustrated or upset';
      case 'calm':
        return 'Feeling peaceful and centered';
      case 'excited':
        return 'Feeling enthusiastic and energetic';
      case 'thoughtful':
        return 'Deep in contemplation';
      case 'concerned':
        return 'Feeling worried or anxious';
      default:
        return 'Emotional state neutral';
    }
  };

  const renderMeterBar = (label: string, value: number, color: string) => (
    <View style={styles.meterRow}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterBar}>
        <View 
          style={[
            styles.meterFill, 
            { 
              width: `${value * 100}%`,
              backgroundColor: color
            }
          ]} 
        />
      </View>
      <Text style={styles.meterValue}>{Math.round(value * 100)}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emotional State</Text>
        <View style={[styles.emotionIndicator, { backgroundColor: getEmotionColor() }]}>
          <Text style={styles.emotionText}>{emotion.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.description}>{getEmotionDescription()}</Text>
      
      <View style={styles.metersContainer}>
        {renderMeterBar('Intensity', intensity, '#FF6B6B')}
        {renderMeterBar('Positivity', valence, '#4ECDC4')}
        {renderMeterBar('Energy', arousal, '#45B7D1')}
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>{emotion}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mood</Text>
          <Text style={styles.statValue}>{usePersonaStore.getState().mood}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tone</Text>
          <Text style={styles.statValue}>{usePersonaStore.getState().tone}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emotionIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emotionText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    color: '#a0a0a0',
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  metersContainer: {
    marginBottom: 20,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  meterLabel: {
    width: 80,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  meterBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  meterValue: {
    width: 40,
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});
