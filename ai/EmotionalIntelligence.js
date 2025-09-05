/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Emotional analysis and tone adaptation system.
    * Got it, love.
     */

     export class EmotionalIntelligence {
            constructor() {
                        this.initialized = false;
                                this.emotionHistory = [];
                                        this.lastAnalysis = null;
                                        this.emotionCache = new Map(); // Cache emotion analysis results
        this.cacheMaxSize = 200; // Maximum cache entries
        this.analysisQueue = []; // Queue for batch processing
        this.isProcessing = false; // Prevent concurrent processing
    }

    async initialize() {
        await this.loadFromStorage();
        this.initialized = true;
        // Emotional intelligence system initialized
    }

    async analyzeMessage(message) {
        if (!this.initialized) {
            throw new Error('Emotional intelligence system not initialized');
        }
        
        // Check cache first
        const cacheKey = this.generateCacheKey(message);
        if (this.emotionCache.has(cacheKey)) {
            return this.emotionCache.get(cacheKey);
        }
        
        // Queue for batch processing if many requests come in
        if (this.analysisQueue.length > 0 || this.isProcessing) {
            return new Promise((resolve) => {
                this.analysisQueue.push({
                    message,
                    resolve
                });
                
                // Start processing if not already in progress
                if (!this.isProcessing) {
                    this.processBatch();
                }
            });
        }
        
        this.isProcessing = true;
        
        try {
            const detectedEmotions = this.detectEmotionsFromText(message);
            const primaryEmotion = detectedEmotions.length > 0 ? detectedEmotions[0] : null;

            const analysis = {
                timestamp: Date.now(),
                message: message,
                primaryEmotion: primaryEmotion ? primaryEmotion.emotion : 'neutral',
                intensity: primaryEmotion ? primaryEmotion.intensity : 0.5,
                valence: primaryEmotion ? primaryEmotion.valence : 0.0,
                arousal: primaryEmotion ? primaryEmotion.arousal : 0.5,
                confidence: detectedEmotions.length > 0 ? Math.min(detectedEmotions[0].score, 1.0) : 0.5,
                detectedEmotions: detectedEmotions,
                linguisticCues: this.extractLinguisticCues(message),
                sentiment: this.calculateOverallSentiment(detectedEmotions),
                recommendations: this.generateRecommendations(detectedEmotions)
            };
            
            // Cache the result
            this.emotionCache.set(cacheKey, analysis);
            
            // Limit cache size
            if (this.emotionCache.size > this.cacheMaxSize) {
                const firstKey = this.emotionCache.keys().next().value;
                this.emotionCache.delete(firstKey);
            }
            
            this.updateAnalysisHistory(analysis);
            return analysis;
        } finally {
            this.isProcessing = false;
            
            // Process any queued messages
            if (this.analysisQueue.length > 0) {
                setTimeout(() => this.processBatch(), 0);
            }
        }

        this.updateAnalysisHistory(analysis);
        return analysis;
    }

    extractLinguisticCues(message) {
        const cues = [];
        const text = message.toLowerCase();

        // Check for punctuation patterns
        if (text.includes('!')) cues.push('exclamation');
        if (text.includes('?')) cues.push('question');
        if (text.includes('...') || text.includes('…')) cues.push('ellipsis');

        // Check for capitalization patterns
        if (message === message.toUpperCase() && message.length > 5) {
            cues.push('all_caps');
        }

        // Check for repeated words/letters
        if (/(\w)\1{2,}/.test(text)) cues.push('repetition');

        // Check for intensifiers
        const intensifiers = ['very', 'really', 'so', 'extremely', 'totally'];
        intensifiers.forEach(intensifier => {
            if (text.includes(intensifier)) cues.push('intensifier');
        });

        return cues;
    }

    calculateOverallSentiment(detectedEmotions) {
        if (detectedEmotions.length === 0) return 'neutral';

        const totalValence = detectedEmotions.reduce((sum, emotion) => sum + emotion.valence, 0);
        const averageValence = totalValence / detectedEmotions.length;

        if (averageValence > 0.3) return 'positive';
        if (averageValence < -0.3) return 'negative';
        return 'neutral';
    }

    generateRecommendations(detectedEmotions) {
        const recommendations = [];

        if (detectedEmotions.some(e => e.emotion === 'sadness' || e.emotion === 'anger')) {
            recommendations.push('Offer empathetic listening and validation');
            recommendations.push('Suggest healthy coping strategies');
        }

        if (detectedEmotions.some(e => e.emotion === 'anxiety' || e.emotion === 'fear')) {
            recommendations.push('Provide reassurance and grounding techniques');
            recommendations.push('Encourage professional help if needed');
        }

        if (detectedEmotions.some(e => e.emotion === 'joy' || e.emotion === 'gratitude')) {
            recommendations.push('Celebrate positive emotions');
            recommendations.push('Reinforce healthy patterns');
        }

        if (detectedEmotions.length === 0) {
            recommendations.push('Continue neutral, supportive conversation');
        }

        return recommendations;
    }

    getEmotionalTrends(timeframe = 7 * 24 * 60 * 60 * 1000) { // 7 days in milliseconds
        const now = Date.now();
        const recentAnalyses = this.emotionHistory.filter(
            analysis => (now - analysis.timestamp) < timeframe
        );

        if (recentAnalyses.length === 0) return null;

        const emotionCounts = {};
        recentAnalyses.forEach(analysis => {
            const emotion = analysis.primaryEmotion;
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });

        const dominantEmotion = Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a)[0][0];

        const averageIntensity = recentAnalyses.reduce(
            (sum, analysis) => sum + analysis.intensity, 0
        ) / recentAnalyses.length;

        return {
            dominantEmotion,
            averageIntensity,
            totalAnalyses: recentAnalyses.length,
            emotionDistribution: emotionCounts,
            trend: this.calculateEmotionalTrend(recentAnalyses)
        };
    }

    calculateEmotionalTrend(analyses) {
        if (analyses.length < 2) return 'stable';

        const recent = analyses.slice(-Math.ceil(analyses.length / 2));
        const earlier = analyses.slice(0, Math.floor(analyses.length / 2));

        const recentAvg = recent.reduce((sum, a) => sum + a.valence, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, a) => sum + a.valence, 0) / earlier.length;

        const difference = recentAvg - earlierAvg;

        if (difference > 0.2) return 'improving';
        if (difference < -0.2) return 'declining';
        return 'stable';
    }

    /**
     * Initializes emotion patterns.
     * Expected structure: an object mapping emotion names (e.g., "joy", "anger") to pattern definitions
     * or detection rules, which can be used for emotion analysis in messages.
     * Example:
     * {
     *   joy: { keywords: ["happy", "joyful"], threshold: 0.7 },
     *   anger: { keywords: ["angry", "mad"], threshold: 0.6 }
     * }
     */
    processBatch() {
        if (this.analysisQueue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        
        // Process up to 10 items at once
        const batch = this.analysisQueue.splice(0, 10);
        
        Promise.all(batch.map(async ({ message, resolve }) => {
            const cacheKey = this.generateCacheKey(message);
            
            // Check cache again (might have been added since queuing)
            if (this.emotionCache.has(cacheKey)) {
                resolve(this.emotionCache.get(cacheKey));
                return;
            }
            
            try {
                const detectedEmotions = this.detectEmotionsFromText(message);
                const primaryEmotion = detectedEmotions.length > 0 ? detectedEmotions[0] : null;
                
                const analysis = {
                    timestamp: Date.now(),
                    message: message,
                    primaryEmotion: primaryEmotion ? primaryEmotion.emotion : 'neutral',
                    intensity: primaryEmotion ? primaryEmotion.intensity : 0.5,
                    valence: primaryEmotion ? primaryEmotion.valence : 0.0,
                    arousal: primaryEmotion ? primaryEmotion.arousal : 0.5,
                    confidence: detectedEmotions.length > 0 ? Math.min(detectedEmotions[0].score, 1.0) : 0.5,
                    detectedEmotions: detectedEmotions,
                    linguisticCues: this.extractLinguisticCues(message),
                    sentiment: this.calculateOverallSentiment(detectedEmotions),
                    recommendations: this.generateRecommendations(detectedEmotions)
                };
                
                this.emotionCache.set(cacheKey, analysis);
                this.updateAnalysisHistory(analysis);
                resolve(analysis);
            } catch (error) {
                // Error analyzing message - fallback to neutral
                resolve({
                    primaryEmotion: 'neutral',
                    intensity: 0.5,
                    confidence: 0.5,
                    error: error.message
                });
            }
        })).finally(() => {
            // Continue with next batch if there are more items
            if (this.analysisQueue.length > 0) {
                this.processBatch();
            } else {
                this.isProcessing = false;
            }
        });
    }

    generateCacheKey(message) {
        // Create a simple hash from the message
        return message.substring(0, 100).toLowerCase().trim();
    }

    clearCache() {
        this.emotionCache.clear();
    }

    initializeEmotionPatterns() {
        return {
            joy: {
                keywords: ['happy', 'joyful', 'delighted', 'excited', 'wonderful', 'amazing', 'great', 'fantastic', 'awesome', 'love', 'loved', 'enjoy', 'pleased'],
                intensity: 0.8,
                valence: 0.9,
                arousal: 0.7
            },
            anger: {
                keywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'pissed', 'hate', 'hated', 'rage', 'fury'],
                intensity: 0.9,
                valence: -0.8,
                arousal: 0.9
            },
            sadness: {
                keywords: ['sad', 'down', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'grief', 'sorrow', 'cry', 'crying', 'tears'],
                intensity: 0.8,
                valence: -0.9,
                arousal: -0.3
            },
            fear: {
                keywords: ['afraid', 'scared', 'nervous', 'anxious', 'worried', 'terrified', 'panic', 'fear', 'frightened', 'dread'],
                intensity: 0.8,
                valence: -0.7,
                arousal: 0.8
            },
            surprise: {
                keywords: ['surprised', 'shocked', 'amazed', 'astonished', 'wow', 'unexpected', 'sudden', 'startled'],
                intensity: 0.7,
                valence: 0.1,
                arousal: 0.8
            },
            disgust: {
                keywords: ['disgusted', 'gross', 'nauseated', 'repulsed', 'sick', 'revolted', 'horrified', 'appalled'],
                intensity: 0.7,
                valence: -0.8,
                arousal: 0.4
            },
            love: {
                keywords: ['love', 'loved', 'caring', 'affection', 'tenderness', 'warmth', 'cherish', 'adore'],
                intensity: 0.8,
                valence: 0.9,
                arousal: 0.5
            },
            hope: {
                keywords: ['hope', 'optimistic', 'confident', 'believe', 'trust', 'faith', 'positive', 'encouraged'],
                intensity: 0.6,
                valence: 0.7,
                arousal: 0.4
            },
            guilt: {
                keywords: ['guilty', 'sorry', 'regret', 'remorse', 'ashamed', 'blame', 'responsible'],
                intensity: 0.7,
                valence: -0.6,
                arousal: 0.3
            },
            gratitude: {
                keywords: ['thankful', 'grateful', 'appreciate', 'blessed', 'fortunate', 'thanks', 'gratitude'],
                intensity: 0.6,
                valence: 0.8,
                arousal: 0.3
            }
        };
    }

    detectEmotionsFromText(message) {
        const detectedEmotions = [];
        const text = message.toLowerCase();

        // Analyze each emotion pattern
        Object.entries(this.emotionPatterns).forEach(([emotionName, pattern]) => {
            let score = 0;
            let matches = 0;

            // Check for keyword matches
            pattern.keywords.forEach(keyword => {
                const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
                const matchCount = (text.match(keywordRegex) || []).length;
                if (matchCount > 0) {
                    matches += matchCount;
                    score += matchCount * pattern.intensity;
                }
            });

            // Boost score for repeated words
            if (matches > 1) {
                score *= 1.2;
            }

            // Check for intensifiers
            const intensifiers = ['very', 'really', 'so', 'extremely', 'totally', 'absolutely'];
            intensifiers.forEach(intensifier => {
                if (text.includes(intensifier)) {
                    score *= 1.3;
                }
            });

            // Check for negations (reduce score)
            const negations = ['not', 'no', 'never', 'don\'t', 'can\'t', 'won\'t'];
            negations.forEach(negation => {
                if (text.includes(negation)) {
                    score *= 0.7;
                }
            });

            if (score > 0.3) { // Threshold for detection
                detectedEmotions.push({
                    emotion: emotionName,
                    score: Math.min(score, 1.0), // Cap at 1.0
                    intensity: pattern.intensity,
                    valence: pattern.valence,
                    arousal: pattern.arousal
                });
            }
        });

        // Sort by score descending
        return detectedEmotions.sort((a, b) => b.score - a.score);
    }

    updateAnalysisHistory(analysis) {
        this.lastAnalysis = analysis;
        this.emotionHistory.push(analysis);
    }

    async loadFromStorage() {
        // Placeholder: Load emotion history from localStorage as JSON array
        // Expected format: [{ timestamp, message, primaryEmotion, ... }, ...]
        // Replace with remote storage logic if needed
        // Example:
        // const data = localStorage.getItem('emotionHistory');
        // this.emotionHistory = data ? JSON.parse(data) : [];
    }
}
