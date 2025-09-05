/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Learning Dashboard Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

interface LearningDashboardProps {
  title?: string;
  refreshInterval?: number;
  initialMinConfidence?: number;
  onRefresh?: () => void;
  onInsightClick?: (insight: Insight) => void;
}

interface Insight {
  category: string;
  description: string;
  confidence: number;
  evidenceCount: number;
  createdAt: Date;
}

interface PreferenceModel {
  preferences: { [key: string]: number };
}

interface Experiment {
  hypothesis: string;
  status: string;
  progress: number;
  conclusion?: string;
}

const LearningDashboard: React.FC<LearningDashboardProps> = ({
  title = "What I've Learned About You",
  refreshInterval = 300000, // 5 minutes
  initialMinConfidence = 0.6,
  onRefresh,
  onInsightClick
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [preferenceModels, setPreferenceModels] = useState<{ [key: string]: PreferenceModel }>({});
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(initialMinConfidence);

  // Computed property for filtered insights
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => insight.confidence >= confidenceThreshold);
  }, [insights, confidenceThreshold]);

  // Computed property to check if there are preferences
  const hasPreferences = useMemo(() => {
    return Object.keys(preferenceModels).length > 0;
  }, [preferenceModels]);

  // Format category name for display
  const formatCategory = (category: string): string => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format preference name for display
  const formatPreference = (preference: string): string => {
    return preference
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get confidence level class
  const getConfidenceLevelClass = (confidence: number): string => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  // Get confidence level color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString();
  };

  // Get top preferences for a category
  const getTopPreferences = (preferences: { [key: string]: number }): { [key: string]: number } => {
    const sorted = Object.entries(preferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return Object.fromEntries(sorted);
  };

  // Refresh insights
  const refreshInsights = async () => {
    setIsLoading(true);

    try {
      // Mock data - in real implementation, this would fetch from backend
      const mockInsights: Insight[] = [
        {
          category: 'COMMUNICATION_STYLE',
          description: 'You prefer direct, clear communication with minimal small talk',
          confidence: 0.85,
          evidenceCount: 23,
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          category: 'WORK_HABITS',
          description: 'You work most productively in focused bursts rather than long continuous sessions',
          confidence: 0.72,
          evidenceCount: 15,
          createdAt: new Date(Date.now() - 172800000) // 2 days ago
        },
        {
          category: 'LEARNING_STYLE',
          description: 'You learn best through practical examples and hands-on experimentation',
          confidence: 0.68,
          evidenceCount: 12,
          createdAt: new Date(Date.now() - 259200000) // 3 days ago
        }
      ];

      const mockPreferences = {
        'COMMUNICATION': {
          preferences: {
            'DIRECT': 0.8,
            'FORMAL': 0.3,
            'CASUAL': 0.6,
            'DETAILED': 0.7
          }
        },
        'WORK_STYLE': {
          preferences: {
            'FOCUSED': 0.9,
            'COLLABORATIVE': 0.4,
            'INDEPENDENT': 0.8,
            'STRUCTURED': 0.6
          }
        }
      };

      const mockExperiments: Experiment[] = [
        {
          hypothesis: 'Direct communication improves response quality',
          status: 'COMPLETED',
          progress: 1.0,
          conclusion: 'Confirmed - direct responses are preferred 85% of the time'
        },
        {
          hypothesis: 'Morning interactions are more productive',
          status: 'RUNNING',
          progress: 0.6
        }
      ];

      setInsights(mockInsights);
      setPreferenceModels(mockPreferences);
      setExperiments(mockExperiments);

      onRefresh?.();
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    refreshInsights();

    // Set up auto-refresh
    const interval = setInterval(refreshInsights, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Render insight card
  const renderInsightCard = (insight: Insight, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.insightCard,
        { borderLeftColor: getConfidenceColor(insight.confidence) }
      ]}
      onPress={() => onInsightClick?.(insight)}
    >
      <View style={styles.insightHeader}>
        <Text style={styles.categoryTag}>{formatCategory(insight.category)}</Text>
        <View style={styles.confidenceIndicator}>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceBarFill,
                { width: `${insight.confidence * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.confidenceLabel}>
            {Math.round(insight.confidence * 100)}%
          </Text>
        </View>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      <View style={styles.insightMeta}>
        <Text style={styles.evidenceCount}>{insight.evidenceCount} data points</Text>
        <Text style={styles.insightDate}>{formatDate(insight.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render preference card
  const renderPreferenceCard = (category: string, model: PreferenceModel) => (
    <View key={category} style={styles.preferenceCard}>
      <Text style={styles.preferenceTitle}>{formatCategory(category)}</Text>
      <View style={styles.preferenceBars}>
        {Object.entries(getTopPreferences(model.preferences)).map(([key, value]) => (
          <View key={key} style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>{formatPreference(key)}</Text>
            <View style={styles.preferenceBarContainer}>
              <View style={styles.preferenceBar}>
                <View
                  style={[
                    styles.preferenceBarFill,
                    { width: `${value * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.preferenceValue}>
                {Math.round(value * 100)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Render experiment card
  const renderExperimentCard = (experiment: Experiment, index: number) => (
    <View key={index} style={styles.experimentCard}>
      <View style={[
        styles.experimentStatus,
        experiment.status === 'COMPLETED' && styles.statusCompleted,
        experiment.status === 'RUNNING' && styles.statusRunning,
        experiment.status === 'FAILED' && styles.statusFailed
      ]}>
        <Text style={styles.experimentStatusText}>{experiment.status}</Text>
      </View>
      <Text style={styles.experimentHypothesis}>{experiment.hypothesis}</Text>
      <View style={styles.experimentProgress}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${experiment.progress * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(experiment.progress * 100)}% complete
        </Text>
      </View>
      {experiment.status === 'COMPLETED' && experiment.conclusion && (
        <View style={styles.experimentResults}>
          <Text style={styles.resultLabel}>Result:</Text>
          <Text style={styles.resultText}>{experiment.conclusion}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.dashboardControls}>
          <TouchableOpacity
            style={[styles.refreshButton, isLoading && styles.refreshButtonDisabled]}
            onPress={refreshInsights}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.refreshButtonText}>Refresh</Text>
            )}
          </TouchableOpacity>
          <View style={styles.confidenceFilter}>
            <Text style={styles.filterLabel}>Confidence:</Text>
            <View style={styles.confidenceButtons}>
              <TouchableOpacity
                style={[styles.confidenceButton, confidenceThreshold === 0.5 && styles.confidenceButtonActive]}
                onPress={() => setConfidenceThreshold(0.5)}
              >
                <Text style={[styles.confidenceButtonText, confidenceThreshold === 0.5 && styles.confidenceButtonTextActive]}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confidenceButton, confidenceThreshold === 0.6 && styles.confidenceButtonActive]}
                onPress={() => setConfidenceThreshold(0.6)}
              >
                <Text style={[styles.confidenceButtonText, confidenceThreshold === 0.6 && styles.confidenceButtonTextActive]}>60%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confidenceButton, confidenceThreshold === 0.7 && styles.confidenceButtonActive]}
                onPress={() => setConfidenceThreshold(0.7)}
              >
                <Text style={[styles.confidenceButtonText, confidenceThreshold === 0.7 && styles.confidenceButtonTextActive]}>70%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confidenceButton, confidenceThreshold === 0.8 && styles.confidenceButtonActive]}
                onPress={() => setConfidenceThreshold(0.8)}
              >
                <Text style={[styles.confidenceButtonText, confidenceThreshold === 0.8 && styles.confidenceButtonTextActive]}>80%</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Analyzing your patterns...</Text>
          </View>
        ) : insights.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <Text style={styles.emptyIcon}>📊</Text>
            </View>
            <Text style={styles.emptyTitle}>I'm still learning about you.</Text>
            <Text style={styles.emptySubtitle}>
              As we interact more, I'll develop insights to better serve you.
            </Text>
          </View>
        ) : (
          <View style={styles.insightsContainer}>
            <View style={styles.insightsGrid}>
              {filteredInsights.map((insight, index) => renderInsightCard(insight, index))}
            </View>
          </View>
        )}

        {hasPreferences && (
          <View style={styles.preferencesSection}>
            <Text style={styles.sectionTitle}>Your Preferences</Text>
            <View style={styles.preferencesGrid}>
              {Object.entries(preferenceModels).map(([category, model]) =>
                renderPreferenceCard(category, model)
              )}
            </View>
          </View>
        )}

        {experiments.length > 0 && (
          <View style={styles.experimentsSection}>
            <Text style={styles.sectionTitle}>Learning Experiments</Text>
            <View style={styles.experimentsList}>
              {experiments.map((experiment, index) => renderExperimentCard(experiment, index))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  dashboardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confidenceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  filterLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
  },
  confidenceButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  confidenceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  confidenceButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  confidenceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceButtonTextActive: {
    color: '#667eea',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  confidenceValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 35,
  },
  content: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIllustration: {
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  insightsContainer: {
    padding: 15,
  },
  insightsGrid: {
    // Grid layout for insight cards
  },
  insightCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: '#667eea',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    width: 60,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 8,
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  insightDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  insightMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evidenceCount: {
    fontSize: 12,
    color: '#666',
  },
  insightDate: {
    fontSize: 12,
    color: '#999',
  },
  preferencesSection: {
    padding: 15,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  preferencesGrid: {
    // Grid layout for preference cards
  },
  preferenceCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  preferenceBars: {
    // Container for preference bars
  },
  preferenceItem: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  preferenceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 10,
  },
  preferenceBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  preferenceValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    minWidth: 35,
  },
  experimentsSection: {
    padding: 15,
    paddingTop: 0,
  },
  experimentsList: {
    // Container for experiment cards
  },
  experimentCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  experimentStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusRunning: {
    backgroundColor: '#FF9800',
  },
  statusFailed: {
    backgroundColor: '#F44336',
  },
  experimentStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  experimentHypothesis: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  experimentProgress: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  experimentResults: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LearningDashboard;
