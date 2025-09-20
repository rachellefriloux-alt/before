
// Sallie Persona Module
// EmotionalIntelligenceModule.js

class EmotionalIntelligenceModule {
    constructor() {
        this.moodStates = ['happy', 'sad', 'angry', 'calm', 'anxious', 'excited', 'neutral'];
        this.empathyLevel = 0.8;
        this.recentInputs = [];
    }

    detectMood(input) {
        const lower = input.toLowerCase();
        if (lower.includes('sad') || lower.includes('depressed')) return 'sad';
        if (lower.includes('angry') || lower.includes('mad')) return 'angry';
        if (lower.includes('happy') || lower.includes('joy')) return 'happy';
        if (lower.includes('anxious') || lower.includes('nervous')) return 'anxious';
        if (lower.includes('excited') || lower.includes('thrilled')) return 'excited';
        if (lower.includes('calm') || lower.includes('relaxed')) return 'calm';
        return 'neutral';
    }

    respondWithEmpathy(input) {
        const mood = this.detectMood(input);
        switch (mood) {
            case 'sad':
                return "I'm here for you. It's okay to feel sad sometimes. Want to talk about it?";
            case 'angry':
                return "I understand you're upset. Let's take a deep breath and work through it together.";
            case 'anxious':
                return "Anxiety can be tough. I'm here to help you find some calm. Would you like some grounding tips?";
            case 'happy':
                return "That's wonderful! I'm glad you're feeling happy. Want to share what's making you smile?";
            case 'excited':
                return "Excitement is contagious! Tell me more about what's got you energized.";
            case 'calm':
                return "Peaceful moments are precious. Enjoy the calm!";
            default:
                return "I'm here to listen and support you, whatever you're feeling.";
        }
    }

    interpretHumor(input) {
        if (input.toLowerCase().includes('joke')) {
            return "Why did Sallie cross the road? To help you get to the other side of your goals!";
        }
        return "I love a good laugh! Want to hear a joke?";
    }

    analyzeEmotionalContent(input) {
        // Returns a score for emotional intensity
        let score = 0;
        const keywords = ['sad', 'angry', 'happy', 'anxious', 'excited', 'calm'];
        keywords.forEach(k => {
            if (input.toLowerCase().includes(k)) score += 0.2;
        });
        return Math.min(1, score);
    }

    updateEmpathyLevel(feedback) {
        if (feedback === 'positive') this.empathyLevel = Math.min(1, this.empathyLevel + 0.05);
        else if (feedback === 'negative') this.empathyLevel = Math.max(0, this.empathyLevel - 0.05);
    }
}

module.exports = EmotionalIntelligenceModule;
