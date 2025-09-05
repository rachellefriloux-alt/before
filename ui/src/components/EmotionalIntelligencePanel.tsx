/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Emotional Intelligence Panel Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

interface EmotionalIntelligencePanelProps {
  title?: string;
  initialExpanded?: boolean;
  onResponseGenerated?: (response: any) => void;
  onFeedbackProvided?: (feedback: any) => void;
  onEmotionalStateUpdated?: (state: any) => void;
}

interface EmotionalState {
  primaryEmotion: string;
  secondaryEmotion?: string;
  tertiaryEmotion?: string;
  confidenceScore: number;
}

interface ResponseComponents {
  acknowledgment?: string;
  validation?: string;
  support?: string;
  encouragement?: string;
  fullResponse: string;
}

interface EmotionalTrends {
  dominantEmotions: Array<{ first: string; second: number }>;
  emotionalVariability: number;
  sentimentScore: number;
}

interface CalibrationData {
  compassionAdjustment: number;
  directnessAdjustment: number;
  positiveResponseCount: number;
  neutralResponseCount: number;
  negativeResponseCount: number;
}

const EmotionalIntelligencePanel: React.FC<EmotionalIntelligencePanelProps> = ({
  title = 'Emotional Intelligence',
  initialExpanded = false,
  onResponseGenerated,
  onFeedbackProvided,
  onEmotionalStateUpdated
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [currentEmotionalState, setCurrentEmotionalState] = useState<EmotionalState | null>(null);
  const [currentResponse, setCurrentResponse] = useState<ResponseComponents | null>(null);
  const [emotionalTrends, setEmotionalTrends] = useState<EmotionalTrends | null>(null);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);

  // Emotion color mapping for visualization
  const emotionColors: { [key: string]: string } = {
    JOY: '#FFC107',
    SADNESS: '#2196F3',
    ANGER: '#F44336',
    FEAR: '#673AB7',
    SURPRISE: '#FF9800',
    DISGUST: '#8BC34A',
    CONTENTMENT: '#CDDC39',
    EXCITEMENT: '#FFEB3B',
    ANXIETY: '#9C27B0',
    NEUTRAL: '#9E9E9E'
  };

  // Format emotion name for display
  const formatEmotion = (emotion: string): string => {
    if (!emotion) return 'Unknown';
    return emotion.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get color for emotion
  const getEmotionColor = (emotion: string): string => {
    return emotionColors[emotion] || '#9E9E9E';
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  // Format sentiment
  const formatSentiment = (value: number): string => {
    if (value > 0.3) return 'Positive';
    if (value < -0.3) return 'Negative';
    return 'Neutral';
  };

  // Get style for sentiment
  const getSentimentStyle = (value: number) => {
    if (value > 0.3) return styles.sentimentPositive;
    if (value < -0.3) return styles.sentimentNegative;
    return styles.sentimentNeutral;
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Provide feedback on a response
  const provideFeedback = async (feedbackType: string) => {
    if (!currentResponse) return;

    try {
      // In a real implementation, this would call the EmotionalIntelligenceBridge
      console.log('Providing feedback:', feedbackType);

      // Update calibration data
      await loadCalibrationData();

      // Emit feedback event
      onFeedbackProvided?.({
        response: currentResponse,
        feedback: feedbackType
      });
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  // Reset calibration
  const resetCalibration = async () => {
    try {
      // In a real implementation, this would call the EmotionalIntelligenceBridge
      console.log('Resetting calibration');

      await loadCalibrationData();
    } catch (error) {
      console.error('Error resetting calibration:', error);
    }
  };

  // Load emotional state data
  const loadEmotionalState = async () => {
    try {
      // Mock data - in real implementation, this would come from EmotionalIntelligenceBridge
      setCurrentEmotionalState({
        primaryEmotion: 'JOY',
        secondaryEmotion: 'CONTENTMENT',
        confidenceScore: 0.85
      });
    } catch (error) {
      console.error('Error loading emotional state:', error);
    }
  };

  // Load response data
  const loadResponse = async () => {
    try {
      // Mock data - in real implementation, this would come from EmotionalIntelligenceBridge
      setCurrentResponse({
        acknowledgment: "I hear that you're feeling excited about this new project.",
        validation: "It's completely valid to feel enthusiastic about something that aligns with your interests.",
        support: "I'm here to help you navigate any challenges that come up.",
        encouragement: "Keep that positive energy going - you're capable of great things!",
        fullResponse: "I hear that you're feeling excited about this new project. It's completely valid to feel enthusiastic about something that aligns with your interests. I'm here to help you navigate any challenges that come up. Keep that positive energy going - you're capable of great things!"
      });
    } catch (error) {
      console.error('Error loading response:', error);
    }
  };

  // Load emotional trends
  const loadEmotionalTrends = async () => {
    try {
      // Mock data - in real implementation, this would come from EmotionalIntelligenceBridge
      setEmotionalTrends({
        dominantEmotions: [{ first: 'JOY', second: 0.6 }],
        emotionalVariability: 0.3,
        sentimentScore: 0.4
      });
    } catch (error) {
      console.error('Error loading emotional trends:', error);
    }
  };

  // Load calibration data
  const loadCalibrationData = async () => {
    try {
      // Mock data - in real implementation, this would come from EmotionalIntelligenceBridge
      setCalibrationData({
        compassionAdjustment: 0.1,
        directnessAdjustment: -0.05,
        positiveResponseCount: 15,
        neutralResponseCount: 3,
        negativeResponseCount: 1
      });
    } catch (error) {
      console.error('Error loading calibration data:', error);
    }
  };

  // Load all data on mount
  useEffect(() => {
    loadEmotionalState();
    loadResponse();
    loadEmotionalTrends();
    loadCalibrationData();
  }, []);

  // Mock chart data for trends
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [0.2, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7],
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      strokeWidth: 2
    }]
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#667eea'
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleExpanded}
        >
          <Text style={styles.toggleButtonText}>
            {expanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {expanded && (
        <ScrollView style={styles.panelContent}>
          {/* Current Emotional State Display */}
          {currentEmotionalState && (
            <View style={styles.emotionDisplay}>
              <View
                style={[
                  styles.primaryEmotion,
                  { backgroundColor: getEmotionColor(currentEmotionalState.primaryEmotion) }
                ]}
              >
                <Text style={styles.primaryEmotionText}>
                  {formatEmotion(currentEmotionalState.primaryEmotion)}
                </Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceLevel,
                      { width: `${currentEmotionalState.confidenceScore * 100}%` }
                    ]}
                  />
                </View>
              </View>

              {currentEmotionalState.secondaryEmotion && (
                <View style={styles.secondaryEmotions}>
                  <View style={styles.secondaryEmotion}>
                    <Text style={styles.secondaryEmotionText}>
                      {formatEmotion(currentEmotionalState.secondaryEmotion)}
                    </Text>
                  </View>
                  {currentEmotionalState.tertiaryEmotion && (
                    <View style={styles.secondaryEmotion}>
                      <Text style={styles.secondaryEmotionText}>
                        {formatEmotion(currentEmotionalState.tertiaryEmotion)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Response Preview */}
          {currentResponse && (
            <View style={styles.responsePreview}>
              <Text style={styles.sectionTitle}>Response Components</Text>
              <View style={styles.responseComponents}>
                {currentResponse.acknowledgment && (
                  <View style={[styles.component, styles.acknowledgment]}>
                    <Text style={styles.componentLabel}>Acknowledgment</Text>
                    <Text style={styles.componentText}>{currentResponse.acknowledgment}</Text>
                  </View>
                )}
                {currentResponse.validation && (
                  <View style={[styles.component, styles.validation]}>
                    <Text style={styles.componentLabel}>Validation</Text>
                    <Text style={styles.componentText}>{currentResponse.validation}</Text>
                  </View>
                )}
                {currentResponse.support && (
                  <View style={[styles.component, styles.support]}>
                    <Text style={styles.componentLabel}>Support</Text>
                    <Text style={styles.componentText}>{currentResponse.support}</Text>
                  </View>
                )}
                {currentResponse.encouragement && (
                  <View style={[styles.component, styles.encouragement]}>
                    <Text style={styles.componentLabel}>Encouragement</Text>
                    <Text style={styles.componentText}>{currentResponse.encouragement}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.sectionTitle}>Full Response</Text>
              <View style={styles.fullResponse}>
                <Text style={styles.fullResponseText}>{currentResponse.fullResponse}</Text>
              </View>

              <View style={styles.responseFeedback}>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.positive]}
                  onPress={() => provideFeedback('POSITIVE')}
                >
                  <Text style={styles.feedbackButtonText}>Helpful</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.neutral]}
                  onPress={() => provideFeedback('NEUTRAL')}
                >
                  <Text style={styles.feedbackButtonText}>Neutral</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.negative]}
                  onPress={() => provideFeedback('NEGATIVE')}
                >
                  <Text style={styles.feedbackButtonText}>Not Helpful</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Emotional Trend Visualization */}
          {emotionalTrends && (
            <View style={styles.trendVisualization}>
              <Text style={styles.sectionTitle}>Emotional Trends</Text>
              <View style={styles.trendChart}>
                <LineChart
                  data={chartData}
                  width={Dimensions.get('window').width - 60}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
              <View style={styles.trendSummary}>
                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Dominant Emotion:</Text>
                  <Text style={styles.trendValue}>
                    {formatEmotion(emotionalTrends.dominantEmotions[0].first)}
                  </Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Emotional Variability:</Text>
                  <Text style={styles.trendValue}>
                    {formatPercentage(emotionalTrends.emotionalVariability)}
                  </Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Sentiment:</Text>
                  <Text style={[styles.trendValue, getSentimentStyle(emotionalTrends.sentimentScore)]}>
                    {formatSentiment(emotionalTrends.sentimentScore)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Calibration Status */}
          {calibrationData && (
            <View style={styles.calibrationStatus}>
              <Text style={styles.sectionTitle}>Response Calibration</Text>
              <View style={styles.calibrationMetrics}>
                <View style={styles.calibrationItem}>
                  <Text style={styles.calibrationLabel}>Compassion Adjustment:</Text>
                  <View style={styles.adjustmentBar}>
                    <View
                      style={[
                        styles.adjustmentLevel,
                        {
                          width: `${Math.abs(calibrationData.compassionAdjustment * 100)}%`,
                          marginLeft: calibrationData.compassionAdjustment >= 0 ? '50%' : 'auto',
                          marginRight: calibrationData.compassionAdjustment < 0 ? '50%' : 'auto',
                          backgroundColor: calibrationData.compassionAdjustment >= 0 ? '#4CAF50' : '#F44336'
                        }
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.calibrationItem}>
                  <Text style={styles.calibrationLabel}>Directness Adjustment:</Text>
                  <View style={styles.adjustmentBar}>
                    <View
                      style={[
                        styles.adjustmentLevel,
                        {
                          width: `${Math.abs(calibrationData.directnessAdjustment * 100)}%`,
                          marginLeft: calibrationData.directnessAdjustment >= 0 ? '50%' : 'auto',
                          marginRight: calibrationData.directnessAdjustment < 0 ? '50%' : 'auto',
                          backgroundColor: calibrationData.directnessAdjustment >= 0 ? '#4CAF50' : '#F44336'
                        }
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.calibrationInteractions}>
                  <Text style={styles.interactionCount}>
                    {calibrationData.positiveResponseCount} positive
                  </Text>
                  <Text style={styles.interactionCount}>
                    {calibrationData.neutralResponseCount} neutral
                  </Text>
                  <Text style={styles.interactionCount}>
                    {calibrationData.negativeResponseCount} negative
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetCalibration}
              >
                <Text style={styles.resetButtonText}>Reset Calibration</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  panelContent: {
    padding: 15,
  },
  emotionDisplay: {
    marginBottom: 20,
  },
  primaryEmotion: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryEmotionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginTop: 10,
  },
  confidenceLevel: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  secondaryEmotions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryEmotion: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  secondaryEmotionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  responsePreview: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  responseComponents: {
    marginBottom: 15,
  },
  component: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  acknowledgment: {
    borderLeftColor: '#667eea',
    borderLeftWidth: 4,
  },
  validation: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
  },
  support: {
    borderLeftColor: '#FF9800',
    borderLeftWidth: 4,
  },
  encouragement: {
    borderLeftColor: '#E91E63',
    borderLeftWidth: 4,
  },
  componentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  componentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  fullResponse: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  fullResponseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  responseFeedback: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feedbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  positive: {
    backgroundColor: '#4CAF50',
  },
  neutral: {
    backgroundColor: '#FF9800',
  },
  negative: {
    backgroundColor: '#F44336',
  },
  feedbackButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  trendVisualization: {
    marginBottom: 20,
  },
  trendChart: {
    alignItems: 'center',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 10,
  },
  trendSummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#666',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sentimentPositive: {
    color: '#4CAF50',
  },
  sentimentNegative: {
    color: '#F44336',
  },
  sentimentNeutral: {
    color: '#FF9800',
  },
  calibrationStatus: {
    marginBottom: 20,
  },
  calibrationMetrics: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  calibrationItem: {
    marginBottom: 15,
  },
  calibrationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  adjustmentBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    position: 'relative',
  },
  adjustmentLevel: {
    height: '100%',
    borderRadius: 5,
    position: 'absolute',
    top: 0,
  },
  calibrationInteractions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  interactionCount: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EmotionalIntelligencePanel;
