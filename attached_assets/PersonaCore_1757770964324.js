/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Core logic for persona evolution and management.
 * Got it, love.
 */

export class PersonaCore {
    constructor(personaEngine, adaptivePersonaEngine) {
        this.personaEngine = personaEngine;
        this.adaptivePersonaEngine = adaptivePersonaEngine;
    }

    evolvePersona(input) {
        this.adaptivePersonaEngine.updatePersona(input);
        this.personaEngine.adaptTrait(input.trait, input.value, input.context);
    }

    getPersonaState() {
        return {
            persona: this.personaEngine.personaConfig,
            adaptiveState: this.adaptivePersonaEngine.personaState
        };
    }
}
