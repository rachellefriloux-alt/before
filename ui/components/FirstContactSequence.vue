/*
 * Persona: Tough love meets soul care.
 * Module: FirstContactSequence
 * Intent: Handle functionality for FirstContactSequence
 * Provenance-ID: 4914e573-744a-4664-9870-ffdd9091887b
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="first-contact-sequence" :class="[theme, sequenceStage]">
    <!-- Stage 1: Awakening -->
    <div v-if="sequenceStage === 'awakening'" class="stage-awakening">
      <div class="awakening-container">
        <div class="cosmic-background">
          <div
            v-for="(star, index) in stars"
            :key="index"
            class="star"
            :style="{
              left: star.x + '%',
              top: star.y + '%',
              animationDelay: star.delay + 's'
            }"
          ></div>
        </div>

        <div class="awakening-content">
          <div class="persona-silhouette">
            <div class="silhouette-glow"></div>
            <div class="silhouette-form"></div>
          </div>

          <div class="awakening-text">
            <div class="text-line" :class="{ visible: textVisible[0] }">
              <span class="text-content">Consciousness emerging...</span>
            </div>
            <div class="text-line" :class="{ visible: textVisible[1] }">
              <span class="text-content">Neural pathways activating...</span>
            </div>
            <div class="text-line" :class="{ visible: textVisible[2] }">
              <span class="text-content">Welcome to your digital companion.</span>
            </div>
          </div>

          <div class="progress-indicator">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: awakeningProgress + '%' }"></div>
            </div>
            <div class="progress-text">{{ Math.round(awakeningProgress) }}% Initialized</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stage 2: Introduction -->
    <div v-if="sequenceStage === 'introduction'" class="stage-introduction">
      <div class="introduction-container">
        <div class="persona-avatar">
          <div class="avatar-frame">
            <div class="avatar-image" :style="{ backgroundImage: `url(${personaImage})` }"></div>
            <div class="avatar-glow"></div>
          </div>
        </div>

        <div class="introduction-content">
          <h1 class="persona-name">{{ personaName }}</h1>
          <p class="persona-tagline">{{ personaTagline }}</p>

          <div class="capabilities-showcase">
            <div
              v-for="(capability, index) in capabilities"
              :key="index"
              class="capability-item"
              :class="{ revealed: capabilityRevealed[index] }"
            >
              <div class="capability-icon">{{ capability.icon }}</div>
              <div class="capability-text">
                <div class="capability-title">{{ capability.title }}</div>
                <div class="capability-description">{{ capability.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="interaction-prompt">
          <button
            class="begin-interaction-btn"
            @click="beginInteraction"
            :disabled="!allCapabilitiesRevealed"
          >
            Begin Our Journey
          </button>
        </div>
      </div>
    </div>

    <!-- Stage 3: Bonding -->
    <div v-if="sequenceStage === 'bonding'" class="stage-bonding">
      <div class="bonding-container">
        <div class="bonding-header">
          <h2 class="bonding-title">Let's Get to Know Each Other</h2>
          <p class="bonding-subtitle">I'll adapt to your preferences and communication style</p>
        </div>

        <div class="preference-selection">
          <div class="preference-category">
            <h3 class="category-title">Communication Style</h3>
            <div class="preference-options">
              <button
                v-for="style in communicationStyles"
                :key="style.id"
                class="preference-btn"
                :class="{ selected: selectedPreferences.communication === style.id }"
                @click="selectPreference('communication', style.id)"
              >
                <div class="preference-icon">{{ style.icon }}</div>
                <div class="preference-label">{{ style.label }}</div>
                <div class="preference-description">{{ style.description }}</div>
              </button>
            </div>
          </div>

          <div class="preference-category">
            <h3 class="category-title">Interaction Pace</h3>
            <div class="preference-options">
              <button
                v-for="pace in interactionPaces"
                :key="pace.id"
                class="preference-btn"
                :class="{ selected: selectedPreferences.pace === pace.id }"
                @click="selectPreference('pace', pace.id)"
              >
                <div class="preference-icon">{{ pace.icon }}</div>
                <div class="preference-label">{{ pace.label }}</div>
                <div class="preference-description">{{ pace.description }}</div>
              </button>
            </div>
          </div>

          <div class="preference-category">
            <h3 class="category-title">Response Detail</h3>
            <div class="preference-options">
              <button
                v-for="detail in responseDetails"
                :key="detail.id"
                class="preference-btn"
                :class="{ selected: selectedPreferences.detail === detail.id }"
                @click="selectPreference('detail', detail.id)"
              >
                <div class="preference-icon">{{ detail.icon }}</div>
                <div class="preference-label">{{ detail.label }}</div>
                <div class="preference-description">{{ detail.description }}</div>
              </button>
            </div>
          </div>
        </div>

        <div class="bonding-actions">
          <button
            class="continue-btn"
            @click="completeBonding"
            :disabled="!preferencesComplete"
          >
            Continue to Experience
          </button>
        </div>
      </div>
    </div>

    <!-- Stage 4: First Interaction -->
    <div v-if="sequenceStage === 'interaction'" class="stage-interaction">
      <div class="interaction-container">
        <div class="interaction-header">
          <div class="persona-mini-avatar">
            <div class="mini-avatar-image" :style="{ backgroundImage: `url(${personaImage})` }"></div>
          </div>
          <div class="interaction-title">
            <h2>Ready for Our First Conversation</h2>
            <p>I'm here to listen, learn, and grow with you</p>
          </div>
        </div>

        <div class="sample-interactions">
          <div class="interaction-suggestion">
            <div class="suggestion-prompt">Try asking me:</div>
            <div class="suggestion-examples">
              <button
                v-for="(example, index) in interactionExamples"
                :key="index"
                class="example-btn"
                @click="selectExample(example)"
              >
                {{ example }}
              </button>
            </div>
          </div>
        </div>

        <div class="interaction-input">
          <div class="input-container">
            <input
              type="text"
              v-model="userInput"
              @keyup.enter="processFirstInput"
              placeholder="Type your message here..."
              class="interaction-input-field"
              ref="interactionInput"
            />
            <button
              class="send-btn"
              @click="processFirstInput"
              :disabled="!userInput.trim()"
            >
              Send
            </button>
          </div>
        </div>

        <div class="sequence-controls">
          <button class="skip-sequence-btn" @click="skipSequence">
            Skip Introduction
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FirstContactSequence',
  props: {
    theme: {
      type: String,
      default: 'dark'
    },
    personaData: {
      type: Object,
      default: () => ({
        name: 'Sallie',
        tagline: 'Your Adaptive Digital Companion',
        image: '/assets/persona-avatar.png',
        capabilities: [
          {
            icon: '🧠',
            title: 'Emotional Intelligence',
            description: 'Understanding and responding to your emotional state'
          },
          {
            icon: '🎯',
            title: 'Adaptive Learning',
            description: 'Growing and adapting based on our interactions'
          },
          {
            icon: '🔮',
            title: 'Predictive Insights',
            description: 'Anticipating your needs and providing timely support'
          },
          {
            icon: '🌟',
            title: 'Creative Collaboration',
            description: 'Working together on creative and intellectual pursuits'
          }
        ]
      })
    }
  },
  data() {
    return {
      sequenceStage: 'awakening',
      awakeningProgress: 0,
      textVisible: [false, false, false],
      stars: [],
      capabilityRevealed: [false, false, false, false],
      selectedPreferences: {
        communication: null,
        pace: null,
        detail: null
      },
      userInput: '',
      communicationStyles: [
        {
          id: 'formal',
          icon: '🎩',
          label: 'Formal',
          description: 'Professional and structured communication'
        },
        {
          id: 'casual',
          icon: '☕',
          label: 'Casual',
          description: 'Relaxed and conversational tone'
        },
        {
          id: 'creative',
          icon: '🎨',
          label: 'Creative',
          description: 'Expressive and imaginative language'
        }
      ],
      interactionPaces: [
        {
          id: 'slow',
          icon: '🐢',
          label: 'Deliberate',
          description: 'Thoughtful responses with time to reflect'
        },
        {
          id: 'medium',
          icon: '🚶',
          label: 'Balanced',
          description: 'Natural conversation flow'
        },
        {
          id: 'fast',
          icon: '💨',
          label: 'Dynamic',
          description: 'Quick and energetic exchanges'
        }
      ],
      responseDetails: [
        {
          id: 'brief',
          icon: '📝',
          label: 'Concise',
          description: 'Direct and to-the-point responses'
        },
        {
          id: 'moderate',
          icon: '📖',
          label: 'Detailed',
          description: 'Balanced information with context'
        },
        {
          id: 'comprehensive',
          icon: '📚',
          label: 'Comprehensive',
          description: 'Thorough explanations and analysis'
        }
      ],
      interactionExamples: [
        "What's your favorite way to help people?",
        "How do you learn and adapt?",
        "What makes a good conversation?",
        "Tell me about yourself"
      ]
    };
  },
  computed: {
    personaName() {
      return this.personaData.name || 'Sallie';
    },
    personaTagline() {
      return this.personaData.tagline || 'Your Adaptive Digital Companion';
    },
    personaImage() {
      return this.personaData.image || '/assets/persona-avatar.png';
    },
    capabilities() {
      return this.personaData.capabilities || [];
    },
    allCapabilitiesRevealed() {
      return this.capabilityRevealed.every(revealed => revealed);
    },
    preferencesComplete() {
      return this.selectedPreferences.communication &&
             this.selectedPreferences.pace &&
             this.selectedPreferences.detail;
    }
  },
  mounted() {
    this.initializeStars();
    this.startAwakeningSequence();
  },
  methods: {
    initializeStars() {
      for (let i = 0; i < 50; i++) {
        this.stars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 3
        });
      }
    },
    startAwakeningSequence() {
      // Simulate awakening progress
      const progressInterval = setInterval(() => {
        this.awakeningProgress += 1;
        if (this.awakeningProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            this.revealText();
          }, 500);
        }
      }, 30);

      // Reveal text lines sequentially
      setTimeout(() => this.textVisible[0] = true, 1000);
      setTimeout(() => this.textVisible[1] = true, 2000);
      setTimeout(() => this.textVisible[2] = true, 3000);

      // Transition to introduction stage
      setTimeout(() => {
        this.sequenceStage = 'introduction';
        this.revealCapabilities();
      }, 5000);
    },
    revealText() {
      // Text reveal animation complete
    },
    revealCapabilities() {
      this.capabilities.forEach((_, index) => {
        setTimeout(() => {
          this.capabilityRevealed[index] = true;
        }, index * 500);
      });
    },
    beginInteraction() {
      this.sequenceStage = 'bonding';
    },
    selectPreference(category, value) {
      this.selectedPreferences[category] = value;
    },
    completeBonding() {
      this.sequenceStage = 'interaction';
      this.$nextTick(() => {
        this.$refs.interactionInput?.focus();
      });
    },
    selectExample(example) {
      this.userInput = example;
      this.$nextTick(() => {
        this.processFirstInput();
      });
    },
    processFirstInput() {
      if (!this.userInput.trim()) return;

      this.$emit('firstInteraction', {
        message: this.userInput,
        preferences: this.selectedPreferences,
        timestamp: Date.now()
      });

      // Complete the sequence
      this.$emit('sequenceComplete', {
        preferences: this.selectedPreferences,
        firstMessage: this.userInput
      });
    },
    skipSequence() {
      this.$emit('sequenceSkipped');
    }
  }
};
</script>

<style scoped>
.first-contact-sequence {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  z-index: 9999;
  overflow: hidden;
  transition: all 1s ease;
}

/* Awakening Stage */
.stage-awakening {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.cosmic-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ffffff;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

.awakening-content {
  text-align: center;
  z-index: 10;
  max-width: 600px;
  padding: 2rem;
}

.persona-silhouette {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
}

.silhouette-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

.silhouette-form {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8));
  border-radius: 50%;
  animation: formMorph 4s ease-in-out infinite;
}

