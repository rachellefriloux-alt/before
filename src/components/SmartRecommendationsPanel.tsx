import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { IntelligentRecommendation } from './utils/EnhancedAndroidLauncher';

interface SmartRecommendationsPanelProps {
  recommendations: IntelligentRecommendation[];
  onRecommendationPress: (recommendation: IntelligentRecommendation) => void;
  isEnhanced: boolean;
}

export default function SmartRecommendationsPanel({ 
  recommendations, 
  onRecommendationPress, 
  isEnhanced 
}: SmartRecommendationsPanelProps) {
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());

  if (!isEnhanced || recommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          🧠 AI Recommendations will appear here when enhanced mode is active
        </Text>
      </View>
    );
  }

  const toggleExpanded = (recId: string) => {
    const newExpanded = new Set(expandedRecs);
    if (newExpanded.has(recId)) {
      newExpanded.delete(recId);
    } else {
      newExpanded.add(recId);
    }
    setExpandedRecs(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#4CAF50';
      case 'low': return '#999999';
      default: return '#4CAF50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return '🚀';
      case 'entertainment': return '🎬';
      case 'security': return '🔒';
      case 'optimization': return '⚡';
      case 'social': return '👥';
      default: return '💡';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'app_suggestion': return '📱';
      case 'automation_suggestion': return '🤖';
      case 'optimization_suggestion': return '⚙️';
      case 'security_alert': return '⚠️';
      case 'usage_insight': return '📊';
      default: return '💭';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🧠 Intelligent Recommendations</Text>
        <Text style={styles.subHeaderText}>
          AI-powered suggestions based on your usage patterns
        </Text>
      </View>

      <ScrollView 
        style={styles.recommendationsList}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      >
        {recommendations.map((rec, index) => {
          const recId = `rec_${index}`;
          const isExpanded = expandedRecs.has(recId);
          
          return (
            <View key={recId} style={styles.recommendationCard}>
              <TouchableOpacity
                style={styles.recommendationHeader}
                onPress={() => toggleExpanded(recId)}
              >
                <View style={styles.recommendationTitleRow}>
                  <Text style={styles.typeIcon}>{getTypeIcon(rec.type)}</Text>
                  <Text style={styles.categoryIcon}>{getCategoryIcon(rec.category)}</Text>
                  <Text style={styles.recommendationTitle} numberOfLines={1}>
                    {rec.title}
                  </Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(rec.priority) }]}>
                    <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.confidenceRow}>
                  <Text style={styles.confidenceLabel}>Confidence: </Text>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { width: `${rec.confidence * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.confidenceValue}>
                    {Math.round(rec.confidence * 100)}%
                  </Text>
                </View>
                
                <Text style={styles.expandIcon}>
                  {isExpanded ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.recommendationContent}>
                  <Text style={styles.description}>
                    {rec.description}
                  </Text>
                  
                  {rec.actionable && rec.actions && rec.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      <Text style={styles.actionsLabel}>Available Actions:</Text>
                      {rec.actions.map((action, actionIndex) => (
                        <TouchableOpacity
                          key={actionIndex}
                          style={styles.actionButton}
                          onPress={() => onRecommendationPress(rec)}
                        >
                          <Text style={styles.actionButtonText}>
                            {action.label || `Action ${actionIndex + 1}`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {!rec.actionable && (
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>
                        ℹ️ This is an informational insight
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 10,
    padding: 15,
  },
  emptyContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 10,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    marginBottom: 15,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeaderText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  recommendationsList: {
    maxHeight: 400,
  },
  recommendationCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  recommendationHeader: {
    padding: 15,
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  confidenceLabel: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#444444',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  confidenceValue: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: '#AAAAAA',
    fontSize: 12,
  },
  recommendationContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  description: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionsLabel: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  infoText: {
    color: '#AAAAAA',
    fontSize: 11,
  },
});