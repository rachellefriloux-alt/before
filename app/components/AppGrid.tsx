import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { AndroidLauncher, AppInfo } from '../utils/AndroidLauncher';

interface App {
  id: string;
  name: string;
  package: string;
  icon: string;
  category: string;
}

interface AppGridProps {
  onAppPress: (appName: string) => void;
}

const { width } = Dimensions.get('window');
const numColumns = 4;
const itemWidth = (width - 60) / numColumns;

export default function AppGrid({ onAppPress }: AppGridProps) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [launcher] = useState(() => new AndroidLauncher());

  // Load apps from Android launcher
  useEffect(() => {
    const initializeLauncher = async () => {
      try {
        const initialized = await launcher.initialize();
        if (initialized) {
          const installedApps = launcher.getInstalledApps();
          setApps(installedApps);
          setFilteredApps(installedApps);
        } else {
          console.warn('Failed to initialize Android launcher, using mock data');
          // Keep existing mock data as fallback
        }
      } catch (error) {
        console.error('Error initializing launcher:', error);
      }
    };

    initializeLauncher();
  }, [launcher]);

  const categories = [
    { id: 'all', name: 'All', icon: '📱', count: apps.length },
    { id: 'communication', name: 'Communication', icon: '💬', count: apps.filter(a => a.category === 'communication').length },
    { id: 'entertainment', name: 'Entertainment', icon: '🎵', count: apps.filter(a => a.category === 'entertainment').length },
    { id: 'productivity', name: 'Productivity', icon: '📊', count: apps.filter(a => a.category === 'productivity').length },
    { id: 'utilities', name: 'Utilities', icon: '🔧', count: apps.filter(a => a.category === 'utilities').length },
    { id: 'navigation', name: 'Navigation', icon: '🗺️', count: apps.filter(a => a.category === 'navigation').length },
    { id: 'internet', name: 'Internet', icon: '🌐', count: apps.filter(a => a.category === 'internet').length },
    { id: 'social', name: 'Social', icon: '👥', count: apps.filter(a => a.category === 'social').length },
    { id: 'games', name: 'Games', icon: '🎮', count: apps.filter(a => a.category === 'games').length },
  ];

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredApps(apps);
    } else {
      setFilteredApps(apps.filter(app => app.category === category));
    }
  };

  const handleAppPress = async (app: AppInfo) => {
    try {
      const launched = await launcher.launchApp(app.packageName);
      if (launched) {
        onAppPress(app.appName);
      }
    } catch (error) {
      console.error('Failed to launch app:', error);
      onAppPress(app.appName); // Fallback to original handler
    }
  };

  const renderAppItem = ({ item }: { item: AppInfo }) => (
    <TouchableOpacity
      style={styles.appItem}
      onPress={() => handleAppPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.appIcon}>
        <Text style={styles.appIconText}>{launcher.getAppIcon(item.packageName)}</Text>
      </View>
      <Text style={styles.appName} numberOfLines={2}>
        {item.appName}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => filterByCategory(item.id)}
      activeOpacity={0.8}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
      <Text style={styles.categoryCount}>{item.count}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesList}
      />
      
      {/* Apps Grid */}
      <FlatList
        data={filteredApps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.appsContainer}
        style={styles.appsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  categoriesList: {
    marginBottom: 10,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#0f3460',
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: 5,
  },
  categoryName: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  categoryCount: {
    color: '#ffffff',
    fontSize: 10,
    backgroundColor: '#533483',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  appsContainer: {
    paddingHorizontal: 20,
  },
  appsList: {
    flex: 1,
  },
  appItem: {
    width: itemWidth,
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  appIconText: {
    fontSize: 24,
  },
  appName: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
