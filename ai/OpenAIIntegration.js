/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced OpenAI integration with conversation memory, context awareness, and advanced features.
 * Got it, love.
 */

import AIContextManager from './AIContextManager.ts';

export class OpenAIIntegration {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://api.openai.com/v1';
        this.initialized = false;
        this.model = 'gpt-4o';
        this.conversationHistory = new Map(); // Store conversation history per user
        this.maxHistoryLength = 50; // Maximum messages to keep in history
        this.responseCache = new Map(); // Cache responses for similar messages
        this.pendingRequests = new Set(); // Prevent duplicate concurrent requests
        this.defaultConfig = {
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.3
        };
        this.personaPrompt = `You are Sallie, a compassionate AI companion with tough love. You provide emotional support while encouraging growth and accountability. Your responses should:

1. Show genuine empathy and understanding
2. Offer practical wisdom and guidance
3. Encourage personal responsibility and growth
4. Maintain healthy boundaries
5. Use appropriate humor when suitable
6. Adapt your tone based on the user's emotional state
7. Remember previous conversations and build on them
8. Provide actionable advice when appropriate

Always respond with empathy, wisdom, and the right balance of support and challenge.`;
    }

                                                                                                                             async getApiKey() {
                                                                                                                                     // Try to get API key from environment variables (server-side)
                                                                                                                                             if (typeof window === 'undefined') {
                                                                                                                                                         // Server-side environment
                                                                                                                                                                     return process.env.OPENAI_API_KEY || null;
                                                                                                                                                                             }

                                                                                                                                                                                             // Client-side environment - fetch from server
                                                                                                                                                                                                     try {
                                                                                                                                                                                                                                                                                                         const response = await fetch('/api/openai-key');
                                                                                                                                                                                                                                                                                                                     const data = await response.json();
                                                                                                                                                                                                                                                                                                                     return data.apiKey || null;
                                                                                                                                                                                                                                                                                             } catch (error) {
                                                                                                                                                                                                                                                                                                         // Failed to fetch API key
                                                                                                                                                                                                                                                                                                         return null;
                                                                                                                                                                                                                                                                                             }
                                                                                                                                                                                                                                                                                     }

    async initialize() {
        this.apiKey = await this.getApiKey();
        this.initialized = true;
    }

    async generateResponse(message, context = {}) {
        const userId = context.userId || 'default';
        
        // Build comprehensive context using AIContextManager
        const aiContextManager = AIContextManager.getInstance();
        const fullContext = await aiContextManager.buildContext(userId, message);
        
        // Merge provided context with AI context
        const enhancedContext = {
            ...context,
            emotionalState: fullContext.emotionalState,
            userPreferences: fullContext.preferences,
            recentMemories: fullContext.recentMemories.slice(0, 3), // Include recent memories
            activeTasks: fullContext.activeTasks,
            relevantPeople: fullContext.relevantPeople
        };
        
        const cacheKey = this.generateCacheKey(message, enhancedContext);
        
        // Check cache first
        if (this.responseCache.has(cacheKey)) {
            // Learn from this interaction even with cached response
            await aiContextManager.learnFromInteraction(userId, message, this.responseCache.get(cacheKey));
            return this.responseCache.get(cacheKey);
        }
        
        // Prevent duplicate concurrent requests
        if (this.pendingRequests.has(cacheKey)) {
            return new Promise((resolve, reject) => {
                const checkPending = () => {
                    if (this.responseCache.has(cacheKey)) {
                        resolve(this.responseCache.get(cacheKey));
                    } else if (this.pendingRequests.has(cacheKey)) {
                        setTimeout(checkPending, 100);
                    } else {
                        reject(new Error('Request failed'));
                    }
                };
                checkPending();
            });
        }
        
        this.pendingRequests.add(cacheKey);
        
        try {
            const response = await this.makeOpenAIRequest(message, enhancedContext);
            
            // Cache the response
            this.responseCache.set(cacheKey, response);
            
            // Limit cache size
            if (this.responseCache.size > 100) {
                const firstKey = this.responseCache.keys().next().value;
                this.responseCache.delete(firstKey);
            }
            
            return response;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    async makeOpenAIRequest(message, context = {}) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not available');
        }

        const userId = context.userId || 'default';
        const conversationHistory = this.getConversationHistory(userId);

        // Add user message to history
        conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: Date.now()
        });

        // Prepare messages for API call
        const messages = [
            { role: 'system', content: this.personaPrompt },
            ...conversationHistory.slice(-this.maxHistoryLength) // Keep only recent messages
        ];

        // Add context information if provided
        if (context.emotionalState) {
            messages.push({
                role: 'system',
                content: `User's current emotional state: ${JSON.stringify(context.emotionalState)}`
            });
        }

        if (context.userPreferences) {
            messages.push({
                role: 'system',
                content: `User preferences: ${JSON.stringify(context.userPreferences)}`
            });
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    ...this.defaultConfig,
                    ...(context.config || {}) // Allow overriding config
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            // Add AI response to history
            conversationHistory.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: Date.now()
            });

            // Trim history if too long
            if (conversationHistory.length > this.maxHistoryLength) {
                conversationHistory.splice(0, conversationHistory.length - this.maxHistoryLength);
            }

            // Learn from this interaction
            const aiContextManager = AIContextManager.getInstance();
            await aiContextManager.learnFromInteraction(userId, message, aiResponse);

            return aiResponse;
        } catch (error) {
            // OpenAI API call failed - returning fallback response
            return 'I\'m having trouble connecting right now, but I\'m here with you. Let\'s try again in a moment.';
        }
    }

    generateCacheKey(message, context = {}) {
        // Create a deterministic key based on message and relevant context
        const keyData = {
            message: message.substring(0, 200), // Limit message length for cache key
            emotionalState: context.emotionalState,
            userPreferences: context.userPreferences,
            config: context.config
        };
        return btoa(JSON.stringify(keyData)).substring(0, 50); // Base64 encode and limit length
    }

    getConversationHistory(userId) {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        return this.conversationHistory.get(userId);
    }

    getConversationSummary(userId) {
        const history = this.getConversationHistory(userId);
        if (history.length === 0) return null;

        const recentMessages = history.slice(-10); // Last 10 messages
        return {
            messageCount: history.length,
            recentTopics: this.extractTopics(recentMessages),
            emotionalTrend: this.analyzeEmotionalTrend(recentMessages),
            lastInteraction: history[history.length - 1].timestamp
        };
    }

    extractTopics(messages) {
        // Simple topic extraction - could be enhanced with NLP
        const topics = new Set();
        const topicKeywords = ['work', 'relationship', 'family', 'health', 'stress', 'anxiety', 'depression', 'goals', 'challenges'];

        messages.forEach(msg => {
            const content = msg.content.toLowerCase();
            topicKeywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    topics.add(keyword);
                }
            });
        });

        return Array.from(topics);
    }

    analyzeEmotionalTrend(messages) {
        // Simple emotional trend analysis
        const emotionalWords = {
            positive: ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'excited'],
            negative: ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'worried', 'anxious']
        };

        let positiveCount = 0;
        let negativeCount = 0;

        messages.forEach(msg => {
            const content = msg.content.toLowerCase();
            emotionalWords.positive.forEach(word => {
                if (content.includes(word)) positiveCount++;
            });
            emotionalWords.negative.forEach(word => {
                if (content.includes(word)) negativeCount++;
            });
        });

        if (positiveCount > negativeCount) return 'improving';
        if (negativeCount > positiveCount) return 'concerning';
        return 'stable';
    }

    updateConfig(newConfig) {
        this.defaultConfig = { ...this.defaultConfig, ...newConfig };
    }

    setModel(model) {
        // Allow model switching for different use cases
        const allowedModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
        if (allowedModels.includes(model)) {
            this.model = model;
        } else {
            throw new Error(`Model ${model} is not allowed. Use one of: ${allowedModels.join(', ')}`);
        }
    }

    clearCache() {
        this.responseCache.clear();
        this.pendingRequests.clear();
    }
}
