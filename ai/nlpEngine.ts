/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - The Personal AI Companion That Truly Gets You                     │
 * │                                                                              │
 * │   Sallie is gentle, creative, and deeply empathetic. She understands         │
 * │   the human experience from literature and art, not just data.               │
 * │   Her goal is to help you explore your world, care for yourself,             │
 * │   and find your own answers through thoughtful conversation.                 │
 * │                                                                              │
 * │   - Genuine & Balanced: Honest but tactfully optimistic                      │
 * │   - Warm & Personal: Remembers your details, references shared history       │
 * │   - Contemplative: Considers questions deeply before responding              │
 * │   - Encouraging: Helps you develop your thoughts rather than imposing hers   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Advanced Natural Language Processing Engine for Sallie
// Provides sentiment analysis, intent detection, entity extraction, and context understanding

import { MoodSignal } from './moodSignal';

// Types for sentiment analysis result
export type SentimentAnalysisResult = {
  primaryEmotion: string;
  emotionalIntensity: number; // 0-1 scale
  secondaryEmotions: string[];
  valence: 'positive' | 'negative' | 'neutral';
  arousal: 'high' | 'medium' | 'low';
  confidence: number; // 0-1 scale
};

// Type for entity extraction result
export type EntityExtractionResult = {
  entities: Entity[];
  namedEntities: NamedEntity[];
  topics: string[];
  confidence: number; // 0-1 scale
};

// Type for intent detection result
export type IntentDetectionResult = {
  primaryIntent: string;
  confidence: number; // 0-1 scale
  parameters: Record<string, any>;
  alternativeIntents: Array<{intent: string, confidence: number}>;
};

// Entity types in the text
export type Entity = {
  text: string;
  type: 'person' | 'location' | 'organization' | 'date' | 'time' | 'number' | 'device' | 'app' | 'other';
  startIndex: number;
  endIndex: number;
  confidence: number;
};

// Named entity with additional properties
export type NamedEntity = Entity & {
  normalizedValue?: any;
  metadata?: Record<string, any>;
};

// Intent structure for device commands
export type DeviceIntent = {
  action: string;
  parameters: Record<string, string>;
  confidence: number;
}

// Advanced conversation context tracking
export type ConversationContext = {
  previousTopics: string[];
  userPreferences: Record<string, any>;
  emotionalHistory: Array<{
      primaryEmotion: any;emotion: string, timestamp: Date
}>;
  conversationFlow: 'introduction' | 'deepening' | 'resolution' | 'transition';
  lastInteractionTime: Date;
  interactionCount: number;
};

// Enhanced emotion recognition with more nuanced categories
export type EnhancedSentimentResult = SentimentAnalysisResult & {
  emotionalComplexity: 'simple' | 'mixed' | 'complex';
  emotionalLayers: Array<{emotion: string, intensity: number, layer: 'surface' | 'underlying' | 'contextual'}>;
  emotionalTrajectory: 'stable' | 'escalating' | 'de-escalating' | 'fluctuating';
  contextualFactors: string[];
};

// Advanced intent classification
export type AdvancedIntentResult = IntentDetectionResult & {
  subIntent: string;
  intentHierarchy: string[];
  conversationalGoal: 'information' | 'action' | 'emotional_support' | 'social' | 'exploratory';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  timeSensitivity: boolean;
};

/**
 * Perform advanced sentiment analysis on text
 * Detects emotions, intensity, valence, and arousal
 */
