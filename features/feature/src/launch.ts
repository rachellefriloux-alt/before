/*
Salle Persona Module: launch.ts
Entry point for launching the humanized Sallie system.
Follows Salle architecture, modularity, and privacy rules.
*/

import { HumanizedSalleDemo } from './HumanizedSalleDemo';
import { EnhancedSalleDemo } from './EnhancedSalleDemo';

// Launch the demo when this script is executed directly
async function main() {
  try {
    const demoType = process.argv[2] || 'basic';
    
    if (demoType === 'enhanced') {
      console.log('Launching Enhanced Humanized Sallie System');
      const enhancedDemo = new EnhancedSalleDemo();
      await enhancedDemo.runDemo();
    } else {
      console.log('Launching Basic Humanized Sallie System');
      const demo = new HumanizedSalleDemo();
      await demo.runDemo();
    }
    
    console.log('\nDemo completed successfully. Run with "enhanced" parameter for the advanced demo:');
    console.log('ts-node feature/src/launch.ts enhanced');
  } catch (error) {
    console.error('Error launching Humanized Sallie:', error);
  }
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

// Export components for programmatic usage
export * from './HumanizedSalleOrchestrator';
export * from './HumanizedSalleBridge';
export * from './HumanizedSallePlugin';
export * from './HumanizedSalleInitializer';
export * from './HumanizedSalleDemo';
export * from './EnhancedHumanizedOrchestrator';
export * from './EnhancedSalleDemo';

// Export feature modules
export * from './CognitiveModule';
export * from './EmotionalIntelligenceModule';
export * from './TechnicalProwessModule';
export * from './ProactiveHelperModule';
export * from './PersonalizationModule';

// Export enhanced systems
export * from './AdvancedMemorySystem';
export * from './AdvancedLanguageUnderstanding';
export * from './RelationshipTrustSystem';
export * from './AdaptiveConversationSystem';
