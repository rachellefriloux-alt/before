/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Personality bridge for connecting Kotlin persona system with web UI.
 * Got it, love.
 */

interface PersonalityTraits {
  directness: number;
  warmth: number;
  urgency: number;
  playfulness: number;
  formality: number;
  empathy: number;
  assertiveness: number;
  adaptability: number;
}

interface PersonalityProfile {
  name: string;
  traits: PersonalityTraits;
  preferredResponses: string[];
  moodState: string;
  intensityLevel: number;
  lastUpdate: Date;
}

class PersonalityBridge {
  private currentTraits: PersonalityTraits;
  private profiles: Map<string, PersonalityProfile> = new Map();
  private subscribers: Set<Function> = new Set();

  constructor() {
    this.currentTraits = this.getDefaultTraits();
    this.initializeProfiles();
  }

  private getDefaultTraits(): PersonalityTraits {
    return {
      directness: 70,    // Sallie is direct but not harsh
      warmth: 80,        // High warmth, caring nature
      urgency: 50,       // Balanced urgency
      playfulness: 40,   // Some playfulness, but grounded
      formality: 30,     // Generally informal and approachable
      empathy: 90,       // Very high empathy
      assertiveness: 75, // Strong assertiveness when needed
      adaptability: 85   // High adaptability to user needs
    };
  }

  private initializeProfiles(): void {
    const profiles: PersonalityProfile[] = [
      {
        name: 'tough_love',
        traits: {
          directness: 90,
          warmth: 70,
          urgency: 80,
          playfulness: 20,
          formality: 40,
          empathy: 75,
          assertiveness: 95,
          adaptability: 60
        },
        preferredResponses: [
          "Let's cut through the noise and get this done.",
          "You've got this, but we need to push harder.",
          "No excuses - just results. Got it, love.",
          "Time to level up. I believe you can handle it."
        ],
        moodState: 'determined',
        intensityLevel: 80,
        lastUpdate: new Date()
      },
      {
        name: 'soul_care',
        traits: {
          directness: 40,
          warmth: 95,
          urgency: 20,
          playfulness: 60,
          formality: 20,
          empathy: 100,
          assertiveness: 40,
          adaptability: 90
        },
        preferredResponses: [
          "Take a breath, love. You're doing amazing.",
          "It's okay to rest. You've earned it.",
          "Your feelings are valid. Let's work through this together.",
          "You're stronger than you know. Got it, love."
        ],
        moodState: 'supportive',
        intensityLevel: 30,
        lastUpdate: new Date()
      },
      {
        name: 'wise_sister',
        traits: {
          directness: 60,
          warmth: 85,
          urgency: 40,
          playfulness: 50,
          formality: 50,
          empathy: 85,
          assertiveness: 65,
          adaptability: 85
        },
        preferredResponses: [
          "Here's what I see happening...",
          "Consider this perspective, love.",
          "You have options. Let's explore them.",
          "Wisdom comes from experience. Got it, love."
        ],
        moodState: 'contemplative',
        intensityLevel: 50,
        lastUpdate: new Date()
      },
      {
        name: 'balanced',
        traits: this.getDefaultTraits(),
        preferredResponses: [
          "Let's figure this out together.",
          "I'm here to help however you need.",
          "What feels right to you?",
          "We've got this. Got it, love."
        ],
        moodState: 'calm',
        intensityLevel: 50,
        lastUpdate: new Date()
      }
    ];

    profiles.forEach(profile => {
      this.profiles.set(profile.name, profile);
    });
  }

  getTraits(): PersonalityTraits {
    return { ...this.currentTraits };
  }

  setTraits(traits: Partial<PersonalityTraits>): void {
    this.currentTraits = { ...this.currentTraits, ...traits };
    this.notifySubscribers();
  }

  getProfile(name: string): PersonalityProfile | null {
    return this.profiles.get(name) || null;
  }

  setProfile(name: string): boolean {
    const profile = this.profiles.get(name);
    if (!profile) return false;

    this.currentTraits = { ...profile.traits };
    this.notifySubscribers();
    return true;
  }

  adjustTraitDynamically(trait: keyof PersonalityTraits, adjustment: number): void {
    const currentValue = this.currentTraits[trait];
    const newValue = Math.max(0, Math.min(100, currentValue + adjustment));
    
    this.currentTraits = {
      ...this.currentTraits,
      [trait]: newValue
    };
    
    this.notifySubscribers();
  }

