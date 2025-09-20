import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useThemeStore } from '../store/theme';
import { usePersonaStore } from '../store/persona';
import { SallieThemes } from '../../constants/Colors';

export interface AdvancedLauncherConfig {
  // AI & Intelligence
  aiAssistanceLevel: 'minimal' | 'moderate' | 'full' | 'autonomous';
  learningEnabled: boolean;
  predictiveLoading: boolean;
  contextualSuggestions: boolean;
  proactiveAssistance: boolean;
  
  // Personalization & Themes
  adaptiveThemes: boolean;
  themeTransitions: boolean;
  personalityBasedUI: boolean;
  customAccentColors: string[];
  dynamicWallpapers: boolean;
  
  // Voice & Interaction
  voiceCommandsEnabled: boolean;
  voiceFeedback: boolean;
  hapticFeedback: 'none' | 'light' | 'medium' | 'heavy';
  gestureControls: {
    enabled: boolean;
    sensitivity: number;
    customGestures: any[];
  };
  
  // Performance & Optimization
  batteryOptimization: 'disabled' | 'balanced' | 'aggressive';
  performanceMode: 'battery_saver' | 'balanced' | 'performance';
  backgroundAppLimits: number;
  cacheManagement: 'automatic' | 'manual' | 'disabled';
  
  // Privacy & Security
  privacyLevel: 'standard' | 'enhanced' | 'maximum';
  dataEncryption: boolean;
  localOnlyMode: boolean;
  usageAnalytics: boolean;
  crashReporting: boolean;
  
  // Automation & Smart Features
  automationEnabled: boolean;
  smartFolders: boolean;
  intelligentGrouping: boolean;
  contextualShortcuts: boolean;
  timeBasedAutomation: boolean;
  locationBasedActions: boolean;
  
  // Developer & Advanced
  debugMode: boolean;
  developerOptions: boolean;
  experimentalFeatures: boolean;
  customScripts: any[];
  apiEndpoints: any;
}

