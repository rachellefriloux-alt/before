/*
 * Persona: Tough love meets soul care.
 * Module: OpenAIIntegration
 * Intent: Handle functionality for OpenAIIntegration
 * Provenance-ID: c1ed08e2-1009-44fb-a850-8eccd09b0bee
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: OpenAI integration for intelligent conversation generation.
 * Got it, love.
 */

export class OpenAIIntegration {
    constructor() {
        this.apiKey = null; // Will be set asynchronously during initialization via getApiKey()
        this.baseUrl = 'https://api.openai.com/v1';
        this.initialized = false;
        // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
        this.model = 'gpt-4o';
        this.defaultConfig = {
            max_tokens: 500,
            maxTokens: 500,
            topP: 0.9,
            frequencyPenalty: 0.3,
            presencePenalty: 0.3
        };
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
            // eslint-disable-next-line no-unused-vars
            const _error = error; // Error available for debugging purposes
            // Failed to fetch API key
            return null;
        }
    }

    async initialize() {
        this.apiKey = await this.getApiKey();
        this.initialized = true;
    }

    async generateResponse(message, context = {}) {
        // eslint-disable-next-line no-unused-vars
        const _context = context; // Reserved for future context-aware response generation
        if (!this.apiKey) {
            throw new Error('OpenAI API key not available');
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
                    messages: [
                        {
                            role: 'system',
                            content: 'You are Sallie, a compassionate AI companion with tough love. You provide emotional support while encouraging growth and accountability. Always respond with empathy and wisdom.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    ...this.defaultConfig
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            // OpenAI API call failed
            return 'I\'m having trouble connecting right now, but I\'m here with you. Let\'s try again in a moment.';
        }
    }
}
