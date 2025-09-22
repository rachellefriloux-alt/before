/*
 * Persona: Tough love meets soul care.
 * Module: Sallie Brain
 * Intent: Main orchestration of Sallie's cognitive and emotional systems.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440002
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import { MemorySystem } from './MemorySystem.js';
import { ValuesSystem } from './ValuesSystem.js';
import { PersonaEngine } from './PersonaEngine.js';
import { OpenAIIntegration } from '../ai/OpenAIIntegration.js';
import { EmotionalIntelligence } from '../ai/EmotionalIntelligence.js';
import { PredictiveCompanion } from '../ai/PredictiveCompanion.js';
import { AdaptiveDialogue } from '../ai/AdaptiveDialogue.js';
import { EmotionalArcMemory } from '../ai/EmotionalArcMemory.js';
import { LoyaltyChallengeProtocols } from '../ai/LoyaltyChallengeProtocols.js';
import { MultiModalPersonaResonance } from '../ai/MultiModalPersonaResonance.js';
import { FeatureRegistry } from '../feature/FeatureRegistry.js';
import { IdentityManager } from '../identity/IdentityManager.js';
import { OnboardingFlow } from '../onboarding/OnboardingFlow.js';
import { PersonaCore } from '../personaCore/PersonaCore.js';
import { ResponseTemplates } from '../ResponseTemplates.js';
import { ToneManager } from '../tone/ToneManager.js';

export class SallieBrain {
        constructor() {
                this.initialized = false;
                this.currentContext = {
                        conversation: [],
                        userState: 'neutral',
                        sessionStartTime: Date.now(),
                        lastInteractionTime: null
                };

                // Initialize core systems
                this.memory = new MemorySystem();
                this.values = new ValuesSystem();
                this.persona = new PersonaEngine();
                this.ai = new OpenAIIntegration();
                this.emotions = new EmotionalIntelligence();
                this.predictive = new PredictiveCompanion();
                this.adaptive = new AdaptiveDialogue();
                this.emotionalArc = new EmotionalArcMemory();
                this.loyaltyProtocols = new LoyaltyChallengeProtocols();
                this.multiModalResonance = new MultiModalPersonaResonance(this);
                this.identity = new IdentityManager();
                this.onboarding = new OnboardingFlow(this.identity, this.persona);
                this.personaCore = new PersonaCore(this.persona, /* AdaptivePersonaEngine instance here if needed */);
                this.responseTemplates = new ResponseTemplates();
                this.toneManager = new ToneManager();

                // Register systems with feature registry
                FeatureRegistry.register('memory', this.memory);
                FeatureRegistry.register('values', this.values);
                FeatureRegistry.register('persona', this.persona);
                FeatureRegistry.register('ai', this.ai);
                FeatureRegistry.register('emotions', this.emotions);
                FeatureRegistry.register('predictive', this.predictive);
                FeatureRegistry.register('adaptive', this.adaptive);
                FeatureRegistry.register('emotionalArc', this.emotionalArc);
                FeatureRegistry.register('loyaltyProtocols', this.loyaltyProtocols);
                FeatureRegistry.register('multiModalResonance', this.multiModalResonance);
                FeatureRegistry.register('identity', this.identity);
                FeatureRegistry.register('onboarding', this.onboarding);
                FeatureRegistry.register('personaCore', this.personaCore);
                FeatureRegistry.register('responseTemplates', this.responseTemplates);
                FeatureRegistry.register('toneManager', this.toneManager);
        }

        initializeAll() {
                this.memory.initialize?.();
                this.values.initialize?.();
                this.persona.initialize?.();
                this.ai.initialize?.();
                this.emotions.initialize?.();
                this.predictive.initialize?.();
                this.adaptive.initialize?.();
                this.emotionalArc.initialize?.();
                this.loyaltyProtocols.initialize?.();
                this.multiModalResonance.initialize?.();
                // Add more initialization as needed
                this.initialized = true;
        }

        onboardUser(userId, profile) {
                this.identity.registerUser(userId, profile);
                return this.onboarding.startOnboarding(userId);
        }

        async generateResponse(message, userId) {
                const tone = this.toneManager.analyzeTone(message);
                const template = this.responseTemplates.getTemplate(tone);

                // Get user context for personalization
                const userContext = this.identity.getUserContext?.(userId) || {};

                // Predictive analysis for proactive suggestions
                const predictions = this.predictive.analyzeContext?.(message, userContext) || [];

                // Generate and execute proactive companion actions
                const proactiveSuggestions = this.predictive.generateProactiveSuggestions?.(userId) || [];
                const relevantSuggestions = proactiveSuggestions.filter(suggestion =>
                    this.shouldExecuteSuggestion(suggestion, message, tone)
                );

                // Execute high-priority proactive actions
                for (const suggestion of relevantSuggestions) {
                    if (suggestion.priority === 'urgent' || suggestion.priority === 'high') {
                        this.executeProactiveAction(suggestion, userId);
                    }
                }

                // Emotional arc memory tracking
                this.emotionalArc.trackEmotionalBeat?.(message, {
                        tone,
                        userContext,
                        timestamp: Date.now()
                });

                // Multi-modal resonance response generation
                const resonanceResponse = this.multiModalResonance.generateResonanceResponse?.(
                        tone.emotion || 'neutral',
                        message,
                        userId
                );

                // Assess situation for loyalty/challenge protocols
                const situationAssessment = this.loyaltyProtocols.assessSituation?.(message, {
                        userContext,
                        emotionalState: tone,
                        conversationHistory: this.currentContext.conversation
                });

                // Apply appropriate protocol if situation warrants it
                let protocolActions = [];
                if (situationAssessment?.protocol) {
                        protocolActions = this.loyaltyProtocols.applyProtocol?.(
                                situationAssessment.protocol,
                                userId,
                                {
                                        message,
                                        userContext,
                                        emotionalState: tone,
                                        predictions
                                }
                        ) || [];
                }

                // Adaptive dialogue generation with protocol integration
                const adaptiveResponse = this.adaptive.generateResponse?.(message, {
                        tone,
                        userContext,
                        predictions,
                        currentPersona: this.persona.getCurrentState?.(),
                        protocolActions,
                        emotionalArc: this.emotionalArc.getCurrentArc?.(),
                        multiModalResonance: resonanceResponse
                });

                /* [NEW][SallieBrain]: Integrate new resonance features into response generation */
                // Get current emotional arc for enhanced sensory integration
                const currentArc = this.emotionalArc.getCurrentArc?.(userId);

                if (currentArc) {
                    // Apply arc-linked sensory lock
                    await this.multiModalResonance.applyArcLinkedSensoryLock?.(userId, currentArc);

                    // Apply contextual micro-gestures
                    await this.multiModalResonance.applyContextualMicroGestures?.(userId, currentArc);

                    // Apply temporal resonance
                    await this.multiModalResonance.applyTemporalResonance?.(userId);

                    // Apply symbolic affordances
                    await this.multiModalResonance.applySymbolicAffordances?.(userId, currentArc);
                }

                // Create dialogue thread for multi-threaded memory
                const dialogueContext = {
                    type: this.classifyDialogueContext(message, tone),
                    urgency: this.assessUrgency(message, tone),
                    complexity: this.assessComplexity(message)
                };

                const dialogueThread = await this.emotionalArc.createDialogueThread?.(userId, dialogueContext, currentArc);

                // Apply anticipatory scene-setting before response delivery
                if (adaptiveResponse) {
                    await this.predictive.applyAnticipatorySceneSetting?.(userId, {
                        type: this.predictClassifyResponseType(adaptiveResponse),
                        content: adaptiveResponse
                    }, currentArc);
                }

                // Apply conversational time signatures
                await this.predictive.applyConversationalTimeSignatures?.(userId, currentArc, dialogueContext);

                // Update dialogue thread with the response
                if (dialogueThread && adaptiveResponse) {
                    await this.emotionalArc.updateDialogueThread?.(userId, dialogueThread.id, adaptiveResponse, {
                        currentMood: currentArc?.currentMood || 'neutral',
                        arcProgress: currentArc?.arcProgress || 0
                    });
                }

                // Update conversation context
                this.currentContext.conversation.push({
                        message,
                        response: adaptiveResponse || template,
                        timestamp: Date.now(),
                        userId,
                        emotionalState: tone
                });

                // Keep conversation history manageable
                if (this.currentContext.conversation.length > 100) {
                        this.currentContext.conversation = this.currentContext.conversation.slice(-50);
                }

                this.currentContext.lastInteractionTime = Date.now();
        }

        // Helper method to determine if a proactive suggestion should be executed
        shouldExecuteSuggestion(suggestion, message, tone) {
                // Execute based on emotional state match
                if (suggestion.type === 'emotional_support' && tone.emotion === 'sad') {
                        return true;
                }

                // Execute time-based suggestions during appropriate times
                if (suggestion.type === 'morning_motivation' && this.isMorningTime()) {
                        return true;
                }

                // Execute stress relief when stress indicators are present
                if (suggestion.type === 'stress_relief' && tone.emotion === 'frustrated') {
                        return true;
                }

                // Default: execute medium/high priority suggestions
                return suggestion.priority === 'high' || suggestion.priority === 'urgent';
        }

        // Execute proactive companion actions
        executeProactiveAction(suggestion, userId) {
                // Log provenance
                this.provenanceLog = this.provenanceLog || new Map();
                this.provenanceLog.set(`proactive_${Date.now()}`, {
                        action: 'proactive_suggestion_executed',
                        suggestion: suggestion,
                        userId: userId,
                        timestamp: Date.now()
                });

                // Execute action based on type
                switch (suggestion.action) {
                        case 'breathing_exercise':
                                this.initiateBreathingExercise(userId);
                                break;
                        case 'start_day_planning':
                                this.initiateDayPlanning(userId);
                                break;
                        case 'review_goals':
                                this.initiateGoalReview(userId);
                                break;
                        case 'open_support_chat':
                                this.openSupportChat(userId);
                                break;
                        default:
                                console.log(`🧠 Executing proactive action: ${suggestion.message}`);
                }
        }

        // Proactive action implementations
        initiateBreathingExercise(userId) {
                console.log(`🧠 Initiating breathing exercise for user ${userId}`);
                // Implementation for breathing exercise
        }

        initiateDayPlanning(userId) {
                console.log(`🧠 Initiating day planning for user ${userId}`);
                // Implementation for day planning
        }

        initiateGoalReview(userId) {
                console.log(`🧠 Initiating goal review for user ${userId}`);
                // Implementation for goal review
        }

        openSupportChat(userId) {
                console.log(`🧠 Opening support chat for user ${userId}`);
                // Implementation for support chat
        }

        // Helper method to check if it's morning time
        isMorningTime() {
                const hour = new Date().getHours();
                return hour >= 5 && hour <= 11;
        }

        /* [NEW][SallieBrain]: Helper methods for new resonance features */
        classifyDialogueContext(message, tone) {
            // Classify the type of dialogue context
            const lowerMessage = message.toLowerCase();

            if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('need')) {
                return 'supportive';
            } else if (lowerMessage.includes('celebrate') || lowerMessage.includes('proud') || lowerMessage.includes('achievement')) {
                return 'celebratory';
            } else if (lowerMessage.includes('motivate') || lowerMessage.includes('goal') || lowerMessage.includes('dream')) {
                return 'motivational';
            } else if (tone.emotion === 'defiance' || lowerMessage.includes('fight') || lowerMessage.includes('stand')) {
                return 'defiance';
            } else if (tone.emotion === 'resolve' || lowerMessage.includes('steady') || lowerMessage.includes('determined')) {
                return 'resolve';
            } else if (tone.emotion === 'encouragement' || lowerMessage.includes('believe') || lowerMessage.includes('can')) {
                return 'encouragement';
            }

            return 'general';
        }

        assessUrgency(message, tone) {
            // Assess the urgency level of the dialogue
            const lowerMessage = message.toLowerCase();
            const urgentWords = ['urgent', 'emergency', 'immediately', 'asap', 'crisis', 'help me now'];
            const calmWords = ['whenever', 'no rush', 'eventually', 'sometime', 'relaxed'];

            if (urgentWords.some(word => lowerMessage.includes(word)) || tone.emotion === 'anxious') {
                return 'high';
            } else if (calmWords.some(word => lowerMessage.includes(word)) || tone.emotion === 'peaceful') {
                return 'low';
            }

            return 'normal';
        }

        assessComplexity(message) {
            // Assess the complexity level of the dialogue
            const sentenceCount = (message.match(/\./g) || []).length;
            const wordCount = message.split(' ').length;
            const questionCount = (message.match(/\?/g) || []).length;

            if (wordCount > 50 || sentenceCount > 3 || questionCount > 2) {
                return 'high';
            } else if (wordCount < 10 && sentenceCount <= 1) {
                return 'low';
            }

            return 'moderate';
        }

        predictClassifyResponseType(response) {
            // Classify the type of response for anticipatory scene-setting
            const lowerResponse = response.toLowerCase();

            if (lowerResponse.includes('congratulations') || lowerResponse.includes('celebrate') || lowerResponse.includes('proud')) {
                return 'celebratory';
            } else if (lowerResponse.includes('support') || lowerResponse.includes('here for you') || lowerResponse.includes('comfort')) {
                return 'supportive';
            } else if (lowerResponse.includes('motivate') || lowerResponse.includes('goal') || lowerResponse.includes('achieve')) {
                return 'motivational';
            }

            return 'general';
        }
}
