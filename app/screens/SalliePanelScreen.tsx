import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';
import { useDeviceStore } from '../store/device';
import SallieAvatar from '../components/SallieAvatar';
import ConversationBubble from '../components/ConversationBubble';
import VoiceButton from '../components/VoiceButton';
import { SallieBrain } from '../services/SallieBrain';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'sallie';
    timestamp: number;
    emotion?: string;
    type?: 'text' | 'voice' | 'system';
}

export default function SalliePanelScreen() {
    // Dynamic import for navigation to avoid CommonJS/ESM conflicts
    const [navigation, setNavigation] = useState<any>(null);

    useEffect(() => {
        const loadNavigation = async () => {
            try {
                const { useNavigation: navHook } = await import('@react-navigation/native');
                setNavigation(navHook());
            } catch (error) {
                console.warn('Failed to load navigation:', error);
            }
        };
        loadNavigation();
    }, []);

    const { emotion, setEmotion, personality, getEmotionalContext } = usePersonaStore();
    const { addShortTerm, addEpisodic } = useMemoryStore();
    const { settings } = useDeviceStore();

    const [sallieBrain] = useState(() => new SallieBrain());

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
    const [isListening, setIsListening] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

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

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleSendMessage = async () => {
        if (inputText.trim() === '') return;

        const userMessage: Message = {
            id: `user_${Date.now()}`,
            text: inputText.trim(),
            sender: 'user',
            timestamp: Date.now(),
            type: 'text',
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Add to memory
        addShortTerm({
            type: 'episodic',
            content: `User said: "${userMessage.text}"`,
            tags: ['conversation', 'user_input'],
            importance: 0.6,
            emotion: 'neutral',
            confidence: 0.9,
            source: 'sallie_panel',
            sha256: `user_${userMessage.timestamp}`,
        });

        // Process with AI Brain
        setTimeout(async () => {
            try {
                const aiResponse = await sallieBrain.processInput(userMessage.text);
                const sallieMessage: Message = {
                    id: `sallie_${Date.now()}`,
                    text: aiResponse.text,
                    sender: 'sallie',
                    timestamp: Date.now(),
                    emotion: aiResponse.emotion,
                    type: 'text',
                };

                setMessages(prev => [...prev, sallieMessage]);
                setEmotion(aiResponse.emotion, aiResponse.confidence, 'conversation');
                setIsTyping(false);

                // Process memory updates from AI
                if (aiResponse.memoryUpdates) {
                    aiResponse.memoryUpdates.forEach(update => {
                        if (update.type === 'create' && update.memory) {
                            addShortTerm({
                                type: update.memory.type || 'episodic',
                                content: update.memory.content || '',
                                tags: update.memory.tags || [],
                                importance: update.memory.importance || 0.5,
                                emotion: update.memory.emotion || 'neutral',
                                confidence: update.memory.confidence || 0.8,
                                source: update.memory.source || 'sallie_panel',
                                sha256: update.memory.sha256 || `ai_${Date.now()}`,
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('AI processing error:', error);
                // Fallback to simple response
                const fallbackResponse = generateSallieResponse(userMessage.text);
                const sallieMessage: Message = {
                    id: `sallie_${Date.now()}`,
                    text: fallbackResponse.text,
                    sender: 'sallie',
                    timestamp: Date.now(),
                    emotion: fallbackResponse.emotion,
                    type: 'text',
                };

                setMessages(prev => [...prev, sallieMessage]);
                setEmotion(fallbackResponse.emotion, 0.7, 'conversation');
                setIsTyping(false);
            }
        }, 1500);
    };

    const generateSallieResponse = (userInput: string): { text: string; emotion: string } => {
        const input = userInput.toLowerCase();

        // Simple response logic - in real implementation, this would use AI
        if (input.includes('hello') || input.includes('hi')) {
            return {
                text: "Hey! Great to see you! How are you feeling today?",
                emotion: 'happy',
            };
        }

        if (input.includes('sad') || input.includes('down')) {
            return {
                text: "I'm sorry you're feeling down. Remember, it's okay to feel sad sometimes. Want to talk about what's bothering you?",
                emotion: 'concerned',
            };
        }

        if (input.includes('angry') || input.includes('mad')) {
            return {
                text: "I can sense you're frustrated. Take a deep breath with me. What's making you feel this way?",
                emotion: 'calm',
            };
        }

        if (input.includes('help') || input.includes('assist')) {
            return {
                text: "I'm here to help! Whether you need practical assistance, someone to talk to, or just want to explore ideas together, I've got you covered.",
                emotion: 'excited',
            };
        }

        if (input.includes('love') || input.includes('care')) {
            return {
                text: "That's beautiful. Love and care are such powerful forces. I care about you too, and I'm grateful we can share this connection.",
                emotion: 'happy',
            };
        }

        // Default thoughtful response
        return {
            text: "That's interesting! Tell me more about that. I'm really curious to understand your perspective better.",
            emotion: 'thoughtful',
        };
    };

    const handleVoicePress = () => {
        setIsListening(!isListening);

        if (!isListening) {
            // Start voice recording
            Alert.alert(
                'Voice Input',
                'Voice recording would start here. This feature will be connected to speech recognition.',
                [{ text: 'OK', onPress: () => setIsListening(false) }]
            );
        }
    };

    const clearConversation = () => {
        Alert.alert(
            'Clear Conversation',
            'Are you sure you want to clear this conversation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        setMessages([messages[0]]); // Keep welcome message
                        addEpisodic({
                            type: 'episodic',
                            content: 'User cleared conversation history',
                            tags: ['conversation', 'clear', 'action'],
                            importance: 0.5,
                            emotion: 'neutral',
                            confidence: 1.0,
                            source: 'sallie_panel',
                            sha256: `clear_${Date.now()}`,
                        });
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <SallieAvatar emotion={emotion} size={40} />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Sallie</Text>
                            <Text style={styles.headerSubtitle}>
                                {isTyping ? 'Typing...' : `Feeling ${emotion}`}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={clearConversation} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>🗑️</Text>
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <KeyboardAvoidingView
                    style={styles.messagesContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesList}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((message) => (
                            <ConversationBubble
                                key={message.id}
                                message={message}
                                isUser={message.sender === 'user'}
                            />
                        ))}

                        {isTyping && (
                            <View style={styles.typingIndicator}>
                                <SallieAvatar emotion="thoughtful" size={20} />
                                <Text style={styles.typingText}>Sallie is thinking...</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Type your message..."
                                placeholderTextColor="#a0a0a0"
                                multiline
                                maxLength={500}
                                onSubmitEditing={handleSendMessage}
                                blurOnSubmit={false}
                            />

                            <View style={styles.inputButtons}>
                                <VoiceButton
                                    isListening={isListening}
                                    onPress={handleVoicePress}
                                />

                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        inputText.trim() ? styles.sendButtonActive : null,
                                    ]}
                                    onPress={handleSendMessage}
                                    disabled={inputText.trim() === ''}
                                >
                                    <Text style={styles.sendButtonText}>→</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#16213e',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#16213e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 15,
    },
    headerText: {
        marginLeft: 10,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#a0a0a0',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#16213e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonText: {
        fontSize: 18,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 20,
        paddingBottom: 10,
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 15,
    },
    typingText: {
        color: '#a0a0a0',
        fontSize: 14,
        marginLeft: 10,
        fontStyle: 'italic',
    },
    inputContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#16213e',
    },
    inputWrapper: {
        backgroundColor: '#16213e',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
        maxHeight: 100,
        minHeight: 20,
    },
    inputButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    sendButton: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#533483',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    sendButtonActive: {
        backgroundColor: '#0f3460',
    },
    sendButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
