/*
 * Sallie Sovereign - Settings Screen
 * Configuration and preferences for the AI launcher
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useDevice } from '../contexts/DeviceContext';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { requestPermissions, permissionStatus, availableCapabilities } = useDevice();

  const handlePermissionRequest = async (capability: string) => {
    const granted = await requestPermissions([capability]);
    if (granted) {
      Alert.alert('Success', `Permission granted for ${capability}`);
    } else {
      Alert.alert('Error', `Permission denied for ${capability}`);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color={theme.colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Theme</Text>
                <Text style={styles.settingDescription}>Use dark mode interface</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={isDark ? theme.colors.accent : theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Permissions</Text>
          
          {availableCapabilities.map((capability) => (
            <TouchableOpacity
              key={capability.name}
              style={styles.settingRow}
              onPress={() => handlePermissionRequest(capability.name)}
            >
              <View style={styles.settingInfo}>
                <Ionicons 
                  name={permissionStatus[capability.name] ? "checkmark-circle" : "alert-circle"} 
                  size={24} 
                  color={permissionStatus[capability.name] ? theme.colors.success : theme.colors.warning} 
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{capability.name.replace(/_/g, ' ').toUpperCase()}</Text>
                  <Text style={styles.settingDescription}>{capability.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Configuration</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="brain" size={24} color={theme.colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Personality Settings</Text>
                <Text style={styles.settingDescription}>Adjust Sallie's personality traits</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud" size={24} color={theme.colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Local Mode</Text>
                <Text style={styles.settingDescription}>Enable offline-only operation</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Data Encryption</Text>
                <Text style={styles.settingDescription}>Encrypt stored conversations and data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash" size={24} color={theme.colors.error} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Clear All Data</Text>
                <Text style={styles.settingDescription}>Remove all conversations and memories</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });
}