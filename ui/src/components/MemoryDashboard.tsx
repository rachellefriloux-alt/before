/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Memory Dashboard Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

interface MemoryDashboardProps {
  firebaseApp: FirebaseApp;
  theme?: 'light' | 'dark';
}

interface MemoryItem {
  id: string;
  key: string;
  value: string;
}

interface AnalyticsEvent {
  event: string;
  data: any;
  timestamp: number;
}

const MemoryDashboard: React.FC<MemoryDashboardProps> = ({
  firebaseApp,
  theme = 'light'
}) => {
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);

  // Load memory items from Firebase
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const memRef = collection(db, 'memory');

    const unsubscribe = onSnapshot(memRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemoryItem[];

      setMemoryItems(items);
      logAnalytics('memory_snapshot', { count: items.length });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firebaseApp]);

  // Add new memory item
  const addMemory = async () => {
    setError('');

    if (!newKey.trim() || !newValue.trim()) {
      const errorMsg = 'Key and value are required.';
      setError(errorMsg);
      logAnalytics('error', { error: errorMsg });
      return;
    }

    const db = getFirestore(firebaseApp);

    try {
      await addDoc(collection(db, 'memory'), {
        key: newKey.trim(),
        value: newValue.trim()
      });

      logAnalytics('add_memory', { key: newKey.trim() });

      // Clear inputs
      setNewKey('');
      setNewValue('');
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to add memory item';
      setError(errorMsg);
      logAnalytics('error', { error: errorMsg });
    }
  };

  // Delete memory item
  const deleteMemory = async (id: string, key: string) => {
    Alert.alert(
      'Delete Memory Item',
      `Are you sure you want to delete "${key}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore(firebaseApp);
              await deleteDoc(doc(db, 'memory', id));
              logAnalytics('delete_memory', { key });
            } catch (e: any) {
              const errorMsg = e.message || 'Failed to delete memory item';
              setError(errorMsg);
              logAnalytics('error', { error: errorMsg });
            }
          }
        }
      ]
    );
  };

  // Log analytics event
  const logAnalytics = (event: string, data: any) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now()
    };

    setAnalytics(prev => [...prev, analyticsEvent]);
  };

  // Render memory item
  const renderMemoryItem = ({ item }: { item: MemoryItem }) => (
    <TouchableOpacity
      style={styles.memoryItem}
      onLongPress={() => deleteMemory(item.id, item.key)}
      accessibilityLabel={`${item.key}: ${item.value}`}
      accessibilityHint="Long press to delete"
    >
      <Text style={styles.memoryKey}>{item.key}:</Text>
      <Text style={styles.memoryValue}>{item.value}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, theme === 'dark' && styles.containerDark]}
      accessibilityLabel="Memory Dashboard"
    >
      <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>
        Memory Dashboard
      </Text>

      <FlatList
        data={memoryItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMemoryItem}
        style={styles.memoryList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, theme === 'dark' && styles.emptyTextDark]}>
            No memory items yet. Add your first memory below.
          </Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, theme === 'dark' && styles.inputDark]}
          value={newKey}
          onChangeText={setNewKey}
          placeholder="Key"
          placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
          accessibilityLabel="Memory Key"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={[styles.input, theme === 'dark' && styles.inputDark]}
          value={newValue}
          onChangeText={setNewValue}
          placeholder="Value"
          placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
          accessibilityLabel="Memory Value"
          multiline
          numberOfLines={2}
        />

        <TouchableOpacity
          style={[styles.addButton, (!newKey.trim() || !newValue.trim()) && styles.addButtonDisabled]}
          onPress={addMemory}
          disabled={!newKey.trim() || !newValue.trim()}
          accessibilityLabel="Add Memory"
          accessibilityHint="Add a new memory item"
        >
          <Text style={styles.addButtonText}>Add Memory</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text
          style={styles.errorText}
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      ) : null}

      {/* Debug info for analytics (can be removed in production) */}
      {__DEV__ && analytics.length > 0 && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Analytics Events: {analytics.length}</Text>
          <Text style={styles.debugText}>
            Last event: {analytics[analytics.length - 1]?.event}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleDark: {
    color: '#e2e8f0',
  },
  memoryList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  memoryItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memoryKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  memoryValue: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#718096',
    fontStyle: 'italic',
    padding: 20,
  },
  emptyTextDark: {
    color: '#a0aec0',
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2d3748',
  },
  inputDark: {
    borderColor: '#4a5568',
    backgroundColor: '#2d3748',
    color: '#e2e8f0',
  },
  addButton: {
    backgroundColor: '#48bb78',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fed7d7',
    borderRadius: 4,
  },
  debugContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#edf2f7',
    borderRadius: 4,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  debugText: {
    fontSize: 10,
    color: '#718096',
  },
});

export default MemoryDashboard;
