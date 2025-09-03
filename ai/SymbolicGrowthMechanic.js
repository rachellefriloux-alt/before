/*
 * Persona: Tough love meets soul care.
 * Module: SymbolicGrowthMechanic
 * Intent: Handle functionality for SymbolicGrowthMechanic
 * Provenance-ID: 26ab4c5a-5b03-4123-9a40-d59dc191e93b
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/**
 * [SOVEREIGN MODULE] Symbolic Growth Mechanic
 * [CREATED: 2025-08-27] - Symbolic representations of personal growth and transformation
 * [PERSONA: Tough Love + Soul Care] - Celebrates growth without ego inflation
 * [PROVENANCE: All symbolic elements tagged with creation date, context, and symbol ID]
 *
 * Core Responsibilities:
 * - Create and manage symbolic representations of personal growth and transformation
 * - All symbolic elements tagged with creation date, context, and symbol ID
 * - Sovereignty-first: User controls symbolic representations and their meanings
 * - Emotional arc-aware: Symbols evolve with emotional journey
 */

class SymbolicGrowthMechanic {
    constructor() {
        this.symbolRegistry = new Map(); // symbolId -> symbol definition
        this.userSymbols = new Map(); // userId -> user's symbolic collection
        this.growthMilestones = new Map(); // milestoneId -> growth milestone
        this.symbolEvolution = []; // Chronological log of symbol changes
        this.userSymbolPreferences = new Map(); // userId -> symbol preferences
        this.provenanceLog = []; // Audit trail for all symbolic operations

        this.initializeBaseSymbols();
        this.initializeGrowthMilestones();
        this.logProvenanceEvent('symbolic_growth_initialized', {
            timestamp: Date.now(),
            sovereigntyPrinciples: 'user_controlled_symbolic_meaning',
            symbolTypes: ['growth_tree', 'transformation_crystal', 'wisdom_compass', 'resilience_flame', 'harmony_bloom']
        });
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Initialize base symbolic archetypes
     * Provenance: All symbols are fully tagged with creation context
     */
    initializeBaseSymbols() {
        const baseSymbols = {
            growth_tree: {
                id: 'growth_tree',
                name: 'Growth Tree',
                category: 'growth',
                description: 'Represents personal development and rooted wisdom',
                stages: ['seed', 'sprout', 'sapling', 'young_tree', 'mature_tree', 'ancient_tree'],
                currentStage: 'seed',
                growthFactors: ['reflection', 'action', 'learning', 'resilience'],
                asset: {
                    id: 'symbol_tree_001',
                    filename: 'growth_tree_symbol.svg',
                    creationDate: '2025-08-27',
                    context: 'symbolic_growth_mechanic',
                    provenance: '[ASSET: 2025-08-27] - Growth tree symbolic representation'
                },
                provenance: '[SYMBOL: 2025-08-27] - Growth tree archetype for personal development'
            },
            transformation_crystal: {
                id: 'transformation_crystal',
                name: 'Transformation Crystal',
                category: 'transformation',
                description: 'Represents inner change and clarity of vision',
                stages: ['rough_crystal', 'cut_crystal', 'polished_crystal', 'radiant_crystal'],
                currentStage: 'rough_crystal',
                growthFactors: ['self_awareness', 'emotional_processing', 'pattern_recognition'],
                asset: {
                    id: 'symbol_crystal_001',
                    filename: 'transformation_crystal.svg',
                    creationDate: '2025-08-27',
                    context: 'symbolic_growth_mechanic',
                    provenance: '[ASSET: 2025-08-27] - Transformation crystal symbolic representation'
                },
                provenance: '[SYMBOL: 2025-08-27] - Transformation crystal for inner change'
            },
            wisdom_compass: {
                id: 'wisdom_compass',
                name: 'Wisdom Compass',
                category: 'guidance',
                description: 'Represents inner knowing and life direction',
                stages: ['unreliable_compass', 'calibrating_compass', 'true_compass', 'master_compass'],
                currentStage: 'unreliable_compass',
                growthFactors: ['intuition', 'experience', 'discernment', 'trust'],
                asset: {
                    id: 'symbol_compass_001',
                    filename: 'wisdom_compass.svg',
                    creationDate: '2025-08-27',
                    context: 'symbolic_growth_mechanic',
                    provenance: '[ASSET: 2025-08-27] - Wisdom compass symbolic representation'
                },
                provenance: '[SYMBOL: 2025-08-27] - Wisdom compass for inner guidance'
            },
            resilience_flame: {
                id: 'resilience_flame',
                name: 'Resilience Flame',
                category: 'resilience',
                description: 'Represents inner strength and ability to rebound',
                stages: ['flickering_flame', 'steady_flame', 'bright_flame', 'eternal_flame'],
                currentStage: 'flickering_flame',
                growthFactors: ['adversity', 'recovery', 'adaptation', 'endurance'],
                asset: {
                    id: 'symbol_flame_001',
                    filename: 'resilience_flame.svg',
                    creationDate: '2025-08-27',
                    context: 'symbolic_growth_mechanic',
                    provenance: '[ASSET: 2025-08-27] - Resilience flame symbolic representation'
                },
                provenance: '[SYMBOL: 2025-08-27] - Resilience flame for inner strength'
            },
            harmony_bloom: {
                id: 'harmony_bloom',
                name: 'Harmony Bloom',
                category: 'harmony',
                description: 'Represents balance and integration of self aspects',
                stages: ['closed_bud', 'opening_bud', 'partial_bloom', 'full_bloom', 'seed_bearer'],
                currentStage: 'closed_bud',
                growthFactors: ['self_acceptance', 'integration', 'balance', 'wholeness'],
                asset: {
                    id: 'symbol_bloom_001',
                    filename: 'harmony_bloom.svg',
                    creationDate: '2025-08-27',
                    context: 'symbolic_growth_mechanic',
                    provenance: '[ASSET: 2025-08-27] - Harmony bloom symbolic representation'
                },
                provenance: '[SYMBOL: 2025-08-27] - Harmony bloom for balance and integration'
            }
        };

        Object.values(baseSymbols).forEach(symbol => {
            this.symbolRegistry.set(symbol.id, symbol);
            this.logProvenanceEvent('symbol_registered', {
                symbolId: symbol.id,
                category: symbol.category,
                stages: symbol.stages.length,
                growthFactors: symbol.growthFactors,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Initialize growth milestones
     * Emotional Arc Awareness: Milestones tied to emotional journey progress
     */
    initializeGrowthMilestones() {
        const milestones = {
            first_reflection: {
                id: 'first_reflection',
                symbol: 'growth_tree',
                stage: 'sprout',
                trigger: 'first_meaningful_reflection',
                description: 'Your first step toward conscious growth',
                emotionalWeight: 0.3,
                provenance: '[MILESTONE: 2025-08-27] - First reflection growth milestone'
            },
            emotional_awareness: {
                id: 'emotional_awareness',
                symbol: 'transformation_crystal',
                stage: 'cut_crystal',
                trigger: 'emotional_pattern_recognition',
                description: 'Seeing your emotional patterns with clarity',
                emotionalWeight: 0.6,
                provenance: '[MILESTONE: 2025-08-27] - Emotional awareness milestone'
            },
            inner_guidance: {
                id: 'inner_guidance',
                symbol: 'wisdom_compass',
                stage: 'true_compass',
                trigger: 'trust_inner_wisdom',
                description: 'Learning to trust your inner knowing',
                emotionalWeight: 0.7,
                provenance: '[MILESTONE: 2025-08-27] - Inner guidance milestone'
            },
            bounce_back: {
                id: 'bounce_back',
                symbol: 'resilience_flame',
                stage: 'steady_flame',
                trigger: 'resilience_demonstrated',
                description: 'Rising stronger after challenges',
                emotionalWeight: 0.8,
                provenance: '[MILESTONE: 2025-08-27] - Resilience milestone'
            },
            self_integration: {
                id: 'self_integration',
                symbol: 'harmony_bloom',
                stage: 'full_bloom',
                trigger: 'self_acceptance_achieved',
                description: 'Embracing all aspects of yourself',
                emotionalWeight: 0.9,
                provenance: '[MILESTONE: 2025-08-27] - Self integration milestone'
            }
        };

        Object.values(milestones).forEach(milestone => {
            this.growthMilestones.set(milestone.id, milestone);
            this.logProvenanceEvent('growth_milestone_defined', {
                milestoneId: milestone.id,
                symbol: milestone.symbol,
                stage: milestone.stage,
                trigger: milestone.trigger,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Assign symbol to user
     * Sovereignty: Users choose which symbols to work with
     */
    assignSymbolToUser(userId, symbolId, customMeaning = null) {
        const symbol = this.symbolRegistry.get(symbolId);
        if (!symbol) {
            throw new Error(`Unknown symbol: ${symbolId}`);
        }

        const userSymbols = this.getUserSymbols(userId);
        const userSymbol = {
            symbolId,
            assignedDate: Date.now(),
            currentStage: symbol.currentStage,
            customMeaning,
            personalSignificance: '',
            growthHistory: [],
            provenance: `[USER_SYMBOL: ${Date.now()}] - User: ${userId}, Symbol: ${symbolId}`
        };

        userSymbols.push(userSymbol);

        this.logProvenanceEvent('symbol_assigned_to_user', {
            userId,
            symbolId,
            customMeaning: customMeaning ? 'provided' : 'none',
            timestamp: Date.now()
        });

        return userSymbol;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Update symbol stage based on growth
     * Transparency: All symbol evolutions are logged with context
     */
    updateSymbolStage(userId, symbolId, newStage, growthContext) {
        const userSymbols = this.getUserSymbols(userId);
        const userSymbol = userSymbols.find(us => us.symbolId === symbolId);

        if (!userSymbol) {
            throw new Error(`User ${userId} does not have symbol ${symbolId}`);
        }

        const symbol = this.symbolRegistry.get(symbolId);
        if (!symbol.stages.includes(newStage)) {
            throw new Error(`Invalid stage ${newStage} for symbol ${symbolId}`);
        }

        const previousStage = userSymbol.currentStage;
        userSymbol.currentStage = newStage;
        userSymbol.growthHistory.push({
            date: Date.now(),
            fromStage: previousStage,
            toStage: newStage,
            context: growthContext,
            provenance: `[STAGE_UPDATE: ${Date.now()}] - ${previousStage} -> ${newStage}`
        });

        // Log symbol evolution
        this.logSymbolEvolution('stage_advanced', {
            userId,
            symbolId,
            fromStage: previousStage,
            toStage: newStage,
            context: growthContext,
            timestamp: Date.now()
        });

        this.logProvenanceEvent('symbol_stage_updated', {
            userId,
            symbolId,
            fromStage: previousStage,
            toStage: newStage,
            context: growthContext.context || 'growth_milestone',
            timestamp: Date.now()
        });

        return userSymbol;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Check for growth milestone achievement
     * Emotional Arc Awareness: Milestones consider emotional journey progress
     */
    checkGrowthMilestone(userId, context, emotionalArc) {
        const userSymbols = this.getUserSymbols(userId);
        const achievedMilestones = [];

        for (const [milestoneId, milestone] of this.growthMilestones) {
            if (this.isMilestoneAchieved(userId, milestoneId)) continue;

            if (this.isMilestoneTriggered(milestone, context, emotionalArc)) {
                // Check if user has the relevant symbol
                const hasSymbol = userSymbols.some(us => us.symbolId === milestone.symbol);
                if (hasSymbol) {
                    achievedMilestones.push(milestone);
                }
            }
        }

        return achievedMilestones;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Process growth milestone achievement
     * Persona Enforcement: Celebrations maintain tough love + soul care balance
     */
    async processGrowthMilestone(userId, milestone, context) { // eslint-disable-line no-unused-vars
        const result = {
            milestoneId: milestone.id,
            symbolId: milestone.symbol,
            newStage: milestone.stage,
            timestamp: Date.now(),
            success: false,
            celebration: null,
            provenance: `[MILESTONE_PROCESSING: ${Date.now()}] - User: ${userId}, Milestone: ${milestone.id}`
        };

        try {
            // Update symbol stage
            const updatedSymbol = this.updateSymbolStage(userId, milestone.symbol, milestone.stage, {
                context: 'milestone_achievement',
                milestoneId: milestone.id,
                description: milestone.description,
                emotionalWeight: milestone.emotionalWeight
            });

            // Mark milestone as achieved
            this.markMilestoneAchieved(userId, milestone.id);

            // Generate symbolic celebration
            result.celebration = await this.generateSymbolicCelebration(userId, milestone, updatedSymbol);

            result.success = true;

            this.logProvenanceEvent('growth_milestone_processed', {
                userId,
                milestoneId: milestone.id,
                symbolId: milestone.symbol,
                newStage: milestone.stage,
                success: true,
                timestamp: Date.now()
            });

        } catch (error) {
            result.success = false;
            result.error = error.message;

            this.logProvenanceEvent('growth_milestone_failed', {
                userId,
                milestoneId: milestone.id,
                error: error.message,
                timestamp: Date.now()
            });
        }

        return result;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Generate symbolic celebration
     * Sovereignty: Celebrations respect user symbol preferences
     */
    async generateSymbolicCelebration(userId, milestone, updatedSymbol) {
        const userPrefs = this.getUserSymbolPreferences(userId);

        if (!userPrefs.enableCelebrations) {
            return null;
        }

        const celebration = {
            type: 'symbolic_growth',
            symbolId: milestone.symbol,
            newStage: milestone.stage,
            message: this.generateCelebrationMessage(milestone, updatedSymbol),
            visualElements: await this.generateVisualElements(milestone, userPrefs),
            duration: userPrefs.celebrationDuration || 3000,
            provenance: `[SYMBOLIC_CELEBRATION: ${Date.now()}] - Symbol: ${milestone.symbol}, Stage: ${milestone.stage}`
        };

        // Log celebration
        this.logSymbolEvolution('celebration_generated', {
            userId,
            symbolId: milestone.symbol,
            milestoneId: milestone.id,
            celebrationType: celebration.type,
            timestamp: Date.now()
        });

        return celebration;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Generate celebration message
     * Persona Enforcement: Messages maintain tough love + soul care tone
     */
    async generateCelebrationMessage(milestone, updatedSymbol) { // eslint-disable-line no-unused-vars
        const messages = {
            first_reflection: "Your first conscious step - the tree begins to grow.",
            emotional_awareness: "Seeing your patterns clearly - the crystal takes shape.",
            inner_guidance: "Trusting your inner compass - wisdom points the way.",
            bounce_back: "Rising stronger - your flame burns steady.",
            self_integration: "Embracing all of yourself - the bloom opens fully."
        };

        return messages[milestone.id] || "A meaningful step in your growth journey.";
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Generate visual elements for celebration
     * Emotional Arc Awareness: Visuals match emotional context
     */
    async generateVisualElements(milestone, userPrefs) { // eslint-disable-line no-unused-vars
        const elements = {
            symbol: milestone.symbol,
            stage: milestone.stage,
            animation: 'gentle_evolution',
            colors: this.getStageColors(milestone.stage),
            effects: ['gentle_glow', 'subtle_particles'],
            provenance: `[VISUAL_ELEMENTS: ${Date.now()}] - Symbol: ${milestone.symbol}`
        };

        // Simulate visual element generation

        return elements;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Get user symbols collection
     * Sovereignty: Users have full control over their symbolic representations
     */
    getUserSymbols(userId) {
        if (!this.userSymbols.has(userId)) {
            this.userSymbols.set(userId, []);
        }

        return this.userSymbols.get(userId);
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Get user symbol preferences
     * Sovereignty: Users control all aspects of symbolic representation
     */
    getUserSymbolPreferences(userId) {
        if (!this.userSymbolPreferences.has(userId)) {
            this.userSymbolPreferences.set(userId, {
                enableCelebrations: true,
                celebrationDuration: 3000,
                preferredSymbols: ['growth_tree', 'transformation_crystal'],
                customMeanings: {},
                visualStyle: 'subtle',
                lastUpdated: Date.now()
            });
        }

        return this.userSymbolPreferences.get(userId);
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Update user symbol preferences
     * Sovereignty: Users can customize all symbolic aspects
     */
    updateUserPreferences(userId, preferences) {
        const currentPrefs = this.getUserSymbolPreferences(userId);
        const newPrefs = { ...currentPrefs, ...preferences, lastUpdated: Date.now() };

        this.userSymbolPreferences.set(userId, newPrefs);

        this.logProvenanceEvent('symbol_preferences_updated', {
            userId,
            newPreferences: preferences,
            timestamp: Date.now()
        });

        return newPrefs;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Get symbolic growth data for user
     * Transparency: All symbolic data is available for review
     */
    getSymbolicGrowthData(userId) {
        const userSymbols = this.getUserSymbols(userId);
        const growthData = {
            userId,
            symbols: userSymbols.map(userSymbol => {
                const symbol = this.symbolRegistry.get(userSymbol.symbolId);
                return {
                    ...userSymbol,
                    symbolData: symbol,
                    currentStageIndex: symbol.stages.indexOf(userSymbol.currentStage),
                    growthProgress: (symbol.stages.indexOf(userSymbol.currentStage) + 1) / symbol.stages.length
                };
            }),
            achievedMilestones: this.getAchievedMilestones(userId),
            recentEvolutions: this.getRecentSymbolEvolutions(userId),
            provenance: `[GROWTH_DATA: ${Date.now()}] - User: ${userId}`
        };

        return growthData;
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Helper methods for milestone tracking
     * Transparency: All milestone operations are traceable
     */
    isMilestoneAchieved(userId, milestoneId) {
        const userSymbols = this.getUserSymbols(userId);
        return userSymbols.some(us => us.achievedMilestones?.includes(milestoneId));
    }

    markMilestoneAchieved(userId, milestoneId) {
        const userSymbols = this.getUserSymbols(userId);
        userSymbols.forEach(userSymbol => {
            if (!userSymbol.achievedMilestones) {
                userSymbol.achievedMilestones = [];
            }
            if (!userSymbol.achievedMilestones.includes(milestoneId)) {
                userSymbol.achievedMilestones.push(milestoneId);
            }
        });

        this.logProvenanceEvent('milestone_marked_achieved', {
            userId,
            milestoneId,
            timestamp: Date.now()
        });
    }

    isMilestoneTriggered(milestone, context, emotionalArc) {
        switch (milestone.trigger) {
            case 'first_meaningful_reflection':
                return context.reflectionDepth === 'deep' && context.interactionCount === 1;
            case 'emotional_pattern_recognition':
                return emotionalArc.arcProgress > 0.5;
            case 'trust_inner_wisdom':
                return context.trustLevel > 0.7;
            case 'resilience_demonstrated':
                return context.challengeOvercome === true;
            case 'self_acceptance_achieved':
                return emotionalArc.arcProgress > 0.8;
            default:
                return false;
        }
    }

    getAchievedMilestones(userId) {
        const userSymbols = this.getUserSymbols(userId);
        const achieved = new Set();

        userSymbols.forEach(userSymbol => {
            if (userSymbol.achievedMilestones) {
                userSymbol.achievedMilestones.forEach(milestoneId => achieved.add(milestoneId));
            }
        });

        return Array.from(achieved);
    }

    getRecentSymbolEvolutions(userId, limit = 10) {
        return this.symbolEvolution
            .filter(evolution => evolution.details.userId === userId)
            .slice(-limit)
            .reverse();
    }

    getStageColors(stage) {
        const colorMap = {
            'seed': ['#8B4513', '#228B22'],
            'sprout': ['#32CD32', '#90EE90'],
            'young_tree': ['#228B22', '#98FB98'],
            'mature_tree': ['#006400', '#8FBC8F'],
            'rough_crystal': ['#696969', '#D3D3D3'],
            'cut_crystal': ['#87CEEB', '#E0FFFF'],
            'polished_crystal': ['#4169E1', '#B0E0E6'],
            'flickering_flame': ['#FFA500', '#FFD700'],
            'steady_flame': ['#FF4500', '#FFFF00'],
            'bright_flame': ['#FF6347', '#FFA500'],
            'closed_bud': ['#8B0000', '#DC143C'],
            'opening_bud': ['#FF1493', '#FFB6C1'],
            'partial_bloom': ['#FF69B4', '#FFC0CB'],
            'full_bloom': ['#FF1493', '#FF69B4']
        };

        return colorMap[stage] || ['#808080', '#C0C0C0'];
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Log symbol evolution event
     * Transparency: All symbol changes are logged with full context
     */
    logSymbolEvolution(evolutionType, details) {
        const evolutionEntry = {
            type: evolutionType,
            details,
            timestamp: Date.now(),
            evolutionId: `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            provenance: `[SYMBOL_EVOLUTION: ${Date.now()}] - Type: ${evolutionType}`
        };

        this.symbolEvolution.push(evolutionEntry);

        // Keep log manageable
        if (this.symbolEvolution.length > 1000) {
            this.symbolEvolution = this.symbolEvolution.slice(-500);
        }

        this.logProvenanceEvent('symbol_evolution_logged', {
            evolutionId: evolutionEntry.evolutionId,
            type: evolutionType,
            timestamp: Date.now()
        });
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Provenance logging system
     * Transparency: All symbolic activities are fully traceable
     */
    logProvenanceEvent(eventType, details) {
        const logEntry = {
            eventType,
            details,
            timestamp: Date.now(),
            module: 'SymbolicGrowthMechanic',
            sovereigntyStatus: 'user_controlled'
        };

        this.provenanceLog.push(logEntry);

        // Keep log manageable
        if (this.provenanceLog.length > 1000) {
            this.provenanceLog = this.provenanceLog.slice(-500);
        }
    }

    /**
     * [NEW][SymbolicGrowthMechanic]: Get provenance audit trail
     * Transparency: Full audit trail available for review
     */
    getProvenanceAudit(userId = null) {
        let audit = this.provenanceLog;

        if (userId) {
            audit = audit.filter(entry => entry.details.userId === userId);
        }

        return audit.sort((a, b) => b.timestamp - a.timestamp);
    }
}

module.exports = SymbolicGrowthMechanic;
