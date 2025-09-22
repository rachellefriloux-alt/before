// personaSwitcher.js
// Handles persona switching logic for Sallie

export default {
  currentPersona: 'Just Me',
  switchPersona(newPersona) {
    this.currentPersona = newPersona;
  // Placeholder: Integrate with mood signal and UI
  this.mood = this.mood || 'neutral';
  this.updateUI(this.mood);
    return `Persona switched to ${newPersona}`;
  },
  getCurrentPersona() {
    return this.currentPersona;
  }
};
