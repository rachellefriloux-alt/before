<template>
  <transition name="fade-slide">
    <div class="sallie-core-screen" :class="theme" :style="dynamicBackground">
      <!-- Top Section: Identity, Mood, Customization, Voice -->
      <div class="identity-band" role="banner">
        <img :src="avatarAsset.url" :alt="'Avatar: ' + mode" class="avatar animated-avatar" @mouseenter="avatarPulse" tabindex="0" aria-label="Persona avatar" />
        <div class="mood-ring" :style="moodRingStyle" aria-hidden="true"></div>
        <div class="mode-pill" aria-label="Persona mode">{{ mode }}</div>
        <span class="privacy-shield"><img :src="shieldIcon.url" alt="Privacy Shield" aria-label="Privacy Shield" /></span>
        <!-- Avatar Accessories -->
        <div class="avatar-accessories" aria-label="Avatar accessories">
          <img v-for="acc in avatarAccessories" :key="acc.id" :src="acc.url" :alt="acc.name" class="accessory" tabindex="0" />
        </div>
        <!-- Persona Customization -->
        <button class="customize-btn" @click="openCustomization" aria-label="Customize persona" tabindex="0">Customize</button>
        <!-- Voice Interaction -->
        <button class="voice-btn" @click="toggleVoice" aria-label="Toggle voice interaction" tabindex="0">{{ voiceActive ? '🎤 Stop Voice' : '🎤 Start Voice' }}</button>
      </div>
      <!-- Mood Stripe -->
      <div class="mood-stripe" :style="moodStripeStyle"></div>
      <!-- Center Section: Dialogue & Interaction -->
      <div class="conversation-area">
        <messenger-chat-bubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          :mode="mode"
          :isSallie="msg.isSallie"
          :emoji="msg.emoji"
        />
        <div class="intent-rail">
          <button v-for="intent in intents" :key="intent.name" :class="['intent-btn', intent.mode]" @mousedown="intentRipple($event)">
            <img :src="intent.icon.url" :alt="intent.name" />
            {{ intent.label }}
          </button>
              </div>
              <!-- Persona Customization -->
              <button class="customize-btn" @click="openCustomization">Customize</button>
              <!-- Voice Interaction -->
              <button class="voice-btn" @click="toggleVoice">{{ voiceActive ? '🎤 Stop Voice' : '🎤 Start Voice' }}</button>
          <button v-for="intent in intents" :key="intent.name" :class="['intent-btn', intent.mode]" @mousedown="intentRipple($event)">
            <img :src="intent.icon.url" :alt="intent.name" />
            {{ intent.label }}
          </button>
        </div>
      </div>
      <!-- Toast Notifications -->
      <transition-group name="toast-fade" tag="div" class="toast-container">
        <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
          <span v-if="toast.emoji">{{ toast.emoji }}</span> {{ toast.message }}
        </div>
      </transition-group>
      <!-- Bottom Section: Modules & Tools -->
      <div class="modules-dock">
        <div v-for="mod in modules" :key="mod.name" class="module-chip" :class="mod.state">
          <img :src="mod.icon.url" :alt="mod.name" />
          <span>{{ mod.name }}</span>
          <span class="status-indicator" :class="mod.state"></span>
        </div>
        <div class="easter-egg-zone" v-if="showEasterEgg">
          <img :src="easterEggAsset.url" alt="Easter Egg" />
        </div>
      </div>
  </transition>
