/*
Sallie Persona Module: HumanizedSallieBridge
Connects the humanized Sallie modules with the core system.
Follows Sallie architecture, modularity, and privacy rules.
*/

import { HumanizedSallieOrchestrator } from './HumanizedSallieOrchestrator';

export class HumanizedSallieBridge {
  private orchestrator: HumanizedSallieOrchestrator;
  private activeUserIds: Map<string, { lastActive: number }>;
  
  constructor() {
    this.orchestrator = new HumanizedSallieOrchestrator();
    this.activeUserIds = new Map();
  }
  
  /**
   * Handle incoming message and route to the humanized orchestrator
   */
  handleMessage(userId: string, message: string): string {
    this.trackUserActivity(userId);
    return this.orchestrator.processInput(userId, message);
  }
  
  /**
   * Provide feedback to the system for continuous learning
   */
  provideFeedback(userId: string, feedback: string): void {
    this.orchestrator.learnFromFeedback(userId, feedback);
  }
  
  /**
   * Get proactive suggestion for user
   */
  getProactiveSuggestion(userId: string): string {
    this.trackUserActivity(userId);
    return this.orchestrator.generateProactiveSuggestion(userId);
  }
  
  /**
   * Complete task for user
   */
  completeTask(userId: string, task: string): string {
    return this.orchestrator.completeTaskForUser(userId, task);
  }
  
  /**
   * Track user activity for engagement purposes
   */
  private trackUserActivity(userId: string): void {
    this.activeUserIds.set(userId, { lastActive: Date.now() });
  }
  
  /**
   * Check if user has been active recently
   */
  isUserActive(userId: string, thresholdMinutes: number = 30): boolean {
    const userData = this.activeUserIds.get(userId);
    if (!userData) return false;
    
    const thresholdMs = thresholdMinutes * 60 * 1000;
    return (Date.now() - userData.lastActive) < thresholdMs;
  }
}
