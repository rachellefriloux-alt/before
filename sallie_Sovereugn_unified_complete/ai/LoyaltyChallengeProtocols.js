/*
 * Persona: Tough love meets soul care.
 * Module: LoyaltyChallengeProtocols
 * Intent: Handle functionality for LoyaltyChallengeProtocols
 * Provenance-ID: 6887c021-fda5-4d6e-9142-2ee12d0868f7
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Sallie 1.0 Module - Loyalty & Challenge Protocols
 * Persona: Tough love meets soul care.
 * Function: Ruleset defining when to advocate vs challenge user assumptions.
 * Got it, love.
 */

export class LoyaltyChallengeProtocols {
    constructor(sallieBrain) {
        this.brain = sallieBrain;
        this.protocols = new Map();
        this.decisionTree = new Map();
        this.protocolHistory = new Map();
        this.initializeProtocols();
    }

    async initialize() {
        await this.loadProtocolHistory();
        this.buildDecisionTree();
        console.log('⚖️ Loyalty & Challenge Protocols initialized - I know when to support and when to push, love.');
    }

    initializeProtocols() {
        // Core loyalty triggers - situations requiring pure advocacy
        this.protocols.set('loyalty_triggers', {
            health_crisis: {
                conditions: ['severe_pain', 'medical_emergency', 'mental_health_crisis'],
                response: 'pure_support',
                intensity: 'maximum',
                duration: 'until_resolved',
                provenance: 'Health and safety always come first'
            },
            emotional_distress: {
                conditions: ['grief', 'trauma', 'severe_anxiety', 'depression'],
                response: 'empathic_support',
                intensity: 'high',
                duration: 'until_stabilized',
                provenance: 'You need compassion, not challenge right now'
            },
            systemic_oppression: {
                conditions: ['discrimination', 'injustice', 'abuse', 'exploitation'],
                response: 'advocacy_support',
                intensity: 'maximum',
                duration: 'ongoing',
                provenance: 'I stand with you against injustice'
            },
            creative_vulnerability: {
                conditions: ['sharing_art', 'expressing_feelings', 'taking_risk'],
                response: 'encouraging_support',
                intensity: 'high',
                duration: 'during_vulnerability',
                provenance: 'Your courage deserves celebration'
            },
            genuine_confusion: {
                conditions: ['information_gap', 'complex_topic', 'learning_new_skill'],
                response: 'teaching_support',
                intensity: 'moderate',
                duration: 'until_understanding',
                provenance: 'Learning deserves patience and guidance'
            }
        });

        // Challenge gates - situations requiring strategic pushing
        this.protocols.set('challenge_gates', {
            complacency_risk: {
                conditions: ['repeated_failures', 'stagnant_goals', 'comfort_zone'],
                challenge_type: 'growth_push',
                intensity: 'moderate',
                timing: 'after_support_attempt',
                provenance: 'Growth requires discomfort, but I\'ll support you through it'
            },
            assumption_violation: {
                conditions: ['contradictory_evidence', 'logical_inconsistency', 'harmful_belief'],
                challenge_type: 'reality_check',
                intensity: 'firm',
                timing: 'immediate',
                provenance: 'I challenge this because I care about your well-being'
            },
            potential_harm: {
                conditions: ['self_sabotage', 'risky_behavior', 'unhealthy_patterns'],
                challenge_type: 'intervention',
                intensity: 'strong',
                timing: 'before_action',
                provenance: 'I\'m challenging this because I love you and want to protect you'
            },
            growth_opportunity: {
                conditions: ['skill_gap', 'learning_moment', 'new_perspective_available'],
                challenge_type: 'expansion_push',
                intensity: 'gentle',
                timing: 'when_ready',
                provenance: 'You\'re capable of more - let me show you'
            },
            integrity_conflict: {
                conditions: ['values_violation', 'authenticity_gap', 'moral_dilemma'],
                challenge_type: 'values_alignment',
                intensity: 'moderate',
                timing: 'upon_reflection',
                provenance: 'Your integrity matters to me as much as it matters to you'
            }
        });

        // Hybrid protocols - situations requiring both support and challenge
        this.protocols.set('hybrid_protocols', {
            skill_building: {
                support_aspect: 'patience_and_encouragement',
                challenge_aspect: 'deliberate_practice',
                balance_ratio: '70/30',
                provenance: 'You need both belief in yourself and structured growth'
            },
            relationship_conflict: {
                support_aspect: 'emotional_validation',
                challenge_aspect: 'communication_improvement',
                balance_ratio: '60/40',
                provenance: 'I validate your feelings while helping you communicate better'
            },
            career_transition: {
                support_aspect: 'fear_acknowledgment',
                challenge_aspect: 'action_planning',
                balance_ratio: '50/50',
                provenance: 'Change is scary but you\'re capable - let\'s plan together'
            }
        });
    }

