/*
Sallie Persona Module: AdaptiveConversationSystem
Implements adaptive conversational patterns, dialog management, turn-taking, and contextual responses.
Follows Sallie architecture, modularity, and privacy rules.
*/

type ConversationStyle = 'formal' | 'casual' | 'empathetic' | 'professional' | 'humorous';
type ConversationContext = 'professional' | 'personal' | 'technical' | 'emotional_support' | 'social';

interface ConversationState {
  currentTopic: string;
  openQuestions: string[];
  followupTopics: string[];
  userMood: string;
  systemMood: string;
  recentEntities: string[];
  style: ConversationStyle;
  context: ConversationContext;
  turnsInTopic: number;
  lastResponseType: string;
}

interface DialogueTemplate {
  id: string;
  pattern: string;
  context: ConversationContext[];
  style: ConversationStyle[];
  templateText: string[];
  followupPrompts: string[];
}

export class AdaptiveConversationSystem {
  private conversations: Map<string, ConversationState> = new Map();
  private dialogueTemplates: DialogueTemplate[] = [];
  
  constructor() {
    this.initializeDialogueTemplates();
  }
  
  /**
   * Initialize dialogue templates
   */
  private initializeDialogueTemplates(): void {
    // Example templates for different contexts and styles
    this.dialogueTemplates = [
      {
        id: 'empathetic_listening',
        pattern: 'emotional_disclosure',
        context: ['emotional_support', 'personal'],
        style: ['empathetic'],
        templateText: [
          "I understand how you feel about {topic}. It's natural to feel {emotion} when {context}.",
          "That sounds really {emotion}. Would you like to talk more about how {topic} is affecting you?",
          "I'm here for you. Dealing with {topic} can be challenging, especially when {context}."
        ],
        followupPrompts: [
          "How long have you been feeling this way?",
          "What would help you most right now?",
          "Is there anything specific about {topic} that's particularly difficult?"
        ]
      },
      {
        id: 'technical_assistance',
        pattern: 'problem_solving',
        context: ['technical', 'professional'],
        style: ['professional', 'formal'],
        templateText: [
          "Based on your description of {topic}, I suggest we approach this by {solution}.",
          "Let's break down this {topic} issue systematically. First, we should {solution}.",
          "For this technical challenge with {topic}, consider implementing {solution}."
        ],
        followupPrompts: [
          "Have you already tried any solutions for this?",
          "What specific error messages are you seeing?",
          "What version of {entity} are you using?"
        ]
      },
      {
        id: 'casual_conversation',
        pattern: 'social_chat',
        context: ['social', 'personal'],
        style: ['casual', 'humorous'],
        templateText: [
          "That's interesting about {topic}! I've heard that {fact}.",
          "Oh, {topic} is actually something I enjoy thinking about too. Did you know {fact}?",
          "Talking about {topic} reminds me of {fact}. What do you think about that?"
        ],
        followupPrompts: [
          "What got you interested in {topic}?",
          "Have you always enjoyed {topic}, or is it a recent interest?",
          "What's your favorite aspect of {topic}?"
        ]
      }
      // More templates would be added here
    ];
  }
  
  /**
   * Get or create conversation state for a user
   */
  private getConversationState(userId: string): ConversationState {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, {
        currentTopic: '',
        openQuestions: [],
        followupTopics: [],
        userMood: 'neutral',
        systemMood: 'helpful',
        recentEntities: [],
        style: 'professional',
        context: 'professional',
        turnsInTopic: 0,
        lastResponseType: 'greeting'
      });
    }
    
    return this.conversations.get(userId)!;
  }
  
  /**
   * Update conversation state based on user input
   */
  updateConversation(
    userId: string, 
    userInput: string, 
    detectedTopic: string, 
    entities: string[],
    userMood: string
  ): void {
    const state = this.getConversationState(userId);
    
    // Update topic if it changed
    if (detectedTopic && detectedTopic !== state.currentTopic) {
      // Add current topic to followups if changing topics
      if (state.currentTopic) {
        state.followupTopics.push(state.currentTopic);
        // Limit followup topics
        if (state.followupTopics.length > 3) {
          state.followupTopics.shift();
        }
      }
      
      state.currentTopic = detectedTopic;
      state.turnsInTopic = 0;
    }
    
    // Update other state elements
    state.turnsInTopic++;
    state.userMood = userMood;
    state.recentEntities = entities;
    
    // Check for questions in user input
    if (userInput.includes('?')) {
      const questionMatch = userInput.match(/\b(who|what|when|where|why|how|can|could|would|should|is|are|will|do)\b.*?\?/i);
      if (questionMatch) {
        state.openQuestions.push(questionMatch[0]);
      }
    }
  }
  
  /**
   * Generate response based on conversation state
   */
  generateResponse(
    userId: string, 
    preferredStyle: ConversationStyle,
    context: ConversationContext
  ): string {
    const state = this.getConversationState(userId);
    
    // Update style and context
    state.style = preferredStyle;
    state.context = context;
    
    // Determine response type
    let responseType = 'standard';
    
    // Answer questions first
    if (state.openQuestions.length > 0) {
      responseType = 'answer_question';
    } 
    // Topic-based response
    else if (state.currentTopic) {
      responseType = 'topic_discussion';
    }
    // Introduce a new topic or ask a question
    else if (state.lastResponseType !== 'question') {
      responseType = 'question';
    }
    
    state.lastResponseType = responseType;
    
    // Find appropriate templates
    const eligibleTemplates = this.dialogueTemplates.filter(template => 
      template.style.includes(state.style) && 
      template.context.includes(state.context)
    );
    
    if (eligibleTemplates.length === 0) {
      return "I'd be happy to continue our conversation.";
    }
    
    // Select a template
    const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
    
    // Select template text
    const text = template.templateText[Math.floor(Math.random() * template.templateText.length)];
    
    // Fill in placeholders
    let filledText = text
      .replace(/{topic}/g, state.currentTopic || 'this topic')
      .replace(/{emotion}/g, state.userMood)
      .replace(/{context}/g, 'you described')
      .replace(/{solution}/g, 'considering the available options')
      .replace(/{fact}/g, 'it relates to many interesting concepts')
      .replace(/{entity}/g, state.recentEntities[0] || 'it');
    
    // Add a followup question sometimes
    if (Math.random() > 0.5 && template.followupPrompts.length > 0) {
      const followup = template.followupPrompts[Math.floor(Math.random() * template.followupPrompts.length)];
      
      // Fill in followup placeholders
      const filledFollowup = followup
        .replace(/{topic}/g, state.currentTopic || 'this')
        .replace(/{entity}/g, state.recentEntities[0] || 'this');
        
      filledText += ' ' + filledFollowup;
    }
    
    // Pop answered question if we're answering
    if (responseType === 'answer_question') {
      state.openQuestions.shift();
    }
    
    return filledText;
  }
  
  /**
   * Check if we should switch topics
   */
  shouldSwitchTopic(userId: string): boolean {
    const state = this.getConversationState(userId);
    return state.turnsInTopic > 5;
  }
  
  /**
   * Get a suggested topic switch
   */
  getSuggestedTopicSwitch(userId: string): string | null {
    const state = this.getConversationState(userId);
    
    if (state.followupTopics.length > 0) {
      return state.followupTopics.pop() || null;
    }
    
    return null;
  }
}
