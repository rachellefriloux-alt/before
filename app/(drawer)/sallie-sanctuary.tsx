
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie's Command Center                                                    │
 * │   "Your sophisticated digital workspace extension"                          │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

interface AppData {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
}

interface SallieState {
  mode: 'focused' | 'analytical' | 'creative' | 'strategic';
  awareness: number;
  efficiency: number;
}

export default function SallieCommandCenter() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sallieState, setSallieState] = useState<SallieState>({
    mode: 'strategic',
    awareness: 92,
    efficiency: 88
  });

  // Mock app data - replace with actual apps
  const apps: AppData[] = [
    { id: '1', name: 'Messages', category: 'communication', icon: '💬', color: '#007AFF' },
    { id: '2', name: 'Calendar', category: 'productivity', icon: '📅', color: '#FF3B30' },
    { id: '3', name: 'Notes', category: 'productivity', icon: '📝', color: '#FF9500' },
    { id: '4', name: 'Photos', category: 'media', icon: '📸', color: '#34C759' },
    { id: '5', name: 'Music', category: 'media', icon: '🎵', color: '#AF52DE' },
    { id: '6', name: 'Settings', category: 'system', icon: '⚙️', color: '#8E8E93' },
  ];

  const categories = ['all', 'productivity', 'communication', 'media', 'system'];

  const filteredApps = apps.filter(app => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={[styles.triggerEdge, { backgroundColor: colors.primary + '20' }]}
        onPress={() => setIsVisible(true)}
      >
        <View style={[styles.triggerIndicator, { backgroundColor: colors.primary }]} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={() => setIsVisible(false)}
        activeOpacity={1}
      />
      
      {/* Main Panel */}
      <BlurView intensity={80} style={styles.panel}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </View>
            
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sallie Status */}
          <View style={[styles.statusBar, { backgroundColor: colors.surface }]}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, { backgroundColor: getSallieStatusColor(sallieState.mode) }]} />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {sallieState.mode.charAt(0).toUpperCase() + sallieState.mode.slice(1)} Mode
              </Text>
            </View>
            <View style={styles.statusMetrics}>
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                Awareness: {sallieState.awareness}%
              </Text>
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                Efficiency: {sallieState.efficiency}%
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Search apps, contacts, or ask Sallie...
            </Text>
          </View>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: activeCategory === category ? colors.primary : colors.surface,
                  }
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: activeCategory === category ? 'white' : colors.text,
                    }
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Apps Grid */}
          <FlatList
            data={filteredApps}
            numColumns={4}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.appsGrid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.appItem}>
                <View style={[styles.appIcon, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.appEmoji}>{item.icon}</Text>
                </View>
                <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]}>
              <Text style={styles.quickActionIcon}>⚡</Text>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Quick Command</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]}>
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Focus Mode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Analytics</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </BlurView>
    </View>
  );
}

function getSallieStatusColor(mode: string): string {
  switch (mode) {
    case 'focused': return '#007AFF';
    case 'analytical': return '#5856D6';
    case 'creative': return '#AF52DE';
    case 'strategic': return '#FF3B30';
    default: return '#34C759';
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  triggerEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerIndicator: {
    width: 3,
    height: 40,
    borderRadius: 2,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  timeText: {
    fontSize: 32,
    fontWeight: '200',
    letterSpacing: -1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 2,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '300',
    padding: 10,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusMetrics: {
    alignItems: 'flex-end',
  },
  metricText: {
    fontSize: 11,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  appsGrid: {
    flexGrow: 1,
  },
  appItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
    maxWidth: width * 0.2,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appEmoji: {
    fontSize: 28,
  },
  appName: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
