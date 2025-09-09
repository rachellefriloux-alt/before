/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Advanced Emotion Recognition System                               │
 * │                                                                              │
 * │   Provides sophisticated emotion detection and adaptive responses           │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Advanced Emotion Recognition System for Sallie
// Provides multi-layered emotion analysis and adaptive response generation

import { ConversationContext } from './nlpEngine';

export interface EmotionProfile {
  primaryEmotion: string;
  intensity: number;
  secondaryEmotions: string[];
  emotionalLayers: EmotionalLayer[];
  triggers: string[];
  context: string;
  confidence: number;
  timestamp: Date;
}

export interface EmotionalLayer {
  emotion: string;
  intensity: number;
  layer: 'surface' | 'underlying' | 'contextual' | 'historical';
  triggers: string[];
  duration: number; // in milliseconds
}

export interface AdaptiveResponse {
  responseType: 'empathetic' | 'supportive' | 'encouraging' | 'practical' | 'humorous' | 'reflective';
  emotionalTone: string;
  pacing: 'slow' | 'moderate' | 'fast';
  contentStrategy: string;
  followUpSuggestions: string[];
}

export interface EmotionalPattern {
  pattern: string;
  frequency: number;
  triggers: string[];
  associatedEmotions: string[];
  copingStrategies: string[];
  lastOccurrence: Date;
}

/**
 * Advanced emotion recognition with pattern analysis
 */
export class EmotionRecognitionSystem {
  private emotionalPatterns: Map<string, EmotionalPattern> = new Map();
  private emotionHistory: EmotionProfile[] = [];
  private contextWindow: ConversationContext[] = [];

  constructor() {
    this.initializeBasePatterns();
  }

  /**
   * Analyze emotions from text with deep contextual understanding
   */
  public analyzeEmotion(text: string, context?: ConversationContext): EmotionProfile {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\W+/).filter(word => word.length > 1);

    // Multi-layered emotion detection
    const surfaceEmotions = this.detectSurfaceEmotions(words);
    const contextualEmotions = this.detectContextualEmotions(text, context);
    const patternBasedEmotions = this.detectPatternBasedEmotions(text);

    // Combine and weight emotions
    const combinedEmotions = this.combineEmotionalLayers(
      surfaceEmotions,
      contextualEmotions,
      patternBasedEmotions
    );

    // Determine primary emotion
    const primaryEmotion = this.determinePrimaryEmotion(combinedEmotions);

    // Calculate intensity and confidence
    const intensity = this.calculateEmotionalIntensity(combinedEmotions);
    const confidence = this.calculateConfidence(combinedEmotions, words.length);

    // Create emotional layers
    const emotionalLayers = this.createEmotionalLayers(combinedEmotions, context);

    // Extract triggers
    const triggers = this.extractEmotionalTriggers(text, combinedEmotions);

    const emotionProfile: EmotionProfile = {
      primaryEmotion,
      intensity,
      secondaryEmotions: this.getSecondaryEmotions(combinedEmotions, primaryEmotion),
      emotionalLayers,
      triggers,
      context: this.determineContext(text, context),
      confidence,
      timestamp: new Date()
    };

    // Store in history
    this.emotionHistory.push(emotionProfile);
    if (this.emotionHistory.length > 100) {
      this.emotionHistory.shift(); // Keep only last 100 entries
    }

