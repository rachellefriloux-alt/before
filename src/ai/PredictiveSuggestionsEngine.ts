/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Predictive Suggestions Engine                                      │
 * │                                                                              │
 * │   Analyzes user behavior patterns and provides proactive suggestions         │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Predictive Suggestions Engine for Sallie
// Learns from user behavior and provides personalized, proactive recommendations

export interface UserBehavior {
  action: string;
  timestamp: Date;
  context: string;
  duration?: number;
  success?: boolean;
  emotionalState?: string;
  location?: string;
  timeOfDay: number; // hour of day (0-23)
  dayOfWeek: number; // 0-6, Sunday = 0
}

export interface BehaviorPattern {
  patternId: string;
  action: string;
  frequency: number;
  averageTime: number; // hour of day
  preferredDays: number[];
  contexts: string[];
  successRate: number;
  lastOccurrence: Date;
  confidence: number;
}

export interface PredictiveSuggestion {
  suggestion: string;
  action: string;
  confidence: number;
  reasoning: string;
  timing: 'immediate' | 'soon' | 'later' | 'scheduled';
  category: 'productivity' | 'wellness' | 'social' | 'learning' | 'entertainment';
  context: string;
  expectedBenefit: string;
}

export interface UserPreferences {
  preferredTimes: Record<string, number[]>;
  favoriteActivities: string[];
  avoidedActivities: string[];
  energyPatterns: Record<number, 'high' | 'medium' | 'low'>;
  socialPreferences: 'extroverted' | 'introverted' | 'balanced';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

/**
 * Predictive Suggestions Engine
 */
export class PredictiveSuggestionsEngine {
  private behaviorHistory: UserBehavior[] = [];
  private behaviorPatterns: Map<string, BehaviorPattern> = new Map();
  private userPreferences: UserPreferences;
  private maxHistorySize = 1000;

  constructor() {
    this.userPreferences = this.initializeDefaultPreferences();
  }

  /**
   * Record user behavior for pattern analysis
   */
  public recordBehavior(behavior: Omit<UserBehavior, 'timestamp'>): void {
    const fullBehavior: UserBehavior = {
      ...behavior,
      timestamp: new Date()
    };

    this.behaviorHistory.push(fullBehavior);

    // Maintain history size limit
    if (this.behaviorHistory.length > this.maxHistorySize) {
      this.behaviorHistory.shift();
    }

    // Update patterns
    this.updatePatterns(fullBehavior);
  }

