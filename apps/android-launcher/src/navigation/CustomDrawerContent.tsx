/*
 * Sallie Sovereign - Custom Drawer Content
 * Enhanced drawer with personality status and system info
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { usePersona } from '../contexts/PersonaContext';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { personalityState, currentEmotion } = usePersona();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person-circle" size={72} color="#6366F1" />
            </View>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(currentEmotion) }]} />
            </View>
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.name}>Sallie</Text>
            <Text style={styles.status}>
              Feeling {currentEmotion || 'content'}
            </Text>
          </View>
        </View>

        {/* Personality Summary */}
        <View style={styles.personalitySection}>
          <Text style={styles.sectionTitle}>Current State</Text>
          <View style={styles.traitRow}>
            <Ionicons name="heart" size={16} color="#EF4444" />
            <Text style={styles.traitText}>
              Empathy: {Math.round((personalityState?.traits?.empathy?.value || 0.9) * 100)}%
            </Text>
          </View>
          <View style={styles.traitRow}>
            <Ionicons name="shield" size={16} color="#10B981" />
            <Text style={styles.traitText}>
              Loyalty: {Math.round((personalityState?.traits?.loyalty?.value || 0.95) * 100)}%
            </Text>
          </View>
          <View style={styles.traitRow}>
            <Ionicons name="bulb" size={16} color="#F59E0B" />
            <Text style={styles.traitText}>
              Creativity: {Math.round((personalityState?.traits?.creativity?.value || 0.8) * 100)}%
            </Text>
          </View>
        </View>

        {/* Navigation Items */}
        <View style={styles.navigationSection}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Sallie Sovereign v1.0</Text>
        <Text style={styles.footerSubtext}>Your AI Companion</Text>
      </View>
    </View>
  );
}

function getStatusColor(emotion: string): string {
  const colorMap: Record<string, string> = {
    happy: '#10B981',
    excited: '#F59E0B',
    content: '#6366F1',
    sad: '#6B7280',
    angry: '#EF4444',
    worried: '#F59E0B',
    calm: '#06B6D4',
  };
  return colorMap[emotion] || '#6366F1';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#6366F1',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerText: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  personalitySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  traitText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 8,
  },
  navigationSection: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});