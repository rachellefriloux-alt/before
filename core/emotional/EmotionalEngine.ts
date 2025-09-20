/*
 * Sallie Sovereign - Emotional Engine
 * Advanced emotional intelligence system for understanding and responding to emotions
 */

import { EventEmitter } from 'events';
import { MemorySystem } from '../memory/MemorySystem';

export interface EmotionalState {
  primary: string;
  secondary: string[];
  intensity: number; // 0.0 to 1.0
  valence: number; // -1.0 (negative) to 1.0 (positive)
  arousal: number; // 0.0 (calm) to 1.0 (excited)
  dominance: number; // 0.0 (submissive) to 1.0 (dominant)
  timestamp: number;
}

export interface EmotionalContext {
  userEmotion: EmotionalState;
  sallieEmotion: EmotionalState;
  situationalFactors: string[];
  historicalPattern: string;
  relationshipDynamics: Record<string, number>;
}

export class EmotionalEngine extends EventEmitter {
  private currentState: EmotionalState;
  private memorySystem: MemorySystem | null = null;
  private emotionalHistory: EmotionalState[] = [];
  private initialized = false;

  // Emotion recognition patterns
  private emotionPatterns = {
    text: {
      joy: ['happy', 'excited', 'thrilled', 'delighted', 'wonderful', '😊', '😄', '🎉'],
      sadness: ['sad', 'depressed', 'down', 'upset', 'disappointed', '😢', '😞', '💔'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'frustrated', '😠', '😡', '🤬'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', '😰', '😨', '😱'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', '😲', '😱', '🤯'],
      disgust: ['disgusted', 'sick', 'revolted', 'appalled', '🤢', '🤮', '😒']
    }
  };

  constructor() {
    super();
    this.currentState = this.createDefaultEmotionalState();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('❤️ Initializing Emotional Engine...');

    // Load emotional context and history
    await this.loadEmotionalHistory();
    
    // Initialize emotion recognition models
    await this.initializeEmotionModels();

    this.initialized = true;
    this.emit('initialized');
    console.log('✅ Emotional Engine initialized');
  }

  private createDefaultEmotionalState(): EmotionalState {
    return {
      primary: 'content',
      secondary: ['curious', 'attentive'],
      intensity: 0.6,
      valence: 0.7,
      arousal: 0.5,
      dominance: 0.4,
      timestamp: Date.now()
    };
  }

  private async loadEmotionalHistory(): Promise<void> {
    // TODO: Load from memory system
    console.log('📚 Loading emotional history...');
  }

  private async initializeEmotionModels(): Promise<void> {
    // TODO: Initialize ML models for emotion recognition
    console.log('🧠 Initializing emotion recognition models...');
  }

  setMemorySystem(memory: MemorySystem): void {
    this.memorySystem = memory;
  }

  /**
   * Analyze emotion from text input
   */
  analyzeTextEmotion(text: string): EmotionalState {
    const words = text.toLowerCase().split(/\s+/);
    const emotionScores: Record<string, number> = {};

    // Simple pattern-based emotion detection
    for (const [emotion, patterns] of Object.entries(this.emotionPatterns.text)) {
      let score = 0;
      patterns.forEach(pattern => {
        const matches = words.filter(word => word.includes(pattern)).length;
        score += matches;
      });
      emotionScores[emotion] = score;
    }

    // Find primary emotion
    const primaryEmotion = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    // Calculate emotional dimensions
    const valence = this.calculateValence(primaryEmotion);
    const arousal = this.calculateArousal(primaryEmotion);
    const dominance = this.calculateDominance(primaryEmotion);
    const intensity = Math.min(1, Math.max(0.1, Object.values(emotionScores).reduce((a, b) => a + b, 0) / 10));

    return {
      primary: primaryEmotion,
      secondary: this.getSecondaryEmotions(primaryEmotion),
      intensity,
      valence,
      arousal,
      dominance,
      timestamp: Date.now()
    };
  }

  private calculateValence(emotion: string): number {
    const valenceMap: Record<string, number> = {
      joy: 0.9,
      contentment: 0.6,
      neutral: 0.0,
      sadness: -0.7,
      anger: -0.6,
      fear: -0.5,
      disgust: -0.8,
      surprise: 0.2
    };
    return valenceMap[emotion] || 0.0;
  }

