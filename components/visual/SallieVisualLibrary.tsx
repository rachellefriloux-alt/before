
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../hooks/useTheme';

export interface VisualAsset {
  id: string;
  name: string;
  category: 'mood' | 'season' | 'persona' | 'event' | 'layout';
  mood?: 'high' | 'low' | 'reflective' | 'steady';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  persona?: string;
  source: any; // Image source
  description: string;
}

export interface SallieVisualLibraryProps {
  onAssetSelect?: (asset: VisualAsset) => void;
  category?: 'mood' | 'season' | 'persona' | 'event' | 'layout' | 'all';
}

const VISUAL_ASSETS: VisualAsset[] = [
  // Mood Assets
  {
    id: 'high_energy',
    name: 'High Energy',
    category: 'mood',
    mood: 'high',
    source: require('../../app/assets/moods/high_accent.svg'),
    description: 'Vibrant and energetic mood indicator'
  },
  {
    id: 'steady_calm',
    name: 'Steady Calm',
    category: 'mood',
    mood: 'steady',
    source: require('../../app/assets/moods/steady_accent.svg'),
    description: 'Balanced and centered mood'
  },
  {
    id: 'reflective_deep',
    name: 'Reflective Deep',
    category: 'mood',
    mood: 'reflective',
    source: require('../../app/assets/moods/reflective_accent.svg'),
    description: 'Thoughtful and introspective mood'
  },
  {
    id: 'low_gentle',
    name: 'Low Gentle',
    category: 'mood',
    mood: 'low',
    source: require('../../app/assets/moods/low_accent.svg'),
    description: 'Soft and gentle mood indicator'
  },
  // Season Assets
  {
    id: 'spring_renewal',
    name: 'Spring Renewal',
    category: 'season',
    season: 'spring',
    source: require('../../app/assets/seasons/spring_bg.svg'),
    description: 'Fresh growth and new beginnings'
  },
  {
    id: 'summer_vitality',
    name: 'Summer Vitality',
    category: 'season',
    season: 'summer',
    source: require('../../app/assets/seasons/summer_bg.svg'),
    description: 'Warm energy and full bloom'
  },
  {
    id: 'autumn_wisdom',
    name: 'Autumn Wisdom',
    category: 'season',
    season: 'autumn',
    source: require('../../app/assets/seasons/autumn_bg.svg'),
    description: 'Harvest time and reflection'
  },
  {
    id: 'winter_contemplation',
    name: 'Winter Contemplation',
    category: 'season',
    season: 'winter',
    source: require('../../app/assets/seasons/winter_bg.svg'),
    description: 'Quiet introspection and rest'
  }
];

export const SallieVisualLibrary: React.FC<SallieVisualLibraryProps> = ({
  onAssetSelect,
  category = 'all'
}) => {
  const { theme } = useTheme();

  const filteredAssets = category === 'all' 
    ? VISUAL_ASSETS 
    : VISUAL_ASSETS.filter(asset => asset.category === category);

  const renderAsset = (asset: VisualAsset) => (
    <View key={asset.id} style={[styles.assetCard, { borderColor: theme.colors.border }]}>
      <View style={styles.assetPreview}>
        {/* Asset preview would render here */}
      </View>
      <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
      <ThemedText style={styles.assetDescription}>{asset.description}</ThemedText>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>Sallie Visual Library</ThemedText>
      <View style={styles.assetsGrid}>
        {filteredAssets.map(renderAsset)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  assetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  assetCard: {
    width: '48%',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  assetPreview: {
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default SallieVisualLibrary;