export function analyzeSentiment(text: string): SentimentAnalysisResult {
  // Base word sets for emotion detection
  const negativeWords = {
    'sad': 0.7, 'angry': 0.8, 'upset': 0.6, 'worried': 0.5, 
    'frustrated': 0.65, 'overwhelmed': 0.7, 'stressed': 0.6, 
    'hurt': 0.75, 'fear': 0.8, 'anxious': 0.6, 'lonely': 0.7,
    'disappointed': 0.5, 'irritated': 0.4, 'depressed': 0.9,
    'miserable': 0.8, 'grief': 0.9, 'regret': 0.6
  };
  
  const positiveWords = {
    'happy': 0.7, 'joy': 0.8, 'excited': 0.8, 'celebrate': 0.7, 
    'win': 0.6, 'optimistic': 0.5, 'love': 0.9, 'peace': 0.6, 
    'grateful': 0.7, 'proud': 0.6, 'hopeful': 0.5, 'pleased': 0.4,
    'delighted': 0.8, 'content': 0.5, 'satisfied': 0.6,
    'cheerful': 0.7, 'thrilled': 0.9, 'calm': 0.4
  };
  
  // Intensity modifiers
  const intensifiers: Record<string, number> = {
    'very': 1.3, 'extremely': 1.5, 'really': 1.2, 'so': 1.2,
    'incredibly': 1.4, 'utterly': 1.5, 'absolutely': 1.4,
    'completely': 1.3, 'totally': 1.3
  };
  
  const diminishers: Record<string, number> = {
    'somewhat': 0.8, 'slightly': 0.7, 'a bit': 0.8, 'a little': 0.8,
    'kind of': 0.7, 'sort of': 0.7, 'barely': 0.5, 'hardly': 0.6
  };
  
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/).filter(word => word.length > 1);
  
  // Initialize variables for analysis
  let primaryEmotion = 'neutral';
  let primaryIntensity = 0;
  let valence: 'positive' | 'negative' | 'neutral' = 'neutral';
  let arousal: 'high' | 'medium' | 'low' = 'medium';
  let secondaryEmotions: string[] = [];
  
  // Check for emotion words and their intensity
  words.forEach((word, index) => {
    // Check negative emotions
    for (const [emotion, baseIntensity] of Object.entries(negativeWords)) {
      if (word.includes(emotion)) {
        let intensity = baseIntensity;
        
        // Check for intensifiers before this word
        if (index > 0) {
          const prevWord = words[index - 1];
          if (prevWord in intensifiers) intensity *= intensifiers[prevWord];
          if (prevWord in diminishers) intensity *= diminishers[prevWord];
        }
        
        if (intensity > primaryIntensity) {
          if (primaryEmotion !== 'neutral') {
            secondaryEmotions.push(primaryEmotion);
          }
          primaryEmotion = emotion;
          primaryIntensity = intensity;
          valence = 'negative';
        } else if (emotion !== primaryEmotion) {
          secondaryEmotions.push(emotion);
        }
      }
    }
    
    // Check positive emotions
    for (const [emotion, baseIntensity] of Object.entries(positiveWords)) {
      if (word.includes(emotion)) {
        let intensity = baseIntensity;
        
        // Check for intensifiers before this word
        if (index > 0) {
          const prevWord = words[index - 1];
          if (prevWord in intensifiers) intensity *= intensifiers[prevWord];
          if (prevWord in diminishers) intensity *= diminishers[prevWord];
        }
        
        if (intensity > primaryIntensity) {
          if (primaryEmotion !== 'neutral') {
            secondaryEmotions.push(primaryEmotion);
          }
          primaryEmotion = emotion;
          primaryIntensity = intensity;
          valence = 'positive';
        } else if (emotion !== primaryEmotion) {
          secondaryEmotions.push(emotion);
        }
      }
    }
  });
  
  // Determine arousal based on intensity and specific terms
  if (primaryIntensity > 0.7) {
    arousal = 'high';
  } else if (primaryIntensity < 0.4) {
    arousal = 'low';
  }
  
  // Create high-arousal terms
  const highArousalTerms = ['excited', 'angry', 'thrilled', 'furious', 'ecstatic', 'panicked', 'terrified', 'enraged'];
  // Create low-arousal terms
  const lowArousalTerms = ['calm', 'relaxed', 'peaceful', 'serene', 'tired', 'bored', 'sleepy', 'content'];
  
  // Check for high/low arousal terms
  if (highArousalTerms.some(term => lowerText.includes(term))) {
    arousal = 'high';
  } else if (lowArousalTerms.some(term => lowerText.includes(term))) {
    arousal = 'low';
  }
  
  // Limit to top 3 secondary emotions
  secondaryEmotions = [...new Set(secondaryEmotions)].slice(0, 3);
  
  // Calculate confidence based on intensity and text length
  let confidence = primaryIntensity;
  if (text.length < 10) confidence *= 0.7; // Short texts are less reliable
  
  // Cap values to appropriate ranges
  primaryIntensity = Math.min(1, primaryIntensity);
  confidence = Math.min(1, Math.max(0.3, confidence));
  
  return {
    primaryEmotion,
    emotionalIntensity: primaryIntensity,
    secondaryEmotions,
    valence,
    arousal,
    confidence
  };
}

