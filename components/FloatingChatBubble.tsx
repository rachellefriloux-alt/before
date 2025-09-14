
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Floating Chat Bubble Overlay                                              │
 * │   "Like Facebook Messenger - Sallie is always just a tap away"              │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  useAnimatedGestureHandler,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Colors, SallieThemes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createAnimatedShadowStyle, createShadowStyle } from '@/utils/shadowStyles';

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
  const colors = SallieThemes.glassAesthetic.colors;

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

  // Enhanced Messenger-like features
  const [quickReplies, setQuickReplies] = useState([
    "How are you?", "What's new?", "Help me with...", "Let's chat!"
  ]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  // Reanimated values
  const translateX = useSharedValue(screenWidth - 80);
  const translateY = useSharedValue(screenHeight * 0.7);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Animations with Reanimated
  useEffect(() => {
    // Pulse animation for attention
    if (unreadCount > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }

    // Glow animation for magical effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.out(Easing.ease) })
      ),
      -1,
      true
    );
  }, [unreadCount]);

  // Pan gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      if (isExpanded) return;
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (isExpanded) return;
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      if (isExpanded) return;
      
      // Snap to edges like Facebook Messenger
      const snapToLeftEdge = event.absoluteX < screenWidth / 2;
      const newX = snapToLeftEdge ? 20 : screenWidth - 80;
      
      // Keep within screen bounds
      const newY = Math.max(50, Math.min(screenHeight - 100, translateY.value));
      
      translateX.value = withTiming(newX, { duration: 300, easing: Easing.out(Easing.ease) });
      translateY.value = withTiming(newY, { duration: 300, easing: Easing.out(Easing.ease) });
    },
  });

  // Animated styles
  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(glowOpacity.value, [0, 1], [0.2, 0.8]),
      elevation: interpolate(glowOpacity.value, [0, 1], [4, 12]),
    };
  });

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
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.floatingBubble,
            {
              backgroundColor: colors.primary,
            },
            bubbleAnimatedStyle,
            glowAnimatedStyle,
          ]}
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
      </PanGestureHandler>

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

              {/* Quick Replies */}
              {showQuickReplies && (
                <View style={[styles.quickRepliesContainer, { backgroundColor: colors.surface }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {quickReplies.map((reply, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.quickReplyButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => {
                          setInputText(reply);
                          setShowQuickReplies(false);
                        }}
                      >
                        <Text style={[styles.quickReplyText, { color: colors.text }]}>
                          {reply}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Enhanced Input Area */}
              <View style={[styles.quickInputContainer, { backgroundColor: colors.surface }]}>
                {/* Voice/Emoji Toggle */}
                <TouchableOpacity
                  style={[styles.inputActionButton, { backgroundColor: isVoiceMode ? colors.accent : colors.background }]}
                  onPress={() => setIsVoiceMode(!isVoiceMode)}
                >
                  <Text style={styles.inputActionText}>
                    {isVoiceMode ? '🎤' : '😊'}
                  </Text>
                </TouchableOpacity>

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
                  placeholder={isVoiceMode ? "Hold to record voice message..." : "Message Sallie..."}
                  placeholderTextColor={colors.textSecondary}
                  multiline={!isVoiceMode}
                  maxLength={500}
                />

                {/* Enhanced Send Button */}
                <TouchableOpacity
                  style={[
                    styles.quickSendButton,
                    {
                      backgroundColor: inputText.trim() ? colors.primary : colors.border,
                      opacity: inputText.trim() ? 1 : 0.5,
                    },
                  ]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() && !isVoiceMode || isTyping}
                >
                  <Text style={styles.quickSendText}>
                    {isVoiceMode ? '🎤' : '→'}
                  </Text>
                </TouchableOpacity>

                {/* Quick Actions */}
                <TouchableOpacity
                  style={[styles.inputActionButton, { backgroundColor: colors.background }]}
                  onPress={() => {/* Open full feature menu */}}
                >
                  <Text style={styles.inputActionText}>⚡</Text>
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
    backgroundColor: 'rgba(20, 184, 166, 0.15)', // Mystical teal glass bubble
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.3)', // Seafoam border
    // Cross-platform shadows
    ...createShadowStyle({
      shadowColor: '#14b8a6',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    }),
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Emerald glass modal
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.25)', // Seafoam glass border
    borderBottomWidth: 0,
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
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 234, 212, 0.2)',
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    gap: 8,
  },
  inputActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.3)',
  },
  inputActionText: {
    fontSize: 16,
  },
  quickInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 80,
  },
  quickSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickSendText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
});