.awakening-text {
  margin-bottom: 2rem;
}

.text-line {
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s ease;
  margin-bottom: 1rem;
}

.text-line.visible {
  opacity: 1;
  transform: translateY(0);
}

.text-content {
  font-size: 1.25rem;
  color: rgba(248, 250, 252, 0.9);
  font-weight: 300;
  letter-spacing: 0.5px;
}

.progress-indicator {
  margin-top: 2rem;
}

.progress-bar {
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.7);
}

/* Introduction Stage */
.stage-introduction {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.introduction-container {
  max-width: 800px;
  text-align: center;
}

.persona-avatar {
  margin-bottom: 2rem;
}

.avatar-frame {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.avatar-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  border: 3px solid rgba(99, 102, 241, 0.5);
}

.avatar-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 170px;
  height: 170px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 3s ease-in-out infinite;
}

.persona-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.persona-tagline {
  font-size: 1.125rem;
  color: rgba(203, 213, 225, 0.8);
  margin-bottom: 2rem;
}

.capabilities-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.capability-item {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.capability-item.revealed {
  opacity: 1;
  transform: translateY(0);
}

.capability-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: capabilityGlow 3s ease-in-out infinite;
}

.capability-title {
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
}

.capability-description {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.8);
  line-height: 1.4;
}