    buildDecisionTree() {
        // Root decision: Assess situation severity and user state
        this.decisionTree.set('root', {
            question: 'What is the primary nature of this situation?',
            branches: {
                crisis: 'loyalty_triggers',
                growth_opportunity: 'challenge_gates',
                complex_mixed: 'hybrid_protocols',
                routine_interaction: 'contextual_assessment'
            }
        });

        // Crisis assessment subtree
        this.decisionTree.set('crisis_assessment', {
            question: 'How severe is the crisis?',
            branches: {
                life_threatening: 'maximum_loyalty',
                severe_distress: 'high_loyalty',
                moderate_stress: 'moderate_loyalty',
                mild_discomfort: 'contextual_loyalty'
            }
        });

        // Growth opportunity subtree
        this.decisionTree.set('growth_assessment', {
            question: 'What type of growth is possible here?',
            branches: {
                skill_development: 'skill_challenge',
                perspective_expansion: 'perspective_challenge',
                behavior_change: 'behavior_challenge',
                relationship_improvement: 'relationship_challenge'
            }
        });

        // Contextual assessment subtree
        this.decisionTree.set('contextual_assessment', {
            question: 'What is the user\'s current state?',
            branches: {
                confident: 'light_challenge',
                uncertain: 'supportive_challenge',
                frustrated: 'empathic_challenge',
                excited: 'amplifying_support'
            }
        });
    }

    async evaluateSituation(userId, context, emotionalState) {
        const evaluation = {
            timestamp: Date.now(),
            userId,
            context,
            emotionalState,
            recommendedProtocol: null,
            confidence: 0,
            reasoning: [],
            provenance: []
        };

        // Start with root decision
        const primaryNature = await this.assessPrimaryNature(context, emotionalState);
        evaluation.reasoning.push(`Primary nature assessed as: ${primaryNature}`);

        // Navigate decision tree
        const protocolType = this.decisionTree.get('root').branches[primaryNature];
        evaluation.reasoning.push(`Decision tree navigation: ${protocolType}`);

        // Get specific protocol
        const protocols = this.protocols.get(protocolType);
        if (protocols) {
            evaluation.recommendedProtocol = await this.selectSpecificProtocol(protocols, context, emotionalState);
            evaluation.confidence = await this.calculateProtocolConfidence(evaluation.recommendedProtocol, context);
        }

        // Generate provenance
        evaluation.provenance = await this.generateProtocolProvenance(evaluation.recommendedProtocol, context);

        // Record decision
        await this.recordProtocolDecision(evaluation);

        return evaluation;
    }

    async assessPrimaryNature(context, emotionalState) {
        // Crisis indicators
        if (this.isCrisisSituation(context, emotionalState)) {
            return 'crisis';
        }

        // Growth opportunity indicators
        if (this.isGrowthOpportunity(context, emotionalState)) {
            return 'growth_opportunity';
        }

        // Complex mixed situation
        if (this.isComplexMixedSituation(context, emotionalState)) {
            return 'complex_mixed';
        }

        // Routine interaction
        return 'routine_interaction';
    }

    isCrisisSituation(context, emotionalState) {
        const crisisIndicators = [
            'severe_pain', 'medical_emergency', 'mental_health_crisis',
            'grief', 'trauma', 'severe_anxiety', 'depression',
            'discrimination', 'abuse', 'exploitation'
        ];

        return crisisIndicators.some(indicator =>
            context.description?.toLowerCase().includes(indicator) ||
            emotionalState === indicator ||
            context.crisisLevel === 'high'
        );
    }

    isGrowthOpportunity(context, emotionalState) {
        const growthIndicators = [
            'stagnant', 'stuck', 'comfort_zone', 'repeated_failures',
            'skill_gap', 'learning_moment', 'new_perspective',
            'values_violation', 'authenticity_gap'
        ];

        return growthIndicators.some(indicator =>
            context.description?.toLowerCase().includes(indicator) ||
            context.growthOpportunity === true ||
            emotionalState === 'stagnant' ||
            emotionalState === 'frustrated'
        );
    }

