/*
Salle Persona Module: CreativeTraditionalIntegrator
Integrates creative, resourceful, and logical capabilities with
traditional values into Sallie's core functionality, while
maintaining adaptability to modern contexts.
*/

import { CreativeResourcefulSystem } from './CreativeResourcefulSystem';
import { MainTechnicalIntegrator } from './MainTechnicalIntegrator';
import { LoyaltyAndValuesIntegrator } from './LoyaltyAndValuesIntegrator';

interface CreativeSuggestion {
  type: 'idea' | 'resource' | 'logic' | 'value';
  content: string;
  context: string;
  relevanceScore: number; // 0-100
}

/**
 * Integrates creativity, resourcefulness, logic, and balanced traditional-modern
 * values into Sallie's core functionality
 */
export class CreativeTraditionalIntegrator {
  private creativeSystem: CreativeResourcefulSystem;
  private technicalIntegrator: MainTechnicalIntegrator;
  private valuesIntegrator: LoyaltyAndValuesIntegrator;
  
  private lastCreativeSuggestions: CreativeSuggestion[] = [];
  private creativityActivationThreshold: number = 75; // 0-100 scale
  
  /**
   * Initialize the integrator with required systems
   */
  constructor(
    creativeSystem: CreativeResourcefulSystem,
    technicalIntegrator: MainTechnicalIntegrator,
    valuesIntegrator: LoyaltyAndValuesIntegrator
  ) {
    this.creativeSystem = creativeSystem;
    this.technicalIntegrator = technicalIntegrator;
    this.valuesIntegrator = valuesIntegrator;
    
    // Set up event listeners for creative enhancement
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for pre-response events to enhance with creativity when appropriate
    this.technicalIntegrator.addEventListener('sallie:pre_response', (event) => {
      if (!event.data || typeof event.data.response !== 'string') {
        return;
      }
      
      // Check if the response could benefit from creative enhancement
      const shouldEnhance = this.shouldEnhanceCreatively(
        event.data.originalMessage || '',
        event.data.response
      );
      
      if (shouldEnhance) {
        // Enhance the response with creative elements
        event.data.response = this.enhanceResponseCreatively(
          event.data.response,
          event.data.originalMessage || '',
          event.data.context
        );
      }
    });
  }
  
  /**
   * Determine if a response should be enhanced with creative elements
   */
  private shouldEnhanceCreatively(userMessage: string, response: string): boolean {
    // Check if the message explicitly requests creative thinking
    const explicitCreativeRequest = 
      userMessage.toLowerCase().includes('creative') ||
      userMessage.toLowerCase().includes('idea') ||
      userMessage.toLowerCase().includes('innovative') ||
      userMessage.toLowerCase().includes('think of') ||
      userMessage.toLowerCase().includes('brainstorm');
      
    if (explicitCreativeRequest) {
      return true;
    }
    
    // Check if the response seems factual/technical and could use creative enhancement
    const isFactualResponse = 
      response.split('.').length > 3 && // Multiple sentences
      !response.includes('?') && // No questions (likely not already creative)
      !response.includes('idea') && // Not already mentioning ideas
      !response.includes('creativ'); // Not already mentioning creativity
      
    // Check if the message involves problem-solving
    const isProblemSolving =
      userMessage.toLowerCase().includes('how can') ||
      userMessage.toLowerCase().includes('how to') ||
      userMessage.toLowerCase().includes('solve') ||
      userMessage.toLowerCase().includes('solution') ||
      userMessage.toLowerCase().includes('approach');
      
    // Enhance if it's a problem-solving request with a factual response
    return isProblemSolving && isFactualResponse;
  }
  