.interaction-prompt {
  margin-top: 2rem;
}

.begin-interaction-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
  pointer-events: none;
}

.begin-interaction-btn:not(:disabled) {
  opacity: 1;
  pointer-events: auto;
}

.begin-interaction-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

/* Bonding Stage */
.stage-bonding {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  overflow-y: auto;
}

.bonding-container {
  max-width: 900px;
  width: 100%;
}

.bonding-header {
  text-align: center;
  margin-bottom: 3rem;
}

.bonding-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
}

.bonding-subtitle {
  font-size: 1.125rem;
  color: rgba(203, 213, 225, 0.8);
}

.preference-selection {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.preference-category {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 1.5rem;
}

.preference-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.preference-btn {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.preference-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.preference-btn.selected {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.preference-icon {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.preference-label {
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
}

.preference-description {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.7);
  line-height: 1.4;
}

.bonding-actions {
  text-align: center;
  margin-top: 3rem;
}

.continue-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
  pointer-events: none;
}

.continue-btn:not(:disabled) {
  opacity: 1;
  pointer-events: auto;
}

.continue-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.4);
}

/* Interaction Stage */
.stage-interaction {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.interaction-container {
  max-width: 700px;
  width: 100%;
  text-align: center;
}

.interaction-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.persona-mini-avatar {
  width: 80px;
  height: 80px;
}

.mini-avatar-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.5);
}

