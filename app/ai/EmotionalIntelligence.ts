import { Alert } from 'react-native';

export interface EmotionalAnalysis {
  detectedEmotion: string;
  confidence: number;
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (excited)
  emotionalKeywords: string[];
  intensity: number; // 0 to 1
  reasoning: string;
  suggestions: string[];
}

export interface EmotionalResponse {
  recommendedEmotion: string;
  intensity: number;
  reasoning: string;
  empathyLevel: number;
}

export class EmotionalIntelligence {
  private emotionPatterns: Record<string, {
    keywords: string[];
    indicators: string[];
    valence: number;
    arousal: number;
  }> = {
    happy: {
      keywords: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'celebrate'],
      indicators: ['!', '😊', '😃', '🎉', 'haha', 'lol'],
      valence: 0.8,
      arousal: 0.6,
    },
    sad: {
      keywords: ['sad', 'depressed', 'down', 'low', 'upset', 'crying', 'tears', 'miserable', 'blue'],
      indicators: ['😢', '😭', ':(', 'sigh', '...'],
      valence: -0.7,
      arousal: 0.3,
    },
    angry: {
      keywords: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated', 'pissed'],
      indicators: ['😠', '😡', '!!!', 'CAPS', 'damn', 'shit'],
      valence: -0.6,
      arousal: 0.8,
    },
    anxious: {
      keywords: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed'],
      indicators: ['😰', '😨', '??', 'help', 'what if'],
      valence: -0.5,
      arousal: 0.7,
    },
    excited: {
      keywords: ['excited', 'thrilled', 'pumped', 'psyched', 'energetic', 'hyped', 'amazing'],
      indicators: ['🤩', '🎉', '!!!', 'wow', 'omg'],
      valence: 0.9,
      arousal: 0.9,
    },
    calm: {
      keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'zen', 'centered'],
      indicators: ['😌', 'mmm', 'breathe', 'peace'],
      valence: 0.3,
      arousal: 0.1,
    },
    confused: {
      keywords: ['confused', 'lost', 'unclear', 'puzzled', 'bewildered', 'perplexed'],
      indicators: ['🤔', '???', 'huh', 'what', 'how'],
      valence: -0.2,
      arousal: 0.4,
    },
    grateful: {
      keywords: ['grateful', 'thankful', 'appreciate', 'blessed', 'lucky', 'thank you'],
      indicators: ['🙏', '❤️', 'thanks', 'grateful'],
      valence: 0.7,
      arousal: 0.4,
    },
    lonely: {
      keywords: ['lonely', 'alone', 'isolated', 'empty', 'disconnect', 'solitude'],
      indicators: ['😔', 'alone', 'nobody', 'empty'],
      valence: -0.6,
      arousal: 0.2,
    },
    determined: {
      keywords: ['determined', 'focused', 'motivated', 'driven', 'committed', 'strong'],
      indicators: ['💪', '🔥', 'let\'s go', 'will', 'can'],
      valence: 0.6,
      arousal: 0.7,
    },
  };

  async analyzeInput(input: string): Promise<EmotionalAnalysis> {
    try {
      const text = input.toLowerCase();
      const words = text.split(/\s+/);
      
      // Score each emotion
      const emotionScores: Record<string, number> = {};
      const detectedKeywords: string[] = [];
      
      for (const [emotion, pattern] of Object.entries(this.emotionPatterns)) {
        let score = 0;
        
        // Check keywords
        for (const keyword of pattern.keywords) {
          if (text.includes(keyword)) {
            score += 2;
            detectedKeywords.push(keyword);
          }
        }
        
        // Check indicators
        for (const indicator of pattern.indicators) {
          if (text.includes(indicator)) {
            score += 1.5;
            detectedKeywords.push(indicator);
          }
        }
        
        // Context analysis
        score += this.analyzeContext(text, emotion);
        
        emotionScores[emotion] = score;
      }
      
      // Find dominant emotion
      const dominantEmotion = Object.entries(emotionScores)
        .sort(([,a], [,b]) => b - a)[0];
      
      const detectedEmotion = dominantEmotion[0];
      const maxScore = dominantEmotion[1];
      const confidence = Math.min(maxScore / 5, 1); // Normalize to 0-1
      
      const pattern = this.emotionPatterns[detectedEmotion];
      
      // Calculate intensity based on capitalization, punctuation, and repetition
      const intensity = this.calculateIntensity(input);
      
      return {
        detectedEmotion,
        confidence,
        valence: pattern.valence,
        arousal: pattern.arousal,
        emotionalKeywords: detectedKeywords,
        intensity,
        reasoning: this.generateReasoning(detectedEmotion, detectedKeywords, confidence),
        suggestions: this.generateSuggestions(detectedEmotion, intensity),
      };
    } catch (error) {
      console.error('Emotional analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  private analyzeContext(text: string, emotion: string): number {
    let contextScore = 0;
    
    // Time-based context
    if (text.includes('today') || text.includes('right now')) {
      contextScore += 0.5;
    }
    
    // Relationship context
    if (text.includes('friend') || text.includes('family') || text.includes('relationship')) {
      if (emotion === 'sad' || emotion === 'happy' || emotion === 'angry') {
        contextScore += 1;
      }
    }
    
    // Work/life context
    if (text.includes('work') || text.includes('job') || text.includes('school')) {
      if (emotion === 'stressed' || emotion === 'frustrated' || emotion === 'determined') {
        contextScore += 1;
      }
    }
    
    // Health context
    if (text.includes('tired') || text.includes('sick') || text.includes('pain')) {
      if (emotion === 'sad' || emotion === 'frustrated') {
        contextScore += 1;
      }
    }
    
    return contextScore;
  }

  private calculateIntensity(input: string): number {
    let intensity = 0.5; // Base intensity
    
    // Capitalization
    const caps = (input.match(/[A-Z]/g) || []).length;
    intensity += Math.min(caps / input.length, 0.3);
    
    // Exclamation marks
    const exclamations = (input.match(/!/g) || []).length;
    intensity += Math.min(exclamations * 0.2, 0.4);
    
    // Question marks (uncertainty can increase intensity)
    const questions = (input.match(/\?/g) || []).length;
    intensity += Math.min(questions * 0.1, 0.2);
    
    // Repetition
    const repeated = input.match(/(.)\1{2,}/g);
    if (repeated) {
      intensity += Math.min(repeated.length * 0.15, 0.3);
    }
    
    // Length (longer messages often have higher intensity)
    if (input.length > 100) {
      intensity += 0.1;
    }
    
    return Math.min(intensity, 1);
  }

  private generateReasoning(emotion: string, keywords: string[], confidence: number): string {
    if (keywords.length === 0) {
      return `Detected ${emotion} emotion with ${Math.round(confidence * 100)}% confidence based on overall tone and context.`;
    }
    
    return `Detected ${emotion} emotion with ${Math.round(confidence * 100)}% confidence based on keywords: ${keywords.slice(0, 3).join(', ')} and contextual analysis.`;
  }

  private generateSuggestions(emotion: string, intensity: number): string[] {
    const suggestions: Record<string, string[]> = {
      sad: [
        'Consider sharing what\'s making you feel this way',
        'Remember that it\'s okay to feel sad sometimes',
        'Think about reaching out to someone you trust',
        'Consider doing something gentle and nurturing for yourself',
      ],
      angry: [
        'Take a few deep breaths before responding',
        'Consider what might be behind the anger',
        'Physical activity might help release some tension',
        'Try expressing your feelings in a constructive way',
      ],
      anxious: [
        'Focus on what you can control right now',
        'Try some grounding techniques (5-4-3-2-1 method)',
        'Remember that most worries don\'t come true',
        'Consider breaking down overwhelming tasks into smaller steps',
      ],
      happy: [
        'Enjoy this positive moment fully',
        'Consider sharing your joy with others',
        'Think about what contributed to this happiness',
        'Savor the feeling and remember it for tougher times',
      ],
      excited: [
        'Channel this energy into productive action',
        'Share your excitement with supportive people',
        'Consider how to maintain this motivation',
        'Enjoy the anticipation and positive energy',
      ],
      default: [
        'Take a moment to check in with yourself',
        'Consider what you need most right now',
        'Remember that all emotions are temporary',
        'Focus on self-compassion and understanding',
      ],
    };
    
    const emotionSuggestions = suggestions[emotion] || suggestions.default;
    
    // Adjust suggestions based on intensity
    if (intensity > 0.7) {
      return emotionSuggestions.concat([
        'The intensity of your feelings suggests this is important to you',
        'Consider taking some time to process these strong emotions',
      ]);
    }
    
    return emotionSuggestions;
  }

  generateEmotionalResponse(userEmotion: string, userIntensity: number): EmotionalResponse {
    // Define appropriate emotional responses based on user's state
    const responses: Record<string, EmotionalResponse> = {
      sad: {
        recommendedEmotion: 'concerned',
        intensity: Math.min(userIntensity * 0.8, 0.8),
        reasoning: 'Showing concern and empathy for sadness while maintaining emotional stability',
        empathyLevel: 0.9,
      },
      angry: {
        recommendedEmotion: 'calm',
        intensity: Math.max(0.4, 1 - userIntensity * 0.5),
        reasoning: 'Maintaining calm presence to help de-escalate anger',
        empathyLevel: 0.7,
      },
      anxious: {
        recommendedEmotion: 'calm',
        intensity: 0.6,
        reasoning: 'Providing calm, reassuring presence for anxiety',
        empathyLevel: 0.8,
      },
      happy: {
        recommendedEmotion: 'happy',
        intensity: Math.min(userIntensity * 0.9, 0.9),
        reasoning: 'Sharing and reflecting positive emotions',
        empathyLevel: 0.8,
      },
      excited: {
        recommendedEmotion: 'excited',
        intensity: Math.min(userIntensity * 0.7, 0.8),
        reasoning: 'Matching excitement while maintaining appropriate boundaries',
        empathyLevel: 0.7,
      },
      confused: {
        recommendedEmotion: 'thoughtful',
        intensity: 0.6,
        reasoning: 'Offering thoughtful guidance for confusion',
        empathyLevel: 0.8,
      },
      lonely: {
        recommendedEmotion: 'concerned',
        intensity: 0.7,
        reasoning: 'Providing warm, caring presence for loneliness',
        empathyLevel: 0.9,
      },
      default: {
        recommendedEmotion: 'thoughtful',
        intensity: 0.5,
        reasoning: 'Maintaining neutral, thoughtful presence',
        empathyLevel: 0.6,
      },
    };
    
    return responses[userEmotion] || responses.default;
  }

  private getDefaultAnalysis(): EmotionalAnalysis {
    return {
      detectedEmotion: 'neutral',
      confidence: 0.3,
      valence: 0,
      arousal: 0.3,
      emotionalKeywords: [],
      intensity: 0.3,
      reasoning: 'Default analysis due to processing error',
      suggestions: ['Take a moment to reflect on your current emotional state'],
    };
  }

  // Public utility methods
  getEmotionColor(emotion: string): string {
    const colors: Record<string, string> = {
      happy: '#FFD700',
      sad: '#87CEEB',
      angry: '#FF4500',
      anxious: '#DDA0DD',
      excited: '#FF69B4',
      calm: '#98FB98',
      confused: '#F0E68C',
      grateful: '#DEB887',
      lonely: '#708090',
      determined: '#FF6347',
      default: '#E6E6FA',
    };
    
    return colors[emotion] || colors.default;
  }

  getEmotionEmoji(emotion: string): string {
    const emojis: Record<string, string> = {
      happy: '😊',
      sad: '😔',
      angry: '😠',
      anxious: '😰',
      excited: '🤩',
      calm: '😌',
      confused: '🤔',
      grateful: '🙏',
      lonely: '😞',
      determined: '💪',
      default: '😐',
    };
    
    return emojis[emotion] || emojis.default;
  }

  validateEmotionalState(emotion: string, intensity: number): boolean {
    return (
      Object.keys(this.emotionPatterns).includes(emotion) &&
      intensity >= 0 &&
      intensity <= 1
    );
  }
}
