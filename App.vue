/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\App.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\App.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\App.vue) --- */
<!-- Merged master for logical file: .\app
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\App.vue (hash:C9B3412AA4EBE2911F1417062A76B47B7AE04C8F554636319A30E7431D26EA50)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\App.vue (hash:B72BD8889F655BC75C00672C56257F406DDA8F164CC9B16E49953E153ECD28C6)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\app.js (hash:B58A47FE3ED665350DCACF792E40D0F2DC861EE0994097EE4F115B6B99673CD7)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app.js (hash:22BCE8C528DAFD6DD700E1E732110846817BE39F0BDD3BA574E0C4571DD22141)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\App.vue | ext: .vue | sha: C9B3412AA4EBE2911F1417062A76B47B7AE04C8F554636319A30E7431D26EA50 ---- -->
[BINARY FILE - original copied to merged_sources: App.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\App.vue | ext: .vue | sha: B72BD8889F655BC75C00672C56257F406DDA8F164CC9B16E49953E153ECD28C6 ---- -->
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\app.js | ext: .js | sha: B58A47FE3ED665350DCACF792E40D0F2DC861EE0994097EE4F115B6B99673CD7 ---- -->
[BINARY FILE - original copied to merged_sources: app.js]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app.js | ext: .js | sha: 22BCE8C528DAFD6DD700E1E732110846817BE39F0BDD3BA574E0C4571DD22141 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\App.vue --- */
import { callClaude, claudeSummarize, claudeAdvancedReasoning, claudeToolUse } from './ai/integrations/ClaudeIntegration.js';
import { callPerplexity, perplexityWebSearch, perplexityMultiHopQA, perplexitySummarize, perplexityDocumentAnalysis } from './ai/integrations/PerplexityIntegration.js';
import { callGemini, geminiMultimodal, geminiCreativeGeneration, geminiSummarize, geminiCodeGeneration } from './ai/integrations/GeminiIntegration.js';
import { sendGPTMessage, gptAdvancedChat, gptCreativeWriting, gptSummarize, gptCodeGeneration, gptAgentAction } from './ai/integrations/GPTIntegration.js';
import { callCopilot, generateCopilotCode, copilotTaskAutomation, copilotAdvancedChat, copilotCodeReview, copilotSummarize, copilotAgentAction } from './ai/integrations/CopilotIntegration.js';
<!--
  Sallie 1.0 Main App Module
  Persona: Tough love meets soul care.
  Function: Dynamic, visually excellent, fully integrated main Vue app.
  Got it, love.
-->
<template>
  <div id="app" :style="computedBackgroundStyle">
    <AuthPanel v-if="!user" :firebaseApp="firebaseApp" @userAuthenticated="onUserAuthenticated" />
    <div v-else>
      <header>
        <aside class="sidebar">
          <div class="user-list">
            <div v-for="user in Object.keys(userProfiles)" :key="user" :class="['user-entry', {active: activeUser === user}]" @click="setActiveUser(user)">
              <img :src="getAvatar(user)" class="avatar" :alt="user" />
              <span>{{ capitalize(user) }}</span>
              <span v-if="userProfiles[user].permissions.fullAccess" class="badge badge-owner">Owner</span>
              <span v-else class="badge badge-guest">Guest</span>
            </div>
          </div>
          <div class="model-mode-info">
            <span class="badge badge-model">Model: {{ selectedModel }}</span>
            <span class="badge badge-mode">Mode: {{ selectedMode }}</span>
        </aside>
        <div class="user-controls">
          <label for="user-select">User:</label>
          <select id="user-select" v-model="activeUser" @change="onUserChanged">
            <option value="you">You</option>
            <option value="austin">Austin</option>
            <option value="bella">Bella</option>
          </select>
        </div>
        <div class="ai-controls">
          <label for="model-select">AI Model:</label>
          <select id="model-select" v-model="selectedModel" @change="onModelChanged">
            <option value="claude">Claude 3.7</option>
            <option value="perplexity">Perplexity</option>
            <option value="gemini">Gemini</option>
            <option value="gpt5">GPT-5</option>
            <option value="copilot">Copilot</option>
          <label for="mode-select">Mode:</label>
          <select id="mode-select" v-model="selectedMode" @change="onModeChanged">
            <option value="chat">Chat</option>
            <option value="agent">Agent</option>
            <option value="advisory">Advisory</option>
            <option value="creative">Creative</option>
            <option value="sisr">SISR</option>
        <svg class="sallie-logo" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#6366f1" stroke="#4f46e5" stroke-width="2"/>
          <circle cx="15" cy="16" r="2" fill="white"/>
          <circle cx="25" cy="16" r="2" fill="white"/>
          <path d="M12 25 Q20 30 28 25" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
        <h1>Sallie 2.0</h1>
        <p class="tagline">Your digital life is a story. I'm here to make sure you're the one holding the pen.</p>
        <div class="system-status">
          <div id="status-indicator" class="status-dot initializing"></div>
          <span id="status-text">Initializing...</span>
        <AccessibilityPanel @firebaseConfigChanged="onFirebaseConfigChanged" />
        <ThemeCustomizer />
      </header>
      <OnboardingCore v-if="!onboarded" @onboarded="handleOnboarded" />
      <EmotionOverlay :emotion="emotion" :message="emotionMessage" />
      <VoiceConsole :waveform="voiceWaveformSVG" />
      <VoiceInputPanel />
      <TaskPanel :tasks="tasks" @executeGoal="executeGoal" />
  <MemoryDashboard v-if="userProfiles[activeUser].permissions.memory" :memory="memorySystem" />
  <CreativityDashboard v-if="userProfiles[activeUser].permissions.creativity" :creativity="creativitySystem" />
  <PersonaVisualization :persona="userProfile?.persona" :emotion="emotion" />
  <DeviceControlPanel v-if="userProfiles[activeUser].permissions.deviceControl" />
  <NotificationPanel v-if="userProfiles[activeUser].permissions.notifications" />
  <InsightCard :insight="insight" v-if="userProfiles[activeUser].permissions.fullAccess" />
  <ConsentDialog v-if="consentRequired && userProfiles[activeUser].permissions.fullAccess" :reasons="consentReasons" @grant="grantConsent" @decline="declineConsent" />
  <FeatureFlagsPanel @flagsUpdated="flagsUpdated" v-if="userProfiles[activeUser].permissions.fullAccess" />
  <PluginRegistryPanel v-if="userProfiles[activeUser].permissions.fullAccess" />
  <TransparencyPanel v-if="showTransparency && userProfiles[activeUser].permissions.fullAccess" :lastDecision="lastDecision" :lastProvenance="lastProvenance" :riskCalibration="riskCalibration" />
  <ChatBubble />
  <AnimatedAvatar :emotion="emotion" />
  <RealTimeChat :messages="userProfiles[activeUser].chatMessages" @sendMessage="sendChatMessage" :user="activeUser" :avatar="getAvatar(activeUser)" />
      <div v-if="showOnboarding" class="onboarding-tooltip">
        <h3>Welcome to Sallie!</h3>
        <p>Select your user, model, and mode from the sidebar. Features are enabled based on your permissions.</p>
        <button @click="showOnboarding = false">Got it!</button>
      </div>
  <CommunicationPanel v-if="userProfiles[activeUser].permissions.fullAccess" />
  <DeviceCard v-if="userProfiles[activeUser].permissions.deviceControl" />
  <DeviceControl v-if="userProfiles[activeUser].permissions.deviceControl" />
  <AnalyticsPanel :activity="activityLog" v-if="userProfiles[activeUser].permissions.analytics" />
    </div>
  </div>
</template>
<script>
import { generateTheme, generatePatternSVG, generateAvatarSVG, generateEmotionMeterSVG, generateWaveformSVG } from '../ui/visual/themeGenerator.js';
import { injectVisualCSS } from '../ui/visual/animationUtils.js';
import { adaptivePersonaEngine } from '../core/AdaptivePersonaEngine.js';
import { pluginRegistry } from '../core/PluginRegistry.js';
import { currentFingerprintSegments, experimentalBlocked, initConsent, recordConsent } from '../core/runtimeConsent.js';
import { getFirebaseApp, getCurrentFlavor, switchFlavor } from '../src/firebaseConfigManager.js';
import OnboardingCore from '../ui/components/OnboardingCore.vue';
import EmotionOverlay from '../ui/components/EmotionOverlay.vue';
import VoiceConsole from '../ui/components/VoiceConsole.vue';
import VoiceInputPanel from '../ui/components/VoiceInputPanel.vue';
import AccessibilityPanel from '../ui/components/AccessibilityPanel.vue';
import ThemeCustomizer from '../ui/components/ThemeCustomizer.vue';
import TaskPanel from '../ui/components/TaskPanel.vue';
import MemoryDashboard from '../ui/components/MemoryDashboard.vue';
import CreativityDashboard from '../ui/components/CreativityDashboard.vue';
import PersonaVisualization from '../ui/components/PersonaVisualization.vue';
import DeviceControlPanel from '../ui/components/DeviceControlPanel.vue';
import NotificationPanel from '../ui/components/NotificationPanel.vue';
import InsightCard from '../ui/components/InsightCard.vue';
import ConsentDialog from '../ui/components/ConsentDialog.vue';
import FeatureFlagsPanel from '../ui/components/FeatureFlagsPanel.vue';
import PluginRegistryPanel from '../ui/components/PluginRegistryPanel.vue';
import TransparencyPanel from '../ui/components/TransparencyPanel.vue';
import ChatBubble from '../ui/components/ChatBubble.vue';
import AnimatedAvatar from '../ui/components/AnimatedAvatar.vue';
import RealTimeChat from '../ui/components/RealTimeChat.vue';
import CommunicationPanel from '../ui/components/CommunicationPanel.vue';
import DeviceCard from '../ui/components/DeviceCard.vue';
import DeviceControl from '../ui/components/DeviceControl.vue';
import AnalyticsPanel from '../ui/components/AnalyticsPanel.vue';
import AuthPanel from '../ui/components/AuthPanel.vue';
export default {
  name: 'App',
  components: { OnboardingCore, EmotionOverlay, VoiceConsole, VoiceInputPanel, AccessibilityPanel, ThemeCustomizer, TaskPanel, MemoryDashboard, CreativityDashboard, PersonaVisualization, DeviceControlPanel, NotificationPanel, InsightCard, ConsentDialog, FeatureFlagsPanel, PluginRegistryPanel, TransparencyPanel, ChatBubble, AnimatedAvatar, RealTimeChat, CommunicationPanel, DeviceCard, DeviceControl, AnalyticsPanel, AuthPanel },
  data() {
    return {
      showOnboarding: true,
      onboarded: false,
      emotion: 'calm',
      emotionMessage: 'All clear.',
      detectedScenario: null,
      scenarioVerificationPending: false,
      scenarioCandidates: [],
      insight: 'Welcome to Sallie!',
      userProfile: null,
      hasFullAccess: false,
      tasks: [],
      theme: generateTheme('calm'),
      patternSVG: generatePatternSVG(800, 200, '#80deea'),
      avatarSVG: generateAvatarSVG(42, '#80deea'),
      emotionMeterSVG: generateEmotionMeterSVG(50, '#80deea'),
      voiceWaveformSVG: generateWaveformSVG([10,20,15,30,25,20,10,5,15,25], '#80deea'),
      chatMessages: [],
      activityLog: [],
      scenarios: ['stressed','focused','overwhelmed','conflict','celebration','creative','reflective','repair','choose','support','motivate','soothe','clarify'],
      consentRequired: false,
      consentReasons: [],
      experimentalWaveformBlocked: false,
      dependencyDiff: { added: [], removed: [], changed: [] },
      volatility: 0,
      dynamicGradientEnabled: false,
      showTransparency: false,
      lastDecision: null,
      lastProvenance: [],
      riskCalibration: null,
      adHocGoal: '',
      user: null,
      firebaseFlavor: getCurrentFlavor(),
  firebaseApp: getFirebaseApp(),
      selectedModel: 'claude',
      selectedMode: 'chat',
      activeUser: 'you',
      userProfiles: {
        you: { model: 'claude', mode: 'chat', chatMessages: [], preferences: {}, permissions: { fullAccess: true, deviceControl: true, memory: true, creativity: true, notifications: true, analytics: true } },
        austin: { model: 'gpt5', mode: 'agent', chatMessages: [], preferences: {}, permissions: { fullAccess: false, deviceControl: false, memory: false, creativity: true, notifications: true, analytics: false } },
        bella: { model: 'gemini', mode: 'chat', chatMessages: [], preferences: {}, permissions: { fullAccess: false, deviceControl: false, memory: false, creativity: true, notifications: true, analytics: false } }
      }
    };
  },
  methods: {
    setActiveUser(user) {
      this.activeUser = user;
      this.onUserChanged();
    },
    getAvatar(user) {
      if (user === 'you') return 'https://ui-avatars.com/api/?name=You&background=6366f1&color=fff';
      if (user === 'austin') return 'https://ui-avatars.com/api/?name=Austin&background=4f46e5&color=fff';
      if (user === 'bella') return 'https://ui-avatars.com/api/?name=Bella&background=80deea&color=fff';
      return 'https://ui-avatars.com/api/?name=User&background=888&color=fff';
    saveUserProfiles() {
      localStorage.setItem('sallie:userProfiles', JSON.stringify(this.userProfiles));
    loadUserProfiles() {
      const raw = localStorage.getItem('sallie:userProfiles');
      if (raw) {
        try {
          this.userProfiles = JSON.parse(raw);
        } catch {}
    sendChatMessage(message) {
      const user = this.activeUser;
      this.userProfiles[user].chatMessages.push({ sender: user, text: message, timestamp: Date.now() });
      this.saveUserProfiles();
      // Route to selected model and mode
      this.routeMessageToAI(message, this.userProfiles[user].model, this.userProfiles[user].mode, user);
    async routeMessageToAI(message, model, mode, user) {
      let response = '';
      try {
        if (model === 'claude') {
          if (mode === 'chat') response = await callClaude(message, 'chat');
          else if (mode === 'advisory') response = await claudeAdvancedReasoning(message);
          else if (mode === 'creative') response = await claudeSummarize(message);
          else if (mode === 'agent') response = await claudeToolUse(message, 'agent');
        } else if (model === 'perplexity') {
          if (mode === 'chat') response = await callPerplexity(message, 'chat');
          else if (mode === 'advisory') response = await perplexityMultiHopQA(message);
          else if (mode === 'creative') response = await perplexitySummarize(message);
          else if (mode === 'agent') response = await perplexityWebSearch(message);
        } else if (model === 'gemini') {
          if (mode === 'chat') response = await callGemini(message, 'chat');
          else if (mode === 'advisory') response = await geminiCreativeGeneration(message);
          else if (mode === 'creative') response = await geminiSummarize(message);
          else if (mode === 'agent') response = await geminiCodeGeneration(message);
        } else if (model === 'gpt5') {
          if (mode === 'chat') response = await sendGPTMessage(message);
          else if (mode === 'advisory') response = await gptCreativeWriting(message);
          else if (mode === 'creative') response = await gptSummarize(message);
          else if (mode === 'agent') response = await gptAgentAction(message);
        } else if (model === 'copilot') {
          if (mode === 'chat') response = await callCopilot(message, 'chat');
          else if (mode === 'advisory') response = await copilotAdvancedChat([{role:'user',content:message}]);
          else if (mode === 'creative') response = await copilotSummarize(message);
          else if (mode === 'agent') response = await copilotAgentAction(message);
        }
      } catch (e) {
        response = 'Error: ' + (e.message || e);
      this.userProfiles[user].chatMessages.push({ sender: 'sallie', text: typeof response === 'string' ? response : JSON.stringify(response), timestamp: Date.now() });
    onModelChanged() {
      this.userProfiles[this.activeUser].model = this.selectedModel;
    onModeChanged() {
      this.userProfiles[this.activeUser].mode = this.selectedMode;
    onUserChanged() {
      this.selectedModel = this.userProfiles[this.activeUser].model;
      this.selectedMode = this.userProfiles[this.activeUser].mode;
    routeMessageToAI(message, model, mode) {
      // TODO: Implement API integration for each model and mode
      // For now, simulate response
      let response = `[${model.toUpperCase()}][${mode}] Sallie says: ${message}`;
      this.chatMessages.push({ sender: 'sallie', text: response, timestamp: Date.now() });
      // Persist model selection if needed
      // Optionally reload model-specific settings
      // Persist mode selection if needed
      // Optionally reload mode-specific settings
    onFirebaseConfigChanged(flavor) {
      switchFlavor(flavor);
      this.firebaseFlavor = getCurrentFlavor();
      this.firebaseApp = getFirebaseApp();
      // Optionally reload/reconnect any data sources here
    onUserAuthenticated(user) {
      this.user = user;
    // ...existing methods...
  computed: {
    computedBackgroundStyle(){
      const base = { color: this.theme.text };
      if (!this.theme.gradient) { return { ...base, background: this.theme.background || '#111' }; }
      // auto_contrast logic
      return { ...base, background: this.theme.gradient };
    }
  created() {
  this.loadUserProfiles();
  const { decision } = initConsent(currentFingerprintSegments);
  this.consentRequired = decision.requireConsent;
  this.consentReasons = decision.reasons;
  this.experimentalWaveformBlocked = experimentalBlocked('exp_new_waveform');
  this.computeDependencyDiff();
  pluginRegistry.register({ id:'skill_memory', version:'1.0.0', capabilities:['memory','summarize'], enabled:true });
  pluginRegistry.register({ id:'skill_adaptive_persona', version:'1.0.0', capabilities:['persona','tone'], enabled:true });
  // onTraits logic
    capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
    updateVisuals() {
      const adj = adaptivePersonaEngine.adjust(this.emotion);
      // traitSnapshot logic
      const mood = adaptivePersonaEngine.deriveThemeMood(adj, {}, this.volatility);
      this.theme = generateTheme(mood);
      this.patternSVG = generatePatternSVG(800, 200, this.theme.accent);
      this.avatarSVG = generateAvatarSVG(42, this.theme.accent);
      this.emotionMeterSVG = generateEmotionMeterSVG(50, this.theme.accent);
      if (!this.experimentalWaveformBlocked) {
        this.voiceWaveformSVG = generateWaveformSVG([10,25,18,35,28,24,12,8,20,30], this.theme.accent);
      } else {
        this.voiceWaveformSVG = generateWaveformSVG([10,20,15,30,25,20,10,5,15,25], this.theme.accent);
      injectVisualCSS(this.theme.accent);
    computeEmpathyVolatilityMock(){
      this.volatility = (Math.sin(Date.now()/5000)+1)/2;
    enableHighContrast(){ /* a11yThemes logic */ },
    enableReducedMotion(){ /* a11yThemes logic */ },
    computeDependencyDiff() {
        const prevRaw = localStorage.getItem('sallie:lastFingerprint');
        if (!prevRaw) return;
        const prev = JSON.parse(prevRaw);
        const curr = currentFingerprintSegments;
        const prevList = Object.fromEntries(prev.dependenciesList || []);
        const currList = Object.fromEntries(curr.dependenciesList || []);
        const added = [];
        const removed = [];
        const changed = [];
        for (const name of Object.keys(currList)) {
          if (!(name in prevList)) added.push(name);
          else if (prevList[name] !== currList[name]) changed.push({ from: name + '@' + prevList[name], to: currList[name] });
        for (const name of Object.keys(prevList)) if (!(name in currList)) removed.push(name);
        this.dependencyDiff = { added, removed, changed };
      } catch { /* ignore */ }
    grantConsent() {
      recordConsent(currentFingerprintSegments);
      this.consentRequired = false;
      this.experimentalWaveformBlocked = experimentalBlocked('exp_new_waveform');
      this.computeDependencyDiff();
      this.dynamicGradientEnabled = true;
    declineConsent() { alert('Consent required to proceed with new configuration.'); },
    handleOnboarded(profile) {
      this.onboarded = true;
      this.userProfile = profile;
      this.tasks = profile && profile.tasks ? profile.tasks : [];
      this.hasFullAccess = profile && profile.name === 'Rachelle Friloux';
      if (profile && profile.persona) {
          // emotionMap logic
          this.emotion = profile.persona.toLowerCase();
          this.emotionMessage = 'Persona emotion set.';
        } catch {
          this.emotion = 'calm';
          this.emotionMessage = 'All clear.';
        this.updateVisuals();
      this.insight = `Hello ${profile.name}, Sallie is ready!`;
    respondToUser(userName, scenario = null) {
      if (scenario) {
        const map = { stressed: 'anger', overwhelmed: 'sad', celebration: 'joy', soothe: 'calm', motivate: 'focus', clarify: 'focus' };
        this.emotion = map[scenario] || 'calm';
        this.emotionMessage = `Scenario: ${scenario}`;
        adaptivePersonaEngine.record({ timestamp: Date.now(), emotion: this.emotion, scenario, intensity: 0.7 });
      this.updateVisuals();
    flagsUpdated(){ this.updateVisuals(); },
    toggleTransparency(){ this.showTransparency = !this.showTransparency; },
    async executeGoal(){
      if(!this.adHocGoal) return;
      // runGoal logic
      this.lastDecision = 'Goal executed.';
      this.lastProvenance = [];
      this.riskCalibration = 'Calibrated.';
      this.recordVolatilitySample({});
      this.emotion = 'happy';
      this.emotionMessage = 'Updated from goal';
      adaptivePersonaEngine.record({ timestamp: Date.now(), emotion: this.emotion, intensity: 0.6 });
    recordVolatilitySample(outcome){
        const key = 'sallie:sentimentSamples';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push({ t: Date.now(), p: 'positive' });
        while(arr.length>12) arr.shift();
        localStorage.setItem(key, JSON.stringify(arr));
        let transitions = 0;
        for(let i=1;i<arr.length;i++) if(arr[i].p!==arr[i-1].p) transitions++;
        this.volatility = arr.length>1 ? transitions/(arr.length-1) : 0;
  }
};
</script>
<style>
/* Sidebar and badges */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 180px;
  height: 100vh;
  background: #222;
  color: #fff;
  padding: 16px 8px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  z-index: 10;
}
.user-list {
  margin-bottom: 24px;
.user-entry {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s;
.user-entry.active {
  background: #6366f1;
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
.badge {
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
.badge-owner {
  background: #4f46e5;
.badge-guest {
  background: #888;
.badge-model {
  background: #80deea;
  color: #222;
.badge-mode {
.onboarding-tooltip {
  top: 60px;
  right: 40px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  z-index: 100;
/* Accessibility improvements */
body, #app {
  font-size: 1.1em;
  background: #111;
  color: #eee;
#app { font-family:'Inter',sans-serif; min-height:100vh; padding:32px; }
.scenario-bar { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
.scenario-bar button { background:#4f46e5; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:0.95em; margin-bottom:4px; }
@keyframes subtleGradientShift {
  0% { filter:brightness(100%); }
  50% { filter:brightness(105%); }
  100% { filter:brightness(100%); }
.dynamic-gradient-active { animation: subtleGradientShift 12s ease-in-out infinite; }
</style>