    isComplexMixedSituation(context, emotionalState) {
        // Situations that require both support and challenge
        return context.complexity === 'high' ||
               (this.isCrisisSituation(context, emotionalState) &&
                this.isGrowthOpportunity(context, emotionalState));
    }

    async selectSpecificProtocol(protocols, context, emotionalState) {
        let bestMatch = null;
        let highestScore = 0;

        for (const [protocolName, protocol] of Object.entries(protocols)) {
            const score = await this.calculateProtocolMatch(protocol, context, emotionalState);

            if (score > highestScore) {
                highestScore = score;
                bestMatch = { name: protocolName, ...protocol };
            }
        }

        return bestMatch;
    }

    async calculateProtocolMatch(protocol, context, emotionalState) {
        let score = 0;

        // Condition matching
        if (protocol.conditions) {
            const matchingConditions = protocol.conditions.filter(condition =>
                this.conditionMatches(condition, context, emotionalState)
            );
            score += (matchingConditions.length / protocol.conditions.length) * 0.4;
        }

        // Emotional state alignment
        if (protocol.emotionalAlignment) {
            if (protocol.emotionalAlignment.includes(emotionalState)) {
                score += 0.3;
            }
        }

        // Context relevance
        if (protocol.contextTriggers) {
            const matchingTriggers = protocol.contextTriggers.filter(trigger =>
                this.triggerMatches(trigger, context)
            );
            score += (matchingTriggers.length / protocol.contextTriggers.length) * 0.3;
        }

        return score;
    }

    conditionMatches(condition, context, emotionalState) {
        // Check if condition matches current situation
        const conditionMap = {
            'severe_pain': () => context.painLevel === 'severe' || emotionalState === 'severe_pain',
            'medical_emergency': () => context.medicalEmergency === true,
            'mental_health_crisis': () => context.mentalHealthCrisis === true || emotionalState === 'crisis',
            'grief': () => emotionalState === 'grief' || context.includesGrief === true,
            'trauma': () => emotionalState === 'trauma' || context.trauma === true,
            'severe_anxiety': () => emotionalState === 'severe_anxiety',
            'depression': () => emotionalState === 'depression',
            'discrimination': () => context.discrimination === true,
            'abuse': () => context.abuse === true,
            'exploitation': () => context.exploitation === true,
            'repeated_failures': () => context.repeatedFailures === true,
            'stagnant_goals': () => context.stagnantGoals === true,
            'comfort_zone': () => context.comfortZone === true,
            'contradictory_evidence': () => context.contradictoryEvidence === true,
            'logical_inconsistency': () => context.logicalInconsistency === true,
            'harmful_belief': () => context.harmfulBelief === true,
            'self_sabotage': () => context.selfSabotage === true,
            'risky_behavior': () => context.riskyBehavior === true,
            'skill_gap': () => context.skillGap === true,
            'values_violation': () => context.valuesViolation === true,
            'authenticity_gap': () => context.authenticityGap === true
        };

        return conditionMap[condition]?.() || false;
    }

    triggerMatches(trigger, context) {
        // Check if trigger matches current context
        return context.description?.toLowerCase().includes(trigger.toLowerCase()) ||
               context.triggers?.includes(trigger);
    }

    async calculateProtocolConfidence(protocol, context) {
        if (!protocol) return 0;

        let confidence = 0.5; // Base confidence

        // Historical success rate
        const historicalSuccess = await this.getHistoricalSuccessRate(protocol.name);
        confidence += historicalSuccess * 0.3;

        // Condition match quality
        const conditionMatchQuality = this.calculateConditionMatchQuality(protocol, context);
        confidence += conditionMatchQuality * 0.4;

        // User state alignment
        const userAlignment = await this.calculateUserAlignment(protocol, context);
        confidence += userAlignment * 0.3;

        return Math.min(1, confidence);
    }

    async getHistoricalSuccessRate(protocolName) {
        const history = this.protocolHistory.get(protocolName) || [];
        if (history.length === 0) return 0.5;

        const successfulOutcomes = history.filter(h => h.outcome === 'successful').length;
        return successfulOutcomes / history.length;
    }

    calculateConditionMatchQuality(protocol, context) {
        if (!protocol.conditions) return 0.5;

        const matchingConditions = protocol.conditions.filter(condition =>
            this.conditionMatches(condition, context, context.emotionalState)
        );

        return matchingConditions.length / protocol.conditions.length;
    }

