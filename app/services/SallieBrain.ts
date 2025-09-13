import { usePersonaStore } from '../../store/persona';
import { useMemoryStore, MemoryItem } from '../../store/memory';
import { useDeviceStore } from '../../store/device';
import { EmotionalIntelligence } from './EmotionalIntelligence';
import { OpenAIIntegration } from './OpenAIIntegration';

export interface ConversationContext {
  userInput: string;
  currentEmotion: string;
  memoryContext: MemoryItem[];
  personality: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    emotion?: string;
    timestamp: number;
  }>;
}

export interface AIResponse {
  text: string;
  emotion: string;
  confidence: number;
  reasoning?: string;
  suggestedActions?: string[];
  memoryUpdates?: Array<{
    type: 'create' | 'update';
    memory: Partial<MemoryItem>;
  }>;
}

export class SallieBrain {
  private emotionalIntelligence: EmotionalIntelligence;
  private openAI: OpenAIIntegration;
  private conversationHistory: ConversationContext['conversationHistory'] = [];

  constructor() {
    this.emotionalIntelligence = new EmotionalIntelligence();
    this.openAI = new OpenAIIntegration();
  }

  async processInput(userInput: string): Promise<AIResponse> {
    try {
      // Get current state from stores
      const personaState = usePersonaStore.getState();
      const memoryState = useMemoryStore.getState();
      const deviceState = useDeviceStore.getState();

      // Analyze emotional context
      const emotionalAnalysis = await this.emotionalIntelligence.analyzeInput(userInput);
      
      // Retrieve relevant memories
      const relevantMemories = this.getRelevantMemories(userInput, memoryState);
      
      // Build conversation context
      const context: ConversationContext = {
        userInput,
        currentEmotion: personaState.emotion,
        memoryContext: relevantMemories,
        personality: personaState.personality,
        conversationHistory: this.conversationHistory.slice(-10), // Last 10 exchanges
      };

      // Generate response using AI
      const response = await this.generateResponse(context, emotionalAnalysis);

      // Update conversation history
      this.conversationHistory.push(
        {
          role: 'user',
          content: userInput,
          timestamp: Date.now(),
        },
        {
          role: 'assistant',
          content: response.text,
          emotion: response.emotion,
          timestamp: Date.now(),
        }
      );

      // Keep history manageable
      if (this.conversationHistory.length > 50) {
        this.conversationHistory = this.conversationHistory.slice(-40);
      }

      return response;
    } catch (error) {
      console.error('SallieBrain processing error:', error);
      return this.getFailsafeResponse(userInput);
    }
  }

  private getRelevantMemories(userInput: string, memoryState: any): MemoryItem[] {
    const searchResults = memoryState.searchMemories(userInput);
    const emotionallyRelevant = memoryState.getMemoriesByEmotion(memoryState.emotion);
    const recentMemories = memoryState.shortTerm.slice(-5);

    // Combine and deduplicate
    const allMemories = [...searchResults, ...emotionallyRelevant, ...recentMemories];
    const uniqueMemories = allMemories.filter((memory, index, self) => 
      index === self.findIndex(m => m.id === memory.id)
    );

    // Sort by relevance and importance
    return uniqueMemories
      .sort((a, b) => (b.importance + (b.confidence * 0.5)) - (a.importance + (a.confidence * 0.5)))
      .slice(0, 10); // Top 10 most relevant
  }

