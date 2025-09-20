/*
 * Sallie Sovereign - Memory Screen
 * View and manage conversation memories and experiences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useMemory } from '../contexts/MemoryContext';
import { MemoryItem } from '../../../core/memory/MemorySystem';

export default function MemoryScreen() {
  const { theme } = useTheme();
  const { 
    memoryStats, 
    recentConversations, 
    userPreferences,
    retrieveMemories 
  } = useMemory();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'recent' | 'search' | 'preferences'>('recent');

  const styles = createStyles(theme);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await retrieveMemories(searchQuery, undefined, 20);
      setSearchResults(results);
      setActiveTab('search');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getMemoryTypeIcon = (type: string) => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      conversation: 'chatbubbles',
      experience: 'telescope',
      fact: 'library',
      preference: 'heart',
      emotion: 'happy'
    };
    return icons[type] || 'document';
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.8) return theme.colors.error;
    if (importance >= 0.6) return theme.colors.warning;
    if (importance >= 0.4) return theme.colors.accent;
    return theme.colors.textSecondary;
  };

  const renderMemoryItem = ({ item }: { item: MemoryItem }) => (
    <View style={styles.memoryItem}>
      <View style={styles.memoryHeader}>
        <View style={styles.memoryMeta}>
          <Ionicons 
            name={getMemoryTypeIcon(item.type)} 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.memoryType}>{item.type.toUpperCase()}</Text>
          <View style={styles.importanceDot}>
            <View 
              style={[
                styles.importanceIndicator, 
                { backgroundColor: getImportanceColor(item.importance) }
              ]} 
            />
          </View>
        </View>
        <Text style={styles.memoryTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      
      <Text style={styles.memoryContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
          )}
        </View>
      )}
      
      <View style={styles.memoryFooter}>
        <Text style={styles.accessCount}>
          Accessed {item.accessCount} times
        </Text>
        <Text style={styles.importance}>
          {Math.round(item.importance * 100)}% important
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <Text style={styles.title}>Memory Bank</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memoryStats.totalMemories || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memoryStats.shortTermCount || 0}</Text>
            <Text style={styles.statLabel}>Recent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memoryStats.longTermCount || 0}</Text>
            <Text style={styles.statLabel}>Stored</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search memories..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
          onPress={() => setActiveTab('preferences')}
        >
          <Text style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>
            Preferences
          </Text>
        </TouchableOpacity>
        {searchResults.length > 0 && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
              Search ({searchResults.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Memory List */}
      <View style={styles.listContainer}>
        {activeTab === 'recent' && (
          <FlatList
            data={recentConversations}
            renderItem={renderMemoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No recent conversations</Text>
                <Text style={styles.emptySubtext}>Start chatting with Sallie to build memories</Text>
              </View>
            }
          />
        )}

        {activeTab === 'preferences' && (
          <FlatList
            data={userPreferences}
            renderItem={renderMemoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No preferences learned</Text>
                <Text style={styles.emptySubtext}>Share your likes and dislikes with Sallie</Text>
              </View>
            }
          />
        )}

        {activeTab === 'search' && (
          <FlatList
            data={searchResults}
            renderItem={renderMemoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No search results</Text>
                <Text style={styles.emptySubtext}>Try different keywords</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    searchContainer: {
      padding: theme.spacing.md,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.text,
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      padding: theme.spacing.md,
    },
    memoryItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    memoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    memoryMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memoryType: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },
    importanceDot: {
      marginLeft: theme.spacing.sm,
    },
    importanceIndicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    memoryTimestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    memoryContent: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.sm,
    },
    tag: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
      marginBottom: 4,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    moreTagsText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      alignSelf: 'center',
    },
    memoryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    accessCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    importance: {
      fontSize: 12,
      color: theme.colors.accent,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.text,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
}