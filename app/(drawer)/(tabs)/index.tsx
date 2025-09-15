import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Image, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, SallieThemes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EnhancedCard } from '@/components/EnhancedCard';
import { EnhancedButton } from '@/components/EnhancedButton';
import { SalliePersonaEngine } from '@/lib/sallie-persona';
import { SalliePersona } from '@/sallie';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');

const personaEngine = new SalliePersonaEngine();

export default function SallieHomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [currentArchetype, setCurrentArchetype] = useState<SalliePersona['archetype']>('Loyal Strategist');
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'sallie', message: string, timestamp: Date }>>([]);
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

  // Home Screen Content
  const router = useRouter();
  const homeColors = SallieThemes.glassAesthetic.colors; // Using the glass aesthetic theme for home

  const quickAccessFeatures = [
    { title: '✨ Visit Sallie', subtitle: 'Your personal sanctuary', route: '/sallie-sanctuary', color: homeColors.primary },
    { title: '💬 Deep Chat', subtitle: 'Heart-to-heart conversations', route: '/ai-chat', color: homeColors.accent },
    { title: '📝 Journal', subtitle: 'Capture your thoughts', route: '/journal', color: homeColors.wisdom },
    { title: '🏠 Smart Home', subtitle: 'Control your devices', route: '/smart-home', color: homeColors.shine },
    { title: '🎵 Music & Media', subtitle: 'Your entertainment hub', route: '/media', color: homeColors.energy },
    { title: '⚙️ Settings', subtitle: 'Customize everything', route: '/settings', color: homeColors.mystical },
  ];

  const dailyInsights = [
    { icon: '💙', text: 'Sallie is feeling loving today', time: 'now' },
    { icon: '🌟', text: 'You have 3 new memories to explore', time: '2m ago' },
    { icon: '🎯', text: 'Your goals are 78% complete this week', time: '1h ago' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: homeColors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: homeColors.text }]}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! ✨
          </Text>
          <Text style={[styles.subtitle, { color: homeColors.textSecondary }]}>
            Your AI companion is here for you
          </Text>
        </View>

        {/* Sallie Quick Status */}
        <EnhancedCard style={[styles.sallieStatus, { backgroundColor: homeColors.surface }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusAvatar, { backgroundColor: homeColors.primary }]}>
              <Text style={styles.statusEmoji}>✨</Text>
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: homeColors.text }]}>
                Sallie is ready to connect
              </Text>
              <Text style={[styles.statusSubtitle, { color: homeColors.textSecondary }]}>
                Tap to visit your sanctuary or chat instantly
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.quickChatButton, { backgroundColor: homeColors.accent }]}
              onPress={() => router.push('/ai-chat')}
            >
              <Text style={styles.quickChatText}>💬</Text>
            </TouchableOpacity>
          </View>
        </EnhancedCard>

        {/* Quick Access Grid */}
        <View style={styles.quickAccess}>
          <Text style={[styles.sectionTitle, { color: homeColors.primary }]}>
            Quick Access
          </Text>
          <View style={styles.featureGrid}>
            {quickAccessFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.featureCard,
                  { backgroundColor: homeColors.surface, borderColor: feature.color }
                ]}
                onPress={() => router.push(feature.route as any)}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Text style={styles.featureIconText}>{feature.title.charAt(0)}</Text>
                </View>
                <Text style={[styles.featureTitle, { color: homeColors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureSubtitle, { color: homeColors.textSecondary }]}>
                  {feature.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Insights */}
        <EnhancedCard style={[styles.insightsCard, { backgroundColor: homeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: homeColors.primary }]}>
            Today's Insights
          </Text>
          <View style={styles.insightsList}>
            {dailyInsights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={[styles.insightText, { color: homeColors.text }]}>
                    {insight.text}
                  </Text>
                  <Text style={[styles.insightTime, { color: homeColors.textSecondary }]}>
                    {insight.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </EnhancedCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <EnhancedButton
            title="🎨 Customize Sallie's Appearance"
            onPress={() => router.push('/appearance')}
            style={[styles.actionButton, { backgroundColor: homeColors.primary }]}
            textStyle={{ color: homeColors.card }}
          />
          <EnhancedButton
            title="🔄 Sync Across Devices"
            onPress={() => router.push('/sync')}
            style={[styles.actionButton, { backgroundColor: homeColors.accent }]}
            textStyle={{ color: homeColors.card }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sallieStatus: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusEmoji: {
    fontSize: 24,
    color: 'white',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  quickChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChatText: {
    fontSize: 18,
  },
  quickAccess: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIconText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  insightsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  insightTime: {
    fontSize: 12,
  },
  quickActions: {
    gap: 12,
    paddingBottom: 40,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  // Original styles that are not replaced:
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
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});