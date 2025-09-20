// personaSwitcher.js
// Handles persona switching logic for Sallie

export default {
  currentPersona: 'Just Me',
  currentMood: 'neutral',
  moodHistory: [],

  switchPersona(newPersona) {
    const previousPersona = this.currentPersona;
    this.currentPersona = newPersona;

    // Update mood based on persona switch
    this.updateMoodForPersona(newPersona);

    // Record the switch in history
    this.moodHistory.push({
      timestamp: Date.now(),
      action: 'persona_switch',
      from: previousPersona,
      to: newPersona,
      mood: this.currentMood
    });

    // Update UI with new persona and mood
    this.updateUI();

    return `Persona switched to ${newPersona} with ${this.currentMood} mood`;
  },

  updateMoodForPersona(persona) {
    // Different personas have different baseline moods
    const personaMoods = {
      'Just Me': 'neutral',
      'Tough Love': 'challenging',
      'Soul Care': 'supportive',
      'Growth Mindset': 'motivational',
      'Mindful': 'calm'
    };

    this.currentMood = personaMoods[persona] || 'neutral';
  },

  updateUI() {
    // Update UI elements based on current persona and mood
    if (typeof window !== 'undefined') {
      // Update persona indicator
      const personaIndicator = document.getElementById('persona-indicator');
      if (personaIndicator) {
        personaIndicator.textContent = this.currentPersona;
        personaIndicator.className = `persona-${this.currentMood}`;
      }

      // Update mood indicator
      const moodIndicator = document.getElementById('mood-indicator');
      if (moodIndicator) {
        moodIndicator.textContent = this.currentMood;
        moodIndicator.className = `mood-${this.currentMood}`;
      }

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('personaChanged', {
        detail: {
          persona: this.currentPersona,
          mood: this.currentMood
        }
      }));
    }
  },

  getCurrentPersona() {
    return this.currentPersona;
  },

  getCurrentMood() {
    return this.currentMood;
  },

  getMoodHistory() {
    return this.moodHistory.slice(-10); // Return last 10 entries
  }
};
