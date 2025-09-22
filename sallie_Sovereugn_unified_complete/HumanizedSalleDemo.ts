/*
Salle Persona Module: HumanizedSalleDemo
Demonstrates the integration and usage of the humanized Sallie features.
Follows Salle architecture, modularity, and privacy rules.
*/

import { HumanizedSallePlugin } from './HumanizedSallePlugin';
import { PluginRegistry } from '../../core/PluginRegistry';
import { HumanizedSalleInitializer } from './HumanizedSalleInitializer';

export class HumanizedSalleDemo {
  private pluginRegistry: PluginRegistry;
  private initializer: HumanizedSalleInitializer;
  private plugin: HumanizedSallePlugin;
  
  constructor() {
    // Initialize components
    this.pluginRegistry = new PluginRegistry();
    this.initializer = new HumanizedSalleInitializer(this.pluginRegistry);
    this.plugin = new HumanizedSallePlugin();
  }
  
  /**
   * Run a demo showcasing humanized features
   */
  async runDemo(): Promise<void> {
    console.log('-------- Humanized Sallie Demo --------');
    
    // Initialize the system
    console.log('Initializing Humanized Sallie...');
    await this.initializer.initialize();
    console.log('Initialization complete');
    
    const userId = 'demo-user-123';
    
    // Example user interactions
    console.log('\n--- Cognitive Features ---');
    const reg = this.plugin.register();
    const response1 = reg.handlers.processMessage(userId, 'I have a problem with my project');
    console.log(`User: I have a problem with my project`);
    console.log(`Sallie: ${response1}`);
    
    // Provide feedback
    console.log('\n--- Learning from Feedback ---');
    reg.handlers.provideFeedback(userId, "That was really helpful!");
    const response2 = reg.handlers.processMessage(userId, 'Can you help me with another problem?');
    console.log(`User: Can you help me with another problem?`);
    console.log(`Sallie: ${response2}`);
    
    // Proactive help
    console.log('\n--- Proactive Help ---');
    const suggestion = reg.handlers.getSuggestion(userId);
    console.log(`Sallie (proactively): ${suggestion}`);
    
    // Task completion
    console.log('\n--- Task Completion ---');
    const taskResult = reg.handlers.completeTask(userId, 'Organize my meeting notes');
    console.log(`User: Can you organize my meeting notes?`);
    console.log(`Sallie: ${taskResult}`);
    
    console.log('\n-------- Demo Complete --------');
  }
}
