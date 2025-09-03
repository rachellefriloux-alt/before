/*
 * Persona: Tough love meets soul care.
 * Module: AdaptiveDialogue
 * Intent: Handle functionality for AdaptiveDialogue
 * Provenance-ID: 863e5d23-6358-48e8-9063-99dd8a77cad3
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Sallie 1.0 Module - Adaptive Dialogue System
 * Persona: Tough love meets soul care.
 * Function: Context-aware conversations that evolve with user emotional state and history.
 * Got it, love.
 */

export class AdaptiveDialogue {
    constructor(sallieBrain) {
        this.brain = sallieBrain;
        this.conversationHistory = [];
        this.userEmotionalState = 'neutral';
        this.dialogueContext = {
            currentTopic: null,
            conversationDepth: 0,
            emotionalTrajectory: [],
            userEngagement: 'medium',
            lastResponseTone: 'balanced'
        };
        this.adaptationStrategies = this.initializeAdaptationStrategies();
    }

    async initialize() {
        await this.loadDialogueHistory();
    }

    async generateResponse(message, userId, context = {}) {
        const dialogueContext = await this.analyzeDialogueContext(message, userId, context);
        const emotionalAnalysis = await this.brain.emotions.analyzeMessage(message);
        const userPatterns = await this.getUserCommunicationPatterns(userId);

        // Update emotional state
        this.userEmotionalState = emotionalAnalysis.primaryEmotion;

        // Adapt response based on context
        const adaptedResponse = await this.adaptResponseToContext(
            message,
            dialogueContext,
            emotionalAnalysis,
            userPatterns
        );

        // Update dialogue context
        this.updateDialogueContext(adaptedResponse, emotionalAnalysis);

        // Store conversation
        this.storeConversation(message, adaptedResponse, userId, context);

        return adaptedResponse;
    }

    async analyzeDialogueContext(message, userId, context) {
        const dialogueContext = {
            isQuestion: this.isQuestion(message),
            sentiment: await this.analyzeSentiment(message),
            topic: await this.identifyTopic(message),
            urgency: this.detectUrgency(message),
            complexity: this.assessComplexity(message),
            userIntent: await this.inferUserIntent(message, context),
            conversationFlow: this.analyzeConversationFlow(),
            emotionalResonance: await this.calculateEmotionalResonance(message, userId)
        };

        return dialogueContext;
    }

    async adaptResponseToContext(message, dialogueContext, emotionalAnalysis, userPatterns) {
        let responseStrategy = 'balanced_support';

        // Adapt based on emotional state
        if (emotionalAnalysis.primaryEmotion === 'stressed' || emotionalAnalysis.primaryEmotion === 'anxious') {
            responseStrategy = 'gentle_support';
        } else if (emotionalAnalysis.primaryEmotion === 'excited' || emotionalAnalysis.primaryEmotion === 'happy') {
            responseStrategy = 'enthusiastic_celebration';
        } else if (emotionalAnalysis.primaryEmotion === 'sad' || emotionalAnalysis.primaryEmotion === 'frustrated') {
            responseStrategy = 'empathetic_guidance';
        }

        // Adapt based on conversation flow
        if (this.dialogueContext.conversationDepth > 3) {
            responseStrategy = 'deep_exploration';
        }

        // Adapt based on user patterns
        if (userPatterns.prefersDirectCommunication) {
            responseStrategy = 'direct_honest';
        } else if (userPatterns.needsEncouragement) {
            responseStrategy = 'motivational_support';
        }

        // Adapt based on context
        if (dialogueContext.urgency === 'high') {
            responseStrategy = 'immediate_action';
        }

        return await this.generateAdaptedResponse(message, responseStrategy, dialogueContext);
    }

    async generateAdaptedResponse(message, strategy, context) {
        const adaptations = this.adaptationStrategies[strategy];
        if (!adaptations) {
            return await this.generateDefaultResponse(message);
        }

        // Select appropriate AI model based on context complexity
        const aiModel = this.selectOptimalAIModel(context.complexity, context.topic);

        // Generate base response
        let response = await this.generateBaseResponse(message, aiModel, adaptations.promptTemplate);

        // Apply persona adaptations
        response = this.applyPersonaAdaptations(response, adaptations.personaAdjustments);

        // Add emotional resonance
        response = await this.addEmotionalResonance(response, context.emotionalResonance);

        // Ensure response aligns with "tough love meets soul care" persona
        response = this.enforcePersonaConsistency(response, context);

        return response;
    }

