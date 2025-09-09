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

// Define event interfaces for type safety
interface ResponseEvent {
  data: {
    response: string;
    originalMessage?: string;
    context?: any;
  };
}

interface ValueAlignmentResult {
  isAligned: boolean;
  reason?: string;
}

interface AlignmentCheckResult {
  proLifeCheck: ValueAlignmentResult;
  loyaltyCheck: ValueAlignmentResult;
  isFullyAligned: boolean;
}

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
    try {
      // Register event listeners to intercept Sallie's responses
      this.mainIntegrator.addEventListener('sallie:pre_response', (event: ResponseEvent) => {
        // Process the response through the values integrator
        this.processResponse(event);
      });
      
      // Add proxy methods to the main integrator for direct values access
      this.addProxyMethods();
      
      console.log('Values system integration applied successfully');
    } catch (error) {
      console.error('Failed to apply values system integration:', error);
      throw error;
    }
  }
  
  /**
   * Process a response event through the values integrator
   */
  private processResponse(event: ResponseEvent): void {
    if (!event.data || typeof event.data.response !== 'string') {
      console.warn('Invalid response event data structure');
      return;
    }
    
    try {
      // Process the response through the values integrator
      const originalMessage = event.data.originalMessage || '';
      const context = event.data.context || {};
      
      const processedResponse = this.valuesIntegrator.processUserInput(
        originalMessage,
        context
      );
      
      // Replace the original response if processing was successful
      if (processedResponse && typeof processedResponse === 'string') {
        event.data.response = processedResponse;
      }
    } catch (error) {
      console.error('Error processing response through values integrator:', error);
      // Don't modify the response in case of error
    }
  }
  
  /**
   * Add proxy methods to the main integrator for direct values access
   */
  private addProxyMethods(): void {
    // Add method for checking value alignment
    (this.mainIntegrator as any).checkValueAlignment = (content: string): AlignmentCheckResult => {
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content for value alignment check');
      }
      
      const proLifeCheck = this.proLifeSystem.checkContentAlignment(content);
      const loyaltyCheck = this.valuesIntegrator.checkLoyaltyAlignment(content);
      
      return {
        proLifeCheck,
        loyaltyCheck,
        isFullyAligned: proLifeCheck.isAligned && loyaltyCheck.isAligned
      };
    };
    
    // Add method for getting loyalty statement
    (this.mainIntegrator as any).getLoyaltyStatement = (): string => {
      return this.loyaltySystem.getLoyaltyStatement();
    };
    
    // Add method for getting pro-life statement
    (this.mainIntegrator as any).getProLifeStatement = (): string => {
      return this.proLifeSystem.getProLifeStatement();
    };
    
    // Add method for getting comprehensive values statement
    (this.mainIntegrator as any).getValuesStatement = (): string => {
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
  if (!mainIntegrator) {
    throw new Error('Main integrator is required for values system integration');
  }
  
  const integration = new ValuesSystemIntegration(mainIntegrator);
  integration.applyIntegration();
  return integration;
}
