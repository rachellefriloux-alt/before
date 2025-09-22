/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User onboarding and initial persona setup.
 * Got it, love.
 */

export class OnboardingFlow {
    constructor(identityManager, personaEngine) {
        this.identityManager = identityManager;
        this.personaEngine = personaEngine;
        this.onboardedUsers = new Set();
    }

    startOnboarding(userId) {
        if (this.onboardedUsers.has(userId)) throw new Error('User already onboarded');
        this.identityManager.authenticate(userId);
        this.personaEngine.initialize();
        this.onboardedUsers.add(userId);
        return 'Onboarding complete for ' + userId;
    }
}
