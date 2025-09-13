import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemoryStore } from '../../store/memory';
import { usePersonaStore } from '../../store/persona';

export default function MemoryStats() {
  const { shortTerm, episodic, semantic, emotional } = useMemoryStore();
  const { emotionHistory } = usePersonaStore();

  const totalMemories = shortTerm.length + episodic.length + semantic.length + emotional.length;
  
  const getMemoryPercentage = (count: number) => {
    return totalMemories > 0 ? (count / totalMemories) * 100 : 0;
  };

  const getAverageImportance = () => {
    const allMemories = [...shortTerm, ...episodic, ...semantic, ...emotional];
    if (allMemories.length === 0) return 0;
    
    const totalImportance = allMemories.reduce((sum, memory) => sum + memory.importance, 0);
    return (totalImportance / allMemories.length) * 100;
  };

  const getMemoryGrowth = () => {
    // Calculate memories created in last 24 hours
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const allMemories = [...shortTerm, ...episodic, ...semantic, ...emotional];
    const recentMemories = allMemories.filter(memory => memory.timestamp > oneDayAgo);
    
    return recentMemories.length;
  };

  const stats = [
    {
      title: 'Total Memories',
      value: totalMemories.toString(),
      subtitle: 'stored',
      color: '#4ECDC4',
      icon: '🧠',
    },
    {
      title: 'Memory Quality',
      value: `${Math.round(getAverageImportance())}%`,
      subtitle: 'avg importance',
      color: '#FFD93D',
      icon: '⭐',
    },
    {
      title: 'Today\'s Growth',
      value: getMemoryGrowth().toString(),
      subtitle: 'new memories',
      color: '#6BCF7F',
      icon: '📈',
    },
    {
      title: 'Emotions',
      value: emotionHistory.length.toString(),
      subtitle: 'tracked',
      color: '#FF6B6B',
      icon: '❤️',
    },
  ];

  const memoryTypes = [
    {
      type: 'Recent',
      count: shortTerm.length,
      percentage: getMemoryPercentage(shortTerm.length),
      color: '#4ECDC4',
    },
    {
      type: 'Episodes',
      count: episodic.length,
      percentage: getMemoryPercentage(episodic.length),
      color: '#9B59B6',
    },
    {
      type: 'Facts',
      count: semantic.length,
      percentage: getMemoryPercentage(semantic.length),
      color: '#3498DB',
    },
    {
      type: 'Emotions',
      count: emotional.length,
      percentage: getMemoryPercentage(emotional.length),
      color: '#E74C3C',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <LinearGradient
              colors={[stat.color + '20', stat.color + '10']}
              style={styles.statGradient}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Memory Type Distribution */}
      <View style={styles.distributionContainer}>
        <Text style={styles.distributionTitle}>Memory Distribution</Text>
        
        <View style={styles.distributionBar}>
          {memoryTypes.map((type, index) => (
            <View
              key={index}
              style={[
                styles.distributionSegment,
                {
                  flex: type.percentage || 1,
                  backgroundColor: type.color,
                }
              ]}
            />
          ))}
        </View>

        <View style={styles.distributionLegend}>
          {memoryTypes.map((type, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: type.color }]} />
              <Text style={styles.legendText}>
                {type.type} ({type.count})
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Memory Health Indicator */}
      <View style={styles.healthContainer}>
        <Text style={styles.healthTitle}>Memory System Health</Text>
        
        <View style={styles.healthMetrics}>
          <View style={styles.healthMetric}>
            <Text style={styles.healthLabel}>Retention</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: '85%', backgroundColor: '#6BCF7F' }]} />
            </View>
            <Text style={styles.healthValue}>85%</Text>
          </View>
          
          <View style={styles.healthMetric}>
            <Text style={styles.healthLabel}>Diversity</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: '92%', backgroundColor: '#4ECDC4' }]} />
            </View>
            <Text style={styles.healthValue}>92%</Text>
          </View>
          
          <View style={styles.healthMetric}>
            <Text style={styles.healthLabel}>Coherence</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthFill, { width: '78%', backgroundColor: '#FFD93D' }]} />
            </View>
            <Text style={styles.healthValue}>78%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtitle: {
    color: '#a0a0a0',
    fontSize: 12,
    textAlign: 'center',
  },
  distributionContainer: {
    marginBottom: 25,
  },
  distributionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  distributionSegment: {
    minWidth: 2,
  },
  distributionLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  healthContainer: {
    marginTop: 10,
  },
  healthTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  healthMetrics: {},
  healthMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthLabel: {
    color: '#a0a0a0',
    fontSize: 14,
    width: 80,
  },
  healthBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthValue: {
    color: '#ffffff',
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
});