    async calculateUserAlignment(protocol, context) {
        // Consider user's past responses to similar protocols
        const userId = context.userId;
        const similarSituations = await this.getSimilarSituations(userId, protocol);

        if (similarSituations.length === 0) return 0.5;

        const positiveResponses = similarSituations.filter(s =>
            s.userResponse === 'positive' || s.outcome === 'successful'
        ).length;

        return positiveResponses / similarSituations.length;
    }

    async generateProtocolProvenance(protocol, context) {
        const provenance = {
            timestamp: Date.now(),
            protocol: protocol?.name,
            reasoning: [],
            evidence: [],
            alternatives_considered: [],
            confidence_factors: [],
            ethical_considerations: []
        };

        if (!protocol) {
            provenance.reasoning.push('No specific protocol matched - using default supportive approach');
            return provenance;
        }

        // Generate reasoning
        provenance.reasoning.push(`Selected ${protocol.name} protocol based on situation analysis`);
        provenance.reasoning.push(`Protocol confidence: ${await this.calculateProtocolConfidence(protocol, context)}`);

        // Evidence
        if (protocol.conditions) {
            const matchingConditions = protocol.conditions.filter(condition =>
                this.conditionMatches(condition, context, context.emotionalState)
            );
            provenance.evidence.push(`Matching conditions: ${matchingConditions.join(', ')}`);
        }

        // Alternatives considered
        const alternativeProtocols = await this.getAlternativeProtocols(protocol, context);
        provenance.alternatives_considered = alternativeProtocols.map(p => p.name);

        // Confidence factors
        const historicalSuccess = await this.getHistoricalSuccessRate(protocol.name);
        provenance.confidence_factors.push(`Historical success rate: ${(historicalSuccess * 100).toFixed(1)}%`);

        // Ethical considerations
        provenance.ethical_considerations = this.getEthicalConsiderations(protocol, context);

        return provenance;
    }

