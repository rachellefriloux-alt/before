/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie AI - Comprehensive Integration Test Suite                           │
 * │                                                                              │
 * │   Validates core AI functionality and integration                            │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import {
  // Core AI Systems - using specific functions that exist
  analyzeSentiment,
  extractKeywords,
  extractIntent
} from '../ai/nlpEngine';

import {
  parseMoodSignal
} from '../ai/moodSignal';

// Mock implementations for testing
jest.mock('expo-constants', () => ({
  default: {
    manifest: {
      version: '1.0.0'
    }
  }
}));

describe('Sallie AI Integration Tests', () => {
  describe('NLP Engine Integration', () => {
    test('should analyze sentiment correctly', () => {
      const input = "I'm so happy with this amazing app!";
      const result = analyzeSentiment(input);

      expect(result).toHaveProperty('primaryEmotion');
      expect(result).toHaveProperty('emotionalIntensity');
      expect(result).toHaveProperty('valence');
      expect(result.valence).toBe('positive');
      expect(result.emotionalIntensity).toBeGreaterThan(0);
    });

    test('should extract keywords from text', () => {
      const input = "I love using this AI assistant for productivity and creativity";
      const result = extractKeywords(input);

      expect(result).toHaveProperty('entities');
      expect(result).toHaveProperty('topics');
      expect(result.topics).toContain('productivity');
      expect(result.topics).toContain('creativity');
    });

    test('should detect intent from user input', () => {
      const input = "Can you help me schedule a meeting?";
      const result = extractIntent(input);

      expect(result).toHaveProperty('primaryIntent');
      expect(result).toHaveProperty('confidence');
      expect(result.primaryIntent).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Mood Signal Integration', () => {
    test('should parse mood signal from text', () => {
      const input = "I'm feeling really excited about this project!";
      const context = { stressLevel: 2 };
      const persona = 'optimist';

      const result = parseMoodSignal(input, context, persona);

      expect(result).toHaveProperty('tone');
      expect(result).toHaveProperty('pacing');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('persona');
      expect(result.tone).toBeTruthy();
      expect(result.persona).toBe(persona);
    });

    test('should handle negative sentiment', () => {
      const input = "This is really frustrating and stressful";
      const context = { stressLevel: 8 };
      const persona = 'realist';

      const result = parseMoodSignal(input, context, persona);

      expect(result.tone).toBe('anger');
      expect(result.pacing).toBe('brisk');
      expect(result.validation).toBe('clear');
    });
  });

  describe('Cross-Module Integration', () => {
    test('should integrate NLP and mood analysis', () => {
      const input = "I'm overwhelmed but excited about learning new things";

      // Test NLP analysis
      const sentiment = analyzeSentiment(input);
      const keywords = extractKeywords(input);

      // Test mood signal parsing
      const moodSignal = parseMoodSignal(input, {}, 'balanced');

      // Verify integration
      expect(sentiment.primaryEmotion).toBeTruthy();
      expect(keywords.topics.length).toBeGreaterThan(0);
      expect(moodSignal.tone).toBeTruthy();

      // Cross-validation
      if (sentiment.valence === 'positive' && moodSignal.tone === 'joy') {
        expect(sentiment.emotionalIntensity).toBeGreaterThan(0.3);
      }
    });

    test('should handle complex emotional scenarios', () => {
      const scenarios = [
        {
          input: "I'm nervous but determined to succeed",
          expectedTone: 'anxiety',
          expectedValence: 'mixed'
        },
        {
          input: "This is absolutely wonderful and amazing!",
          expectedTone: 'joy',
          expectedValence: 'positive'
        },
        {
          input: "I'm disappointed with the results",
          expectedTone: 'sad',
          expectedValence: 'negative'
        }
      ];

      scenarios.forEach(scenario => {
        const sentiment = analyzeSentiment(scenario.input);
        const moodSignal = parseMoodSignal(scenario.input, {}, 'balanced');

        expect(sentiment.primaryEmotion).toBeTruthy();
        expect(moodSignal.tone).toBeTruthy();
        expect(sentiment.valence).toBeTruthy();
      });
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle large text inputs efficiently', () => {
      const largeInput = "This is a very long text input that should test the performance and reliability of our NLP engine. ".repeat(100);

      const startTime = Date.now();
      const result = analyzeSentiment(largeInput);
      const endTime = Date.now();

      expect(result).toHaveProperty('primaryEmotion');
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle edge cases gracefully', () => {
      const edgeCases = [
        "",
        "   ",
        "!@#$%^&*()",
        "123456789",
        "a".repeat(1000)
      ];

      edgeCases.forEach(input => {
        expect(() => {
          analyzeSentiment(input);
          extractKeywords(input);
          parseMoodSignal(input, {}, 'balanced');
        }).not.toThrow();
      });
    });

    test('should maintain consistency across multiple calls', () => {
      const input = "I love this amazing application!";
      const results = [];

      // Call multiple times to check consistency
      for (let i = 0; i < 10; i++) {
        results.push(analyzeSentiment(input));
      }

      // All results should have the same valence
      const valences = results.map(r => r.valence);
      const uniqueValences = [...new Set(valences)];

      expect(uniqueValences.length).toBe(1); // Should all be the same
      expect(uniqueValences[0]).toBe('positive');
    });
  });
});
