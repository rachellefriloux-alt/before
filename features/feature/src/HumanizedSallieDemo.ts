/*
Sallie Persona Module: HumanizedSallieDemo
Demonstrates the integration and usage of the humanized Sallie features.
Follows Sallie architecture, modularity, and privacy rules.
*/

import { HumanizedSalliePlugin } from './HumanizedSalliePlugin';
import { PluginRegistry } from '../../../core/PluginRegistry';
import { HumanizedSallieInitializer } from './HumanizedSallieInitializer';

export class HumanizedSallieDemo {
  private pluginRegistry: PluginRegistry;
  private initializer: HumanizedSallieInitializer;
  private plugin: HumanizedSalliePlugin;
  
  constructor() {
    // Initialize components
    this.pluginRegistry = new PluginRegistry();
    this.initializer = new HumanizedSallieInitializer(this.pluginRegistry);
    this.plugin = new HumanizedSalliePlugin();
    
    // Note: Plugin registration is handled by the initializer
  }
  
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
