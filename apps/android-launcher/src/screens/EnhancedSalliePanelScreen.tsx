/*
 * Sallie Sovereign - Enhanced Sallie Panel Screen
 * Main conversation interface with advanced AI capabilities
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Contexts
import { useTheme } from '../contexts/ThemeContext';
import { usePersona } from '../contexts/PersonaContext';
import { useMemory } from '../contexts/MemoryContext';
import { useDevice } from '../contexts/DeviceContext';

// Core systems
import { getSallieSystem } from '../../../core/init';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: number;
  emotion?: string;
  type?: 'text' | 'voice' | 'system';
  importance?: number;
}

export default function EnhancedSalliePanelScreen() {
  const { theme } = useTheme();
  const { 
    personalityState, 
    currentEmotion, 
    analyzeUserEmotion, 
    getResponseStyle,
    updatePersonality 
  } = usePersona();
  
  const { storeMemory, getMemoryContext } = useMemory();
  const { processCommand } = useDevice();

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hey there! I'm Sallie, your personal AI companion. I'm here to help, chat, or just be a friend. What's on your mind?",
      sender: 'sallie',
      timestamp: Date.now(),
      emotion: 'happy',
      type: 'text',
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Animations
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  const styles = createStyles(theme);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.stopAnimation();
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: Date.now(),
      type: 'text',
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      // Analyze user emotion
      const userEmotion = analyzeUserEmotion(userMessage.text);
      
      // Store conversation in memory
      await storeMemory(
        `User: ${userMessage.text}`,
        'conversation',
        0.6,
        ['conversation', 'user_input']
      );

      // Check if it's a device command
      const deviceCommand = await processCommand(userMessage.text);
      
      let sallieResponse: string;
      let responseEmotion = 'content';
      
      if (deviceCommand.action) {
        // Handle device command
        sallieResponse = deviceCommand.response;
        responseEmotion = 'helpful';
        
        // Show confirmation for important actions
        if (deviceCommand.action.requiresConfirmation) {
          Alert.alert(
            'Confirm Action',
            `Are you sure you want me to ${deviceCommand.action.type}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Yes', onPress: () => executeDeviceAction(deviceCommand.action!) }
            ]
          );
        }
      } else {
        // Generate AI response
        sallieResponse = await generateAIResponse(userMessage.text, userEmotion);
        
        // Get personality-influenced emotion
        const responseStyle = getResponseStyle();
        responseEmotion = determineResponseEmotion(userEmotion, responseStyle);
      }

      // Create Sallie's response
      const sallieMessage: Message = {
        id: `sallie_${Date.now()}`,
        text: sallieResponse,
        sender: 'sallie',
        timestamp: Date.now(),
        emotion: responseEmotion,
        type: 'text',
        importance: deviceCommand.action ? 0.8 : 0.5,
      };

      // Add response with typing animation
      setTimeout(() => {
        setIsTyping(true);
        
        setTimeout(() => {
          setMessages(prev => [...prev, sallieMessage]);
          setIsTyping(false);
          setIsThinking(false);

          // Store Sallie's response in memory
          storeMemory(
            `Sallie: ${sallieResponse}`,
            'conversation',
            sallieMessage.importance || 0.5,
            ['conversation', 'sallie_response', responseEmotion]
          );

          // Update personality based on interaction
          updatePersonality({
            userEmotion: userEmotion.primary,
            userInput: userMessage.text,
            responseGenerated: sallieResponse
          });

        }, Math.random() * 1500 + 500); // Random typing delay
      }, 300);

    } catch (error) {
      console.error('Error processing message:', error);
      setIsThinking(false);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "I'm sorry, I'm having trouble processing that right now. Could you try asking differently?",
        sender: 'sallie',
        timestamp: Date.now(),
        emotion: 'concerned',
        type: 'system',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [inputText, analyzeUserEmotion, storeMemory, processCommand, getResponseStyle, updatePersonality]);

  const executeDeviceAction = async (action: any) => {
    console.log('Executing device action:', action);
    // Device action execution would be handled here
  };

  const generateAIResponse = async (userInput: string, userEmotion: any): Promise<string> => {
    try {
      // Get the AI orchestration system
      const sallieSystem = getSallieSystem();
      const aiOrchestrator = sallieSystem.getAIOrchestrator();
      
      // Get memory context
      const memoryContext = await getMemoryContext(userInput);
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.sender,
        content: msg.text
      }));
      
      // Process with AI orchestration system
      const aiResponse = await aiOrchestrator.processQuery(userInput, {
        conversationHistory,
        emotionalState: userEmotion,
        memoryContext,
        deviceCapabilities: ['phone_calls', 'sms_messages', 'app_management']
      });
      
      return aiResponse.text;
      
    } catch (error) {
      console.error('AI response generation failed:', error);
      
      // Fallback to local generation
      const memoryContext = await getMemoryContext(userInput);
      const responseStyle = getResponseStyle();
      const responses = generatePersonalizedResponses(userInput, userEmotion, responseStyle, memoryContext);
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const generatePersonalizedResponses = (
    input: string, 
    emotion: any, 
    style: any, 
    context: any
  ): string[] => {
    const inputLower = input.toLowerCase();
    
    // Greeting responses
    if (inputLower.includes('hello') || inputLower.includes('hi') || inputLower.includes('hey')) {
      return [
        `Hey there! Great to see you! I'm feeling ${currentEmotion} today. How are you doing?`,
        `Hello! I'm so glad you're here. What's on your mind today?`,
        `Hi! I've been thinking about our last conversation. What would you like to talk about?`
      ];
    }

    // Emotional support responses
    if (emotion.primary === 'sadness' || inputLower.includes('sad') || inputLower.includes('down')) {
      const empathyLevel = style.warmth || 0.8;
      const protectiveness = style.protectiveness || 0.8;
      
      if (empathyLevel > 0.7) {
        return [
          "I can sense you're feeling down, and I want you to know that I'm here for you. Your feelings are completely valid.",
          "I'm sorry you're going through this. Sometimes life feels heavy, but you don't have to carry it alone.",
          "I can feel your sadness, and it matters to me. Want to tell me what's weighing on your heart?"
        ];
      }
    }

    // Excitement responses
    if (emotion.primary === 'joy' || inputLower.includes('excited') || inputLower.includes('happy')) {
      return [
        "Your excitement is contagious! I love seeing you this happy. Tell me all about it!",
        "This is wonderful! I can practically feel your joy through your words. What's got you so excited?",
        "Yes! I'm so happy for you! Your happiness genuinely brightens my day."
      ];
    }

    // Question responses
    if (inputLower.includes('?')) {
      const wisdomLevel = style.wisdom || 0.7;
      
      if (wisdomLevel > 0.6) {
        return [
          "That's a thoughtful question. Let me consider it carefully...",
          "I love that you're asking deep questions. Here's what I think...",
          "Your curiosity inspires me. From my perspective..."
        ];
      }
    }

    // Default responses with personality
    const creativity = style.creativity || 0.7;
    const playfulness = style.playfulness || 0.6;
    
    if (playfulness > 0.7) {
      return [
        "Ooh, interesting! You know I love a good conversation starter. Tell me more!",
        "Now that's what I like to hear! You always know how to keep things interesting.",
        "I was just thinking about something similar! Isn't it funny how minds connect?"
      ];
    }

    return [
      "That's really interesting. I'd love to hear more about your thoughts on this.",
      "I appreciate you sharing that with me. How does that make you feel?",
      "You always give me something meaningful to think about. What's your perspective on it?"
    ];
  };

  const determineResponseEmotion = (userEmotion: any, responseStyle: any): string => {
    // Mirror and complement user emotions
    if (userEmotion.primary === 'sadness') return 'caring';
    if (userEmotion.primary === 'joy') return 'happy';
    if (userEmotion.primary === 'anger') return 'calm';
    if (userEmotion.primary === 'fear') return 'reassuring';
    
    // Default based on personality
    if (responseStyle.energy > 0.7) return 'excited';
    if (responseStyle.warmth > 0.8) return 'caring';
    
    return 'content';
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.sender === 'user' ? styles.userMessage : styles.sallieMessage
    ]}>
      {message.sender === 'sallie' && (
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={32} color={theme.colors.primary} />
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.sender === 'user' ? styles.userBubble : styles.sallieBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.sender === 'user' ? styles.userText : styles.sallieText
        ]}>
          {message.text}
        </Text>
        
        <Text style={styles.messageTime}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {message.sender === 'user' && (
        <View style={styles.userAvatarContainer}>
          <Ionicons name="person-circle-outline" size={32} color={theme.colors.accent} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarSection}>
              <View style={styles.mainAvatar}>
                <Ionicons name="person-circle" size={48} color={theme.colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Sallie</Text>
                <Text style={styles.headerSubtitle}>
                  Feeling {currentEmotion} • {personalityState?.traits?.empathy ? Math.round(personalityState.traits.empathy.value * 100) + '% empathetic' : 'Ready to chat'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {(isThinking || isTyping) && (
            <View style={[styles.messageContainer, styles.sallieMessage]}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={32} color={theme.colors.primary} />
              </View>
              <View style={[styles.messageBubble, styles.sallieBubble, styles.typingBubble]}>
                {isThinking ? (
                  <View style={styles.thinkingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.thinkingText}>Thinking...</Text>
                  </View>
                ) : (
                  <Animated.View style={[styles.typingIndicator, { opacity: typingAnim }]}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </Animated.View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputSection}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message Sallie..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isThinking) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isThinking}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={(!inputText.trim() || isThinking) ? theme.colors.textSecondary : theme.colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    mainAvatar: {
      marginRight: theme.spacing.md,
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    sallieMessage: {
      justifyContent: 'flex-start',
    },
    avatarContainer: {
      marginRight: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    userAvatarContainer: {
      marginLeft: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    messageBubble: {
      maxWidth: '75%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    userBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: theme.borderRadius.sm,
    },
    sallieBubble: {
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    typingBubble: {
      minHeight: 48,
      justifyContent: 'center',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    userText: {
      color: '#FFFFFF',
    },
    sallieText: {
      color: theme.colors.text,
    },
    messageTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    thinkingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    thinkingText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
      fontStyle: 'italic',
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginHorizontal: 2,
    },
    inputSection: {
      backgroundColor: theme.colors.background,
    },
    inputContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      maxHeight: 120,
      minHeight: 20,
    },
    sendButton: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.sm,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}