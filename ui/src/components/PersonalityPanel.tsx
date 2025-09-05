/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Personality Panel Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PersonalityPanelProps {
  title?: string;
  onRefresh?: () => void;
  onError?: (error: Error) => void;
  onTraitAdjust?: (trait: string, adjustment: number) => void;
  onContextChange?: (context: string) => void;
}

interface PersonalityTrait {
  [key: string]: number;
}

interface PersonalityAspect {
  name: string;
  value: number;
  context: string;
}

interface ContextOption {
  value: string;
  label: string;
}

interface EvolutionEvent {
  type: string;
  timestamp: number;
  description: string;
}

const PersonalityPanel: React.FC<PersonalityPanelProps> = ({
  title = "Sallie's Personality",
  onRefresh,
  onError,
  onTraitAdjust,
  onContextChange
}) => {
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('traits');
  const [traitView, setTraitView] = useState('effective');

  // Personality data
  const [coreTraits, setCoreTraits] = useState<PersonalityTrait>({});
  const [adaptiveTraits, setAdaptiveTraits] = useState<PersonalityTrait>({});
  const [effectiveTraits, setEffectiveTraits] = useState<PersonalityTrait>({});
  const [evolutionEvents, setEvolutionEvents] = useState<EvolutionEvent[]>([]);
  const [currentContext, setCurrentContext] = useState<any>(null);

  // Personality aspects data
  const [personalityAspects, setPersonalityAspects] = useState<PersonalityAspect[]>([
    { name: 'DIRECTNESS', value: 0.7, context: 'general' },
    { name: 'EMPATHY', value: 0.8, context: 'general' },
    { name: 'CHALLENGE', value: 0.65, context: 'general' },
    { name: 'PLAYFULNESS', value: 0.6, context: 'general' },
    { name: 'ANALYTICAL', value: 0.75, context: 'general' },
    { name: 'SUPPORTIVENESS', value: 0.7, context: 'general' }
  ]);

  // Tab definitions
  const tabs = [
    { id: 'traits', label: 'Traits' },
    { id: 'aspects', label: 'Aspects' },
    { id: 'context', label: 'Context' },
    { id: 'evolution', label: 'Evolution' }
  ];

  // Context types and descriptions
  const contextTypes = [
    'PROFESSIONAL',
    'CASUAL',
    'EMOTIONAL_SUPPORT',
    'PRODUCTIVITY',
    'LEARNING',
    'CRISIS'
  ];

  // Context options for aspect dropdown
  const contexts: ContextOption[] = [
    { value: 'general', label: 'General' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'emotional', label: 'Emotional Support' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'learning', label: 'Learning' },
    { value: 'crisis', label: 'Crisis' }
  ];

  // Computed property to determine which traits to display
  const displayedTraits = useMemo(() => {
    switch (traitView) {
      case 'core':
        return coreTraits;
      case 'adaptive':
        return adaptiveTraits;
      case 'effective':
      default:
        return effectiveTraits;
    }
  }, [traitView, coreTraits, adaptiveTraits, effectiveTraits]);

  // Load initial personality data
  useEffect(() => {
    refreshPersonality();
  }, []);

  // Format a trait name for display
  const formatTrait = (trait: string): string => {
    return trait
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format an aspect name for display
  const formatAspect = (aspect: string): string => {
    return aspect
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format a context type for display
  const formatContextType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format an event type for display
  const formatEventType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format a timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);

    // If today, just show time
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Otherwise show date and time
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format a value as percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  // Get description for a personality trait
  const getTraitDescription = (trait: string): string => {
    const descriptions: { [key: string]: string } = {
      'ASSERTIVENESS': 'Confidence in expressing opinions and making decisions',
      'COMPASSION': 'Ability to care about and understand others\' feelings',
      'DISCIPLINE': 'Structure, rigor, and adherence to principles',
      'PATIENCE': 'Calmness and tolerance when facing difficulties',
      'EMOTIONAL_INTELLIGENCE': 'Recognizing and responding to emotions effectively',
      'CREATIVITY': 'Imaginative thinking and novel approaches',
      'OPTIMISM': 'Positive outlook and seeing opportunities in challenges',
      'DIPLOMACY': 'Tact and consideration in social interactions',
      'ADAPTABILITY': 'Flexibility and resilience when facing change'
    };

    return descriptions[trait] || 'A component of personality';
  };

  // Get description for a personality aspect
  const getAspectDescription = (aspect: string): string => {
    const descriptions: { [key: string]: string } = {
      'DIRECTNESS': 'How straightforward and blunt in communication',
      'EMPATHY': 'How emotionally supportive and understanding',
      'CHALLENGE': 'How likely to push users out of comfort zones',
      'PLAYFULNESS': 'How fun, creative, and lighthearted',
      'ANALYTICAL': 'How logical, methodical, and systematic',
      'SUPPORTIVENESS': 'How encouraging and helpful in difficult times'
    };

    return descriptions[aspect] || 'A high-level personality characteristic';
  };

  // Get hint text for context types
  const getContextHint = (contextType: string): string => {
    const hints: { [key: string]: string } = {
      'PROFESSIONAL': 'Business-like, formal, and task-oriented',
      'CASUAL': 'Relaxed, friendly, and conversational',
      'EMOTIONAL_SUPPORT': 'Compassionate, empathetic, and supportive',
      'PRODUCTIVITY': 'Efficient, focused, and results-oriented',
      'LEARNING': 'Patient, explanatory, and educational',
      'CRISIS': 'Direct, decisive, and action-oriented'
    };

    return hints[contextType] || 'A specific environmental situation';
  };

  // Refresh personality data from the backend
  const refreshPersonality = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, this would be an API call
      const result = await fetchPersonalityData();

      setCoreTraits(result.coreTraits);
      setAdaptiveTraits(result.adaptiveTraits);
      setEffectiveTraits(result.effectiveTraits);
      setCurrentContext(result.currentContext);
      setEvolutionEvents(result.evolutionEvents);

      // Update personality aspects
      updatePersonalityAspects();

      onRefresh?.();
    } catch (error) {
      console.error('Failed to refresh personality data:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to simulate API call
  const fetchPersonalityData = (): Promise<any> => {
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
            'ASSERTIVENESS': 0.75,
            'COMPASSION': 0.85,
            'DISCIPLINE': 0.8,
            'PATIENCE': 0.65,
            'EMOTIONAL_INTELLIGENCE': 0.85,
            'CREATIVITY': 0.7,
            'OPTIMISM': 0.75,
            'DIPLOMACY': 0.65,
            'ADAPTABILITY': 0.75
          },
          effectiveTraits: {
            'ASSERTIVENESS': 0.72,
            'COMPASSION': 0.82,
            'DISCIPLINE': 0.77,
            'PATIENCE': 0.62,
            'EMOTIONAL_INTELLIGENCE': 0.82,
            'CREATIVITY': 0.67,
            'OPTIMISM': 0.72,
            'DIPLOMACY': 0.62,
            'ADAPTABILITY': 0.72
          },
          currentContext: {
            type: 'CASUAL',
            description: 'Relaxed, friendly conversation'
          },
          evolutionEvents: [
            {
              type: 'ADAPTATION',
              timestamp: Date.now() - 3600000,
              description: 'Adapted communication style based on user feedback'
            },
            {
              type: 'LEARNING',
              timestamp: Date.now() - 7200000,
              description: 'Learned new conversational patterns'
            }
          ]
        });
      }, 1000);
    });
  };

  // Update personality aspects based on traits
  const updatePersonalityAspects = () => {
    // This would calculate aspects from traits in a real implementation
    // For now, we'll keep the static data
  };

  // Adjust a trait value
  const adjustTrait = (trait: string, adjustment: number) => {
    const newValue = Math.max(0, Math.min(1, displayedTraits[trait] + adjustment));

    if (traitView === 'adaptive') {
      setAdaptiveTraits(prev => ({
        ...prev,
        [trait]: newValue
      }));
    }

    onTraitAdjust?.(trait, adjustment);
  };

  // Update aspect context
  const updateAspectContext = (aspect: PersonalityAspect, newContext: string) => {
    setPersonalityAspects(prev =>
      prev.map(a =>
        a.name === aspect.name ? { ...a, context: newContext } : a
      )
    );
  };

  // Set current context
  const setContext = (contextType: string) => {
    setCurrentContext({
      type: contextType,
      description: getContextHint(contextType)
    });
    onContextChange?.(contextType);
  };

  // Render trait card
  const renderTraitCard = (trait: string, value: number) => (
    <View key={trait} style={styles.traitCard}>
      <View style={styles.traitHeader}>
        <Text style={styles.traitName}>{formatTrait(trait)}</Text>
        <Text style={styles.traitValue}>{formatPercentage(value)}</Text>
      </View>
      <View style={styles.traitBarContainer}>
        <View style={[styles.traitBar, { width: `${value * 100}%` }]} />
      </View>
      <Text style={styles.traitDescription}>{getTraitDescription(trait)}</Text>

      {traitView === 'adaptive' && (
        <View style={styles.traitControls}>
          <TouchableOpacity
            style={[styles.traitAdjustButton, styles.decreaseButton]}
            onPress={() => adjustTrait(trait, -0.05)}
          >
            <Text style={styles.adjustButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.traitAdjustButton, styles.increaseButton]}
            onPress={() => adjustTrait(trait, 0.05)}
          >
            <Text style={styles.adjustButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render aspect card
  const renderAspectCard = (aspect: PersonalityAspect) => (
    <View key={aspect.name} style={styles.aspectCard}>
      <View style={styles.aspectHeader}>
        <Text style={styles.aspectName}>{formatAspect(aspect.name)}</Text>
        <Text style={styles.aspectValue}>{formatPercentage(aspect.value)}</Text>
      </View>
      <View style={styles.aspectBarContainer}>
        <View style={[styles.aspectBar, { width: `${aspect.value * 100}%` }]} />
      </View>
      <Text style={styles.aspectDescription}>{getAspectDescription(aspect.name)}</Text>

      <View style={styles.aspectContext}>
        <Text style={styles.contextLabel}>In context:</Text>
        <View style={styles.contextSelector}>
          {contexts.map(context => (
            <TouchableOpacity
              key={context.value}
              style={[
                styles.contextOption,
                aspect.context === context.value && styles.contextOptionActive
              ]}
              onPress={() => updateAspectContext(aspect, context.value)}
            >
              <Text style={[
                styles.contextOptionText,
                aspect.context === context.value && styles.contextOptionTextActive
              ]}>
                {context.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Render evolution event
  const renderEvolutionEvent = (event: EvolutionEvent) => (
    <View key={`${event.type}-${event.timestamp}`} style={styles.evolutionEvent}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventType}>{formatEventType(event.type)}</Text>
        <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
      </View>
      <Text style={styles.eventDescription}>{event.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.refreshButtonDisabled]}
          onPress={refreshPersonality}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Analyzing personality...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Tab Navigation */}
          <View style={styles.tabs}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && styles.tabButtonActive
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === tab.id && styles.tabButtonTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {/* Traits Tab */}
            {activeTab === 'traits' && (
              <View style={styles.traitsTab}>
                <View style={styles.traitCategories}>
                  {['effective', 'core', 'adaptive'].map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        traitView === category && styles.categoryButtonActive
                      ]}
                      onPress={() => setTraitView(category)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        traitView === category && styles.categoryButtonTextActive
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.traitsGrid}>
                  {Object.entries(displayedTraits).map(([trait, value]) =>
                    renderTraitCard(trait, value)
                  )}
                </View>
              </View>
            )}

            {/* Aspects Tab */}
            {activeTab === 'aspects' && (
              <View style={styles.aspectsTab}>
                <View style={styles.aspectsGrid}>
                  {personalityAspects.map(aspect => renderAspectCard(aspect))}
                </View>
              </View>
            )}

            {/* Context Tab */}
            {activeTab === 'context' && (
              <View style={styles.contextTab}>
                <View style={styles.currentContext}>
                  <Text style={styles.sectionTitle}>Current Context</Text>
                  {currentContext ? (
                    <View style={styles.contextDetails}>
                      <Text style={styles.contextType}>
                        {formatContextType(currentContext.type)}
                      </Text>
                      <Text style={styles.contextDescription}>
                        {currentContext.description}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.emptyContext}>No active context set</Text>
                  )}
                </View>

                <View style={styles.contextSelector}>
                  <Text style={styles.sectionTitle}>Change Context</Text>
                  <View style={styles.contextOptions}>
                    {contextTypes.map(contextType => (
                      <TouchableOpacity
                        key={contextType}
                        style={[
                          styles.contextOption,
                          currentContext?.type === contextType && styles.contextOptionActive
                        ]}
                        onPress={() => setContext(contextType)}
                      >
                        <Text style={[
                          styles.contextOptionText,
                          currentContext?.type === contextType && styles.contextOptionTextActive
                        ]}>
                          {formatContextType(contextType)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Evolution Tab */}
            {activeTab === 'evolution' && (
              <View style={styles.evolutionTab}>
                <Text style={styles.sectionTitle}>Evolution History</Text>
                {evolutionEvents.length > 0 ? (
                  <View style={styles.evolutionEvents}>
                    {evolutionEvents.map(event => renderEvolutionEvent(event))}
                  </View>
                ) : (
                  <Text style={styles.emptyEvolution}>No evolution events yet</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#667eea',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabContent: {
    padding: 15,
  },
  traitsTab: {
    // Container for traits content
  },
  traitCategories: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 2,
    borderRadius: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  traitsGrid: {
    // Grid layout for trait cards
  },
  traitCard: {
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
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  traitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  traitBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 10,
  },
  traitBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  traitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  traitControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  traitAdjustButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  decreaseButton: {
    backgroundColor: '#ff6b6b',
  },
  increaseButton: {
    backgroundColor: '#51cf66',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aspectsTab: {
    // Container for aspects content
  },
  aspectsGrid: {
    // Grid layout for aspect cards
  },
  aspectCard: {
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
  aspectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aspectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  aspectValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  aspectBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 10,
  },
  aspectBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  aspectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  aspectContext: {
    // Container for context selection
  },
  contextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  contextSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contextOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  contextOptionActive: {
    backgroundColor: '#667eea',
  },
  contextOptionText: {
    fontSize: 12,
    color: '#666',
  },
  contextOptionTextActive: {
    color: '#fff',
  },
  contextTab: {
    // Container for context content
  },
  currentContext: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contextDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  contextType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 5,
  },
  contextDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyContext: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  contextOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  evolutionTab: {
    // Container for evolution content
  },
  evolutionEvents: {
    // Container for evolution events
  },
  evolutionEvent: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyEvolution: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PersonalityPanel;
