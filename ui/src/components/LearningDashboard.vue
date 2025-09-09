<template>
  <div class="learning-dashboard">
    <div class="header">
      <h2>{{ title }}</h2>
      <div class="dashboard-controls">
        <button 
          class="refresh-button"
          @click="refreshInsights"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Refresh</span>
          <span v-else class="loading-spinner"></span>
        </button>
        <div class="confidence-filter">
          <label for="confidenceThreshold">Confidence:</label>
          <input 
            type="range" 
            id="confidenceThreshold" 
            v-model="confidenceThreshold" 
            min="0" 
            max="1" 
            step="0.1"
          />
          <span>{{ (confidenceThreshold * 100).toFixed(0) }}%</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="pulse-loader"></div>
      <p>Analyzing your patterns...</p>
    </div>
    
    <div v-else-if="insights.length === 0" class="empty-state">
      <div class="empty-illustration">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V12L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <p>I'm still learning about you.</p>
      <p class="subtext">As we interact more, I'll develop insights to better serve you.</p>
    </div>

    <div v-else class="insights-container">
      <div class="insights-grid">
        <div 
          v-for="(insight, index) in filteredInsights" 
          :key="index"
          class="insight-card"
          :class="`confidence-${getConfidenceLevelClass(insight.confidence)}`"
        >
          <div class="insight-header">
            <span class="category-tag">{{ formatCategory(insight.category) }}</span>
            <div class="confidence-indicator">
              <div class="confidence-bar" :style="`width: ${insight.confidence * 100}%`"></div>
              <span class="confidence-label">{{ (insight.confidence * 100).toFixed(0) }}%</span>
            </div>
          </div>
          <p class="insight-description">{{ insight.description }}</p>
          <div class="insight-meta">
            <span class="evidence-count">{{ insight.evidenceCount }} data points</span>
            <span class="insight-date">{{ formatDate(insight.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="preferences-section" v-if="hasPreferences">
      <h3>Your Preferences</h3>
      <div class="preferences-grid">
        <div 
          v-for="(model, category) in preferenceModels" 
          :key="category"
          class="preference-card"
        >
          <h4>{{ formatCategory(category) }}</h4>
          <div class="preference-bars">
            <div 
              v-for="(value, key) in getTopPreferences(model.preferences)" 
              :key="key"
              class="preference-item"
            >
              <div class="preference-label">{{ formatPreference(key) }}</div>
              <div class="preference-bar-container">
                <div class="preference-bar" :style="`width: ${value * 100}%`"></div>
                <span class="preference-value">{{ (value * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="experiments-section" v-if="experiments.length > 0">
      <h3>Learning Experiments</h3>
      <div class="experiments-list">
        <div 
          v-for="(experiment, index) in experiments" 
          :key="index"
          class="experiment-card"
        >
          <div class="experiment-status" :class="experiment.status.toLowerCase()">
            {{ experiment.status }}
          </div>
          <h4>{{ experiment.hypothesis }}</h4>
          <div class="experiment-progress">
            <div class="progress-bar" :style="`width: ${experiment.progress * 100}%`"></div>
            <span>{{ (experiment.progress * 100).toFixed(0) }}% complete</span>
          </div>
          <div class="experiment-results" v-if="experiment.status === 'COMPLETED'">
            <p><strong>Result:</strong> {{ experiment.conclusion }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Learning Dashboard showing insights about the user.
 * Got it, love.
 */
import { defineComponent, ref, computed, onMounted } from 'vue'

export default defineComponent({
  name: 'LearningDashboard',
  
  props: {
    title: {
      type: String,
      default: 'What I\'ve Learned About You'
    },
    refreshInterval: {
      type: Number,
      default: 300000 // 5 minutes in milliseconds
    },
    initialMinConfidence: {
      type: Number,
      default: 0.6
    }
  },
  
  setup(props, { emit }) {
    const insights = ref([])
    const preferenceModels = ref({})
    const experiments = ref([])
    const isLoading = ref(true)
    const confidenceThreshold = ref(props.initialMinConfidence)
    const lastRefreshed = ref(null)
    
    // Filter insights based on confidence threshold
    const filteredInsights = computed(() => {
      return insights.value.filter(insight => insight.confidence >= confidenceThreshold.value)
    })
    
    // Check if we have any preference data
    const hasPreferences = computed(() => {
      return Object.keys(preferenceModels.value).length > 0
    })
    
    // Format a category string to be more readable
    const formatCategory = (category) => {
      if (!category) return 'General'
      
      // Convert from enum-style to readable format
      return category
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    // Format a preference key to be more readable
    const formatPreference = (key) => {
      if (!key) return ''
      
      return key
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    // Format date to relative time
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return 'Today'
      } else if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`
      } else {
        return date.toLocaleDateString()
      }
    }
    
    // Get top preferences (highest values) from a preferences object
    const getTopPreferences = (preferences) => {
      if (!preferences) return {}
      
      const entries = Object.entries(preferences)
      const sorted = entries.sort((a, b) => b[1] - a[1])
      
      // Return top 3 preferences as an object
      return sorted.slice(0, 3).reduce((obj, [key, value]) => {
        obj[key] = value
        return obj
      }, {})
    }
    
    // Get CSS class based on confidence level
    const getConfidenceLevelClass = (confidence) => {
      if (confidence >= 0.8) return 'high'
      if (confidence >= 0.6) return 'medium'
      return 'low'
    }
    
    // Refresh insights from the learning engine
    const refreshInsights = async () => {
      isLoading.value = true
      
      try {
        // In a real implementation, this would be an API call to the learning engine
        const result = await fetchInsightsFromLearningEngine()
        
        insights.value = result.insights
        preferenceModels.value = result.preferenceModels
        experiments.value = result.experiments
        
        lastRefreshed.value = new Date()
        emit('refreshed', lastRefreshed.value)
      } catch (error) {
        console.error('Failed to refresh insights:', error)
        emit('error', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // Mock function to simulate API call to learning engine
    const fetchInsightsFromLearningEngine = () => {
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          resolve({
            insights: [
              {
                category: 'COMMUNICATION_STYLE',
                description: 'You prefer direct, concise responses without unnecessary details.',
                confidence: 0.85,
                confidenceLevel: 'HIGH',
                evidenceCount: 14,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                category: 'TOPIC_INTEREST',
                description: 'You frequently engage with fitness and health-related content.',
                confidence: 0.75,
                confidenceLevel: 'MEDIUM',
                evidenceCount: 8,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                category: 'USAGE_PATTERN',
                description: 'You tend to use the app most actively in the mornings.',
                confidence: 0.68,
                confidenceLevel: 'MEDIUM',
                evidenceCount: 21,
                createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                category: 'FEATURE_PREFERENCE',
                description: 'You frequently use the reminder and calendar features.',
                confidence: 0.62,
                confidenceLevel: 'MEDIUM',
                evidenceCount: 17,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                category: 'EMOTIONAL_RESPONSE',
                description: 'You respond positively to encouragement and challenges.',
                confidence: 0.58,
                confidenceLevel: 'LOW',
                evidenceCount: 6,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                category: 'PRODUCTIVITY',
                description: 'You are most productive during weekend mornings.',
                confidence: 0.52,
                confidenceLevel: 'LOW',
                evidenceCount: 5,
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
              }
            ],
            preferenceModels: {
              'COMMUNICATION_STYLE': {
                updateCount: 28,
                preferences: {
                  'DIRECT': 0.82,
                  'CONCISE': 0.74,
                  'CHALLENGING': 0.65,
                  'SUPPORTIVE': 0.45,
                  'DETAILED': 0.23
                }
              },
              'TOPIC_INTEREST': {
                updateCount: 42,
                preferences: {
                  'FITNESS': 0.88,
                  'HEALTH': 0.76,
                  'TECHNOLOGY': 0.65,
                  'PRODUCTIVITY': 0.54,
                  'FINANCE': 0.32,
                  'ENTERTAINMENT': 0.22
                }
              }
            },
            experiments: [
              {
                id: 'exp-001',
                hypothesis: 'User responds better to direct communication style',
                category: 'COMMUNICATION_STYLE',
                status: 'COMPLETED',
                progress: 1.0,
                conclusion: 'Direct communication style led to 35% higher engagement',
                variants: ['direct', 'indirect', 'supportive']
              },
              {
                id: 'exp-002',
                hypothesis: 'User prefers morning notifications for health reminders',
                category: 'NOTIFICATION_TIMING',
                status: 'ACTIVE',
                progress: 0.6,
                variants: ['morning', 'afternoon', 'evening']
              }
            ]
          })
        }, 1000)
      })
    }
    
    // Set up auto-refresh interval
    let refreshIntervalId = null
    
    onMounted(() => {
      // Initial data load
      refreshInsights()
      
      // Set up interval if refreshInterval is positive
      if (props.refreshInterval > 0) {
        refreshIntervalId = setInterval(refreshInsights, props.refreshInterval)
      }
    })
    
    // Clean up interval on component unmount
    onBeforeUnmount(() => {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId)
      }
    })
    
    return {
      insights,
      filteredInsights,
      preferenceModels,
      experiments,
      isLoading,
      confidenceThreshold,
      lastRefreshed,
      hasPreferences,
      formatCategory,
      formatPreference,
      formatDate,
      getTopPreferences,
      getConfidenceLevelClass,
      refreshInsights
    }
  }
})
</script>

<style scoped>
.learning-dashboard {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary, #333);
}

.dashboard-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-button {
  background: var(--primary-color, #4a6fa5);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}

.refresh-button:hover {
  background: var(--primary-dark, #3a5a8a);
}

.refresh-button:disabled {
  background: var(--disabled-color, #cccccc);
  cursor: not-allowed;
}

.confidence-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confidence-filter label {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-secondary, #666);
}

.pulse-loader {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-light, #6a8dc5);
  animation: pulse 1.5s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #666);
}

.empty-illustration {
  margin-bottom: 1rem;
  color: var(--text-secondary, #666);
}

.empty-state .subtext {
  font-size: 0.9rem;
  max-width: 300px;
  margin: 0.5rem auto;
}

.insights-container {
  margin-bottom: 2rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: var(--card-secondary-bg, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid transparent;
  transition: transform 0.2s, box-shadow 0.2s;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.insight-card.confidence-high {
  border-left-color: var(--success, #28a745);
}

.insight-card.confidence-medium {
  border-left-color: var(--warning, #ffc107);
}

.insight-card.confidence-low {
  border-left-color: var(--info, #17a2b8);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-tag {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary, #666);
  background: var(--tag-bg, #eaeaea);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.confidence-indicator {
  position: relative;
  width: 80px;
  height: 4px;
  background: var(--progress-bg, #e9ecef);
  border-radius: 2px;
}

.confidence-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 2px;
  background: var(--primary-color, #4a6fa5);
}

.confidence-label {
  position: absolute;
  top: -18px;
  right: 0;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.insight-description {
  font-size: 1rem;
  color: var(--text-primary, #333);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.insight-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-tertiary, #888);
}

.preferences-section,
.experiments-section {
  margin-top: 2.5rem;
}

.preferences-section h3,
.experiments-section h3 {
  font-size: 1.25rem;
  color: var(--text-primary, #333);
  margin: 0 0 1rem 0;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.preference-card {
  background: var(--card-secondary-bg, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
}

.preference-card h4 {
  font-size: 1rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary, #333);
}

.preference-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preference-label {
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
}

.preference-bar-container {
  position: relative;
  height: 8px;
  background: var(--progress-bg, #e9ecef);
  border-radius: 4px;
}

.preference-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 4px;
  background: var(--primary-color, #4a6fa5);
}

.preference-value {
  position: absolute;
  right: 0;
  top: -16px;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.experiments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.experiment-card {
  background: var(--card-secondary-bg, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.experiment-status {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  color: white;
}

.experiment-status.active {
  background-color: var(--primary-color, #4a6fa5);
}

.experiment-status.completed {
  background-color: var(--success, #28a745);
}

.experiment-card h4 {
  font-size: 1rem;
  margin: 0.75rem 0;
  padding-right: 80px;
  color: var(--text-primary, #333);
}

.experiment-progress {
  position: relative;
  height: 8px;
  background: var(--progress-bg, #e9ecef);
  border-radius: 4px;
  margin: 1rem 0;
}

.experiment-progress .progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 4px;
  background: var(--primary-color, #4a6fa5);
}

.experiment-progress span {
  position: absolute;
  top: -18px;
  right: 0;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.experiment-results {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .dashboard-controls {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .confidence-filter {
    width: 100%;
  }
  
  .insights-grid,
  .preferences-grid,
  .experiments-list {
    grid-template-columns: 1fr;
  }
}
</style>
