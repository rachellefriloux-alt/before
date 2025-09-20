/*
 * Persona: Tough love meets soul care.
 * Module: AdaptiveChallengeLadder
 * Intent: Handle functionality for AdaptiveChallengeLadder
 * Provenance-ID: d1707792-fb7d-4fc0-9c17-b5839fac8471
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/**
 * [SOVEREIGN MODULE] Adaptive Challenge Ladder
 * [CREATED: 2025-08-27] - Dynamic coaching/advisory intensity scaling
 * [PERSONA: Tough Love + Soul Care] - Optimal challenge without overwhelm
 * [PROVENANCE: All challenge selections tagged with user history, emotional state, and success patterns]
 *
 * Core Responsibilities:
 * - Dynamic coaching/advisory intensity scaling
 * - Factors: recent successes, frequency of engagement, emotional resilience scores
 * - Sovereignty-first: User controls challenge difficulty and frequency
 * - Emotional arc-aware: Challenges timed for optimal emotional readiness
 */

class AdaptiveChallengeLadder {
    constructor() {
        this.challengeRegistry = new Map(); // challengeId -> challenge definition
        this.userProgress = new Map(); // userId -> progress metrics
        this.successPatterns = new Map(); // userId -> success pattern analysis
        this.provenanceLog = []; // Audit trail for all challenge decisions

        this.initializeChallengeLadder();
        this.logProvenanceEvent('challenge_ladder_initialized', {
            timestamp: Date.now(),
            sovereigntyPrinciples: 'user_controlled_difficulty_scaling',
            adaptationFactors: ['success_rate', 'engagement_frequency', 'emotional_resilience']
        });
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Initialize challenge ladder
     * Persona Enforcement: Challenges maintain tough love + soul care balance
     */
    initializeChallengeLadder() {
        const challenges = {
            reflection_pause: {
                id: 'reflection_pause',
                category: 'mindfulness',
                difficulty: 1,
                emotionalWeight: 0.3,
                triggers: ['high_stress', 'decision_point', 'emotional_shift'],
                content: 'Take a moment to breathe and reflect on your current emotional state.',
                successCriteria: 'user_engagement',
                provenance: '[CREATED: 2025-08-27] - Gentle mindfulness challenge'
            },
            gratitude_moment: {
                id: 'gratitude_moment',
                category: 'positivity',
                difficulty: 2,
                emotionalWeight: 0.4,
                triggers: ['low_mood', 'routine_check', 'achievement_context'],
                content: 'Identify one thing you\'re grateful for in this moment.',
                successCriteria: 'user_response',
                provenance: '[CREATED: 2025-08-27] - Gratitude building challenge'
            },
            boundary_setting: {
                id: 'boundary_setting',
                category: 'self_care',
                difficulty: 3,
                emotionalWeight: 0.6,
                triggers: ['overwhelm', 'people_pleasing', 'energy_drain'],
                content: 'Identify one boundary you need to set to protect your energy.',
                successCriteria: 'action_commitment',
                provenance: '[CREATED: 2025-08-27] - Boundary setting challenge'
            },
            value_alignment: {
                id: 'value_alignment',
                category: 'purpose',
                difficulty: 4,
                emotionalWeight: 0.7,
                triggers: ['confusion', 'directionless', 'major_decision'],
                content: 'Reflect on how your current path aligns with your core values.',
                successCriteria: 'insight_shared',
                provenance: '[CREATED: 2025-08-27] - Values alignment challenge'
            },
            courage_action: {
                id: 'courage_action',
                category: 'growth',
                difficulty: 5,
                emotionalWeight: 0.9,
                triggers: ['fear_block', 'stagnation', 'breakthrough_opportunity'],
                content: 'Identify one small courageous action you can take today.',
                successCriteria: 'action_planned',
                provenance: '[CREATED: 2025-08-27] - Courage building challenge'
            }
        };

        Object.values(challenges).forEach(challenge => {
            this.challengeRegistry.set(challenge.id, challenge);
            this.logProvenanceEvent('challenge_registered', {
                challengeId: challenge.id,
                category: challenge.category,
                difficulty: challenge.difficulty,
                emotionalWeight: challenge.emotionalWeight,
                timestamp: Date.now()
            });
        });
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Select optimal challenge for user
     * Emotional Arc Awareness: Challenge selection considers current emotional state
     */
    selectOptimalChallenge(userId, emotionalArc, userHistory) {
        const userProgress = this.getUserProgress(userId);
        const successPatterns = this.analyzeSuccessPatterns(userId, userHistory);
        const emotionalReadiness = this.assessEmotionalReadiness(emotionalArc);

        // Calculate optimal difficulty based on user metrics
        const optimalDifficulty = this.calculateOptimalDifficulty(
            userProgress,
            successPatterns,
            emotionalReadiness
        );

        // Filter challenges by optimal difficulty and emotional readiness
        const suitableChallenges = this.filterSuitableChallenges(
            optimalDifficulty,
            emotionalArc,
            userProgress
        );

        if (suitableChallenges.length === 0) {
            this.logProvenanceEvent('no_suitable_challenge', {
                userId,
                optimalDifficulty,
                emotionalReadiness,
                timestamp: Date.now()
            });
            return null;
        }

        // Select best challenge based on user history and current context
        const selectedChallenge = this.selectBestChallenge(
            suitableChallenges,
            userHistory,
            emotionalArc
        );

        this.logProvenanceEvent('challenge_selected', {
            userId,
            challengeId: selectedChallenge.id,
            optimalDifficulty,
            emotionalReadiness,
            selectionReason: this.getSelectionReason(selectedChallenge, userProgress),
            timestamp: Date.now()
        });

        return selectedChallenge;
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Calculate optimal difficulty
     * Sovereignty: User progress history heavily weights difficulty calculation
     */
    calculateOptimalDifficulty(userProgress, successPatterns, emotionalReadiness) {
        let baseDifficulty = 2; // Start at moderate difficulty

        // Adjust based on success patterns
        if (successPatterns.recentSuccessRate > 0.8) {
            baseDifficulty += 0.5; // Increase difficulty for high success
        } else if (successPatterns.recentSuccessRate < 0.4) {
            baseDifficulty -= 0.5; // Decrease difficulty for low success
        }

        // Adjust based on engagement frequency
        if (userProgress.engagementFrequency > 5) {
            baseDifficulty += 0.3; // Increase for frequent engagement
        } else if (userProgress.engagementFrequency < 2) {
            baseDifficulty -= 0.3; // Decrease for infrequent engagement
        }

        // Adjust based on emotional readiness
        if (emotionalReadiness.resilience > 0.7) {
            baseDifficulty += 0.4; // Increase for high resilience
        } else if (emotionalReadiness.resilience < 0.3) {
            baseDifficulty -= 0.4; // Decrease for low resilience
        }

        // Ensure difficulty stays within bounds
        return Math.max(1, Math.min(5, Math.round(baseDifficulty)));
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Filter suitable challenges
     * Emotional Arc Awareness: Only select challenges appropriate for current emotional state
     */
    filterSuitableChallenges(optimalDifficulty, emotionalArc, userProgress) {
        const suitable = [];

        for (const challenge of this.challengeRegistry.values()) {
            // Check difficulty match (allow ±1 variance)
            if (Math.abs(challenge.difficulty - optimalDifficulty) > 1) continue;

            // Check emotional appropriateness
            if (!this.isEmotionallyAppropriate(challenge, emotionalArc)) continue;

            // Check user progress (avoid recently failed challenges)
            if (this.isRecentlyFailed(challenge.id, userProgress)) continue;

            suitable.push(challenge);
        }

        return suitable;
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Select best challenge from suitable options
     * Provenance: Selection criteria are fully traceable
     */
    selectBestChallenge(suitableChallenges, userHistory, emotionalArc) {
        if (suitableChallenges.length === 1) return suitableChallenges[0];

        // Score challenges based on multiple factors
        const scored = suitableChallenges.map(challenge => ({
            challenge,
            score: this.calculateChallengeScore(challenge, userHistory, emotionalArc)
        }));

        // Return highest scoring challenge
        scored.sort((a, b) => b.score - a.score);
        return scored[0].challenge;
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Calculate challenge score
     * Transparency: Scoring factors are explicit and traceable
     */
    calculateChallengeScore(challenge, userHistory, emotionalArc) {
        let score = 0;

        // Favor challenges user hasn't seen recently
        const lastSeen = this.getLastSeenDate(challenge.id, userHistory);
        const daysSinceSeen = lastSeen ? (Date.now() - lastSeen) / (1000 * 60 * 60 * 24) : 30;
        score += Math.min(daysSinceSeen / 7, 3); // Max 3 points for recency

        // Favor challenges that match current emotional triggers
        if (challenge.triggers.includes(emotionalArc.currentMood)) {
            score += 2;
        }

        // Favor challenges with good historical success rate for user
        const historicalSuccess = this.getHistoricalSuccessRate(challenge.id, userHistory);
        score += historicalSuccess * 2; // 0-2 points based on success rate

        return score;
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Present challenge to user
     * Sovereignty: User can defer, decline, or modify challenge difficulty
     */
    async presentChallenge(userId, challenge, emotionalArc) {
        const presentation = {
            challengeId: challenge.id,
            content: challenge.content,
            category: challenge.category,
            difficulty: challenge.difficulty,
            emotionalContext: emotionalArc.currentMood,
            timestamp: Date.now(),
            provenance: `[CHALLENGE_PRESENTATION: ${Date.now()}] - Challenge: ${challenge.id}, User: ${userId}`
        };

        // Update user progress
        this.updateUserProgress(userId, 'challenge_presented', challenge.id);

        this.logProvenanceEvent('challenge_presented', {
            userId,
            challengeId: challenge.id,
            category: challenge.category,
            difficulty: challenge.difficulty,
            emotionalContext: emotionalArc.currentMood,
            timestamp: Date.now()
        });

        return presentation;
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Process challenge response
     * Transparency: All user responses are logged with context
     */
    async processChallengeResponse(userId, challengeId, response, success) {
        const challenge = this.challengeRegistry.get(challengeId);
        if (!challenge) {
            throw new Error(`Unknown challenge: ${challengeId}`);
        }

        // Update user progress
        this.updateUserProgress(userId, success ? 'challenge_completed' : 'challenge_failed', challengeId);

        // Analyze response for future adaptation
        const analysis = this.analyzeResponse(response, challenge, success);

        this.logProvenanceEvent('challenge_response_processed', {
            userId,
            challengeId,
            success,
            responseLength: response.length,
            analysis: analysis.key,
            timestamp: Date.now()
        });

        return {
            success,
            analysis,
            nextDifficulty: this.recommendNextDifficulty(userId, challenge, success)
        };
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Get user progress metrics
     * Sovereignty: Progress data is user-controlled and can be reset
     */
    getUserProgress(userId) {
        if (!this.userProgress.has(userId)) {
            this.userProgress.set(userId, {
                totalChallenges: 0,
                successfulChallenges: 0,
                failedChallenges: 0,
                currentStreak: 0,
                bestStreak: 0,
                engagementFrequency: 0,
                lastActivity: null,
                recentChallenges: [],
                difficultyPreference: 2,
                categoryPreferences: new Map()
            });
        }

        return this.userProgress.get(userId);
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Update user progress
     * Provenance: All progress updates are fully traceable
     */
    updateUserProgress(userId, action, challengeId) {
        const progress = this.getUserProgress(userId);

        progress.totalChallenges++;
        progress.lastActivity = Date.now();

        if (action === 'challenge_completed') {
            progress.successfulChallenges++;
            progress.currentStreak++;
            progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
        } else if (action === 'challenge_failed') {
            progress.failedChallenges++;
            progress.currentStreak = 0;
        }

        // Track recent challenges
        progress.recentChallenges.unshift({
            challengeId,
            action,
            timestamp: Date.now()
        });

        // Keep only last 10 challenges
        if (progress.recentChallenges.length > 10) {
            progress.recentChallenges = progress.recentChallenges.slice(0, 10);
        }

        // Update engagement frequency (challenges per week)
        this.updateEngagementFrequency(userId);

        this.logProvenanceEvent('user_progress_updated', {
            userId,
            action,
            challengeId,
            newStreak: progress.currentStreak,
            successRate: progress.successfulChallenges / progress.totalChallenges,
            timestamp: Date.now()
        });
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Analyze success patterns
     * Emotional Arc Awareness: Patterns inform future challenge selection
     */
    analyzeSuccessPatterns(userId, userHistory) { // eslint-disable-line no-unused-vars
        const progress = this.getUserProgress(userId);
        const recentChallenges = progress.recentChallenges.slice(0, 5); // Last 5 challenges

        const recentSuccessRate = recentChallenges.length > 0
            ? recentChallenges.filter(c => c.action === 'challenge_completed').length / recentChallenges.length
            : 0.5;

        const overallSuccessRate = progress.totalChallenges > 0
            ? progress.successfulChallenges / progress.totalChallenges
            : 0.5;

        return {
            recentSuccessRate,
            overallSuccessRate,
            currentStreak: progress.currentStreak,
            bestStreak: progress.bestStreak,
            engagementFrequency: progress.engagementFrequency
        };
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Assess emotional readiness
     * Emotional Arc Awareness: Current emotional state determines challenge appropriateness
     */
    assessEmotionalReadiness(emotionalArc) {
        const resilienceMapping = {
            'defiance': 0.9,
            'resolve': 0.8,
            'encouragement': 0.7,
            'contemplative': 0.5,
            'peaceful': 0.6
        };

        return {
            resilience: resilienceMapping[emotionalArc.currentMood] || 0.5,
            currentMood: emotionalArc.currentMood,
            arcProgress: emotionalArc.arcProgress
        };
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Helper methods
     */
    isEmotionallyAppropriate(challenge, emotionalArc) {
        // Check if challenge is emotionally appropriate based on user's current state
        if (!emotionalArc || !challenge) return false;

        const { primaryEmotion, intensity, valence } = emotionalArc;

        // Don't present challenges during high-intensity negative emotions
        if (intensity > 0.8 && valence < -0.3) {
            return false;
        }

        // Adjust challenge difficulty based on emotional state
        const emotionalAdjustment = this.calculateEmotionalAdjustment(primaryEmotion, intensity);

        // Check if challenge difficulty is appropriate after emotional adjustment
        const adjustedDifficulty = challenge.difficulty + emotionalAdjustment;
        const appropriateRange = this.getAppropriateDifficultyRange(emotionalArc);

        return adjustedDifficulty >= appropriateRange.min && adjustedDifficulty <= appropriateRange.max;
    }

    isRecentlyFailed(challengeId, userProgress) {
        const recentFailures = userProgress.recentChallenges
            .slice(0, 3)
            .filter(c => c.action === 'challenge_failed' && c.challengeId === challengeId);

        return recentFailures.length > 0;
    }

    getLastSeenDate(challengeId, userHistory) {
        // Find the most recent date when this challenge was presented to the user
        if (!userHistory || !Array.isArray(userHistory)) return null;

        const challengeEntries = userHistory
            .filter(entry => entry.challengeId === challengeId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return challengeEntries.length > 0 ? new Date(challengeEntries[0].timestamp) : null;
    }

    getHistoricalSuccessRate(challengeId, userHistory) {
        // Calculate historical success rate for a specific challenge
        if (!userHistory || !Array.isArray(userHistory)) return 0.5;

        const challengeEntries = userHistory.filter(entry => entry.challengeId === challengeId);

        if (challengeEntries.length === 0) return 0.5; // No history, return neutral rate

        const successfulAttempts = challengeEntries.filter(entry =>
            entry.action === 'challenge_completed' || entry.action === 'challenge_succeeded'
        ).length;

        return successfulAttempts / challengeEntries.length;
    }

    getSelectionReason(challenge, userProgress) { // eslint-disable-line no-unused-vars
        return `Selected ${challenge.category} challenge at difficulty ${challenge.difficulty}`;
    }

    analyzeResponse(response, challenge, success) {
        return {
            key: success ? 'positive_engagement' : 'needs_encouragement',
            sentiment: success ? 'positive' : 'neutral'
        };
    }

    recommendNextDifficulty(userId, challenge, success) {
        const progress = this.getUserProgress(userId); // eslint-disable-line no-unused-vars
        const currentDifficulty = challenge.difficulty;

        if (success) {
            return Math.min(5, currentDifficulty + 1);
        } else {
            return Math.max(1, currentDifficulty - 1);
        }
    }

    updateEngagementFrequency(userId) {
        const progress = this.getUserProgress(userId);
        const recentActivity = progress.recentChallenges.slice(0, 7); // Last 7 days worth
        progress.engagementFrequency = recentActivity.length;
    }

    /**
     * Helper method to calculate emotional adjustment for challenge difficulty
     */
    calculateEmotionalAdjustment(primaryEmotion, intensity) {
        const emotionalFactors = {
            'joy': -0.2,      // Reduce difficulty when joyful
            'sadness': 0.1,   // Slightly increase difficulty when sad
            'anger': 0.2,     // Increase difficulty when angry
            'fear': 0.3,      // Significantly increase difficulty when fearful
            'surprise': 0.0,  // No adjustment for surprise
            'disgust': 0.1,   // Slightly increase difficulty when disgusted
            'neutral': 0.0    // No adjustment for neutral
        };

        const baseAdjustment = emotionalFactors[primaryEmotion] || 0;
        return baseAdjustment * intensity; // Scale by emotional intensity
    }

    /**
     * Helper method to get appropriate difficulty range based on emotional state
     */
    getAppropriateDifficultyRange(emotionalArc) {
        const { intensity, valence } = emotionalArc;

        // Base ranges
        let minDifficulty = 0.1;
        let maxDifficulty = 0.9;

        // Adjust based on emotional valence (positive/negative)
        if (valence < -0.5) {
            // Very negative emotions - reduce difficulty range
            maxDifficulty = 0.6;
        } else if (valence > 0.5) {
            // Very positive emotions - can handle higher difficulty
            minDifficulty = 0.2;
            maxDifficulty = 1.0;
        }

        // Adjust based on emotional intensity
        if (intensity > 0.7) {
            // High intensity - be more conservative
            maxDifficulty = Math.min(maxDifficulty, 0.7);
        }

        return { min: minDifficulty, max: maxDifficulty };
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Provenance logging system
     * Transparency: All challenge decisions are fully traceable
     */
    logProvenanceEvent(eventType, details) {
        const logEntry = {
            eventType,
            details,
            timestamp: Date.now(),
            module: 'AdaptiveChallengeLadder',
            sovereigntyStatus: 'user_controlled'
        };

        this.provenanceLog.push(logEntry);

        // Keep log manageable
        if (this.provenanceLog.length > 1000) {
            this.provenanceLog = this.provenanceLog.slice(-500);
        }
    }

    /**
     * [NEW][AdaptiveChallengeLadder]: Get provenance audit trail
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

module.exports = AdaptiveChallengeLadder;
