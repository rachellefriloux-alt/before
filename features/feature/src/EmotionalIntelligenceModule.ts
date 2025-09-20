/*
Sallie Persona Module: EmotionalIntelligenceModule
Detects user mood, interprets humor/sarcasm, expresses empathy, and adapts communication style.
Follows Sallie architecture, modularity, and privacy rules.
*/


// Sallie Persona Module: EmotionalIntelligenceModule
// Detects user mood, interprets humor/sarcasm, expresses empathy, and adapts communication style.
// Follows Sallie architecture, modularity, and privacy rules.

export class EmotionalIntelligenceModule {
  // Basic sentiment analysis using keyword matching
  detectMood(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes("happy") || lower.includes(":)")) return "happy";
    if (lower.includes("sad") || lower.includes(":(")) return "sad";
    if (lower.includes("angry") || lower.includes("mad")) return "angry";
    if (lower.includes("lol") || lower.includes("haha")) return "amused";
    return "neutral";
  }

  // Empathetic response generator
  respondWithEmpathy(context: string): string {
    const mood = this.detectMood(context);
    switch (mood) {
      case "happy": return "That's wonderful to hear! 😊";
      case "sad": return "I'm here for you. If you want to talk, I'm listening.";
      case "angry": return "I understand your frustration. Let's work through it together.";
      default: return "I'm here for you.";
    }
  }

  // Humor and sarcasm interpretation
  interpretHumor(input: string): string {
    if (input.toLowerCase().includes("just kidding") || input.toLowerCase().includes("jk")) {
      return "Haha, I caught the joke!";
    }
    if (input.toLowerCase().includes("sarcasm")) {
      return "Was that sarcasm? I think so!";
    }
    if (input.toLowerCase().includes("lol") || input.toLowerCase().includes("haha")) {
      return "Glad you found that funny!";
    }
    return "I appreciate your sense of humor.";
  }

  // Comfort and encouragement routines
  provideComfort(): string {
    return "Remember, you're doing your best. I'm here to support you.";
  }

  encourageUser(): string {
    return "Keep going! You're making great progress.";
  }

  // Dynamic communication style adaptation
  adaptCommunicationStyle(mood: string): string {
    switch (mood) {
      case "happy": return "Let's keep the positive energy going!";
      case "sad": return "I'll use a gentle and supportive tone.";
      case "angry": return "I'll stay calm and help you resolve things.";
      case "amused": return "Let's keep things light and fun!";
      default: return "I'll match your mood and be as helpful as possible.";
    }
  }
}
