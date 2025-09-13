import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: number;
  emotion?: string;
  type?: 'text' | 'voice' | 'system';
}

interface ConversationBubbleProps {
  message: Message;
  isUser: boolean;
}

export default function ConversationBubble({ message, isUser }: ConversationBubbleProps) {
  const getEmotionColors = (emotion?: string) => {
    switch (emotion) {
      case 'happy':
        return ['#FFD700', '#FFA500'] as const;
      case 'sad':
        return ['#87CEEB', '#4682B4'] as const;
      case 'angry':
        return ['#FF4500', '#DC143C'] as const;
      case 'calm':
        return ['#98FB98', '#32CD32'] as const;
      case 'excited':
        return ['#FF69B4', '#FF1493'] as const;
      case 'thoughtful':
        return ['#DDA0DD', '#9370DB'] as const;
      case 'concerned':
        return ['#F0E68C', '#DAA520'] as const;
      default:
        return ['#0f3460', '#16213e'] as const;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const bubbleColors = isUser 
    ? (['#533483', '#0f3460'] as const) 
    : getEmotionColors(message.emotion);

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.sallieContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.sallieBubble]}>
        <LinearGradient
          colors={bubbleColors}
          style={styles.bubbleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : styles.sallieText]}>
            {message.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>
              {formatTime(message.timestamp)}
            </Text>
            
            {!isUser && message.emotion && (
              <Text style={styles.emotion}>
                {getEmotionEmoji(message.emotion)}
              </Text>
            )}
            
            {message.type === 'voice' && (
              <Text style={styles.typeIndicator}>🎤</Text>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const getEmotionEmoji = (emotion: string) => {
  switch (emotion) {
    case 'happy': return '😊';
    case 'sad': return '😔';
    case 'angry': return '😠';
    case 'calm': return '😌';
    case 'excited': return '🤩';
    case 'thoughtful': return '🤔';
    case 'concerned': return '😟';
    default: return '🤖';
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 5,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  sallieContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    minWidth: '20%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  sallieBubble: {
    borderBottomLeftRadius: 5,
  },
  bubbleGradient: {
    padding: 15,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  userText: {
    color: '#ffffff',
  },
  sallieText: {
    color: '#ffffff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emotion: {
    fontSize: 14,
    marginLeft: 8,
  },
  typeIndicator: {
    fontSize: 12,
    marginLeft: 8,
  },
});
