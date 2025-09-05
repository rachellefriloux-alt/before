/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Analytics Panel Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

interface AnalyticsPanelProps {
  firebaseApp: FirebaseApp;
  theme?: 'light' | 'dark';
}

interface ActivityEntry {
  id: string;
  detail: string;
  timestamp: number;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  firebaseApp,
  theme = 'light'
}) => {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load activity data from Firebase
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const activityRef = collection(db, 'activity');

    const unsubscribe = onSnapshot(activityRef, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityEntry[];

      // Sort by timestamp, most recent first
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setActivity(activities);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firebaseApp]);

  // Add sample activity
  const addSample = async () => {
    setIsLoading(true);

    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, 'activity'), {
        detail: `Sample activity - ${new Date().toLocaleString()}`,
        timestamp: Date.now()
      });

      Alert.alert('Success', 'Sample activity added!');
    } catch (error: any) {
      Alert.alert('Error', `Failed to add activity: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete activity entry
  const deleteActivity = async (id: string, detail: string) => {
    Alert.alert(
      'Delete Activity',
      `Delete "${detail}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore(firebaseApp);
              await deleteDoc(doc(db, 'activity', id));
            } catch (error: any) {
              Alert.alert('Error', `Failed to delete: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  // Render activity item
  const renderActivityItem = ({ item }: { item: ActivityEntry }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onLongPress={() => deleteActivity(item.id, item.detail)}
      accessibilityLabel={`Activity: ${item.detail}`}
      accessibilityHint="Long press to delete"
    >
      <Text style={[styles.activityText, theme === 'dark' && styles.activityTextDark]}>
        {item.detail}
      </Text>
      <Text style={[styles.timestamp, theme === 'dark' && styles.timestampDark]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
      <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>
        Analytics & Insights
      </Text>

      <FlatList
        data={activity}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityItem}
        style={styles.activityList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, theme === 'dark' && styles.emptyTextDark]}>
            No activity data yet. Add your first activity below.
          </Text>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, isLoading && styles.addButtonDisabled]}
        onPress={addSample}
        disabled={isLoading}
        accessibilityLabel="Add Sample Activity"
        accessibilityHint="Add a sample activity entry"
      >
        <Text style={styles.addButtonText}>
          {isLoading ? 'Adding...' : 'Add Sample Activity'}
        </Text>
      </TouchableOpacity>

      {/* Activity count */}
      <Text style={[styles.activityCount, theme === 'dark' && styles.activityCountDark]}>
        Total activities: {activity.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  containerDark: {
    backgroundColor: '#1e1b4b',
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
  activityList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  activityItem: {
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
  activityText: {
    fontSize: 14,
    color: '#2d3748',
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTextDark: {
    color: '#e2e8f0',
  },
  timestamp: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
  timestampDark: {
    color: '#a0aec0',
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
  addButton: {
    backgroundColor: '#4c51bf',
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
  activityCount: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  activityCountDark: {
    color: '#a0aec0',
  },
});

export default AnalyticsPanel;
