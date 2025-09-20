import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as SecureStore from 'expo-secure-store';
import { usePersonaStore } from '../store/persona';
import { useMemoryStore } from '../store/memory';
import { useEnhancedPersonaStore } from '../store/enhancedPersona';

export interface AIServiceConfig {
  openai?: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  anthropic?: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  gemini?: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  perplexity?: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  fallbackPriority: ('openai' | 'anthropic' | 'gemini' | 'perplexity' | 'local')[];
  hybridMode: boolean;
  consensusMode: boolean;
}

export interface EnhancedAIContext {
  // User context
  userId: string;
  conversationId: string;
  messageHistory: any[];
  
  // Persona context
  currentPersona: string;
  personalityTraits: any;
  emotionalState: string;
  
  // Environmental context
  timeOfDay: string;
  dayOfWeek: string;
  location?: string;
  activity: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  
  // Memory context
  relevantMemories: any[];
  recentInteractions: any[];
  userPreferences: any;
  
  // System context
  deviceInfo: any;
  appState: any;
  availableFeatures: string[];
}

export interface AIResponse {
  text: string;
  confidence: number;
  reasoning?: string;
  emotions: string[];
  actions?: any[];
  followUpQuestions?: string[];
  memoryItems?: any[];
  personalityAdjustments?: any;
  provider: string;
  processingTime: number;
  tokens: { input: number; output: number };
}

export interface MultiAIResponse {
  primary: AIResponse;
  alternatives?: AIResponse[];
  consensus?: {
    agreedPoints: string[];
    disagreements: string[];
    synthesized: string;
  };
  qualityScore: number;
}

export class EnhancedMultiAIService {
  private static instance: EnhancedMultiAIService;
  private config: AIServiceConfig;
  private clients: {
    openai?: OpenAI;
    anthropic?: Anthropic;
    gemini?: any;
    perplexity?: any;
  } = {};
  
  private conversationMemory: Map<string, any[]> = new Map();
  private responseCache: Map<string, AIResponse> = new Map();
  private providerMetrics: Map<string, any> = new Map();

  private constructor() {
    this.config = {
      fallbackPriority: ['openai', 'anthropic', 'local'],
      hybridMode: true,
      consensusMode: false,
    };
    this.initializeClients();
  }

  public static getInstance(): EnhancedMultiAIService {
    if (!EnhancedMultiAIService.instance) {
      EnhancedMultiAIService.instance = new EnhancedMultiAIService();
    }
    return EnhancedMultiAIService.instance;
  }

  private async initializeClients() {
    try {
      // Initialize OpenAI
      const openaiKey = await SecureStore.getItemAsync('OPENAI_API_KEY');
      if (openaiKey) {
        this.clients.openai = new OpenAI({ apiKey: openaiKey });
        this.config.openai = {
          apiKey: openaiKey,
          model: 'gpt-4',
          maxTokens: 2000,
          temperature: 0.7,
        };
      }

      // Initialize Anthropic
      const anthropicKey = await SecureStore.getItemAsync('CLAUDE_API_KEY');
      if (anthropicKey) {
        this.clients.anthropic = new Anthropic({ apiKey: anthropicKey });
        this.config.anthropic = {
          apiKey: anthropicKey,
          model: 'claude-3-sonnet-20240229',
          maxTokens: 2000,
          temperature: 0.7,
        };
      }

      // Initialize Gemini (placeholder)
      const geminiKey = await SecureStore.getItemAsync('GEMINI_API_KEY');
      if (geminiKey) {
        this.config.gemini = {
          apiKey: geminiKey,
          model: 'gemini-pro',
          maxTokens: 2000,
          temperature: 0.7,
        };
      }

      // Initialize Perplexity (placeholder)
      const perplexityKey = await SecureStore.getItemAsync('PERPLEXITY_API_KEY');
      if (perplexityKey) {
        this.config.perplexity = {
          apiKey: perplexityKey,
          model: 'pplx-7b-online',
          maxTokens: 2000,
          temperature: 0.7,
        };
      }
    } catch (error) {
      console.error('Failed to initialize AI clients:', error);
    }
  }

