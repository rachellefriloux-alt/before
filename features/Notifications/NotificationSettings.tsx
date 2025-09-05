/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: UI component for notification settings management.
 * Got it, love.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import NotificationManager, { 
  NotificationType, 
  NotificationPriority,
  NotificationConfig
} from './NotificationManager';
import NotificationScheduler from './NotificationScheduler';
import DaySelector from '../../components/DaySelector';
import TimeRangePicker from '../../components/TimeRangePicker';
import { formatTime } from '../../utils/dateTimeUtils';
import theme from '../../constants/theme';

interface NotificationSettingsProps {
  onSave?: () => void;
}

export default function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [notificationManager, setNotificationManager] = useState<NotificationManager | null>(null);
  const [notificationScheduler, setNotificationScheduler] = useState<NotificationScheduler | null>(null);
  
  // Load notification settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const manager = NotificationManager.getInstance();
        const scheduler = NotificationScheduler.getInstance();
        
        // Initialize notification systems
        await manager.initialize();
        await scheduler.initialize();
        
        // Get current config
        setConfig(manager.getConfig());
        setNotificationManager(manager);
        setNotificationScheduler(scheduler);
      } catch (error) {
        console.error('Error loading notification settings:', error);
        Alert.alert('Error', 'Failed to load notification settings');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, []);
  
  // Save config changes
  const saveConfig = async (newConfig: NotificationConfig) => {
    if (!notificationManager) return;
    
    try {
      notificationManager.updateConfig(newConfig);
      setConfig(newConfig);
      
      if (onSave) {
        onSave();
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  // Toggle a specific setting
  const toggleSetting = (settingPath: string, value: any) => {
    if (!config) return;
    
    const newConfig = { ...config };
    
    // Handle nested paths (e.g., 'categories.REMINDER.enabled')
    const pathParts = settingPath.split('.');
    let current: any = newConfig;
    
    // Navigate to the nested property
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the value
    current[pathParts[pathParts.length - 1]] = value;
    
    // Save the updated config
    saveConfig(newConfig);
    
    // Provide haptic feedback
    Haptics.selectionAsync();
  };
  
  // Update max notifications per day
  const updateMaxNotifications = (type: NotificationType, value: number) => {
    if (!config) return;
    
    const newConfig = { ...config };
    if (!newConfig.categories[type]) {
      newConfig.categories[type] = { enabled: true, maxPerDay: 3 };
    }
    
    newConfig.categories[type].maxPerDay = Math.max(1, Math.min(10, value));
    
    saveConfig(newConfig);
    Haptics.selectionAsync();
  };
  
  // Toggle expanded section
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
    Haptics.selectionAsync();
  };
  
  if (isLoading || !config) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, isDark ? styles.textDark : styles.textLight]}>
          Loading notification settings...
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Master toggle */}
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.card, styles.masterToggleCard]}
      >
        <View style={styles.cardHeader}>
          <Ionicons 
            name="notifications" 
            size={24} 
            color={isDark ? theme.colors.primary : theme.colors.primary}
          />
          <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>
            Notifications
          </Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
            Enable all notifications
          </Text>
          <Switch
            value={Object.values(config.categories).some(cat => cat.enabled)}
            onValueChange={(value) => {
              // Enable/disable all categories
              const newConfig = { ...config };
              Object.keys(newConfig.categories).forEach(key => {
                newConfig.categories[key as NotificationType].enabled = value;
              });
              saveConfig(newConfig);
            }}
            trackColor={{ false: '#767577', true: theme.colors.primaryLight }}
            thumbColor={theme.colors.primary}
          />
        </View>
      </BlurView>
      
      {/* Sound & Vibration */}
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.card}
      >
        <TouchableOpacity 
          style={styles.cardHeader} 
          onPress={() => toggleSection('feedback')}
        >
          <Ionicons 
            name="volume-high" 
            size={24} 
            color={isDark ? theme.colors.primary : theme.colors.primary}
          />
          <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>
            Sound & Vibration
          </Text>
          <MaterialIcons
            name={expandedSection === 'feedback' ? 'expand-less' : 'expand-more'}
            size={24}
            color={isDark ? theme.colors.textLight : theme.colors.textDark}
            style={styles.expandIcon}
          />
        </TouchableOpacity>
        
        {expandedSection === 'feedback' && (
          <View style={styles.expandedContent}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                Sound
              </Text>
              <Switch
                value={config.enableSound}
                onValueChange={(value) => toggleSetting('enableSound', value)}
                trackColor={{ false: '#767577', true: theme.colors.primaryLight }}
                thumbColor={theme.colors.primary}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                Vibration
              </Text>
              <Switch
                value={config.enableVibration}
                onValueChange={(value) => toggleSetting('enableVibration', value)}
                trackColor={{ false: '#767577', true: theme.colors.primaryLight }}
                thumbColor={theme.colors.primary}
              />
            </View>
          </View>
        )}
      </BlurView>
      
      {/* Quiet Hours */}
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.card}
      >
        <TouchableOpacity 
          style={styles.cardHeader} 
          onPress={() => toggleSection('quietHours')}
        >
          <Ionicons 
            name="moon" 
            size={24} 
            color={isDark ? theme.colors.primary : theme.colors.primary}
          />
          <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>
            Quiet Hours
          </Text>
          <MaterialIcons
            name={expandedSection === 'quietHours' ? 'expand-less' : 'expand-more'}
            size={24}
            color={isDark ? theme.colors.textLight : theme.colors.textDark}
            style={styles.expandIcon}
          />
        </TouchableOpacity>
        
        {expandedSection === 'quietHours' && (
          <View style={styles.expandedContent}>
            <Text style={[styles.sectionDescription, isDark ? styles.textDark : styles.textLight]}>
              Sallie won't send notifications during quiet hours
            </Text>
            
            <TimeRangePicker
              startHour={config.quietHoursStart}
              endHour={config.quietHoursEnd}
              onChange={(start, end) => {
                const newConfig = { ...config };
                newConfig.quietHoursStart = start;
                newConfig.quietHoursEnd = end;
                saveConfig(newConfig);
              }}
              labelStyle={isDark ? styles.textDark : styles.textLight}
            />
            
            <View style={styles.dayPickerContainer}>
              <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                Active days:
              </Text>
              
              <DaySelector
                selectedDays={config.daysEnabled}
                onChange={(days) => toggleSetting('daysEnabled', days)}
                style={styles.daySelector}
              />
            </View>
          </View>
        )}
      </BlurView>
      
      {/* Notification Categories */}
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.card}
      >
        <TouchableOpacity 
          style={styles.cardHeader} 
          onPress={() => toggleSection('categories')}
        >
          <Ionicons 
            name="list" 
            size={24} 
            color={isDark ? theme.colors.primary : theme.colors.primary}
          />
          <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>
            Notification Types
          </Text>
          <MaterialIcons
            name={expandedSection === 'categories' ? 'expand-less' : 'expand-more'}
            size={24}
            color={isDark ? theme.colors.textLight : theme.colors.textDark}
            style={styles.expandIcon}
          />
        </TouchableOpacity>
        
        {expandedSection === 'categories' && (
          <View style={styles.expandedContent}>
            {Object.entries(config.categories).map(([type, settings]) => (
              <View key={type} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryName, isDark ? styles.textDark : styles.textLight]}>
                    {type.replace(/_/g, ' ')}
                  </Text>
                  <Switch
                    value={settings.enabled}
                    onValueChange={(value) => toggleSetting(`categories.${type}.enabled`, value)}
                    trackColor={{ false: '#767577', true: theme.colors.primaryLight }}
                    thumbColor={theme.colors.primary}
                  />
                </View>
                
                {settings.enabled && (
                  <View style={styles.maxNotificationsContainer}>
                    <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                      Max per day:
                    </Text>
                    <View style={styles.counterContainer}>
                      <TouchableOpacity
                        style={[styles.counterButton, isDark ? styles.buttonDark : styles.buttonLight]}
                        onPress={() => updateMaxNotifications(type as NotificationType, settings.maxPerDay - 1)}
                        disabled={settings.maxPerDay <= 1}
                      >
                        <Text style={styles.counterButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.counterValue, isDark ? styles.textDark : styles.textLight]}>
                        {settings.maxPerDay}
                      </Text>
                      <TouchableOpacity
                        style={[styles.counterButton, isDark ? styles.buttonDark : styles.buttonLight]}
                        onPress={() => updateMaxNotifications(type as NotificationType, settings.maxPerDay + 1)}
                        disabled={settings.maxPerDay >= 10}
                      >
                        <Text style={styles.counterButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </BlurView>
      
      {/* Test Notification */}
      <TouchableOpacity
        style={[styles.testButton, isDark ? styles.buttonDark : styles.buttonLight]}
        onPress={async () => {
          if (!notificationManager) return;
          
          try {
            const notificationId = await notificationManager.sendEngagementNotification(
              'Test Notification',
              'This is a test notification to verify your settings.'
            );
            
            if (notificationId) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              Alert.alert(
                'Could not send test notification',
                'Please check your notification permissions and settings.'
              );
            }
          } catch (error) {
            console.error('Error sending test notification:', error);
            Alert.alert('Error', 'Failed to send test notification');
          }
        }}
      >
        <Ionicons name="send" size={20} color={theme.colors.primary} />
        <Text style={[styles.testButtonText, { color: theme.colors.primary }]}>
          Send Test Notification
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f5f5f7',
  },
  containerDark: {
    backgroundColor: '#1c1c1e',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  masterToggleCard: {
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  categoryRow: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    paddingBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  maxNotificationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  counterValue: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dayPickerContainer: {
    marginTop: 16,
  },
  daySelector: {
    marginTop: 8,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f1f1f1',
  },
  buttonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonDark: {
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
  },
});