    return emotionProfile;
  }

  /**
   * Generate adaptive response based on emotional analysis
   */
  public generateAdaptiveResponse(emotionProfile: EmotionProfile, context?: ConversationContext): AdaptiveResponse {
    const responseStrategy = this.determineResponseStrategy(emotionProfile, context);

    return {
      responseType: responseStrategy.type,
      emotionalTone: responseStrategy.tone,
      pacing: responseStrategy.pacing,
      contentStrategy: responseStrategy.content,
      followUpSuggestions: responseStrategy.followUps
    };
  }

  /**
   * Learn from user feedback and adjust emotion recognition
   */
  public learnFromFeedback(actualEmotion: string, predictedEmotion: string, text: string): void {
    // Update pattern weights based on feedback
    const pattern = this.findOrCreatePattern(text, actualEmotion);
    if (predictedEmotion !== actualEmotion) {
      pattern.frequency += 0.1; // Increase weight for misclassifications
    }
    pattern.lastOccurrence = new Date();
  }

  /**
   * Get emotional trends over time
   */
  public getEmotionalTrends(timeframe: number = 7 * 24 * 60 * 60 * 1000): {
    dominantEmotions: string[];
    emotionalStability: number;
    trend: 'improving' | 'declining' | 'stable';
    patterns: EmotionalPattern[];
  } {
    const recentEmotions = this.emotionHistory.filter(
      profile => Date.now() - profile.timestamp.getTime() < timeframe
    );

    if (recentEmotions.length === 0) {
      return {
        dominantEmotions: [],
        emotionalStability: 0.5,
        trend: 'stable',
        patterns: []
      };
    }

    // Calculate dominant emotions
    const emotionCounts = recentEmotions.reduce((acc, profile) => {
      acc[profile.primaryEmotion] = (acc[profile.primaryEmotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Calculate emotional stability
    const intensities = recentEmotions.map(profile => profile.intensity);
    const stability = 1 - (this.calculateVariance(intensities) / 0.25); // Normalize variance

    // Determine trend
    const recent = recentEmotions.slice(-10);
    const older = recentEmotions.slice(0, -10);

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((sum, p) => sum + p.intensity, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p.intensity, 0) / older.length;

      if (recentAvg > olderAvg + 0.1) trend = 'declining';
      else if (recentAvg < olderAvg - 0.1) trend = 'improving';
    }

    return {
      dominantEmotions,
      emotionalStability: Math.max(0, Math.min(1, stability)),
      trend,
      patterns: Array.from(this.emotionalPatterns.values())
    };
  }

  private initializeBasePatterns(): void {
    // Initialize with common emotional patterns
    const basePatterns = [
      {
        pattern: 'stress_work',
        triggers: ['deadline', 'overwhelmed', 'busy', 'pressure'],
        associatedEmotions: ['anxious', 'frustrated', 'exhausted'],
        copingStrategies: ['take_break', 'prioritize', 'delegate']
      },
      {
        pattern: 'social_anxiety',
        triggers: ['meeting', 'presentation', 'social', 'crowd'],
        associatedEmotions: ['nervous', 'self_conscious', 'worried'],
        copingStrategies: ['deep_breathing', 'positive_visualization', 'practice']
      },
      {
        pattern: 'achievement_joy',
        triggers: ['completed', 'finished', 'accomplished', 'success'],
        associatedEmotions: ['proud', 'happy', 'satisfied'],
        copingStrategies: ['celebrate', 'reflect', 'set_new_goals']
      }
    ];

    basePatterns.forEach(pattern => {
      this.emotionalPatterns.set(pattern.pattern, {
        ...pattern,
        frequency: 1,
        lastOccurrence: new Date()
      });
    });
  }

  private detectSurfaceEmotions(words: string[]): Record<string, number> {
    const emotionScores: Record<string, number> = {};

    const emotionWords = {
      joy: ['happy', 'excited', 'delighted', 'thrilled', 'ecstatic', 'joyful', 'cheerful'],
      sadness: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'heartbroken'],
      anger: ['angry', 'furious', 'irritated', 'frustrated', 'annoyed', 'rage', 'outraged'],
      fear: ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'nervous', 'panicked'],
      surprise: ['shocked', 'amazed', 'astonished', 'startled', 'unexpected'],
      disgust: ['disgusted', 'repulsed', 'grossed', 'sickened', 'revolted'],
      trust: ['confident', 'secure', 'reliable', 'faithful', 'loyal'],
      anticipation: ['excited', 'eager', 'expectant', 'hopeful', 'optimistic']
    };

    words.forEach(word => {
      Object.entries(emotionWords).forEach(([emotion, keywords]) => {
        if (keywords.includes(word)) {
          emotionScores[emotion] = (emotionScores[emotion] || 0) + 1;
        }
      });
    });

    return emotionScores;
  }

  private detectContextualEmotions(text: string, context?: ConversationContext): Record<string, number> {
    const contextualScores: Record<string, number> = {};

    if (!context) return contextualScores;

    // Check for emotional patterns in conversation history
    const recentEmotions = context.emotionalHistory?.slice(-5) || [];

    // Emotional momentum - emotions tend to persist
    recentEmotions.forEach(profile => {
      contextualScores[profile.primaryEmotion] = (contextualScores[profile.primaryEmotion] || 0) + 0.3;
    });

    // Topic-based emotional inference
    context.previousTopics?.forEach(topic => {
      switch (topic) {
        case 'work':
          if (text.toLowerCase().includes('tired')) {
            contextualScores['exhausted'] = (contextualScores['exhausted'] || 0) + 0.5;
          }
          break;
        case 'relationships':
          if (text.toLowerCase().includes('miss')) {
            contextualScores['lonely'] = (contextualScores['lonely'] || 0) + 0.4;
          }
          break;
      }
    });

    return contextualScores;
  }

  private detectPatternBasedEmotions(text: string): Record<string, number> {
    const patternScores: Record<string, number> = {};

    this.emotionalPatterns.forEach(pattern => {
      let matchScore = 0;
      pattern.triggers.forEach(trigger => {
        if (text.toLowerCase().includes(trigger)) {
          matchScore += pattern.frequency;
        }
      });

      if (matchScore > 0) {
        pattern.associatedEmotions.forEach(emotion => {
          patternScores[emotion] = (patternScores[emotion] || 0) + matchScore;
        });
      }
    });

    return patternScores;
  }

  private combineEmotionalLayers(
    surface: Record<string, number>,
    contextual: Record<string, number>,
    patterns: Record<string, number>
  ): Record<string, number> {
    const combined: Record<string, number> = {};

    // Weight the different layers
    const weights = { surface: 0.5, contextual: 0.3, patterns: 0.2 };

    [surface, contextual, patterns].forEach((layer, index) => {
      const weight = Object.values(weights)[index];
      Object.entries(layer).forEach(([emotion, score]) => {
        combined[emotion] = (combined[emotion] || 0) + (score * weight);
      });
    });

    return combined;
  }

  private determinePrimaryEmotion(emotions: Record<string, number>): string {
    const entries = Object.entries(emotions);
    if (entries.length === 0) return 'neutral';

    return entries.sort(([,a], [,b]) => b - a)[0][0];
  }

  private calculateEmotionalIntensity(emotions: Record<string, number>): number {
    const totalScore = Object.values(emotions).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = Object.keys(emotions).length * 2; // Assuming max score of 2 per emotion

    return Math.min(1, totalScore / maxPossibleScore);
  }

  private calculateConfidence(emotions: Record<string, number>, textLength: number): number {
    let confidence = 0.5;

    // More emotions detected = higher confidence
    confidence += Math.min(0.3, Object.keys(emotions).length * 0.1);

    // Longer text = higher confidence
    confidence += Math.min(0.2, textLength / 100 * 0.2);

    return Math.min(1, confidence);
  }

  private createEmotionalLayers(
    emotions: Record<string, number>,
    context?: ConversationContext
  ): EmotionalLayer[] {
    const layers: EmotionalLayer[] = [];

    // Surface layer
    const sortedEmotions = Object.entries(emotions).sort(([,a], [,b]) => b - a);
    if (sortedEmotions.length > 0) {
      layers.push({
        emotion: sortedEmotions[0][0],
        intensity: sortedEmotions[0][1],
        layer: 'surface',
        triggers: this.extractTriggersForEmotion(sortedEmotions[0][0]),
        duration: 30000 // 30 seconds typical duration
      });
    }

    // Underlying layer from context
    if (context?.emotionalHistory && context.emotionalHistory.length > 0) {
      const recent = context.emotionalHistory.slice(-3);
      const dominantUnderlying = recent.reduce((acc, curr) => {
        acc[curr.primaryEmotion] = (acc[curr.primaryEmotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const underlyingEmotion = Object.entries(dominantUnderlying)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      if (underlyingEmotion && underlyingEmotion !== layers[0]?.emotion) {
        layers.push({
          emotion: underlyingEmotion,
          intensity: 0.6,
          layer: 'underlying',
          triggers: [],
          duration: 300000 // 5 minutes
        });
      }
    }

    return layers;
  }

  private extractEmotionalTriggers(text: string, emotions: Record<string, number>): string[] {
    const triggers: string[] = [];
    const lowerText = text.toLowerCase();

    Object.keys(emotions).forEach(emotion => {
      const emotionTriggers = this.extractTriggersForEmotion(emotion);
      emotionTriggers.forEach(trigger => {
        if (lowerText.includes(trigger)) {
          triggers.push(trigger);
        }
      });
    });

    return [...new Set(triggers)];
  }

  private extractTriggersForEmotion(emotion: string): string[] {
    const triggerMap: Record<string, string[]> = {
      joy: ['happy', 'excited', 'great', 'wonderful', 'amazing'],
      sadness: ['sad', 'sorry', 'unfortunate', 'disappointed', 'down'],
      anger: ['angry', 'mad', 'frustrated', 'annoyed', 'upset'],
      fear: ['scared', 'worried', 'afraid', 'anxious', 'nervous'],
      surprise: ['wow', 'shocked', 'unexpected', 'surprised', 'amazed']
    };

    return triggerMap[emotion] || [];
  }

  private getSecondaryEmotions(emotions: Record<string, number>, primary: string): string[] {
    return Object.entries(emotions)
      .filter(([emotion]) => emotion !== primary)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);
  }

  private determineContext(text: string, context?: ConversationContext): string {
    if (context?.previousTopics.includes('work')) return 'work';
    if (context?.previousTopics.includes('relationships')) return 'personal';
    if (text.toLowerCase().includes('work') || text.toLowerCase().includes('job')) return 'work';
    if (text.toLowerCase().includes('friend') || text.toLowerCase().includes('family')) return 'personal';
    return 'general';
  }

  private determineResponseStrategy(
    emotionProfile: EmotionProfile,
    context?: ConversationContext
  ): {
    type: 'empathetic' | 'supportive' | 'encouraging' | 'practical' | 'humorous' | 'reflective';
    tone: string;
    pacing: 'slow' | 'moderate' | 'fast';
    content: string;
    followUps: string[];
  } {
    const { primaryEmotion, intensity } = emotionProfile;

    switch (primaryEmotion) {
      case 'sad':
      case 'depressed':
        return {
          type: 'empathetic',
          tone: 'gentle',
          pacing: 'slow',
          content: 'acknowledge_feelings',
          followUps: ['offer_support', 'suggest_self_care']
        };

      case 'angry':
      case 'frustrated':
        return {
          type: 'supportive',
          tone: 'calm',
          pacing: 'moderate',
          content: 'validate_feelings',
          followUps: ['help_problem_solve', 'suggest_breathing']
        };

      case 'anxious':
      case 'worried':
        return {
          type: 'supportive',
          tone: 'reassuring',
          pacing: 'slow',
          content: 'normalize_feelings',
          followUps: ['offer_grounding', 'suggest_coping']
        };

      case 'joy':
      case 'happy':
        return {
          type: 'encouraging',
          tone: 'enthusiastic',
          pacing: 'moderate',
          content: 'celebrate_positive',
          followUps: ['deepen_joy', 'suggest_sharing']
        };

      default:
        return {
          type: 'reflective',
          tone: 'neutral',
          pacing: 'moderate',
          content: 'acknowledge_input',
          followUps: ['ask_questions', 'offer_insight']
        };
    }
  }

  private findOrCreatePattern(text: string, emotion: string): EmotionalPattern {
    const patternKey = `${emotion}_${Date.now()}`;
    let pattern = this.emotionalPatterns.get(patternKey);

    if (!pattern) {
      pattern = {
        pattern: patternKey,
        frequency: 1,
        triggers: this.extractTriggersForEmotion(emotion),
        associatedEmotions: [emotion],
        copingStrategies: [],
        lastOccurrence: new Date()
      };
      this.emotionalPatterns.set(patternKey, pattern);
    }

    return pattern;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

// Export singleton instance
export const emotionRecognitionSystem = new EmotionRecognitionSystem();