export default function AdvancedLauncherSettings() {
  const { currentTheme, setTheme } = useThemeStore();
  const { personality, setPersonality } = usePersonaStore();
  const [config, setConfig] = useState<AdvancedLauncherConfig>({
    // Default configuration
    aiAssistanceLevel: 'full',
    learningEnabled: true,
    predictiveLoading: true,
    contextualSuggestions: true,
    proactiveAssistance: true,
    
    adaptiveThemes: true,
    themeTransitions: true,
    personalityBasedUI: true,
    customAccentColors: [],
    dynamicWallpapers: false,
    
    voiceCommandsEnabled: true,
    voiceFeedback: true,
    hapticFeedback: 'medium',
    gestureControls: {
      enabled: true,
      sensitivity: 0.7,
      customGestures: [],
    },
    
    batteryOptimization: 'balanced',
    performanceMode: 'balanced',
    backgroundAppLimits: 5,
    cacheManagement: 'automatic',
    
    privacyLevel: 'enhanced',
    dataEncryption: true,
    localOnlyMode: false,
    usageAnalytics: true,
    crashReporting: true,
    
    automationEnabled: true,
    smartFolders: true,
    intelligentGrouping: true,
    contextualShortcuts: true,
    timeBasedAutomation: true,
    locationBasedActions: false,
    
    debugMode: false,
    developerOptions: false,
    experimentalFeatures: false,
    customScripts: [],
    apiEndpoints: {},
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const saved = await SecureStore.getItemAsync('launcher_config');
      if (saved) {
        setConfig({ ...config, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const saveConfiguration = async (newConfig: AdvancedLauncherConfig) => {
    try {
      await SecureStore.setItemAsync('launcher_config', JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const updateConfig = (key: keyof AdvancedLauncherConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    saveConfiguration(newConfig);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Configuration',
      'This will reset all settings to defaults. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          const defaultConfig: AdvancedLauncherConfig = {
            aiAssistanceLevel: 'full',
            learningEnabled: true,
            predictiveLoading: true,
            contextualSuggestions: true,
            proactiveAssistance: true,
            adaptiveThemes: true,
            themeTransitions: true,
            personalityBasedUI: true,
            customAccentColors: [],
            dynamicWallpapers: false,
            voiceCommandsEnabled: true,
            voiceFeedback: true,
            hapticFeedback: 'medium',
            gestureControls: { enabled: true, sensitivity: 0.7, customGestures: [] },
            batteryOptimization: 'balanced',
            performanceMode: 'balanced',
            backgroundAppLimits: 5,
            cacheManagement: 'automatic',
            privacyLevel: 'enhanced',
            dataEncryption: true,
            localOnlyMode: false,
            usageAnalytics: true,
            crashReporting: true,
            automationEnabled: true,
            smartFolders: true,
            intelligentGrouping: true,
            contextualShortcuts: true,
            timeBasedAutomation: true,
            locationBasedActions: false,
            debugMode: false,
            developerOptions: false,
            experimentalFeatures: false,
            customScripts: [],
            apiEndpoints: {},
          };
          saveConfiguration(defaultConfig);
        }}
      ]
    );
  };

  const colors = SallieThemes.executiveSuite.colors;

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      {children}
    </View>
  );

  const SettingToggle = ({ title, description, value, onValueChange }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surface, true: colors.primary }}
        thumbColor={value ? colors.accent : colors.textSecondary}
      />
    </View>
  );

  const SettingSelector = ({ title, description, options, selectedValue, onValueChange }: {
    title: string;
    description: string;
    options: { label: string; value: any }[];
    selectedValue: any;
    onValueChange: (value: any) => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <View style={styles.selectorContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorOption,
              {
                backgroundColor: selectedValue === option.value ? colors.primary : colors.surface,
                borderColor: colors.border,
              }
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text style={[
              styles.selectorText,
              { color: selectedValue === option.value ? '#FFFFFF' : colors.text }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Advanced Launcher Settings</Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.primary }]}
          onPress={resetToDefaults}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SettingSection title="AI & Intelligence">
          <SettingSelector
            title="AI Assistance Level"
            description="How much AI assistance do you want?"
            options={[
              { label: 'Minimal', value: 'minimal' },
              { label: 'Moderate', value: 'moderate' },
              { label: 'Full', value: 'full' },
              { label: 'Autonomous', value: 'autonomous' },
            ]}
            selectedValue={config.aiAssistanceLevel}
            onValueChange={(value) => updateConfig('aiAssistanceLevel', value)}
          />
          
          <SettingToggle
            title="Learning Enabled"
            description="Allow Sallie to learn from your usage patterns"
            value={config.learningEnabled}
            onValueChange={(value) => updateConfig('learningEnabled', value)}
          />
          
          <SettingToggle
            title="Predictive Loading"
            description="Preload apps you're likely to use next"
            value={config.predictiveLoading}
            onValueChange={(value) => updateConfig('predictiveLoading', value)}
          />
          
          <SettingToggle
            title="Contextual Suggestions"
            description="Show suggestions based on time, location, and activity"
            value={config.contextualSuggestions}
            onValueChange={(value) => updateConfig('contextualSuggestions', value)}
          />
          
          <SettingToggle
            title="Proactive Assistance"
            description="Let Sallie proactively help with tasks"
            value={config.proactiveAssistance}
            onValueChange={(value) => updateConfig('proactiveAssistance', value)}
          />
        </SettingSection>

        <SettingSection title="Personalization & Themes">
          <SettingToggle
            title="Adaptive Themes"
            description="Automatically change themes based on time and context"
            value={config.adaptiveThemes}
            onValueChange={(value) => updateConfig('adaptiveThemes', value)}
          />
          
          <SettingToggle
            title="Theme Transitions"
            description="Smooth transitions when changing themes"
            value={config.themeTransitions}
            onValueChange={(value) => updateConfig('themeTransitions', value)}
          />
          
          <SettingToggle
            title="Personality-Based UI"
            description="Adapt interface based on Sallie's personality"
            value={config.personalityBasedUI}
            onValueChange={(value) => updateConfig('personalityBasedUI', value)}
          />
        </SettingSection>

        <SettingSection title="Voice & Interaction">
          <SettingToggle
            title="Voice Commands"
            description="Enable voice control for the launcher"
            value={config.voiceCommandsEnabled}
            onValueChange={(value) => updateConfig('voiceCommandsEnabled', value)}
          />
          
          <SettingToggle
            title="Voice Feedback"
            description="Sallie speaks responses and confirmations"
            value={config.voiceFeedback}
            onValueChange={(value) => updateConfig('voiceFeedback', value)}
          />
          
          <SettingSelector
            title="Haptic Feedback"
            description="Vibration feedback for interactions"
            options={[
              { label: 'None', value: 'none' },
              { label: 'Light', value: 'light' },
              { label: 'Medium', value: 'medium' },
              { label: 'Heavy', value: 'heavy' },
            ]}
            selectedValue={config.hapticFeedback}
            onValueChange={(value) => updateConfig('hapticFeedback', value)}
          />
        </SettingSection>

        <SettingSection title="Performance & Optimization">
          <SettingSelector
            title="Battery Optimization"
            description="How aggressively to save battery"
            options={[
              { label: 'Disabled', value: 'disabled' },
              { label: 'Balanced', value: 'balanced' },
              { label: 'Aggressive', value: 'aggressive' },
            ]}
            selectedValue={config.batteryOptimization}
            onValueChange={(value) => updateConfig('batteryOptimization', value)}
          />
          
          <SettingSelector
            title="Performance Mode"
            description="Balance between performance and battery"
            options={[
              { label: 'Battery Saver', value: 'battery_saver' },
              { label: 'Balanced', value: 'balanced' },
              { label: 'Performance', value: 'performance' },
            ]}
            selectedValue={config.performanceMode}
            onValueChange={(value) => updateConfig('performanceMode', value)}
          />
        </SettingSection>

        <SettingSection title="Privacy & Security">
          <SettingSelector
            title="Privacy Level"
            description="How much data to share for improved experience"
            options={[
              { label: 'Standard', value: 'standard' },
              { label: 'Enhanced', value: 'enhanced' },
              { label: 'Maximum', value: 'maximum' },
            ]}
            selectedValue={config.privacyLevel}
            onValueChange={(value) => updateConfig('privacyLevel', value)}
          />
          
          <SettingToggle
            title="Data Encryption"
            description="Encrypt all local data storage"
            value={config.dataEncryption}
            onValueChange={(value) => updateConfig('dataEncryption', value)}
          />
          
          <SettingToggle
            title="Local Only Mode"
            description="Keep all data local, no cloud sync"
            value={config.localOnlyMode}
            onValueChange={(value) => updateConfig('localOnlyMode', value)}
          />
          
          <SettingToggle
            title="Usage Analytics"
            description="Share usage data to improve Sallie"
            value={config.usageAnalytics}
            onValueChange={(value) => updateConfig('usageAnalytics', value)}
          />
        </SettingSection>

        <SettingSection title="Automation & Smart Features">
          <SettingToggle
            title="Automation Enabled"
            description="Allow Sallie to automate tasks based on rules"
            value={config.automationEnabled}
            onValueChange={(value) => updateConfig('automationEnabled', value)}
          />
          
          <SettingToggle
            title="Smart Folders"
            description="Automatically organize apps into smart folders"
            value={config.smartFolders}
            onValueChange={(value) => updateConfig('smartFolders', value)}
          />
          
          <SettingToggle
            title="Intelligent Grouping"
            description="Group apps based on usage patterns"
            value={config.intelligentGrouping}
            onValueChange={(value) => updateConfig('intelligentGrouping', value)}
          />
          
          <SettingToggle
            title="Contextual Shortcuts"
            description="Create shortcuts based on your routines"
            value={config.contextualShortcuts}
            onValueChange={(value) => updateConfig('contextualShortcuts', value)}
          />
          
          <SettingToggle
            title="Time-Based Automation"
            description="Automate actions based on time of day"
            value={config.timeBasedAutomation}
            onValueChange={(value) => updateConfig('timeBasedAutomation', value)}
          />
        </SettingSection>

        <SettingSection title="Developer & Advanced">
          <SettingToggle
            title="Debug Mode"
            description="Enable debugging information and logs"
            value={config.debugMode}
            onValueChange={(value) => updateConfig('debugMode', value)}
          />
          
          <SettingToggle
            title="Developer Options"
            description="Show advanced developer settings"
            value={config.developerOptions}
            onValueChange={(value) => updateConfig('developerOptions', value)}
          />
          
          <SettingToggle
            title="Experimental Features"
            description="Enable cutting-edge experimental features"
            value={config.experimentalFeatures}
            onValueChange={(value) => updateConfig('experimentalFeatures', value)}
          />
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '500',
  },
});