/**
 * Extract keywords, topics, and entities from text
 */
export function extractKeywords(text: string): EntityExtractionResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/).filter(word => word.length > 1);
  
  // Base topic/keyword sets
  const scenarioWords = [
    'sad', 'happy', 'angry', 'support', 'help', 'conflict', 'celebrate', 'win', 
    'struggle', 'joy', 'excited', 'overwhelmed', 'focused', 'creative', 'reflective', 
    'repair', 'choose', 'motivate', 'soothe', 'clarify', 'growth', 'rest', 'connect', 
    'learn', 'reset', 'plan', 'review', 'inspire', 'protect', 'assert', 'heal', 'explore', 
    'build', 'share', 'listen', 'lead', 'follow', 'love', 'peace', 'grateful', 'proud', 'hopeful'
  ];
  
  // Entity type patterns
  const entityPatterns = {
    person: [/\b(?:mr|mrs|ms|dr|prof)\.\s+\w+\b/i, /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/],
    location: [/\b(?:at|in|near|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/],
    date: [/\b(?:today|tomorrow|yesterday)\b/, /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/],
    time: [/\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/i, /\b(?:morning|afternoon|evening|night)\b/],
    number: [/\b\d+(?:\.\d+)?\b/],
    device: [/\b(?:lights?|thermostat|tv|speaker|camera|lock|door|window|blind|fan)\b/i],
    app: [/\b(?:facebook|instagram|twitter|tiktok|youtube|spotify|netflix|amazon|gmail|maps)\b/i]
  };
  
  // Topic definitions with related terms
  const topicGroups = {
    'health': ['exercise', 'fitness', 'diet', 'wellness', 'sleep', 'doctor', 'medical', 'healthy', 'nutrition', 'workout'],
    'work': ['job', 'career', 'meeting', 'deadline', 'project', 'boss', 'colleague', 'office', 'presentation', 'interview'],
    'relationships': ['family', 'friend', 'partner', 'spouse', 'date', 'love', 'relationship', 'marriage', 'dating', 'breakup'],
    'entertainment': ['movie', 'show', 'music', 'concert', 'book', 'game', 'play', 'watch', 'listen', 'read', 'stream'],
    'technology': ['phone', 'computer', 'app', 'software', 'device', 'internet', 'online', 'digital', 'smart', 'tech'],
    'home': ['house', 'apartment', 'clean', 'furniture', 'decoration', 'kitchen', 'bathroom', 'bedroom', 'living', 'garden'],
    'finance': ['money', 'budget', 'saving', 'expense', 'invest', 'cost', 'price', 'financial', 'bank', 'income', 'bill', 'pay'],
    'travel': ['trip', 'vacation', 'flight', 'hotel', 'visit', 'travel', 'journey', 'holiday', 'abroad', 'tourism'],
    'education': ['study', 'learn', 'class', 'course', 'school', 'college', 'university', 'student', 'teacher', 'exam', 'homework'],
    'food': ['eat', 'meal', 'restaurant', 'recipe', 'cook', 'breakfast', 'lunch', 'dinner', 'diet', 'grocery', 'food']
  };
  
  // Extract basic keywords
  const keywords = words.filter(word => scenarioWords.includes(word));
  
  // Extract entities
  const entities: Entity[] = [];
  const namedEntities: NamedEntity[] = [];
  
  // Check for entities using regex patterns
  Object.entries(entityPatterns).forEach(([type, patterns]) => {
    patterns.forEach(pattern => {
      const matches = text.match(new RegExp(pattern, 'g'));
      if (matches) {
        matches.forEach(match => {
          const startIndex = text.indexOf(match);
          const endIndex = startIndex + match.length;
          
          entities.push({
            text: match,
            type: type as any,
            startIndex,
            endIndex,
            confidence: 0.7
          });
          
          if (type === 'person' || type === 'location' || type === 'organization') {
            namedEntities.push({
              text: match,
              type: type as any,
              startIndex,
              endIndex,
              confidence: 0.7,
              normalizedValue: match.trim(),
              metadata: { source: 'pattern-match' }
            });
          }
        });
      }
    });
  });
  
  // Identify topics from the text
  const topics: string[] = [];
  Object.entries(topicGroups).forEach(([topic, relatedTerms]) => {
    const matchCount = relatedTerms.filter(term => lowerText.includes(term)).length;
    if (matchCount >= 2 || (matchCount >= 1 && words.length < 15)) {
      topics.push(topic);
    }
  });
  
  // Calculate confidence based on extracted elements
  let confidence = 0.5;
  if (entities.length > 2) confidence += 0.2;
  if (keywords.length > 3) confidence += 0.2;
  if (topics.length > 0) confidence += 0.1;
  confidence = Math.min(1, confidence);
  
  return {
    entities,
    namedEntities,
    topics,
    confidence
  };
}

