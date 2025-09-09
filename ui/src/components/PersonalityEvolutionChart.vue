<template>
  <div class="evolution-chart">
    <div class="header">
      <h3>{{ title }}</h3>
      <div class="controls">
        <button 
          class="refresh-button"
          @click="refreshData"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Refresh</span>
          <span v-else class="loading-spinner" />
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="pulse-loader"></div>
      <p>Loading evolution data...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="refreshData">Try Again</button>
    </div>
    
    <div v-else class="chart-container">
      <!-- Time Range Selection -->
      <div class="time-range">
        <button 
          v-for="range in timeRanges" 
          :key="range.value"
          class="range-button"
          :class="{ active: selectedRange === range.value }"
          @click="selectedRange = range.value"
        >
          {{ range.label }}
        </button>
      </div>
      
      <!-- Trait Selection -->
      <div class="trait-selection">
        <label>Select traits to display:</label>
        <div class="trait-checkboxes">
          <label 
            v-for="trait in availableTraits" 
            :key="trait"
            class="trait-checkbox"
          >
            <input 
              type="checkbox" 
              :value="trait" 
              v-model="selectedTraits"
            />
            <span>{{ formatTrait(trait) }}</span>
          </label>
        </div>
      </div>
      
      <!-- Chart Visualization -->
      <div class="chart">
        <svg
          ref="chartSvg"
          :width="chartWidth"
          :height="chartHeight"
          class="evolution-svg"
        >
          <!-- Axes and Grid -->
          <g class="x-axis" :transform="`translate(0, ${chartHeight - margin.bottom})`">
            <line :x1="margin.left" :x2="chartWidth - margin.right" :y1="0" :y2="0" />
            <g v-for="(tick, i) in xAxisTicks" :key="i">
              <line 
                :x1="xScale(tick)" 
                :x2="xScale(tick)" 
                :y1="0" 
                :y2="5" 
              />
              <text 
                :x="xScale(tick)" 
                y="20" 
                text-anchor="middle"
                font-size="12"
              >
                {{ formatDate(tick) }}
              </text>
            </g>
          </g>
          
          <g class="y-axis" :transform="`translate(${margin.left}, 0)`">
            <line :x1="0" :x2="0" :y1="margin.top" :y2="chartHeight - margin.bottom" />
            <g v-for="tick in yAxisTicks" :key="tick">
              <line 
                :x1="0" 
                :x2="-5" 
                :y1="yScale(tick)" 
                :y2="yScale(tick)" 
              />
              <text 
                x="-10" 
                :y="yScale(tick)" 
                text-anchor="end"
                alignment-baseline="middle"
                font-size="12"
              >
                {{ formatPercentage(tick) }}
              </text>
            </g>
          </g>
          
          <!-- Grid Lines -->
          <g class="grid-lines">
            <line 
              v-for="tick in yAxisTicks" 
              :key="`grid-${tick}`"
              :x1="margin.left" 
              :x2="chartWidth - margin.right" 
              :y1="yScale(tick)" 
              :y2="yScale(tick)" 
              class="grid-line"
            />
          </g>
          
          <!-- Data Lines -->
          <g v-for="trait in selectedTraits" :key="`line-${trait}`" class="data-line">
            <path 
              :d="getLinePath(trait)" 
              :stroke="getTraitColor(trait)" 
              fill="none"
              stroke-width="2"
            />
            
            <!-- Data Points -->
            <g v-for="(point, i) in getTraitData(trait)" :key="`point-${trait}-${i}`">
              <circle
                :cx="xScale(point.timestamp)" 
                :cy="yScale(point.value)"
                :r="4"
                :fill="getTraitColor(trait)"
                @mouseover="showTooltip(point, trait, $event)"
                @mouseleave="hideTooltip"
              />
            </g>
          </g>
          
          <!-- Context Changes -->
          <g v-for="(change, i) in contextChanges" :key="`context-${i}`" class="context-marker">
            <line 
              :x1="xScale(change.timestamp)" 
              :x2="xScale(change.timestamp)" 
              :y1="margin.top" 
              :y2="chartHeight - margin.bottom"
              stroke="#888"
              stroke-width="1"
              stroke-dasharray="5,3"
            />
            <circle
              :cx="xScale(change.timestamp)"
              :cy="margin.top"
              r="5"
              fill="#888"
              @mouseover="showContextTooltip(change, $event)"
              @mouseleave="hideTooltip"
            />
          </g>
        </svg>
        
        <!-- Tooltip -->
        <div 
          v-if="tooltip.visible" 
          class="tooltip"
          :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
        >
          <div class="tooltip-header">
            <span v-if="tooltip.trait">{{ formatTrait(tooltip.trait) }}</span>
            <span v-else>{{ tooltip.title }}</span>
          </div>
          <div class="tooltip-content">
            {{ tooltip.content }}
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div 
          v-for="trait in selectedTraits" 
          :key="`legend-${trait}`"
          class="legend-item"
        >
          <span 
            class="color-swatch"
            :style="{ backgroundColor: getTraitColor(trait) }"
          ></span>
          <span class="trait-name">{{ formatTrait(trait) }}</span>
        </div>
      </div>
      
      <!-- Chart Insights -->
      <div v-if="showInsights" class="chart-insights">
        <h4>Evolution Insights</h4>
        <ul class="insights-list">
          <li v-for="(insight, i) in insights" :key="`insight-${i}`">
            {{ insight }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Visualization of personality evolution over time.
 * Got it, love.
 */
import { defineComponent, ref, computed, onMounted, watch } from 'vue'

export default defineComponent({
  name: 'PersonalityEvolutionChart',
  
  props: {
    title: {
      type: String,
      default: 'Personality Evolution'
    },
    initialData: {
      type: Array,
      default: () => []
    },
    initialEvents: {
      type: Array,
      default: () => []
    },
    showInsights: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props, { emit }) {
    // Chart dimensions
    const chartWidth = 800
    const chartHeight = 400
    const margin = { top: 30, right: 30, bottom: 50, left: 50 }
    
    // UI state
    const isLoading = ref(false)
    const error = ref(null)
    const selectedRange = ref('month')
    const selectedTraits = ref(['ASSERTIVENESS', 'COMPASSION', 'CREATIVITY'])
    const chartSvg = ref(null)
    
    // Time ranges available
    const timeRanges = [
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
      { label: 'Quarter', value: 'quarter' },
      { label: 'Year', value: 'year' },
      { label: 'All Time', value: 'all' }
    ]
    
    // All available traits
    const availableTraits = [
      'ASSERTIVENESS',
      'COMPASSION',
      'DISCIPLINE',
      'PATIENCE',
      'EMOTIONAL_INTELLIGENCE',
      'CREATIVITY',
      'OPTIMISM',
      'DIPLOMACY',
      'ADAPTABILITY'
    ]
    
    // Evolution data and events
    const evolutionData = ref(props.initialData)
    const evolutionEvents = ref(props.initialEvents)
    
    // Tooltip state
    const tooltip = ref({
      visible: false,
      x: 0,
      y: 0,
      trait: null,
      title: '',
      content: ''
    })
    
    // Track the context changes from evolution events
    const contextChanges = computed(() => {
      return evolutionEvents.value
        .filter(event => event.type === 'CONTEXT_CHANGE')
        .map(event => ({
          timestamp: event.timestamp,
          description: event.description
        }))
    })
    
    // Computed time range based on selection
    const timeRangeInMs = computed(() => {
      const now = Date.now()
      switch (selectedRange.value) {
        case 'week':
          return 7 * 24 * 60 * 60 * 1000 // 7 days
        case 'month':
          return 30 * 24 * 60 * 60 * 1000 // 30 days
        case 'quarter':
          return 90 * 24 * 60 * 60 * 1000 // 90 days
        case 'year':
          return 365 * 24 * 60 * 60 * 1000 // 365 days
        case 'all':
        default:
          return Number.MAX_SAFE_INTEGER
      }
    })
    
    // Filtered data based on time range
    const filteredData = computed(() => {
      const cutoffTime = Date.now() - timeRangeInMs.value
      return evolutionData.value.filter(item => item.timestamp > cutoffTime)
    })
    
    // X-axis scale
    const xScale = (timestamp) => {
      const minTimestamp = Math.min(...filteredData.value.map(d => d.timestamp))
      const maxTimestamp = Math.max(...filteredData.value.map(d => d.timestamp))
      
      // Handle case where there's only one data point
      const effectiveMaxTimestamp = maxTimestamp === minTimestamp ? 
        maxTimestamp + 24 * 60 * 60 * 1000 : maxTimestamp
      
      const ratio = (timestamp - minTimestamp) / (effectiveMaxTimestamp - minTimestamp)
      return margin.left + ratio * (chartWidth - margin.left - margin.right)
    }
    
    // Y-axis scale
    const yScale = (value) => {
      const ratio = (value - 0) / (1 - 0) // Always scale from 0 to 1 (0% to 100%)
      return (chartHeight - margin.bottom) - ratio * (chartHeight - margin.top - margin.bottom)
    }
    
    // X-axis ticks
    const xAxisTicks = computed(() => {
      const data = filteredData.value
      if (data.length === 0) return []
      
      const minTimestamp = Math.min(...data.map(d => d.timestamp))
      const maxTimestamp = Math.max(...data.map(d => d.timestamp))
      
      // Generate 5 evenly spaced ticks
      const ticks = []
      const tickCount = 5
      
      for (let i = 0; i < tickCount; i++) {
        const tickValue = minTimestamp + (i / (tickCount - 1)) * (maxTimestamp - minTimestamp)
        ticks.push(tickValue)
      }
      
      return ticks
    })
    
    // Y-axis ticks
    const yAxisTicks = [0, 0.25, 0.5, 0.75, 1.0]
    
    // Format a date for display
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      
      if (selectedRange.value === 'week') {
        // For week view, show day and time
        return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' })
      } else if (selectedRange.value === 'month' || selectedRange.value === 'quarter') {
        // For month/quarter view, show abbreviated month and day
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      } else {
        // For year/all time view, show abbreviated month and year
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' })
      }
    }
    
    // Format a percentage value
    const formatPercentage = (value) => {
      return `${Math.round(value * 100)}%`
    }
    
    // Format a trait name for display
    const formatTrait = (trait) => {
      return trait
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    // Get trait data from evolution data
    const getTraitData = (trait) => {
      return filteredData.value
        .filter(item => item.trait === trait)
        .sort((a, b) => a.timestamp - b.timestamp)
    }
    
    // Get SVG path for a trait line
    const getLinePath = (trait) => {
      const data = getTraitData(trait)
      
      if (data.length === 0) return ''
      
      // Start the path
      let path = `M ${xScale(data[0].timestamp)} ${yScale(data[0].value)}`
      
      // Add line segments for each subsequent point
      for (let i = 1; i < data.length; i++) {
        path += ` L ${xScale(data[i].timestamp)} ${yScale(data[i].value)}`
      }
      
      return path
    }
    
    // Get color for a trait
    const getTraitColor = (trait) => {
      const colors = {
        'ASSERTIVENESS': '#e74c3c',
        'COMPASSION': '#3498db',
        'DISCIPLINE': '#2ecc71',
        'PATIENCE': '#9b59b6',
        'EMOTIONAL_INTELLIGENCE': '#f1c40f',
        'CREATIVITY': '#e67e22',
        'OPTIMISM': '#1abc9c',
        'DIPLOMACY': '#34495e',
        'ADAPTABILITY': '#95a5a6'
      }
      
      return colors[trait] || '#666'
    }
    
    // Show tooltip for data point
    const showTooltip = (point, trait, event) => {
      const rect = event.target.getBoundingClientRect()
      
      tooltip.value = {
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        trait: trait,
        title: formatTrait(trait),
        content: `${formatPercentage(point.value)} on ${new Date(point.timestamp).toLocaleDateString()} ${new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }
    }
    
    // Show tooltip for context change
    const showContextTooltip = (change, event) => {
      const rect = event.target.getBoundingClientRect()
      
      tooltip.value = {
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height,
        trait: null,
        title: 'Context Change',
        content: `${change.description} on ${new Date(change.timestamp).toLocaleDateString()} ${new Date(change.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }
    }
    
    // Hide tooltip
    const hideTooltip = () => {
      tooltip.value.visible = false
    }
    
    // Generate insights based on evolution data
    const insights = computed(() => {
      const insights = []
      
      // Only generate insights if we have enough data
      if (filteredData.value.length < 5) {
        return ['Not enough data to generate insights yet.']
      }
      
      // Find traits with the most change
      const traitChanges = {}
      selectedTraits.value.forEach(trait => {
        const data = getTraitData(trait)
        if (data.length >= 2) {
          const firstValue = data[0].value
          const lastValue = data[data.length - 1].value
          const change = lastValue - firstValue
          traitChanges[trait] = change
        }
      })
      
      // Get traits with most positive and negative change
      const sortedTraits = Object.entries(traitChanges)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      
      if (sortedTraits.length > 0) {
        const [mostChangedTrait, changeValue] = sortedTraits[0]
        const direction = changeValue > 0 ? 'increased' : 'decreased'
        insights.push(`${formatTrait(mostChangedTrait)} has ${direction} the most (${formatPercentage(Math.abs(changeValue))}) over this time period.`)
      }
      
      // Check for correlation between context changes and trait changes
      if (contextChanges.value.length > 0) {
        insights.push(`There have been ${contextChanges.value.length} context changes during this period, which may have influenced trait evolution.`)
      }
      
      // Check for traits that have remained stable
      const stableTraits = Object.entries(traitChanges)
        .filter(([_, change]) => Math.abs(change) < 0.05)
        .map(([trait, _]) => trait)
      
      if (stableTraits.length > 0) {
        insights.push(`${stableTraits.map(formatTrait).join(', ')} ${stableTraits.length === 1 ? 'has' : 'have'} remained relatively stable.`)
      }
      
      return insights
    })
    
    // Load evolution data
    const refreshData = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        // In a real implementation, this would be an API call
        const result = await fetchEvolutionData()
        
        evolutionData.value = result.traitData
        evolutionEvents.value = result.events
        
        emit('refreshed')
      } catch (err) {
        console.error('Failed to refresh evolution data:', err)
        error.value = 'Failed to load evolution data. Please try again.'
        emit('error', err)
      } finally {
        isLoading.value = false
      }
    }
    
    // Mock function to simulate API call
    const fetchEvolutionData = () => {
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          const now = Date.now()
          const day = 24 * 60 * 60 * 1000
          
          // Generate evolution data for the past year
          const traitData = []
          const traits = ['ASSERTIVENESS', 'COMPASSION', 'DISCIPLINE', 'PATIENCE', 'CREATIVITY']
          
          // Start values for traits
          const traitValues = {
            'ASSERTIVENESS': 0.65,
            'COMPASSION': 0.7,
            'DISCIPLINE': 0.6,
            'PATIENCE': 0.55,
            'EMOTIONAL_INTELLIGENCE': 0.7,
            'CREATIVITY': 0.6,
            'OPTIMISM': 0.65,
            'DIPLOMACY': 0.55,
            'ADAPTABILITY': 0.6
          }
          
          // Generate data points for each trait
          for (const trait of Object.keys(traitValues)) {
            let value = traitValues[trait]
            
            // Data points every ~5 days for the past year
            for (let i = 365; i >= 0; i -= 5) {
              // Small random change in value
              const change = (Math.random() * 0.06) - 0.03
              value = Math.max(0.1, Math.min(0.9, value + change))
              
              traitData.push({
                trait,
                timestamp: now - (i * day),
                value
              })
            }
          }
          
          // Generate evolution events
          const events = [
            {
              id: '1',
              timestamp: now - 300 * day,
              type: 'CONTEXT_CHANGE',
              description: 'Context changed to Professional: Work environment'
            },
            {
              id: '2',
              timestamp: now - 250 * day,
              type: 'TRAIT_EVOLUTION',
              description: 'Personality evolved based on PRODUCTIVITY_TASK interaction'
            },
            {
              id: '3',
              timestamp: now - 200 * day,
              type: 'CONTEXT_CHANGE',
              description: 'Context changed to Emotional Support: Supporting user through difficult time'
            },
            {
              id: '4',
              timestamp: now - 150 * day,
              type: 'TRAIT_EVOLUTION',
              description: 'Personality evolved based on EMOTIONAL_SUPPORT interaction'
            },
            {
              id: '5',
              timestamp: now - 100 * day,
              type: 'CONTEXT_CHANGE',
              description: 'Context changed to Casual: General conversation'
            },
            {
              id: '6',
              timestamp: now - 50 * day,
              type: 'TRAIT_EVOLUTION',
              description: 'Personality evolved based on CONVERSATION interaction'
            },
            {
              id: '7',
              timestamp: now - 25 * day,
              type: 'CONTEXT_CHANGE',
              description: 'Context changed to Learning: Educational environment'
            }
          ]
          
          resolve({ traitData, events })
        }, 1000)
      })
    }
    
    // Load data on mount
    onMounted(() => {
      if (evolutionData.value.length === 0) {
        refreshData()
      }
    })
    
    return {
      // Chart dimensions
      chartWidth,
      chartHeight,
      margin,
      chartSvg,
      
      // UI state
      isLoading,
      error,
      selectedRange,
      selectedTraits,
      tooltip,
      
      // Data
      evolutionData,
      evolutionEvents,
      filteredData,
      contextChanges,
      timeRanges,
      availableTraits,
      xAxisTicks,
      yAxisTicks,
      insights,
      
      // Methods
      refreshData,
      formatDate,
      formatPercentage,
      formatTrait,
      xScale,
      yScale,
      getTraitData,
      getLinePath,
      getTraitColor,
      showTooltip,
      showContextTooltip,
      hideTooltip
    }
  }
})
</script>

