
import React from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { SallieThemes } from '@/constants/Colors';

interface FlowItem {
  id: string;
  side: 'left' | 'right';
  content: React.ReactNode;
  timestamp?: Date;
}

interface FlowingRiverLayoutProps {
  items: FlowItem[];
  theme?: keyof typeof SallieThemes;
}

export const FlowingRiverLayout: React.FC<FlowingRiverLayoutProps> = ({ 
  items, 
  theme = 'glassAesthetic' 
}) => {
  const colors = SallieThemes[theme].colors;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.river}>
        {/* Flowing center line */}
        <View style={[styles.centerLine, { backgroundColor: colors.primary }]} />
        
        {items.map((item, index) => (
          <View key={item.id} style={styles.flowItem}>
            <View style={[
              styles.bubble,
              item.side === 'left' ? styles.bubbleLeft : styles.bubbleRight,
              { backgroundColor: colors.surface }
            ]}>
              <BlurView intensity={80} style={styles.blurContent}>
                {item.content}
              </BlurView>
              
              {/* Connector to center line */}
              <View style={[
                styles.connector,
                item.side === 'left' ? styles.connectorLeft : styles.connectorRight,
                { backgroundColor: colors.primary }
              ]} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  river: {
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.3,
  },
  flowItem: {
    marginVertical: 10,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    marginRight: '25%',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    marginLeft: '25%',
  },
  blurContent: {
    borderRadius: 20,
  },
  connector: {
    position: 'absolute',
    width: 20,
    height: 2,
    top: '50%',
  },
  connectorLeft: {
    right: -22,
  },
  connectorRight: {
    left: -22,
  },
});