/**
 * Extract intent from user text
 * Identifies what the user wants to accomplish
 */
export function extractIntent(text: string): IntentDetectionResult {
  const lowerText = text.toLowerCase();
  
  // Define intent patterns
  const intentPatterns = {
    'search': [/(?:search|find|look for|google|where is)\s+.+/i],
    'navigate': [/(?:navigate|directions|take me|go to|route to)\s+.+/i],
    'call': [/(?:call|dial|phone)\s+.+/i],
    'message': [/(?:text|message|send .+ to|tell)\s+.+/i],
    'play_music': [/(?:play|listen to)\s+(?:music|song|artist|album)\s+.+/i],
    'set_reminder': [/(?:remind me|set a reminder|remember to)\s+.+/i],
    'create_calendar': [/(?:schedule|create|add|book).+(?:appointment|meeting|event)/i],
    'weather': [/(?:weather|forecast|temperature|rain|sunny).+/i],
    'device_control': [/(?:turn on|turn off|dim|brighten|set|adjust|change)\s+(?:the\s+)?(?:lights?|thermostat|temperature|tv|music|volume|fan)/i],
    'question': [/^(?:what|who|where|when|why|how|is|are|can|do|does|did).+\?/i],
    'help': [/(?:help|assist|support).+/i]
  };
  
  // Default return if no intent is detected
  let primaryIntent = 'unknown';
  let confidence = 0.5;
  const alternativeIntents: Array<{intent: string, confidence: number}> = [];
  const parameters: Record<string, any> = {};
  
  // Check for each intent pattern
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        // If we already found an intent, add this as alternative
        if (primaryIntent !== 'unknown') {
          alternativeIntents.push({
            intent: primaryIntent,
            confidence: confidence
          });
        }
        primaryIntent = intent;
        confidence = 0.75; // Base confidence for pattern match
        
        // Extract parameters based on intent type
        switch (intent) {
          case 'call':
            {
              const match = lowerText.match(/call\s+(.+)/i);
              if (match && match[1]) parameters.contact = match[1].trim();
            }
            break;
          case 'message':
            {
              const match = lowerText.match(/(?:text|message|send)\s+(.+?)(?:\s+saying\s+|\s+that\s+)(.+)/i);
              if (match && match[1] && match[2]) {
                parameters.contact = match[1].trim();
                parameters.message = match[2].trim();
              }
            }
            break;
          case 'device_control':
            {
              if (/turn on|activate|enable/i.test(lowerText)) parameters.action = 'turn_on';
              if (/turn off|deactivate|disable/i.test(lowerText)) parameters.action = 'turn_off';
              
              const deviceMatch = lowerText.match(/(?:the\s+)?(\w+)(?:\s+in\s+the\s+(\w+))?/i);
              if (deviceMatch) {
                parameters.device = deviceMatch[1];
                if (deviceMatch[2]) parameters.location = deviceMatch[2];
              }
            }
            break;
        }
        
        break; // Break after finding the first matching pattern for this intent
      }
    }
  }
  
  // Check for question words at the beginning to identify questions
  if (/^(?:what|who|where|when|why|how|is|are|can|do|does|did)/i.test(lowerText)) {
    if (primaryIntent === 'unknown') {
      primaryIntent = 'question';
      confidence = 0.8;
    } else {
      alternativeIntents.push({
        intent: 'question',
        confidence: 0.7
      });
    }
  }
  
  // Check for greetings
  if (/^(?:hi|hello|hey|good morning|good afternoon|good evening)/i.test(lowerText)) {
    if (primaryIntent === 'unknown') {
      primaryIntent = 'greeting';
      confidence = 0.9;
    } else {
      alternativeIntents.push({
        intent: 'greeting',
        confidence: 0.8
      });
    }
  }
  
  // Enhance confidence based on text specificity
  if (text.length > 15) confidence += 0.1;
  if (Object.keys(parameters).length > 0) confidence += 0.1;
  
  // Cap confidence at 1.0
  confidence = Math.min(1, confidence);
  
  return {
    primaryIntent,
    confidence,
    parameters,
    alternativeIntents
  };
}

