
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SallieThemes } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface HexagonItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface MysticalHexagonGridProps {
  items: HexagonItem[];
  theme?: keyof typeof SallieThemes;
}

export const MysticalHexagonGrid: React.FC<MysticalHexagonGridProps> = ({
  items,
  theme = 'glassAesthetic'
}) => {
  const colors = SallieThemes[theme].colors;
  const hexSize = (width - 60) / 3;

  return (
    <View style={styles.container}>
      <View style={styles.hexGrid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.hexContainer,
              {
                width: hexSize,
                height: hexSize,
                marginTop: index % 2 === 1 ? hexSize * 0.25 : 0,
              }
            ]}
            onPress={item.onPress}
          >
            <View style={[styles.hexagon, { backgroundColor: item.color }]}>
              <LinearGradient
                colors={[item.color, `${item.color}80`]}
                style={styles.hexagonGradient}
              />
              <View style={styles.hexContent}>
                <Text style={styles.hexIcon}>{item.icon}</Text>
                <Text style={[styles.hexTitle, { color: colors.card }]}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={[styles.hexSubtitle, { color: colors.card }]}>{item.subtitle}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  hexGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
  },
  hexContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagon: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    transform: [{ rotate: '0deg' }],
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  hexagonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  hexContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  hexIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  hexTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  hexSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
