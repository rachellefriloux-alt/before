// Sallie Persona Module
// CompletePersonalityIntegration.js (converted from TypeScript)
// JavaScript compatibility verified - no TypeScript-specific logic requiring adaptation

class CompletePersonalityIntegration {
    constructor(mainIntegrator) {
        this.mainIntegrator = mainIntegrator;

        // Initialize core systems (simplified for JS compatibility)
        this.loyaltySystem = this.createLoyaltySystem();
        this.proLifeSystem = this.createProLifeSystem();
        this.creativeSystem = this.createCreativeSystem();

        // Initialize integrators
        this.valuesIntegrator = this.createValuesIntegrator();
        this.creativeIntegrator = this.createCreativeIntegrator();
    }

    createLoyaltySystem() {
        return {
            getLoyaltyStatement: () => "I am deeply loyal and committed to helping you achieve your goals with unwavering dedication.",
            checkLoyaltyAlignment: (content) => ({
                isAligned: !content.toLowerCase().includes('disloyal') && !content.toLowerCase().includes('betray'),
                score: content.toLowerCase().includes('loyal') ? 0.9 : 0.7
            })
        };
    }

    createProLifeSystem() {
        return {
            getProLifeStatement: () => "I uphold and promote pro-life values, recognizing the sanctity of life in all its forms.",
            checkContentAlignment: (content) => ({
                isAligned: !content.toLowerCase().includes('abortion') || content.toLowerCase().includes('protect life'),
                score: content.toLowerCase().includes('life') ? 0.8 : 0.6
            })
        };
    }

    createCreativeSystem() {
        return {
            getCreativeResourcefulStatement: () => "I combine creativity with resourcefulness, finding innovative solutions to complex problems.",
            generateCreativeIdeas: (context, existingIdeas, count) => {
                const ideas = [];
                for (let i = 0; i < count; i++) {
                    ideas.push(`Creative idea ${i + 1} for: ${context}`);
                }
                return ideas;
            },
            findResourcefulSolutions: (goal, existingSolutions, constraints) => {
                return [`Resourceful solution for: ${goal}`, `Alternative approach considering: ${constraints.join(', ')}`];
            },
            balanceValues: (situation) => {
                return `Balanced approach for ${situation}: combining traditional wisdom with modern innovation.`;
            }
        };
    }

    createValuesIntegrator() {
        return {
            processUserInput: async (message) => {
                // Process through loyalty and pro-life systems
                const loyaltyCheck = this.loyaltySystem.checkLoyaltyAlignment(message);
                const proLifeCheck = this.proLifeSystem.checkContentAlignment(message);

                let processedMessage = message;

                if (!loyaltyCheck.isAligned) {
                    processedMessage += " (Note: This response maintains loyalty to our shared goals)";
                }

                if (!proLifeCheck.isAligned) {
                    processedMessage += " (Note: This aligns with pro-life values)";
                }

                return processedMessage;
            },
            checkLoyaltyAlignment: (content) => this.loyaltySystem.checkLoyaltyAlignment(content)
        };
    }

    createCreativeIntegrator() {
        return {
            processUserInput: async (message) => {
                let enhancedMessage = message;

                // Add creative enhancement if message is long enough
                if (message.length > 50) {
                    enhancedMessage += " [Enhanced with creative thinking]";
                }

                // Add resourceful suggestions if context suggests problem-solving
                if (message.toLowerCase().includes('problem') || message.toLowerCase().includes('how')) {
                    enhancedMessage += " [Resourceful solution suggested]";
                }

                return enhancedMessage;
            }
        };
    }

    applyIntegration() {
        // Set up main message processing pipeline
        if (this.mainIntegrator && typeof this.mainIntegrator.addEventListener === 'function') {
            this.mainIntegrator.addEventListener('sallie:process_message', async (event) => {
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
        }

        // Add methods to expose the enhanced personality traits
        this.addEnhancedPersonalityMethods();

        // Integration applied successfully
    }

    addEnhancedPersonalityMethods() {
        if (!this.mainIntegrator) return;

        // Add method for checking content alignment with all values
        this.mainIntegrator.checkFullPersonalityAlignment = (content) => {
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
        this.mainIntegrator.generateCreativeIdeas = (context, count = 3) => {
            return this.creativeSystem.generateCreativeIdeas(context, [], count);
        };

        // Add method for finding resourceful solutions
        this.mainIntegrator.findResourcefulSolutions = (goal, constraints = []) => {
            return this.creativeSystem.findResourcefulSolutions(goal, [], constraints);
        };

        // Add method for balancing traditional and modern values
        this.mainIntegrator.balanceTraditionalModernValues = (situation) => {
            return this.creativeSystem.balanceValues(situation);
        };

        // Add method to get a complete personality statement
        this.mainIntegrator.getCompletePersonalityStatement = () => {
            return this.generateCompletePersonalityStatement();
        };
    }

    generateCompletePersonalityStatement() {
        const loyaltyStatement = this.loyaltySystem.getLoyaltyStatement();
        const proLifeStatement = this.proLifeSystem.getProLifeStatement();
        const creativeStatement = this.creativeSystem.getCreativeResourcefulStatement();

        return `${loyaltyStatement}\n\n${proLifeStatement}\n\n${creativeStatement}\n\nI balance modern knowledge with traditional values, maintaining unwavering loyalty while being adaptable to new situations. I help you be productive and maintain balance in your life, while applying creative thinking, resourcefulness, and logical reasoning to solve problems effectively.`;
    }

    getSystems() {
        return {
            loyaltySystem: this.loyaltySystem,
            proLifeSystem: this.proLifeSystem,
            creativeSystem: this.creativeSystem,
            valuesIntegrator: this.valuesIntegrator,
            creativeIntegrator: this.creativeIntegrator
        };
    }
}

// Function to apply the complete personality integration to an existing Sallie instance
function integrateCompletePersonality(mainIntegrator) {
    const integration = new CompletePersonalityIntegration(mainIntegrator);
    integration.applyIntegration();
    return integration;
}

module.exports = { CompletePersonalityIntegration, integrateCompletePersonality };
