
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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\core\PersonalityBridge.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\core\PersonalityBridge.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\core\PersonalityBridge.js) --- */
/* Merged master for logical file: core\PersonalityBridge
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\PersonalityBridge.js (hash:C0FAA1E394D7C6D2BC5FC0979B8F3310E7B3A18E138FC1207BCD194AA83A5B20)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\core\PersonalityBridge.js (hash:24748C7616D764504334F9EA74925F4E1E0DA70B41140AAD9F26C43C0F4D254A)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\core\PersonalityBridge.js | ext: .js | sha: C0FAA1E394D7C6D2BC5FC0979B8F3310E7B3A18E138FC1207BCD194AA83A5B20 ---- */
[BINARY FILE - original copied to merged_sources: core\PersonalityBridge.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\core\PersonalityBridge.js | ext: .js | sha: 24748C7616D764504334F9EA74925F4E1E0DA70B41140AAD9F26C43C0F4D254A ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\core\PersonalityBridge.js --- */
class PersonalityBridge {
    constructor(engine) {
        this.engine = engine;
    }
    processExternalInput(input) {
        // Transform and route input to persona engine
        const transformed = this.transformInput(input);
        return this.engine.updatePersona(transformed);
    transformInput(input) {
        // Example transformation logic
        if (typeof input === 'string') {
            return { message: input };
        }
        return input;
    getCurrentPersona() {
        return this.engine.getPersonaState();
}
module.exports = PersonalityBridge;
