/*
Sallie Persona Module: EnhancedHumanizedOrchestrator
Enhanced orchestrator that integrates all advanced systems: memory, language, relationships, conversations.
Follows Sallie architecture, modularity, and privacy rules.
*/

import { AdvancedMemorySystem } from './AdvancedMemorySystem';
import { AdvancedLanguageUnderstanding } from './AdvancedLanguageUnderstanding';
import { RelationshipTrustSystem } from './RelationshipTrustSystem';
import { AdaptiveConversationSystem } from './AdaptiveConversationSystem';

import { CognitiveModule } from './CognitiveModule';
import { EmotionalIntelligenceModule } from './EmotionalIntelligenceModule';
import { TechnicalProwessModule } from './TechnicalProwessModule';
import { ProactiveHelperModule } from './ProactiveHelperModule';
import { PersonalizationModule } from './PersonalizationModule';

export class EnhancedHumanizedOrchestrator {
  // Advanced systems
  private memory: AdvancedMemorySystem;
  private language: AdvancedLanguageUnderstanding;
  private relationship: RelationshipTrustSystem;
  private conversation: AdaptiveConversationSystem;
  
  // Original modules
  private cognitive: CognitiveModule;
  private emotional: EmotionalIntelligenceModule;
  private technical: TechnicalProwessModule;
  private proactive: ProactiveHelperModule;
  private personalization: PersonalizationModule;
  
  constructor() {
    // Initialize advanced systems
    this.memory = new AdvancedMemorySystem();
    this.language = new AdvancedLanguageUnderstanding();
    this.relationship = new RelationshipTrustSystem();
    this.conversation = new AdaptiveConversationSystem();
    
    // Initialize original modules
    this.cognitive = new CognitiveModule();
    this.emotional = new EmotionalIntelligenceModule();
    this.technical = new TechnicalProwessModule();
    this.proactive = new ProactiveHelperModule();
    this.personalization = new PersonalizationModule();
    
    // Set default technical permissions
    this.technical.setPermissions('default', ['read']);
    
    // Process relationship trust decay once a day
    setInterval(() => this.relationship.processTrustDecay(), 24 * 60 * 60 * 1000);
  }
  
  /**
   * Process user input with enhanced capabilities
   */
  async processInput(userId: string, input: string): Promise<string> {
    // Track interaction in language system
    this.language.addConversationTurn(userId, 'user', input);
    
    // Analyze sentiment and intent
    const sentiment = this.language.analyzeSentiment(input);
    const intent = this.language.recognizeIntent(input);
    
    // Extract topics and entities
    const topics = this.language.detectConversationTopics(userId);
    const mainTopic = topics.length > 0 ? topics[0] : '';
    const entities = intent?.entities.map(e => e.value) || [];
    
    // Update conversation state
    this.conversation.updateConversation(
      userId,
      input,
      mainTopic,
      entities,
      sentiment.primary
    );
    
    // Store in memory system
    const memoryId = this.memory.storeMemory(
      userId,
      { input, sentiment, intent, topic: mainTopic },
      'short-term',
      [mainTopic, ...entities, sentiment.primary],
      sentiment.primary === 'neutral' ? 5 : 8
    );
    
    // Get relationship context
    const relationshipStatus = this.relationship.getRelationshipStatus(userId);
    const preferredStyle = this.relationship.getAppropriateStyle(userId) as any;
    const trustModifiers = this.relationship.getTrustModifiers(userId);
    
    // Retrieve relevant memories
    const relevantMemories = this.memory.retrieveByContext(userId, input);
    
    // Determine if we should switch topics
    let shouldSwitchTopic = this.conversation.shouldSwitchTopic(userId);
    
    // Choose response approach based on all available context
    let response: string;
    
    // Handle intent-based responses
    if (intent && intent.confidence > 0.7) {
      if (intent.intent === 'help_request') {
        response = this.cognitive.solveProblem(input, { userId, memories: relevantMemories });
        this.relationship.recordPositiveInteraction(userId, 'Provided help', 2);
      }
      else if (intent.intent === 'task_execution') {
        response = this.technical.automateTask(input, userId);
        this.relationship.recordPositiveInteraction(userId, 'Completed task', 3);
      }
      else if (intent.intent === 'information_request') {
        const infoResponse = this.generateInformationResponse(userId, input, relevantMemories);
        response = infoResponse;
        this.relationship.recordPositiveInteraction(userId, 'Provided information', 1);
      }
      else {
        // Fall through to conversation-based response
        response = this.generateConversationalResponse(userId, preferredStyle);
      }
    }
    // Handle emotional responses
    else if (sentiment.primary !== 'neutral' && Math.abs(sentiment.score) > 0.5) {
      if (sentiment.primary === 'negative') {
        response = this.emotional.respondWithEmpathy(input);
        this.relationship.recordPositiveInteraction(userId, 'Provided emotional support', 2);
      } else {
        response = this.generatePositiveResponse(userId, sentiment);
        this.relationship.recordPositiveInteraction(userId, 'Shared positive moment', 1);
      }
    }
    // Standard conversational response
    else {
      response = this.generateConversationalResponse(userId, preferredStyle);
    }
    
    // Add proactive elements if appropriate
    if (trustModifiers.shouldOfferHelp && Math.random() > 0.7) {
      const suggestion = this.proactive.suggestNextAction();
      response += ` ${suggestion}`;
    }
    
    // Store system response in conversation history
    this.language.addConversationTurn(userId, 'system', response);
    
    // Store in memory system
    this.memory.storeMemory(
      userId,
      { response, relatedToMemory: memoryId },
      'short-term',
      [mainTopic, ...entities],
      4
    );
    
    // Log the interaction
    this.cognitive.logInteraction(userId, input, response);
    
    return response;
  }
  
