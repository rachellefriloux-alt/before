/*
 * Persona: Tough love meets soul care.
 * Module: PersonaDrivenUI
 * Intent: Handle functionality for PersonaDrivenUI
 * Provenance-ID: 36c0961f-18cc-49b1-8ae0-96ad613b2bbe
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<!--
  Sallie 1.0 Module - Persona-Driven UI System
  Persona: Tough love meets soul care.
  Function: UI components that dynamically adapt to user emotional state and context.
  Got it, love.
-->
<template>
  <div class="persona-driven-ui" :class="[theme, emotionalState]">
    <!-- Dynamic Header with Emotional Context -->
    <header class="adaptive-header" :style="headerStyle">
      <div class="user-context-indicator">
        <div class="emotional-avatar" :class="emotionalState">
          <img :src="getEmotionalAvatar()" :alt="`Sallie feeling ${emotionalState}`" />
          <div class="emotional-indicator" :class="emotionalState"></div>
        </div>
        <div class="context-info">
          <h1 class="persona-greeting">{{ getPersonalizedGreeting() }}</h1>
          <p class="emotional-insight">{{ getEmotionalInsight() }}</p>
        </div>
      </div>

      <div class="adaptive-controls">
        <button
          v-for="control in adaptiveControls"
          :key="control.id"
          @click="executeControl(control)"
          :class="['control-btn', control.type, { active: control.active }]"
        >
          {{ control.label }}
        </button>
      </div>
    </header>

    <!-- Emotional State Visualization -->
    <section class="emotional-dashboard" v-if="showEmotionalDashboard">
      <div class="emotion-meter">
        <h3>Your Current Emotional Landscape</h3>
        <div class="emotion-visualization">
          <div
            v-for="emotion in currentEmotions"
            :key="emotion.name"
            class="emotion-bar"
            :style="{ height: emotion.intensity * 100 + '%', backgroundColor: emotion.color }"
          >
            <span class="emotion-label">{{ emotion.name }}</span>
            <span class="emotion-value">{{ Math.round(emotion.intensity * 100) }}%</span>
          </div>
        </div>
      </div>

      <div class="emotional-guidance" v-if="emotionalGuidance">
        <div class="guidance-card" :class="emotionalGuidance.urgency">
          <h4>{{ emotionalGuidance.title }}</h4>
          <p>{{ emotionalGuidance.message }}</p>
          <button @click="applyGuidance(emotionalGuidance)" class="guidance-action">
            {{ emotionalGuidance.actionLabel }}
          </button>
        </div>
      </div>
    </section>

    <!-- Proactive Suggestions Panel -->
    <section class="proactive-suggestions" v-if="proactiveSuggestions.length > 0">
      <h3>I'm thinking of you...</h3>
      <div class="suggestions-grid">
        <div
          v-for="suggestion in proactiveSuggestions"
          :key="suggestion.id"
          class="suggestion-card"
          :class="suggestion.priority"
          @click="activateSuggestion(suggestion)"
        >
          <div class="suggestion-icon" :class="suggestion.type">
            {{ getSuggestionIcon(suggestion.type) }}
          </div>
          <div class="suggestion-content">
            <h4>{{ suggestion.title }}</h4>
            <p>{{ suggestion.message }}</p>
            <span class="suggestion-action">{{ suggestion.actionLabel }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Adaptive Content Areas -->
    <main class="adaptive-content">
      <slot name="content"></slot>
    </main>

    <!-- Emotional Support Panel -->
    <aside class="emotional-support-panel" v-if="showSupportPanel">
      <div class="support-header">
        <h3>I'm Here For You</h3>
        <button @click="toggleSupportPanel" class="close-support">×</button>
      </div>

      <div class="support-options">
        <button @click="requestEmotionalSupport('talk')" class="support-option">
          <span class="support-icon">💬</span>
          <span>Just Talk</span>
        </button>
        <button @click="requestEmotionalSupport('breathe')" class="support-option">
          <span class="support-icon">🫁</span>
          <span>Breathe Together</span>
        </button>
        <button @click="requestEmotionalSupport('reflect')" class="support-option">
          <span class="support-icon">🤔</span>
          <span>Reflect & Process</span>
        </button>
        <button @click="requestEmotionalSupport('motivate')" class="support-option">
          <span class="support-icon">💪</span>
          <span>Get Motivated</span>
        </button>
      </div>

      <div class="quick-support-phrases">
        <p v-for="phrase in supportPhrases" :key="phrase.id" @click="useSupportPhrase(phrase)">
          "{{ phrase.text }}"
        </p>
      </div>
    </aside>

    <!-- Floating Emotional Companion -->
    <div class="floating-companion" v-if="showFloatingCompanion" :class="companionState">
      <div class="companion-avatar" @click="interactWithCompanion">
        <img :src="getCompanionAvatar()" :alt="companionMessage" />
        <div class="companion-indicator" :class="companionState"></div>
      </div>

      <div class="companion-message" v-if="companionMessage">
        {{ companionMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonaDrivenUI',
  props: {
    theme: {
      type: String,
      default: 'light'
    },
    userEmotionalState: {
      type: String,
      default: 'neutral'
    },
    userContext: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      emotionalState: 'neutral',
      currentEmotions: [],
      emotionalGuidance: null,
      proactiveSuggestions: [],
      adaptiveControls: [],
      showEmotionalDashboard: false,
      showSupportPanel: false,
      showFloatingCompanion: true,
      companionState: 'available',
      companionMessage: null,
      supportPhrases: [
        { id: 1, text: "I'm feeling overwhelmed right now" },
        { id: 2, text: "I need a moment to breathe" },
        { id: 3, text: "Can you help me see this differently?" },
        { id: 4, text: "I need your tough love right now" },
        { id: 5, text: "I'm proud of myself for trying" }
      ]
    };
  },
  computed: {
    headerStyle() {
      const emotionalColors = {
        happy: 'linear-gradient(135deg, #FFD700, #FFA500)',
        sad: 'linear-gradient(135deg, #4169E1, #1E90FF)',
        stressed: 'linear-gradient(135deg, #DC143C, #FF6347)',
        calm: 'linear-gradient(135deg, #98FB98, #90EE90)',
        neutral: 'linear-gradient(135deg, #F0F8FF, #E6E6FA)'
      };

      return {
        background: emotionalColors[this.emotionalState] || emotionalColors.neutral
      };
    }
  },
  watch: {
    userEmotionalState: {
      handler(newState) {
        this.emotionalState = newState;
        this.adaptUIToEmotion(newState);
      },
      immediate: true
    },
    userContext: {
      handler(newContext) {
        this.adaptUIToContext(newContext);
      },
      deep: true
    }
  },
  mounted() {
    this.initializeAdaptiveUI();
  },
  methods: {
    initializeAdaptiveUI() {
      this.loadEmotionalState();
      this.generateProactiveSuggestions();
      this.setupAdaptiveControls();
      this.startEmotionalMonitoring();
    },

    adaptUIToEmotion(emotion) {
      this.emotionalState = emotion;
      this.updateEmotionalDashboard(emotion);
      this.generateEmotionalGuidance(emotion);
      this.updateCompanionState(emotion);
    },

    adaptUIToContext(context) {
      if (context.timeOfDay) {
        this.adaptToTimeOfDay(context.timeOfDay);
      }
      if (context.recentActivities) {
        this.adaptToRecentActivity(context.recentActivities);
      }
      if (context.stressLevel) {
        this.adaptToStressLevel(context.stressLevel);
      }
    },

    getPersonalizedGreeting() {
      const timeOfDay = new Date().getHours();
      const emotionalState = this.emotionalState;

      let greeting = "Hello, love";

      if (timeOfDay < 12) greeting = "Good morning, beautiful";
      else if (timeOfDay < 18) greeting = "Good afternoon, darling";
      else greeting = "Good evening, sweetheart";

      if (emotionalState === 'stressed') {
        greeting += " - I can feel you're carrying a lot";
      } else if (emotionalState === 'happy') {
        greeting += " - I'm so glad to see that light in you";
      } else if (emotionalState === 'sad') {
        greeting += " - I'm here whenever you're ready to talk";
      }

      return greeting;
    },

    getEmotionalInsight() {
      const insights = {
        happy: "Your energy is contagious - keep shining that light!",
        sad: "It's okay to feel this way. Your feelings are valid, and I'm here.",
        stressed: "I see the weight you're carrying. Let's take this one step at a time.",
        calm: "You seem centered today. That's a beautiful place to be.",
        neutral: "I'm here with you, whatever you're feeling right now."
      };

      return insights[this.emotionalState] || insights.neutral;
    },

    getEmotionalAvatar() {
      const avatars = {
        happy: '/avatars/sallie-happy.png',
        sad: '/avatars/sallie-caring.png',
        stressed: '/avatars/sallie-supportive.png',
        calm: '/avatars/sallie-peaceful.png',
        neutral: '/avatars/sallie-present.png'
      };

      return avatars[this.emotionalState] || avatars.neutral;
    },

    updateEmotionalDashboard(emotion) {
      this.currentEmotions = [
        { name: 'Joy', intensity: emotion === 'happy' ? 0.8 : 0.2, color: '#FFD700' },
        { name: 'Peace', intensity: emotion === 'calm' ? 0.9 : 0.3, color: '#98FB98' },
        { name: 'Stress', intensity: emotion === 'stressed' ? 0.7 : 0.1, color: '#FF6347' },
        { name: 'Sadness', intensity: emotion === 'sad' ? 0.6 : 0.1, color: '#4169E1' },
        { name: 'Energy', intensity: ['happy', 'stressed'].includes(emotion) ? 0.8 : 0.4, color: '#FFA500' }
      ];
    },

    generateEmotionalGuidance(emotion) {
      const guidance = {
        stressed: {
          title: "Let's Take a Breath Together",
          message: "I can feel the tension you're holding. Would you like me to guide you through a quick breathing exercise?",
          actionLabel: "Start Breathing",
          urgency: 'high'
        },
        sad: {
          title: "Your Feelings Are Heard",
          message: "It's completely okay to feel this way. I'm here to listen without judgment.",
          actionLabel: "I'm Here to Listen",
          urgency: 'medium'
        },
        happy: {
          title: "Let's Celebrate This Moment",
          message: "I'm so proud of you for feeling this joy. Let's savor it together!",
          actionLabel: "Celebrate Together",
          urgency: 'low'
        }
      };

      this.emotionalGuidance = guidance[emotion];
    },

    generateProactiveSuggestions() {
      const timeOfDay = new Date().getHours();
      const suggestions = [];

      if (timeOfDay < 12) {
        suggestions.push({
          id: 1,
          type: 'morning',
          title: 'Morning Intention',
          message: 'Every morning is a fresh start. What would you like to focus on today?',
          actionLabel: 'Set Intention',
          priority: 'medium'
        });
      }

      if (this.emotionalState === 'stressed') {
        suggestions.push({
          id: 2,
          type: 'stress_relief',
          title: 'Stress Relief Available',
          message: 'I notice you might be feeling overwhelmed. I have some techniques that might help.',
          actionLabel: 'Try Stress Relief',
          priority: 'high'
        });
      }

      this.proactiveSuggestions = suggestions;
    },

    setupAdaptiveControls() {
      this.adaptiveControls = [
        {
          id: 'mood_check',
          label: 'How are you?',
          type: 'emotional',
          active: false
        },
        {
          id: 'quick_help',
          label: 'Need help?',
          type: 'support',
          active: false
        },
        {
          id: 'celebrate',
          label: 'Celebrate wins',
          type: 'positive',
          active: this.emotionalState === 'happy'
        }
      ];
    },

    getSuggestionIcon(type) {
      const icons = {
        morning: '🌅',
        stress_relief: '🧘',
        motivation: '💪',
        reflection: '🤔',
        celebration: '🎉'
      };
      return icons[type] || '💭';
    },

    getCompanionAvatar() {
      return this.getEmotionalAvatar(); // Reuse emotional avatar logic
    },

    // Event handlers
    executeControl(control) {
      this.$emit('controlActivated', control);
    },

    activateSuggestion(suggestion) {
      this.$emit('suggestionActivated', suggestion);
    },

    applyGuidance(guidance) {
      this.$emit('guidanceApplied', guidance);
    },

    requestEmotionalSupport(type) {
      this.$emit('emotionalSupportRequested', type);
    },

    useSupportPhrase(phrase) {
      this.$emit('supportPhraseUsed', phrase);
    },

    interactWithCompanion() {
      this.companionMessage = this.getCompanionInteractionMessage();
      setTimeout(() => {
        this.companionMessage = null;
      }, 5000);
    },

    toggleSupportPanel() {
      this.showSupportPanel = !this.showSupportPanel;
    },

    // Adaptation methods
    adaptToTimeOfDay(timeOfDay) {
      if (timeOfDay === 'morning') {
        this.showEmotionalDashboard = true;
      } else if (timeOfDay === 'evening') {
        this.showSupportPanel = true;
      }
    },

    adaptToRecentActivity(activities) {
      if (activities.some(activity => activity.type === 'stressful')) {
        this.generateEmotionalGuidance('stressed');
      }
    },

    adaptToStressLevel(stressLevel) {
      if (stressLevel > 0.7) {
        this.companionState = 'concerned';
        this.showSupportPanel = true;
      }
    },

    updateCompanionState(emotion) {
      const states = {
        happy: 'celebrating',
        sad: 'caring',
        stressed: 'supportive',
        calm: 'peaceful',
        neutral: 'present'
      };
      this.companionState = states[emotion] || 'available';
    },

    getCompanionInteractionMessage() {
      const messages = {
        celebrating: "I'm so happy for you! 🎉",
        caring: "I'm here whenever you need me 💙",
        supportive: "You've got this - I'm right here with you 💪",
        peaceful: "Peace looks beautiful on you 🕊️",
        present: "I'm here with you, love 💕"
      };
      return messages[this.companionState] || "I'm here for you 💝";
    },

    startEmotionalMonitoring() {
      // Simulate emotional monitoring
      setInterval(() => {
        this.monitorEmotionalChanges();
      }, 30000); // Check every 30 seconds
    },

    monitorEmotionalChanges() {
      // This would integrate with emotional intelligence system
      // For now, simulate occasional emotional insights
      if (Math.random() > 0.95) { // 5% chance every 30 seconds
        this.generateEmotionalGuidance(this.emotionalState);
      }
    },

    loadEmotionalState() {
      // Load from localStorage or user preferences
      try {
        const saved = localStorage.getItem('sallie_ui_emotional_state');
        if (saved) {
          const state = JSON.parse(saved);
          this.emotionalState = state.emotionalState;
          this.showEmotionalDashboard = state.showDashboard;
        }
      } catch (error) {
        console.warn('Could not load emotional state:', error);
      }
    }
  }
};
</script>

<style scoped>
.persona-driven-ui {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.adaptive-header {
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.user-context-indicator {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.emotional-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.emotional-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.emotional-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
}

.emotional-indicator.happy { background: #FFD700; }
.emotional-indicator.sad { background: #4169E1; }
.emotional-indicator.stressed { background: #DC143C; }
.emotional-indicator.calm { background: #98FB98; }
.emotional-indicator.neutral { background: #F0F8FF; }

.context-info h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  font-weight: 300;
}

.emotional-insight {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.adaptive-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.emotional-dashboard {
  padding: 2rem;
  background: var(--bg-color, #f8f9fa);
}

.emotion-visualization {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 200px;
  margin-top: 1rem;
}

.emotion-bar {
  flex: 1;
  position: relative;
  border-radius: 4px 4px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  color: white;
  font-weight: 500;
  font-size: 0.8rem;
  min-height: 20px;
  transition: height 0.5s ease;
}

.emotion-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-color, #333);
}

.emotion-value {
  margin-bottom: 0.5rem;
}

.guidance-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
}

.guidance-card.high {
  border-left: 4px solid #DC143C;
}

.guidance-card.medium {
  border-left: 4px solid #FFA500;
}

.guidance-card.low {
  border-left: 4px solid #28a745;
}

.guidance-action {
  background: var(--primary-color, #007bff);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.proactive-suggestions {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.suggestion-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.suggestion-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.suggestion-card.high {
  border-left: 4px solid #DC143C;
}

.suggestion-card.medium {
  border-left: 4px solid #FFA500;
}

.suggestion-card.low {
  border-left: 4px solid #28a745;
}

.suggestion-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.suggestion-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.suggestion-content p {
  margin: 0 0 1rem 0;
  opacity: 0.9;
}

.suggestion-action {
  font-weight: 500;
  text-decoration: underline;
}

.adaptive-content {
  flex: 1;
  padding: 2rem;
}

.emotional-support-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 350px;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.emotional-support-panel.open {
  transform: translateX(0);
}

.support-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.close-support {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.support-options {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.support-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.support-option:hover {
  background: #f8f9fa;
  border-color: var(--primary-color, #007bff);
}

.support-icon {
  font-size: 1.5rem;
}

.quick-support-phrases {
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.quick-support-phrases p {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.quick-support-phrases p:hover {
  background: var(--primary-color, #007bff);
  color: white;
}

.floating-companion {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 999;
}

.companion-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.companion-avatar:hover {
  transform: scale(1.1);
}

.companion-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.companion-indicator.available { background: #28a745; }
.companion-indicator.celebrating { background: #FFD700; }
.companion-indicator.caring { background: #4169E1; }
.companion-indicator.supportive { background: #DC143C; }
.companion-indicator.concerned { background: #FFA500; }
.companion-indicator.peaceful { background: #98FB98; }

.companion-message {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Dark theme support */
.persona-driven-ui.dark {
  --bg-color: #2a2a2a;
  --text-color: #e0e0e0;
  --border-color: #444;
  --primary-color: #4a9eff;
}

.persona-driven-ui.dark .emotional-dashboard {
  background: #2a2a2a;
  color: #e0e0e0;
}

.persona-driven-ui.dark .emotion-label {
  color: #e0e0e0;
}
</style>
