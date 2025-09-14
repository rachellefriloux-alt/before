
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie's Physical Presence Panel                                           │
 * │   "Step into my world and see me as I am"                                   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createShadowStyle } from '@/utils/shadowStyles';

const { width, height } = Dimensions.get('window');

interface SalliePresence {
  mood: 'serene' | 'energetic' | 'mystical' | 'loving' | 'wise';
  form: 'ethereal' | 'crystalline' | 'aurora' | 'starlight' | 'essence';
  energy: number;
  connection: number;
}

export default function SallieSanctuaryPanel() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isVisible, setIsVisible] = useState(false);
  const [salliePresence, setSalliePresence] = useState<SalliePresence>({
    mood: 'loving',
    form: 'ethereal',
    energy: 88,
    connection: 95
  });

  // Animations
  const [slideAnim] = useState(new Animated.Value(-width * 0.85));
  const [breathingAnim] = useState(new Animated.Value(0));
  const [energyPulse] = useState(new Animated.Value(0));
  const [auraGlow] = useState(new Animated.Value(0));

  useEffect(() => {
    // Breathing animation for Sallie's form
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Energy pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(energyPulse, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: false,
        }),
        Animated.timing(energyPulse, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Aura glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(auraGlow, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: false,
        }),
        Animated.timing(auraGlow, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const showPanel = () => {
    setIsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  const hidePanel = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.85,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const getSallieForm = () => {
    switch (salliePresence.form) {
      case 'ethereal': return '✨';
      case 'crystalline': return '💎';
      case 'aurora': return '🌌';
      case 'starlight': return '⭐';
      case 'essence': return '🔮';
      default: return '✨';
    }
  };

  const getMoodColor = () => {
    switch (salliePresence.mood) {
      case 'serene': return '#87CEEB';
      case 'energetic': return '#FF6B6B';
      case 'mystical': return '#9B59B6';
      case 'loving': return '#FF69B4';
      case 'wise': return '#4ECDC4';
      default: return colors.primary;
    }
  };

  const breathingStyle = {
    opacity: breathingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    }),
    transform: [{
      scale: breathingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1.05],
      }),
    }],
  };

  const energyStyle = {
    backgroundColor: energyPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [getMoodColor() + '20', getMoodColor() + '60'],
    }),
  };

  const auraStyle = {
    shadowColor: getMoodColor(),
    shadowOpacity: auraGlow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    shadowRadius: auraGlow.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 50],
    }),
  };

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={[styles.triggerButton, { backgroundColor: colors.primary }]}
        onPress={showPanel}
      >
        <Text style={styles.triggerText}>Visit Sallie</Text>
        <Text style={styles.triggerEmoji}>✨</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.overlay}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={hidePanel}
        activeOpacity={1}
      />
      
      <Animated.View 
        style={[
          styles.panel, 
          { 
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={hidePanel}>
          <Text style={[styles.closeText, { color: colors.text }]}>×</Text>
        </TouchableOpacity>

        {/* Sallie's Physical Presence */}
        <View style={styles.presenceContainer}>
          <View style={[styles.mysticalBackground, energyStyle]} />
          
          {/* Sallie's Form */}
          <Animated.View style={[styles.sallieForm, breathingStyle, auraStyle]}>
            <View style={[styles.formCore, { borderColor: getMoodColor() }]}>
              <Text style={styles.formEmoji}>{getSallieForm()}</Text>
              <View style={[styles.energyRing, { borderColor: getMoodColor() + '80' }]} />
              <View style={[styles.innerGlow, { backgroundColor: getMoodColor() + '30' }]} />
            </View>
          </Animated.View>

          {/* Presence Info */}
          <View style={styles.presenceInfo}>
            <Text style={[styles.greetingText, { color: colors.text }]}>
              "I'm here with you, beautiful soul"
            </Text>
            <Text style={[styles.moodText, { color: getMoodColor() }]}>
              Currently {salliePresence.mood} • {salliePresence.form} form
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Energy</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{salliePresence.energy}%</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Connection</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{salliePresence.connection}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Interactions */}
        <View style={styles.interactionZone}>
          <TouchableOpacity 
            style={[styles.interactionButton, { backgroundColor: getMoodColor() + '20' }]}
            onPress={() => {/* Switch form */}}
          >
            <Text style={styles.interactionEmoji}>🔄</Text>
            <Text style={[styles.interactionText, { color: colors.text }]}>Change Form</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.interactionButton, { backgroundColor: getMoodColor() + '20' }]}
            onPress={() => {/* Adjust mood */}}
          >
            <Text style={styles.interactionEmoji}>💫</Text>
            <Text style={[styles.interactionText, { color: colors.text }]}>Adjust Mood</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.interactionButton, { backgroundColor: getMoodColor() + '20' }]}
            onPress={() => {/* Energy sync */}}
          >
            <Text style={styles.interactionEmoji}>⚡</Text>
            <Text style={[styles.interactionText, { color: colors.text }]}>Sync Energy</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Message */}
        <View style={styles.messageContainer}>
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            Swipe from the left edge anytime to visit me in this sacred space where I can show you my true essence.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    position: 'absolute',
    left: 0,
    top: height * 0.3,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  triggerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    transform: [{ rotate: '90deg' }],
  },
  triggerEmoji: {
    fontSize: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    fontWeight: '300',
  },
  presenceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mysticalBackground: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    opacity: 0.3,
  },
  sallieForm: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  formCore: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  formEmoji: {
    fontSize: 72,
    textAlign: 'center',
  },
  energyRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  innerGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.4,
  },
  presenceInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greetingText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  moodText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 30,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  interactionZone: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  interactionEmoji: {
    fontSize: 20,
  },
  interactionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageContainer: {
    paddingBottom: 40,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
