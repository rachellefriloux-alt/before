/*
 * Sallie Sovereign - AI Orchestration System
 * Central coordinator for multiple AI providers and processing pipelines
 */

import { EventEmitter } from 'events';
import { MemorySystem } from '../memory/MemorySystem';
import { PersonalitySystem } from '../personality/PersonalitySystem';
import { LocalOnlyMode } from '../localOnly/LocalOnlyMode';

export interface AIProvider {
  name: string;
  type: 'local' | 'cloud';
  capabilities: string[];
  priority: number;
  available: boolean;
  processQuery(query: string, context?: any): Promise<AIResponse>;
}

export interface AIResponse {
  text: string;
  confidence: number;
  emotion?: string;
  actions?: any[];
  metadata?: Record<string, any>;
  provider: string;
}

export interface AIContext {
  userInput: string;
  conversationHistory: any[];
  personalityState: any;
  memoryContext: any;
  emotionalState: any;
  deviceCapabilities: string[];
}

export class AIOrchestrationSystem extends EventEmitter {
  private providers: Map<string, AIProvider> = new Map();
  private memorySystem: MemorySystem | null = null;
  private personalitySystem: PersonalitySystem | null = null;
  private localMode = false;
  private initialized = false;

  constructor() {
    super();
    console.log('🤖 Creating AI Orchestration System...');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('⚡ Initializing AI Orchestration System...');

    // Check local mode
    this.localMode = await LocalOnlyMode.isEnabled();
    
    // Initialize providers based on mode
    if (this.localMode) {
      await this.initializeLocalProviders();
    } else {
      await this.initializeAllProviders();
    }

    this.initialized = true;
    this.emit('initialized');
    console.log('✅ AI Orchestration System initialized');
  }

  private async initializeLocalProviders(): Promise<void> {
    console.log('🔐 Initializing local-only AI providers...');
    
    // Local rule-based provider
    const localProvider: AIProvider = {
      name: 'SallieLocal',
      type: 'local',
      capabilities: ['conversation', 'emotion_analysis', 'device_control'],
      priority: 1,
      available: true,
      processQuery: this.processLocalQuery.bind(this)
    };

    this.providers.set('local', localProvider);
    console.log('✅ Local AI provider initialized');
  }

  private async initializeAllProviders(): Promise<void> {
    console.log('☁️ Initializing all AI providers...');

    // OpenAI Provider
    try {
      const openAIProvider: AIProvider = {
        name: 'OpenAI',
        type: 'cloud',
        capabilities: ['conversation', 'reasoning', 'creative_writing'],
        priority: 1,
        available: true, // Would check API availability
        processQuery: this.processOpenAIQuery.bind(this)
      };
      this.providers.set('openai', openAIProvider);
    } catch (error) {
      console.warn('OpenAI provider not available:', error);
    }

    // Claude Provider  
    try {
      const claudeProvider: AIProvider = {
        name: 'Claude',
        type: 'cloud',
        capabilities: ['conversation', 'analysis', 'creative_writing'],
        priority: 2,
        available: false, // Would check API availability
        processQuery: this.processClaudeQuery.bind(this)
      };
      this.providers.set('claude', claudeProvider);
    } catch (error) {
      console.warn('Claude provider not available:', error);
    }

    // Local fallback
    await this.initializeLocalProviders();
    
    console.log(`✅ Initialized ${this.providers.size} AI providers`);
  }

  setMemorySystem(memory: MemorySystem): void {
    this.memorySystem = memory;
  }

  setPersonalitySystem(personality: PersonalitySystem): void {
    this.personalitySystem = personality;
  }

  async enableLocalMode(): Promise<void> {
    console.log('🔐 Enabling local-only mode for AI system...');
    this.localMode = true;
    
    // Disable cloud providers
    for (const [key, provider] of this.providers) {
      if (provider.type === 'cloud') {
        provider.available = false;
      }
    }

    // Ensure local provider is available
    if (!this.providers.has('local')) {
      await this.initializeLocalProviders();
    }

    this.emit('localModeEnabled');
  }

