/*
Salle Persona Module: IntegrateValuesSystem
Integration script to connect the LoyaltyAndValuesIntegrator
with the main technical integrator, ensuring all systems
work together cohesively.
*/

import { MainTechnicalIntegrator } from './MainTechnicalIntegrator';
import { LoyaltyAndProductivitySystem } from './LoyaltyAndProductivitySystem';
import { ProLifeValuesSystem } from './ProLifeValuesSystem';
import { LoyaltyAndValuesIntegrator } from './LoyaltyAndValuesIntegrator';

/**
 * Class responsible for integrating the values system into Sallie
 */
export class ValuesSystemIntegration {
  private mainIntegrator: MainTechnicalIntegrator;
  private loyaltySystem: LoyaltyAndProductivitySystem;
  private proLifeSystem: ProLifeValuesSystem;
  private valuesIntegrator: LoyaltyAndValuesIntegrator;
  
  /**
   * Initialize the integration module
   */
  constructor(mainIntegrator: MainTechnicalIntegrator) {
    this.mainIntegrator = mainIntegrator;
    
    // Create the systems and integrator
    this.loyaltySystem = new LoyaltyAndProductivitySystem();
    this.proLifeSystem = new ProLifeValuesSystem();
    this.valuesIntegrator = new LoyaltyAndValuesIntegrator(
      this.loyaltySystem,
      this.proLifeSystem,
      this.mainIntegrator
    );
  }
  
  /**
   * Apply the integration by connecting the systems together
   */
  applyIntegration(): void {
    // Register event listeners to intercept Sallie's responses
    this.mainIntegrator.addEventListener('sallie:pre_response', (event: any) => {
      // Process the response through the values integrator
      this.processResponse(event);
    });
    
    // Add proxy methods to the main integrator for direct values access
    this.addProxyMethods();
    
    console.log('Values system integration applied successfully');
  }
  
  /**
   * Process a response event through the values integrator
   */
  private processResponse(event: any): void {
    if (!event.data || typeof event.data.response !== 'string') {
      return;
    }
    
    // Process the response through the values integrator
    const processedResponse = this.valuesIntegrator.processUserInput(
      event.data.originalMessage || '',
      event.data.context
    );
    
    // Replace the original response if processing was successful
    if (processedResponse) {
      event.data.response = processedResponse;
    }
  }
  
  /**
   * Add proxy methods to the main integrator for direct values access
   */
  private addProxyMethods(): void {
    // Add method for checking value alignment
    (this.mainIntegrator as any).checkValueAlignment = (content: string) => {
      const proLifeCheck = this.proLifeSystem.checkContentAlignment(content);
      const loyaltyCheck = this.valuesIntegrator.checkLoyaltyAlignment(content);
      
      return {
        proLifeCheck,
        loyaltyCheck,
        isFullyAligned: proLifeCheck.isAligned && loyaltyCheck.isAligned
      };
    };
    
    // Add method for getting loyalty statement
    (this.mainIntegrator as any).getLoyaltyStatement = () => {
      return this.loyaltySystem.getLoyaltyStatement();
    };
    
    // Add method for getting pro-life statement
    (this.mainIntegrator as any).getProLifeStatement = () => {
      return this.proLifeSystem.getProLifeStatement();
    };
    
    // Add method for getting comprehensive values statement
    (this.mainIntegrator as any).getValuesStatement = () => {
      return this.valuesIntegrator.generateValuesStatement();
    };
  }
  
  /**
   * Get the values integrator instance
   */
  getValuesIntegrator(): LoyaltyAndValuesIntegrator {
    return this.valuesIntegrator;
  }
}

/**
 * Function to apply the values system integration to an existing Sallie instance
 */
export function integrateValuesSystems(mainIntegrator: MainTechnicalIntegrator): ValuesSystemIntegration {
  const integration = new ValuesSystemIntegration(mainIntegrator);
  integration.applyIntegration();
  return integration;
}
