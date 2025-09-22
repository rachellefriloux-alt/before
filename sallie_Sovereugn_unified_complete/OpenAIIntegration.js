/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: OpenAI integration for intelligent conversation generation.
    * Got it, love.
     */

     export class OpenAIIntegration {
         constructor() {
                 this.apiKey = null; // Will be set during initialization
                         this.baseUrl = 'https://api.openai.com/v1';
                                 this.initialized = false;
                                         this.model = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                                                 this.defaultConfig = {
                                                             temperature: 0.8,
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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ai\OpenAIIntegration.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ai\OpenAIIntegration.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ai\OpenAIIntegration.js) --- */
/* Merged master for logical file: ai\OpenAIIntegration
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ai\OpenAIIntegration.js (hash:BD909B9046A4E73F2B4ED0621C3B708E1D261C3F908813A0344615C932D5889E)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\OpenAIIntegration.js (hash:0A398743260A7BC51A4DB380669AB6060CF9F56B2C9B7B9DE15206B95844B859)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ai\OpenAIIntegration.js | ext: .js | sha: BD909B9046A4E73F2B4ED0621C3B708E1D261C3F908813A0344615C932D5889E ---- */
[BINARY FILE - original copied to merged_sources: ai\OpenAIIntegration.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\OpenAIIntegration.js | ext: .js | sha: 0A398743260A7BC51A4DB380669AB6060CF9F56B2C9B7B9DE15206B95844B859 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ai\OpenAIIntegration.js --- */
/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: OpenAI integration for intelligent conversation generation.
    * Got it, love.
     */
     export class OpenAIIntegration {
         constructor() {
                 this.apiKey = null; // Will be set during initialization
                         this.baseUrl = 'https://api.openai.com/v1';
                                 this.initialized = false;
                                         this.model = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                                                 this.defaultConfig = {
                                                             temperature: 0.8,
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
                                                                                                                                                                                                                             
