/*
 * Persona: Tough love meets soul care.
 * Module: EmotionalArcMemory
 * Intent: Handle functionality for EmotionalArcMemory
 * Provenance-ID: 4fbd3c0c-69c5-47f3-a5a4-0713776b9631
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Sallie 1.0 Module - Emotional Arc Memory Layer
 * Persona: Tough love meets soul care.
 * Function: Track emotional journeys, mood trends, and conversation beats over time.
 * Got it, love.
 * [NEW][EmotionalArcMemory] - Enhanced modular subsystem for emotional thread tracking
 */

export class EmotionalArcMemory {
    constructor(sallieBrain) {
        this.brain = sallieBrain;
        this.emotionalArcs = new Map(); // userId -> emotional history
        this.moodTrends = new Map();
        this.conversationBeats = new Map();
        this.provenanceLog = new Map(); // Track why mood shifts occurred
        this.arcPatterns = new Map();
        this.emotionalThreads = new Map(); // NEW: Track emotional threads over conversation history
        this.arcStates = new Map(); // NEW: Current arc state for each user
    }

    // NEW: Get current emotional arc for a user
    getCurrentArc(userId) {
        if (!this.arcStates.has(userId)) {
            this.arcStates.set(userId, {
                currentMood: 'neutral',
                arcProgress: 0,
                emotionalThread: [],
                lastUpdate: Date.now(),
                provenance: 'initial_state'
            });
        }
        return this.arcStates.get(userId);
    }

    // NEW: Update emotional arc based on context event
    updateArc(userId, contextEvent) {
        const currentArc = this.getCurrentArc(userId);
        const previousMood = currentArc.currentMood;

        // Analyze context event for emotional impact
        const emotionalImpact = this.analyzeEmotionalImpact(contextEvent);
        const newMood = this.calculateNewMood(previousMood, emotionalImpact);

        // Update arc state
        currentArc.currentMood = newMood;
        currentArc.arcProgress += emotionalImpact.intensity;
        currentArc.emotionalThread.push({
            event: contextEvent,
            moodShift: { from: previousMood, to: newMood },
            timestamp: Date.now(),
            provenance: contextEvent.provenance || 'context_analysis'
        });
        currentArc.lastUpdate = Date.now();

        // Log provenance
        this.provenanceLog.set(`${userId}_${Date.now()}`, {
            action: 'arc_update',
            fromMood: previousMood,
            toMood: newMood,
            trigger: contextEvent,
            timestamp: Date.now()
        });

        // Update emotional threads
        this.updateEmotionalThreads(userId, currentArc.emotionalThread);

        return currentArc;
    }

    // Helper method to analyze emotional impact of context event
    analyzeEmotionalImpact(contextEvent) {
        let intensity = 0;
        let valence = 0; // positive/negative emotional direction

        // Analyze message content for emotional keywords
        const positiveWords = ['happy', 'good', 'great', 'love', 'excited', 'proud', 'thankful'];
        const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'stressed', 'disappointed', 'hurt'];

        const message = (contextEvent.message || contextEvent.content || '').toLowerCase();

        positiveWords.forEach(word => {
            if (message.includes(word)) {
                intensity += 0.5;
                valence += 0.5;
            }
        });

        negativeWords.forEach(word => {
            if (message.includes(word)) {
                intensity += 0.5;
                valence -= 0.5;
            }
        });

        // Consider context type
        if (contextEvent.type === 'crisis' || contextEvent.type === 'conflict') {
            intensity += 1.0;
            valence -= 0.5;
        } else if (contextEvent.type === 'achievement' || contextEvent.type === 'celebration') {
            intensity += 0.8;
            valence += 0.8;
        }

