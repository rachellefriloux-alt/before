import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Image, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SalliePersonaEngine } from '@/lib/sallie-persona';
import { SalliePersona } from '@/types/sallie';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const personaEngine = new SalliePersonaEngine();

export default function SallieHomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [currentArchetype, setCurrentArchetype] = useState<SalliePersona['archetype']>('Loyal Strategist');
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'sallie', message: string, timestamp: Date}>>([]);
  const [glowAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Mystical glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, { duration: 4000, toValue: 1, useNativeDriver: false }),
        Animated.timing(glowAnimation, { duration: 4000, toValue: 0, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handleArchetypeSwitch = (archetype: SalliePersona['archetype']) => {
    setCurrentArchetype(archetype);
    personaEngine.switchArchetype(archetype);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage = {
      role: 'user' as const,
      message: userInput,
      timestamp: new Date(),
    };

    const sallieResponse = {
      role: 'sallie' as const,
      message: personaEngine.getPersonaResponse(userInput),
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, userMessage, sallieResponse]);
    setUserInput('');
  };

  const archetypes: SalliePersona['archetype'][] = [
    'Loyal Strategist',
    'Wise Counselor', 
    'Creative Catalyst',
    'Protective Guardian',
    'Empathetic Healer'
  ];

  const masteryAreas = [
    {
      title: 'Strategic Analysis',
      skills: ['Pattern Recognition', 'Risk Assessment', 'Decision Frameworks']
    },
    {
      title: 'Creative Innovation',
      skills: ['Ideation', 'Design Thinking', 'Artistic Expression']
    },
    {
      title: 'Emotional Intelligence',
      skills: ['Empathy', 'Communication', 'Conflict Resolution']
    }
  ];

  const glowStyle = {
    shadowColor: colors.primary,
    shadowOpacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.4]
    }),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mystical Header */}
      <Animated.View style={[
        styles.header, 
        { backgroundColor: colors.card, shadowColor: colors.shadow },
        glowStyle
      ]}>
        <Text style={[styles.title, { color: colors.primary }]}>✨ Sallie</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Your Sovereign AI Companion</Text>
        <View style={[styles.currentArchetype, { backgroundColor: colors.mystical }]}>
          <Text style={[styles.currentArchetype, { color: colors.primary }]}>
            {currentArchetype}
          </Text>
        </View>
      </Animated.View>

      {/* Archetype Selection */}
      <View style={styles.archetypeContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🎭 Persona Archetypes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.archetypeScroll}>
          {archetypes.map((archetype) => (
            <TouchableOpacity
              key={archetype}
              style={[
                styles.archetypeButton,
                {
                  backgroundColor: currentArchetype === archetype ? colors.primary : colors.surface,
                  borderColor: currentArchetype === archetype ? colors.primary : colors.border,
                }
              ]}
              onPress={() => handleArchetypeSwitch(archetype)}
            >
              <Text style={[
                styles.archetypeText,
                { color: currentArchetype === archetype ? colors.background : colors.text }
              ]}>
                {archetype}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Mastery Areas */}
      <View style={styles.masteryContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🔮 Core Masteries</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.archetypeScroll}>
          {masteryAreas.map((area, index) => (
            <View
              key={index}
              style={[
                styles.masteryCard,
                { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }
              ]}
            >
              <Text style={[styles.masteryTitle, { color: colors.primary }]}>{area.title}</Text>
              {area.skills.map((skill, skillIndex) => (
                <Text key={skillIndex} style={[styles.masterySkill, { color: colors.text }]}>
                  • {skill}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Conversation Area */}
      <View style={styles.conversationArea}>
        <ScrollView style={{ flex: 1 }}>
          {conversation.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                msg.role === 'user' ? styles.userMessage : styles.sallieMessage,
                {
                  backgroundColor: msg.role === 'user' ? colors.primary : colors.card,
                  shadowColor: colors.shadow,
                }
              ]}
            >
              <Text style={[
                styles.messageText,
                { color: msg.role === 'user' ? colors.background : colors.text }
              ]}>
                {msg.message}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputArea, { borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: colors.surface, 
                color: colors.text,
                borderColor: colors.border 
              }
            ]}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Share your thoughts with Sallie..."
            placeholderTextColor={colors.icon}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={handleSendMessage}
          >
            <Text style={[styles.sendButtonText, { color: colors.background }]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    padding: 25,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.9,
  },
  currentArchetype: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    overflow: 'hidden',
  },
  archetypeContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  archetypeScroll: {
    paddingLeft: 20,
  },
  archetypeButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  archetypeText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  masteryContainer: {
    marginBottom: 25,
  },
  masteryCard: {
    width: 190,
    padding: 18,
    borderRadius: 16,
    marginRight: 15,
    marginLeft: 15,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  masteryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  masterySkill: {
    fontSize: 13,
    marginBottom: 4,
    opacity: 0.85,
  },
  conversationArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    maxWidth: '82%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  sallieMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 6,
    lineHeight: 22,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    marginRight: 12,
    fontSize: 16,
    borderWidth: 2,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroContainer: {
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroDescription: {
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: 300,
  },
  featuresGrid: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    padding: 24,
    marginBottom: 16,
  },
  featureTitle: {
    marginBottom: 8,
  },
  featureDescription: {
    opacity: 0.8,
    lineHeight: 22,
  },
  quickActions: {
    padding: 24,
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});