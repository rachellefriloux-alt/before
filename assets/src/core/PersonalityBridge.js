
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

module.exports = PersonalityBridge;
