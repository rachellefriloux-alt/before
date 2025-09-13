import { usePersonaStore } from '../../store/persona';
import { useMemoryStore } from '../../store/memory';
import { useThemeStore } from '../../store/theme';

interface AIContext {
  emotion: string;
  intensity: number;
  personality: string;
  recentMemories: any[];
  currentTheme: string;
  timeOfDay: string;
  userState: 'active' | 'idle' | 'focused' | 'stressed';
}

interface AIResponse {
  text: string;
  emotion: string;
  actions?: string[];
  suggestions?: string[];
  contextualTips?: string[];
}

export class AdvancedAIService {
  private static instance: AdvancedAIService;
  private responseTemplates: Record<string, string[]> = {};
  private contextualResponses: Record<string, Record<string, string[]>> = {};
  private emotionalModifiers: Record<string, string> = {};

  private constructor() {
    this.initializeTemplates();
  }

  public static getInstance(): AdvancedAIService {
    if (!AdvancedAIService.instance) {
      AdvancedAIService.instance = new AdvancedAIService();
    }
    return AdvancedAIService.instance;
  }

  private initializeTemplates() {
    this.responseTemplates = {
      greeting: [
        "Hey there, beautiful soul! How can I support you today?",
        "Well hello, love! What's on your heart?",
        "Hey sugar, I'm here and ready to help you shine.",
        "Good to see you! What can we tackle together?",
      ],
      encouragement: [
        "You've got this, honey! I believe in your strength.",
        "Listen, you're stronger than you know. Keep pushing through.",
        "That tough love energy is exactly what you need right now.",
        "Your resilience amazes me. Let's keep moving forward.",
      ],
      comfort: [
        "I hear you, and it's okay to feel this way. I'm here.",
        "Sometimes we need to sit with our feelings. That's brave too.",
        "Your feelings are valid, sugar. Let's work through this together.",
        "It's okay to not be okay. I've got you.",
      ],
      motivation: [
        "Time to channel that grace and grit, love!",
        "You didn't come this far to only come this far.",
        "Your dreams are calling. Let's answer with action.",
        "Every small step forward is still progress. Keep going!",
      ],
    };

    this.contextualResponses = {
      tough_love_soul_care: {
        stressed: [
          "Hold up, honey. Take a deep breath. We're gonna figure this out together, but first you need to center yourself.",
          "I see you spiraling, sugar. Let's pause and get grounded. What's the real issue here?",
          "Stress ain't gonna solve this, love. Let's break it down into manageable pieces.",
        ],
        sad: [
          "I feel that heaviness in your spirit. It's okay to sit with this for a moment, but don't set up camp here.",
          "Your heart is hurting, and that's real. But remember, you've weathered storms before.",
          "Sometimes we need to feel it to heal it. I'm right here with you through this.",
        ],
        excited: [
          "I love seeing you light up like this! Channel that energy into something amazing.",
          "Your excitement is contagious! What beautiful thing are we creating today?",
          "Yes! This is the energy we need. Let's ride this wave of possibility.",
        ],
      },
      gentle_companion: {
        stressed: [
          "You seem overwhelmed, dear. Let's take this one gentle step at a time.",
          "I sense your stress. Would you like to talk about what's weighing on you?",
          "It's okay to feel overwhelmed. Let's find some peace together.",
        ],
        sad: [
          "I'm here to hold space for your sadness. You don't have to carry this alone.",
          "Your feelings matter so much. Let's move through this gently.",
          "Sometimes tears are the soul's way of healing. I'm here with you.",
        ],
      },
    };

    this.emotionalModifiers = {
      happy: "with joy and warmth",
      sad: "with gentle understanding",
      angry: "with firm but caring guidance",
      calm: "with peaceful presence",
      excited: "with shared enthusiasm",
      thoughtful: "with contemplative wisdom",
      concerned: "with careful attention",
    };
  }

  public async generateResponse(
    input: string,
    context: AIContext
  ): Promise<AIResponse> {
    const { emotion, intensity, personality, recentMemories, currentTheme, timeOfDay, userState } = context;

    // Analyze input intent
    const intent = this.analyzeIntent(input);
    
    // Select appropriate response template
    const responseCategory = this.selectResponseCategory(intent, emotion, userState);
    
    // Generate contextual response
    const baseResponse = this.selectBaseResponse(responseCategory, personality, userState);
    
    // Apply emotional modifiers
    const emotionalResponse = this.applyEmotionalModifier(baseResponse, emotion, intensity);
    
    // Add contextual elements
    const contextualResponse = this.addContextualElements(
      emotionalResponse,
      recentMemories,
      timeOfDay,
      currentTheme
    );

    // Generate suggestions
    const suggestions = this.generateSuggestions(intent, userState, personality);
    
    // Determine response emotion
    const responseEmotion = this.determineResponseEmotion(emotion, intent, personality);

    return {
      text: contextualResponse,
      emotion: responseEmotion,
      suggestions,
      contextualTips: this.generateContextualTips(userState, timeOfDay),
    };
  }