/**
 * Extract device-specific intent from text
 * Used for device control commands
 */
export function extractDeviceIntent(text: string): DeviceIntent {
  const lowerText = text.toLowerCase();
  let action = 'UNKNOWN';
  const parameters: Record<string, string> = {};
  let confidence = 0.5;
  
  // Define device command patterns
  if (/turn on|start|activate|enable/i.test(lowerText)) {
    action = 'TURN_ON';
    confidence = 0.8;
    
    const deviceMatch = lowerText.match(/(?:turn on|start|activate|enable)\s+(?:the\s+)?(.+?)(?:\s+in|$)/i);
    if (deviceMatch) parameters.device = deviceMatch[1].trim();
  } 
  else if (/turn off|stop|deactivate|disable/i.test(lowerText)) {
    action = 'TURN_OFF';
    confidence = 0.8;
    
    const deviceMatch = lowerText.match(/(?:turn off|stop|deactivate|disable)\s+(?:the\s+)?(.+?)(?:\s+in|$)/i);
    if (deviceMatch) parameters.device = deviceMatch[1].trim();
  }
  else if (/set|adjust|change|make/i.test(lowerText) && /brightness|dim/i.test(lowerText)) {
    action = 'SET_BRIGHTNESS';
    confidence = 0.75;
    
    const deviceMatch = lowerText.match(/(?:brightness of|dim|brighten)(?:\s+the)?\s+(.+?)(?:\s+to|$)/i);
    if (deviceMatch) parameters.device = deviceMatch[1].trim();
    
    const valueMatch = lowerText.match(/to\s+(\d+)(?:\s*%|percent)?/i);
    if (valueMatch) parameters.value = valueMatch[1];
    else if (/dim/i.test(lowerText)) parameters.value = "25";
    else if (/brighten/i.test(lowerText)) parameters.value = "100";
  }
  else if (/set|adjust|change/i.test(lowerText) && /temperature|thermostat/i.test(lowerText)) {
    action = 'SET_TEMPERATURE';
    confidence = 0.8;
    
    const valueMatch = lowerText.match(/to\s+(\d+)(?:\s*degrees)?/i);
    if (valueMatch) parameters.value = valueMatch[1];
    
    if (/thermostat/i.test(lowerText)) {
      parameters.device = "thermostat";
    }
    
    const locationMatch = lowerText.match(/(?:in|for) the\s+(.+?)(?:\s+to|$)/i);
    if (locationMatch) parameters.location = locationMatch[1].trim();
  }
  else if (/lock/i.test(lowerText)) {
    action = 'LOCK';
    confidence = 0.7;
    
    const deviceMatch = lowerText.match(/lock\s+(?:the\s+)?(.+?)(?:\s+in|$)/i);
    if (deviceMatch) parameters.device = deviceMatch[1].trim();
  }
  else if (/unlock/i.test(lowerText)) {
    action = 'UNLOCK';
    confidence = 0.7;
    
    const deviceMatch = lowerText.match(/unlock\s+(?:the\s+)?(.+?)(?:\s+in|$)/i);
    if (deviceMatch) parameters.device = deviceMatch[1].trim();
  }
  else if (/activate|start|run|trigger/i.test(lowerText) && /scene|mode|routine/i.test(lowerText)) {
    action = 'ACTIVATE_SCENE';
    confidence = 0.8;
    
    const sceneMatch = lowerText.match(/(?:scene|mode|routine)(?:\s+called)?\s+(.+?)(?:\s+in|$)/i);
    if (sceneMatch) parameters.scene = sceneMatch[1].trim();
  }
  else if (/list|show|what|all/i.test(lowerText) && /devices/i.test(lowerText)) {
    action = 'LIST_DEVICES';
    confidence = 0.9;
  }
  else if (/list|show|what|all/i.test(lowerText) && /scenes|routines|modes/i.test(lowerText)) {
    action = 'LIST_SCENES';
    confidence = 0.9;
  }
  
  // Extract location if present
  const locationMatch = lowerText.match(/(?:in|for) the\s+(.+?)(?:\s+to|\s+at|$)/i);
  if (locationMatch && !parameters.location) {
    parameters.location = locationMatch[1].trim();
  }
  
  return {
    action,
    parameters,
    confidence
  };
}


