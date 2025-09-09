/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Machine Learning Personalization System                           │
 * │                                                                              │
 * │   Advanced ML algorithms for personalized content and recommendations        │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Machine Learning Personalization System for Sallie
// Uses advanced algorithms to learn user preferences and adapt recommendations

import { UserBehavior } from './PredictiveSuggestionsEngine';
import { EmotionProfile } from './EmotionRecognitionSystem';

export interface UserProfile {
  userId: string;
  preferences: Record<string, number>; // preference scores 0-1
  behaviorPatterns: Record<string, number[]>;
  emotionalPatterns: Record<string, number[]>;
  contextPreferences: Record<string, Record<string, number>>;
  learningRate: number;
  lastUpdated: Date;
}

export interface ContentItem {
  id: string;
  type: 'article' | 'video' | 'audio' | 'activity' | 'recommendation';
  category: string;
  tags: string[];
  difficulty: number; // 0-1
  engagement: number; // 0-1
  emotionalValence: 'positive' | 'negative' | 'neutral';
  targetAudience: string[];
  metadata: Record<string, any>;
}

export interface PersonalizationResult {
  recommendedContent: ContentItem[];
  personalizedSettings: Record<string, any>;
  adaptiveFeatures: string[];
  confidence: number;
  reasoning: string[];
}

export interface MLModel {
  weights: Record<string, number>;
  bias: number;
  features: string[];
  accuracy: number;
  lastTrained: Date;
}

/**
 * Machine Learning Personalization Engine
 */