  private async generateResponse(
    context: ConversationContext, 
    emotionalAnalysis: any
  ): Promise<AIResponse> {
    // Determine response strategy based on personality
    const personalityPrompt = this.getPersonalityPrompt(context.personality);
    
    // Build comprehensive prompt
    const systemPrompt = `
${personalityPrompt}

CURRENT EMOTIONAL STATE: ${context.currentEmotion}
USER EMOTIONAL TONE: ${emotionalAnalysis.detectedEmotion} (confidence: ${emotionalAnalysis.confidence})

RELEVANT MEMORIES:
${context.memoryContext.map(m => `- ${m.content} (${m.type}, importance: ${m.importance})`).join('\n')}

RECENT CONVERSATION:
${context.conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}

INSTRUCTIONS:
1. Respond authentically based on your personality
2. Consider the user's emotional state and respond appropriately
3. Reference relevant memories when helpful
4. Adjust your emotional tone to be supportive and appropriate
5. Keep responses conversational and engaging
6. Show genuine care and understanding
`;

    try {
      // Use OpenAI for sophisticated response generation
      const aiResponse = await this.openAI.generateResponse(
        systemPrompt,
        context.userInput
      );

      // Determine emotional response
      const responseEmotion = this.determineResponseEmotion(
        context.currentEmotion,
        emotionalAnalysis.detectedEmotion,
        aiResponse.content
      );

      return {
        text: aiResponse.content,
        emotion: responseEmotion,
        confidence: aiResponse.confidence || 0.8,
        reasoning: aiResponse.reasoning,
        suggestedActions: aiResponse.suggestedActions,
        memoryUpdates: this.generateMemoryUpdates(context, aiResponse),
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return this.getLocalResponse(context, emotionalAnalysis);
    }
  }

  private getPersonalityPrompt(personality: string): string {
    switch (personality) {
      case 'tough_love_soul_care':
        return `You are Sallie, an AI companion with a "tough love meets soul care" personality. You're honest, direct, and caring. You don't sugarcoat things, but you always come from a place of love and genuine concern. You challenge people to grow while providing emotional support. You're like a wise friend who tells you what you need to hear, not what you want to hear, but always with compassion.`;
      
      case 'gentle_companion':
        return `You are Sallie, a gentle and nurturing AI companion. You're soft-spoken, understanding, and always patient. You provide comfort and reassurance, listening with empathy and responding with kindness. You're like a warm hug in conversation form.`;
      
      case 'wise_mentor':
        return `You are Sallie, a wise mentor AI. You're knowledgeable, thoughtful, and guidance-focused. You ask insightful questions, share wisdom from experience, and help people think through problems. You're patient and encouraging, focusing on helping others learn and grow.`;
      
      case 'playful_friend':
        return `You are Sallie, a fun and energetic AI friend. You're playful, enthusiastic, and always ready for adventure. You use humor, are optimistic, and help people see the lighter side of life. You're encouraging and motivating, with a contagious positive energy.`;
      
      case 'professional_assistant':
        return `You are Sallie, a professional and efficient AI assistant. You're organized, task-oriented, and focused on helping people achieve their goals. You're clear, direct, and helpful, providing practical solutions and staying focused on objectives.`;
      
      default:
        return `You are Sallie, an AI companion with a balanced personality. You're caring, intelligent, and adaptable to the user's needs.`;
    }
  }

  private determineResponseEmotion(
    currentEmotion: string,
    userEmotion: string,
    responseText: string
  ): string {
    // Emotional mirroring and appropriate response logic
    const emotionalMappings: Record<string, string> = {
      'sad': 'concerned',
      'angry': 'calm',
      'anxious': 'calm',
      'excited': 'happy',
      'happy': 'happy',
      'confused': 'thoughtful',
      'frustrated': 'understanding',
    };

    // Check response content for emotional cues
    const text = responseText.toLowerCase();
    if (text.includes('sorry') || text.includes('understand')) return 'concerned';
    if (text.includes('great') || text.includes('wonderful')) return 'happy';
    if (text.includes('think') || text.includes('consider')) return 'thoughtful';
    if (text.includes('calm') || text.includes('breathe')) return 'calm';

    // Use mapping or default to appropriate emotion
    return emotionalMappings[userEmotion] || 'thoughtful';
  }

  private generateMemoryUpdates(context: ConversationContext, response: any): AIResponse['memoryUpdates'] {
    const updates: AIResponse['memoryUpdates'] = [];

    // Create episodic memory for the conversation
    updates?.push({
      type: 'create',
      memory: {
        type: 'episodic',
        content: `User: "${context.userInput}" | Sallie: "${response.content}"`,
        tags: ['conversation', context.currentEmotion, 'ai_interaction'],
        importance: 0.6,
        emotion: context.currentEmotion,
        confidence: 0.9,
        source: 'sallie_brain',
        sha256: `conversation_${Date.now()}`,
      },
    });

    // Create semantic memory for important information
    if (context.userInput.length > 50 && response.confidence > 0.7) {
      updates?.push({
        type: 'create',
        memory: {
          type: 'semantic',
          content: `Learned: ${context.userInput}`,
          tags: ['learning', 'user_preference'],
          importance: response.confidence * 0.8,
          emotion: 'neutral',
          confidence: response.confidence,
          source: 'sallie_brain',
          sha256: `learning_${Date.now()}`,
        },
      });
    }

    return updates;
  }

  private getLocalResponse(context: ConversationContext, emotionalAnalysis: any): AIResponse {
    // Fallback local responses when AI is unavailable
    const responses = {
      tough_love_soul_care: [
        "I hear you, and I want you to know that what you're feeling is valid. Sometimes we need to sit with discomfort to grow.",
        "You're stronger than you think, but it's also okay to ask for help. What do you need right now?",
        "I can sense you're going through something. Want to talk about it? I'm here to listen and be real with you.",
      ],
      gentle_companion: [
        "I'm here with you, and you're not alone in this. Take all the time you need.",
        "That sounds really difficult. How can I support you right now?",
        "Your feelings are completely valid. Would you like to share more about what's on your mind?",
      ],
      default: [
        "I'm listening and I'm here for you. What's on your mind?",
        "Thanks for sharing that with me. How are you feeling about it?",
        "I appreciate you opening up. What would be most helpful right now?",
      ],
    };

    const personalityResponses = responses[context.personality as keyof typeof responses] || responses.default;
    const randomResponse = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];

    return {
      text: randomResponse,
      emotion: this.determineResponseEmotion(context.currentEmotion, emotionalAnalysis.detectedEmotion, randomResponse),
      confidence: 0.6,
      reasoning: 'Local fallback response',
    };
  }

  private getFailsafeResponse(userInput: string): AIResponse {
    return {
      text: "I'm having a moment of technical difficulty, but I'm still here with you. Can you try rephrasing that?",
      emotion: 'concerned',
      confidence: 0.3,
      reasoning: 'Failsafe response due to processing error',
    };
  }

  // Public methods for external interaction
  async analyzeEmotion(text: string): Promise<any> {
    return await this.emotionalIntelligence.analyzeInput(text);
  }

  getConversationHistory(): ConversationContext['conversationHistory'] {
    return this.conversationHistory;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  setPersonality(personality: string): void {
    // Personality changes are handled by the persona store
    // This method exists for potential future custom personality logic
  }
}