/**
 * Enhanced sentiment analysis with deeper emotional understanding
 */
export function analyzeSentimentAdvanced(text: string, context?: ConversationContext): EnhancedSentimentResult {
  const baseResult = analyzeSentiment(text);

  // Enhanced emotion categories
  const complexEmotions = {
    'ambivalence': ['mixed feelings', 'conflicted', 'torn', 'unsure'],
    'resilience': ['persevering', 'enduring', 'strong', 'resilient'],
    'vulnerability': ['exposed', 'fragile', 'sensitive', 'open'],
    'empowerment': ['capable', 'confident', 'empowered', 'strong'],
    'connection': ['connected', 'bonded', 'related', 'close'],
    'isolation': ['alone', 'isolated', 'disconnected', 'separate'],
    'growth': ['learning', 'developing', 'evolving', 'progressing'],
    'stagnation': ['stuck', 'plateau', 'unchanging', 'static']
  };

  // Contextual factors that influence emotion interpretation
  const contextualFactors: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for complex emotions
  Object.entries(complexEmotions).forEach(([emotion, indicators]) => {
    if (indicators.some(indicator => lowerText.includes(indicator))) {
      contextualFactors.push(emotion);
    }
  });

  // Analyze emotional layers
  const emotionalLayers: Array<{emotion: string, intensity: number, layer: 'surface' | 'underlying' | 'contextual'}> = [];

  // Surface layer (immediate emotional response)
  emotionalLayers.push({
    emotion: baseResult.primaryEmotion,
    intensity: baseResult.emotionalIntensity,
    layer: 'surface'
  });

  // Underlying layer (deeper emotional state)
  if (context?.emotionalHistory && context.emotionalHistory.length > 0) {
    const recentEmotions = context.emotionalHistory.slice(-3);
    const dominantUnderlying = recentEmotions.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const underlyingEmotion = Object.entries(dominantUnderlying)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    emotionalLayers.push({
      emotion: underlyingEmotion,
      intensity: 0.6,
      layer: 'underlying'
    });
  }

  // Contextual layer (emotion influenced by conversation context)
  if (context?.previousTopics.includes('work') && lowerText.includes('tired')) {
    emotionalLayers.push({
      emotion: 'work_stress',
      intensity: 0.7,
      layer: 'contextual'
    });
    contextualFactors.push('work_related_stress');
  }

  // Determine emotional complexity
  let emotionalComplexity: 'simple' | 'mixed' | 'complex' = 'simple';
  if (emotionalLayers.length > 2) emotionalComplexity = 'complex';
  else if (baseResult.secondaryEmotions.length > 1) emotionalComplexity = 'mixed';

  // Analyze emotional trajectory
  let emotionalTrajectory: 'stable' | 'escalating' | 'de-escalating' | 'fluctuating' = 'stable';
  if ((context?.emotionalHistory?.length ?? 0) >= 2) {
    const recent = context?.emotionalHistory?.slice(-2) || [];
    const intensity1 = recent[0] ? getEmotionIntensity(recent[0].emotion) : 0.5;
    const intensity2 = recent[1] ? getEmotionIntensity(recent[1].emotion) : 0.5;

    if (intensity2 > intensity1 * 1.2) emotionalTrajectory = 'escalating';
    else if (intensity2 < intensity1 * 0.8) emotionalTrajectory = 'de-escalating';
    else if (Math.abs(intensity2 - intensity1) > 0.3) emotionalTrajectory = 'fluctuating';
  }

  return {
    ...baseResult,
    emotionalComplexity,
    emotionalLayers,
    emotionalTrajectory,
    contextualFactors
  };
}

