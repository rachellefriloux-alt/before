/*
Salle Persona Module: PersonalizationModule
Learns and personalizes responses based on ongoing user interaction, builds memory, and evolves helpfulness.
Follows Salle architecture, modularity, and privacy rules.
*/


// Salle Persona Module: PersonalizationModule
// Learns and personalizes responses based on ongoing user interaction, builds memory, and evolves helpfulness.
// Follows Salle architecture, modularity, and privacy rules.

type UserProfile = {
  userId: string;
  preferences: Record<string, any>;
  interactionHistory: string[];
};

export class PersonalizationModule {
  private profiles: Record<string, UserProfile> = {};

  // Update user profile and history
  updateProfile(userId: string, preference: string, value: any) {
    if (!this.profiles[userId]) {
      this.profiles[userId] = { userId, preferences: {}, interactionHistory: [] };
    }
    this.profiles[userId].preferences[preference] = value;
  }

  logInteraction(userId: string, interaction: string) {
    if (!this.profiles[userId]) {
      this.profiles[userId] = { userId, preferences: {}, interactionHistory: [] };
    }
    this.profiles[userId].interactionHistory.push(interaction);
  }

  // Personalize response based on profile and history
  personalizeResponse(userId: string, input: string): string {
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

  // Evolve helpfulness based on interaction history
  evolveHelpfulness(userId: string): string {
    const profile = this.profiles[userId];
    if (!profile) return "I'm here to help however I can.";
    const count = profile.interactionHistory.length;
    if (count > 20) return "I've learned a lot from our conversations!";
    if (count > 5) return "I'm getting to know your preferences better.";
    return "Let's keep working together!";
  }
}
