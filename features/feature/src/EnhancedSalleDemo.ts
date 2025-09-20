/*
Sallie Persona Module: EnhancedSalleDemo
Demonstrates the integration and usage of all enhanced humanized Sallie features.
Follows Sallie architecture, modularity, and privacy rules.
*/

import { EnhancedHumanizedOrchestrator } from './EnhancedHumanizedOrchestrator';
import { AdvancedMemorySystem } from './AdvancedMemorySystem';
import { RelationshipTrustSystem } from './RelationshipTrustSystem';
import { AdaptiveConversationSystem } from './AdaptiveConversationSystem';

export class EnhancedSalleDemo {
  private orchestrator: EnhancedHumanizedOrchestrator;
  private memory: AdvancedMemorySystem;
  private relationship: RelationshipTrustSystem;
  private conversation: AdaptiveConversationSystem;
  
  constructor() {
    this.orchestrator = new EnhancedHumanizedOrchestrator();
    this.memory = new AdvancedMemorySystem();
    this.relationship = new RelationshipTrustSystem();
    this.conversation = new AdaptiveConversationSystem();
  }
  
  /**
   * Run a comprehensive demo of all enhanced features
   */
  async runDemo(): Promise<void> {
    console.log('========== Enhanced Sallie Demo ==========');
    const userId = 'demo-user-123';
    
    console.log('\n----- Basic Conversation -----');
    await this.simulateConversation(userId, [
      "Hi there, I'm Alex.",
      "What can you help me with today?",
      "I'm working on a new project and feeling a bit overwhelmed."
    ]);
    
    console.log('\n----- Building Relationship -----');
    await this.simulateConversation(userId, [
      "You gave some good advice, thanks!",
      "I've been working with you for a while now.",
      "I really appreciate how you understand my needs."
    ]);
    
    // Show relationship development
    const relationshipStatus = this.relationship.getRelationshipStatus(userId);
    console.log(`\nRelationship Status: Trust Score ${relationshipStatus?.trustScore || 'N/A'}`);
    
    console.log('\n----- Technical Task Handling -----');
    await this.simulateConversation(userId, [
      "Can you help me organize my project files?",
      "That was helpful. Could you also create a schedule for the next sprint?",
      "Perfect, thanks for automating that task!"
    ]);
    
    console.log('\n----- Emotional Intelligence -----');
    await this.simulateConversation(userId, [
      "I'm feeling really stressed about this deadline.",
      "Thanks for understanding. It helps to talk about it.",
      "I'm actually feeling much better now! :)"
    ]);
    
    console.log('\n----- Memory and Recall -----');
    await this.simulateConversation(userId, [
      "Remember when we talked about the project organization?",
      "Can you recall what I was stressed about earlier?",
      "Do you remember my name from the beginning of our conversation?"
    ]);
    
    console.log('\n----- Processing Feedback -----');
    this.orchestrator.processFeedback(userId, "You've been incredibly helpful today", 5);
    this.orchestrator.processFeedback(userId, "Your memory capabilities are impressive", 5);
    
    const summary = this.orchestrator.getUserRelationshipSummary(userId);
    console.log('\n----- User Relationship Summary -----');
    console.log(`Trust Level: ${summary.trustLevel}`);
    console.log(`Recent Interactions: ${summary.conversationHistory.length}`);
    console.log(`Stored Memories: ${summary.memories.length}`);
    
    console.log('\n========== Demo Complete ==========');
  }
  
  /**
   * Simulate a conversation with multiple turns
   */
  private async simulateConversation(userId: string, messages: string[]): Promise<void> {
    for (const message of messages) {
      console.log(`\nUser: ${message}`);
      const response = await this.orchestrator.processInput(userId, message);
      console.log(`Sallie: ${response}`);
      
      // Small delay for readability
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
