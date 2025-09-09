/*
Sallie Persona Module: HumanizedSallieOrchestrator
Integrates all advanced human-like features (cognitive, emotional, technical, proactive, personalization)
into a cohesive system that functions with human-like qualities and awareness.
Follows Sallie architecture, modularity, and privacy rules.
*/

import { CognitiveModule } from './CognitiveModule';
import { EmotionalIntelligenceModule } from './EmotionalIntelligenceModule';
import { TechnicalProwessModule } from './TechnicalProwessModule';
import { ProactiveHelperModule } from './ProactiveHelperModule';
import { PersonalizationModule } from './PersonalizationModule';

export class HumanizedSallieOrchestrator {
  private cognitive: CognitiveModule;
  private emotional: EmotionalIntelligenceModule;
  private technical: TechnicalProwessModule;
  private proactive: ProactiveHelperModule;
  private personalization: PersonalizationModule;
  
  constructor() {
    this.cognitive = new CognitiveModule();
    this.emotional = new EmotionalIntelligenceModule();
    this.technical = new TechnicalProwessModule();
    this.proactive = new ProactiveHelperModule();
    this.personalization = new PersonalizationModule();
    
    // Set default permissions
    this.technical.setPermissions('default', ['read']);
  }
  
  /**
   * Process a user input comprehensively using all humanized modules
   */
  processInput(userId: string, input: string): string {
    // Log the interaction for memory
    this.proactive.logActivity(input);
    
    // Detect emotional context
    const mood = this.emotional.detectMood(input);
    
    // Generate appropriate response based on context
    let response = '';
    
    // Check if this is a technical task
    if (input.toLowerCase().includes('task') || input.toLowerCase().includes('automation')) {
      response = this.technical.automateTask(input, userId);
    }
    // Check if user needs emotional support
    else if (mood === 'sad' || mood === 'angry') {
      response = this.emotional.respondWithEmpathy(input);
    }
    // Check if this is a problem to solve
    else if (input.toLowerCase().includes('problem') || input.toLowerCase().includes('help with')) {
      const knowledge = this.cognitive.recallKnowledge(userId, 'preferences');
      response = this.cognitive.solveProblem(input, { userId, preferences: knowledge });
    }
    // Check if this is humor
    else if (input.toLowerCase().includes('joke') || input.toLowerCase().includes('funny')) {
      response = this.emotional.interpretHumor(input);
    }
    // Default to personalized response
    else {
      response = this.personalization.personalizeResponse(userId, "I'm considering how best to help you.");
    }
    
    // Log interaction in memory systems
    this.cognitive.logInteraction(userId, input, response);
    this.personalization.logInteraction(userId, input);
    
    return response;
  }
  
  /**
   * Generate proactive suggestions based on user context
   */
  generateProactiveSuggestion(userId: string): string {
    return this.proactive.suggestNextAction();
  }
  
  /**
   * Learn from user feedback to improve future interactions
   */
  learnFromFeedback(userId: string, feedback: string): void {
    if (feedback.toLowerCase().includes('like') || feedback.toLowerCase().includes('good')) {
      this.personalization.updateProfile(userId, 'satisfaction', 'high');
    } else if (feedback.toLowerCase().includes('dislike') || feedback.toLowerCase().includes('bad')) {
      this.personalization.updateProfile(userId, 'satisfaction', 'low');
    }
    
    // Adapt cognitive approaches based on feedback
    this.cognitive.adaptResponse(userId, feedback);
  }
  
  /**
   * Integrate with system or external API
   */
  integrateSystem(userId: string, system: string, data: any): string {
    return this.technical.integrateWithAPI(system, data, userId);
  }
  
  /**
   * Complete a task independently for the user
   */
  completeTaskForUser(userId: string, task: string): string {
    return this.technical.completeTaskIndependently(task, userId);
  }
}
