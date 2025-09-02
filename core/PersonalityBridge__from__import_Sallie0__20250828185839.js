/*
 * Persona: Tough love meets soul care.
 * Module: PersonalityBridge
 * Intent: Handle functionality for PersonalityBridge
 * Provenance-ID: 67c0dd5c-6ed1-4447-b175-a04898a41011
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */


class PersonalityBridge {
    constructor(engine) {
        this.engine = engine;
    }

    processExternalInput(input) {
        // Transform and route input to persona engine
        const transformed = this.transformInput(input);
        return this.engine.updatePersona(transformed);
    }

    transformInput(input) {
        // Example transformation logic
        if (typeof input === 'string') {
            return { message: input };
        }
        return input;
    }

    getCurrentPersona() {
        return this.engine.getPersonaState();
    }
}

export default PersonalityBridge;
