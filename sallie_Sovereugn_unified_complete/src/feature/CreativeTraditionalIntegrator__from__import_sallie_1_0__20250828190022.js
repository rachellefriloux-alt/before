/*
 * Persona: Tough love meets soul care.
 * Module: CreativeTraditionalIntegrator
 * Intent: Handle functionality for CreativeTraditionalIntegrator
 * Provenance-ID: 7cdd8fff-a4cc-4906-86e1-0b1d657b5b18
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Salle Persona Module: CreativeTraditionalIntegrator
 * Purpose: Integrates creative, resourceful, and traditional-modern value perspectives into responses.
 * Author: Migrated and enhanced for Sallie (JavaScript)
 * Privacy: No external network calls; local-only logic
 * Tone: Supportive, insightful, and balanced
 */

const TechnicalIntegrator = require('./TechnicalProwessModule');
const CreativeSystem = require('./CreativeSystem');

class CreativeTraditionalIntegrator {
  constructor() {
    this.technicalIntegrator = new TechnicalIntegrator();
    this.creativeSystem = new CreativeSystem();
  }

  /**
   * Determines if a response should be enhanced creatively
   */
  // eslint-disable-next-line no-unused-vars
  shouldEnhanceCreatively(userMessage, response) {
    const creativeTriggers = [
      'creative', 'resourceful', 'idea', 'innovate', 'brainstorm',
      'tradition', 'modern', 'value', 'change', 'limited', 'constraint', "can't afford", "don't have"
    ];
    return creativeTriggers.some(trigger => userMessage.toLowerCase().includes(trigger));
  }

  /**
   * Enhance a response with creative, resourceful, and balanced value perspectives
   */
  // eslint-disable-next-line no-unused-vars
  enhanceResponseCreatively(response, userMessage, context = {}) {
    const creativeIdeas = this.creativeSystem.generateCreativeIdeas(userMessage, [], 1);
    const isResourceConstrained = [
      'limited', 'constraint', "can't afford", "don't have"
    ].some(trigger => userMessage.toLowerCase().includes(trigger));
    let resourcefulTip = '';
    if (isResourceConstrained) {
      const solution = this.creativeSystem.findResourcefulSolutions(userMessage, [], ['limited resources']);
      resourcefulTip = `\n\nHere's a resourceful approach: ${solution.approach}\nKey step: ${solution.steps[0]}`;
    }
    const hasValuesTension = [
      'tradition', 'modern', 'value', 'change'
    ].some(trigger => userMessage.toLowerCase().includes(trigger));
    let valuesPerspective = '';
    if (hasValuesTension) {
      const balancedView = this.creativeSystem.balanceValues(userMessage);
      valuesPerspective = `\n\n${balancedView.balancedApproach}`;
    }
    let creativeEnhancement = '';
    if (creativeIdeas.length > 0) {
      creativeEnhancement = `\n\nCreative perspective: ${creativeIdeas[0]}`;
    }
    let enhancedResponse = response;
    if (creativeEnhancement) enhancedResponse += creativeEnhancement;
    if (resourcefulTip) enhancedResponse += resourcefulTip;
    if (valuesPerspective) enhancedResponse += valuesPerspective;
    return enhancedResponse;
  }

  /**
   * Process user input with creative, resourceful, and logical enhancements
   */
  async processUserInput(input, context = {}) {
    const isCreativeRequest = [
      'creative', 'resourceful', 'idea', 'innovate', 'brainstorm'
    ].some(trigger => input.toLowerCase().includes(trigger));
    let response = '';
    if (isCreativeRequest) {
      response = this.generateCreativeResponse(input, context);
    } else {
      response = await this.technicalIntegrator.handleUserMessage(input, context);
      if (this.shouldEnhanceCreatively(input, response)) {
        response = this.enhanceResponseCreatively(response, input, context);
      }
    }
    return response;
  }

  /**
   * Generate a response focused on creativity and resourcefulness
   */
  // eslint-disable-next-line no-unused-vars
  generateCreativeResponse(input, context = {}) {
    const ideas = this.creativeSystem.generateCreativeIdeas(input, [], 3);
    const solution = this.creativeSystem.findResourcefulSolutions(input);
    const reasoning = this.creativeSystem.applyLogicalReasoning(input);
    const valueBalance = this.creativeSystem.balanceValues(input);
    let response = 'Here are some creative perspectives on your request:\n\n';
    response += '**Creative Ideas**:\n';
    ideas.forEach((idea, index) => {
      response += `${index + 1}. ${idea}\n`;
    });
    response += '\n**Resourceful Approach**:\n';
    response += `${solution.approach}\n`;
    response += 'Key steps:\n';
    // eslint-disable-next-line no-unused-vars
    solution.steps.slice(0, 2).forEach((step, index) => {
      response += `- ${step}\n`;
    });
    if ([
      'problem', 'issue', 'decide', 'analyze'
    ].some(trigger => input.toLowerCase().includes(trigger))) {
      response += '\n**Logical Perspective**:\n';
      response += `${reasoning.analysis}\n`;
    }
    if ([
      'tradition', 'modern', 'value', 'moral', 'ethic'
    ].some(trigger => input.toLowerCase().includes(trigger))) {
      response += '\n**Balanced Values Approach**:\n';
      response += `${valueBalance.balancedApproach}\n`;
    }
    return response;
  }

  /**
   * Get a statement about creativity, resourcefulness, and balanced values
   */
  getCreativeResourcefulStatement() {
    return this.creativeSystem.getCreativeResourcefulStatement();
  }
}

module.exports = CreativeTraditionalIntegrator;
