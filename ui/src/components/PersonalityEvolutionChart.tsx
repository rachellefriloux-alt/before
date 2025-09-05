/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Personality Evolution Chart Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 * Uses react-native-svg for chart visualization
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Svg, { Line, Text as SvgText, Path, Circle, G } from 'react-native-svg';

interface PersonalityEvolutionChartProps {
  title?: string;
  initialData?: TraitDataPoint[];
  initialEvents?: EvolutionEvent[];
  showInsights?: boolean;
  onRefresh?: () => void;
  onError?: (error: any) => void;
}

interface TraitDataPoint {
  trait: string;
  timestamp: number;
  value: number;
}

interface EvolutionEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  trait: string | null;
  title: string;
  content: string;
}

const PersonalityEvolutionChart: React.FC<PersonalityEvolutionChartProps> = ({
  title = 'Personality Evolution',
  initialData = [],
  initialEvents = [],
  showInsights = true,
  onRefresh,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState('month');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['ASSERTIVENESS', 'COMPASSION', 'CREATIVITY']);
  const [evolutionData, setEvolutionData] = useState<TraitDataPoint[]>(initialData);
  const [evolutionEvents, setEvolutionEvents] = useState<EvolutionEvent[]>(initialEvents);
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    trait: null,
    title: '',
    content: ''
  });

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(screenWidth - 60, 800);
  const chartHeight = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 50 };

  // Time ranges available
  const timeRanges = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Year', value: 'year' },
    { label: 'All Time', value: 'all' }
  ];

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
  ];

  // Track the context changes from evolution events
  const contextChanges = useMemo(() => {
    return evolutionEvents
      .filter(event => event.type === 'CONTEXT_CHANGE')
      .map(event => ({
        timestamp: event.timestamp,
        description: event.description
      }));
  }, [evolutionEvents]);

  // Computed time range based on selection
  const timeRangeInMs = useMemo(() => {
    const now = Date.now();
    switch (selectedRange) {
      case 'week':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'month':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      case 'quarter':
        return 90 * 24 * 60 * 60 * 1000; // 90 days
      case 'year':
        return 365 * 24 * 60 * 60 * 1000; // 365 days
      case 'all':
      default:
        return Number.MAX_SAFE_INTEGER;
    }
  }, [selectedRange]);

  // Filtered data based on time range
  const filteredData = useMemo(() => {
    const cutoffTime = Date.now() - timeRangeInMs;
    return evolutionData.filter(item => item.timestamp > cutoffTime);
  }, [evolutionData, timeRangeInMs]);

  // X-axis scale
  const xScale = (timestamp: number): number => {
    const data = filteredData;
    if (data.length === 0) return margin.left;

    const minTimestamp = Math.min(...data.map(d => d.timestamp));
    const maxTimestamp = Math.max(...data.map(d => d.timestamp));

    // Handle case where there's only one data point
    const effectiveMaxTimestamp = maxTimestamp === minTimestamp ?
      maxTimestamp + 24 * 60 * 60 * 1000 : maxTimestamp;

    const ratio = (timestamp - minTimestamp) / (effectiveMaxTimestamp - minTimestamp);
    return margin.left + ratio * (chartWidth - margin.left - margin.right);
  };

  // Y-axis scale
  const yScale = (value: number): number => {
    const ratio = (value - 0) / (1 - 0); // Always scale from 0 to 1 (0% to 100%)
    return (chartHeight - margin.bottom) - ratio * (chartHeight - margin.top - margin.bottom);
  };

  // X-axis ticks
  const xAxisTicks = useMemo(() => {
    const data = filteredData;
    if (data.length === 0) return [];

    const minTimestamp = Math.min(...data.map(d => d.timestamp));
    const maxTimestamp = Math.max(...data.map(d => d.timestamp));

    // Generate 5 evenly spaced ticks
    const ticks = [];
    const tickCount = 5;

    for (let i = 0; i < tickCount; i++) {
      const tickValue = minTimestamp + (i / (tickCount - 1)) * (maxTimestamp - minTimestamp);
      ticks.push(tickValue);
    }

    return ticks;
  }, [filteredData]);

  // Y-axis ticks
  const yAxisTicks = [0, 0.25, 0.5, 0.75, 1.0];

  // Format a date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);

    if (selectedRange === 'week') {
      // For week view, show day and time
      return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
    } else if (selectedRange === 'month' || selectedRange === 'quarter') {
      // For month/quarter view, show abbreviated month and day
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      // For year/all time view, show abbreviated month and year
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
  };

  // Format a percentage value
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  // Format a trait name for display
  const formatTrait = (trait: string): string => {
    return trait
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get trait data from evolution data
  const getTraitData = (trait: string): TraitDataPoint[] => {
    return filteredData
      .filter(item => item.trait === trait)
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  // Get SVG path for a trait line
  const getLinePath = (trait: string): string => {
    const data = getTraitData(trait);

    if (data.length === 0) return '';

    // Start the path
    let path = `M ${xScale(data[0].timestamp)} ${yScale(data[0].value)}`;

    // Add line segments for each subsequent point
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(data[i].timestamp)} ${yScale(data[i].value)}`;
    }

    return path;
  };

  // Get color for a trait
  const getTraitColor = (trait: string): string => {
    const colors: { [key: string]: string } = {
      'ASSERTIVENESS': '#e74c3c',
      'COMPASSION': '#3498db',
      'DISCIPLINE': '#2ecc71',
      'PATIENCE': '#9b59b6',
      'EMOTIONAL_INTELLIGENCE': '#f1c40f',
      'CREATIVITY': '#e67e22',
      'OPTIMISM': '#1abc9c',
      'DIPLOMACY': '#34495e',
      'ADAPTABILITY': '#95a5a6'
    };

    return colors[trait] || '#666';
  };

  // Show tooltip for data point
  const showTooltip = (point: TraitDataPoint, trait: string, event: any) => {
    // For React Native, we'll use a simplified tooltip approach
    setTooltip({
      visible: true,
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
      trait: trait,
      title: formatTrait(trait),
      content: `${formatPercentage(point.value)} on ${new Date(point.timestamp).toLocaleDateString()} ${new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  };

  // Show tooltip for context change
  const showContextTooltip = (change: any, event: any) => {
    setTooltip({
      visible: true,
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
      trait: null,
      title: 'Context Change',
      content: `${change.description} on ${new Date(change.timestamp).toLocaleDateString()} ${new Date(change.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  };

  // Hide tooltip
  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Generate insights based on evolution data
  const insights = useMemo(() => {
    const insights: string[] = [];

    // Only generate insights if we have enough data
    if (filteredData.length < 5) {
      return ['Not enough data to generate insights yet.'];
    }

    // Find traits with the most change
    const traitChanges: { [key: string]: number } = {};
    selectedTraits.forEach(trait => {
      const data = getTraitData(trait);
      if (data.length >= 2) {
        const firstValue = data[0].value;
        const lastValue = data[data.length - 1].value;
        const change = lastValue - firstValue;
        traitChanges[trait] = change;
      }
    });

    // Get traits with most positive and negative change
    const sortedTraits = Object.entries(traitChanges)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

    if (sortedTraits.length > 0) {
      const [mostChangedTrait, changeValue] = sortedTraits[0];
      const direction = changeValue > 0 ? 'increased' : 'decreased';
      insights.push(`${formatTrait(mostChangedTrait)} has ${direction} the most (${formatPercentage(Math.abs(changeValue))}) over this time period.`);
    }

    // Check for correlation between context changes and trait changes
    if (contextChanges.length > 0) {
      insights.push(`There have been ${contextChanges.length} context changes during this period, which may have influenced trait evolution.`);
    }

    // Check for traits that have remained stable
    const stableTraits = Object.entries(traitChanges)
      .filter(([_, change]) => Math.abs(change) < 0.05)
      .map(([trait, _]) => trait);

    if (stableTraits.length > 0) {
      insights.push(`${stableTraits.map(formatTrait).join(', ')} ${stableTraits.length === 1 ? 'has' : 'have'} remained relatively stable.`);
    }

    return insights;
  }, [filteredData, selectedTraits, contextChanges]);

  // Load evolution data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      const result = await fetchEvolutionData();

      setEvolutionData(result.traitData);
      setEvolutionEvents(result.events);

      onRefresh?.();
    } catch (err) {
      console.error('Failed to refresh evolution data:', err);
      setError('Failed to load evolution data. Please try again.');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to simulate API call
  const fetchEvolutionData = (): Promise<{ traitData: TraitDataPoint[], events: EvolutionEvent[] }> => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        // Generate evolution data for the past year
        const traitData: TraitDataPoint[] = [];
        const traits = ['ASSERTIVENESS', 'COMPASSION', 'DISCIPLINE', 'PATIENCE', 'CREATIVITY'];

        // Start values for traits
        const traitValues: { [key: string]: number } = {
          'ASSERTIVENESS': 0.65,
          'COMPASSION': 0.7,
          'DISCIPLINE': 0.6,
          'PATIENCE': 0.55,
          'EMOTIONAL_INTELLIGENCE': 0.7,
          'CREATIVITY': 0.6,
          'OPTIMISM': 0.65,
          'DIPLOMACY': 0.55,
          'ADAPTABILITY': 0.6
        };

        // Generate data points for each trait
        for (const trait of Object.keys(traitValues)) {
          let value = traitValues[trait];

          // Data points every ~5 days for the past year
          for (let i = 365; i >= 0; i -= 5) {
            // Small random change in value
            const change = (Math.random() * 0.06) - 0.03;
            value = Math.max(0.1, Math.min(0.9, value + change));

            traitData.push({
              trait,
              timestamp: now - (i * day),
              value
            });
          }
        }

        // Generate evolution events
        const events: EvolutionEvent[] = [
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
        ];

        resolve({ traitData, events });
      }, 1000);
    });
  };

  // Load data on mount
  useEffect(() => {
    if (evolutionData.length === 0) {
      refreshData();
    }
  }, []);

  // Toggle trait selection
  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.refreshButtonDisabled]}
          onPress={refreshData}
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
          <Text style={styles.loadingText}>Loading evolution data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Time Range Selection */}
          <View style={styles.timeRange}>
            {timeRanges.map(range => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.rangeButton,
                  selectedRange === range.value && styles.rangeButtonActive
                ]}
                onPress={() => setSelectedRange(range.value)}
              >
                <Text style={[
                  styles.rangeButtonText,
                  selectedRange === range.value && styles.rangeButtonTextActive
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Trait Selection */}
          <View style={styles.traitSelection}>
            <Text style={styles.traitSelectionLabel}>Select traits to display:</Text>
            <View style={styles.traitCheckboxes}>
              {availableTraits.map(trait => (
                <TouchableOpacity
                  key={trait}
                  style={styles.traitCheckbox}
                  onPress={() => toggleTrait(trait)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedTraits.includes(trait) && styles.checkboxChecked
                  ]}>
                    {selectedTraits.includes(trait) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.traitCheckboxText}>{formatTrait(trait)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chart Visualization */}
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
              {/* Axes */}
              <G>
                {/* X-axis */}
                <Line
                  x1={margin.left}
                  y1={chartHeight - margin.bottom}
                  x2={chartWidth - margin.right}
                  y2={chartHeight - margin.bottom}
                  stroke="#999"
                  strokeWidth="1"
                />
                {/* Y-axis */}
                <Line
                  x1={margin.left}
                  y1={margin.top}
                  x2={margin.left}
                  y2={chartHeight - margin.bottom}
                  stroke="#999"
                  strokeWidth="1"
                />

                {/* X-axis ticks and labels */}
                {xAxisTicks.map((tick, i) => (
                  <G key={i}>
                    <Line
                      x1={xScale(tick)}
                      y1={chartHeight - margin.bottom}
                      x2={xScale(tick)}
                      y2={chartHeight - margin.bottom + 5}
                      stroke="#999"
                      strokeWidth="1"
                    />
                    <SvgText
                      x={xScale(tick)}
                      y={chartHeight - margin.bottom + 20}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#999"
                    >
                      {formatDate(tick)}
                    </SvgText>
                  </G>
                ))}

                {/* Y-axis ticks and labels */}
                {yAxisTicks.map(tick => (
                  <G key={tick}>
                    <Line
                      x1={margin.left}
                      y1={yScale(tick)}
                      x2={margin.left - 5}
                      y2={yScale(tick)}
                      stroke="#999"
                      strokeWidth="1"
                    />
                    <SvgText
                      x={margin.left - 10}
                      y={yScale(tick)}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      fontSize="12"
                      fill="#999"
                    >
                      {formatPercentage(tick)}
                    </SvgText>
                  </G>
                ))}

                {/* Grid Lines */}
                {yAxisTicks.map(tick => (
                  <Line
                    key={`grid-${tick}`}
                    x1={margin.left}
                    y1={yScale(tick)}
                    x2={chartWidth - margin.right}
                    y2={yScale(tick)}
                    stroke="#eaeaea"
                    strokeWidth="1"
                  />
                ))}
              </G>

              {/* Data Lines */}
              {selectedTraits.map(trait => (
                <G key={`line-${trait}`}>
                  <Path
                    d={getLinePath(trait)}
                    stroke={getTraitColor(trait)}
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* Data Points */}
                  {getTraitData(trait).map((point, i) => (
                    <Circle
                      key={`point-${trait}-${i}`}
                      cx={xScale(point.timestamp)}
                      cy={yScale(point.value)}
                      r="4"
                      fill={getTraitColor(trait)}
                      onPress={(event) => showTooltip(point, trait, event)}
                    />
                  ))}
                </G>
              ))}

              {/* Context Changes */}
              {contextChanges.map((change, i) => (
                <G key={`context-${i}`}>
                  <Line
                    x1={xScale(change.timestamp)}
                    y1={margin.top}
                    x2={xScale(change.timestamp)}
                    y2={chartHeight - margin.bottom}
                    stroke="#888"
                    strokeWidth="1"
                    strokeDasharray="5,3"
                  />
                  <Circle
                    cx={xScale(change.timestamp)}
                    cy={margin.top}
                    r="5"
                    fill="#888"
                    onPress={(event) => showContextTooltip(change, event)}
                  />
                </G>
              ))}
            </Svg>

            {/* Tooltip */}
            {tooltip.visible && (
              <View style={[styles.tooltip, { left: tooltip.x, top: tooltip.y }]}>
                <Text style={styles.tooltipHeader}>{tooltip.title}</Text>
                <Text style={styles.tooltipContent}>{tooltip.content}</Text>
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {selectedTraits.map(trait => (
              <View key={`legend-${trait}`} style={styles.legendItem}>
                <View style={[styles.colorSwatch, { backgroundColor: getTraitColor(trait) }]} />
                <Text style={styles.legendText}>{formatTrait(trait)}</Text>
              </View>
            ))}
          </View>

          {/* Chart Insights */}
          {showInsights && (
            <View style={styles.insights}>
              <Text style={styles.insightsTitle}>Evolution Insights</Text>
              {insights.map((insight, i) => (
                <Text key={`insight-${i}`} style={styles.insightItem}>
                  • {insight}
                </Text>
              ))}
            </View>
          )}
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
  content: {
    flex: 1,
    padding: 15,
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
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  timeRange: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  rangeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eaeaea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rangeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  traitSelection: {
    marginBottom: 20,
  },
  traitSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  traitCheckboxes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  traitCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  traitCheckboxText: {
    fontSize: 14,
    color: '#333',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    position: 'relative',
  },
  chart: {
    alignSelf: 'center',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
    maxWidth: 200,
  },
  tooltipHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tooltipContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  insights: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  insightItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default PersonalityEvolutionChart;
