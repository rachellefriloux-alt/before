import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { useDeviceStore } from '../store/device';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';
import { useThemeStore } from '../store/theme';
import SettingsSection from '../components/SettingsSection';
import SettingsItem from '../components/SettingsItem';

export default function SettingsScreen() {
  const { 
    settings, 
    permissions, 
    updateSettings, 
    setPermission,
    isLauncher,
    setLauncherMode 
  } = useDeviceStore();
  
  const persona = usePersonaStore();
  const { personality, setPersonality } = persona;
  const { clearShortTerm } = useMemoryStore();
  const { 
    currentTheme, 
    themeName, 
    setTheme, 
    getAvailableThemes, 
    animations, 
    setAnimations,
    reducedMotion,
    setReducedMotion
  } = useThemeStore();
  
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setShowThemeModal(false);
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Language Settings',
      'Language selection will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handlePersonalityChange = (newPersonality: string) => {
    setPersonality(newPersonality);
    setShowPersonalityModal(false);
    Alert.alert(
      'Personality Updated',
      `Sallie's personality has been updated to ${newPersonality.replace('_', ' ')}.`,
      [{ text: 'OK' }]
    );
  };

  const handleClearData = (type: 'memories' | 'emotions' | 'all') => {
    const actions = {
      memories: {
        title: 'Clear Memories',
        message: 'This will clear all short-term memories. Are you sure?',
        action: clearShortTerm,
      },
      emotions: {
        title: 'Clear Emotion History',
        message: 'This will clear all emotional history. Are you sure?',
        action: () => persona.updateEmotionalState?.({ emotionHistory: [] }),
      },
      all: {
        title: 'Reset All Data',
        message: 'This will reset all data including memories, emotions, and settings. Are you sure?',
        action: () => {
          clearShortTerm();
          persona.updateEmotionalState?.({ emotionHistory: [] });
          updateSettings({
            autoLaunch: true,
            keepAwake: false,
            batteryOptimization: false,
            theme: 'auto',
            language: 'en',
            timezone: 'UTC',
          });
        },
      },
    };

    const config = actions[type];
    
    Alert.alert(
      config.title,
      config.message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: config.action,
        },
      ]
    );
  };

  const personalityOptions = [
    {
      id: 'tough_love_soul_care',
      name: 'Tough Love & Soul Care',
      description: 'Honest, caring, and supportive with a firm but loving approach',
    },
    {
      id: 'gentle_companion',
      name: 'Gentle Companion',
      description: 'Soft, nurturing, and always understanding',
    },
    {
      id: 'wise_mentor',
      name: 'Wise Mentor',
      description: 'Knowledgeable, thoughtful, and guidance-focused',
    },
    {
      id: 'playful_friend',
      name: 'Playful Friend',
      description: 'Fun, energetic, and always ready for adventure',
    },
    {
      id: 'professional_assistant',
      name: 'Professional Assistant',
      description: 'Efficient, organized, and task-oriented',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={currentTheme.gradients.background}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Enhanced Header */}
        <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: currentTheme.colors.textSecondary }]}>
            Customize your Sallie experience
          </Text>
        </View>

        {/* Theme Settings */}
        <SettingsSection title="Appearance" icon="🎨">
          <SettingsItem
            title="Theme"
            subtitle={currentTheme.displayName}
            type="button"
            onPress={() => setShowThemeModal(true)}
          />
          
          <SettingsItem
            title="Animations"
            subtitle="Enable smooth animations and transitions"
            type="switch"
            value={animations}
            onValueChange={setAnimations}
          />
          
          <SettingsItem
            title="Reduced Motion"
            subtitle="Minimize motion for accessibility"
            type="switch"
            value={reducedMotion}
            onValueChange={setReducedMotion}
          />
          
          <SettingsItem
            title="Language"
            subtitle={settings.language.toUpperCase()}
            type="button"
            onPress={handleLanguageChange}
          />
        </SettingsSection>

        {/* Launcher Settings */}
        <SettingsSection title="Launcher" icon="🏠">
          <SettingsItem
            title="Enable Launcher Mode"
            subtitle="Use Sallie as your default home screen"
            type="switch"
            value={isLauncher}
            onValueChange={setLauncherMode}
          />
          
          <SettingsItem
            title="Auto Launch"
            subtitle="Automatically start when device boots"
            type="switch"
            value={settings.autoLaunch}
            onValueChange={(value) => updateSettings({ autoLaunch: value })}
            disabled={!isLauncher}
          />
          
          <SettingsItem
            title="Keep Awake"
            subtitle="Prevent screen from sleeping"
            type="switch"
            value={settings.keepAwake}
            onValueChange={(value) => updateSettings({ keepAwake: value })}
          />
          
          <SettingsItem
            title="Battery Optimization"
            subtitle="Ignore battery optimization for background operation"
            type="switch"
            value={settings.batteryOptimization}
            onValueChange={(value) => updateSettings({ batteryOptimization: value })}
          />
        </SettingsSection>

        {/* Personality Settings */}
        <SettingsSection title="Personality" icon="🤖">
          <SettingsItem
            title="Personality Type"
            subtitle={personality.replace('_', ' ')}
            type="button"
            onPress={() => setShowPersonalityModal(true)}
          />
        </SettingsSection>

        {/* Permissions */}
        <SettingsSection title="Permissions" icon="🔒">
          <SettingsItem
            title="Camera"
            subtitle="Allow camera access for photos and video"
            type="switch"
            value={permissions.camera}
            onValueChange={(value) => setPermission('camera', value)}
          />
          
          <SettingsItem
            title="Microphone"
            subtitle="Allow microphone access for voice input"
            type="switch"
            value={permissions.microphone}
            onValueChange={(value) => setPermission('microphone', value)}
          />
          
          <SettingsItem
            title="Location"
            subtitle="Allow location access for location-based features"
            type="switch"
            value={permissions.location}
            onValueChange={(value) => setPermission('location', value)}
          />
          
          <SettingsItem
            title="Contacts"
            subtitle="Allow access to contacts for communication features"
            type="switch"
            value={permissions.contacts}
            onValueChange={(value) => setPermission('contacts', value)}
          />
          
          <SettingsItem
            title="Notifications"
            subtitle="Allow notifications from Sallie"
            type="switch"
            value={permissions.notifications}
            onValueChange={(value) => setPermission('notifications', value)}
          />
          
          <SettingsItem
            title="Storage"
            subtitle="Allow storage access for file management"
            type="switch"
            value={permissions.storage}
            onValueChange={(value) => setPermission('storage', value)}
          />
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data Management" icon="💾">
          <SettingsItem
            title="Clear Short-term Memories"
            subtitle="Remove all temporary memories"
            type="button"
            onPress={() => handleClearData('memories')}
            destructive
          />
          
          <SettingsItem
            title="Clear Emotion History"
            subtitle="Remove all emotional tracking data"
            type="button"
            onPress={() => handleClearData('emotions')}
            destructive
          />
          
          <SettingsItem
            title="Reset All Data"
            subtitle="Clear all data and reset to defaults"
            type="button"
            onPress={() => handleClearData('all')}
            destructive
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon="ℹ️">
          <SettingsItem
            title="Version"
            subtitle="1.0.0 - Advanced & Beautiful Edition"
            type="info"
          />
          
          <SettingsItem
            title="Build"
            subtitle="Sallie Sovereign - React Native Edition"
            type="info"
          />
          
          <SettingsItem
            title="Developer"
            subtitle="Sallie Sovereign Team"
            type="info"
          />
        </SettingsSection>

        {/* Theme Selection Modal */}
        <Modal
          visible={showThemeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: currentTheme.colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
                  Choose Theme
                </Text>
                <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                  <Text style={[styles.modalClose, { color: currentTheme.colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                {getAvailableThemes().map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.themeOption,
                      { backgroundColor: currentTheme.colors.card },
                      themeName === theme && { backgroundColor: currentTheme.colors.primary }
                    ]}
                    onPress={() => handleThemeChange(theme)}
                  >
                    <LinearGradient
                      colors={currentTheme.gradients.primary}
                      style={styles.themePreview}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.themeInfo}>
                      <Text style={[
                        styles.themeName,
                        { color: currentTheme.colors.text },
                        themeName === theme && { color: currentTheme.colors.background }
                      ]}>
                        {theme.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text style={[
                        styles.themeDescription,
                        { color: currentTheme.colors.textSecondary },
                        themeName === theme && { color: currentTheme.colors.surface }
                      ]}>
                        {getThemeDescription(theme)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Personality Selection Modal */}
        <Modal
          visible={showPersonalityModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPersonalityModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: currentTheme.colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: currentTheme.colors.border }]}>
                <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
                  Choose Personality
                </Text>
                <TouchableOpacity onPress={() => setShowPersonalityModal(false)}>
                  <Text style={[styles.modalClose, { color: currentTheme.colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                {personalityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.personalityOption,
                      { backgroundColor: currentTheme.colors.card },
                      personality === option.id && { backgroundColor: currentTheme.colors.primary }
                    ]}
                    onPress={() => handlePersonalityChange(option.id)}
                  >
                    <Text style={[
                      styles.personalityName,
                      { color: currentTheme.colors.text },
                      personality === option.id && { color: currentTheme.colors.background }
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[
                      styles.personalityDescription,
                      { color: currentTheme.colors.textSecondary },
                      personality === option.id && { color: currentTheme.colors.surface }
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );

  function getThemeDescription(theme: string): string {
    const descriptions: Record<string, string> = {
      'grace-grind': 'Warm browns and golds for elegance and determination',
      'southern-grit': 'Deep reds and earth tones for strength and tradition',
      'hustle-legacy': 'Purple and gold for ambition and royalty',
      'soul-care': 'Soft grays and yellows for peace and comfort',
      'quiet-power': 'Subtle grays and purples for understated strength',
      'midnight-hustle': 'Dark blues and oranges for late-night productivity',
    };
    return descriptions[theme] || 'Beautiful color palette';
  }
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
  scrollView: {
    flex: 1,
  },
  header: {
    marginHorizontal: 20,
    marginTop: 10,
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 20,
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  personalityOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  personalityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  personalityDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
});
