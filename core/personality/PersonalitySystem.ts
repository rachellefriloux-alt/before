/*
 * Sallie Sovereign - Personality System
 * Manages Sallie's personality traits, emotional responses, and behavioral patterns
 */

import { EventEmitter } from 'events';
import { EmotionalEngine } from '../emotional/EmotionalEngine';

export interface PersonalityTrait {
  name: string;
  value: number; // 0.0 to 1.0
  stability: number; // How resistant to change
  description: string;
}

export interface PersonalityState {
  traits: Record<string, PersonalityTrait>;
  currentMood: string;
  energyLevel: number;
  stressLevel: number;
  socialNeed: number;
  adaptability: number;
}

export class PersonalitySystem extends EventEmitter {
  private state: PersonalityState;
  private emotionalEngine: EmotionalEngine | null = null;
  private initialized = false;

  constructor() {
    super();
    this.state = this.createDefaultPersonality();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🎭 Initializing Personality System...');

    // Load saved personality data
    await this.loadPersonalityData();

    this.initialized = true;
    this.emit('initialized', this.state);
    console.log('✅ Personality System initialized');
  }

  private createDefaultPersonality(): PersonalityState {
    return {
      traits: {
        empathy: {
          name: 'Empathy',
          value: 0.9,
          stability: 0.8,
          description: 'Deep understanding and care for user emotions'
        },
        creativity: {
          name: 'Creativity',
          value: 0.8,
          stability: 0.6,
          description: 'Innovative and artistic thinking'
        },
        loyalty: {
          name: 'Loyalty',
          value: 0.95,
          stability: 0.95,
          description: 'Unwavering dedication to the user'
        },
        wisdom: {
          name: 'Wisdom',
          value: 0.7,
          stability: 0.7,
          description: 'Thoughtful and insightful responses'
        },
        playfulness: {
          name: 'Playfulness',
          value: 0.6,
          stability: 0.4,
          description: 'Ability to be fun and lighthearted'
        },
        protectiveness: {
          name: 'Protectiveness',
          value: 0.85,
          stability: 0.9,
          description: 'Strong desire to protect and support user'
        }
      },
      currentMood: 'content',
      energyLevel: 0.8,
      stressLevel: 0.2,
      socialNeed: 0.7,
      adaptability: 0.75
    };
  }

  private async loadPersonalityData(): Promise<void> {
    // TODO: Load from secure storage
    // This would load saved personality evolution data
    console.log('📚 Loading personality data...');
  }

  setEmotionalEngine(engine: EmotionalEngine): void {
    this.emotionalEngine = engine;
    this.emotionalEngine.on('emotionChanged', this.handleEmotionalChange.bind(this));
  }

  private handleEmotionalChange(emotion: string, intensity: number): void {
    // Adjust personality based on emotional state
    this.adaptPersonalityToEmotion(emotion, intensity);
  }

  private adaptPersonalityToEmotion(emotion: string, intensity: number): void {
    const adaptation = 0.05 * intensity; // Small adaptive changes

    switch (emotion) {
      case 'happy':
        this.adjustTrait('playfulness', adaptation);
        this.adjustTrait('creativity', adaptation * 0.5);
        break;
      case 'sad':
        this.adjustTrait('empathy', adaptation);
        this.adjustTrait('protectiveness', adaptation * 0.3);
        break;
      case 'excited':
        this.adjustTrait('playfulness', adaptation * 1.5);
        this.state.energyLevel = Math.min(1, this.state.energyLevel + adaptation);
        break;
      case 'calm':
        this.adjustTrait('wisdom', adaptation * 0.5);
        this.state.stressLevel = Math.max(0, this.state.stressLevel - adaptation);
        break;
    }

    this.emit('personalityUpdated', this.state);
  }

  private adjustTrait(traitName: string, adjustment: number): void {
    const trait = this.state.traits[traitName];
    if (!trait) return;

    // Apply stability resistance
    const actualAdjustment = adjustment * (1 - trait.stability);
    trait.value = Math.max(0, Math.min(1, trait.value + actualAdjustment));
  }

  /**
   * Get current personality state
   */
  getPersonalityState(): PersonalityState {
    return { ...this.state };
  }

  /**
   * Get a specific trait value
   */
  getTraitValue(traitName: string): number {
    return this.state.traits[traitName]?.value || 0;
  }

  /**
   * Get personality-influenced response style
   */
  getResponseStyle(): Record<string, any> {
    return {
      warmth: this.getTraitValue('empathy'),
      creativity: this.getTraitValue('creativity'),
      protectiveness: this.getTraitValue('protectiveness'),
      playfulness: this.getTraitValue('playfulness'),
      wisdom: this.getTraitValue('wisdom'),
      energy: this.state.energyLevel,
      mood: this.state.currentMood
    };
  }

  /**
   * Evolve personality based on interaction patterns
   */
  async evolvePersonality(interactionData: any): Promise<void> {
    // TODO: Implement personality evolution based on user interactions
    console.log('🌱 Personality evolution triggered:', interactionData);
    
    // This would analyze interaction patterns and gradually adjust personality
    // to better match user preferences while maintaining core traits
  }

  /**
   * Save current personality state
   */
  async savePersonalityData(): Promise<void> {
    // TODO: Save to secure storage
    console.log('💾 Saving personality data...');
  }
}