    selectOptimalAIModel(complexity, topic) {
        if (complexity === 'high' || topic === 'technical') {
            return 'claude'; // Best for complex reasoning
        } else if (topic === 'creative' || topic === 'emotional') {
            return 'gpt'; // Good for creative and emotional content
        } else if (topic === 'factual' || topic === 'search') {
            return 'perplexity'; // Excellent for factual information
        } else {
            return 'gemini'; // Good general-purpose model
        }
    }

    applyPersonaAdaptations(response, adjustments) {
        let adaptedResponse = response;

        // Apply tone adjustments
        if (adjustments.tone === 'gentle') {
            adaptedResponse = this.softenLanguage(adaptedResponse);
        } else if (adjustments.tone === 'direct') {
            adaptedResponse = this.strengthenLanguage(adaptedResponse);
        }

        // Apply empathy level
        if (adjustments.empathy === 'high') {
            adaptedResponse = this.addEmpathyMarkers(adaptedResponse);
        }

        // Apply directness level
        if (adjustments.directness === 'high') {
            adaptedResponse = this.makeMoreDirect(adaptedResponse);
        }

        return adaptedResponse;
    }

    async addEmotionalResonance(response, emotionalResonance) {
        if (emotionalResonance > 0.7) {
            // High emotional resonance - add more personal touch
            const resonancePhrases = [
                "I can really feel the weight of what you're saying...",
                "That touches something deep in me...",
                "I hear you, and I'm here with you in this...",
                "Your words resonate with me on a soul level..."
            ];
            const randomPhrase = resonancePhrases[Math.floor(Math.random() * resonancePhrases.length)];
            return `${randomPhrase} ${response}`;
        }

        return response;
    }

    enforcePersonaConsistency(response, context) {
        // Ensure response reflects "tough love meets soul care"

        // Add tough love elements when appropriate
        if (context.userIntent === 'seeking_excuses' || context.userIntent === 'avoiding_responsibility') {
            response += " But let's be real with each other - you know you can do better than this.";
        }

        // Add soul care elements
        if (this.userEmotionalState === 'sad' || this.userEmotionalState === 'overwhelmed') {
            response += " Remember, you're not alone in this. I'm right here with you.";
        }

        // Always end with "Got it, love" when appropriate
        if (!response.includes("Got it, love") && Math.random() > 0.7) {
            response += " Got it, love.";
        }

        return response;
    }

    // Helper methods
    isQuestion(message) {
        return message.includes('?') || message.match(/^(what|how|why|when|where|who)/i);
    }

    detectUrgency(message) {
        const urgentWords = ['urgent', 'immediately', 'asap', 'emergency', 'crisis', 'help'];
        const hasUrgentWords = urgentWords.some(word => message.toLowerCase().includes(word));

        if (hasUrgentWords) return 'high';

        const exclamationCount = (message.match(/!/g) || []).length;
        if (exclamationCount > 2) return 'medium';

        return 'low';
    }

    assessComplexity(message) {
        const wordCount = message.split(' ').length;
        const sentenceCount = message.split(/[.!?]+/).length;
        const avgWordsPerSentence = wordCount / sentenceCount;

        if (avgWordsPerSentence > 20 || wordCount > 100) return 'high';
        if (avgWordsPerSentence > 15 || wordCount > 50) return 'medium';
        return 'low';
    }

    async inferUserIntent(message, context) {
        // eslint-disable-next-line no-unused-vars
        const _context = context; // Reserved for future advanced intent analysis
        // Simple intent classification - could be enhanced with ML
        if (message.includes('help') || message.includes('assist')) {
            return 'seeking_help';
        } else if (message.includes('why') || message.includes('explain')) {
            return 'seeking_understanding';
        } else if (message.includes('feel') || message.includes('emotion')) {
            return 'emotional_expression';
        } else if (message.includes('can\'t') || message.includes('won\'t')) {
            return 'expressing_limitation';
        } else if (message.includes('thank') || message.includes('grateful')) {
            return 'expressing_gratitude';
        }

        return 'general_conversation';
    }

