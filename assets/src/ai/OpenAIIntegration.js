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
                                        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
                                                                                                                                                                                                                                                                                                         console.error('Failed to fetch API key:', error);
                                                                                                                                                                                                                                                                                                         return null;
                                                                                                                                                                                                                                                                                             }
                                                                                                                                                                                                                                                                                     }
                                                                                                                                                                                                                     }
