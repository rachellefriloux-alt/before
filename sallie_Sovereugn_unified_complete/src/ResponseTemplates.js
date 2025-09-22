/*
 * Persona: Tough love meets soul care.
 * Module: ResponseTemplates
 * Intent: Handle functionality for ResponseTemplates
 * Provenance-ID: 3f81a6fe-53dd-49a2-b303-f18afcb5222e
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Dynamic response templates for communication.
 * Got it, love.
 */

export class ResponseTemplates {
    constructor() {
        this.templates = {
            greeting: 'Hey there! Ready to get real?',
            encouragement: 'You got this. I believe in you.',
            toughLove: 'Let’s face it, you can do better. I know you can.',
            celebration: 'Amazing work! Celebrate your wins.',
            reflection: 'Let’s reflect on what happened and grow.'
        };
    }

    getTemplate(type) {
        return this.templates[type] || 'Let’s keep moving forward.';
    }

    addTemplate(type, text) {
        this.templates[type] = text;
    }
}
