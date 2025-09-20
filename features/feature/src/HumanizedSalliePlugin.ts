/*
Sallie Persona Module: HumanizedSalliePlugin
Plugin for the core system to enable advanced human-like features.
Follows Sallie architecture, modularity, and privacy rules.
*/

import { HumanizedSallieBridge } from './HumanizedSallieBridge';

export class HumanizedSalliePlugin {
  private bridge: HumanizedSallieBridge;
  private pluginId: string = 'humanized-sallie-1.0';
  
  constructor() {
    this.bridge = new HumanizedSallieBridge();
  }
  
  /**
   * Register this plugin with the core system
   */
  register(): { id: string; handlers: Record<string, Function> } {
    return {
      id: this.pluginId,
      handlers: {
        processMessage: this.processMessage.bind(this),
        provideFeedback: this.provideFeedback.bind(this),
        getSuggestion: this.getSuggestion.bind(this),
        completeTask: this.completeTask.bind(this),
        checkActivity: this.checkActivity.bind(this),
      }
    };
  }
  
  /**
   * Process message with humanized features
   */
  private processMessage(userId: string, message: string): string {
    return this.bridge.handleMessage(userId, message);
  }
  
  /**
   * Handle user feedback for learning
   */
  private provideFeedback(userId: string, feedback: string): void {
    this.bridge.provideFeedback(userId, feedback);
  }
  
  /**
   * Get proactive suggestion
   */
  private getSuggestion(userId: string): string {
    return this.bridge.getProactiveSuggestion(userId);
  }
  
  /**
   * Complete task for user
   */
  private completeTask(userId: string, task: string): string {
    return this.bridge.completeTask(userId, task);
  }
  
  /**
   * Check if user is active
   */
  private checkActivity(userId: string, threshold?: number): boolean {
    return this.bridge.isUserActive(userId, threshold);
  }
}
