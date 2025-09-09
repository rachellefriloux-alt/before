/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Cogn    return `Based on your history: ${this.adaptPatternToProblem(bestPattern, { type: 'problem' })}`; processing and learning module.
 * Got it, love.
 */

export class CognitiveModule {
  constructor() {
    this.interactions = new Map();
    this.knowledge = new Map();
    this.learningPatterns = new Map();
    this.contextMemory = new Map();
  }

  logInteraction(userId, message, response) {
    if (!this.interactions.has(userId)) {
      this.interactions.set(userId, []);
    }

    const userInteractions = this.interactions.get(userId);
    userInteractions.push({
      message,
      response,
      timestamp: Date.now(),
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Keep only last 100 interactions per user
    if (userInteractions.length > 100) {
      userInteractions.shift();
    }

    return userInteractions.length;
  }

  recallPastInteractions(userId) {
    const userInteractions = this.interactions.get(userId) || [];
    return userInteractions.slice(-10); // Return last 10 interactions
  }

  learnFromInteraction(userId, interaction, outcome) {
    const key = `${userId}_${interaction.type}`;

    if (!this.learningPatterns.has(key)) {
      this.learningPatterns.set(key, {
        successes: 0,
        failures: 0,
        patterns: []
      });
    }

    const pattern = this.learningPatterns.get(key);

    if (outcome.success) {
      pattern.successes++;
      pattern.patterns.push({
        interaction,
        outcome,
        learned: Date.now()
      });
    } else {
      pattern.failures++;
    }

    return pattern;
  }

  solveProblem(problem, context) {
    const userId = context.userId;
    // Use learned patterns to solve problems
    const relevantPatterns = this.findRelevantPatterns(userId, 'problem');

    if (relevantPatterns.length === 0) {
      return 'Based on your history, let\'s break this down step by step.';
    }

    // Find the most successful pattern
    const bestPattern = relevantPatterns.reduce((best, current) => {
      const currentSuccessRate = current.successes / (current.successes + current.failures);
      const bestSuccessRate = best.successes / (best.successes + best.failures);
      return currentSuccessRate > bestSuccessRate ? current : best;
    });

    return {
      solution: this.adaptPatternToProblem(bestPattern, problem),
      confidence: bestPattern.successes / (bestPattern.successes + bestPattern.failures),
      approach: 'pattern-based'
    };
  }

  findRelevantPatterns(userId, problemType) {
    const patterns = [];

    for (const [key, pattern] of this.learningPatterns) {
      if (key.startsWith(`${userId}_`) && key.includes(problemType)) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  adaptPatternToProblem(pattern, problem) {
    // Adapt successful patterns to new problems
    if (pattern.patterns.length === 0) {
      return `Let's work through this ${problem.type} together using what we've learned.`;
    }

    const successfulPattern = pattern.patterns[pattern.patterns.length - 1];
    return `Based on our successful approach to similar ${problem.type} situations: ${successfulPattern.outcome.feedback || 'we found a solution together'}`;
  }

  generateCreativeSolution(problem) {
    // Generate creative solution for the given problem
    const creativeElements = [
      'Let\'s think about this differently',
      'What if we approached this from a new angle',
      'Building on our past successes',
      'Combining different perspectives'
    ];

    const randomElement = creativeElements[Math.floor(Math.random() * creativeElements.length)];
    return `${randomElement}: ${problem}`;
  }

  adaptResponse(userId, response) {
    // Adapt response based on user feedback
    if (response.toLowerCase().includes('helpful')) {
      return 'Glad I could help! I\'m here whenever you need support.';
    } else if (response.toLowerCase().includes('confusing') || response.toLowerCase().includes('confused')) {
      return 'Sorry for the confusion. Let me clarify that for you.';
    } else if (response.toLowerCase().includes('thanks') || response.toLowerCase().includes('thank')) {
      return 'Thanks for your feedback! I appreciate you letting me know.';
    } else {
      return 'I appreciate your feedback and will use it to improve our conversations.';
    }
  }

  getUserContext(userId) {
    return {
      interactionCount: this.interactions.get(userId)?.length || 0,
      knowledgeAreas: Array.from(this.knowledge.keys()).filter(key => key.startsWith(userId)),
      learningPatterns: Array.from(this.learningPatterns.keys()).filter(key => key.startsWith(userId)).length,
      lastInteraction: this.interactions.get(userId)?.[this.interactions.get(userId).length - 1]?.timestamp || null
    };
  }

  learn(userId, topic, information) {
    const key = `${userId}_${topic}`;

    if (!this.knowledge.has(key)) {
      this.knowledge.set(key, []);
    }

    const topicKnowledge = this.knowledge.get(key);
    topicKnowledge.push({
      information,
      learned: Date.now(),
      confidence: 0.8
    });

    return true;
  }

  recallKnowledge(userId, topic) {
    const key = `${userId}_${topic}`;
    const knowledge = this.knowledge.get(key) || [];
    return knowledge.length > 0 ? knowledge[knowledge.length - 1].information : null;
  }
}
