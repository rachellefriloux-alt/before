<template>
  <div class="emotional-intelligence-panel">
    <div class="header">
      <h2>{{ title }}</h2>
      <div class="toggle-button" @click="toggleExpanded">
        <span v-if="expanded">▲</span>
        <span v-else>▼</span>
      </div>
    </div>
    
    <transition name="slide">
      <div v-if="expanded" class="panel-content">
        <!-- Current Emotional State Display -->
        <div class="emotion-display" v-if="currentEmotionalState">
          <div class="primary-emotion" :style="{ backgroundColor: getEmotionColor(currentEmotionalState.primaryEmotion) }">
            <span>{{ formatEmotion(currentEmotionalState.primaryEmotion) }}</span>
            <div class="confidence-bar">
              <div class="confidence-level" :style="{ width: (currentEmotionalState.confidenceScore * 100) + '%' }"></div>
            </div>
          </div>
          
          <div class="secondary-emotions" v-if="currentEmotionalState.secondaryEmotion">
            <div class="secondary-emotion">
              <span>{{ formatEmotion(currentEmotionalState.secondaryEmotion) }}</span>
            </div>
            <div class="secondary-emotion" v-if="currentEmotionalState.tertiaryEmotion">
              <span>{{ formatEmotion(currentEmotionalState.tertiaryEmotion) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Response Preview -->
        <div class="response-preview" v-if="currentResponse">
          <h3>Response Components</h3>
          <div class="response-components">
            <div class="component acknowledgment" v-if="currentResponse.acknowledgment">
              <span class="label">Acknowledgment</span>
              <p>{{ currentResponse.acknowledgment }}</p>
            </div>
            <div class="component validation" v-if="currentResponse.validation">
              <span class="label">Validation</span>
              <p>{{ currentResponse.validation }}</p>
            </div>
            <div class="component support" v-if="currentResponse.support">
              <span class="label">Support</span>
              <p>{{ currentResponse.support }}</p>
            </div>
            <div class="component encouragement" v-if="currentResponse.encouragement">
              <span class="label">Encouragement</span>
              <p>{{ currentResponse.encouragement }}</p>
            </div>
          </div>
          
          <h3>Full Response</h3>
          <div class="full-response">
            <p>{{ currentResponse.fullResponse }}</p>
          </div>
          
          <div class="response-feedback">
            <button @click="provideFeedback('POSITIVE')" class="positive">Helpful</button>
            <button @click="provideFeedback('NEUTRAL')" class="neutral">Neutral</button>
            <button @click="provideFeedback('NEGATIVE')" class="negative">Not Helpful</button>
          </div>
        </div>
        
        <!-- Emotional Trend Visualization -->
        <div class="trend-visualization" v-if="emotionalTrends">
          <h3>Emotional Trends</h3>
          <div class="trend-chart">
            <canvas ref="trendChart" width="400" height="200"></canvas>
          </div>
          <div class="trend-summary">
            <div class="trend-item">
              <span class="label">Dominant Emotion:</span>
              <span>{{ formatEmotion(emotionalTrends.dominantEmotions[0].first) }}</span>
            </div>
            <div class="trend-item">
              <span class="label">Emotional Variability:</span>
              <span>{{ formatPercentage(emotionalTrends.emotionalVariability) }}</span>
            </div>
            <div class="trend-item">
              <span class="label">Sentiment:</span>
              <span :class="getSentimentClass(emotionalTrends.sentimentScore)">
                {{ formatSentiment(emotionalTrends.sentimentScore) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Calibration Status -->
        <div class="calibration-status" v-if="calibrationData">
          <h3>Response Calibration</h3>
          <div class="calibration-metrics">
            <div class="calibration-item">
              <span class="label">Compassion Adjustment:</span>
              <div class="adjustment-bar">
                <div class="adjustment-level" 
                     :style="{ width: Math.abs(calibrationData.compassionAdjustment * 100) + '%', 
                              marginLeft: calibrationData.compassionAdjustment >= 0 ? '50%' : 'auto',
                              marginRight: calibrationData.compassionAdjustment < 0 ? '50%' : 'auto',
                              backgroundColor: calibrationData.compassionAdjustment >= 0 ? '#4CAF50' : '#F44336' }">
                </div>
              </div>
            </div>
            <div class="calibration-item">
              <span class="label">Directness Adjustment:</span>
              <div class="adjustment-bar">
                <div class="adjustment-level" 
                     :style="{ width: Math.abs(calibrationData.directnessAdjustment * 100) + '%', 
                              marginLeft: calibrationData.directnessAdjustment >= 0 ? '50%' : 'auto',
                              marginRight: calibrationData.directnessAdjustment < 0 ? '50%' : 'auto',
                              backgroundColor: calibrationData.directnessAdjustment >= 0 ? '#4CAF50' : '#F44336' }">
                </div>
              </div>
            </div>
            <div class="calibration-interactions">
              <span class="positive">{{ calibrationData.positiveResponseCount }} positive</span>
              <span class="neutral">{{ calibrationData.neutralResponseCount }} neutral</span>
              <span class="negative">{{ calibrationData.negativeResponseCount }} negative</span>
            </div>
          </div>
          <button @click="resetCalibration" class="reset-button">Reset Calibration</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import EmotionalIntelligenceBridge from '@/core/emotional/EmotionalIntelligenceBridge'

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Emotional intelligence visualization and interaction component.
 * Got it, love.
 */
export default {
  name: 'EmotionalIntelligencePanel',
  
  props: {
    title: {
      type: String,
      default: 'Emotional Intelligence'
    },
    initialExpanded: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['response-generated', 'feedback-provided', 'emotional-state-updated'],
  
  setup(props, { emit }) {
    const expanded = ref(props.initialExpanded)
    const currentEmotionalState = ref(null)
    const currentResponse = ref(null)
    const emotionalTrends = ref(null)
    const calibrationData = ref(null)
    const trendChart = ref(null)
    const chartInstance = ref(null)
    
    // Emotion color mapping for visualization
    const emotionColors = {
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
    }
    
    // Format emotion name for display
    const formatEmotion = (emotion) => {
      if (!emotion) return 'Unknown'
      return emotion.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    
    // Get color for emotion
    const getEmotionColor = (emotion) => {
      return emotionColors[emotion] || '#9E9E9E'
    }
    
    // Format percentage
    const formatPercentage = (value) => {
      return `${Math.round(value * 100)}%`
    }
    
    // Format sentiment
    const formatSentiment = (value) => {
      if (value > 0.3) return 'Positive'
      if (value < -0.3) return 'Negative'
      return 'Neutral'
    }
    
    // Get CSS class for sentiment
    const getSentimentClass = (value) => {
      if (value > 0.3) return 'positive'
      if (value < -0.3) return 'negative'
      return 'neutral'
    }
    
    // Toggle expanded state
    const toggleExpanded = () => {
      expanded.value = !expanded.value
    }
    
    // Provide feedback on a response
    const provideFeedback = async (feedbackType) => {
      if (!currentResponse.value) return
      
      try {
        const bridge = await EmotionalIntelligenceBridge.getInstance()
        await bridge.submitResponseFeedback(
          '', // We don't have the original text here, UI would need to pass it
          currentResponse.value,
          feedbackType,
          null // No follow-up text
        )
        
        // Update calibration data
        await loadCalibrationData()
        
        // Emit feedback event
        emit('feedback-provided', { 
          response: currentResponse.value, 
          feedback: feedbackType 
        })
      } catch (error) {
        console.error('Error providing feedback:', error)
      }
    }
    
    // Reset calibration
    const resetCalibration = async () => {
      try {
        const bridge = await EmotionalIntelligenceBridge.getInstance()
        await bridge.resetCalibration()
        await loadCalibrationData()
      } catch (error) {
        console.error('Error resetting calibration:', error)
      }
    }
    
    // Load calibration data
    const loadCalibrationData = async () => {
      try {
        const bridge = await EmotionalIntelligenceBridge.getInstance()
        calibrationData.value = bridge.getCalibrationAnalytics()
      } catch (error) {
        console.error('Error loading calibration data:', error)
      }
    }
    
    // Load emotional trends
    const loadEmotionalTrends = async () => {
      try {
        const bridge = await EmotionalIntelligenceBridge.getInstance()
        emotionalTrends.value = await bridge.getEmotionalTrends()
        
        // Update chart if available
        if (emotionalTrends.value) {
          updateTrendChart()
        }
      } catch (error) {
        console.error('Error loading emotional trends:', error)
      }
    }
    
    // Update trend chart
    const updateTrendChart = () => {
      if (!trendChart.value || !emotionalTrends.value) return
      
      // Destroy existing chart if it exists
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
      
      // Extract data for chart
      const dominantEmotions = emotionalTrends.value.dominantEmotions.slice(0, 5)
      const labels = dominantEmotions.map(pair => formatEmotion(pair.first))
      const data = dominantEmotions.map(pair => pair.second * 100)
      const colors = dominantEmotions.map(pair => getEmotionColor(pair.first))
      
      // Create new chart
      const ctx = trendChart.value.getContext('2d')
      chartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Emotional Distribution',
            data: data,
            backgroundColor: colors,
            borderColor: colors.map(color => adjustColor(color, -20)),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%'
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.raw.toFixed(1) + '%'
                }
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }
    
    // Adjust color brightness
    const adjustColor = (color, amount) => {
      let usePound = false
      
      if (color[0] === '#') {
        color = color.slice(1)
        usePound = true
      }
      
      const num = parseInt(color, 16)
      let r = (num >> 16) + amount
      let g = ((num >> 8) & 0x00FF) + amount
      let b = (num & 0x0000FF) + amount
      
      r = r > 255 ? 255 : (r < 0 ? 0 : r)
      g = g > 255 ? 255 : (g < 0 ? 0 : g)
      b = b > 255 ? 255 : (b < 0 ? 0 : b)
      
      return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')
    }
    
    // Analyze text and update emotional state
    const analyzeText = async (text, context = null) => {
      try {
        const bridge = await EmotionalIntelligenceBridge.getInstance()
        currentEmotionalState.value = await bridge.analyzeEmotionalState(text, context)
        
        emit('emotional-state-updated', currentEmotionalState.value)
        return currentEmotionalState.value
      } catch (error) {
        console.error('Error analyzing text:', error)
        return null
      }
    }
    
    // Generate response for text
    const generateResponse = async (text, context = null, responseType = null) => {
      try {
        const bridge = await EmotionalIntelligenceBridge.getInstance()
        currentResponse.value = await bridge.generateEmpathicResponse(text, context, responseType)
        
        emit('response-generated', currentResponse.value)
        return currentResponse.value
      } catch (error) {
        console.error('Error generating response:', error)
        return null
      }
    }
    
    // Watch for expanded state changes
    watch(expanded, async (newValue) => {
      if (newValue && !calibrationData.value) {
        await loadCalibrationData()
      }
      
      if (newValue && !emotionalTrends.value) {
        await loadEmotionalTrends()
      }
    })
    
    // Setup on mount
    onMounted(async () => {
      if (expanded.value) {
        await loadCalibrationData()
        await loadEmotionalTrends()
      }
    })
    
    // Expose public methods
    return {
      expanded,
      currentEmotionalState,
      currentResponse,
      emotionalTrends,
      calibrationData,
      trendChart,
      formatEmotion,
      getEmotionColor,
      formatPercentage,
      formatSentiment,
      getSentimentClass,
      toggleExpanded,
      provideFeedback,
      resetCalibration,
      analyzeText,
      generateResponse
    }
  }
}
</script>

<style scoped>
.emotional-intelligence-panel {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f5f5f5;
  cursor: pointer;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.toggle-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.panel-content {
  padding: 16px;
}

/* Emotion Display */
.emotion-display {
  margin-bottom: 20px;
}

.primary-emotion {
  padding: 10px 16px;
  border-radius: 6px;
  color: #fff;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.confidence-bar {
  width: 100px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-left: 12px;
}

.confidence-level {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
}

.secondary-emotions {
  display: flex;
  gap: 8px;
}

.secondary-emotion {
  padding: 4px 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  color: #555;
}

/* Response Preview */
.response-preview {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
}

.response-preview h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

.response-components {
  margin-bottom: 16px;
}

.component {
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #ddd;
}

.component.acknowledgment {
  border-color: #2196F3;
}

.component.validation {
  border-color: #4CAF50;
}

.component.support {
  border-color: #9C27B0;
}

.component.encouragement {
  border-color: #FFC107;
}

.component .label {
  font-size: 12px;
  font-weight: 500;
  color: #757575;
  text-transform: uppercase;
}

.component p {
  margin: 4px 0 0;
  color: #333;
}

.full-response {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.response-feedback {
  display: flex;
  gap: 8px;
}

.response-feedback button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.response-feedback button.positive {
  background-color: #E8F5E9;
  color: #388E3C;
}

.response-feedback button.neutral {
  background-color: #F5F5F5;
  color: #757575;
}

.response-feedback button.negative {
  background-color: #FFEBEE;
  color: #D32F2F;
}

.response-feedback button:hover {
  opacity: 0.9;
}

/* Trend Visualization */
.trend-visualization {
  margin-bottom: 20px;
}

.trend-chart {
  height: 200px;
  margin-bottom: 16px;
}

.trend-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.trend-item {
  display: flex;
  flex-direction: column;
}

.trend-item .label {
  font-size: 12px;
  color: #757575;
  margin-bottom: 4px;
}

.trend-item .positive {
  color: #388E3C;
}

.trend-item .negative {
  color: #D32F2F;
}

.trend-item .neutral {
  color: #757575;
}

/* Calibration Status */
.calibration-status {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
}

.calibration-metrics {
  margin-bottom: 16px;
}

.calibration-item {
  margin-bottom: 12px;
}

.calibration-item .label {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
  color: #555;
}

.adjustment-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  position: relative;
}

.adjustment-level {
  height: 100%;
  border-radius: 4px;
  max-width: 50%;
}

.calibration-interactions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.calibration-interactions span {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.calibration-interactions .positive {
  background-color: #E8F5E9;
  color: #388E3C;
}

.calibration-interactions .neutral {
  background-color: #F5F5F5;
  color: #757575;
}

.calibration-interactions .negative {
  background-color: #FFEBEE;
  color: #D32F2F;
}

.reset-button {
  padding: 8px 16px;
  background-color: #F5F5F5;
  color: #757575;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.reset-button:hover {
  background-color: #E0E0E0;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
