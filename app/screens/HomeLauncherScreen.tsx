import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';
import { useDeviceStore } from '../store/device';
import { useThemeStore } from '../store/theme';
import EnhancedSallieAvatar from '../components/EnhancedSallieAvatar';
import AdvancedVoiceInteraction from '../components/AdvancedVoiceInteraction';
import AppGrid from '../components/AppGrid';
import QuickActions from '../components/QuickActions';
import EmotionMeter from '../components/EmotionMeter';

const { width, height } = Dimensions.get('window');

export default function HomeLauncherScreen() {
  const navigation = useNavigation();
  const { emotion, tone, mood, intensity } = usePersonaStore();
  const { shortTerm, episodic } = useMemoryStore();
  const { isLauncher, settings } = useDeviceStore();
  const { currentTheme, animations } = useThemeStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const fadeAnimation = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good morning, love');
    } else if (hour < 17) {
      setGreeting('Good afternoon, sugar');
    } else {
      setGreeting('Good evening, honey');
    }
  }, [currentTime]);

  useEffect(() => {
    if (animations) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentTheme]);

  const handleSalliePress = () => {
    navigation.navigate('SalliePanel' as never);
  };

  const handleVoicePress = () => {
    setShowVoicePanel(!showVoicePanel);
  };

  const handleAppPress = (appName: string) => {
    // Launch app logic here
    console.log(`Launching ${appName}`);
  };

  const handleVoiceStart = () => {
    console.log('Voice interaction started');
  };

  const handleVoiceEnd = () => {
    console.log('Voice interaction ended');
  };

  const handleTranscription = (text: string) => {
    console.log('Transcription:', text);
  };

  const handleResponse = (response: string) => {
    console.log('Response:', response);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.background} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={currentTheme.gradients.background}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Enhanced Header Section */}
          <View style={styles.header}>
            <View style={styles.timeSection}>
              <Text style={[styles.time, { color: currentTheme.colors.text }]}>
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
              <Text style={[styles.date, { color: currentTheme.colors.textSecondary }]}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            <TouchableOpacity onPress={handleSalliePress} style={styles.sallieButton}>
              <EnhancedSallieAvatar 
                size={80}
                animated={animations}
                interactive={true}
                showEmotionRing={true}
                showPulse={intensity > 0.7}
                onPress={handleSalliePress}
                onLongPress={handleVoicePress}
              />
            </TouchableOpacity>
          </View>

          {/* Enhanced Greeting Section */}
          <View style={[styles.greetingSection, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.greeting, { color: currentTheme.colors.text }]}>
              {greeting}
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.colors.textSecondary }]}>
              I'm here to help you conquer the day with grace and grit
            </Text>
            <View style={styles.emotionIndicator}>
              <Text style={[styles.emotionText, { color: currentTheme.colors.accent }]}>
                Feeling {emotion} • {Math.round(intensity * 100)}% intensity
              </Text>
            </View>
          </View>

          {/* Voice Interaction Panel */}
          {showVoicePanel && (
            <View style={[styles.voicePanel, { backgroundColor: currentTheme.colors.card }]}>
              <AdvancedVoiceInteraction
                onVoiceStart={handleVoiceStart}
                onVoiceEnd={handleVoiceEnd}
                onTranscription={handleTranscription}
                onResponse={handleResponse}
              />
            </View>
          )}

          {/* Enhanced Emotion Meter */}
          <View style={[styles.emotionSection, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Emotional State
            </Text>
            <EmotionMeter />
          </View>

          {/* Enhanced Quick Actions */}
          <View style={[styles.quickActionsSection, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Quick Actions
            </Text>
            <QuickActions />
          </View>

          {/* Enhanced App Grid */}
          <View style={[styles.appGridSection, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Your Apps
            </Text>
            <AppGrid onAppPress={handleAppPress} />
          </View>

          {/* Enhanced Memory Summary */}
          <View style={[styles.memorySection, { backgroundColor: currentTheme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Recent Memories
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shortTerm.slice(-5).map((memory) => (
                <LinearGradient
                  key={memory.id}
                  colors={[currentTheme.colors.card, currentTheme.colors.surface]}
                  style={styles.memoryCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.memoryContent, { color: currentTheme.colors.text }]} numberOfLines={2}>
                    {memory.content}
                  </Text>
                  <Text style={[styles.memoryTime, { color: currentTheme.colors.textSecondary }]}>
                    {new Date(memory.timestamp).toLocaleTimeString()}
                  </Text>
                  <View style={[styles.memoryEmotionBadge, { backgroundColor: currentTheme.colors.accent }]}>
                    <Text style={[styles.memoryEmotion, { color: currentTheme.colors.background }]}>
                      {memory.emotion}
                    </Text>
                  </View>
                </LinearGradient>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  timeSection: {
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  date: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.8,
  },
  sallieButton: {
    padding: 5,
  },
  greetingSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },
  emotionIndicator: {
    alignSelf: 'flex-start',
  },
  emotionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  voicePanel: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emotionSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appGridSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  memorySection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memoryCard: {
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    width: 220,
    minHeight: 100,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memoryContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  memoryTime: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  memoryEmotionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memoryEmotion: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
