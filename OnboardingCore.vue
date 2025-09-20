/*
 * Persona: Tough love meets soul care.
 * Module: OnboardingCore
 * Intent: Handle functionality for OnboardingCore
 * Provenance-ID: d304757e-9ba3-4cf5-b13c-2a677ba30a14
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="onboarding-core" :class="theme">
    <div class="onboarding-container">
      <h2>Welcome to Sallie</h2>
      <p class="subtitle">Let's set up your personalized experience</p>

      <form @submit.prevent="completeOnboarding" class="onboarding-form">
        <div class="form-group">
          <label for="userName">Your Name</label>
          <input
            id="userName"
            v-model="profile.name"
            type="text"
            required
            placeholder="Enter your name"
          />
        </div>

        <div class="form-group">
          <label for="userPersona">Choose Your Persona</label>
          <select id="userPersona" v-model="profile.persona" required>
            <option value="">Select a persona</option>
            <option value="creative">Creative</option>
            <option value="analytical">Analytical</option>
            <option value="social">Social</option>
            <option value="adventurous">Adventurous</option>
            <option value="calm">Calm</option>
            <option value="energetic">Energetic</option>
          </select>
        </div>

        <div class="form-group">
          <label for="userTheme">Preferred Theme</label>
          <select id="userTheme" v-model="profile.theme" required>
            <option value="">Select a theme</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="profile.consent"
              required
            />
            I agree to the terms and conditions
          </label>
        </div>

        <button type="submit" class="onboarding-submit-btn">
          Get Started
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnboardingCore',
  props: {
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      profile: {
        name: '',
        persona: '',
        theme: '',
        consent: false,
        tasks: []
      }
    };
  },
  methods: {
    completeOnboarding() {
      if (!this.profile.name || !this.profile.persona || !this.profile.theme || !this.profile.consent) {
        return;
      }

      // Emit the onboarded event with the profile data
      this.$emit('onboarded', { ...this.profile });
    }
  }
};
</script>

<style scoped>
.onboarding-core {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.onboarding-container {
  background: var(--bg-color, white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

.onboarding-core h2 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-color, #333);
}

.subtitle {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color, #333);
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--input-bg, white);
  color: var(--input-text, #333);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.onboarding-submit-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #007bff);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.onboarding-submit-btn:hover {
  background: var(--primary-hover, #0056b3);
}

.onboarding-submit-btn:disabled {
  background: var(--disabled-color, #ccc);
  cursor: not-allowed;
}

/* Dark theme support */
.onboarding-core.dark {
  --bg-color: #2a2a2a;
  --text-color: #e0e0e0;
  --text-secondary: #b0b0b0;
  --border-color: #444;
  --input-bg: #333;
  --input-text: #e0e0e0;
  --primary-color: #4a9eff;
  --primary-hover: #3a8eff;
  --disabled-color: #555;
}
</style>
