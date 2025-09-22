/*
 * Persona: Tough love meets soul care.
 * Module: Emotional Arc
 * Intent: Manage emotional progression and arcs throughout interactions.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440004
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

export class EmotionalArc {
    constructor() {
        this.emotionalStates = new Map();
        this.arcHistory = [];
        this.currentArc = null;
    }

    initializeEmotionalArc(userId) {
        const baseArc = {
            userId,
            startTime: Date.now(),
            currentEmotion: 'neutral',
            emotionalJourney: [],
            triggers: [],
            resolutions: []
        };
        this.emotionalStates.set(userId, baseArc);
        return baseArc;
    }

    updateEmotionalState(userId, emotion, intensity = 1.0, context = {}) {
        const arc = this.emotionalStates.get(userId);
        if (!arc) return null;

        const emotionalPoint = {
            timestamp: Date.now(),
            emotion,
            intensity,
            context,
            provenance: 'emotional_update'
        };

        arc.currentEmotion = emotion;
        arc.emotionalJourney.push(emotionalPoint);
        arc.lastUpdated = Date.now();

        this.arcHistory.push({
            userId,
            ...emotionalPoint
        });

        return arc;
    }

    getEmotionalArc(userId) {
        return this.emotionalStates.get(userId) || null;
    }

    analyzeEmotionalProgression(userId) {
        const arc = this.getEmotionalArc(userId);
        if (!arc || arc.emotionalJourney.length < 2) return null;

        const journey = arc.emotionalJourney;
        const progression = {
            startEmotion: journey[0].emotion,
            endEmotion: journey[journey.length - 1].emotion,
            peakIntensity: Math.max(...journey.map(p => p.intensity)),
            emotionalVariability: this.calculateVariability(journey),
            dominantEmotions: this.getDominantEmotions(journey)
        };

        return progression;
    }

    calculateVariability(journey) {
        const intensities = journey.map(p => p.intensity);
        const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        const variance = intensities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intensities.length;
        return Math.sqrt(variance);
    }

    getDominantEmotions(journey) {
        const emotionCounts = {};
        journey.forEach(point => {
            emotionCounts[point.emotion] = (emotionCounts[point.emotion] || 0) + 1;
        });
        return Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([emotion, count]) => ({ emotion, count }));
    }
}
