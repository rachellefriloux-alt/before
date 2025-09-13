import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoryStore, MemoryItem } from '../../store/memory';
import { usePersonaStore } from '../../store/persona';
import MemoryCard from '../components/MemoryCard';
import MemoryStats from '../components/MemoryStats';

type MemoryFilter = 'all' | 'episodic' | 'semantic' | 'emotional' | 'recent';

export default function MemoriesScreen() {
  const { 
    shortTerm, 
    episodic, 
    semantic, 
    emotional, 
    searchMemories, 
    getMemoriesByType,
    removeMemory 
  } = useMemoryStore();
  
  const { emotionHistory } = usePersonaStore();
  
  const [selectedFilter, setSelectedFilter] = useState<MemoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMemories, setFilteredMemories] = useState<MemoryItem[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  useEffect(() => {
    updateFilteredMemories();
  }, [selectedFilter, searchQuery, shortTerm, episodic, semantic, emotional]);

  const updateFilteredMemories = () => {
    let memories: MemoryItem[] = [];

    switch (selectedFilter) {
      case 'all':
        memories = [...shortTerm, ...episodic, ...semantic, ...emotional];
        break;
      case 'episodic':
        memories = episodic;
        break;
      case 'semantic':
        memories = semantic;
        break;
      case 'emotional':
        memories = emotional;
        break;
      case 'recent':
        memories = shortTerm;
        break;
    }

    if (searchQuery.trim()) {
      memories = searchMemories(searchQuery);
    }

    // Sort by timestamp (most recent first)
    memories.sort((a, b) => b.timestamp - a.timestamp);
    setFilteredMemories(memories);
  };

  const handleMemoryPress = (memory: MemoryItem) => {
    setSelectedMemory(memory);
  };

  const handleDeleteMemory = (memory: MemoryItem) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeMemory(memory.id),
        },
      ]
    );
  };

  const filters = [
    { id: 'all', name: 'All', icon: '🧠', count: shortTerm.length + episodic.length + semantic.length + emotional.length },
    { id: 'recent', name: 'Recent', icon: '⏱️', count: shortTerm.length },
    { id: 'episodic', name: 'Episodes', icon: '📚', count: episodic.length },
    { id: 'semantic', name: 'Facts', icon: '🔍', count: semantic.length },
    { id: 'emotional', name: 'Feelings', icon: '❤️', count: emotional.length },
  ];

  const renderFilterButton = (filter: typeof filters[0]) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.selectedFilter
      ]}
      onPress={() => setSelectedFilter(filter.id as MemoryFilter)}
    >
      <Text style={styles.filterIcon}>{filter.icon}</Text>
      <Text style={[
        styles.filterName,
        selectedFilter === filter.id && styles.selectedFilterText
      ]}>
        {filter.name}
      </Text>
      <Text style={styles.filterCount}>{filter.count}</Text>
    </TouchableOpacity>
  );

  const renderMemoryItem = ({ item }: { item: MemoryItem }) => (
    <MemoryCard
      memory={item}
      onPress={() => handleMemoryPress(item)}
      onDelete={() => handleDeleteMemory(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Memory Palace</Text>
        <Text style={styles.subtitle}>
          {filteredMemories.length} memories stored
        </Text>
      </View>

      {/* Memory Statistics */}
      <View style={styles.statsSection}>
        <MemoryStats />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search memories..."
            placeholderTextColor="#a0a0a0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Memories List */}
      <View style={styles.memoriesSection}>
        {filteredMemories.length > 0 ? (
          <FlatList
            data={filteredMemories}
            renderItem={renderMemoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.memoriesContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧠</Text>
            <Text style={styles.emptyTitle}>No memories found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'Start creating memories by interacting with Sallie'}
            </Text>
          </View>
        )}
      </View>

      {/* Memory Detail Modal would go here */}
      {selectedMemory && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Memory Detail</Text>
              <TouchableOpacity onPress={() => setSelectedMemory(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>{selectedMemory.content}</Text>
              
              <View style={styles.modalMeta}>
                <Text style={styles.metaLabel}>Type:</Text>
                <Text style={styles.metaValue}>{selectedMemory.type}</Text>
              </View>
              
              <View style={styles.modalMeta}>
                <Text style={styles.metaLabel}>Emotion:</Text>
                <Text style={styles.metaValue}>{selectedMemory.emotion}</Text>
              </View>
              
              <View style={styles.modalMeta}>
                <Text style={styles.metaLabel}>Importance:</Text>
                <Text style={styles.metaValue}>
                  {Math.round(selectedMemory.importance * 100)}%
                </Text>
              </View>
              
              <View style={styles.modalMeta}>
                <Text style={styles.metaLabel}>Tags:</Text>
                <Text style={styles.metaValue}>
                  {selectedMemory.tags.join(', ')}
                </Text>
              </View>
              
              <View style={styles.modalMeta}>
                <Text style={styles.metaLabel}>Created:</Text>
                <Text style={styles.metaValue}>
                  {new Date(selectedMemory.timestamp).toLocaleString()}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  clearIcon: {
    color: '#a0a0a0',
    fontSize: 16,
    marginLeft: 10,
  },
  filtersSection: {
    marginBottom: 20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
  },
  filterButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#16213e',
    minWidth: 80,
  },
  selectedFilter: {
    backgroundColor: '#0f3460',
  },
  filterIcon: {
    fontSize: 16,
    marginBottom: 5,
  },
  filterName: {
    color: '#a0a0a0',
    fontSize: 12,
    marginBottom: 3,
  },
  selectedFilterText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  filterCount: {
    color: '#ffffff',
    fontSize: 10,
    backgroundColor: '#533483',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  memoriesSection: {
    flex: 1,
  },
  memoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 20,
    color: '#a0a0a0',
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalMeta: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metaLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    width: 100,
  },
  metaValue: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
    textTransform: 'capitalize',
  },
});