/**
 * Advanced intent detection with hierarchical classification
 */
export function extractIntentAdvanced(text: string, context?: ConversationContext): AdvancedIntentResult {
  const baseResult = extractIntent(text);
  const lowerText = text.toLowerCase();

  // Enhanced intent hierarchy
  const intentHierarchy: string[] = [baseResult.primaryIntent];

  // Sub-intent classification
  let subIntent = '';
  let conversationalGoal: 'information' | 'action' | 'emotional_support' | 'social' | 'exploratory' = 'information';
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let timeSensitivity = false;

  // Analyze sub-intents based on primary intent
  switch (baseResult.primaryIntent) {
    case 'question':
      if (/(how are you|how do you feel|what's wrong)/i.test(lowerText)) {
        subIntent = 'emotional_check_in';
        conversationalGoal = 'emotional_support';
      } else if (/(what|how|why)/i.test(lowerText)) {
        subIntent = 'factual_inquiry';
        conversationalGoal = 'information';
      } else {
        subIntent = 'clarification';
        conversationalGoal = 'exploratory';
      }
      break;

    case 'help':
      if (/(emotional|feel|support|talk)/i.test(lowerText)) {
        subIntent = 'emotional_support';
        conversationalGoal = 'emotional_support';
      } else {
        subIntent = 'practical_assistance';
        conversationalGoal = 'action';
      }
      break;

    case 'greeting':
      subIntent = 'social_connection';
      conversationalGoal = 'social';
      break;

    default:
      subIntent = 'general';
      conversationalGoal = 'information';
  }

  intentHierarchy.push(subIntent);

  // Determine urgency level
  if (/(urgent|emergency|crisis|immediately|now|help)/i.test(lowerText)) {
    urgencyLevel = 'critical';
  } else if (/(soon|quickly|asap|important)/i.test(lowerText)) {
    urgencyLevel = 'high';
  } else if (/(when you can|eventually|sometime)/i.test(lowerText)) {
    urgencyLevel = 'low';
  }

  // Check for time sensitivity
  timeSensitivity = /(today|tomorrow|this week|deadline|schedule|time)/i.test(lowerText);

  // Adjust confidence based on context
  let adjustedConfidence = baseResult.confidence;
  if ((context?.interactionCount ?? 0) > 5) {
    adjustedConfidence += 0.1; // More confident with established conversation
  }

  return {
    ...baseResult,
    subIntent,
    intentHierarchy,
    conversationalGoal,
    urgencyLevel,
    timeSensitivity,
    confidence: Math.min(1, adjustedConfidence)
  };
}

/**
 * Conversation flow analysis
 */
export function analyzeConversationFlow(text: string, context?: ConversationContext): {
  flowState: 'introduction' | 'deepening' | 'resolution' | 'transition';
  topicContinuity: number; // 0-1 scale
  emotionalContinuity: number; // 0-1 scale
  suggestedResponseStrategy: string;
} {
  let flowState: 'introduction' | 'deepening' | 'resolution' | 'transition' = 'introduction';
  let topicContinuity = 0;
  let emotionalContinuity = 0;
  let suggestedResponseStrategy = 'acknowledge_and_explore';

  if (!context) {
    return {
      flowState,
      topicContinuity,
      emotionalContinuity,
      suggestedResponseStrategy
    };
  }

  // Analyze topic continuity
  const currentTopics = extractKeywords(text).topics;
  const previousTopics = context.previousTopics.slice(-3);

  const overlappingTopics = currentTopics.filter(topic =>
    previousTopics.includes(topic)
  ).length;

  topicContinuity = overlappingTopics / Math.max(currentTopics.length, previousTopics.length, 1);

  // Analyze emotional continuity
  const currentSentiment = analyzeSentiment(text);
  const recentEmotions = context.emotionalHistory.slice(-2);

  if (recentEmotions.length > 0) {
    const avgRecentIntensity = recentEmotions.reduce((sum, e) =>
      sum + getEmotionIntensity(e.emotion), 0
    ) / recentEmotions.length;

    emotionalContinuity = 1 - Math.abs(currentSentiment.emotionalIntensity - avgRecentIntensity);
  }

  // Determine flow state
  if (context.interactionCount < 3) {
    flowState = 'introduction';
    suggestedResponseStrategy = 'build_rapport';
  } else if (topicContinuity > 0.6 && emotionalContinuity > 0.7) {
    flowState = 'deepening';
    suggestedResponseStrategy = 'deepen_understanding';
  } else if (/(resolved|solved|better|figured it out)/i.test(text)) {
    flowState = 'resolution';
    suggestedResponseStrategy = 'celebrate_resolution';
  } else if (topicContinuity < 0.3) {
    flowState = 'transition';
    suggestedResponseStrategy = 'smooth_transition';
  }

  return {
    flowState,
    topicContinuity,
    emotionalContinuity,
    suggestedResponseStrategy
  };
}

/**
 * Helper function to get emotion intensity
 */
function getEmotionIntensity(emotion: string): number {
  const intensityMap: Record<string, number> = {
    'joy': 0.8, 'ecstatic': 0.9, 'happy': 0.7, 'content': 0.5,
    'sad': 0.6, 'depressed': 0.9, 'angry': 0.8, 'frustrated': 0.7,
    'anxious': 0.7, 'worried': 0.6, 'calm': 0.4, 'peaceful': 0.5,
    'excited': 0.8, 'neutral': 0.5
  };
  return intensityMap[emotion] || 0.5;
}

/**
 * Generate personalized response suggestions based on user context
 */
export function generatePersonalizedSuggestions(
  text: string,
  context?: ConversationContext
): {
  suggestedTopics: string[];
  recommendedActions: string[];
  emotionalSupportLevel: 'low' | 'medium' | 'high';
  personalizationFactors: string[];
} {
  const sentiment = analyzeSentiment(text);
  const intent = extractIntent(text);
  const keywords = extractKeywords(text);

  const suggestedTopics: string[] = [];
  const recommendedActions: string[] = [];
  let emotionalSupportLevel: 'low' | 'medium' | 'high' = 'medium';
  const personalizationFactors: string[] = [];

  // Analyze user preferences from context
  if (context?.userPreferences) {
    personalizationFactors.push(...Object.keys(context.userPreferences));
  }

  // Generate topic suggestions based on current state
  if (sentiment.valence === 'negative' && sentiment.emotionalIntensity > 0.6) {
    suggestedTopics.push('coping_strategies', 'emotional_support', 'self_care');
    emotionalSupportLevel = 'high';
    recommendedActions.push('offer_empathy', 'suggest_breathing_exercise');
  } else if (intent.primaryIntent === 'question') {
    suggestedTopics.push('exploration', 'learning', 'curiosity');
    recommendedActions.push('provide_information', 'ask_follow_up_questions');
  } else if (keywords.topics.includes('work')) {
    suggestedTopics.push('work_life_balance', 'productivity', 'stress_management');
    recommendedActions.push('suggest_break', 'offer_time_management_tips');
  }

  // Add personalization based on history
  if (context?.emotionalHistory.some(e => e.emotion === 'anxious')) {
    personalizationFactors.push('anxiety_history');
    recommendedActions.push('use_grounding_techniques');
  }

  return {
    suggestedTopics,
    recommendedActions,
    emotionalSupportLevel,
    personalizationFactors
  };
}