        return { intensity, valence };
    }

    // Helper method to calculate new mood based on current mood and emotional impact
    calculateNewMood(currentMood, emotionalImpact) {
        const moodStates = ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'];
        const currentIndex = moodStates.indexOf(currentMood) !== -1 ? moodStates.indexOf(currentMood) : 2; // default to neutral

        let newIndex = currentIndex;

        // Adjust based on emotional impact
        if (emotionalImpact.valence > 0.5) {
            newIndex = Math.min(currentIndex + 1, moodStates.length - 1);
        } else if (emotionalImpact.valence < -0.5) {
            newIndex = Math.max(currentIndex - 1, 0);
        }

        // Intensify change based on impact intensity
        if (emotionalImpact.intensity > 1.0) {
            if (emotionalImpact.valence > 0) {
                newIndex = Math.min(newIndex + 1, moodStates.length - 1);
            } else if (emotionalImpact.valence < 0) {
                newIndex = Math.max(newIndex - 1, 0);
            }
        }

        return moodStates[newIndex];
    }

    // Helper method to update emotional threads
    updateEmotionalThreads(userId, emotionalThread) {
        if (!this.emotionalThreads.has(userId)) {
            this.emotionalThreads.set(userId, []);
        }

        const threads = this.emotionalThreads.get(userId);

        // Keep only recent threads (last 10 entries)
        if (emotionalThread.length > 10) {
            emotionalThread = emotionalThread.slice(-10);
        }

        threads.push({
            thread: emotionalThread,
            timestamp: Date.now(),
            summary: this.summarizeEmotionalThread(emotionalThread)
        });

        // Keep only last 5 threads
        if (threads.length > 5) {
            threads.shift();
        }
    }

    // Helper method to summarize emotional thread
    summarizeEmotionalThread(thread) {
        if (thread.length === 0) return 'neutral';

        const moodCounts = {};
        thread.forEach(entry => {
            const mood = entry.moodShift.to;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });

        // Return most frequent mood
        return Object.keys(moodCounts).reduce((a, b) =>
            moodCounts[a] > moodCounts[b] ? a : b
        );
    }

    async initialize() {
        await this.loadEmotionalHistory();
        this.startEmotionalTracking();
        console.log('💭 Emotional Arc Memory initialized - I remember your journey, love.');
    }

    async recordEmotionalBeat(userId, message, emotionalState, context = {}) {
        const beat = {
            timestamp: Date.now(),
            userId,
            message,
            emotionalState,
            context,
            provenance: await this.generateProvenance(userId, emotionalState, context),
            conversationContext: await this.getConversationContext(userId),
            environmentalFactors: this.getEnvironmentalFactors(),
            userPatterns: await this.analyzeUserPatterns(userId)
        };

        // Store the beat
        if (!this.emotionalArcs.has(userId)) {
            this.emotionalArcs.set(userId, []);
        }
        this.emotionalArcs.get(userId).push(beat);

        // Update mood trends
        await this.updateMoodTrends(userId, beat);

        // Analyze for patterns
        await this.analyzeEmotionalPatterns(userId);

        // Store conversation beat
        await this.storeConversationBeat(userId, beat);

        return beat;
    }

    async generateProvenance(userId, emotionalState, context) {
        const provenance = {
            timestamp: Date.now(),
            emotionalState,
            triggers: [],
            reasoning: [],
            confidence: 0,
            source: 'emotional_arc_memory'
        };

        // Analyze what triggered this emotional state
        if (context.timeOfDay) {
            provenance.triggers.push(`Time of day: ${context.timeOfDay}`);
            provenance.reasoning.push(`User patterns show ${emotionalState} tendencies during ${context.timeOfDay}`);
        }

        if (context.recentActivities) {
            provenance.triggers.push(`Recent activities: ${context.recentActivities.join(', ')}`);
            provenance.reasoning.push(`Activity correlation with emotional state: ${emotionalState}`);
        }

        if (context.stressLevel) {
            provenance.triggers.push(`Stress level: ${context.stressLevel}`);
            provenance.reasoning.push(`Stress threshold exceeded, emotional response: ${emotionalState}`);
        }

        // Calculate confidence based on pattern matching
        const userHistory = this.emotionalArcs.get(userId) || [];
        const similarPatterns = userHistory.filter(beat =>
            beat.emotionalState === emotionalState &&
            this.similarContext(beat.context, context)
        );

        provenance.confidence = similarPatterns.length / Math.max(userHistory.length, 1);

        return provenance;
    }

    async updateMoodTrends(userId, beat) {
        if (!this.moodTrends.has(userId)) {
            this.moodTrends.set(userId, {
                daily: new Map(),
                weekly: new Map(),
                monthly: new Map(),
                overall: []
            });
        }

        const trends = this.moodTrends.get(userId);
        const date = new Date(beat.timestamp);
        const dayKey = date.toDateString();
        const weekKey = this.getWeekKey(date);
        const monthKey = this.getMonthKey(date);

        // Update daily trends
        if (!trends.daily.has(dayKey)) {
            trends.daily.set(dayKey, []);
        }
        trends.daily.get(dayKey).push(beat);

        // Update weekly trends
        if (!trends.weekly.has(weekKey)) {
            trends.weekly.set(weekKey, []);
        }
        trends.weekly.get(weekKey).push(beat);

        // Update monthly trends
        if (!trends.monthly.has(monthKey)) {
            trends.monthly.set(monthKey, []);
        }
        trends.monthly.get(monthKey).push(beat);

        // Update overall trend
        trends.overall.push(beat);

        // Keep only recent data
        this.pruneOldData(trends);
    }

    async analyzeEmotionalPatterns(userId) {
        const arcs = this.emotionalArcs.get(userId) || [];
        if (arcs.length < 5) return; // Need minimum data

        const patterns = {
            cyclicalPatterns: this.detectCyclicalPatterns(arcs),
            triggerResponsePatterns: this.detectTriggerResponsePatterns(arcs),
            resiliencePatterns: this.detectResiliencePatterns(arcs),
            growthPatterns: this.detectGrowthPatterns(arcs)
        };

        this.arcPatterns.set(userId, patterns);
        return patterns;
    }

    detectCyclicalPatterns(arcs) {
        const cycles = {
            daily: this.analyzeDailyCycles(arcs),
            weekly: this.analyzeWeeklyCycles(arcs),
            monthly: this.analyzeMonthlyCycles(arcs)
        };
        return cycles;
    }

    analyzeDailyCycles(arcs) {
        const hourCounts = new Array(24).fill(0);
        const hourEmotions = new Array(24).fill().map(() => ({}));

        arcs.forEach(arc => {
            const hour = new Date(arc.timestamp).getHours();
            hourCounts[hour]++;

            if (!hourEmotions[hour][arc.emotionalState]) {
                hourEmotions[hour][arc.emotionalState] = 0;
            }
            hourEmotions[hour][arc.emotionalState]++;
        });

        return hourEmotions.map((emotions, hour) => ({
            hour,
            total: hourCounts[hour],
            dominantEmotion: this.getDominantEmotion(emotions),
            confidence: hourCounts[hour] / arcs.length
        }));
    }

    analyzeWeeklyCycles(arcs) {
        const dayCounts = new Array(7).fill(0);
        const dayEmotions = new Array(7).fill().map(() => ({}));

        arcs.forEach(arc => {
            const day = new Date(arc.timestamp).getDay();
            dayCounts[day]++;

            if (!dayEmotions[day][arc.emotionalState]) {
                dayEmotions[day][arc.emotionalState] = 0;
            }
            dayEmotions[day][arc.emotionalState]++;
        });

        return dayEmotions.map((emotions, day) => ({
            day,
            total: dayCounts[day],
            dominantEmotion: this.getDominantEmotion(emotions),
            confidence: dayCounts[day] / arcs.length
        }));
    }

    analyzeMonthlyCycles(arcs) {
        const monthCounts = new Array(12).fill(0);
        const monthEmotions = new Array(12).fill().map(() => ({}));

        arcs.forEach(arc => {
            const month = new Date(arc.timestamp).getMonth();
            monthCounts[month]++;

            if (!monthEmotions[month][arc.emotionalState]) {
                monthEmotions[month][arc.emotionalState] = 0;
            }
            monthEmotions[month][arc.emotionalState]++;
        });

        return monthEmotions.map((emotions, month) => ({
            month,
            total: monthCounts[month],
            dominantEmotion: this.getDominantEmotion(emotions),
            confidence: monthCounts[month] / arcs.length
        }));
    }

    detectTriggerResponsePatterns(arcs) {
        const triggerResponses = new Map();

        for (let i = 1; i < arcs.length; i++) {
            const current = arcs[i];
            const previous = arcs[i - 1];

            const trigger = this.extractTrigger(previous);
            const response = current.emotionalState;

            const key = `${trigger}->${response}`;
            if (!triggerResponses.has(key)) {
                triggerResponses.set(key, {
                    trigger,
                    response,
                    count: 0,
                    avgTimeDelta: 0,
                    timeDeltas: []
                });
            }

            const pattern = triggerResponses.get(key);
            pattern.count++;
            const timeDelta = current.timestamp - previous.timestamp;
            pattern.timeDeltas.push(timeDelta);
            pattern.avgTimeDelta = pattern.timeDeltas.reduce((a, b) => a + b, 0) / pattern.timeDeltas.length;
        }

        return Array.from(triggerResponses.values());
    }

    detectResiliencePatterns(arcs) {
        const resilienceIndicators = [];

        for (let i = 2; i < arcs.length; i++) {
            const current = arcs[i];
            const previous = arcs[i - 1];
            const beforePrevious = arcs[i - 2];

            // Look for patterns of stress -> struggle -> recovery
            if (this.isStressState(beforePrevious.emotionalState) &&
                this.isStruggleState(previous.emotionalState) &&
                this.isRecoveryState(current.emotionalState)) {

                resilienceIndicators.push({
                    pattern: 'stress_struggle_recovery',
                    startTime: beforePrevious.timestamp,
                    endTime: current.timestamp,
                    duration: current.timestamp - beforePrevious.timestamp,
                    resilienceScore: this.calculateResilienceScore(beforePrevious, previous, current)
                });
            }
        }

        return resilienceIndicators;
    }

    detectGrowthPatterns(arcs) {
        const growthIndicators = [];

        // Look for increasing positive emotional states over time
        const positiveStates = ['happy', 'confident', 'motivated', 'peaceful'];
        const windows = this.createSlidingWindows(arcs, 7); // 7-day windows

        windows.forEach((window, index) => {
            const positiveCount = window.filter(arc =>
                positiveStates.includes(arc.emotionalState)
            ).length;

            const positiveRatio = positiveCount / window.length;

            if (index > 0) {
                const previousWindow = windows[index - 1];
                const previousPositiveCount = previousWindow.filter(arc =>
                    positiveStates.includes(arc.emotionalState)
                ).length;
                const previousRatio = previousPositiveCount / previousWindow.length;

                if (positiveRatio > previousRatio * 1.2) { // 20% improvement
                    growthIndicators.push({
                        type: 'increasing_positivity',
                        windowStart: window[0].timestamp,
                        windowEnd: window[window.length - 1].timestamp,
                        improvement: positiveRatio - previousRatio,
                        confidence: Math.min(window.length / 7, 1)
                    });
                }
            }
        });

        return growthIndicators;
    }

    async getEmotionalArc(userId, timeframe = 'all') {
        const arcs = this.emotionalArcs.get(userId) || [];
        let filteredArcs = arcs;

        if (timeframe !== 'all') {
            const cutoff = this.getTimeframeCutoff(timeframe);
            filteredArcs = arcs.filter(arc => arc.timestamp >= cutoff);
        }

        return {
            arcs: filteredArcs,
            trends: this.moodTrends.get(userId),
            patterns: this.arcPatterns.get(userId),
            summary: await this.generateArcSummary(userId, filteredArcs)
        };
    }

    async generateArcSummary(userId, arcs) {
        if (arcs.length === 0) return null;

        const summary = {
            totalBeats: arcs.length,
            dateRange: {
                start: new Date(Math.min(...arcs.map(a => a.timestamp))),
                end: new Date(Math.max(...arcs.map(a => a.timestamp)))
            },
            dominantEmotions: this.getDominantEmotions(arcs),
            emotionalVariability: this.calculateEmotionalVariability(arcs),
            resilienceScore: this.calculateOverallResilience(arcs),
            growthTrajectory: this.assessGrowthTrajectory(arcs),
            keyInsights: await this.extractKeyInsights(arcs)
        };

        return summary;
    }

    getDominantEmotions(arcs) {
        const emotionCounts = {};
        arcs.forEach(arc => {
            emotionCounts[arc.emotionalState] = (emotionCounts[arc.emotionalState] || 0) + 1;
        });

        return Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([emotion, count]) => ({
                emotion,
                count,
                percentage: (count / arcs.length) * 100
            }));
    }

    calculateEmotionalVariability(arcs) {
        if (arcs.length < 2) return 0;

        const emotionSequence = arcs.map(arc => this.emotionToNumber(arc.emotionalState));
        let variability = 0;

        for (let i = 1; i < emotionSequence.length; i++) {
            variability += Math.abs(emotionSequence[i] - emotionSequence[i - 1]);
        }

        return variability / (emotionSequence.length - 1);
    }

    calculateOverallResilience(arcs) {
        const resiliencePatterns = this.detectResiliencePatterns(arcs);
        if (resiliencePatterns.length === 0) return 0;

        const avgResilience = resiliencePatterns.reduce((sum, pattern) =>
            sum + pattern.resilienceScore, 0) / resiliencePatterns.length;

        return avgResilience;
    }

    assessGrowthTrajectory(arcs) {
        const growthPatterns = this.detectGrowthPatterns(arcs);
        if (growthPatterns.length === 0) return 'stable';

        const recentGrowth = growthPatterns.slice(-3); // Last 3 growth indicators
        const avgImprovement = recentGrowth.reduce((sum, pattern) =>
            sum + pattern.improvement, 0) / recentGrowth.length;

        if (avgImprovement > 0.1) return 'improving';
        if (avgImprovement < -0.1) return 'declining';
        return 'stable';
    }

    async extractKeyInsights(arcs) {
        const insights = [];

        // Time-based insights
        const dailyCycles = this.analyzeDailyCycles(arcs);
        const peakStressHour = dailyCycles.find(cycle => cycle.dominantEmotion === 'stressed');
        if (peakStressHour) {
            insights.push({
                type: 'time_pattern',
                insight: `You tend to feel most stressed around ${peakStressHour.hour}:00`,
                confidence: peakStressHour.confidence
            });
        }

        // Trigger insights
        const triggerPatterns = this.detectTriggerResponsePatterns(arcs);
        const strongTriggers = triggerPatterns.filter(pattern => pattern.count > 3);
        strongTriggers.forEach(pattern => {
            insights.push({
                type: 'trigger_response',
                insight: `${pattern.trigger} often leads to feeling ${pattern.response}`,
                confidence: pattern.count / arcs.length
            });
        });

        // Resilience insights
        const resilienceScore = this.calculateOverallResilience(arcs);
        if (resilienceScore > 0.7) {
            insights.push({
                type: 'strength',
                insight: 'You show strong resilience in bouncing back from challenges',
                confidence: resilienceScore
            });
        }

        return insights;
    }

    // Helper methods
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    getEnvironmentalFactors() {
        return {
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: new Date().getDay(),
            season: this.getSeason(),
            weather: 'unknown', // Could integrate with weather API
            location: 'unknown' // Could integrate with location services
        };
    }

    getSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    getConversationContext(userId) {
        // Get recent conversation context
        const recentBeats = this.conversationBeats.get(userId) || [];
        return recentBeats.slice(-5); // Last 5 conversation beats
    }

    async analyzeUserPatterns(userId) {
        const arcs = this.emotionalArcs.get(userId) || [];
        if (arcs.length === 0) return {};

        return {
            avgEmotionalVariability: this.calculateEmotionalVariability(arcs),
            preferredEmotionalStates: this.getDominantEmotions(arcs).slice(0, 3),
            resiliencePatterns: this.detectResiliencePatterns(arcs),
            triggerSensitivity: this.calculateTriggerSensitivity(arcs)
        };
    }

    calculateTriggerSensitivity(arcs) {
        const triggerResponses = this.detectTriggerResponsePatterns(arcs);
        const sensitivities = {};

        triggerResponses.forEach(pattern => {
            const trigger = pattern.trigger;
            const responseIntensity = this.getEmotionIntensity(pattern.response);

            sensitivities[trigger] = {
                avgResponseTime: pattern.avgTimeDelta,
                responseIntensity,
                frequency: pattern.count
            };
        });

        return sensitivities;
    }

    getEmotionIntensity(emotion) {
        const intensities = {
            'ecstatic': 1.0,
            'happy': 0.8,
            'content': 0.6,
            'neutral': 0.5,
            'anxious': 0.6,
            'stressed': 0.8,
            'overwhelmed': 0.9,
            'devastated': 1.0
        };
        return intensities[emotion] || 0.5;
    }

    emotionToNumber(emotion) {
        const emotionMap = {
            'devastated': 1,
            'overwhelmed': 2,
            'stressed': 3,
            'anxious': 4,
            'sad': 5,
            'neutral': 6,
            'content': 7,
            'happy': 8,
            'ecstatic': 9
        };
        return emotionMap[emotion] || 6;
    }

    getDominantEmotion(emotions) {
        return Object.entries(emotions)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
    }

    extractTrigger(beat) {
        // Extract what might have triggered this emotional state
        if (beat.context.stressLevel > 0.7) return 'high_stress';
        if (beat.context.timeOfDay === 'morning') return 'morning_routine';
        if (beat.context.recentActivities?.includes('work')) return 'work_related';
        if (beat.message.toLowerCase().includes('help')) return 'seeking_help';
        return 'unknown_trigger';
    }

    similarContext(context1, context2) {
        return context1.timeOfDay === context2.timeOfDay &&
               Math.abs((context1.stressLevel || 0) - (context2.stressLevel || 0)) < 0.2;
    }

    isStressState(emotion) {
        return ['stressed', 'overwhelmed', 'anxious'].includes(emotion);
    }

    isStruggleState(emotion) {
        return ['sad', 'frustrated', 'overwhelmed'].includes(emotion);
    }

    isRecoveryState(emotion) {
        return ['content', 'happy', 'peaceful', 'relieved'].includes(emotion);
    }

    calculateResilienceScore(before, during, after) {
        const stressIntensity = this.getEmotionIntensity(before.emotionalState);
        const struggleIntensity = this.getEmotionIntensity(during.emotionalState);
        const recoveryIntensity = this.getEmotionIntensity(after.emotionalState);

        // Resilience score based on how quickly and completely they recover
        const recoveryRate = (recoveryIntensity - struggleIntensity) /
                           Math.max(stressIntensity - struggleIntensity, 1);
        return Math.max(0, Math.min(1, recoveryRate));
    }

    createSlidingWindows(arcs, windowSize) {
        const windows = [];
        for (let i = windowSize; i <= arcs.length; i++) {
            windows.push(arcs.slice(i - windowSize, i));
        }
        return windows;
    }

    getWeekKey(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const weekStart = new Date(year, month, day - date.getDay());
        return weekStart.toDateString();
    }

    getMonthKey(date) {
        return `${date.getFullYear()}-${date.getMonth()}`;
    }

    pruneOldData(trends) {
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        // Prune daily trends older than 30 days
        for (const [dayKey, beats] of trends.daily) {
            if (beats.length > 0 && now - beats[0].timestamp > thirtyDays) {
                trends.daily.delete(dayKey);
            }
        }

        // Keep only last 12 weeks for weekly trends
        const weeklyKeys = Array.from(trends.weekly.keys()).sort();
        if (weeklyKeys.length > 12) {
            const keysToDelete = weeklyKeys.slice(0, weeklyKeys.length - 12);
            keysToDelete.forEach(key => trends.weekly.delete(key));
        }

        // Keep only last 12 months for monthly trends
        const monthlyKeys = Array.from(trends.monthly.keys()).sort();
        if (monthlyKeys.length > 12) {
            const keysToDelete = monthlyKeys.slice(0, monthlyKeys.length - 12);
            keysToDelete.forEach(key => trends.monthly.delete(key));
        }

        // Keep only last 1000 overall beats
        if (trends.overall.length > 1000) {
            trends.overall = trends.overall.slice(-1000);
        }
    }

    getTimeframeCutoff(timeframe) {
        const now = Date.now();
        const timeframes = {
            'day': 24 * 60 * 60 * 1000,
            'week': 7 * 24 * 60 * 60 * 1000,
            'month': 30 * 24 * 60 * 60 * 1000,
            'quarter': 90 * 24 * 60 * 60 * 1000,
            'year': 365 * 24 * 60 * 60 * 1000
        };

        return now - (timeframes[timeframe] || timeframes.month);
    }

    async storeConversationBeat(userId, beat) {
        if (!this.conversationBeats.has(userId)) {
            this.conversationBeats.set(userId, []);
        }

        const conversationBeat = {
            ...beat,
            conversationFlow: await this.analyzeConversationFlow(userId),
            topicEvolution: await this.trackTopicEvolution(userId),
            emotionalProgression: await this.trackEmotionalProgression(userId)
        };

        this.conversationBeats.get(userId).push(conversationBeat);

        // Keep only recent beats
        const beats = this.conversationBeats.get(userId);
        if (beats.length > 100) {
            beats.splice(0, beats.length - 100);
        }
    }

    async analyzeConversationFlow(userId) {
        const beats = this.conversationBeats.get(userId) || [];
        if (beats.length < 2) return null;

        const recent = beats.slice(-5);
        return {
            depth: this.calculateConversationDepth(recent),
            coherence: this.calculateConversationCoherence(recent),
            emotionalFlow: this.calculateEmotionalFlow(recent)
        };
    }

    calculateConversationDepth(beats) {
        // Measure how deep the conversation goes based on follow-up questions, elaborations, etc.
        let depth = 0;
        beats.forEach(beat => {
            if (beat.message.includes('?')) depth += 0.5;
            if (beat.message.length > 100) depth += 0.3;
            if (beat.context.followUp) depth += 0.4;
        });
        return Math.min(1, depth / beats.length);
    }

    calculateConversationCoherence(beats) {
        // Measure how coherent the conversation is
        let coherence = 0;
        for (let i = 1; i < beats.length; i++) {
            const current = beats[i];
            const previous = beats[i - 1];

            // Check if topics are related
            if (this.topicsRelated(current.context.topic, previous.context.topic)) {
                coherence += 0.5;
            }

            // Check if emotional states are consistent or show logical progression
            if (this.emotionalStatesCompatible(current.emotionalState, previous.emotionalState)) {
                coherence += 0.5;
            }
        }
        return coherence / (beats.length - 1);
    }

    calculateEmotionalFlow(beats) {
        const emotions = beats.map(beat => beat.emotionalState);
        return {
            startEmotion: emotions[0],
            endEmotion: emotions[emotions.length - 1],
            volatility: this.calculateEmotionalVariability(beats),
            overallTrajectory: this.assessEmotionalTrajectory(emotions)
        };
    }

    assessEmotionalTrajectory(emotions) {
        if (emotions.length < 2) return 'stable';

        const start = this.emotionToNumber(emotions[0]);
        const end = this.emotionToNumber(emotions[emotions.length - 1]);

        if (end > start + 1) return 'improving';
        if (end < start - 1) return 'declining';
        return 'stable';
    }

    topicsRelated(topic1, topic2) {
        if (!topic1 || !topic2) return false;
        // Simple topic similarity - could be enhanced with NLP
        return topic1.toLowerCase().includes(topic2.toLowerCase().split(' ')[0]) ||
               topic2.toLowerCase().includes(topic1.toLowerCase().split(' ')[0]);
    }

    emotionalStatesCompatible(state1, state2) {
        const compatibleStates = {
            'happy': ['content', 'excited', 'peaceful'],
            'sad': ['anxious', 'overwhelmed', 'frustrated'],
            'stressed': ['anxious', 'overwhelmed', 'frustrated'],
            'content': ['happy', 'peaceful', 'neutral'],
            'neutral': ['content', 'peaceful', 'anxious']
        };

        return compatibleStates[state1]?.includes(state2) || state1 === state2;
    }

    async trackTopicEvolution(userId) {
        const beats = this.conversationBeats.get(userId) || [];
        if (beats.length < 2) return null;

        const topics = beats.map(beat => beat.context.topic).filter(Boolean);
        return {
            currentTopic: topics[topics.length - 1],
            topicHistory: topics,
            topicShifts: this.detectTopicShifts(topics),
            topicDepth: this.calculateTopicDepth(topics)
        };
    }

    detectTopicShifts(topics) {
        const shifts = [];
        for (let i = 1; i < topics.length; i++) {
            if (topics[i] !== topics[i - 1]) {
                shifts.push({
                    from: topics[i - 1],
                    to: topics[i],
                    position: i
                });
            }
        }
        return shifts;
    }

    calculateTopicDepth(topics) {
        const uniqueTopics = new Set(topics);
        const topicFrequency = {};

        topics.forEach(topic => {
            topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
        });

        const avgDepth = Object.values(topicFrequency)
            .reduce((sum, freq) => sum + freq, 0) / uniqueTopics.size;

        return avgDepth;
    }

    async trackEmotionalProgression(userId) {
        const beats = this.conversationBeats.get(userId) || [];
        if (beats.length < 2) return null;

        const emotions = beats.map(beat => beat.emotionalState);
        return {
            startEmotion: emotions[0],
            currentEmotion: emotions[emotions.length - 1],
            progression: emotions,
            emotionalArc: this.calculateEmotionalArc(emotions),
            turningPoints: this.detectEmotionalTurningPoints(emotions)
        };
    }

    calculateEmotionalArc(emotions) {
        const start = this.emotionToNumber(emotions[0]);
        const end = this.emotionToNumber(emotions[emotions.length - 1]);
        const peak = Math.max(...emotions.map(e => this.emotionToNumber(e)));
        const valley = Math.min(...emotions.map(e => this.emotionToNumber(e)));

        return {
            start,
            end,
            peak,
            valley,
            amplitude: peak - valley,
            netChange: end - start
        };
    }

    detectEmotionalTurningPoints(emotions) {
        const turningPoints = [];
        const numericEmotions = emotions.map(e => this.emotionToNumber(e));

        for (let i = 1; i < numericEmotions.length - 1; i++) {
            const prev = numericEmotions[i - 1];
            const current = numericEmotions[i];
            const next = numericEmotions[i + 1];

            // Detect local maxima or minima
            if ((current > prev && current > next) || (current < prev && current < next)) {
                turningPoints.push({
                    position: i,
                    emotion: emotions[i],
                    type: current > prev && current > next ? 'peak' : 'valley',
                    magnitude: Math.abs(current - prev) + Math.abs(current - next)
                });
            }
        }

        return turningPoints;
    }

    startEmotionalTracking() {
        // Set up periodic emotional state assessment
        setInterval(async () => {
            // This would integrate with real-time monitoring
            // For now, just maintain the tracking system
            this.maintainTracking();
        }, 60000); // Every minute
    }

    async maintainTracking() {
        // Clean up old data periodically
        for (const [userId, arcs] of this.emotionalArcs) { // eslint-disable-line no-unused-vars
            // userId reserved for future user-specific cleanup logic
            if (arcs.length > 1000) {
                arcs.splice(0, arcs.length - 1000);
            }
        }

        // Update patterns for active users
        for (const userId of this.emotionalArcs.keys()) {
            await this.analyzeEmotionalPatterns(userId);
        }
    }

    async loadEmotionalHistory() {
        try {
            const stored = localStorage.getItem('sallie_emotional_arcs');
            if (stored) {
                const data = JSON.parse(stored);
                this.emotionalArcs = new Map(Object.entries(data.arcs || {}));
                this.moodTrends = new Map(Object.entries(data.trends || {}));
                this.conversationBeats = new Map(Object.entries(data.beats || {}));
                this.arcPatterns = new Map(Object.entries(data.patterns || {}));
            }
        } catch (error) {
            console.warn('Could not load emotional history:', error);
        }
    }

    saveEmotionalHistory() {
        try {
            const data = {
                arcs: Object.fromEntries(this.emotionalArcs),
                trends: Object.fromEntries(this.moodTrends),
                beats: Object.fromEntries(this.conversationBeats),
                patterns: Object.fromEntries(this.arcPatterns)
            };
            localStorage.setItem('sallie_emotional_arcs', JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save emotional history:', error);
        }
    }

    /* [NEW][EmotionalArcMemory]: Multi-Threaded Dialogue Memory - parallel state tracking */
    async initializeMultiThreadedMemory(userId) {
        if (!this.multiThreadMemory) {
            this.multiThreadMemory = new Map();
        }

        if (!this.multiThreadMemory.has(userId)) {
            this.multiThreadMemory.set(userId, {
                activeThreads: new Map(),
                threadHistory: [],
                threadRelations: new Map(),
                lastThreadId: 0
            });
        }

        return this.multiThreadMemory.get(userId);
    }

    async createDialogueThread(userId, context, emotionalArc) {
        const memory = await this.initializeMultiThreadedMemory(userId);
        const threadId = ++memory.lastThreadId;

        const thread = {
            id: threadId,
            startTime: Date.now(),
            context: context,
            initialEmotionalArc: { ...emotionalArc },
            messages: [],
            emotionalShifts: [],
            relatedThreads: [],
            status: 'active',
            summary: await this.generateThreadSummary(context, emotionalArc),
            provenance: `Thread created for ${context.type || 'general'} context`
        };

        memory.activeThreads.set(threadId, thread);
        memory.threadHistory.push(thread);

        // Log thread creation
        this.provenanceLog.set(`${userId}_thread_${threadId}`, {
            action: 'thread_created',
            threadId,
            context: context.type || 'general',
            initialMood: emotionalArc.currentMood,
            timestamp: Date.now()
        });

        return thread;
    }

    async updateDialogueThread(userId, threadId, message, emotionalShift) {
        const memory = this.multiThreadMemory.get(userId);
        if (!memory || !memory.activeThreads.has(threadId)) {
            return null;
        }

        const thread = memory.activeThreads.get(threadId);
        thread.messages.push({
            content: message,
            timestamp: Date.now(),
            emotionalState: { ...emotionalShift }
        });

        thread.emotionalShifts.push({
            from: thread.emotionalShifts.length > 0 ?
                  thread.emotionalShifts[thread.emotionalShifts.length - 1].to :
                  thread.initialEmotionalArc.currentMood,
            to: emotionalShift.currentMood,
            timestamp: Date.now(),
            trigger: message
        });

        // Update thread summary
        thread.summary = await this.generateUpdatedThreadSummary(thread);

        // Check for thread completion or branching
        await this.evaluateThreadEvolution(thread, userId);

        return thread;
    }

    async generateUpdatedThreadSummary(thread) {
        const messageCount = thread.messages.length;
        const emotionalRange = thread.emotionalShifts.length > 0 ?
            `${thread.initialEmotionalArc.currentMood} → ${thread.emotionalShifts[thread.emotionalShifts.length - 1].to}` :
            thread.initialEmotionalArc.currentMood;

        return `${thread.context.type || 'general'} conversation (${messageCount} msgs) - ${emotionalRange}`;
    }

    async evaluateThreadEvolution(thread, userId) {
        const messageCount = thread.messages.length;
        const timeElapsed = Date.now() - thread.startTime;
        const emotionalChange = thread.emotionalShifts.length;

        // Thread completion criteria
        if (messageCount > 15 || timeElapsed > 600000 || emotionalChange > 8) { // 10 minutes
            thread.status = 'completed';
            await this.archiveThread(thread, userId);
        }

        // Thread branching criteria
        if (emotionalChange > 5 && messageCount > 8) {
            await this.createBranchThread(thread, userId);
        }
    }

    async archiveThread(thread, userId) {
        const memory = this.multiThreadMemory.get(userId);
        memory.activeThreads.delete(thread.id);

        // Update thread relations
        thread.relatedThreads.forEach(relatedId => {
            if (memory.threadRelations.has(relatedId)) {
                memory.threadRelations.get(relatedId).push(thread.id);
            }
        });

        // Log thread archival
        this.provenanceLog.set(`${userId}_thread_${thread.id}_archived`, {
            action: 'thread_archived',
            threadId: thread.id,
            messageCount: thread.messages.length,
            duration: Date.now() - thread.startTime,
            finalMood: thread.emotionalShifts.length > 0 ?
                      thread.emotionalShifts[thread.emotionalShifts.length - 1].to :
                      thread.initialEmotionalArc.currentMood,
            timestamp: Date.now()
        });
    }

    async createBranchThread(parentThread, userId) {
        const memory = await this.initializeMultiThreadedMemory(userId);
        const branchId = ++memory.lastThreadId;

        const branchThread = {
            id: branchId,
            parentId: parentThread.id,
            startTime: Date.now(),
            context: { type: 'branch', parentContext: parentThread.context },
            initialEmotionalArc: { ...parentThread.emotionalShifts[parentThread.emotionalShifts.length - 1] },
            messages: [],
            emotionalShifts: [],
            relatedThreads: [parentThread.id],
            status: 'active',
            summary: `Branch from thread ${parentThread.id}`,
            provenance: `Branch created from thread ${parentThread.id}`
        };

        memory.activeThreads.set(branchId, branchThread);
        memory.threadHistory.push(branchThread);

        // Update parent thread relations
        if (!memory.threadRelations.has(parentThread.id)) {
            memory.threadRelations.set(parentThread.id, []);
        }
        memory.threadRelations.get(parentThread.id).push(branchId);

        // Log branch creation
        this.provenanceLog.set(`${userId}_thread_${branchId}_branched`, {
            action: 'thread_branched',
            parentThreadId: parentThread.id,
            branchThreadId: branchId,
            timestamp: Date.now()
        });

        return branchThread;
    }

    async getActiveThreads(userId) {
        const memory = this.multiThreadMemory?.get(userId);
        if (!memory) return [];

        return Array.from(memory.activeThreads.values());
    }

    async getThreadHistory(userId, limit = 10) {
        const memory = this.multiThreadMemory?.get(userId);
        if (!memory) return [];

        return memory.threadHistory.slice(-limit);
    }

    async recallRelevantThreads(userId, currentContext) {
        const memory = this.multiThreadMemory?.get(userId);
        if (!memory) return [];

        // Find threads with similar context
        const relevantThreads = memory.threadHistory.filter(thread =>
            this.isContextSimilar(thread.context, currentContext)
        );

        return relevantThreads.slice(-5); // Return last 5 relevant threads
    }

    isContextSimilar(context1, context2) {
        return (context1.type === context2.type) ||
               (context1.topic && context2.topic && context1.topic === context2.topic);
    }
}