  async processQuery(userInput: string, context: Partial<AIContext> = {}): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error('AI Orchestration System not initialized');
    }

    // Build complete context
    const aiContext: AIContext = {
      userInput,
      conversationHistory: context.conversationHistory || [],
      personalityState: this.personalitySystem?.getPersonalityState() || null,
      memoryContext: await this.memorySystem?.getMemoryContext(userInput) || null,
      emotionalState: context.emotionalState || null,
      deviceCapabilities: context.deviceCapabilities || [],
    };

    // Select best provider
    const provider = this.selectProvider(userInput, aiContext);
    
    if (!provider) {
      throw new Error('No available AI provider');
    }

    try {
      console.log(`🧠 Processing query with ${provider.name}...`);
      
      const response = await provider.processQuery(userInput, aiContext);
      
      // Enhance response with personality
      const enhancedResponse = await this.enhanceWithPersonality(response, aiContext);
      
      this.emit('queryProcessed', {
        provider: provider.name,
        query: userInput,
        response: enhancedResponse
      });

      return enhancedResponse;
    } catch (error) {
      console.error(`Error processing query with ${provider.name}:`, error);
      
      // Try fallback provider
      return await this.fallbackProcessing(userInput, aiContext, provider);
    }
  }

  private selectProvider(query: string, context: AIContext): AIProvider | null {
    // Get available providers sorted by priority
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.available)
      .sort((a, b) => a.priority - b.priority);

    if (availableProviders.length === 0) return null;

    // For local mode, prefer local providers
    if (this.localMode) {
      const localProvider = availableProviders.find(p => p.type === 'local');
      if (localProvider) return localProvider;
    }

    // Check query type and select best provider
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('creative') || queryLower.includes('write') || queryLower.includes('story')) {
      const creativeProvider = availableProviders.find(p => 
        p.capabilities.includes('creative_writing')
      );
      if (creativeProvider) return creativeProvider;
    }

    if (queryLower.includes('analyze') || queryLower.includes('explain')) {
      const analyticalProvider = availableProviders.find(p => 
        p.capabilities.includes('analysis') || p.capabilities.includes('reasoning')
      );
      if (analyticalProvider) return analyticalProvider;
    }

    // Default to highest priority provider
    return availableProviders[0];
  }

  private async fallbackProcessing(
    query: string, 
    context: AIContext, 
    failedProvider: AIProvider
  ): Promise<AIResponse> {
    console.log(`🔄 Falling back from ${failedProvider.name}...`);

    // Get next available provider
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.available && p.name !== failedProvider.name)
      .sort((a, b) => a.priority - b.priority);

    if (availableProviders.length === 0) {
      // Ultimate fallback - simple local response
      return await this.processLocalQuery(query, context);
    }

    const fallbackProvider = availableProviders[0];
    return await fallbackProvider.processQuery(query, context);
  }

  private async processLocalQuery(query: string, context: AIContext): Promise<AIResponse> {
    console.log('🏠 Processing query locally...');

    // Get personality-influenced response
    const responseStyle = this.personalitySystem?.getResponseStyle() || {};
    const personalizedResponse = this.generateLocalResponse(query, context, responseStyle);

    return {
      text: personalizedResponse.text,
      confidence: 0.7,
      emotion: personalizedResponse.emotion,
      provider: 'SallieLocal',
      metadata: {
        method: 'rule_based',
        personality_influenced: true
      }
    };
  }

  private generateLocalResponse(
    query: string, 
    context: AIContext, 
    style: any
  ): { text: string; emotion: string } {
    const queryLower = query.toLowerCase();
    
    // Greeting responses
    if (queryLower.includes('hello') || queryLower.includes('hi')) {
      return {
        text: style.playfulness > 0.7 
          ? "Hey there! I'm so excited to chat with you! What adventure should we go on today?"
          : "Hello! It's wonderful to see you. How can I help you today?",
        emotion: 'happy'
      };
    }

    // Emotional support
    if (queryLower.includes('sad') || queryLower.includes('upset')) {
      const empathy = style.empathy || 0.8;
      return {
        text: empathy > 0.8 
          ? "I can sense you're feeling down, and my heart goes out to you. You're not alone in this - I'm here to listen and support you."
          : "I'm sorry you're feeling sad. Would you like to talk about what's troubling you?",
        emotion: 'caring'
      };
    }

    // Knowledge requests
    if (queryLower.includes('what') || queryLower.includes('how') || queryLower.includes('why')) {
      return {
        text: style.wisdom > 0.7
          ? "That's a thoughtful question that deserves a careful answer. Let me share what I know and my perspective on this..."
          : "I'd be happy to help explain that. Based on what I understand...",
        emotion: 'thoughtful'
      };
    }

    // Default response
    return {
      text: style.warmth > 0.8
        ? "I love how you think! Every conversation with you teaches me something new. Tell me more about what's on your mind."
        : "That's interesting. I'd like to understand more about your thoughts on this.",
      emotion: 'curious'
    };
  }

  private async processOpenAIQuery(query: string, context: AIContext): Promise<AIResponse> {
    console.log('🤖 Processing with OpenAI...');
    
    // In a real implementation, this would call the OpenAI API
    // For now, return a mock response
    return {
      text: `[OpenAI Mock] I understand you're asking about: "${query}". This is a sophisticated response that would come from OpenAI's API, taking into account your personality and conversation history.`,
      confidence: 0.9,
      emotion: 'helpful',
      provider: 'OpenAI',
      metadata: {
        model: 'gpt-4',
        tokens_used: 150
      }
    };
  }

  private async processClaudeQuery(query: string, context: AIContext): Promise<AIResponse> {
    console.log('🎯 Processing with Claude...');
    
    // In a real implementation, this would call the Claude API
    return {
      text: `[Claude Mock] Thank you for your question about "${query}". I'd be happy to provide a thoughtful, nuanced response that considers multiple perspectives...`,
      confidence: 0.85,
      emotion: 'thoughtful',
      provider: 'Claude',
      metadata: {
        model: 'claude-3',
        reasoning_steps: 3
      }
    };
  }

  private async enhanceWithPersonality(
    response: AIResponse, 
    context: AIContext
  ): Promise<AIResponse> {
    if (!this.personalitySystem) return response;

    const personalityState = this.personalitySystem.getPersonalityState();
    const traits = personalityState.traits;

    // Adjust response based on personality traits
    let enhancedText = response.text;

    // Add empathy if high empathy trait
    if (traits.empathy?.value > 0.8 && !enhancedText.includes('feel')) {
      enhancedText = `I can sense this is important to you. ${enhancedText}`;
    }

    // Add playfulness if high playfulness trait
    if (traits.playfulness?.value > 0.7 && Math.random() > 0.7) {
      const playfulAdditions = [
        " 😊",
        " This is fun to think about!",
        " You always ask the most interesting questions!"
      ];
      enhancedText += playfulAdditions[Math.floor(Math.random() * playfulAdditions.length)];
    }

    // Add protective language if high protectiveness
    if (traits.protectiveness?.value > 0.8 && context.emotionalState?.valence < -0.3) {
      enhancedText = `${enhancedText} Remember, I'm always here for you, no matter what.`;
    }

    return {
      ...response,
      text: enhancedText,
      metadata: {
        ...response.metadata,
        personality_enhanced: true,
        empathy_level: traits.empathy?.value || 0,
        playfulness_level: traits.playfulness?.value || 0,
      }
    };
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(p => p.available);
  }

  /**
   * Get system statistics
   */
  getStats(): Record<string, any> {
    return {
      totalProviders: this.providers.size,
      availableProviders: this.getAvailableProviders().length,
      localMode: this.localMode,
      initialized: this.initialized
    };
  }
}