export class MLPersonalizationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private contentDatabase: ContentItem[] = [];
  private models: Map<string, MLModel> = new Map();
  private featureVectors: Map<string, number[]> = new Map();

  constructor() {
    this.initializeBaseModels();
    this.loadContentDatabase();
  }

  /**
   * Initialize base machine learning models
   */
  private initializeBaseModels(): void {
    // Initialize base recommendation model
    const baseRecommendationModel: MLModel = {
      weights: {
        'timeOfDay': 0.1,
        'emotionalState': 0.3,
        'context': 0.2,
        'activity': 0.4
      },
      bias: 0.0,
      features: ['timeOfDay', 'emotionalState', 'context', 'activity'],
      accuracy: 0.5,
      lastTrained: new Date()
    };

    // Initialize base personalization model
    const basePersonalizationModel: MLModel = {
      weights: {
        'userPreference': 0.4,
        'behaviorPattern': 0.3,
        'emotionalPattern': 0.2,
        'contextRelevance': 0.1
      },
      bias: 0.0,
      features: ['userPreference', 'behaviorPattern', 'emotionalPattern', 'contextRelevance'],
      accuracy: 0.5,
      lastTrained: new Date()
    };

    // Store base models
    this.models.set('base_recommendation', baseRecommendationModel);
    this.models.set('base_personalization', basePersonalizationModel);
  }

  /**
   * Update user profile with new behavior data
   */
  public updateUserProfile(userId: string, behavior: UserBehavior, emotion?: EmotionProfile): void {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createNewUserProfile(userId);
      this.userProfiles.set(userId, profile);
    }

    // Update preferences based on behavior
    this.updatePreferencesFromBehavior(profile, behavior);

    // Update emotional patterns
    if (emotion) {
      this.updateEmotionalPatterns(profile, emotion);
    }

    // Update context preferences
    this.updateContextPreferences(profile, behavior);

    profile.lastUpdated = new Date();

    // Retrain models with new data
    this.retrainModels(userId);
  }

  /**
   * Generate personalized recommendations
   */
  public generatePersonalizedContent(
    userId: string,
    context: {
      timeOfDay: number;
      dayOfWeek: number;
      location?: string;
      emotionalState?: string;
      currentActivity?: string;
    }
  ): PersonalizationResult {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return this.generateDefaultRecommendations(context);
    }

    // Extract features for prediction
    const features = this.extractFeatures(profile, context);

    // Generate content recommendations
    const recommendedContent = this.recommendContent(features, profile);

    // Generate personalized settings
    const personalizedSettings = this.generatePersonalizedSettings(profile, context);

    // Determine adaptive features
    const adaptiveFeatures = this.determineAdaptiveFeatures(profile, context);

    // Calculate overall confidence
    const confidence = this.calculateRecommendationConfidence(features, profile);

    // Generate reasoning
    const reasoning = this.generateRecommendationReasoning(profile, context, features);

    return {
      recommendedContent,
      personalizedSettings,
      adaptiveFeatures,
      confidence,
      reasoning
    };
  }

  /**
   * Learn from user feedback
   */
  public learnFromFeedback(
    userId: string,
    contentId: string,
    feedback: {
      liked: boolean;
      engagement: number; // 0-1
      completion: number; // 0-1
      emotionalResponse?: string;
    }
  ): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    const content = this.contentDatabase.find(c => c.id === contentId);
    if (!content) return;

    // Update preference weights based on feedback
    this.updatePreferenceWeights(profile, content, feedback);

    // Update feature vectors
    this.updateFeatureVectors(userId, content, feedback);

    // Adjust learning rate based on feedback consistency
    this.adjustLearningRate(profile, feedback);

    profile.lastUpdated = new Date();
  }

  /**
   * Get user insights and analytics
   */
  public getUserInsights(userId: string): {
    topPreferences: string[];
    learningProgress: Record<string, number>;
    emotionalTrends: string[];
    recommendedImprovements: string[];
    personalizationStrength: number;
  } {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return {
        topPreferences: [],
        learningProgress: {},
        emotionalTrends: [],
        recommendedImprovements: [],
        personalizationStrength: 0
      };
    }

    const topPreferences = this.getTopPreferences(profile);
    const learningProgress = this.calculateLearningProgress(profile);
    const emotionalTrends = this.analyzeEmotionalTrends(profile);
    const recommendedImprovements = this.generateImprovementSuggestions(profile);
    const personalizationStrength = this.calculatePersonalizationStrength(profile);

    return {
      topPreferences,
      learningProgress,
      emotionalTrends,
      recommendedImprovements,
      personalizationStrength
    };
  }

  private createNewUserProfile(userId: string): UserProfile {
    return {
      userId,
      preferences: {},
      behaviorPatterns: {},
      emotionalPatterns: {},
      contextPreferences: {},
      learningRate: 0.1,
      lastUpdated: new Date()
    };
  }

  private updatePreferencesFromBehavior(profile: UserProfile, behavior: UserBehavior): void {
    const activity = behavior.action;
    const success = behavior.success ? 1 : 0;

    // Initialize preference if not exists
    if (!(activity in profile.preferences)) {
      profile.preferences[activity] = 0.5;
    }

    // Update preference using reinforcement learning
    const currentPreference = profile.preferences[activity];
    const reward = success;
    const newPreference = currentPreference + profile.learningRate * (reward - currentPreference);

    profile.preferences[activity] = Math.max(0, Math.min(1, newPreference));
  }

  private updateEmotionalPatterns(profile: UserProfile, emotion: EmotionProfile): void {
    const emotionKey = emotion.primaryEmotion;

    if (!profile.emotionalPatterns[emotionKey]) {
      profile.emotionalPatterns[emotionKey] = [];
    }

    // Keep last 10 emotional states for this emotion
    profile.emotionalPatterns[emotionKey].push(emotion.intensity);
    if (profile.emotionalPatterns[emotionKey].length > 10) {
      profile.emotionalPatterns[emotionKey].shift();
    }
  }

  private updateContextPreferences(profile: UserProfile, behavior: UserBehavior): void {
    const context = behavior.context || 'general';
    const activity = behavior.action;

    if (!profile.contextPreferences[context]) {
      profile.contextPreferences[context] = {};
    }

    if (!(activity in profile.contextPreferences[context])) {
      profile.contextPreferences[context][activity] = 0.5;
    }

    // Update context-specific preference
    const current = profile.contextPreferences[context][activity];
    const success = behavior.success ? 1 : 0;
    profile.contextPreferences[context][activity] = current + profile.learningRate * (success - current);
  }

  private retrainModels(userId: string): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Simple online learning - update model weights
    const modelKey = `user_${userId}`;
    let model = this.models.get(modelKey);

    if (!model) {
      model = {
        weights: {},
        bias: 0,
        features: ['timeOfDay', 'emotionalState', 'context', 'activity'],
        accuracy: 0.5,
        lastTrained: new Date()
      };
      this.models.set(modelKey, model);
    }

    // Update weights based on recent behavior
    Object.entries(profile.preferences).forEach(([activity, preference]) => {
      model.weights[activity] = (model.weights[activity] || 0) + profile.learningRate * (preference - 0.5);
    });

    model.lastTrained = new Date();
  }

  private extractFeatures(
    profile: UserProfile,
    context: {
      timeOfDay: number;
      dayOfWeek: number;
      location?: string;
      emotionalState?: string;
      currentActivity?: string;
    }
  ): Record<string, number> {
    const features: Record<string, number> = {
      timeOfDay: context.timeOfDay / 24, // Normalize to 0-1
      dayOfWeek: context.dayOfWeek / 7, // Normalize to 0-1
      emotionalValence: this.getEmotionalValenceScore(context.emotionalState),
      contextFamiliarity: this.calculateContextFamiliarity(profile, context),
      activityDiversity: this.calculateActivityDiversity(profile)
    };

    // Add preference-based features
    Object.entries(profile.preferences).forEach(([activity, preference]) => {
      features[`pref_${activity}`] = preference;
    });

    return features;
  }

  private recommendContent(features: Record<string, number>, profile: UserProfile): ContentItem[] {
    const scoredContent = this.contentDatabase.map(content => {
      const score = this.scoreContentForUser(content, features, profile);
      return { content, score };
    });

    return scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.content);
  }

  private scoreContentForUser(
    content: ContentItem,
    features: Record<string, number>,
    profile: UserProfile
  ): number {
    let score = 0;

    // Category preference
    const categoryPref = profile.preferences[content.category] || 0.5;
    score += categoryPref * 0.3;

    // Tag matching
    const tagMatches = content.tags.filter(tag =>
      Object.keys(profile.preferences).some(pref => pref.includes(tag))
    ).length;
    score += (tagMatches / content.tags.length) * 0.2;

    // Difficulty matching (prefer challenging but not overwhelming)
    const userSkillLevel = this.estimateUserSkillLevel(profile, content.category);
    const difficultyMatch = 1 - Math.abs(content.difficulty - userSkillLevel);
    score += difficultyMatch * 0.2;

    // Emotional matching
    const emotionalMatch = this.calculateEmotionalMatch(content, features);
    score += emotionalMatch * 0.2;

    // Engagement prediction
    const engagementScore = this.predictEngagement(content, profile);
    score += engagementScore * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private generatePersonalizedSettings(
    profile: UserProfile,
    context: any
  ): Record<string, any> {
    const settings: Record<string, any> = {};

    // Adaptive UI preferences
    settings.theme = this.determinePreferredTheme(profile);
    settings.layout = this.determinePreferredLayout(profile);
    settings.notificationFrequency = this.determineNotificationFrequency(profile);

    // Content preferences
    settings.contentDifficulty = this.estimatePreferredDifficulty(profile);
    settings.contentLength = this.estimatePreferredLength(profile);

    // Interaction preferences
    settings.responseStyle = this.determineResponseStyle(profile);
    settings.initiativeLevel = this.determineInitiativeLevel(profile);

    return settings;
  }

  private determineAdaptiveFeatures(profile: UserProfile, context: any): string[] {
    const features: string[] = [];

    // Check learning progress
    const learningProgress = this.calculateLearningProgress(profile);
    const avgProgress = Object.values(learningProgress).reduce((a, b) => a + b, 0) /
                       Object.values(learningProgress).length;

    if (avgProgress > 0.7) {
      features.push('advanced_features');
    }

    // Check emotional stability
    const emotionalStability = this.calculateEmotionalStability(profile);
    if (emotionalStability < 0.4) {
      features.push('emotional_support');
    }

    // Check engagement patterns
    const engagementLevel = this.calculateEngagementLevel(profile);
    if (engagementLevel > 0.8) {
      features.push('gamification');
    }

    // Context-based features
    if (context.timeOfDay < 6 || context.timeOfDay > 22) {
      features.push('night_mode');
    }

    return features;
  }

  private calculateRecommendationConfidence(
    features: Record<string, number>,
    profile: UserProfile
  ): number {
    // Base confidence from profile completeness
    let confidence = 0.5;

    // More data = higher confidence
    const preferenceCount = Object.keys(profile.preferences).length;
    confidence += Math.min(0.2, preferenceCount / 20 * 0.2);

    // Recent updates = higher confidence
    const daysSinceUpdate = (Date.now() - profile.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    confidence += Math.max(0, 0.1 - daysSinceUpdate * 0.01);

    // Consistent patterns = higher confidence
    const patternConsistency = this.calculatePatternConsistency(profile);
    confidence += patternConsistency * 0.2;

    return Math.max(0, Math.min(1, confidence));
  }

  private generateRecommendationReasoning(
    profile: UserProfile,
    context: any,
    features: Record<string, number>
  ): string[] {
    const reasoning: string[] = [];

    // Time-based reasoning
    if (context.timeOfDay < 12) {
      reasoning.push("Morning recommendations focus on energizing and productive content");
    } else if (context.timeOfDay < 18) {
      reasoning.push("Afternoon suggestions emphasize sustained focus and light activities");
    } else {
      reasoning.push("Evening recommendations prioritize relaxation and reflection");
    }

    // Preference-based reasoning
    const topPreferences = this.getTopPreferences(profile);
    if (topPreferences.length > 0) {
      reasoning.push(`Based on your preference for ${topPreferences[0]}`);
    }

    // Emotional reasoning
    if (context.emotionalState) {
      reasoning.push(`Selected content matches your current ${context.emotionalState} state`);
    }

    return reasoning;
  }

  private generateDefaultRecommendations(context: any): PersonalizationResult {
    // Return basic recommendations when no profile exists
    return {
      recommendedContent: this.contentDatabase.slice(0, 5),
      personalizedSettings: {
        theme: 'default',
        layout: 'standard',
        notificationFrequency: 'medium'
      },
      adaptiveFeatures: ['basic_mode'],
      confidence: 0.3,
      reasoning: ['Using default recommendations while learning your preferences']
    };
  }

  // Helper methods
  private getEmotionalValenceScore(emotionalState?: string): number {
    const valenceMap: Record<string, number> = {
      'joy': 0.9, 'happy': 0.8, 'excited': 0.8,
      'sad': 0.2, 'angry': 0.3, 'anxious': 0.4,
      'calm': 0.6, 'neutral': 0.5
    };
    return valenceMap[emotionalState || 'neutral'] || 0.5;
  }

  private calculateContextFamiliarity(profile: UserProfile, context: any): number {
    // Calculate how familiar the current context is to the user
    let familiarity = 0.5;

    if (context.location && profile.contextPreferences[context.location]) {
      familiarity += 0.2;
    }

    const timePreference = profile.preferences[`time_${context.timeOfDay}`] || 0.5;
    familiarity += (timePreference - 0.5) * 0.3;

    return Math.max(0, Math.min(1, familiarity));
  }

  private calculateActivityDiversity(profile: UserProfile): number {
    const activities = Object.keys(profile.preferences);
    const categories = new Set(activities.map(a => this.categorizeActivity(a)));
    return categories.size / 5; // Assuming 5 main categories
  }

  private categorizeActivity(activity: string): string {
    const categories: Record<string, string> = {
      'work': 'productivity',
      'exercise': 'health',
      'reading': 'learning',
      'social': 'social',
      'entertainment': 'leisure'
    };
    return categories[activity] || 'other';
  }

  private estimateUserSkillLevel(profile: UserProfile, category: string): number {
    const categoryActivities = Object.keys(profile.preferences)
      .filter(activity => this.categorizeActivity(activity) === category);

    if (categoryActivities.length === 0) return 0.5;

    const avgPreference = categoryActivities
      .reduce((sum, activity) => sum + profile.preferences[activity], 0) /
      categoryActivities.length;

    return avgPreference;
  }

  private calculateEmotionalMatch(content: ContentItem, features: Record<string, number>): number {
    const contentValence = content.emotionalValence === 'positive' ? 0.8 :
                          content.emotionalValence === 'negative' ? 0.2 : 0.5;
    const userValence = features.emotionalValence;

    return 1 - Math.abs(contentValence - userValence);
  }

  private predictEngagement(content: ContentItem, profile: UserProfile): number {
    // Simple engagement prediction based on past preferences
    const categoryEngagement = profile.preferences[content.category] || 0.5;
    const tagRelevance = content.tags.some(tag =>
      Object.keys(profile.preferences).some(pref => pref.includes(tag))
    ) ? 0.7 : 0.3;

    return (categoryEngagement + tagRelevance) / 2;
  }

  private determinePreferredTheme(profile: UserProfile): string {
    // Determine theme preference based on usage patterns
    const creativeActivities = ['art', 'music', 'writing'];
    const creativeScore = creativeActivities
      .reduce((sum, activity) => sum + (profile.preferences[activity] || 0), 0) /
      creativeActivities.length;

    return creativeScore > 0.6 ? 'vibrant' : 'minimal';
  }

  private determinePreferredLayout(profile: UserProfile): string {
    const detailedActivities = ['reading', 'study', 'analysis'];
    const detailedScore = detailedActivities
      .reduce((sum, activity) => sum + (profile.preferences[activity] || 0), 0) /
      detailedActivities.length;

    return detailedScore > 0.6 ? 'detailed' : 'streamlined';
  }

  private determineNotificationFrequency(profile: UserProfile): string {
    const avgPreference = Object.values(profile.preferences)
      .reduce((a, b) => a + b, 0) / Object.values(profile.preferences).length;

    if (avgPreference > 0.7) return 'frequent';
    if (avgPreference < 0.4) return 'minimal';
    return 'moderate';
  }

  private estimatePreferredDifficulty(profile: UserProfile): string {
    const avgSkill = Object.values(profile.preferences)
      .reduce((a, b) => a + b, 0) / Object.values(profile.preferences).length;

    if (avgSkill > 0.7) return 'advanced';
    if (avgSkill < 0.4) return 'beginner';
    return 'intermediate';
  }

  private estimatePreferredLength(profile: UserProfile): string {
    // Estimate based on attention patterns (this would need more sophisticated analysis)
    return 'medium';
  }

  private determineResponseStyle(profile: UserProfile): string {
    const analyticalActivities = ['analysis', 'planning', 'study'];
    const analyticalScore = analyticalActivities
      .reduce((sum, activity) => sum + (profile.preferences[activity] || 0), 0) /
      analyticalActivities.length;

    return analyticalScore > 0.6 ? 'analytical' : 'conversational';
  }

  private determineInitiativeLevel(profile: UserProfile): string {
    const proactiveActivities = ['planning', 'organization', 'goal_setting'];
    const proactiveScore = proactiveActivities
      .reduce((sum, activity) => sum + (profile.preferences[activity] || 0), 0) /
      proactiveActivities.length;

    return proactiveScore > 0.6 ? 'high' : 'moderate';
  }

  private calculateLearningProgress(profile: UserProfile): Record<string, number> {
    const progress: Record<string, number> = {};

    Object.entries(profile.preferences).forEach(([activity, preference]) => {
      // Simple progress calculation based on preference strength
      progress[activity] = preference;
    });

    return progress;
  }

  private calculateEmotionalStability(profile: UserProfile): number {
    let totalVariance = 0;
    let count = 0;

    Object.values(profile.emotionalPatterns).forEach(pattern => {
      if (pattern.length > 1) {
        const variance = this.calculateVariance(pattern);
        totalVariance += variance;
        count++;
      }
    });

    return count > 0 ? 1 - (totalVariance / count) : 0.5;
  }

  private calculateEngagementLevel(profile: UserProfile): number {
    const avgPreference = Object.values(profile.preferences)
      .reduce((a, b) => a + b, 0) / Object.values(profile.preferences).length;

    return avgPreference;
  }

  private calculatePatternConsistency(profile: UserProfile): number {
    // Calculate how consistent user preferences are over time
    let consistency = 0.5;

    const preferenceCount = Object.keys(profile.preferences).length;
    if (preferenceCount > 10) consistency += 0.2;

    const highPreferenceCount = Object.values(profile.preferences)
      .filter(pref => pref > 0.7).length;
    consistency += (highPreferenceCount / preferenceCount) * 0.3;

    return Math.min(1, consistency);
  }

  private getTopPreferences(profile: UserProfile): string[] {
    return Object.entries(profile.preferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);
  }

  private analyzeEmotionalTrends(profile: UserProfile): string[] {
    const trends: string[] = [];

    Object.entries(profile.emotionalPatterns).forEach(([emotion, intensities]) => {
      if (intensities.length >= 3) {
        const recent = intensities.slice(-3);
        const older = intensities.slice(0, -3);

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

        if (recentAvg > olderAvg + 0.1) {
          trends.push(`Increasing ${emotion} experiences`);
        } else if (recentAvg < olderAvg - 0.1) {
          trends.push(`Decreasing ${emotion} experiences`);
        }
      }
    });

    return trends;
  }

  private generateImprovementSuggestions(profile: UserProfile): string[] {
    const suggestions: string[] = [];

    const preferenceCount = Object.keys(profile.preferences).length;
    if (preferenceCount < 5) {
      suggestions.push('Try more diverse activities to help us learn your preferences');
    }

    const avgPreference = Object.values(profile.preferences)
      .reduce((a, b) => a + b, 0) / preferenceCount;
    if (avgPreference < 0.4) {
      suggestions.push('Consider exploring new activities that might interest you');
    }

    return suggestions;
  }

  private calculatePersonalizationStrength(profile: UserProfile): number {
    let strength = 0;

    // Data richness
    strength += Math.min(0.3, Object.keys(profile.preferences).length / 20 * 0.3);

    // Pattern strength
    const avgPreference = Object.values(profile.preferences)
      .reduce((a, b) => a + b, 0) / Object.keys(profile.preferences).length;
    strength += Math.min(0.3, avgPreference * 0.3);

    // Recency
    const daysSinceUpdate = (Date.now() - profile.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    strength += Math.max(0, 0.4 - daysSinceUpdate * 0.1);

    return Math.min(1, strength);
  }

  private updatePreferenceWeights(
    profile: UserProfile,
    content: ContentItem,
    feedback: any
  ): void {
    const learningRate = profile.learningRate;

    // Update category preference
    const categoryKey = content.category;
    const currentCategoryPref = profile.preferences[categoryKey] || 0.5;
    const categoryReward = feedback.liked ? 0.2 : -0.1;
    profile.preferences[categoryKey] = Math.max(0, Math.min(1,
      currentCategoryPref + learningRate * categoryReward
    ));

    // Update tag preferences
    content.tags.forEach(tag => {
      const tagKey = `tag_${tag}`;
      const currentTagPref = profile.preferences[tagKey] || 0.5;
      const tagReward = (feedback.engagement + feedback.completion) / 2;
      profile.preferences[tagKey] = Math.max(0, Math.min(1,
        currentTagPref + learningRate * (tagReward - 0.5)
      ));
    });
  }

  private updateFeatureVectors(userId: string, content: ContentItem, feedback: any): void {
    const vectorKey = `${userId}_${content.id}`;
    const currentVector = this.featureVectors.get(vectorKey) || [0, 0, 0, 0, 0];

    // Update vector based on feedback
    const engagement = feedback.engagement;
    const completion = feedback.completion;
    const liked = feedback.liked ? 1 : 0;

    const newVector = [
      currentVector[0] + engagement * 0.1,
      currentVector[1] + completion * 0.1,
      currentVector[2] + liked * 0.1,
      currentVector[3] + (engagement + completion) / 2 * 0.1,
      currentVector[4] + (Date.now() - content.metadata.timestamp) / (1000 * 60 * 60 * 24) * 0.01
    ];

    this.featureVectors.set(vectorKey, newVector);
  }

  private adjustLearningRate(profile: UserProfile, feedback: any): void {
    // Adjust learning rate based on feedback consistency
    const recentFeedback = [feedback]; // In practice, track multiple feedback instances
    const consistency = recentFeedback.filter(f => f.liked).length / recentFeedback.length;

    if (consistency > 0.8) {
      profile.learningRate = Math.min(0.3, profile.learningRate + 0.01);
    } else if (consistency < 0.3) {
      profile.learningRate = Math.max(0.01, profile.learningRate - 0.01);
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private loadContentDatabase(): void {
    // Initialize with sample content - in practice, this would load from a database
    this.contentDatabase = [
      {
        id: 'article_001',
        type: 'article',
        category: 'wellness',
        tags: ['meditation', 'mindfulness', 'stress'],
        difficulty: 0.3,
        engagement: 0.7,
        emotionalValence: 'positive',
        targetAudience: ['stressed', 'busy'],
        metadata: { timestamp: Date.now() }
      },
      {
        id: 'video_001',
        type: 'video',
        category: 'learning',
        tags: ['productivity', 'time_management', 'goals'],
        difficulty: 0.5,
        engagement: 0.8,
        emotionalValence: 'neutral',
        targetAudience: ['professionals', 'students'],
        metadata: { timestamp: Date.now() }
      },
      {
        id: 'activity_001',
        type: 'activity',
        category: 'social',
        tags: ['connection', 'relationships', 'communication'],
        difficulty: 0.4,
        engagement: 0.6,
        emotionalValence: 'positive',
        targetAudience: ['introverted', 'social'],
        metadata: { timestamp: Date.now() }
      }
    ];
  }
}

// Export singleton instance
export const mlPersonalizationEngine = new MLPersonalizationEngine();