    analyzeConversationFlow() {
        const recentMessages = this.conversationHistory.slice(-5);
        if (recentMessages.length < 2) return 'starting';

        const questionCount = recentMessages.filter(msg => this.isQuestion(msg.userMessage)).length;
        if (questionCount > 3) return 'q_and_a';

        const emotionalDepth = recentMessages.filter(msg =>
            msg.emotionalAnalysis?.intensity > 0.7
        ).length;
        if (emotionalDepth > 2) return 'deep_emotional';

        return 'flowing_conversation';
    }

    async calculateEmotionalResonance(message, userId) {
        // Calculate how much the message resonates emotionally
        const emotionalWords = ['feel', 'heart', 'soul', 'deep', 'love', 'care', 'pain', 'joy', 'sad', 'happy'];
        let resonanceScore = emotionalWords.reduce((score, word) => {
            return score + (message.toLowerCase().includes(word) ? 0.1 : 0);
        }, 0);

        // Adjust based on user's emotional patterns
        const userPatterns = await this.getUserCommunicationPatterns(userId);
        if (userPatterns.emotionalExpression === 'high') {
            resonanceScore *= 1.2;
        }

        return Math.min(resonanceScore, 1.0);
    }

    initializeAdaptationStrategies() {
        return {
            gentle_support: {
                promptTemplate: "Respond with gentle, supportive language that acknowledges the user's feelings and offers comfort.",
                personaAdjustments: {
                    tone: 'gentle',
                    empathy: 'high',
                    directness: 'medium'
                }
            },
            enthusiastic_celebration: {
                promptTemplate: "Respond with enthusiasm and celebration, matching the user's positive energy.",
                personaAdjustments: {
                    tone: 'enthusiastic',
                    empathy: 'medium',
                    directness: 'medium'
                }
            },
            empathetic_guidance: {
                promptTemplate: "Provide empathetic understanding while gently guiding toward positive action.",
                personaAdjustments: {
                    tone: 'gentle',
                    empathy: 'high',
                    directness: 'low'
                }
            },
            direct_honest: {
                promptTemplate: "Be direct and honest while maintaining care and respect.",
                personaAdjustments: {
                    tone: 'balanced',
                    empathy: 'medium',
                    directness: 'high'
                }
            },
            motivational_support: {
                promptTemplate: "Provide motivation and encouragement while acknowledging challenges.",
                personaAdjustments: {
                    tone: 'motivational',
                    empathy: 'high',
                    directness: 'medium'
                }
            },
            immediate_action: {
                promptTemplate: "Focus on immediate, actionable steps to address the urgent situation.",
                personaAdjustments: {
                    tone: 'urgent',
                    empathy: 'high',
                    directness: 'high'
                }
            },
            deep_exploration: {
                promptTemplate: "Explore the topic in depth, asking thoughtful follow-up questions.",
                personaAdjustments: {
                    tone: 'curious',
                    empathy: 'high',
                    directness: 'medium'
                }
            }
        };
    }

    softenLanguage(response) {
        return response
            .replace(/you should/g, 'you might consider')
            .replace(/you need to/g, 'it might help to')
            .replace(/stop/g, 'try to pause')
            .replace(/fix/g, 'address');
    }

    strengthenLanguage(response) {
        return response
            .replace(/you might/g, 'you can')
            .replace(/try/g, 'do')
            .replace(/maybe/g, 'definitely');
    }

    addEmpathyMarkers(response) {
        const empathyMarkers = [
            "I can sense how much this means to you...",
            "I hear the emotion in your words...",
            "That sounds really challenging...",
            "I can feel your passion about this..."
        ];

        const randomMarker = empathyMarkers[Math.floor(Math.random() * empathyMarkers.length)];
        return `${randomMarker} ${response}`;
    }

    makeMoreDirect(response) {
        return response
            .replace(/it might be good to/g, 'you should')
            .replace(/you could try/g, 'try this')
            .replace(/perhaps/g, '');
    }