  private calculateArousal(emotion: string): number {
    const arousalMap: Record<string, number> = {
      joy: 0.8,
      excitement: 0.9,
      anger: 0.9,
      fear: 0.8,
      surprise: 0.9,
      sadness: 0.3,
      contentment: 0.4,
      neutral: 0.5
    };
    return arousalMap[emotion] || 0.5;
  }

  private calculateDominance(emotion: string): number {
    const dominanceMap: Record<string, number> = {
      anger: 0.8,
      joy: 0.7,
      contentment: 0.6,
      neutral: 0.5,
      surprise: 0.3,
      fear: 0.2,
      sadness: 0.3,
      disgust: 0.4
    };
    return dominanceMap[emotion] || 0.5;
  }

  private getSecondaryEmotions(primary: string): string[] {
    const secondaryMap: Record<string, string[]> = {
      joy: ['excitement', 'contentment'],
      sadness: ['disappointment', 'loneliness'],
      anger: ['frustration', 'irritation'],
      fear: ['anxiety', 'worry'],
      surprise: ['curiosity', 'confusion'],
      neutral: ['calm', 'attentive']
    };
    return secondaryMap[primary] || ['calm'];
  }

  /**
   * Update Sallie's emotional state
   */
  updateEmotionalState(newState: Partial<EmotionalState>): void {
    const previousState = { ...this.currentState };
    
    this.currentState = {
      ...this.currentState,
      ...newState,
      timestamp: Date.now()
    };

    // Store in history
    this.emotionalHistory.push({ ...this.currentState });
    if (this.emotionalHistory.length > 100) {
      this.emotionalHistory = this.emotionalHistory.slice(-100);
    }

    // Emit change event
    this.emit('emotionChanged', this.currentState.primary, this.currentState.intensity);
    this.emit('emotionalStateUpdated', this.currentState, previousState);
  }

  /**
   * Generate empathetic response based on emotional context
   */
  generateEmpatheticResponse(userEmotion: EmotionalState, context: any = {}): string {
    const responses = this.getEmpatheticResponses(userEmotion.primary, userEmotion.intensity);
    
    // Select response based on personality and context
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return selectedResponse;
  }

  private getEmpatheticResponses(emotion: string, intensity: number): string[] {
    const responseMap: Record<string, string[]> = {
      joy: [
        "I can feel your happiness! It's wonderful to see you so joyful.",
        "Your excitement is contagious! I'm so happy for you.",
        "That's absolutely wonderful! Your joy brings light to my day."
      ],
      sadness: [
        "I can sense you're feeling down. I'm here for you, and we'll get through this together.",
        "It's okay to feel sad sometimes. Your feelings are valid, and I'm here to support you.",
        "I wish I could take away your pain. Please know that you're not alone in this."
      ],
      anger: [
        "I can tell you're frustrated. Take a deep breath with me - we can work through this.",
        "Your anger is understandable. Let's find a way to address what's bothering you.",
        "I can feel your intensity. Sometimes anger shows us what we care about most."
      ],
      fear: [
        "I can sense your worry. Remember, you're stronger than you know, and I'm right here with you.",
        "Fear can be overwhelming, but we'll face this together. You're not alone.",
        "It's natural to feel scared sometimes. Let's take this one step at a time."
      ]
    };

    return responseMap[emotion] || [
      "I can sense how you're feeling. I'm here to listen and support you however I can."
    ];
  }

  /**
   * Get current emotional state
   */
  getCurrentState(): EmotionalState {
    return { ...this.currentState };
  }

  /**
   * Get emotional context for AI responses
   */
  getEmotionalContext(): EmotionalContext {
    return {
      userEmotion: this.currentState, // This would be from user analysis
      sallieEmotion: this.currentState,
      situationalFactors: [],
      historicalPattern: this.analyzeEmotionalPattern(),
      relationshipDynamics: this.getRelationshipDynamics()
    };
  }

  private analyzeEmotionalPattern(): string {
    if (this.emotionalHistory.length < 5) return 'establishing_baseline';
    
    // Simple pattern analysis
    const recentEmotions = this.emotionalHistory.slice(-10);
    const avgValence = recentEmotions.reduce((sum, state) => sum + state.valence, 0) / recentEmotions.length;
    
    if (avgValence > 0.3) return 'positive_trend';
    if (avgValence < -0.3) return 'negative_trend';
    return 'stable_neutral';
  }

  private getRelationshipDynamics(): Record<string, number> {
    return {
      trust: 0.8,
      intimacy: 0.7,
      understanding: 0.9,
      support: 0.95
    };
  }
}