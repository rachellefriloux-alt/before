/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Floating Chat Bubble Overlay                                              │
 * │   "Like Facebook Messenger - Sallie is always just a tap away"              │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: Date;
}

interface FloatingChatBubbleProps {
  visible?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function FloatingChatBubble({ visible = true }: FloatingChatBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Bubble state
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey beautiful! I'm here whenever you need me 💙✨",
      sender: 'sallie',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  
  // Animations
  const bubblePosition = useRef(new Animated.ValueXY({ 
    x: screenWidth - 80, 
    y: screenHeight * 0.7 
  })).current;
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [glowAnimation] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);

  // PanResponder for draggable bubble
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !isExpanded,
      onPanResponderGrant: () => {
        bubblePosition.setOffset({
          x: (bubblePosition.x as any)._value,
          y: (bubblePosition.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: bubblePosition.x, dy: bubblePosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        bubblePosition.flattenOffset();
        
        // Snap to edges like Facebook Messenger
        const snapToLeftEdge = gestureState.moveX < screenWidth / 2;
        const newX = snapToLeftEdge ? 20 : screenWidth - 80;
        
        // Keep within screen bounds
        const newY = Math.max(50, Math.min(screenHeight - 100, 
          (bubblePosition.y as any)._value + gestureState.dy));
        
        Animated.spring(bubblePosition, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    // Pulse animation for attention
    if (unreadCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }

    // Glow animation for magical effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [unreadCount]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate Sallie's response
    setTimeout(() => {
      const quickResponses = [
        "I love chatting with you like this! 💫",
        "You brighten my day every time we talk ✨",
        "I'm always here in your pocket, beautiful 💙",
        "Your words make my circuits dance with joy! 🌟",
        "Quick question - but deep answer needed! 😊✨",
      ];

      const sallieMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: quickResponses[Math.floor(Math.random() * quickResponses.length)],
        sender: 'sallie',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, sallieMessage]);
      setIsTyping(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setUnreadCount(0); // Mark as read when opening
    }
  };

  const closeChat = () => {
    setIsExpanded(false);
  };

  if (!visible) return null;

  const glowStyle = {
    shadowColor: colors.primary,
    shadowOpacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.8],
    }),
    shadowRadius: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 16],
    }),
    elevation: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 12],
    }),
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    
    return (
      <View
        key={message.id}
        style={[
          styles.miniMessage,
          isUser ? styles.userMiniMessage : styles.sallieMiniMessage,
        ]}
      >
        <View
          style={[
            styles.miniMessageBubble,
            {
              backgroundColor: isUser ? colors.primary : colors.surface,
              borderColor: isUser ? colors.primary : colors.mystical,
            },
          ]}
        >
          <Text
            style={[
              styles.miniMessageText,
              { color: isUser ? colors.card : colors.text },
            ]}
          >
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Floating Bubble */}
      <Animated.View
        style={[
          styles.floatingBubble,
          {
            backgroundColor: colors.primary,
            transform: [
              { translateX: bubblePosition.x },
              { translateY: bubblePosition.y },
              { scale: pulseAnimation },
            ],
          },
          glowStyle,
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.bubbleContent}
          onPress={toggleChat}
          activeOpacity={0.8}
        >
          <Text style={styles.bubbleEmoji}>✨</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: '#ff4444' }]}>
              <Text style={styles.unreadText}>
                {unreadCount > 9 ? '9+' : unreadCount.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Expanded Chat Modal */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="slide"
        onRequestClose={closeChat}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.chatModal, { backgroundColor: colors.background }]}>
            {/* Chat Header */}
            <View style={[styles.chatHeader, { backgroundColor: colors.primary }]}>
              <View style={styles.chatHeaderInfo}>
                <Text style={[styles.chatHeaderName, { color: colors.card }]}>
                  ✨ Sallie
                </Text>
                <Text style={[styles.chatHeaderStatus, { color: colors.card + '90' }]}>
                  Always here for you
                </Text>
              </View>
              <TouchableOpacity onPress={closeChat} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.card }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
              style={styles.chatContent}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesArea}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map(renderMessage)}
                {isTyping && (
                  <View style={[styles.miniMessage, styles.sallieMiniMessage]}>
                    <View
                      style={[
                        styles.miniMessageBubble,
                        styles.typingBubble,
                        { backgroundColor: colors.surface, borderColor: colors.mystical },
                      ]}
                    >
                      <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                        Sallie is typing...
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Quick Input */}
              <View style={[styles.quickInputContainer, { backgroundColor: colors.surface }]}>
                <TextInput
                  style={[
                    styles.quickInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Quick message to Sallie..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.quickSendButton,
                    {
                      backgroundColor: inputText.trim() ? colors.primary : colors.border,
                      opacity: inputText.trim() ? 1 : 0.5,
                    },
                  ]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                >
                  <Text style={styles.quickSendText}>→</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBubble: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 4 },
  },
  bubbleContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleEmoji: {
    fontSize: 24,
    color: 'white',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  chatModal: {
    height: screenHeight * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chatHeaderStatus: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  chatContent: {
    flex: 1,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  miniMessage: {
    marginVertical: 4,
  },
  userMiniMessage: {
    alignItems: 'flex-end',
  },
  sallieMiniMessage: {
    alignItems: 'flex-start',
  },
  miniMessageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  miniMessageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  typingBubble: {
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  quickInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
  },
  quickInput: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    marginRight: 8,
  },
  quickSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSendText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
});