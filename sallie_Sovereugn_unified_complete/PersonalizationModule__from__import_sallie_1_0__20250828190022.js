/*
 * Persona: Tough love meets soul care.
 * Module: PersonalizationModule
 * Intent: Handle functionality for PersonalizationModule
 * Provenance-ID: f27f030d-ab2b-4554-baa1-e6b6bb8f2186
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
Salle Persona Module: PersonalizationModule
Learns and personalizes responses based on ongoing user interaction, builds memory, and evolves helpfulness.
Follows Salle architecture, modularity, and privacy rules.
*/

class PersonalizationModule {
    constructor() {
        this.profiles = {};
    }

    updateProfile(userId, preference, value) {
        if (!this.profiles[userId]) {
            this.profiles[userId] = { userId, preferences: {}, interactionHistory: [] };
        }
        this.profiles[userId].preferences[preference] = value;
    }

    logInteraction(userId, interaction) {
        if (!this.profiles[userId]) {
            this.profiles[userId] = { userId, preferences: {}, interactionHistory: [] };
        }
        this.profiles[userId].interactionHistory.push(interaction);
    }

    personalizeResponse(userId, input) {
        const profile = this.profiles[userId];
        if (!profile) return "Hello! How can I help you today?";
        if (profile.preferences['tone'] === 'friendly') {
            return `Hey ${userId}, great to see you! ${input}`;
        }
        if (profile.preferences['tone'] === 'formal') {
            return `Greetings ${userId}. ${input}`;
        }
        return `Hi ${userId}, ${input}`;
    }

    evolveHelpfulness(userId) {
        const profile = this.profiles[userId];
        if (!profile) return "I'm here to help however I can.";
        const count = profile.interactionHistory.length;
        if (count > 20) return "I've learned a lot from our conversations!";
        if (count > 5) return "I'm getting to know your preferences better.";
        return "Let's keep working together!";
    }
}

export default PersonalizationModule;
