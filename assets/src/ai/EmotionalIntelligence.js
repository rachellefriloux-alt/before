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
                                        this.emotionPatterns = this.initializeEmotionPatterns();
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

        const analysis = {
            timestamp: Date.now(),
            message: message,
            primaryEmotion: 'neutral',
            intensity: 0.5,
            valence: 0.5, // positive/negative scale
            arousal: 0.5, // energy level
            confidence: 0.5,
            detectedEmotions: [],
            linguisticCues: []
        };

        // Analyze emotional content using multiple approaches
        analysis.detectedEmotions = this.detectEmotionsFromText(message);
        this.updateAnalysisHistory(analysis);
        return analysis;
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
    initializeEmotionPatterns() {
        this.emotionPatterns = [
            { name: 'joy', keywords: ['happy', 'joyful', 'delighted'] },
            { name: 'anger', keywords: ['angry', 'mad', 'furious'] },
            { name: 'sadness', keywords: ['sad', 'down', 'depressed'] },
            { name: 'fear', keywords: ['afraid', 'scared', 'nervous'] },
            { name: 'surprise', keywords: ['surprised', 'shocked', 'amazed'] },
            { name: 'disgust', keywords: ['disgusted', 'gross', 'nauseated'] }
        ];
        return {};
    }

    detectEmotionsFromText(message) {
        if (!message || typeof message !== 'string') {
            return [];
        }

        const detectedEmotions = [];
        const lowerMessage = message.toLowerCase();
        const words = lowerMessage.split(/\s+/);

        // Analyze each emotion pattern
        for (const pattern of this.emotionPatterns) {
            let matchCount = 0;

            // Check for keyword matches
            for (const keyword of pattern.keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = lowerMessage.match(regex);
                if (matches) {
                    matchCount += matches.length;
                }
            }

            // Check for intensity modifiers
            const intensifiers = ['very', 'really', 'so', 'extremely', 'totally'];
            const diminishers = ['a bit', 'kinda', 'sort of', 'slightly'];

            let intensityModifier = 1.0;
            for (const intensifier of intensifiers) {
                if (lowerMessage.includes(intensifier)) {
                    intensityModifier *= 1.5;
                }
            }
            for (const diminisher of diminishers) {
                if (lowerMessage.includes(diminisher)) {
                    intensityModifier *= 0.7;
                }
            }

            // Calculate confidence based on matches and context
            const confidence = Math.min(1.0, (matchCount / words.length) * intensityModifier);

            if (confidence > 0.1) { // Threshold for detection
                detectedEmotions.push({
                    emotion: pattern.name,
                    confidence: confidence,
                    intensity: Math.min(1.0, confidence * intensityModifier),
                    keywords: pattern.keywords.filter(keyword =>
                        lowerMessage.includes(keyword.toLowerCase())
                    )
                });
            }
        }

        // Sort by confidence and return top emotions
        return detectedEmotions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3); // Return top 3 emotions
    }

    updateAnalysisHistory(analysis) {
        this.lastAnalysis = analysis;
        this.emotionHistory.push(analysis);
    }

    async loadFromStorage() {
        try {
            // Load emotion history from localStorage as JSON array
            const data = localStorage.getItem('sallie_emotionHistory');

            if (data) {
                const parsedData = JSON.parse(data);

                // Validate and sanitize the loaded data
                if (Array.isArray(parsedData)) {
                    this.emotionHistory = parsedData.filter(item => {
                        // Basic validation for emotion history items
                        return item &&
                               typeof item.timestamp === 'number' &&
                               typeof item.message === 'string' &&
                               typeof item.primaryEmotion === 'string';
                    });

                    console.log(`Loaded ${this.emotionHistory.length} emotion analysis records from storage`);
                } else {
                    console.warn('Invalid emotion history data format, initializing empty history');
                    this.emotionHistory = [];
                }
            } else {
                // No existing data, initialize empty history
                this.emotionHistory = [];
                console.log('No existing emotion history found, starting fresh');
            }

            // Limit history size to prevent memory issues
            const maxHistorySize = 1000;
            if (this.emotionHistory.length > maxHistorySize) {
                this.emotionHistory = this.emotionHistory.slice(-maxHistorySize);
                console.log(`Trimmed emotion history to last ${maxHistorySize} records`);
            }

        } catch (error) {
            console.error('Error loading emotion history from storage:', error);
            // Initialize with empty history on error
            this.emotionHistory = [];
        }
    }
}