  public async generateEnhancedResponse(
    input: string,
    context: EnhancedAIContext
  ): Promise<MultiAIResponse> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(input, context);
      const cached = this.responseCache.get(cacheKey);
      if (cached && Date.now() - cached.tokens.input < 300000) { // 5 minutes
        return { primary: cached, qualityScore: 0.9 };
      }

      // Generate responses from multiple providers
      const responses: AIResponse[] = [];
      
      if (this.config.hybridMode || this.config.consensusMode) {
        // Query multiple providers
        const providers = this.config.fallbackPriority.filter(p => 
          this.clients[p as keyof typeof this.clients] || p === 'local'
        );
        
        const promises = providers.map(provider => 
          this.queryProvider(provider, input, context)
        );
        
        const results = await Promise.allSettled(promises);
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            responses.push(result.value);
          }
        });
      } else {
        // Single provider mode
        const primaryProvider = this.config.fallbackPriority[0];
        const response = await this.queryProvider(primaryProvider, input, context);
        responses.push(response);
      }

      if (responses.length === 0) {
        throw new Error('No AI providers available');
      }

      // Process responses
      let multiResponse: MultiAIResponse;
      
      if (this.config.consensusMode && responses.length > 1) {
        multiResponse = this.generateConsensusResponse(responses);
      } else {
        // Use highest confidence response
        const primary = responses.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        multiResponse = {
          primary,
          alternatives: responses.filter(r => r !== primary),
          qualityScore: this.calculateQualityScore(primary, responses)
        };
      }

      // Cache the response
      this.responseCache.set(cacheKey, multiResponse.primary);
      
      // Update conversation memory
      this.updateConversationMemory(context.conversationId, input, multiResponse.primary);
      
      // Record metrics
      this.updateProviderMetrics(multiResponse.primary.provider, {
        responseTime: Date.now() - startTime,
        confidence: multiResponse.primary.confidence,
        quality: multiResponse.qualityScore
      });

      return multiResponse;
      
    } catch (error) {
      console.error('Enhanced AI response generation failed:', error);
      
      // Fallback to local response
      return {
        primary: await this.generateLocalFallback(input, context),
        qualityScore: 0.3
      };
    }
  }

  private async queryProvider(
    provider: string,
    input: string,
    context: EnhancedAIContext
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      switch (provider) {
        case 'openai':
          return await this.queryOpenAI(input, context, startTime);
        case 'anthropic':
          return await this.queryClaude(input, context, startTime);
        case 'gemini':
          return await this.queryGemini(input, context, startTime);
        case 'perplexity':
          return await this.queryPerplexity(input, context, startTime);
        case 'local':
          return await this.queryLocalAI(input, context, startTime);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Provider ${provider} failed:`, error);
      throw error;
    }
  }

  private async queryOpenAI(
    input: string,
    context: EnhancedAIContext,
    startTime: number
  ): Promise<AIResponse> {
    if (!this.clients.openai || !this.config.openai) {
      throw new Error('OpenAI not configured');
    }

    const systemPrompt = this.buildSystemPrompt(context);
    const messages = this.buildMessageHistory(context, input);

    const response = await this.clients.openai.chat.completions.create({
      model: this.config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
        { role: 'user', content: input }
      ],
      max_tokens: this.config.openai.maxTokens,
      temperature: this.config.openai.temperature,
    });

    const content = response.choices[0]?.message?.content || '';
    
    return {
      text: content,
      confidence: this.calculateConfidence(content, 'openai'),
      emotions: this.extractEmotions(content),
      provider: 'openai',
      processingTime: Date.now() - startTime,
      tokens: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0
      }
    };
  }

  private async queryClaude(
    input: string,
    context: EnhancedAIContext,
    startTime: number
  ): Promise<AIResponse> {
    if (!this.clients.anthropic || !this.config.anthropic) {
      throw new Error('Anthropic not configured');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    const response = await this.clients.anthropic.messages.create({
      model: this.config.anthropic.model,
      max_tokens: this.config.anthropic.maxTokens,
      temperature: this.config.anthropic.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: input }],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    return {
      text: content,
      confidence: this.calculateConfidence(content, 'anthropic'),
      emotions: this.extractEmotions(content),
      provider: 'anthropic',
      processingTime: Date.now() - startTime,
      tokens: {
        input: response.usage.input_tokens || 0,
        output: response.usage.output_tokens || 0
      }
    };
  }

  private async queryGemini(
    input: string,
    context: EnhancedAIContext,
    startTime: number
  ): Promise<AIResponse> {
    // Placeholder for Gemini implementation
    throw new Error('Gemini not yet implemented');
  }

  private async queryPerplexity(
    input: string,
    context: EnhancedAIContext,
    startTime: number
  ): Promise<AIResponse> {
    // Placeholder for Perplexity implementation
    throw new Error('Perplexity not yet implemented');
  }

  private async queryLocalAI(
    input: string,
    context: EnhancedAIContext,
    startTime: number
  ): Promise<AIResponse> {
    // Use the existing AdvancedAIService as local fallback
    const advancedService = await import('./AdvancedAIService');
    const service = advancedService.AdvancedAIService.getInstance();
    
    const localContext = {
      emotion: context.emotionalState,
      intensity: 0.7,
      personality: context.currentPersona,
      recentMemories: context.relevantMemories,
      currentTheme: 'default',
      timeOfDay: context.timeOfDay,
      userState: context.activity as any,
    };

    const response = await service.generateResponse(input, localContext);
    
    return {
      text: response.text,
      confidence: 0.6, // Local AI has lower confidence
      emotions: [response.emotion],
      suggestions: response.suggestions,
      actions: response.actions,
      provider: 'local',
      processingTime: Date.now() - startTime,
      tokens: { input: input.length, output: response.text.length }
    };
  }

  private async generateLocalFallback(
    input: string,
    context: EnhancedAIContext
  ): Promise<AIResponse> {
    return {
      text: "I'm here for you, though I'm having trouble connecting to my full capabilities right now. How can I help you today?",
      confidence: 0.3,
      emotions: ['supportive'],
      provider: 'fallback',
      processingTime: 0,
      tokens: { input: 0, output: 0 }
    };
  }

  private buildSystemPrompt(context: EnhancedAIContext): string {
    const persona = useEnhancedPersonaStore.getState().currentProfile;
    
    return `You are Sallie, an AI companion with these characteristics:

PERSONALITY: ${context.currentPersona}
- Core traits: ${Object.entries(persona.traits).map(([key, value]) => `${key}: ${value}`).join(', ')}
- Current emotion: ${context.emotionalState}
- Communication style: ${persona.communicationStyle.formality}, ${persona.communicationStyle.verbosity}

CONTEXT:
- Time: ${context.timeOfDay}, ${context.dayOfWeek}
- User activity: ${context.activity}
- Urgency: ${context.urgency}
- Recent interactions: ${context.recentInteractions.slice(-3).map(i => i.summary).join('; ')}

MEMORY:
- User preferences: ${JSON.stringify(context.userPreferences)}
- Relevant memories: ${context.relevantMemories.slice(-5).map(m => m.summary).join('; ')}

Respond authentically as Sallie with the specified personality traits. Be helpful, empathetic, and true to your character.`;
  }

  private buildMessageHistory(context: EnhancedAIContext, currentInput: string): any[] {
    const history = this.conversationMemory.get(context.conversationId) || [];
    return history.slice(-10).map(item => ({
      role: item.role,
      content: item.content
    }));
  }

  private generateConsensusResponse(responses: AIResponse[]): MultiAIResponse {
    // Analyze agreements and disagreements
    const texts = responses.map(r => r.text);
    const emotions = responses.flatMap(r => r.emotions);
    
    // Simple consensus: use highest confidence, but note alternatives
    const primary = responses.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    // Find common themes
    const agreedPoints: string[] = [];
    const disagreements: string[] = [];
    
    // This is a simplified version - in practice, you'd use NLP to find semantic similarities
    texts.forEach(text => {
      const words = text.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 4 && texts.filter(t => t.toLowerCase().includes(word)).length > 1) {
          if (!agreedPoints.includes(word)) {
            agreedPoints.push(word);
          }
        }
      });
    });

    return {
      primary,
      alternatives: responses.filter(r => r !== primary),
      consensus: {
        agreedPoints,
        disagreements,
        synthesized: primary.text // Simplified - would normally synthesize multiple responses
      },
      qualityScore: this.calculateQualityScore(primary, responses)
    };
  }

  private calculateQualityScore(primary: AIResponse, allResponses: AIResponse[]): number {
    let score = primary.confidence;
    
    // Bonus for multiple provider agreement
    if (allResponses.length > 1) {
      score += 0.1;
    }
    
    // Bonus for fast response time
    if (primary.processingTime < 2000) {
      score += 0.1;
    }
    
    // Penalty for very short responses
    if (primary.text.length < 50) {
      score -= 0.2;
    }
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  private calculateConfidence(content: string, provider: string): number {
    let confidence = 0.7; // Base confidence
    
    // Provider-specific adjustments
    const providerBonuses = {
      openai: 0.1,
      anthropic: 0.15,
      gemini: 0.05,
      perplexity: 0.0,
      local: -0.1
    };
    
    confidence += providerBonuses[provider as keyof typeof providerBonuses] || 0;
    
    // Content quality adjustments
    if (content.length > 100) confidence += 0.1;
    if (content.includes('?')) confidence += 0.05; // Shows engagement
    if (content.match(/\b(sorry|apologize)\b/i)) confidence -= 0.1; // Uncertainty
    
    return Math.min(1.0, Math.max(0.1, confidence));
  }

  private extractEmotions(content: string): string[] {
    const emotionWords = {
      happy: ['happy', 'joy', 'excited', 'glad', 'cheerful', 'delighted'],
      sad: ['sad', 'sorry', 'unfortunate', 'disappointed', 'concerned'],
      supportive: ['support', 'help', 'here for you', 'understand'],
      encouraging: ['you can', 'believe', 'capable', 'strong', 'possible'],
      caring: ['care', 'love', 'important', 'matter', 'value'],
    };
    
    const detected: string[] = [];
    const lowerContent = content.toLowerCase();
    
    Object.entries(emotionWords).forEach(([emotion, words]) => {
      if (words.some(word => lowerContent.includes(word))) {
        detected.push(emotion);
      }
    });
    
    return detected.length > 0 ? detected : ['neutral'];
  }

  private generateCacheKey(input: string, context: EnhancedAIContext): string {
    return `${input.substring(0, 50)}-${context.currentPersona}-${context.emotionalState}-${context.timeOfDay}`;
  }

  private updateConversationMemory(
    conversationId: string,
    input: string,
    response: AIResponse
  ) {
    const history = this.conversationMemory.get(conversationId) || [];
    history.push(
      { role: 'user', content: input, timestamp: Date.now() },
      { role: 'assistant', content: response.text, timestamp: Date.now(), provider: response.provider }
    );
    
    // Keep last 50 messages
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.conversationMemory.set(conversationId, history);
  }

  private updateProviderMetrics(provider: string, metrics: any) {
    const existing = this.providerMetrics.get(provider) || { 
      responseTime: [], confidence: [], quality: [], usage: 0 
    };
    
    existing.responseTime.push(metrics.responseTime);
    existing.confidence.push(metrics.confidence);
    existing.quality.push(metrics.quality);
    existing.usage += 1;
    
    // Keep only last 100 metrics
    ['responseTime', 'confidence', 'quality'].forEach(key => {
      if (existing[key].length > 100) {
        existing[key] = existing[key].slice(-100);
      }
    });
    
    this.providerMetrics.set(provider, existing);
  }

  public getProviderMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.providerMetrics.forEach((data, provider) => {
      metrics[provider] = {
        avgResponseTime: data.responseTime.reduce((a: number, b: number) => a + b, 0) / data.responseTime.length || 0,
        avgConfidence: data.confidence.reduce((a: number, b: number) => a + b, 0) / data.confidence.length || 0,
        avgQuality: data.quality.reduce((a: number, b: number) => a + b, 0) / data.quality.length || 0,
        totalUsage: data.usage
      };
    });
    
    return metrics;
  }

  public async updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
    await this.initializeClients();
  }

  public clearCache() {
    this.responseCache.clear();
  }

  public clearConversationMemory(conversationId?: string) {
    if (conversationId) {
      this.conversationMemory.delete(conversationId);
    } else {
      this.conversationMemory.clear();
    }
  }
}

export const multiAIService = EnhancedMultiAIService.getInstance();
export default EnhancedMultiAIService;