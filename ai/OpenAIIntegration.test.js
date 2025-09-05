/*
 * Sallie 1.0 Module Tests
 * Testing OpenAI integration functionality
 */

const { describe, it, expect, beforeEach, jest } = require('@jest/globals');
const { OpenAIIntegration } = require('./OpenAIIntegration');

describe('OpenAIIntegration', () => {
    let openai;

    beforeEach(() => {
        openai = new OpenAIIntegration();
        // Mock fetch globally
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with correct default values', () => {
            expect(openai.apiKey).toBeNull();
            expect(openai.baseUrl).toBe('https://api.openai.com/v1');
            expect(openai.initialized).toBe(false);
            expect(openai.model).toBe('gpt-4o');
            expect(openai.defaultConfig).toEqual({
                max_tokens: 500,
                temperature: 0.7,
                top_p: 0.9,
                frequency_penalty: 0.3,
                presence_penalty: 0.3
            });
        });
    });

    describe('getApiKey', () => {
        it('should return API key from environment in server environment', async () => {
            // Mock server environment
            delete global.window;
            process.env.OPENAI_API_KEY = 'test-api-key';

            const apiKey = await openai.getApiKey();
            expect(apiKey).toBe('test-api-key');
        });

        it('should return null when API key not found in server environment', async () => {
            delete global.window;
            delete process.env.OPENAI_API_KEY;

            const apiKey = await openai.getApiKey();
            expect(apiKey).toBeNull();
        });

        it('should fetch API key from server in client environment', async () => {
            global.window = {};
            const mockResponse = { apiKey: 'client-api-key' };
            global.fetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockResponse)
            });

            const apiKey = await openai.getApiKey();
            expect(apiKey).toBe('client-api-key');
            expect(global.fetch).toHaveBeenCalledWith('/api/openai-key');
        });

        it('should return null when fetch fails in client environment', async () => {
            global.window = {};
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const apiKey = await openai.getApiKey();
            expect(apiKey).toBeNull();
        });
    });

    describe('initialize', () => {
        it('should initialize with API key and set initialized flag', async () => {
            delete global.window;
            process.env.OPENAI_API_KEY = 'test-api-key';

            await openai.initialize();

            expect(openai.apiKey).toBe('test-api-key');
            expect(openai.initialized).toBe(true);
        });
    });

    describe('generateResponse', () => {
        beforeEach(async () => {
            openai.apiKey = 'test-api-key';
        });

        it('should throw error when API key is not available', async () => {
            openai.apiKey = null;

            await expect(openai.generateResponse('test message')).rejects.toThrow('OpenAI API key not available');
        });

        it('should generate response successfully', async () => {
            const mockApiResponse = {
                choices: [{
                    message: {
                        content: 'Test response from OpenAI'
                    }
                }]
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue(mockApiResponse)
            });

            const response = await openai.generateResponse('Hello Sallie');

            expect(response).toBe('Test response from OpenAI');
            expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-api-key'
                },
                body: expect.any(String)
            });
        });

        it('should handle API errors gracefully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400
            });

            const response = await openai.generateResponse('Hello Sallie');

            expect(response).toBe('I\'m having trouble connecting right now, but I\'m here with you. Let\'s try again in a moment.');
        });

        it('should handle network errors gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const response = await openai.generateResponse('Hello Sallie');

            expect(response).toBe('I\'m having trouble connecting right now, but I\'m here with you. Let\'s try again in a moment.');
        });
    });
});
