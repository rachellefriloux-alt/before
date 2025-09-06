/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: AI Context Manager - Bridges memory system with AI capabilities for contextually aware responses.
 * Got it, love.
 */

import MemoryManager from '../core/MemoryManager';
import { MemoryType, MemoryPriority } from '../types/MemoryTypes';
import { analyzeSentiment, extractKeywords, extractIntent } from './nlpEngine';

export interface AIContext {
  userId: string;
  currentMood?: string;
  recentMemories: any[];
  relevantPeople: any[];
  activeTasks: any[];
  emotionalState: {
    sentiment: string;
    intensity: number;
    valence: 'positive' | 'negative' | 'neutral';
  };
  conversationContext: {
    lastInteraction: Date;
    topicHistory: string[];
    unresolvedIssues: string[];
  };
  preferences: Record<string, any>;
}

export interface ContextualResponse {
  response: string;
  memoryUpdates: any[];
  suggestedActions: string[];
  emotionalSupport: string;
  contextInsights: string[];
}

/**
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: AI Context Manager - Bridges memory system with AI capabilities for contextually aware responses.
 * Got it, love.
 */
class AIContextManager {
  private static instance: AIContextManager;
  private memoryManager: MemoryManager;
  private contextCache: Map<string, AIContext> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.memoryManager = MemoryManager.getInstance();
  }

  public static getInstance(): AIContextManager {
    if (!AIContextManager.instance) {
      AIContextManager.instance = new AIContextManager();
    }
    return AIContextManager.instance;
  }

  /**
   * Build comprehensive context for a user interaction
   */
  public async buildContext(userId: string, userMessage: string): Promise<AIContext> {
    // Check cache first
    const cached = this.contextCache.get(userId);
    if (cached && (Date.now() - cached.conversationContext.lastInteraction.getTime()) < this.cacheExpiry) {
      return this.updateContextWithMessage(cached, userMessage);
    }

    // Build fresh context
    const context: AIContext = {
      userId,
      recentMemories: [],
      relevantPeople: [],
      activeTasks: [],
      emotionalState: {
        sentiment: 'neutral',
        intensity: 0.5,
        valence: 'neutral'
      },
      conversationContext: {
        lastInteraction: new Date(),
        topicHistory: [],
        unresolvedIssues: []
      },
      preferences: {}
    };

    // Analyze user's emotional state from message
    const sentiment = analyzeSentiment(userMessage);
    context.emotionalState = {
      sentiment: sentiment.primaryEmotion,
      intensity: sentiment.emotionalIntensity,
      valence: sentiment.valence
    };

    // Get recent memories
    context.recentMemories = await this.memoryManager.searchMemories({
      limit: 10,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });

    // Get relevant people
    context.relevantPeople = await this.memoryManager.searchMemories({
      type: MemoryType.PERSON,
      limit: 5
    });

    // Get active tasks
    context.activeTasks = await this.memoryManager.searchMemories({
      type: MemoryType.TASK,
      contentKeywords: ['pending', 'in-progress']
    });

    // Get user preferences
    const preferences = await this.memoryManager.searchMemories({
      type: MemoryType.PREFERENCE
    });
    context.preferences = this.extractPreferences(preferences);

    // Extract topics from recent conversation
    context.conversationContext.topicHistory = this.extractTopics(context.recentMemories);

    // Cache the context
    this.contextCache.set(userId, context);

    return context;
  }

  /**
   * Generate contextually aware response
   */
  public async generateContextualResponse(
    userId: string,
    userMessage: string,
    baseResponse: string
  ): Promise<ContextualResponse> {
    const context = await this.buildContext(userId, userMessage);

    const contextualResponse: ContextualResponse = {
      response: baseResponse,
      memoryUpdates: [],
      suggestedActions: [],
      emotionalSupport: '',
      contextInsights: []
    };

    // Enhance response with memory context
    contextualResponse.response = await this.enhanceResponseWithMemory(baseResponse, context);

    // Generate memory updates based on interaction
    contextualResponse.memoryUpdates = await this.generateMemoryUpdates(userMessage, context);

    // Suggest relevant actions
    contextualResponse.suggestedActions = this.generateSuggestedActions(context);

    // Provide emotional support based on context
    contextualResponse.emotionalSupport = this.generateEmotionalSupport(context);

    // Add context insights
    contextualResponse.contextInsights = this.generateContextInsights(context);

    return contextualResponse;
  }

  /**
   * Learn from user interaction and update memory
   */
  public async learnFromInteraction(userId: string, userMessage: string, aiResponse: string): Promise<void> {
    const context = await this.buildContext(userId, userMessage);

    // Extract entities and intent from user message
    const entities = extractKeywords(userMessage);
    const intent = extractIntent(userMessage);

    // Create memory entries for significant interactions
    const memoryUpdates = [];

    // Store conversation memory
    if (this.isSignificantInteraction(userMessage, context)) {
      memoryUpdates.push({
        type: MemoryType.QUICK_CAPTURE,
        content: `Conversation: ${userMessage.substring(0, 100)}...`,
        priority: MemoryPriority.MEDIUM,
        tags: ['conversation', 'ai-interaction'],
        emotionalContext: {
          sentiment: this.sentimentStringToNumber(context.emotionalState.sentiment),
          intensity: context.emotionalState.intensity
        },
        createdAt: new Date().toISOString()
      });
    }

    // Store person mentions
    for (const entity of entities.entities) {
      if (entity.type === 'person') {
        const existingPerson = context.relevantPeople.find(p =>
          p.personData?.name.toLowerCase().includes(entity.text.toLowerCase())
        );

        if (!existingPerson) {
          memoryUpdates.push({
            type: MemoryType.PERSON,
            content: `Mentioned in conversation: ${entity.text}`,
            priority: MemoryPriority.LOW,
            personData: {
              name: entity.text,
              relationship: 'mentioned',
              notes: `Mentioned in conversation about: ${userMessage.substring(0, 50)}...`
            },
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    // Store task mentions
    if (intent.primaryIntent.includes('task') || intent.primaryIntent.includes('remind')) {
      memoryUpdates.push({
        type: MemoryType.TASK,
        content: `Task mentioned: ${userMessage}`,
        priority: MemoryPriority.MEDIUM,
        taskData: {
          title: userMessage.substring(0, 50),
          description: userMessage,
          status: 'pending' as const,
          priority: 'medium' as const
        },
        createdAt: new Date().toISOString()
      });
    }

    // Add memories
    for (const update of memoryUpdates) {
      await this.memoryManager.addMemory(update);
    }

    // Update context cache
    context.conversationContext.lastInteraction = new Date();
    this.contextCache.set(userId, context);
  }

  /**
   * Get memory insights for AI responses
   */
  public async getMemoryInsights(userId: string, topic: string): Promise<string[]> {
    const context = await this.buildContext(userId, '');

    const insights = [];

    // Find related memories
    const relatedMemories = await this.memoryManager.searchMemories({
      contentKeywords: [topic],
      limit: 5
    });

    if (relatedMemories.length > 0) {
      insights.push(`I remember we've discussed ${topic} before.`);
    }

    // Check for unresolved tasks
    if (context.activeTasks.length > 0) {
      insights.push(`You have ${context.activeTasks.length} active tasks that might be relevant.`);
    }

    // Emotional pattern insights
    if (context.emotionalState.intensity > 0.7) {
      insights.push(`I notice you're feeling quite ${context.emotionalState.sentiment} right now.`);
    }

    return insights;
  }

  // Private helper methods
  private updateContextWithMessage(context: AIContext, message: string): AIContext {
    // Update emotional state
    const sentiment = analyzeSentiment(message);
    context.emotionalState = {
      sentiment: sentiment.primaryEmotion,
      intensity: sentiment.emotionalIntensity,
      valence: sentiment.valence
    };

    // Update conversation context
    context.conversationContext.lastInteraction = new Date();
    context.conversationContext.topicHistory.unshift(message.substring(0, 50));

    // Keep only recent topics
    if (context.conversationContext.topicHistory.length > 10) {
      context.conversationContext.topicHistory = context.conversationContext.topicHistory.slice(0, 10);
    }

    return context;
  }

  private async enhanceResponseWithMemory(response: string, context: AIContext): Promise<string> {
    let enhancedResponse = response;

    // Add memory references
    if (context.recentMemories.length > 0) {
      enhancedResponse += "\n\nI remember from our previous conversations...";
    }

    // Add emotional context
    if (context.emotionalState.intensity > 0.6) {
      enhancedResponse += `\n\nI can tell you're feeling ${context.emotionalState.sentiment}.`;
    }

    return enhancedResponse;
  }

  private async generateMemoryUpdates(message: string, context: AIContext): Promise<any[]> {
    const updates = [];

    // Create emotion memory for intense emotional states
    if (context.emotionalState.intensity > 0.7) {
      updates.push({
        type: MemoryType.EMOTION,
        content: `User expressed ${context.emotionalState.sentiment} emotion`,
        priority: MemoryPriority.MEDIUM,
        emotionData: {
          emotion: context.emotionalState.sentiment,
          intensity: context.emotionalState.intensity,
          trigger: message.substring(0, 100)
        }
      });
    }

    return updates;
  }

  private generateSuggestedActions(context: AIContext): string[] {
    const actions = [];

    if (context.activeTasks.length > 0) {
      actions.push(`Review your ${context.activeTasks.length} active tasks`);
    }

    if (context.emotionalState.intensity > 0.8) {
      actions.push("Take a moment for self-care");
    }

    return actions;
  }

  private generateEmotionalSupport(context: AIContext): string {
    if (context.emotionalState.intensity > 0.7) {
      return `I can see you're feeling ${context.emotionalState.sentiment}. Remember, it's okay to feel this way, and I'm here to support you.`;
    }
    return '';
  }

  private generateContextInsights(context: AIContext): string[] {
    const insights = [];

    if (context.recentMemories.length > 5) {
      insights.push("You've been quite active with memories lately");
    }

    if (context.relevantPeople.length > 0) {
      insights.push(`You have ${context.relevantPeople.length} important people in your life`);
    }

    return insights;
  }

  private extractPreferences(memories: any[]): Record<string, any> {
    const preferences: Record<string, any> = {};

    for (const memory of memories) {
      try {
        const parsed = JSON.parse(memory.content);
        if (parsed.key && parsed.value) {
          preferences[parsed.key] = parsed.value;
        }
      } catch {
        // Not a structured preference
      }
    }

    return preferences;
  }

  private extractTopics(memories: any[]): string[] {
    const topics = new Set<string>();

    for (const memory of memories) {
      // Simple topic extraction - could be enhanced with NLP
      const words = memory.content.toLowerCase().split(' ');
      const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

      for (const word of words) {
        if (word.length > 4 && !commonWords.includes(word)) {
          topics.add(word);
        }
      }
    }

    return Array.from(topics).slice(0, 10);
  }

  private isSignificantInteraction(message: string, context: AIContext): boolean {
    // Consider interaction significant if it contains emotional words or is lengthy
    const emotionalWords = ['feel', 'think', 'worried', 'happy', 'sad', 'angry', 'excited'];
    const hasEmotionalContent = emotionalWords.some(word => message.toLowerCase().includes(word));
    const isLengthy = message.length > 100;

    return hasEmotionalContent || isLengthy || context.emotionalState.intensity > 0.6;
  }

  /**
   * Convert sentiment string to number for memory storage
   */
  private sentimentStringToNumber(sentiment: string): number {
    const sentimentMap: Record<string, number> = {
      'joy': 1,
      'happiness': 1,
      'sadness': -1,
      'anger': -0.8,
      'fear': -0.6,
      'surprise': 0.2,
      'disgust': -0.7,
      'neutral': 0,
      'positive': 0.5,
      'negative': -0.5
    };
    return sentimentMap[sentiment.toLowerCase()] || 0;
  }
}

export default AIContextManager;