  /**
   * Generate a response for information requests
   */
  private generateInformationResponse(userId: string, query: string, memories: any[]): string {
    // Use memories if available
    if (memories.length > 0) {
      return `Based on what I recall about this, ${memories[0].content.input || 'I can tell you that this relates to some previous conversations we\'ve had.'}`;
    }
    
    return `That's an interesting question about ${query.substring(0, 20)}... Let me think about that.`;
  }
  
  /**
   * Generate a positive response to match user's positive sentiment
   */
  private generatePositiveResponse(userId: string, sentiment: any): string {
    if (sentiment.emotions.joy) {
      return "I'm happy to see you're in good spirits! That's wonderful.";
    }
    return "It's great to hear such positivity! That's fantastic.";
  }
  
  /**
   * Generate a conversational response
   */
  private generateConversationalResponse(userId: string, preferredStyle: any): string {
    // Determine conversation context from user profile
    const userProfile = this.personalization.personalizeResponse(userId, '');
    const context = userProfile.includes('formal') ? 'professional' : 'personal';
    
    return this.conversation.generateResponse(userId, preferredStyle, context as any);
  }
  
  /**
   * Process feedback to improve over time
   */
  processFeedback(userId: string, feedback: string, rating: number): void {
    // Update relationship based on rating
    if (rating > 3) {
      this.relationship.recordPositiveInteraction(userId, 'Positive feedback', rating - 3);
    } else if (rating < 3) {
      this.relationship.recordNegativeInteraction(userId, 'Negative feedback', 3 - rating);
    }
    
    // Learn from feedback
    this.cognitive.adaptResponse(userId, feedback);
    
    // Update personalization
    this.personalization.updateProfile(userId, 'feedback', { text: feedback, rating });
    
    // Store in memory
    this.memory.storeMemory(
      userId,
      { feedback, rating },
      'episodic',
      ['feedback', rating > 3 ? 'positive' : rating < 3 ? 'negative' : 'neutral'],
      Math.abs(rating - 3) + 3
    );
  }
  
  /**
   * Get a summary of user relationship
   */
  getUserRelationshipSummary(userId: string): any {
    return {
      trustLevel: this.relationship.getRelationshipStatus(userId).trustScore,
      conversationHistory: this.language.getConversationHistory(userId, 3),
      memories: this.memory.getEpisodicTimeline(userId, 5),
      preferences: this.personalization.personalizeResponse(userId, '')
    };
  }
}
