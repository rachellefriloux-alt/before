/*
Sallie Persona Module: AdvancedLanguageUnderstanding
Implements sophisticated natural language understanding with context tracking, sentiment analysis,
entity recognition, and conversational context maintenance.
Follows Sallie architecture, modularity, and privacy rules.
*/

interface Entity {
  type: 'person' | 'location' | 'organization' | 'date' | 'number' | 'other';
  value: string;
  confidence: number;
}

interface IntentMatch {
  intent: string;
  confidence: number;
  entities: Entity[];
}

interface SentimentAnalysis {
  primary: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  emotions: {
    joy?: number;
    sadness?: number;
    anger?: number;
    fear?: number;
    surprise?: number;
    disgust?: number;
  };
}

interface ConversationTurn {
  role: 'user' | 'system';
  content: string;
  timestamp: number;
  sentiment?: SentimentAnalysis;
  intent?: IntentMatch;
}

export class AdvancedLanguageUnderstanding {
  private conversations: Map<string, ConversationTurn[]> = new Map();
  private intents: Map<string, {patterns: string[], entities: string[]}> = new Map();
  
  constructor() {
    this.initializeIntents();
  }
  
  /**
   * Initialize built-in intent recognition patterns
   */
  private initializeIntents(): void {
    this.intents.set('help_request', {
      patterns: ['help', 'assist', 'support', 'guide', 'how to'],
      entities: ['topic', 'action']
    });
    
    this.intents.set('task_execution', {
      patterns: ['do', 'execute', 'run', 'perform', 'automate'],
      entities: ['task', 'when', 'how']
    });
    
    this.intents.set('information_request', {
      patterns: ['what is', 'who is', 'where is', 'when is', 'why is', 'how is'],
      entities: ['subject', 'context']
    });
    
    // Add more intents as needed
  }
  
  /**
   * Add a conversation turn to history
   */
  addConversationTurn(userId: string, role: 'user' | 'system', content: string): void {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    
    const turn: ConversationTurn = {
      role,
      content,
      timestamp: Date.now()
    };
    
    if (role === 'user') {
      turn.sentiment = this.analyzeSentiment(content);
      turn.intent = this.recognizeIntent(content);
    }
    
    this.conversations.get(userId)?.push(turn);
    
    // Limit conversation history
    const history = this.conversations.get(userId) || [];
    if (history.length > 50) {
      this.conversations.set(userId, history.slice(-50));
    }
  }
  
  /**
   * Get recent conversation history
   */
  getConversationHistory(userId: string, turns: number = 10): ConversationTurn[] {
    const history = this.conversations.get(userId) || [];
    return history.slice(-turns);
  }
  
  /**
   * Analyze sentiment of text
   */
  analyzeSentiment(text: string): SentimentAnalysis {
    // Simple sentiment analysis implementation
    const lowerText = text.toLowerCase();
    
    // Positive words
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'happy', 'enjoy', 'thanks', 'thank you', 'appreciate'];
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    
    // Negative words
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'frustrated', 'disappointed', 'annoying', 'problem'];
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    // Calculate score
    const totalWords = text.split(/\s+/).length;
    const score = (positiveCount - negativeCount) / Math.max(1, Math.min(totalWords / 2, 5));
    
    // Determine primary sentiment
    let primary: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (score > 0.2) primary = 'positive';
    else if (score < -0.2) primary = 'negative';
    
    // Detect emotions
    const emotions: SentimentAnalysis['emotions'] = {};
    
    if (lowerText.match(/happy|joy|delighted|glad|pleased/)) emotions.joy = 0.7;
    if (lowerText.match(/sad|unhappy|depressed|down|upset/)) emotions.sadness = 0.7;
    if (lowerText.match(/angry|mad|furious|annoyed|irritated/)) emotions.anger = 0.7;
    if (lowerText.match(/scared|afraid|worried|nervous|anxious/)) emotions.fear = 0.7;
    if (lowerText.match(/surprised|shocked|amazed|astonished/)) emotions.surprise = 0.7;
    if (lowerText.match(/disgust|gross|repulsed|yuck/)) emotions.disgust = 0.7;
    
    return {
      primary,
      score: Math.max(-1, Math.min(1, score)),
      emotions
    };
  }
  
  /**
   * Recognize intent from text
   */
  recognizeIntent(text: string): IntentMatch | undefined {
    const lowerText = text.toLowerCase();
    
    let bestMatch: IntentMatch | undefined;
    let highestScore = 0;
    
    this.intents.forEach((intentData, intentName) => {
      const patterns = intentData.patterns;
      
      // Check how many patterns match
      const matchCount = patterns.filter(pattern => lowerText.includes(pattern)).length;
      if (matchCount === 0) return;
      
      const score = matchCount / patterns.length;
      
      if (score > highestScore) {
        highestScore = score;
        
        // Extract entities
        const entities: Entity[] = [];
        
        // Simple entity extraction (could be more sophisticated)
        intentData.entities.forEach(entityType => {
          // Very basic extraction - would be more advanced in real implementation
          const words = lowerText.split(/\s+/);
          const potentialEntities = words.filter(w => w.length > 3);
          
          if (potentialEntities.length > 0) {
            entities.push({
              type: 'other',
              value: potentialEntities[0],
              confidence: 0.6
            });
          }
        });
        
        bestMatch = {
          intent: intentName,
          confidence: score,
          entities
        };
      }
    });
    
    return bestMatch;
  }
  
  /**
   * Detect topics in conversation history
   */
  detectConversationTopics(userId: string): string[] {
    const history = this.conversations.get(userId) || [];
    if (history.length === 0) return [];
    
    // Combine recent messages
    const recentContent = history.slice(-5)
      .filter(turn => turn.role === 'user')
      .map(turn => turn.content)
      .join(' ');
    
    // Extract key terms (simple implementation)
    const words = recentContent.toLowerCase().split(/\W+/);
    const wordCounts: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    // Get top words as topics
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  }
}
