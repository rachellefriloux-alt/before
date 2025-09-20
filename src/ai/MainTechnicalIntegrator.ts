/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main technical integration system for event handling and coordination.
 */

// Define types for better type safety
export interface MessageEvent {
    input: string;
    context?: any;
}

export interface ResponseEvent extends MessageEvent {
    response: string;
}

type EventData = MessageEvent | ResponseEvent | any;

export class MainTechnicalIntegrator {
    private eventListeners: Map<string, Function[]> = new Map();
    private aiResponseGenerator: AIResponseGenerator;

    constructor(aiResponseGenerator?: AIResponseGenerator) {
        this.aiResponseGenerator = aiResponseGenerator || new DefaultAIResponseGenerator();
    }

    /**
     * Add an event listener for a specific event type
     * @param eventType - The event type to listen for
     * @param listener - The callback function to execute when the event occurs
     */
    addEventListener(eventType: string, listener: Function): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(listener);
    }

    /**
     * Remove an event listener for a specific event type
     * @param eventType - The event type
     * @param listener - The callback function to remove
     */
    removeEventListener(eventType: string, listener: Function): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event to all registered listeners
     * @param eventType - The event type to emit
     * @param data - Optional data to pass to listeners
     */
    emitEvent<T extends EventData>(eventType: string, data?: T): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Get all registered event types
     */
    getRegisteredEvents(): string[] {
        return Array.from(this.eventListeners.keys());
    }

    /**
     * Clear all event listeners
     */
    clearAllListeners(): void {
        this.eventListeners.clear();
    }

    /**
     * Handle user message and generate response
     * @param input - The user's input message
     * @param context - Additional context for processing
     * @returns Promise resolving to the response string
     */
    async handleUserMessage(input: string, context?: any): Promise<string> {
        if (!input || typeof input !== 'string') {
            throw new Error('Input must be a non-empty string');
        }

        // Emit event for message processing
        this.emitEvent<MessageEvent>('sallie:process_message', { input, context });

        try {
            // Generate response using AI integration
            const response = await this.aiResponseGenerator.generateResponse(input, context);

            // Emit event for response generation
            this.emitEvent<ResponseEvent>('sallie:generate_response', { input, response, context });

            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            this.emitEvent('sallie:error', { error, input, context });
            return "I'm sorry, I encountered an error processing your request.";
        }
    }
}

/**
 * Interface for AI response generation
 */
export interface AIResponseGenerator {
    generateResponse(input: string, context?: any): Promise<string>;
}

/**
 * Default implementation of the AI response generator
 */
class DefaultAIResponseGenerator implements AIResponseGenerator {
    async generateResponse(input: string, context?: any): Promise<string> {
        // This is a placeholder implementation
        // In a real implementation, this would integrate with AI models
        const responses = [
            "I understand what you're saying. Let me think about that.",
            "That's an interesting point. How can I help you with that?",
            "I appreciate you sharing that with me. What would you like to explore further?",
            "Thank you for your input. Let me process that for you.",
        ];

        // Simple response selection based on input length
        const responseIndex = Math.min(input.length % responses.length, responses.length - 1);
        return responses[responseIndex];
    }
}