  /**
   * Generate predictive suggestions based on current context
   */
  public generateSuggestions(
    currentContext: {
      timeOfDay: number;
      dayOfWeek: number;
      location?: string;
      emotionalState?: string;
      recentActivities: string[];
    }
  ): PredictiveSuggestion[] {
    const suggestions: PredictiveSuggestion[] = [];

    // Analyze patterns for current context
    const relevantPatterns = this.findRelevantPatterns(currentContext);

    // Generate suggestions from patterns
    relevantPatterns.forEach(pattern => {
      const suggestion = this.createSuggestionFromPattern(pattern, currentContext);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });

    // Add contextual suggestions
    suggestions.push(...this.generateContextualSuggestions(currentContext));

    // Add wellness suggestions
    suggestions.push(...this.generateWellnessSuggestions(currentContext));

    // Sort by confidence and filter top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Learn from user feedback on suggestions
   */
  public learnFromFeedback(suggestion: PredictiveSuggestion, accepted: boolean, rating?: number): void {
    // Update pattern confidence based on feedback
    const pattern = Array.from(this.behaviorPatterns.values())
      .find(p => p.action === suggestion.action);

    if (pattern) {
      if (accepted) {
        pattern.confidence = Math.min(1, pattern.confidence + 0.1);
        pattern.frequency += 0.5;
      } else {
        pattern.confidence = Math.max(0, pattern.confidence - 0.05);
      }
    }

    // Update user preferences
    this.updateUserPreferences(suggestion, accepted, rating);
  }

  /**
   * Get user behavior insights
   */
  public getBehaviorInsights(): {
    topActivities: string[];
    peakProductivityHours: number[];
    preferredDays: number[];
    energyPatterns: Record<number, string>;
    trends: string[];
  } {
    const topActivities = this.getTopActivities();
    const peakHours = this.getPeakProductivityHours();
    const preferredDays = this.getPreferredDays();
    const energyPatterns = this.analyzeEnergyPatterns();
    const trends = this.identifyTrends();

    return {
      topActivities,
      peakProductivityHours: peakHours,
      preferredDays,
      energyPatterns,
      trends
    };
  }

  private initializeDefaultPreferences(): UserPreferences {
    return {
      preferredTimes: {},
      favoriteActivities: [],
      avoidedActivities: [],
      energyPatterns: {},
      socialPreferences: 'balanced',
      learningStyle: 'visual'
    };
  }

  private updatePatterns(behavior: UserBehavior): void {
    const patternKey = `${behavior.action}_${behavior.timeOfDay}_${behavior.dayOfWeek}`;

    let pattern = this.behaviorPatterns.get(patternKey);

    if (!pattern) {
      pattern = {
        patternId: patternKey,
        action: behavior.action,
        frequency: 0,
        averageTime: behavior.timeOfDay,
        preferredDays: [],
        contexts: [],
        successRate: 0.5,
        lastOccurrence: behavior.timestamp,
        confidence: 0.5
      };
      this.behaviorPatterns.set(patternKey, pattern);
    }

    // Update pattern statistics
    pattern.frequency += 1;
    pattern.lastOccurrence = behavior.timestamp;

    // Update average time
    const totalOccurrences = pattern.frequency;
    pattern.averageTime = (pattern.averageTime * (totalOccurrences - 1) + behavior.timeOfDay) / totalOccurrences;

    // Update preferred days
    if (!pattern.preferredDays.includes(behavior.dayOfWeek)) {
      pattern.preferredDays.push(behavior.dayOfWeek);
    }

    // Update contexts
    if (behavior.context && !pattern.contexts.includes(behavior.context)) {
      pattern.contexts.push(behavior.context);
    }

    // Update success rate
    if (behavior.success !== undefined) {
      pattern.successRate = (pattern.successRate * (totalOccurrences - 1) + (behavior.success ? 1 : 0)) / totalOccurrences;
    }

    // Update confidence based on frequency and consistency
    pattern.confidence = Math.min(1, pattern.frequency / 10 * 0.8 + pattern.successRate * 0.2);
  }

  private findRelevantPatterns(context: {
    timeOfDay: number;
    dayOfWeek: number;
    location?: string;
    emotionalState?: string;
    recentActivities: string[];
  }): BehaviorPattern[] {
    return Array.from(this.behaviorPatterns.values())
      .filter(pattern => {
        // Time proximity (within 2 hours)
        const timeDiff = Math.abs(pattern.averageTime - context.timeOfDay);
        const timeMatch = timeDiff <= 2 || timeDiff >= 22; // Handle wrap-around

        // Day match
        const dayMatch = pattern.preferredDays.includes(context.dayOfWeek);

        // Context match
        const contextMatch = !context.location || pattern.contexts.includes(context.location);

        // Recent activity consideration
        const recentActivityMatch = context.recentActivities.length === 0 ||
          !context.recentActivities.includes(pattern.action);

        return (timeMatch || dayMatch) && contextMatch && recentActivityMatch && pattern.confidence > 0.3;
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  private createSuggestionFromPattern(
    pattern: BehaviorPattern,
    context: {
      timeOfDay: number;
      dayOfWeek: number;
      location?: string;
      emotionalState?: string;
    }
  ): PredictiveSuggestion | null {
    const timeDiff = Math.abs(pattern.averageTime - context.timeOfDay);
    const isPreferredTime = timeDiff <= 1;

    let timing: 'immediate' | 'soon' | 'later' | 'scheduled' = 'later';
    let reasoning = '';

    if (isPreferredTime) {
      timing = 'immediate';
      reasoning = `This is your usual time for ${pattern.action}`;
    } else if (timeDiff <= 2) {
      timing = 'soon';
      reasoning = `You're approaching your usual time for ${pattern.action}`;
    } else {
      timing = 'scheduled';
      reasoning = `Based on your pattern of doing ${pattern.action} around ${Math.floor(pattern.averageTime)}:00`;
    }

    const category = this.categorizeActivity(pattern.action);
    const expectedBenefit = this.getExpectedBenefit(pattern.action, context);

    return {
      suggestion: this.generateSuggestionText(pattern.action, timing),
      action: pattern.action,
      confidence: pattern.confidence,
      reasoning,
      timing,
      category,
      context: pattern.contexts[0] || 'general',
      expectedBenefit
    };
  }

  private generateContextualSuggestions(context: {
    timeOfDay: number;
    dayOfWeek: number;
    location?: string;
    emotionalState?: string;
    recentActivities: string[];
  }): PredictiveSuggestion[] {
    const suggestions: PredictiveSuggestion[] = [];

    // Time-based suggestions
    if (context.timeOfDay >= 6 && context.timeOfDay <= 9) {
      suggestions.push({
        suggestion: "Start your day with a healthy breakfast and light exercise",
        action: "morning_routine",
        confidence: 0.7,
        reasoning: "Morning is a great time for establishing healthy habits",
        timing: "immediate",
        category: "wellness",
        context: "morning",
        expectedBenefit: "Boost energy and set a positive tone for the day"
      });
    }

    if (context.timeOfDay >= 12 && context.timeOfDay <= 14) {
      suggestions.push({
        suggestion: "Take a lunch break to recharge and eat mindfully",
        action: "lunch_break",
        confidence: 0.6,
        reasoning: "Midday is ideal for a nutritious meal and mental reset",
        timing: "immediate",
        category: "wellness",
        context: "midday",
        expectedBenefit: "Maintain energy levels and improve afternoon productivity"
      });
    }

    // Emotional state-based suggestions
    if (context.emotionalState === 'stressed' || context.emotionalState === 'anxious') {
      suggestions.push({
        suggestion: "Try a 5-minute breathing exercise to reduce stress",
        action: "breathing_exercise",
        confidence: 0.8,
        reasoning: "Breathing exercises are effective for managing stress and anxiety",
        timing: "immediate",
        category: "wellness",
        context: "stress_management",
        expectedBenefit: "Reduce stress levels and improve emotional regulation"
      });
    }

    if (context.emotionalState === 'tired' || context.emotionalState === 'exhausted') {
      suggestions.push({
        suggestion: "Consider a short power nap or relaxation break",
        action: "rest_break",
        confidence: 0.7,
        reasoning: "Rest can help restore energy and improve focus",
        timing: "soon",
        category: "wellness",
        context: "energy_management",
        expectedBenefit: "Restore energy and improve cognitive function"
      });
    }

    return suggestions;
  }

  private generateWellnessSuggestions(context: {
    timeOfDay: number;
    dayOfWeek: number;
    recentActivities: string[];
  }): PredictiveSuggestion[] {
    const suggestions: PredictiveSuggestion[] = [];

    // Check if user has been sedentary
    const recentSedentary = context.recentActivities.some(activity =>
      ['work', 'study', 'reading', 'computer'].includes(activity)
    );

    if (recentSedentary && context.timeOfDay >= 9 && context.timeOfDay <= 17) {
      suggestions.push({
        suggestion: "Take a short walk to stretch and get some fresh air",
        action: "walking_break",
        confidence: 0.6,
        reasoning: "Movement breaks improve circulation and mental clarity",
        timing: "soon",
        category: "wellness",
        context: "activity_break",
        expectedBenefit: "Improve physical health and mental focus"
      });
    }

    // Hydration reminder
    if (!context.recentActivities.includes('drink_water') &&
        Math.random() < 0.3) { // Random chance to avoid being too repetitive
      suggestions.push({
        suggestion: "Remember to stay hydrated - have a glass of water",
        action: "drink_water",
        confidence: 0.5,
        reasoning: "Proper hydration is essential for physical and mental performance",
        timing: "immediate",
        category: "wellness",
        context: "health",
        expectedBenefit: "Maintain hydration and support overall health"
      });
    }

    return suggestions;
  }

  private generateSuggestionText(action: string, timing: string): string {
    const timingPhrases = {
      immediate: "How about",
      soon: "Soon you might want to",
      later: "Later you could",
      scheduled: "You might want to"
    };

    const actionPhrases: Record<string, string> = {
      'exercise': 'go for a walk or do some light exercise',
      'meditation': 'try a short meditation session',
      'reading': 'read something interesting',
      'social': 'connect with a friend or loved one',
      'learning': 'learn something new or practice a skill',
      'work': 'focus on an important task',
      'relaxation': 'take some time to relax and unwind',
      'morning_routine': 'start your morning routine',
      'lunch_break': 'take your lunch break',
      'breathing_exercise': 'do some breathing exercises',
      'rest_break': 'take a rest break',
      'walking_break': 'go for a short walk',
      'drink_water': 'have a drink of water'
    };

    const actionText = actionPhrases[action] || action.replace(/_/g, ' ');
    return `${timingPhrases[timing as keyof typeof timingPhrases]} ${actionText}?`;
  }

  private categorizeActivity(action: string): 'productivity' | 'wellness' | 'social' | 'learning' | 'entertainment' {
    const categories: Record<string, string> = {
      'work': 'productivity',
      'study': 'learning',
      'exercise': 'wellness',
      'meditation': 'wellness',
      'social': 'social',
      'reading': 'learning',
      'music': 'entertainment',
      'movie': 'entertainment',
      'game': 'entertainment'
    };

    return (categories[action] as any) || 'wellness';
  }

  private getExpectedBenefit(action: string, context: any): string {
    const benefits: Record<string, string> = {
      'exercise': 'Improve physical health and boost endorphins',
      'meditation': 'Reduce stress and improve mental clarity',
      'reading': 'Expand knowledge and stimulate imagination',
      'social': 'Strengthen relationships and reduce isolation',
      'learning': 'Develop new skills and boost confidence',
      'work': 'Achieve goals and feel accomplished',
      'relaxation': 'Restore energy and improve well-being',
      'morning_routine': 'Set a positive tone for the day',
      'breathing_exercise': 'Calm the mind and reduce anxiety',
      'walking_break': 'Improve circulation and mental focus',
      'drink_water': 'Maintain hydration and physical health'
    };

    return benefits[action] || 'Enhance your overall well-being';
  }

  private updateUserPreferences(suggestion: PredictiveSuggestion, accepted: boolean, rating?: number): void {
    if (accepted) {
      if (!this.userPreferences.favoriteActivities.includes(suggestion.action)) {
        this.userPreferences.favoriteActivities.push(suggestion.action);
      }
    } else {
      if (!this.userPreferences.avoidedActivities.includes(suggestion.action)) {
        this.userPreferences.avoidedActivities.push(suggestion.action);
      }
    }

    // Update preferred times based on successful suggestions
    if (accepted && rating && rating >= 4) {
      const hour = new Date().getHours();
      if (!this.userPreferences.preferredTimes[suggestion.category]) {
        this.userPreferences.preferredTimes[suggestion.category] = [];
      }
      if (!this.userPreferences.preferredTimes[suggestion.category].includes(hour)) {
        this.userPreferences.preferredTimes[suggestion.category].push(hour);
      }
    }
  }

  private getTopActivities(): string[] {
    const activityCounts: Record<string, number> = {};

    this.behaviorHistory.forEach(behavior => {
      activityCounts[behavior.action] = (activityCounts[behavior.action] || 0) + 1;
    });

    return Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);
  }

  private getPeakProductivityHours(): number[] {
    const hourCounts: Record<number, number> = {};

    this.behaviorHistory.forEach(behavior => {
      if (behavior.success) {
        hourCounts[behavior.timeOfDay] = (hourCounts[behavior.timeOfDay] || 0) + 1;
      }
    });

    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private getPreferredDays(): number[] {
    const dayCounts: Record<number, number> = {};

    this.behaviorHistory.forEach(behavior => {
      dayCounts[behavior.dayOfWeek] = (dayCounts[behavior.dayOfWeek] || 0) + 1;
    });

    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day));
  }

  private analyzeEnergyPatterns(): Record<number, string> {
    const hourEnergy: Record<number, {high: number, medium: number, low: number}> = {};

    // Initialize
    for (let hour = 0; hour < 24; hour++) {
      hourEnergy[hour] = {high: 0, medium: 0, low: 0};
    }

    // Analyze patterns
    this.behaviorHistory.forEach(behavior => {
      if (behavior.success !== undefined) {
        const energy = behavior.success ? 'high' : 'low';
        hourEnergy[behavior.timeOfDay][energy]++;
      }
    });

    // Determine dominant energy level per hour
    const result: Record<number, string> = {};
    Object.entries(hourEnergy).forEach(([hour, energies]) => {
      const total = energies.high + energies.medium + energies.low;
      if (total === 0) {
        result[parseInt(hour)] = 'medium';
      } else {
        const highRatio = energies.high / total;
        if (highRatio > 0.6) result[parseInt(hour)] = 'high';
        else if (highRatio < 0.3) result[parseInt(hour)] = 'low';
        else result[parseInt(hour)] = 'medium';
      }
    });

    return result;
  }

  private identifyTrends(): string[] {
    const trends: string[] = [];
    const recent = this.behaviorHistory.slice(-50);
    const older = this.behaviorHistory.slice(-100, -50);

    if (recent.length === 0 || older.length === 0) return trends;

    // Analyze activity frequency trends
    const recentActivities = recent.reduce((acc, behavior) => {
      acc[behavior.action] = (acc[behavior.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const olderActivities = older.reduce((acc, behavior) => {
      acc[behavior.action] = (acc[behavior.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.keys(recentActivities).forEach(activity => {
      const recentCount = recentActivities[activity] || 0;
      const olderCount = olderActivities[activity] || 0;

      if (recentCount > olderCount * 1.5) {
        trends.push(`Increasing engagement with ${activity}`);
      } else if (recentCount < olderCount * 0.7) {
        trends.push(`Decreasing engagement with ${activity}`);
      }
    });

    // Analyze success rate trends
    const recentSuccessRate = recent.filter(b => b.success).length / recent.length;
    const olderSuccessRate = older.filter(b => b.success).length / older.length;

    if (recentSuccessRate > olderSuccessRate + 0.1) {
      trends.push('Improving success rate in activities');
    } else if (recentSuccessRate < olderSuccessRate - 0.1) {
      trends.push('Declining success rate in activities');
    }

    return trends;
  }
}

// Export singleton instance
export const predictiveSuggestionsEngine = new PredictiveSuggestionsEngine();