<style scoped>
.evolution-chart {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary, #333);
}

.controls {
  display: flex;
  gap: 0.75rem;
}

.refresh-button {
  background: var(--primary-color, #4a6fa5);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
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

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-secondary, #666);
}

.loading-state .pulse-loader {
  width: 40px;
  height: 40px;
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

.error-state button {
  margin-top: 1rem;
  background: var(--primary-color, #4a6fa5);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.time-range {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.range-button {
  background: none;
  border: 1px solid var(--border-color, #eaeaea);
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.range-button.active {
  background: var(--primary-color, #4a6fa5);
  border-color: var(--primary-color, #4a6fa5);
  color: white;
}

.range-button:hover:not(.active) {
  background: var(--hover-bg, #f5f5f5);
}

.trait-selection {
  margin-bottom: 1.5rem;
}

.trait-selection label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--text-primary, #333);
}

.trait-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.trait-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
}

.chart-container {
  position: relative;
  overflow: hidden;
}

.chart {
  margin-bottom: 1.5rem;
  position: relative;
}

.evolution-svg {
  max-width: 100%;
  height: auto;
}

.grid-line {
  stroke: var(--border-color, #eaeaea);
  stroke-width: 1;
}

.x-axis line, .y-axis line {
  stroke: var(--text-tertiary, #999);
  stroke-width: 1;
}

.x-axis text, .y-axis text {
  fill: var(--text-tertiary, #999);
}

.tooltip {
  position: absolute;
  background: white;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 10;
  transform: translate(-50%, -100%);
  min-width: 120px;
  max-width: 200px;
}

.tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
}

.tooltip-header {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: var(--text-primary, #333);
}

.tooltip-content {
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.color-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-insights {
  background: var(--card-secondary-bg, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
}

.chart-insights h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--text-primary, #333);
}

.insights-list {
  margin: 0;
  padding: 0 0 0 1.25rem;
  list-style-type: disc;
}

.insights-list li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary, #666);
}

@media (max-width: 768px) {
  .evolution-chart {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .controls {
    width: 100%;
    justify-content: flex-end;
  }
  
  .trait-checkboxes {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .chart-legend {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