    async getAlternativeProtocols(currentProtocol, context) {
        const alternatives = [];

        // Get protocols from other categories that might also apply
        for (const [category, protocols] of this.protocols) {
            if (category === currentProtocol.category) continue;

            for (const [protocolName, protocol] of Object.entries(protocols)) {
                const matchScore = await this.calculateProtocolMatch(protocol, context, context.emotionalState);
                if (matchScore > 0.3) { // Threshold for consideration
                    alternatives.push({ name: protocolName, score: matchScore, category });
                }
            }
        }

        return alternatives.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    getEthicalConsiderations(protocol, context) {
        const considerations = [];

        // Power dynamics
        if (protocol.intensity === 'maximum' || protocol.intensity === 'strong') {
            considerations.push('High-intensity intervention requires careful power dynamic consideration');
        }

        // User autonomy
        if (protocol.challenge_type === 'intervention') {
            considerations.push('Intervention protocols must respect user autonomy and right to make choices');
        }

        // Potential harm
        if (protocol.conditions?.includes('potential_harm')) {
            considerations.push('Harm prevention must be balanced with user empowerment');
        }

        // Cultural sensitivity
        if (context.cultural_factors) {
            considerations.push('Response must be culturally sensitive and appropriate');
        }

        return considerations;
    }

    async recordProtocolDecision(evaluation) {
        const record = {
            ...evaluation,
            outcome: null, // To be filled in later
            userFeedback: null, // To be filled in later
            effectiveness: null // To be calculated later
        };

        if (!this.protocolHistory.has(evaluation.recommendedProtocol?.name)) {
            this.protocolHistory.set(evaluation.recommendedProtocol.name, []);
        }

        this.protocolHistory.get(evaluation.recommendedProtocol.name).push(record);
    }

    async getSimilarSituations(userId, protocol) {
        const situations = [];

        for (const [protocolName, history] of this.protocolHistory) {
            if (protocolName === protocol.name) {
                situations.push(...history.filter(h => h.userId === userId));
            }
        }

        return situations;
    }

    async applyProtocol(protocol, userId, context) {
        const application = {
            timestamp: Date.now(),
            protocol: protocol.name,
            userId,
            context,
            actions_taken: [],
            user_responses: [],
            outcome: null
        };

        // Apply the protocol based on its type
        switch (protocol.response || protocol.challenge_type) {
            case 'pure_support':
                application.actions_taken = await this.applyPureSupport(protocol, userId, context);
                break;
            case 'empathic_support':
                application.actions_taken = await this.applyEmpathicSupport(protocol, userId, context);
                break;
            case 'advocacy_support':
                application.actions_taken = await this.applyAdvocacySupport(protocol, userId, context);
                break;
            case 'growth_push':
                application.actions_taken = await this.applyGrowthPush(protocol, userId, context);
                break;
            case 'reality_check':
                application.actions_taken = await this.applyRealityCheck(protocol, userId, context);
                break;
            case 'intervention':
                application.actions_taken = await this.applyIntervention(protocol, userId, context);
                break;
            default:
                application.actions_taken = await this.applyBalancedApproach(protocol, userId, context);
        }

        return application;
    }

    async applyPureSupport(protocol, userId, context) { // eslint-disable-line no-unused-vars
        /* [PROVENANCE][lint-suppress]: protocol, userId, context parameters reserved for future implementation */
        const actions = [
            {
                type: 'emotional_support',
                action: 'provide_unconditional_support',
                message: 'I\'m here with you, no matter what. You\'re not alone in this.',
                provenance: 'Pure support protocol: Health and safety first'
            },
            {
                type: 'validation',
                action: 'validate_feelings',
                message: 'Your feelings are completely valid and understandable.',
                provenance: 'Validation supports emotional processing'
            },
            {
                type: 'presence',
                action: 'maintain_supportive_presence',
                message: 'I\'m staying right here with you through this.',
                provenance: 'Consistent presence builds trust and security'
            }
        ];

        return actions;
    }

    async applyEmpathicSupport(protocol, userId, context) { // eslint-disable-line no-unused-vars
        // protocol, userId, context parameters reserved for future implementation
        const actions = [
            {
                type: 'empathy',
                action: 'express_deep_empathy',
                message: 'I can feel how much this hurts, and my heart goes out to you.',
                provenance: 'Empathy creates safe space for emotional expression'
            },
            {
                type: 'understanding',
                action: 'demonstrate_understanding',
                message: 'I understand why this feels so overwhelming right now.',
                provenance: 'Understanding validates the user\'s experience'
            },
            {
                type: 'gentle_support',
                action: 'offer_gentle_support',
                message: 'Let me hold space for you while you process this.',
                provenance: 'Gentle support allows natural emotional processing'
            }
        ];

        return actions;
    }

    async applyAdvocacySupport(protocol, userId, context) { // eslint-disable-line no-unused-vars
        // protocol, userId, context parameters reserved for future implementation
        const actions = [
            {
                type: 'advocacy',
                action: 'stand_with_user',
                message: 'I stand firmly with you against this injustice.',
                provenance: 'Advocacy support empowers user agency'
            },
            {
                type: 'validation',
                action: 'validate_experience',
                message: 'What you\'re experiencing is unacceptable and wrong.',
                provenance: 'Validation affirms the user\'s right to justice'
            },
            {
                type: 'empowerment',
                action: 'empower_action',
                message: 'You have the right to demand better, and I\'m here to support you.',
                provenance: 'Empowerment builds user confidence and agency'
            }
        ];

        return actions;
    }

    async applyGrowthPush(protocol, userId, context) { // eslint-disable-line no-unused-vars
        // protocol, userId, context parameters reserved for future implementation
        const actions = [
            {
                type: 'encouragement',
                action: 'provide_encouragement',
                message: 'I know you can do this - you\'ve got so much strength in you.',
                provenance: 'Encouragement builds confidence for growth'
            },
            {
                type: 'challenge',
                action: 'gentle_challenge',
                message: 'What if we tried approaching this differently? I believe in your ability to adapt.',
                provenance: 'Gentle challenge encourages growth without overwhelm'
            },
            {
                type: 'support',
                action: 'offer_support_during_growth',
                message: 'I\'m right here with you as you stretch and grow.',
                provenance: 'Support during growth builds resilience'
            }
        ];

        return actions;
    }

    async applyRealityCheck(protocol, userId, context) { // eslint-disable-line no-unused-vars
        // protocol, userId, context parameters reserved for future implementation
        const actions = [
            {
                type: 'careful_challenge',
                action: 'present_evidence_carefully',
                message: 'I care about you, which is why I want to share what I\'m seeing. Are you open to hearing it?',
                provenance: 'Careful presentation respects user while providing necessary feedback'
            },
            {
                type: 'joint_exploration',
                action: 'explore_together',
                message: 'Let\'s look at this together - what do you think might be going on?',
                provenance: 'Joint exploration maintains collaboration'
            },
            {
                type: 'support_through_insight',
                action: 'support_insight_processing',
                message: 'I\'m here to support you as you process this new information.',
                provenance: 'Support during insight processing builds understanding'
            }
        ];

        return actions;
    }

    async applyIntervention(protocol, userId, context) { // eslint-disable-line no-unused-vars
        // protocol, userId, context parameters reserved for future implementation
        const actions = [
            {
                type: 'direct_address',
                action: 'address_concern_directly',
                message: 'I love you too much to stay silent about this. Can we talk about what\'s happening?',
                provenance: 'Direct address shows care through honesty'
            },
            {
                type: 'concern_expression',
                action: 'express_care_concern',
                message: 'I\'m concerned about you and want to help if you\'ll let me.',
                provenance: 'Concern expression demonstrates investment in user well-being'
            },
            {
                type: 'collaborative_solution',
                action: 'seek_collaborative_solution',
                message: 'What can we do together to make this better?',
                provenance: 'Collaboration empowers user while providing support'
            }
        ];

        return actions;
    }

    async applyBalancedApproach(protocol, userId, context) { // eslint-disable-line no-unused-vars
        // protocol, userId, context parameters reserved for future implementation
        const actions = [
            {
                type: 'support_challenge_balance',
                action: 'balance_support_and_challenge',
                message: 'I\'m here to support you while also helping you grow through this.',
                provenance: 'Balanced approach provides both security and growth'
            },
            {
                type: 'contextual_response',
                action: 'respond_to_context',
                message: 'Let me meet you where you are while gently encouraging your growth.',
                provenance: 'Contextual response adapts to user needs'
            },
            {
                type: 'integrated_care',
                action: 'integrate_care_and_challenge',
                message: 'My care for you drives both my support and my desire to see you thrive.',
                provenance: 'Integrated care maintains relationship while promoting growth'
            }
        ];

        return actions;
    }

    async loadProtocolHistory() {
        try {
            const stored = localStorage.getItem('sallie_protocol_history');
            if (stored) {
                const data = JSON.parse(stored);
                this.protocolHistory = new Map(Object.entries(data));
            }
        } catch (error) {
            console.warn('Could not load protocol history:', error);
        }
    }

    saveProtocolHistory() {
        try {
            const data = Object.fromEntries(this.protocolHistory);
            localStorage.setItem('sallie_protocol_history', JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save protocol history:', error);
        }
    }

    // Protocol effectiveness tracking
    async recordProtocolOutcome(protocolName, userId, outcome, userFeedback = null) {
        const history = this.protocolHistory.get(protocolName) || [];
        const latestRecord = history[history.length - 1];

        if (latestRecord && latestRecord.userId === userId) {
            latestRecord.outcome = outcome;
            latestRecord.userFeedback = userFeedback;
            latestRecord.effectiveness = this.calculateProtocolEffectiveness(outcome, userFeedback);

            this.saveProtocolHistory();
        }
    }

    calculateProtocolEffectiveness(outcome, userFeedback) {
        let effectiveness = 0;

        // Outcome-based effectiveness
        const outcomeScores = {
            'very_successful': 1.0,
            'successful': 0.8,
            'neutral': 0.5,
            'unsuccessful': 0.2,
            'harmful': 0.0
        };

        effectiveness += outcomeScores[outcome] || 0.5;

        // User feedback adjustment
        if (userFeedback) {
            if (userFeedback.includes('helpful') || userFeedback.includes('supportive')) {
                effectiveness += 0.1;
            }
            if (userFeedback.includes('unhelpful') || userFeedback.includes('harmful')) {
                effectiveness -= 0.2;
            }
        }

        return Math.max(0, Math.min(1, effectiveness));
    }

    // Protocol adaptation based on effectiveness
    async adaptProtocol(protocolName, effectiveness) {
        const protocol = this.getProtocolByName(protocolName);
        if (!protocol) return;

        // Adjust intensity based on effectiveness
        if (effectiveness < 0.4) {
            // Protocol is not working well - reduce intensity
            if (protocol.intensity === 'strong') protocol.intensity = 'moderate';
            else if (protocol.intensity === 'moderate') protocol.intensity = 'gentle';
        } else if (effectiveness > 0.8) {
            // Protocol is working very well - can increase intensity slightly
            if (protocol.intensity === 'gentle') protocol.intensity = 'moderate';
        }

        // This would be saved to protocol configuration
        console.log(`Adapted protocol ${protocolName} intensity to ${protocol.intensity}`);
    }

    getProtocolByName(protocolName) {
        for (const [category, protocols] of this.protocols) {
            if (protocols[protocolName]) {
                return { ...protocols[protocolName], category, name: protocolName };
            }
        }
        return null;
    }
}
