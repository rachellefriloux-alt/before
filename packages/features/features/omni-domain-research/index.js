/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Omni-domain research capabilities for comprehensive analysis.
 * Got it, love.
 */

export class OmniDomainResearch {
  constructor() {
    this.domains = new Map();
    this.researchCache = new Map();
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
  }

  registerDomain(name, analyzer) {
    this.domains.set(name, analyzer);
    return true;
  }

  async analyze(query, domain = null) {
    if (domain && this.domains.has(domain)) {
      const analyzer = this.domains.get(domain);
      return await analyzer.analyze(query);
    }

    // Multi-domain analysis
    const results = {};
    for (const [domainName, analyzer] of this.domains) {
      try {
        results[domainName] = await analyzer.analyze(query);
      } catch (error) {
        // Error analyzing domain
        results[domainName] = { error: error.message };
      }
    }

    return results;
  }

  getAvailableDomains() {
    return Array.from(this.domains.keys());
  }

  clearCache() {
    this.researchCache.clear();
    return true;
  }

  getCacheStats() {
    return {
      size: this.researchCache.size,
      domains: this.domains.size
    };
  }
}

// Default analyzers
export class TextAnalyzer {
  async analyze(text) {
    return {
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
      sentiment: this.analyzeSentiment(text),
      keywords: this.extractKeywords(text),
      readability: this.calculateReadability(text)
    };
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  }

  extractKeywords(text) {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
  }

  calculateReadability(text) {
    // Simple readability score
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence < 10) return 'easy';
    if (avgWordsPerSentence < 20) return 'medium';
    return 'difficult';
  }
}

export class DataAnalyzer {
  async analyze(data) {
    if (typeof data !== 'object') {
      return { error: 'Data must be an object or array' };
    }

    return {
      type: Array.isArray(data) ? 'array' : 'object',
      size: Array.isArray(data) ? data.length : Object.keys(data).length,
      structure: this.analyzeStructure(data),
      statistics: this.calculateStatistics(data)
    };
  }

  analyzeStructure(data) {
    if (Array.isArray(data)) {
      return {
        isArray: true,
        itemTypes: [...new Set(data.map(item => typeof item))]
      };
    }

    const keys = Object.keys(data);
    return {
      isArray: false,
      keys: keys,
      valueTypes: keys.reduce((acc, key) => {
        acc[key] = typeof data[key];
        return acc;
      }, {})
    };
  }

  calculateStatistics(data) {
    if (Array.isArray(data)) {
      const numbers = data.filter(item => typeof item === 'number');
      if (numbers.length === 0) return { noNumericData: true };

      return {
        count: numbers.length,
        sum: numbers.reduce((a, b) => a + b, 0),
        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers)
      };
    }

    return { objectAnalysis: 'Use array for statistical analysis' };
  }
}

// Export default instance
const research = new OmniDomainResearch();
research.registerDomain('text', new TextAnalyzer());
research.registerDomain('data', new DataAnalyzer());

export default research;