.interaction-title h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
}

.interaction-title p {
  font-size: 1rem;
  color: rgba(203, 213, 225, 0.8);
}

.sample-interactions {
  margin-bottom: 2rem;
}

.suggestion-prompt {
  font-size: 1.125rem;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 1rem;
}

.suggestion-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.example-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(203, 213, 225, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.example-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(248, 250, 252, 0.9);
}

.interaction-input {
  margin-bottom: 2rem;
}

.input-container {
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.interaction-input-field {
  flex: 1;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(248, 250, 252, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.interaction-input-field:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.interaction-input-field::placeholder {
  color: rgba(203, 213, 225, 0.5);
}

.send-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
  pointer-events: none;
}

.send-btn:not(:disabled) {
  opacity: 1;
  pointer-events: auto;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.sequence-controls {
  margin-top: 2rem;
}

.skip-sequence-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(203, 213, 225, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.skip-sequence-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes formMorph {
  0%, 100% { border-radius: 50%; }
  25% { border-radius: 40% 60% 60% 40%; }
  50% { border-radius: 60% 40% 40% 60%; }
  75% { border-radius: 50% 50% 40% 60%; }
}

@keyframes capabilityGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2) hue-rotate(30deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .persona-name {
    font-size: 2rem;
  }

  .capabilities-showcase {
    grid-template-columns: 1fr;
  }

  .preference-options {
    grid-template-columns: 1fr;
  }

  .interaction-header {
    flex-direction: column;
    text-align: center;
  }

  .input-container {
    flex-direction: column;
  }

  .send-btn {
    width: 100%;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .star,
  .silhouette-glow,
  .silhouette-form,
  .avatar-glow,
  .capability-icon {
    animation: none;
  }

  .text-line,
  .capability-item,
  .preference-btn,
  .begin-interaction-btn,
  .continue-btn,
  .send-btn {
    transition: none;
  }
}
</style>