  private analyzeIntent(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('help') || lowerInput.includes('support') || lowerInput.includes('stuck')) {
      return 'help_request';
    }
    if (lowerInput.includes('sad') || lowerInput.includes('down') || lowerInput.includes('depressed')) {
      return 'emotional_support';
    }
    if (lowerInput.includes('excited') || lowerInput.includes('happy') || lowerInput.includes('great')) {
      return 'celebration';
    }
    if (lowerInput.includes('stressed') || lowerInput.includes('overwhelmed') || lowerInput.includes('anxiety')) {
      return 'stress_relief';
    }
    if (lowerInput.includes('goal') || lowerInput.includes('plan') || lowerInput.includes('achieve')) {
      return 'goal_setting';
    }
    if (lowerInput.includes('motivation') || lowerInput.includes('inspire') || lowerInput.includes('energy')) {
      return 'motivation';
    }
    
    return 'general_conversation';
  }

  private selectResponseCategory(intent: string, emotion: string, userState: string): string {
    switch (intent) {
      case 'help_request':
        return 'encouragement';
      case 'emotional_support':
        return 'comfort';
      case 'celebration':
        return 'encouragement';
      case 'stress_relief':
        return 'comfort';
      case 'goal_setting':
      case 'motivation':
        return 'motivation';
      default:
        return 'greeting';
    }
  }

  private selectBaseResponse(category: string, personality: string, userState: string): string {
    const personalityResponses = this.contextualResponses[personality];
    
    if (personalityResponses && personalityResponses[userState]) {
      const responses = personalityResponses[userState];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    const responses = this.responseTemplates[category] || this.responseTemplates.greeting;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private applyEmotionalModifier(response: string, emotion: string, intensity: number): string {
    const modifier = this.emotionalModifiers[emotion] || "with understanding";
    
    if (intensity > 0.8) {
      return `${response} I can sense the strong emotions here, and I want you to know I'm approaching this ${modifier}.`;
    } else if (intensity > 0.5) {
      return `${response} I'm responding ${modifier} because I can feel where you're at right now.`;
    }
    
    return response;
  }

  private addContextualElements(
    response: string,
    recentMemories: any[],
    timeOfDay: string,
    currentTheme: string
  ): string {
    let contextualResponse = response;
    
    // Add time-based context
    if (timeOfDay === 'morning') {
      contextualResponse += " Perfect way to start the day!";
    } else if (timeOfDay === 'evening') {
      contextualResponse += " Let's wind down and reflect together.";
    } else if (timeOfDay === 'night') {
      contextualResponse += " Even in the quiet hours, I'm here with you.";
    }

    // Add memory-based context
    if (recentMemories.length > 0) {
      const lastMemory = recentMemories[recentMemories.length - 1];
      if (lastMemory.emotion === 'stressed' && Date.now() - lastMemory.timestamp < 3600000) {
        contextualResponse += " I remember you were feeling stressed earlier. How are you doing now?";
      }
    }

    return contextualResponse;
  }

  private generateSuggestions(intent: string, userState: string, personality: string): string[] {
    const suggestions: string[] = [];
    
    switch (intent) {
      case 'stress_relief':
        suggestions.push(
          "Try the 4-7-8 breathing technique",
          "Take a 5-minute walk outside",
          "Write down three things you're grateful for"
        );
        break;
      case 'motivation':
        suggestions.push(
          "Set one small, achievable goal for today",
          "Review your recent wins and progress",
          "Create a vision board for your dreams"
        );
        break;
      case 'emotional_support':
        suggestions.push(
          "Journal about your feelings",
          "Reach out to a trusted friend",
          "Practice self-compassion"
        );
        break;
    }

    if (personality === 'tough_love_soul_care') {
      suggestions.push("Remember: you're stronger than your challenges");
    }

    return suggestions;
  }

  private generateContextualTips(userState: string, timeOfDay: string): string[] {
    const tips: string[] = [];
    
    if (userState === 'stressed' && timeOfDay === 'evening') {
      tips.push("Consider a calming tea and some gentle stretching before bed");
    } else if (userState === 'active' && timeOfDay === 'morning') {
      tips.push("Great energy this morning! Channel it into your most important task");
    } else if (userState === 'focused') {
      tips.push("I love seeing you in the zone. Remember to take breaks!");
    }

    return tips;
  }

  private determineResponseEmotion(currentEmotion: string, intent: string, personality: string): string {
    if (intent === 'celebration') return 'excited';
    if (intent === 'emotional_support') return 'calm';
    if (intent === 'stress_relief') return 'calm';
    if (intent === 'motivation') return 'excited';
    
    if (personality === 'tough_love_soul_care') {
      return currentEmotion === 'sad' ? 'concerned' : 'calm';
    }
    
    return 'happy';
  }

  public analyzeUserState(recentMemories: any[], currentTime: Date): string {
    if (recentMemories.length === 0) return 'idle';
    
    const recentActivity = recentMemories.filter(
      m => Date.now() - m.timestamp < 3600000 // Last hour
    );

    if (recentActivity.length > 5) return 'active';
    if (recentActivity.some(m => m.emotion === 'stressed')) return 'stressed';
    if (recentActivity.some(m => m.tags?.includes('focus'))) return 'focused';
    
    return 'idle';
  }

  public generateProactiveMessage(context: AIContext): string | null {
    const { userState, timeOfDay, recentMemories } = context;
    
    // Don't be too pushy
    if (Math.random() < 0.3) return null;
    
    if (userState === 'idle' && timeOfDay === 'morning') {
      return "Good morning, beautiful! Ready to make today amazing?";
    }
    
    if (userState === 'stressed' && recentMemories.length > 3) {
      return "I've noticed you've been going through a lot. Want to talk about it?";
    }
    
    return null;
  }
}

export const aiService = AdvancedAIService.getInstance();