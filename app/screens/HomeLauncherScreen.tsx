import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';
import { useDeviceStore } from '../store/device';
import SallieAvatar from '../components/SallieAvatar';
import AppGrid from '../components/AppGrid';
import QuickActions from '../components/QuickActions';
import EmotionMeter from '../components/EmotionMeter';

const { width, height } = Dimensions.get('window');

export default function HomeLauncherScreen() {
  const navigation = useNavigation();
  const { emotion, tone, mood } = usePersonaStore();
  const { shortTerm, episodic } = useMemoryStore();
  const { isLauncher, settings } = useDeviceStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, [currentTime]);

  const handleSalliePress = () => {
    navigation.navigate('SalliePanel' as never);
  };

  const handleAppPress = (appName: string) => {
    // Launch app logic here
    console.log(`Launching ${appName}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.timeSection}>
          <Text style={styles.time}>
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </Text>
          <Text style={styles.date}>
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleSalliePress} style={styles.sallieButton}>
          <SallieAvatar emotion={emotion} size={60} />
        </TouchableOpacity>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>
          How can I help you today?
        </Text>
      </View>

      {/* Emotion Meter */}
      <View style={styles.emotionSection}>
        <EmotionMeter />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <QuickActions />
      </View>

      {/* App Grid */}
      <View style={styles.appGridSection}>
        <Text style={styles.sectionTitle}>Your Apps</Text>
        <AppGrid onAppPress={handleAppPress} />
      </View>

      {/* Memory Summary */}
      <View style={styles.memorySection}>
        <Text style={styles.sectionTitle}>Recent Memories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {shortTerm.slice(-5).map((memory) => (
            <View key={memory.id} style={styles.memoryCard}>
              <Text style={styles.memoryContent} numberOfLines={2}>
                {memory.content}
              </Text>
              <Text style={styles.memoryTime}>
                {new Date(memory.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  timeSection: {
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  date: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 5,
  },
  sallieButton: {
    padding: 5,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0a0',
  },
  emotionSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  appGridSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  memorySection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  memoryCard: {
    backgroundColor: '#16213e',
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    width: 200,
    minHeight: 80,
  },
  memoryContent: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 10,
  },
  memoryTime: {
    color: '#a0a0a0',
    fontSize: 12,
  },
});