  /**
   * Enhance a response with creative elements
   */
  private enhanceResponseCreatively(
    response: string,
    userMessage: string,
    context: any
  ): string {
    // Generate creative ideas related to the message
    const creativeIdeas = this.creativeSystem.generateCreativeIdeas(
      userMessage,
      [],
      1
    );
    
    // Generate resourceful solution if this seems to be a constrained situation
    const isResourceConstrained = 
      userMessage.toLowerCase().includes('limited') ||
      userMessage.toLowerCase().includes('constraint') ||
      userMessage.toLowerCase().includes('can\'t afford') ||
      userMessage.toLowerCase().includes('don\'t have');
      
    let resourcefulTip = '';
    if (isResourceConstrained) {
      const solution = this.creativeSystem.findResourcefulSolutions(
        userMessage,
        [],
        ['limited resources']
      );
      
      resourcefulTip = `\n\nHere's a resourceful approach: ${solution.approach}\nKey step: ${solution.steps[0]}`;
    }
    
    // Check if this involves a traditional vs modern value tension
    const hasValuesTension = 
      userMessage.toLowerCase().includes('tradition') ||
      userMessage.toLowerCase().includes('modern') ||
      userMessage.toLowerCase().includes('value') ||
      userMessage.toLowerCase().includes('change');
      
    let valuesPerspective = '';
    if (hasValuesTension) {
      const balancedView = this.creativeSystem.balanceValues(userMessage);
      valuesPerspective = `\n\n${balancedView.balancedApproach}`;
    }
    
    // Add a creative enhancement if we have ideas
    let creativeEnhancement = '';
    if (creativeIdeas.length > 0) {
      creativeEnhancement = `\n\nCreative perspective: ${creativeIdeas[0]}`;
    }
    
    // Build the enhanced response
    let enhancedResponse = response;
    
    // Only add enhancements that are relevant
    if (creativeEnhancement) {
      enhancedResponse += creativeEnhancement;
    }
    
    if (resourcefulTip) {
      enhancedResponse += resourcefulTip;
    }
    
    if (valuesPerspective) {
      enhancedResponse += valuesPerspective;
    }
    
    return enhancedResponse;
  }
  
  /**
   * Process user input with creative, resourceful, and logical enhancements
   */
  async processUserInput(input: string, context?: any): Promise<string> {
    // First, check if this is explicitly asking for creative/resourceful input
    const isCreativeRequest = 
      input.toLowerCase().includes('creative') ||
      input.toLowerCase().includes('resourceful') ||
      input.toLowerCase().includes('idea') ||
      input.toLowerCase().includes('innovate') ||
      input.toLowerCase().includes('brainstorm');
      
    let response = '';
    
    if (isCreativeRequest) {
      // Generate dedicated creative response
      response = this.generateCreativeResponse(input, context);
    } else {
      // Process through normal channels
      response = await this.technicalIntegrator.handleUserMessage(input, context);
      
      // Check if we should enhance it
      if (this.shouldEnhanceCreatively(input, response)) {
        response = this.enhanceResponseCreatively(response, input, context);
      }
    }
    
    return response;
  }
  
  /**
   * Generate a response focused on creativity and resourcefulness
   */
  private generateCreativeResponse(input: string, context?: any): string {
    // Generate creative ideas
    const ideas = this.creativeSystem.generateCreativeIdeas(input, [], 3);
    
    // Generate resourceful solutions
    const solution = this.creativeSystem.findResourcefulSolutions(input);
    
    // Apply logical reasoning
    const reasoning = this.creativeSystem.applyLogicalReasoning(input);
    
    // Balance traditional and modern values
    const valueBalance = this.creativeSystem.balanceValues(input);
    
    // Compose response
    let response = 'Here are some creative perspectives on your request:\n\n';
    
    // Add ideas
    response += '**Creative Ideas**:\n';
    ideas.forEach((idea, index) => {
      response += `${index + 1}. ${idea}\n`;
    });
    
    // Add resourceful approach
    response += '\n**Resourceful Approach**:\n';
    response += `${solution.approach}\n`;
    response += 'Key steps:\n';
    solution.steps.slice(0, 2).forEach((step, index) => {
      response += `- ${step}\n`;
    });
    
    // Add logical perspective if appropriate
    if (input.toLowerCase().includes('problem') || 
        input.toLowerCase().includes('issue') ||
        input.toLowerCase().includes('decide') ||
        input.toLowerCase().includes('analyze')) {
      response += '\n**Logical Perspective**:\n';
      response += `${reasoning.analysis}\n`;
    }
    
    // Add values perspective if appropriate
    if (input.toLowerCase().includes('tradition') || 
        input.toLowerCase().includes('modern') ||
        input.toLowerCase().includes('value') ||
        input.toLowerCase().includes('moral') ||
        input.toLowerCase().includes('ethic')) {
      response += '\n**Balanced Values Approach**:\n';
      response += `${valueBalance.balancedApproach}\n`;
    }
    
    return response;
  }
  
  /**
   * Get a statement about creativity, resourcefulness, and balanced values
   */
  getCreativeResourcefulStatement(): string {
    return this.creativeSystem.getCreativeResourcefulStatement();
  }
}
