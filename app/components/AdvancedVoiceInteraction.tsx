import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../store/theme';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';

const { width } = Dimensions.get('window');

interface AdvancedVoiceInteractionProps {
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onTranscription?: (text: string) => void;
  onResponse?: (response: string) => void;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export default function AdvancedVoiceInteraction({
  onVoiceStart,
  onVoiceEnd,
  onTranscription,
  onResponse,
}: AdvancedVoiceInteractionProps) {
  const { currentTheme, animations } = useThemeStore();
  const { emotion, setEmotion, personality } = usePersonaStore();
  const { addShortTerm } = useMemoryStore();
  
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isPressed, setIsPressed] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [waveformData, setWaveformData] = useState<number[]>(Array(20).fill(0));
  
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(Array(20).fill(0).map(() => new Animated.Value(0))).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (voiceState === 'listening') {
      startListeningAnimation();
    } else if (voiceState === 'processing') {
      startProcessingAnimation();
    } else if (voiceState === 'speaking') {
      startSpeakingAnimation();
    } else {
      stopAllAnimations();
    }
  }, [voiceState]);

  const startListeningAnimation = () => {
    // Pulse animation for listening state
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      })
    ).start();

    // Simulate waveform animation
    startWaveformAnimation();
  };

  const startProcessingAnimation = () => {
    // Rotation animation for processing
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startSpeakingAnimation = () => {
    // Speaking wave animation
    startWaveformAnimation();
  };

  const startWaveformAnimation = () => {
    const animations = waveAnimation.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.1,
            duration: 150 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ])
      );
    });

    Animated.stagger(50, animations).start();
  };

  const stopAllAnimations = () => {
    pulseAnimation.stopAnimation();
    glowAnimation.stopAnimation();
    rotateAnimation.stopAnimation();
    waveAnimation.forEach(anim => anim.stopAnimation());
    
    Animated.parallel([
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnimation, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
    
    if (animations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (voiceState === 'idle') {
      startListening();
    } else if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'speaking') {
      stopSpeaking();
    }
  };

  const handleLongPress = () => {
    if (voiceState === 'idle') {
      startContinuousListening();
    }
  };

  const startListening = async () => {
    try {
      setVoiceState('listening');
      setEmotion('excited', 0.8, 'voice_activation');
      onVoiceStart?.();
      
      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      // Simulate voice recognition (in a real app, use actual speech recognition)
      setTimeout(() => {
        simulateTranscription();
      }, 3000);
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setVoiceState('error');
      setEmotion('concerned', 0.7, 'voice_error');
    }
  };

  const stopListening = () => {
    setVoiceState('processing');
    setEmotion('thoughtful', 0.9, 'voice_processing');
  };

  const startContinuousListening = () => {
    // Continuous listening mode
    startListening();
    addShortTerm({
      type: 'episodic',
      content: 'Started continuous voice interaction mode',
      tags: ['voice', 'continuous', 'interaction'],
      importance: 0.8,
      emotion: 'excited',
      confidence: 0.9,
      source: 'voice_system',
      sha256: 'continuous_voice_' + Date.now(),
    });
  };

  const simulateTranscription = () => {
    const mockTranscriptions = [
      "Hey Sallie, how are you doing today?",
      "Can you help me organize my schedule?",
      "What's the weather like?",
      "Tell me something inspiring",
      "I'm feeling a bit overwhelmed",
    ];
    
    const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    setTranscription(transcription);
    onTranscription?.(transcription);
    
    setTimeout(() => {
      processResponse(transcription);
    }, 1000);
  };

  const processResponse = (transcription: string) => {
    setVoiceState('speaking');
    setEmotion('happy', 0.7, 'voice_response');
    
    // Generate response based on personality and transcription
    const response = generatePersonalizedResponse(transcription);
    setResponse(response);
    onResponse?.(response);
    
    // Speak the response
    Speech.speak(response, {
      voice: getVoiceForPersonality(),
      rate: 0.9,
      pitch: 1.1,
      onDone: () => {
        setVoiceState('idle');
        setEmotion('calm', 0.6, 'voice_complete');
        onVoiceEnd?.();
      },
    });
    
    // Add to memory
    addShortTerm({
      type: 'semantic',
      content: `User: ${transcription}\nSallie: ${response}`,
      tags: ['conversation', 'voice', 'interaction'],
      importance: 0.8,
      emotion: emotion,
      confidence: 0.9,
      source: 'voice_conversation',
      sha256: 'voice_conv_' + Date.now(),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setVoiceState('idle');
    setEmotion('calm', 0.5, 'voice_stopped');
  };

  const generatePersonalizedResponse = (input: string): string => {
    const responses = {
      tough_love_soul_care: [
        "I hear you, sugar. Let's tackle this together with some grace and grit.",
        "Honey, you've got this. Sometimes we just need to take a deep breath and keep moving.",
        "Listen, life's gonna test you, but you're stronger than you know.",
      ],
      default: [
        "I'm here to help you with whatever you need.",
        "Let's work through this step by step.",
        "I understand. How can I support you better?",
      ],
    };
    
    const personalityResponses = responses[personality as keyof typeof responses] || responses.default;
    return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  };

  const getVoiceForPersonality = () => {
    // Return appropriate voice identifier based on personality
    // This would map to actual voice IDs in a real implementation
    return undefined; // Let system choose default voice
  };

  const getStateIcon = () => {
    switch (voiceState) {
      case 'listening':
        return '🎤';
      case 'processing':
        return '🤔';
      case 'speaking':
        return '🗣️';
      case 'error':
        return '❌';
      default:
        return '🎙️';
    }
  };

  const getStateText = () => {
    switch (voiceState) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      case 'error':
        return 'Error occurred';
      default:
        return 'Tap to speak';
    }
  };

  const getStateColor = () => {
    switch (voiceState) {
      case 'listening':
        return currentTheme.colors.info;
      case 'processing':
        return currentTheme.colors.warning;
      case 'speaking':
        return currentTheme.colors.success;
      case 'error':
        return currentTheme.colors.error;
      default:
        return currentTheme.colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Waveform Visualization */}
      {(voiceState === 'listening' || voiceState === 'speaking') && (
        <View style={styles.waveformContainer}>
          {waveAnimation.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveBar,
                {
                  height: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 60],
                  }),
                  backgroundColor: getStateColor(),
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Main Voice Button */}
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={styles.voiceButtonContainer}
      >
        <Animated.View
          style={[
            {
              transform: [
                { scale: scaleAnimation },
                { scale: pulseAnimation },
                {
                  rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[getStateColor(), currentTheme.colors.secondary]}
            style={[
              styles.voiceButton,
              {
                borderColor: getStateColor(),
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.voiceIcon}>{getStateIcon()}</Text>
            
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  borderColor: getStateColor(),
                  opacity: glowAnimation,
                },
              ]}
            />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* State Text */}
      <Text style={[styles.stateText, { color: currentTheme.colors.text }]}>
        {getStateText()}
      </Text>

      {/* Transcription Display */}
      {transcription && (
        <View style={[styles.transcriptionContainer, { backgroundColor: currentTheme.colors.card }]}>
          <Text style={[styles.transcriptionLabel, { color: currentTheme.colors.textSecondary }]}>
            You said:
          </Text>
          <Text style={[styles.transcriptionText, { color: currentTheme.colors.text }]}>
            "{transcription}"
          </Text>
        </View>
      )}

      {/* Response Display */}
      {response && voiceState === 'speaking' && (
        <View style={[styles.responseContainer, { backgroundColor: currentTheme.colors.surface }]}>
          <Text style={[styles.responseLabel, { color: currentTheme.colors.textSecondary }]}>
            Sallie responds:
          </Text>
          <Text style={[styles.responseText, { color: currentTheme.colors.text }]}>
            "{response}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 20,
    gap: 3,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  voiceButtonContainer: {
    marginBottom: 15,
  },
  voiceButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  voiceIcon: {
    fontSize: 36,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  stateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  transcriptionContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    maxWidth: width - 40,
  },
  transcriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  transcriptionText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  responseContainer: {
    padding: 15,
    borderRadius: 12,
    maxWidth: width - 40,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  responseText: {
    fontSize: 16,
    fontWeight: '500',
  },
});