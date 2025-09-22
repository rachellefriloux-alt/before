<template>
  <div class="personality-panel">
    <div class="header">
      <h2>{{ title }}</h2>
      <button 
        class="refresh-button"
        @click="refreshPersonality"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">Refresh</span>
        <span v-else class="loading-spinner" />
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="pulse-loader"></div>
      <p>Analyzing personality...</p>
    </div>
    
    <div v-else class="personality-content">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-button" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="tab-content">
        <!-- Traits Tab -->
        <div v-if="activeTab === 'traits'" class="traits-tab">
          <div class="trait-categories">
            <button 
              class="category-button"
              :class="{ active: traitView === 'effective' }"
              @click="traitView = 'effective'"
            >
              Effective
            </button>
            <button 
              class="category-button"
              :class="{ active: traitView === 'core' }"
              @click="traitView = 'core'"
            >
              Core
            </button>
            <button 
              class="category-button"
              :class="{ active: traitView === 'adaptive' }"
              @click="traitView = 'adaptive'"
            >
              Adaptive
            </button>
          </div>
          
          <div class="traits-grid">
            <div 
              v-for="(value, trait) in displayedTraits" 
              :key="trait"
              class="trait-card"
            >
              <div class="trait-header">
                <span class="trait-name">{{ formatTrait(trait) }}</span>
                <div class="trait-value">{{ formatPercentage(value) }}</div>
              </div>
              <div class="trait-bar-container">
                <div class="trait-bar" :style="`width: ${value * 100}%`"></div>
              </div>
              <p class="trait-description">{{ getTraitDescription(trait) }}</p>
              
              <div v-if="traitView === 'adaptive'" class="trait-controls">
                <button 
                  class="trait-adjust-button decrease"
                  @click="adjustTrait(trait, -0.05)"
                  title="Decrease this trait"
                >
                  -
                </button>
                <button 
                  class="trait-adjust-button increase"
                  @click="adjustTrait(trait, 0.05)"
                  title="Increase this trait"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Aspects Tab -->
        <div v-else-if="activeTab === 'aspects'" class="aspects-tab">
          <div class="aspects-grid">
            <div 
              v-for="(aspect, index) in personalityAspects" 
              :key="index"
              class="aspect-card"
            >
              <div class="aspect-header">
                <span class="aspect-name">{{ formatAspect(aspect.name) }}</span>
                <div class="aspect-value">{{ formatPercentage(aspect.value) }}</div>
              </div>
              <div class="aspect-bar-container">
                <div class="aspect-bar" :style="`width: ${aspect.value * 100}%`"></div>
              </div>
              <p class="aspect-description">{{ getAspectDescription(aspect.name) }}</p>
              
              <div class="aspect-context">
                <label>In context:</label>
                <select v-model="aspect.context" @change="updateAspectContext(aspect)">
                  <option 
                    v-for="context in contexts" 
                    :key="context.value"
                    :value="context.value"
                  >
                    {{ context.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Context Tab -->
        <div v-else-if="activeTab === 'context'" class="context-tab">
          <div class="current-context">
            <h3>Current Context</h3>
            <div class="context-details" v-if="currentContext">
              <div class="context-type">{{ formatContextType(currentContext.type) }}</div>
              <p class="context-description">{{ currentContext.description }}</p>
            </div>
            <div class="empty-context" v-else>
              <p>No active context set</p>
            </div>
          </div>
          
          <div class="context-selector">
            <h3>Change Context</h3>
            <div class="context-options">
              <div 
                v-for="contextType in contextTypes" 
                :key="contextType"
                class="context-option"
                :class="{ active: currentContext && currentContext.type === contextType }"
                @click="setContext(contextType)"
              >
                <div class="context-name">{{ formatContextType(contextType) }}</div>
                <p class="context-hint">{{ getContextHint(contextType) }}</p>
              </div>
            </div>
          </div>
          
          <div class="custom-context-form">
            <h3>Custom Context</h3>
            <div class="form-group">
              <label for="contextType">Type:</label>
              <select id="contextType" v-model="customContext.type">
                <option 
                  v-for="type in contextTypes" 
                  :key="type"
                  :value="type"
                >
                  {{ formatContextType(type) }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="contextDescription">Description:</label>
              <input 
                id="contextDescription" 
                type="text" 
                v-model="customContext.description"
                placeholder="Describe the context"
              />
            </div>
            
            <div class="form-actions">
              <button 
                class="apply-button"
                @click="applyCustomContext"
                :disabled="!customContext.description"
              >
                Apply Custom Context
              </button>
            </div>
          </div>
        </div>
        
        <!-- Evolution Tab -->
        <div v-else-if="activeTab === 'evolution'" class="evolution-tab">
          <div class="evolution-timeline">
            <div 
              v-for="(event, index) in evolutionEvents" 
              :key="index"
              class="evolution-event"
              :class="event.type.toLowerCase().replace('_', '-')"
            >
              <div class="event-time">{{ formatTime(event.timestamp) }}</div>
              <div class="event-type">{{ formatEventType(event.type) }}</div>
              <p class="event-description">{{ event.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="personality-actions">
        <h3>Personality Actions</h3>
        <div class="action-buttons">
          <button 
            class="action-button reset"
            @click="confirmReset"
            title="Reset adaptive traits to defaults"
          >
            Reset Adaptive Traits
          </button>
          
          <button 
            class="action-button save"
            @click="savePersonality"
            title="Save current personality state"
          >
            Save Personality
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Dialog -->
    <div v-if="showConfirmation" class="confirmation-dialog">
      <div class="confirmation-content">
        <h3>{{ confirmationTitle }}</h3>
        <p>{{ confirmationMessage }}</p>
        <div class="confirmation-actions">
          <button 
            class="cancel-button"
            @click="cancelConfirmation"
          >
            Cancel
          </button>
          <button 
            class="confirm-button"
            @click="confirmAction"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: User interface for viewing and adjusting Sallie's personality.
 * Got it, love.
 */
import { defineComponent, ref, computed, onMounted } from 'vue'

export default defineComponent({
  name: 'PersonalityPanel',
  
  props: {
    title: {
      type: String,
      default: 'Sallie\'s Personality'
    }
  },
  
  setup(props, { emit }) {
    // UI state
    const isLoading = ref(false)
    const activeTab = ref('traits')
    const traitView = ref('effective')
    
    // Confirmation dialog state
    const showConfirmation = ref(false)
    const confirmationTitle = ref('')
    const confirmationMessage = ref('')
    const pendingAction = ref(null)
    
    // Personality data
    const coreTraits = ref({})
    const adaptiveTraits = ref({})
    const effectiveTraits = ref({})
    const evolutionEvents = ref([])
    const currentContext = ref(null)
    const customContext = ref({
      type: 'CASUAL',
      description: ''
    })
    
    // Personality aspects data
    const personalityAspects = ref([
      { name: 'DIRECTNESS', value: 0.7, context: 'general' },
      { name: 'EMPATHY', value: 0.8, context: 'general' },
      { name: 'CHALLENGE', value: 0.65, context: 'general' },
      { name: 'PLAYFULNESS', value: 0.6, context: 'general' },
      { name: 'ANALYTICAL', value: 0.75, context: 'general' },
      { name: 'SUPPORTIVENESS', value: 0.7, context: 'general' }
    ])
    
    // Tab definitions
    const tabs = [
      { id: 'traits', label: 'Traits' },
      { id: 'aspects', label: 'Aspects' },
      { id: 'context', label: 'Context' },
      { id: 'evolution', label: 'Evolution' }
    ]
    
    // Context types and descriptions
    const contextTypes = [
      'PROFESSIONAL',
      'CASUAL',
      'EMOTIONAL_SUPPORT',
      'PRODUCTIVITY',
      'LEARNING',
      'CRISIS'
    ]
    
    // Context options for aspect dropdown
    const contexts = [
      { value: 'general', label: 'General' },
      { value: 'professional', label: 'Professional' },
      { value: 'casual', label: 'Casual' },
      { value: 'emotional', label: 'Emotional Support' },
      { value: 'productivity', label: 'Productivity' },
      { value: 'learning', label: 'Learning' },
      { value: 'crisis', label: 'Crisis' }
    ]
    
    // Computed property to determine which traits to display
    const displayedTraits = computed(() => {
      switch (traitView.value) {
        case 'core':
          return coreTraits.value
        case 'adaptive':
          return adaptiveTraits.value
        case 'effective':
        default:
          return effectiveTraits.value
      }
    })
    
    // Load initial personality data
    onMounted(() => {
      refreshPersonality()
    })
    
    // Format a trait name for display
    const formatTrait = (trait) => {
      return trait
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    // Format an aspect name for display
    const formatAspect = (aspect) => {
      return aspect
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    // Format a context type for display
    const formatContextType = (type) => {
      return type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    // Format an event type for display
    const formatEventType = (type) => {
      return type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    // Format a timestamp
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      
      // If today, just show time
      const now = new Date()
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      // Otherwise show date and time
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    // Format a value as percentage
    const formatPercentage = (value) => {
      return `${Math.round(value * 100)}%`
    }
    
    // Get description for a personality trait
    const getTraitDescription = (trait) => {
      const descriptions = {
        'ASSERTIVENESS': 'Confidence in expressing opinions and making decisions',
        'COMPASSION': 'Ability to care about and understand others\' feelings',
        'DISCIPLINE': 'Structure, rigor, and adherence to principles',
        'PATIENCE': 'Calmness and tolerance when facing difficulties',
        'EMOTIONAL_INTELLIGENCE': 'Recognizing and responding to emotions effectively',
        'CREATIVITY': 'Imaginative thinking and novel approaches',
        'OPTIMISM': 'Positive outlook and seeing opportunities in challenges',
        'DIPLOMACY': 'Tact and consideration in social interactions',
        'ADAPTABILITY': 'Flexibility and resilience when facing change'
      }
      
      return descriptions[trait] || 'A component of personality'
    }
    
    // Get description for a personality aspect
    const getAspectDescription = (aspect) => {
      const descriptions = {
        'DIRECTNESS': 'How straightforward and blunt in communication',
        'EMPATHY': 'How emotionally supportive and understanding',
        'CHALLENGE': 'How likely to push users out of comfort zones',
        'PLAYFULNESS': 'How fun, creative, and lighthearted',
        'ANALYTICAL': 'How logical, methodical, and systematic',
        'SUPPORTIVENESS': 'How encouraging and helpful in difficult times'
      }
      
      return descriptions[aspect] || 'A high-level personality characteristic'
    }
    
    // Get hint text for context types
    const getContextHint = (contextType) => {
      const hints = {
        'PROFESSIONAL': 'Business-like, formal, and task-oriented',
        'CASUAL': 'Relaxed, friendly, and conversational',
        'EMOTIONAL_SUPPORT': 'Compassionate, empathetic, and supportive',
        'PRODUCTIVITY': 'Efficient, focused, and results-oriented',
        'LEARNING': 'Patient, explanatory, and educational',
        'CRISIS': 'Direct, decisive, and action-oriented'
      }
      
      return hints[contextType] || 'A specific environmental situation'
    }
    
    // Refresh personality data from the backend
    const refreshPersonality = async () => {
      isLoading.value = true
      
      try {
        // In a real implementation, this would be an API call
        const result = await fetchPersonalityData()
        
        coreTraits.value = result.coreTraits
        adaptiveTraits.value = result.adaptiveTraits
        effectiveTraits.value = result.effectiveTraits
        currentContext.value = result.currentContext
        evolutionEvents.value = result.evolutionEvents
        
        // Update personality aspects
        updatePersonalityAspects()
        
        emit('refreshed')
      } catch (error) {
        console.error('Failed to refresh personality data:', error)
        emit('error', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // Mock function to simulate API call
    const fetchPersonalityData = () => {
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          resolve({
            coreTraits: {
              'ASSERTIVENESS': 0.7,
              'COMPASSION': 0.8,
              'DISCIPLINE': 0.75,
              'PATIENCE': 0.6,
              'EMOTIONAL_INTELLIGENCE': 0.8,
              'CREATIVITY': 0.65,
              'OPTIMISM': 0.7,
              'DIPLOMACY': 0.6,
              'ADAPTABILITY': 0.7
            },
            adaptiveTraits: {
              'ASSERTIVENESS': 0.65,
              'COMPASSION': 0.75,
              'DISCIPLINE': 0.7,
              'PATIENCE': 0.55,
              'EMOTIONAL_INTELLIGENCE': 0.75,
              'CREATIVITY': 0.7,
              'OPTIMISM': 0.65,
              'DIPLOMACY': 0.6,
              'ADAPTABILITY': 0.7
            },
            effectiveTraits: {
              'ASSERTIVENESS': 0.68,
              'COMPASSION': 0.78,
              'DISCIPLINE': 0.73,
              'PATIENCE': 0.58,
              'EMOTIONAL_INTELLIGENCE': 0.78,
              'CREATIVITY': 0.67,
              'OPTIMISM': 0.68,
              'DIPLOMACY': 0.6,
              'ADAPTABILITY': 0.7
            },
            currentContext: {
              type: 'CASUAL',
              description: 'General conversation'
            },
            evolutionEvents: [
              {
                id: '1',
                timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
                type: 'CONTEXT_CHANGE',
                description: 'Context changed to Casual: General conversation'
              },
              {
                id: '2',
                timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
                type: 'TRAIT_EVOLUTION',
                description: 'Personality evolved based on CONVERSATION interaction'
              },
              {
                id: '3',
                timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
                type: 'TRAIT_EVOLUTION',
                description: 'Personality evolved based on EMOTIONAL_RESPONSE interaction'
              },
              {
                id: '4',
                timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
                type: 'CORE_TRAIT_ADJUSTMENT',
                description: 'Core trait \'PATIENCE\' adjusted by 0.05: User requested more patience'
              }
            ]
          })
        }, 1000)
      })
    }
    
    // Update personality aspects based on current data
    const updatePersonalityAspects = () => {
      // In a real implementation, this would get actual aspect values from the backend
      // For now, we'll simulate different aspect values
      personalityAspects.value = [
        { 
          name: 'DIRECTNESS', 
          value: calculateAspectValue('DIRECTNESS'), 
          context: 'general' 
        },
        { 
          name: 'EMPATHY', 
          value: calculateAspectValue('EMPATHY'), 
          context: 'general' 
        },
        { 
          name: 'CHALLENGE', 
          value: calculateAspectValue('CHALLENGE'), 
          context: 'general' 
        },
        { 
          name: 'PLAYFULNESS', 
          value: calculateAspectValue('PLAYFULNESS'), 
          context: 'general' 
        },
        { 
          name: 'ANALYTICAL', 
          value: calculateAspectValue('ANALYTICAL'), 
          context: 'general' 
        },
        { 
          name: 'SUPPORTIVENESS', 
          value: calculateAspectValue('SUPPORTIVENESS'), 
          context: 'general' 
        }
      ]
    }
    
    // Calculate aspect value from traits (simplified approximation)
    const calculateAspectValue = (aspect) => {
      const traits = effectiveTraits.value
      
      switch (aspect) {
        case 'DIRECTNESS':
          return (traits.ASSERTIVENESS || 0.5) * 0.7 + (1 - (traits.DIPLOMACY || 0.5)) * 0.3
        case 'EMPATHY':
          return (traits.COMPASSION || 0.5) * 0.6 + (traits.EMOTIONAL_INTELLIGENCE || 0.5) * 0.4
        case 'CHALLENGE':
          return (traits.ASSERTIVENESS || 0.5) * 0.5 + (traits.DISCIPLINE || 0.5) * 0.5
        case 'PLAYFULNESS':
          return (traits.CREATIVITY || 0.5) * 0.5 + (traits.OPTIMISM || 0.5) * 0.5
        case 'ANALYTICAL':
          return (traits.DISCIPLINE || 0.5) * 0.4 + (traits.ADAPTABILITY || 0.5) * 0.3 + 
                 (traits.PATIENCE || 0.5) * 0.3
        case 'SUPPORTIVENESS':
          return (traits.COMPASSION || 0.5) * 0.4 + (traits.PATIENCE || 0.5) * 0.3 + 
                 (traits.OPTIMISM || 0.5) * 0.3
        default:
          return 0.5
      }
    }
    
    // Adjust a trait by a given amount
    const adjustTrait = (trait, amount) => {
      // In a real implementation, this would call the backend API
      
      // For the demo, just update the local value
      const currentValue = adaptiveTraits.value[trait] || 0.5
      const newValue = Math.max(0, Math.min(1, currentValue + amount))
      
      adaptiveTraits.value = {
        ...adaptiveTraits.value,
        [trait]: newValue
      }
      
      // Also update effective traits to see the change
      effectiveTraits.value = {
        ...effectiveTraits.value,
        [trait]: (effectiveTraits.value[trait] || 0.5) + (amount * 0.7) // Partial effect
      }
      
      // Add evolution event
      const direction = amount > 0 ? 'increased' : 'decreased'
      evolutionEvents.value = [
        {
          id: `manual-${Date.now()}`,
          timestamp: Date.now(),
          type: 'TRAIT_EVOLUTION',
          description: `Trait ${trait} manually ${direction} by ${Math.abs(amount)}`
        },
        ...evolutionEvents.value
      ]
      
      // Update aspects
      updatePersonalityAspects()
      
      // Emit change event
      emit('traitAdjusted', { trait, amount, newValue })
    }
    
    // Update an aspect's context
    const updateAspectContext = (aspect) => {
      // In a real implementation, this would recalculate the aspect value based on the new context
      
      // For the demo, simulate different values for different contexts
      const contextFactors = {
        'general': 0,
        'professional': aspect.name === 'DIRECTNESS' || aspect.name === 'ANALYTICAL' ? 0.1 : -0.05,
        'casual': aspect.name === 'PLAYFULNESS' ? 0.15 : -0.05,
        'emotional': aspect.name === 'EMPATHY' || aspect.name === 'SUPPORTIVENESS' ? 0.2 : -0.1,
        'productivity': aspect.name === 'CHALLENGE' || aspect.name === 'ANALYTICAL' ? 0.15 : -0.05,
        'learning': aspect.name === 'ANALYTICAL' ? 0.1 : 0,
        'crisis': aspect.name === 'DIRECTNESS' ? 0.2 : -0.1
      }
      
      const baseValue = calculateAspectValue(aspect.name)
      const adjustment = contextFactors[aspect.context] || 0
      aspect.value = Math.max(0, Math.min(1, baseValue + adjustment))
      
      // Emit change event
      emit('aspectContextChanged', { aspect: aspect.name, context: aspect.context })
    }
    
    // Set a new context
    const setContext = (contextType) => {
      // Create a context object with default description
      const context = {
        type: contextType,
        description: `${formatContextType(contextType)} interaction`
      }
      
      currentContext.value = context
      
      // Add evolution event
      evolutionEvents.value = [
        {
          id: `context-${Date.now()}`,
          timestamp: Date.now(),
          type: 'CONTEXT_CHANGE',
          description: `Context changed to ${formatContextType(contextType)}: ${context.description}`
        },
        ...evolutionEvents.value
      ]
      
      // In a real implementation, this would update the effective traits
      // For the demo, simulate context effects
      effectiveTraits.value = { ...applyContextEffects(contextType) }
      
      // Update aspects
      updatePersonalityAspects()
      
      // Emit change event
      emit('contextChanged', context)
    }
    
    // Apply context effects to traits
    const applyContextEffects = (contextType) => {
      const result = { ...adaptiveTraits.value }
      
      switch (contextType) {
        case 'PROFESSIONAL':
          result.DISCIPLINE = Math.min(1, (result.DISCIPLINE || 0.5) + 0.15)
          result.ASSERTIVENESS = Math.min(1, (result.ASSERTIVENESS || 0.5) + 0.1)
          result.CREATIVITY = Math.max(0, (result.CREATIVITY || 0.5) - 0.05)
          break
          
        case 'CASUAL':
          result.CREATIVITY = Math.min(1, (result.CREATIVITY || 0.5) + 0.15)
          result.OPTIMISM = Math.min(1, (result.OPTIMISM || 0.5) + 0.1)
          result.DISCIPLINE = Math.max(0, (result.DISCIPLINE || 0.5) - 0.1)
          break
          
        case 'EMOTIONAL_SUPPORT':
          result.COMPASSION = Math.min(1, (result.COMPASSION || 0.5) + 0.2)
          result.PATIENCE = Math.min(1, (result.PATIENCE || 0.5) + 0.15)
          result.EMOTIONAL_INTELLIGENCE = Math.min(1, (result.EMOTIONAL_INTELLIGENCE || 0.5) + 0.15)
          result.ASSERTIVENESS = Math.max(0, (result.ASSERTIVENESS || 0.5) - 0.1)
          break
          
        case 'PRODUCTIVITY':
          result.DISCIPLINE = Math.min(1, (result.DISCIPLINE || 0.5) + 0.2)
          result.ASSERTIVENESS = Math.min(1, (result.ASSERTIVENESS || 0.5) + 0.15)
          result.PATIENCE = Math.max(0, (result.PATIENCE || 0.5) - 0.05)
          break
          
        case 'LEARNING':
          result.PATIENCE = Math.min(1, (result.PATIENCE || 0.5) + 0.15)
          result.ADAPTABILITY = Math.min(1, (result.ADAPTABILITY || 0.5) + 0.15)
          result.CREATIVITY = Math.min(1, (result.CREATIVITY || 0.5) + 0.1)
          break
          
        case 'CRISIS':
          result.ASSERTIVENESS = Math.min(1, (result.ASSERTIVENESS || 0.5) + 0.25)
          result.ADAPTABILITY = Math.min(1, (result.ADAPTABILITY || 0.5) + 0.2)
          result.DIPLOMACY = Math.max(0, (result.DIPLOMACY || 0.5) - 0.15)
          break
      }
      
      return result
    }
    
    // Apply a custom context
    const applyCustomContext = () => {
      if (!customContext.value.description) return
      
      currentContext.value = { ...customContext.value }
      
      // Add evolution event
      evolutionEvents.value = [
        {
          id: `custom-context-${Date.now()}`,
          timestamp: Date.now(),
          type: 'CONTEXT_CHANGE',
          description: `Context changed to ${formatContextType(customContext.value.type)}: ${customContext.value.description}`
        },
        ...evolutionEvents.value
      ]
      
      // Apply context effects
      effectiveTraits.value = { ...applyContextEffects(customContext.value.type) }
      
      // Update aspects
      updatePersonalityAspects()
      
      // Emit change event
      emit('contextChanged', { ...customContext.value })
      
      // Reset custom context form
      customContext.value = {
        type: 'CASUAL',
        description: ''
      }
    }
    
    // Confirmation dialog functions
    const confirmReset = () => {
      confirmationTitle.value = 'Reset Adaptive Traits'
      confirmationMessage.value = 'Are you sure you want to reset adaptive traits to their default values? This cannot be undone.'
      pendingAction.value = 'reset'
      showConfirmation.value = true
    }
    
    const cancelConfirmation = () => {
      showConfirmation.value = false
      pendingAction.value = null
    }
    
    const confirmAction = () => {
      if (pendingAction.value === 'reset') {
        // Reset adaptive traits
        // In a real implementation, this would call the backend API
        adaptiveTraits.value = {
          'ASSERTIVENESS': 0.6,
          'COMPASSION': 0.7,
          'DISCIPLINE': 0.65,
          'PATIENCE': 0.55,
          'EMOTIONAL_INTELLIGENCE': 0.7,
          'CREATIVITY': 0.6,
          'OPTIMISM': 0.65,
          'DIPLOMACY': 0.6,
          'ADAPTABILITY': 0.65
        }
        
        // Update effective traits
        effectiveTraits.value = { ...applyContextEffects(currentContext.value?.type || 'CASUAL') }
        
        // Add evolution event
        evolutionEvents.value = [
          {
            id: `reset-${Date.now()}`,
            timestamp: Date.now(),
            type: 'RESET',
            description: 'Adaptive traits reset to defaults'
          },
          ...evolutionEvents.value
        ]
        
        // Update aspects
        updatePersonalityAspects()
        
        // Emit reset event
        emit('traitsReset')
      }
      
      // Close dialog
      showConfirmation.value = false
      pendingAction.value = null
    }
    
    // Save personality state
    const savePersonality = () => {
      // In a real implementation, this would call the backend API
      
      // For the demo, just show success feedback
      // Add evolution event
      evolutionEvents.value = [
        {
          id: `save-${Date.now()}`,
          timestamp: Date.now(),
          type: 'TRAIT_EVOLUTION',
          description: 'Personality state saved'
        },
        ...evolutionEvents.value
      ]
      
      // Emit save event
      emit('personalitySaved')
    }
    
    return {
      // UI state
      isLoading,
      activeTab,
      traitView,
      tabs,
      contextTypes,
      contexts,
      
      // Data
      coreTraits,
      adaptiveTraits,
      effectiveTraits,
      displayedTraits,
      evolutionEvents,
      currentContext,
      customContext,
      personalityAspects,
      
      // Confirmation dialog
      showConfirmation,
      confirmationTitle,
      confirmationMessage,
      
      // Methods
      refreshPersonality,
      formatTrait,
      formatAspect,
      formatContextType,
      formatEventType,
      formatTime,
      formatPercentage,
      getTraitDescription,
      getAspectDescription,
      getContextHint,
      adjustTrait,
      updateAspectContext,
      setContext,
      applyCustomContext,
      confirmReset,
      cancelConfirmation,
      confirmAction,
      savePersonality
    }
  }
})
</script>

<style scoped>
.personality-panel {
  background: var(--card-bg, #fff);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
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

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color, #eaeaea);
  padding-bottom: 0.5rem;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.tab-button.active {
  background: var(--primary-light, #eaf0f8);
  color: var(--primary-color, #4a6fa5);
  font-weight: 500;
}

.tab-button:hover:not(.active) {
  background: var(--hover-bg, #f5f5f5);
}

/* Traits Tab */
.trait-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.category-button {
  background: none;
  border: 1px solid var(--border-color, #eaeaea);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.category-button.active {
  background: var(--primary-color, #4a6fa5);
  border-color: var(--primary-color, #4a6fa5);
  color: white;
}

.category-button:hover:not(.active) {
  background: var(--hover-bg, #f5f5f5);
}

.traits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.trait-card {
  background: var(--card-secondary-bg, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.trait-card:hover {
  transform: translateY(-2px);
}

.trait-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.trait-name {
  font-weight: 600;
  color: var(--text-primary, #333);
}

.trait-value {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  font-weight: 500;
}

.trait-bar-container {
  height: 6px;
  background: var(--progress-bg, #e9ecef);
  border-radius: 3px;
  margin-bottom: 1rem;
}

.trait-bar {
  height: 100%;
  background: var(--primary-color, #4a6fa5);
  border-radius: 3px;
}

.trait-description {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.trait-controls {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.trait-adjust-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  border: none;
}

.trait-adjust-button.decrease {
  background: var(--danger-light, #fce8e8);
  color: var(--danger, #dc3545);
}

.trait-adjust-button.increase {
  background: var(--success-light, #e8f5e9);
  color: var(--success, #28a745);
}

/* Aspects Tab */
.aspects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.aspect-card {
  background: var(--card-secondary-bg, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.aspect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.aspect-name {
  font-weight: 600;
  color: var(--text-primary, #333);
}

.aspect-value {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  font-weight: 500;
}

.aspect-bar-container {
  height: 8px;
  background: var(--progress-bg, #e9ecef);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.aspect-bar {
  height: 100%;
  background: var(--accent-color, #8c54ff);
  border-radius: 4px;
}

.aspect-description {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.aspect-context {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.aspect-context label {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

.aspect-context select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color, #eaeaea);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
  color: var(--text-primary, #333);
}

/* Context Tab */
.context-tab {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.current-context,
.context-selector,
.custom-context-form {
  background: var(--card-secondary-bg, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.current-context h3,
.context-selector h3,
.custom-context-form h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary, #333);
}

.context-details {
  padding: 1rem;
  border-radius: 6px;
  background: white;
}

.context-type {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #333);
}

.context-description {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  margin: 0;
  line-height: 1.5;
}

.empty-context {
  padding: 1rem;
  text-align: center;
  color: var(--text-tertiary, #999);
}

.context-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.context-option {
  padding: 0.75rem;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.context-option:hover {
  background: var(--hover-bg, #f5f5f5);
}

.context-option.active {
  border-color: var(--primary-color, #4a6fa5);
  background: var(--primary-light, #eaf0f8);
}

.context-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #333);
}

.context-hint {
  font-size: 0.8rem;
  color: var(--text-tertiary, #999);
  margin: 0;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

.form-group select,
.form-group input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #eaeaea);
  border-radius: 4px;
  font-size: 0.95rem;
  background-color: white;
  color: var(--text-primary, #333);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.apply-button {
  background: var(--primary-color, #4a6fa5);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.apply-button:hover {
  background: var(--primary-dark, #3a5a8a);
}

.apply-button:disabled {
  background: var(--disabled-color, #cccccc);
  cursor: not-allowed;
}

/* Evolution Tab */
.evolution-timeline {
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.evolution-event {
  position: relative;
  padding: 1rem 1rem 1rem 2rem;
  margin-bottom: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.evolution-event::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 1.25rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color, #4a6fa5);
}

.evolution-event.trait-evolution::before {
  background: var(--accent-color, #8c54ff);
}

.evolution-event.core-trait-adjustment::before {
  background: var(--warning, #ffc107);
}

.evolution-event.context-change::before {
  background: var(--info, #17a2b8);
}

.evolution-event.reset::before {
  background: var(--danger, #dc3545);
}

.event-time {
  font-size: 0.8rem;
  color: var(--text-tertiary, #999);
  margin-bottom: 0.25rem;
}

.event-type {
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 0.5rem;
}

.event-description {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  margin: 0;
  line-height: 1.5;
}

/* Personality Actions */
.personality-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color, #eaeaea);
}

.personality-actions h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary, #333);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.reset {
  background: var(--danger-light, #fce8e8);
  color: var(--danger, #dc3545);
  border: 1px solid var(--danger, #dc3545);
}

.action-button.save {
  background: var(--primary-color, #4a6fa5);
  color: white;
  border: none;
}

.action-button.reset:hover {
  background: var(--danger, #dc3545);
  color: white;
}

.action-button.save:hover {
  background: var(--primary-dark, #3a5a8a);
}

/* Confirmation Dialog */
.confirmation-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirmation-content h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary, #333);
}

.confirmation-content p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary, #666);
  line-height: 1.5;
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button,
.confirm-button {
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-button {
  background: var(--cancel-bg, #f0f0f0);
  color: var(--text-secondary, #666);
  border: none;
}

.confirm-button {
  background: var(--danger, #dc3545);
  color: white;
  border: none;
}

.cancel-button:hover {
  background: var(--cancel-hover, #e0e0e0);
}

.confirm-button:hover {
  background: var(--danger-dark, #bd2130);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .context-tab {
    grid-template-columns: 1fr;
  }
  
  .traits-grid,
  .aspects-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