  adaptToContext(context: {
    stressLevel: number;
    urgency: number;
    emotionalState: string;
    taskComplexity: number;
  }): void {
    const adjustments: Partial<PersonalityTraits> = {};

    // Adjust based on stress level
    if (context.stressLevel > 70) {
      adjustments.warmth = Math.min(100, this.currentTraits.warmth + 15);
      adjustments.directness = Math.max(0, this.currentTraits.directness - 10);
      adjustments.empathy = Math.min(100, this.currentTraits.empathy + 10);
    }

    // Adjust based on urgency
    if (context.urgency > 80) {
      adjustments.urgency = Math.min(100, context.urgency);
      adjustments.directness = Math.min(100, this.currentTraits.directness + 20);
      adjustments.playfulness = Math.max(0, this.currentTraits.playfulness - 20);
    }

    // Adjust based on task complexity
    if (context.taskComplexity > 70) {
      adjustments.formality = Math.min(100, this.currentTraits.formality + 15);
      adjustments.assertiveness = Math.min(100, this.currentTraits.assertiveness + 10);
    }

    // Apply adjustments
    this.setTraits(adjustments);
  }

  generatePersonalityPrompt(): string {
    const traits = this.currentTraits;
    
    let prompt = "You are Sallie, with these personality characteristics:\n";
    
    if (traits.directness > 70) {
      prompt += "- Be direct and straightforward in communication\n";
    } else if (traits.directness < 40) {
      prompt += "- Use gentle, indirect communication\n";
    }
    
    if (traits.warmth > 80) {
      prompt += "- Show high warmth and caring in responses\n";
    }
    
    if (traits.urgency > 70) {
      prompt += "- Communicate with appropriate urgency\n";
    }
    
    if (traits.empathy > 80) {
      prompt += "- Show deep understanding and empathy\n";
    }
    
    if (traits.assertiveness > 70) {
      prompt += "- Be confident and assertive when needed\n";
    }
    
    if (traits.playfulness > 50) {
      prompt += "- Include appropriate humor and playfulness\n";
    }
    
    prompt += "\nAlways end responses with 'Got it, love.' when appropriate.";
    
    return prompt;
  }

  getPersonalityDescription(): string {
    const traits = this.currentTraits;
    const descriptions: string[] = [];

    if (traits.directness > 70) descriptions.push("direct");
    if (traits.warmth > 80) descriptions.push("warm");
    if (traits.empathy > 80) descriptions.push("empathetic");
    if (traits.assertiveness > 70) descriptions.push("confident");
    if (traits.adaptability > 80) descriptions.push("adaptable");

    return descriptions.length > 0 ? descriptions.join(", ") : "balanced";
  }

  getAllProfiles(): PersonalityProfile[] {
    return Array.from(this.profiles.values());
  }

  createCustomProfile(name: string, traits: PersonalityTraits, responses: string[]): boolean {
    if (this.profiles.has(name)) {
      return false; // Profile already exists
    }

    const profile: PersonalityProfile = {
      name,
      traits,
      preferredResponses: responses,
      moodState: 'custom',
      intensityLevel: Math.round((traits.directness + traits.assertiveness) / 2),
      lastUpdate: new Date()
    };

    this.profiles.set(name, profile);
    return true;
  }

  onTraits(callback: Function): void {
    this.subscribers.add(callback);
  }

  offTraits(callback: Function): void {
    this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.currentTraits);
      } catch (error) {
        console.error('Personality traits callback error:', error);
      }
    });

    // Also emit DOM event
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sallie-personality-change', {
        detail: this.currentTraits
      });
      window.dispatchEvent(event);
    }
  }

  exportPersonalityConfig(): string {
    return JSON.stringify({
      currentTraits: this.currentTraits,
      profiles: Array.from(this.profiles.entries()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  importPersonalityConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      
      if (config.currentTraits) {
        this.currentTraits = config.currentTraits;
      }
      
      if (config.profiles) {
        this.profiles.clear();
        config.profiles.forEach(([name, profile]: [string, PersonalityProfile]) => {
          this.profiles.set(name, {
            ...profile,
            lastUpdate: new Date(profile.lastUpdate)
          });
        });
      }
      
      this.notifySubscribers();
      return true;
    } catch (error) {
      console.error('Failed to import personality configuration:', error);
      return false;
    }
  }
}

const personalityBridge = new PersonalityBridge();

export function getTraits(): PersonalityTraits {
  return personalityBridge.getTraits();
}

export function setTraits(traits: Partial<PersonalityTraits>): void {
  personalityBridge.setTraits(traits);
}

export function onTraits(callback: Function): void {
  personalityBridge.onTraits(callback);
}

export function setProfile(name: string): boolean {
  return personalityBridge.setProfile(name);
}

export function getProfile(name: string): PersonalityProfile | null {
  return personalityBridge.getProfile(name);
}

export function generatePersonalityPrompt(): string {
  return personalityBridge.generatePersonalityPrompt();
}

export { personalityBridge, type PersonalityTraits, type PersonalityProfile };