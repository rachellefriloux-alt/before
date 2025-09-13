import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MemoryItem } from '../../store/memory';

interface MemoryCardProps {
  memory: MemoryItem;
  onPress: () => void;
  onDelete: () => void;
}

export default function MemoryCard({ memory, onPress, onDelete }: MemoryCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'episodic': return '📚';
      case 'semantic': return '🔍';
      case 'emotional': return '❤️';
      case 'procedural': return '🛠️';
      default: return '💭';
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😠';
      case 'calm': return '😌';
      case 'excited': return '🤩';
      case 'thoughtful': return '🤔';
      case 'concerned': return '😟';
      default: return '😐';
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.8) return '#FF6B6B'; // High importance - red
    if (importance >= 0.6) return '#FFD93D'; // Medium importance - yellow
    if (importance >= 0.4) return '#6BCF7F'; // Normal importance - green
    return '#A0A0A0'; // Low importance - gray
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#16213e', '#1a1a2e']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <Text style={styles.typeIcon}>{getTypeIcon(memory.type)}</Text>
              <Text style={styles.typeText}>{memory.type}</Text>
            </View>
            
            <View style={styles.rightHeader}>
              <View style={[
                styles.importanceIndicator, 
                { backgroundColor: getImportanceColor(memory.importance) }
              ]} />
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <Text style={styles.content}>
            {truncateContent(memory.content)}
          </Text>

          {/* Tags */}
          {memory.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {memory.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {memory.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{memory.tags.length - 3} more</Text>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.emotionContainer}>
              <Text style={styles.emotionEmoji}>{getEmotionEmoji(memory.emotion)}</Text>
              <Text style={styles.emotionText}>{memory.emotion}</Text>
            </View>
            
            <Text style={styles.timestamp}>{formatTime(memory.timestamp)}</Text>
          </View>

          {/* Confidence Bar */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence:</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill,
                  { width: `${memory.confidence * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceValue}>
              {Math.round(memory.confidence * 100)}%
            </Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importanceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  deleteIcon: {
    fontSize: 14,
  },
  content: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#533483',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 12,
  },
  moreTagsText: {
    color: '#a0a0a0',
    fontSize: 12,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  emotionText: {
    color: '#a0a0a0',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  timestamp: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    color: '#a0a0a0',
    fontSize: 12,
    marginRight: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  confidenceValue: {
    color: '#a0a0a0',
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
});