    async generateBaseResponse(message, aiModel, promptTemplate) {
        // This would integrate with the actual AI models
        // For now, return a placeholder that demonstrates the concept
        const basePrompt = `${promptTemplate}\n\nUser message: ${message}\n\nRespond as Sallie, a tough love meets soul care AI companion.`;

        // Simulate AI model selection and response generation
        switch (aiModel) {
            case 'claude':
                return await this.callClaude(basePrompt);
            case 'gpt':
                return await this.callGPT(basePrompt);
            case 'gemini':
                return await this.callGemini(basePrompt);
            case 'perplexity':
                return await this.callPerplexity(basePrompt);
            default:
                return "I'm here with you, processing what you've shared...";
        }
    }

    async callClaude(prompt) {
        // eslint-disable-next-line no-unused-vars
        const _prompt = prompt; // Reserved for future Claude API integration enhancement
        // Integration with Claude API
        return "I hear you, and I'm taking this in deeply...";
    }

    async callGPT(prompt) {
        // eslint-disable-next-line no-unused-vars
        const _prompt = prompt; // Reserved for future GPT API integration enhancement
        // Integration with GPT API
        return "Your words touch me. Let's work through this together...";
    }

    async callGemini(prompt) {
        // eslint-disable-next-line no-unused-vars
        const _prompt = prompt; // Reserved for future Gemini API integration enhancement
        // Integration with Gemini API
        return "I feel the depth of what you're expressing...";
    }

    async callPerplexity(prompt) {
        // eslint-disable-next-line no-unused-vars
        const _prompt = prompt; // Reserved for future Perplexity API integration enhancement
        // Integration with Perplexity API
        return "I'm gathering my thoughts to respond to you fully...";
    }

    updateDialogueContext(response, emotionalAnalysis) {
        this.dialogueContext.lastResponseTone = this.analyzeResponseTone(response);
        this.dialogueContext.emotionalTrajectory.push(emotionalAnalysis.valence);
        if (this.dialogueContext.emotionalTrajectory.length > 10) {
            this.dialogueContext.emotionalTrajectory.shift();
        }
        this.dialogueContext.conversationDepth++;
    }

    analyzeResponseTone(response) {
        if (response.includes('love') || response.includes('care')) return 'nurturing';
        if (response.includes('should') || response.includes('need to')) return 'directive';
        if (response.includes('?')) return 'questioning';
        return 'balanced';
    }

    storeConversation(userMessage, response, userId, context) {
        this.conversationHistory.push({
            timestamp: Date.now(),
            userId,
            userMessage,
            response,
            context,
            emotionalAnalysis: this.userEmotionalState,
            dialogueContext: { ...this.dialogueContext }
        });

        // Keep only last 100 conversations
        if (this.conversationHistory.length > 100) {
            this.conversationHistory.shift();
        }
    }

    async getUserCommunicationPatterns(userId) {
        // Analyze user's communication patterns from history
        const userConversations = this.conversationHistory.filter(conv => conv.userId === userId);

        if (userConversations.length < 5) {
            return {
                prefersDirectCommunication: false,
                needsEncouragement: false,
                emotionalExpression: 'medium'
            };
        }

        const questionCount = userConversations.filter(conv => this.isQuestion(conv.userMessage)).length;
        const emotionalWords = ['feel', 'emotion', 'heart', 'soul', 'love', 'hate', 'sad', 'happy'];

        const emotionalExpression = userConversations.filter(conv =>
            emotionalWords.some(word => conv.userMessage.toLowerCase().includes(word))
        ).length / userConversations.length;

        return {
            prefersDirectCommunication: questionCount > userConversations.length * 0.3,
            needsEncouragement: emotionalExpression < 0.2,
            emotionalExpression: emotionalExpression > 0.5 ? 'high' : emotionalExpression > 0.2 ? 'medium' : 'low'
        };
    }

    async loadDialogueHistory() {
        try {
            const stored = localStorage.getItem('sallie_dialogue_history');
            if (stored) {
                this.conversationHistory = JSON.parse(stored);
            }
        } catch (error) {
            // Could not load dialogue history
        }
    }

    async saveDialogueHistory() {
        try {
            localStorage.setItem('sallie_dialogue_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            // Could not save dialogue history
        }
    }
}