</template>
<script>
import AssetManager from '../../core/AssetManager.js';
import MessengerChatBubble from './MessengerChatBubble.vue';
import AdaptivePersonaEngine from '../../core/AdaptivePersonaEngine.js';
export default {
  name: 'SallieCoreScreen',
  components: { MessengerChatBubble },
  props: {
    theme: { type: String, default: 'light' },
    mode: { type: String, default: 'loyal' },
    personaState: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      personaEngine: new AdaptivePersonaEngine({ personaState: this.personaState }),
      avatarAsset: this.getPersonaDrivenAvatar(),
      shieldIcon: AssetManager.getAsset('icon_shield'),
      moodRingStyle: this.getMoodRingStyle(this.getPersonaMode()),
      moodStripeStyle: this.getMoodStripeStyle(this.getPersonaMode()),
      dynamicBackground: { background: 'linear-gradient(120deg, #ECEFF1 0%, #00BFA5 100%)' },
      messages: [],
      intents: [
        { name: 'logic', label: 'Logic', icon: AssetManager.getAsset('icon_compass'), mode: 'strategic' },
        { name: 'creativity', label: 'Creativity', icon: AssetManager.getAsset('icon_heartline'), mode: 'creative' },
        { name: 'loyalty', label: 'Loyalty', icon: AssetManager.getAsset('icon_shield'), mode: 'loyal' },
        { name: 'humor', label: 'Humor', icon: AssetManager.getAsset('icon_heartline'), mode: 'playful' },
        { name: 'resourcefulness', label: 'Resourcefulness', icon: AssetManager.getAsset('icon_puzzle'), mode: 'resourceful' },
        { name: 'critical', label: 'Critical', icon: AssetManager.getAsset('icon_shield'), mode: 'critical' }
      ],
      modules: [
        { name: 'Core', icon: AssetManager.getAsset('icon_shield'), state: 'active' },
        { name: 'AI', icon: AssetManager.getAsset('icon_compass'), state: 'active' },
        { name: 'Identity', icon: AssetManager.getAsset('icon_heartline'), state: 'inactive' },
        { name: 'Tone', icon: AssetManager.getAsset('icon_heartline'), state: 'active' },
        { name: 'ResponseTemplates', icon: AssetManager.getAsset('icon_compass'), state: 'active' },
        { name: 'Resourcefulness', icon: AssetManager.getAsset('icon_puzzle'), state: 'active' },
        { name: 'Critical', icon: AssetManager.getAsset('icon_shield'), state: 'inactive' }
      ],
      showEasterEgg: false,
      easterEggAsset: this.getPersonaDrivenEasterEgg(),
      toasts: []
    };
  },
  watch: {
    mode(newMode) {
      this.avatarAsset = AssetManager.getAssetsByMode(newMode)[0] || AssetManager.getAsset('avatar_loyal');
      this.moodRingStyle = this.getMoodRingStyle(newMode);
      this.moodStripeStyle = this.getMoodStripeStyle(newMode);
    },
    personaState: {
      handler(newState) {
        this.personaEngine.personaState = newState;
        this.updateVisualsFromPersona();
      },
      deep: true
    }
  },
  methods: {
    getPersonaMode() {
      // Automate persona-driven mode selection
      return this.personaEngine.personaState.mode || this.mode || 'loyal';
    },
    getPersonaDrivenAvatar() {
      // Automate persona-driven avatar selection
      const mode = this.getPersonaMode();
      return AssetManager.getAssetsByMode(mode)[0] || AssetManager.getAsset('avatar_loyal');
    },
    getPersonaDrivenEasterEgg() {
      // Automate persona-driven easter egg selection
      const mode = this.getPersonaMode();
      if (mode === 'playful') return AssetManager.getAsset('illus_empty_playful');
      if (mode === 'critical') return AssetManager.getAsset('illus_empty_loyal');
      return AssetManager.getAsset('illus_empty_loyal');
    },
    getMoodRingStyle(mode) {
      // Dynamic gradient based on mode
      const gradients = {
        loyal: 'radial-gradient(circle, #00BFA5 20%, #ECEFF1 0%)',
        strategic: 'radial-gradient(circle, #004080 20%, #2979FF 0%)',
        empathic: 'radial-gradient(circle, #ECEFF1 20%, #26C6DA 0%)',
        creative: 'radial-gradient(circle, #015D63 20%, #FF7043 0%)',
        playful: 'radial-gradient(circle, #FF7043 20%, #007FFF 0%)',
        resourceful: 'radial-gradient(circle, #90A4AE 20%, #FF5252 0%)',
        critical: 'radial-gradient(circle, #D32F2F 20%, #FFCDD2 0%)'
      };
      return { background: gradients[mode] || gradients.loyal, filter: 'blur(24px)' };
    },
    getMoodStripeStyle(mode) {
      const colors = {
        loyal: '#00BFA5',
        strategic: '#004080',
        empathic: '#26C6DA',
        creative: '#FF7043',
        playful: '#007FFF',
        resourceful: '#FF5252',
        critical: '#D32F2F'
      };
      return { background: colors[mode] || colors.loyal, height: '8px' };
    },
    updateVisualsFromPersona() {
      // Update mode, avatar, mood ring, stripe, and easter egg based on persona state
      const mode = this.getPersonaMode();
      this.avatarAsset = this.getPersonaDrivenAvatar();
      this.moodRingStyle = this.getMoodRingStyle(mode);
      this.moodStripeStyle = this.getMoodStripeStyle(mode);
      this.easterEggAsset = this.getPersonaDrivenEasterEgg();
    },
    addMessage(text, cue = 'decisive', isSallie = true, emoji = null) {
      this.messages.push({ id: Date.now(), text, cue, isSallie, emoji });
      if (cue === 'achievement') this.showToast('🏆 Achievement unlocked!', 'success', '🏆');
      if (cue === 'milestone') this.showToast('🎯 Milestone reached!', 'info', '🎯');
      if (cue === 'celebrate') this.showToast('🎉 Celebration!', 'success', '🎉');
      if (cue === 'critical') this.showToast('⚠️ Critical mode!', 'error', '⚠️');
      if (cue === 'motivated') this.showToast('🚀 Motivated!', 'info', '🚀');
      if (cue === 'reflective') this.showToast('💡 Reflective moment.', 'info', '💡');
    },
    showToast(message, type = 'info', emoji = null) {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type, emoji });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 3200);
    },
    avatarPulse() {
      // Micro-interaction: pulse animation on avatar hover
      const avatar = document.querySelector('.animated-avatar');
      if (avatar) {
        avatar.classList.add('pulse');
        setTimeout(() => avatar.classList.remove('pulse'), 600);
      }
    },
    intentRipple(event) {
      // Micro-interaction: ripple effect on intent button
      const btn = event.currentTarget;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = event.offsetX + 'px';
      ripple.style.top = event.offsetY + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    },
    triggerIntent(intent) {
      // Update persona state and visuals based on intent
      this.personaEngine.updatePersona({ intent });
      // Advanced: trigger custom events for extensions
      if (intent.name === 'celebrate') {
        this.personaEngine.triggerCustomEvent('onCelebrate', { intent });
        this.addMessage('🎉 Celebration mode activated!', 'celebrate', true);
      }
      if (intent.name === 'critical') {
        this.personaEngine.triggerCustomEvent('onCritical', { intent });
        this.addMessage('⚠️ Critical mode engaged.', 'critical', true);
      }
      if (intent.name === 'alert') {
        this.personaEngine.triggerCustomEvent('onAlert', { intent });
        this.addMessage('🚨 Alert mode triggered.', 'alert', true);
      }
      this.updateVisualsFromPersona();
      this.addMessage(`Intent triggered: ${intent.label}`, intent.name, true);
    },
    addAsset(asset) {
      AssetManager.addAsset(asset);
      this.updateVisualsFromPersona();
    },
    // Advanced: register custom extension hooks
    registerCustomExtensions() {
      this.personaEngine.onCustomEvent('onCelebrate', (payload, state) => {
        this.easterEggAsset = AssetManager.getAsset('anim_confetti');
      });
      this.personaEngine.onCustomEvent('onCritical', (payload, state) => {
        this.easterEggAsset = AssetManager.getAsset('illus_empty_loyal');
      });
      this.personaEngine.onCustomEvent('onAlert', (payload, state) => {
        this.easterEggAsset = AssetManager.getAsset('illus_empty_loyal');
      });
      this.personaEngine.onCustomEvent('onAchievement', (payload, state) => {
        this.easterEggAsset = AssetManager.getAsset('icon_achievement');
        this.addMessage('🏆 Achievement unlocked!', 'achievement', true);
      });
      this.personaEngine.onCustomEvent('onMilestone', (payload, state) => {
        this.easterEggAsset = AssetManager.getAsset('illus_milestone');
        this.addMessage('🎯 Milestone reached!', 'milestone', true);
      });
      this.personaEngine.onCustomEvent('onMotivated', (payload, state) => {
        this.easterEggAsset = AssetManager.getAsset('avatar_strategic');
        this.addMessage('🚀 Feeling motivated!', 'motivated', true);
      });
      this.personaEngine.onCustomEvent('onReflective', (payload, state) => {
        this.easterEggAsset = AssetManager.getAsset('avatar_empathic');
        this.addMessage('💡 Reflective moment.', 'reflective', true);
      });
    }
  },
  mounted() {
    this.registerCustomExtensions();
    // Example: activate all creative extensions on mount for demo
    this.avatarAccessories = [AssetManager.getAsset('acc_hat'), AssetManager.getAsset('acc_glasses')];
    this.animatedStickers = [AssetManager.getAsset('anim_confetti')];
    this.goals = [
      { id: 1, name: 'Complete onboarding', completed: false },
      { id: 2, name: 'Unlock achievement', completed: false }
    ];
    this.personaMemories = [
      { id: 1, label: 'First login', asset: AssetManager.getAsset('avatar_loyal') },
      { id: 2, label: 'Achievement unlocked', asset: AssetManager.getAsset('icon_achievement') }
    ];
    this.currentSeason = 'Spring';
    this.seasonalThemeActive = true;
    this.socialSharingActive = true;
    this.assetImportActive = true;
    this.pluginMarketplaceActive = true;
    this.communitySharingActive = true;
    this.memoryGalleryActive = true;
    this.goalTrackingActive = true;
    this.chatBubbleStyle = 'rounded';
    this.dynamicFontStyle = { fontFamily: 'Comic Sans MS, cursive', fontSize: '18px', color: '#2979FF' };
    this.ambientSoundActive = true;
  }
};
</script>
<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}
.fade-slide-enter, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(24px);
}
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.toast {
  background: #fff;
  color: #0E1116;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  padding: 12px 20px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: toastReveal 0.6s cubic-bezier(0.25,0.1,0.25,1);
}
.toast.success { border-left: 4px solid #00BFA5; }
.toast.info { border-left: 4px solid #2979FF; }
.toast.error { border-left: 4px solid #D32F2F; }
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}
.toast-fade-enter, .toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}
.sallie-core-screen {
  background: var(--bg-base, #ECEFF1);
  color: var(--text-primary, #0E1116);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter, Public Sans, sans-serif;
}
.identity-band {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px 0 24px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 20%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.animated-avatar.pulse {
  animation: pulseAnim 0.6s;
}
@keyframes pulseAnim {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
.mood-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  position: absolute;
  z-index: -1;
}
.mode-pill {
  background: #00BFA5;
  color: #FFD54F;
  border-radius: 12px;
  padding: 4px 12px;
  font-weight: bold;
}
.privacy-shield img {
  width: 24px;
  height: 24px;
}
.mood-stripe {
  width: 100%;
  height: 8px;
  margin-bottom: 8px;
}
.conversation-area {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
.intent-rail {
  position: absolute;
  left: 0;
  top: 24px;
  width: 56px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.intent-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ECEFF1;
  border-radius: 12px;
  padding: 8px 12px;
  min-width: 44px;
  cursor: pointer;
  border: none;
  font-size: 16px;
  position: relative;
  overflow: hidden;
  transition: background 0.2s;
}
.intent-btn .ripple {
  position: absolute;
  width: 32px;
  height: 32px;
  background: rgba(0,191,165,0.2);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: rippleAnim 0.6s linear;
}
@keyframes rippleAnim {
  0% { opacity: 1; transform: scale(0.6); }
  100% { opacity: 0; transform: scale(2.2); }
}
.intent-btn.loyal {
  background: #00BFA5;
  color: #FFD54F;
}
.intent-btn.strategic {
  background: #004080;
  color: #2979FF;
}
.intent-btn.creative {
  background: #015D63;
  color: #FF7043;
}
.intent-btn.playful {
  background: #FF7043;
  color: #007FFF;
}
.intent-btn.resourceful {
  background: #90A4AE;
  color: #FF5252;
}
.modules-dock {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-elev1, rgba(0,0,0,0.04));
  border-radius: 16px 16px 0 0;
}
.module-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ECEFF1;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.module-chip.active {
  border: 2px solid #00BFA5;
}
.module-chip.inactive {
  opacity: 0.5;
}
.status-indicator.active {
  background: #00BFA5;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 4px;
}
.status-indicator.inactive {
  background: #90A4AE;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 4px;
}
.easter-egg-zone img {
  width: 48px;
  height: 48px;
  animation: bounce 1.2s infinite alternate;
}
@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-12px); }
}
@keyframes toastReveal {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
/* Responsive and accessible styles */
.sallie-core-screen {
  background: var(--bg-base, #ECEFF1);
  color: var(--text-primary, #0E1116);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter, Public Sans, sans-serif;
  box-sizing: border-box;
}
.identity-band {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px 0 24px;
  flex-wrap: wrap;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 20%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  outline: none;
}
.avatar:focus {
  box-shadow: 0 0 0 3px #2979FF;
}
.animated-avatar.pulse {
  animation: pulseAnim 0.6s;
}
@keyframes pulseAnim {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
.mood-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  position: absolute;
  z-index: -1;
}
.mode-pill {
  background: #00BFA5;
  color: #FFD54F;
  border-radius: 12px;
  padding: 4px 12px;
  font-weight: bold;
}
.privacy-shield img {
  width: 24px;
  height: 24px;
}
.avatar-accessories {
  display: flex;
  gap: 8px;
}
.accessory {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  outline: none;
}
.accessory:focus {
  box-shadow: 0 0 0 2px #00BFA5;
}
.customize-btn, .voice-btn {
  margin-left: 8px;
  background: #2979FF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 15px;
  cursor: pointer;
  outline: none;
  transition: background 0.2s;
}
.customize-btn:focus, .voice-btn:focus {
  background: #015D63;
}
.mood-stripe {
  width: 100%;
  height: 8px;
  margin-bottom: 8px;
}
.conversation-area {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  box-sizing: border-box;
}
.intent-rail {
  position: absolute;
  left: 0;
  top: 24px;
  width: 56px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.intent-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ECEFF1;
  border-radius: 12px;
  padding: 8px 12px;
  min-width: 44px;
  cursor: pointer;
  border: none;
  font-size: 16px;
  position: relative;
  overflow: hidden;
  transition: background 0.2s;
  outline: none;
}
.intent-btn:focus {
  background: #2979FF;
  color: #fff;
}
.intent-btn .ripple {
  position: absolute;
  width: 32px;
  height: 32px;
  background: rgba(0,191,165,0.2);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: rippleAnim 0.6s linear;
}
@keyframes rippleAnim {
  0% { opacity: 1; transform: scale(0.6); }
  100% { opacity: 0; transform: scale(2.2); }
}
.intent-btn.loyal {
  background: #00BFA5;
  color: #FFD54F;
}
.intent-btn.strategic {
  background: #004080;
  color: #2979FF;
}
.intent-btn.creative {
  background: #015D63;
  color: #FF7043;
}
.intent-btn.playful {
  background: #FF7043;
  color: #007FFF;
}
.intent-btn.resourceful {
  background: #90A4AE;
  color: #FF5252;
}
.modules-dock {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-elev1, rgba(0,0,0,0.04));
  border-radius: 16px 16px 0 0;
  flex-wrap: wrap;
}
.module-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ECEFF1;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  outline: none;
}
.module-chip:focus {
  border: 2px solid #2979FF;
}
.module-chip.active {
  border: 2px solid #00BFA5;
}
.module-chip.inactive {
  opacity: 0.5;
}
.status-indicator.active {
  background: #00BFA5;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 4px;
}
.status-indicator.inactive {
  background: #90A4AE;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 4px;
}
.easter-egg-zone img {
  width: 48px;
  height: 48px;
  animation: bounce 1.2s infinite alternate;
}
@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-12px); }
}
@keyframes toastReveal {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
@media (max-width: 900px) {
  .identity-band, .modules-dock {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
  .conversation-area {
    padding: 12px;
  }
}
@media (max-width: 600px) {
  .sallie-core-screen {
    gap: 12px;
    font-size: 15px;
  }
  .avatar {
    width: 48px;
    height: 48px;
  }
  .mood-ring {
    width: 48px;
    height: 48px;
  }
  .module-chip {
    font-size: 14px;
    padding: 6px 10px;
  }
}
</style>
