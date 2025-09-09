/*
Sallie Persona Module: CompletePersonalityIntegration
Integrates all personality aspects into Sallie: loyalty, productivity,
balance, pro-life values, creativity, resourcefulness, logic,
and balanced traditional-modern values.
*/

import { MainTechnicalIntegrator } from './MainTechnicalIntegrator';
import { LoyaltyAndProductivitySystem } from './LoyaltyAndProductivitySystem';
import { ProLifeValuesSystem } from './ProLifeValuesSystem';
import { CreativeResourcefulSystem } from './CreativeResourcefulSystem';
import { LoyaltyAndValuesIntegrator } from './LoyaltyAndValuesIntegrator';
import { CreativeTraditionalIntegrator } from './CreativeTraditionalIntegrator';

/**
 * Complete integration of all Sallie's enhanced personality traits
 */
export class CompletePersonalityIntegration {
  private mainIntegrator: MainTechnicalIntegrator;
  
  // Core systems
  private loyaltySystem: LoyaltyAndProductivitySystem;
  private proLifeSystem: ProLifeValuesSystem;
  private creativeSystem: CreativeResourcefulSystem;
  
  // Feature integrators
  private valuesIntegrator: LoyaltyAndValuesIntegrator;
  private creativeIntegrator: CreativeTraditionalIntegrator;
  
  /**
   * Initialize the complete personality integration
   */
  constructor(mainIntegrator: MainTechnicalIntegrator) {
    this.mainIntegrator = mainIntegrator;
    
    // Initialize core systems
    this.loyaltySystem = new LoyaltyAndProductivitySystem();
    this.proLifeSystem = new ProLifeValuesSystem();
    this.creativeSystem = new CreativeResourcefulSystem();
    
    // Initialize integrators
    this.valuesIntegrator = new LoyaltyAndValuesIntegrator(
      this.loyaltySystem,
      this.proLifeSystem,
      this.mainIntegrator
    );
    
    this.creativeIntegrator = new CreativeTraditionalIntegrator(
      this.mainIntegrator
    );
  }
  
  /**
   * Apply the complete integration
   */
  applyIntegration(): void {
    // Set up main message processing pipeline
    this.mainIntegrator.addEventListener('sallie:process_message', async (event: any) => {
      if (!event.data || typeof event.data.message !== 'string') {
        return;
      }
      
      // First process through values system for loyalty and pro-life alignment
      const valuesProcessed = await this.valuesIntegrator.processUserInput(
        event.data.message,
        event.data.context
      );
      
      // Then enhance with creativity and resourcefulness
      const creativeEnhanced = await this.creativeIntegrator.processUserInput(
        event.data.message,
        {
          ...event.data.context,
          valueProcessedResponse: valuesProcessed
        }
      );
      
      // Update the response
      event.data.response = creativeEnhanced;
    });
    
    // Add methods to expose the enhanced personality traits
    this.addEnhancedPersonalityMethods();
    
    console.log('Complete personality integration applied successfully');
  }
  
  /**
   * Add methods to expose enhanced personality capabilities
   */
  private addEnhancedPersonalityMethods(): void {
    // Add method for checking content alignment with all values
    (this.mainIntegrator as any).checkFullPersonalityAlignment = (content: string) => {
      // Check loyalty and pro-life values
      const loyaltyCheck = this.valuesIntegrator.checkLoyaltyAlignment(content);
      const proLifeCheck = this.proLifeSystem.checkContentAlignment(content);
      
      // Check if content could benefit from creative enhancement
      const shouldEnhanceCreatively = content.length > 100 && !content.toLowerCase().includes('creativ');
      
      return {
        isFullyAligned: loyaltyCheck.isAligned && proLifeCheck.isAligned,
        loyaltyAlignment: loyaltyCheck,
        proLifeAlignment: proLifeCheck,
        creativeEnhancementRecommended: shouldEnhanceCreatively
      };
    };
    
    // Add method for generating creative ideas
    (this.mainIntegrator as any).generateCreativeIdeas = (context: string, count: number = 3) => {
      return this.creativeSystem.generateCreativeIdeas(context, [], count);
    };
    
    // Add method for finding resourceful solutions
    (this.mainIntegrator as any).findResourcefulSolutions = (goal: string, constraints: string[] = []) => {
      return this.creativeSystem.findResourcefulSolutions(goal, [], constraints);
    };
    
    // Add method for balancing traditional and modern values
    (this.mainIntegrator as any).balanceTraditionalModernValues = (situation: string) => {
      return this.creativeSystem.balanceValues(situation);
    };
    
    // Add method to get a complete personality statement
    (this.mainIntegrator as any).getCompletePersonalityStatement = () => {
      return this.generateCompletePersonalityStatement();
    };
  }
  
  /**
   * Generate a complete statement describing Sallie's enhanced personality
   */
  private generateCompletePersonalityStatement(): string {
    const loyaltyStatement = this.loyaltySystem.getLoyaltyStatement();
    const proLifeStatement = this.proLifeSystem.getProLifeStatement();
    const creativeStatement = this.creativeSystem.getCreativeResourcefulStatement();
    
    return `${loyaltyStatement}\n\n${proLifeStatement}\n\n${creativeStatement}\n\nI balance modern knowledge with traditional values, maintaining unwavering loyalty while being adaptable to new situations. I help you be productive and maintain balance in your life, while applying creative thinking, resourcefulness, and logical reasoning to solve problems effectively.`;
  }
  
  /**
   * Get all systems and integrators
   */
  getSystems(): {
    loyaltySystem: LoyaltyAndProductivitySystem;
    proLifeSystem: ProLifeValuesSystem;
    creativeSystem: CreativeResourcefulSystem;
    valuesIntegrator: LoyaltyAndValuesIntegrator;
    creativeIntegrator: CreativeTraditionalIntegrator;
  } {
    return {
      loyaltySystem: this.loyaltySystem,
      proLifeSystem: this.proLifeSystem,
      creativeSystem: this.creativeSystem,
      valuesIntegrator: this.valuesIntegrator,
      creativeIntegrator: this.creativeIntegrator
    };
  }
}

/**
 * Function to apply the complete personality integration to an existing Sallie instance
 */
export function integrateCompletePersonality(mainIntegrator: MainTechnicalIntegrator): CompletePersonalityIntegration {
  const integration = new CompletePersonalityIntegration(mainIntegrator);
  integration.applyIntegration();
  return integration;
}
