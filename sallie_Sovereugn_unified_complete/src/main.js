/*
 * Persona: Tough love meets soul care.
 * Module: main
 * Intent: Handle functionality for main
 * Provenance-ID: 25d57cdb-17d7-4a67-9e12-e2ca7674371d
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import { createApp } from 'vue';
import App from './App.vue';

// Import Firebase configuration
import { initializeApp as initializeFirebaseApp } from 'firebase/app';
import firebaseConfig from './config/firebase-config.local.json';

// Import AI integration functions
import { callClaude, claudeSummarize, claudeAdvancedReasoning, claudeToolUse } from './ai/integrations/ClaudeIntegration.js';
import { callPerplexity, perplexityWebSearch, perplexityMultiHopQA, perplexitySummarize, perplexityDocumentAnalysis } from './ai/integrations/PerplexityIntegration.js';
import { callGemini, geminiMultimodal, geminiCreativeGeneration, geminiSummarize, geminiCodeGeneration } from './ai/integrations/GeminiIntegration.js';
import { sendGPTMessage, gptAdvancedChat, gptCreativeWriting, gptSummarize, gptCodeGeneration, gptAgentAction } from './ai/integrations/GPTIntegration.js';
import { callCopilot, generateCopilotCode, copilotTaskAutomation, copilotAdvancedChat, copilotCodeReview, copilotSummarize, copilotAgentAction } from './ai/integrations/CopilotIntegration.js';

// Import core modules
import AdaptivePersonaEngine from './core/AdaptivePersonaEngine.js';
import PersonalityBridge from './core/PersonalityBridge.js';
import { EmotionalIntelligence } from './ai/EmotionalIntelligence.js';
import AutonomousTaskSystem from './feature/src/AutonomousTaskSystem.js';
import AutonomousProgrammingSystem from './feature/src/AutonomousProgrammingSystem.js';
import AdvancedLanguageUnderstanding from './feature/src/AdvancedLanguageUnderstanding.js';
import AdvancedMemorySystem from './feature/src/AdvancedMemorySystem.js';
import CreativeResourcefulSystem from './feature/src/CreativeResourcefulSystem.js';

// Import missing UI components
import CameraVision from './ui/components/CameraVision.vue';
import AnalyticsPanel from './ui/components/AnalyticsPanel.vue';

// Performance optimization: Lazy load heavy AI integrations (keeping for future use)
// const loadAIIntegrations = () => import('./ai/integrations/ClaudeIntegration.js');
// const loadPerplexityIntegrations = () => import('./ai/integrations/PerplexityIntegration.js');
// const loadGeminiIntegrations = () => import('./ai/integrations/GeminiIntegration.js');
// const loadGPTIntegrations = () => import('./ai/integrations/GPTIntegration.js');
// const loadCopilotIntegrations = () => import('./ai/integrations/CopilotIntegration.js');

// Lazy load core modules (keeping for future use)
// const loadAdaptivePersonaEngine = () => import('./core/AdaptivePersonaEngine.js');
// const loadPersonalityBridge = () => import('./core/PersonalityBridge.js');
// const loadEmotionalIntelligence = () => import('./ai/EmotionalIntelligence.js');
// const loadAutonomousSystems = () => import('./feature/src/AutonomousTaskSystem.js');
// const loadAdvancedSystems = () => import('./feature/src/AdvancedLanguageUnderstanding.js');

// Lazy load UI components (keeping for future use)
// const loadCameraVision = () => import('./ui/components/CameraVision.vue');
// const loadAnalyticsPanel = () => import('./ui/components/AnalyticsPanel.vue');
import CommunicationPanel from './ui/components/CommunicationPanel.vue';
import CreativityDashboard from './ui/components/CreativityDashboard.vue';
import DeviceControlPanel from './ui/components/DeviceControlPanel.vue';
import MemoryDashboard from './ui/components/MemoryDashboard.vue';
import NotificationPanel from './ui/components/NotificationPanel.vue';
import PersonaVisualization from './ui/components/PersonaVisualization.vue';
import VoiceInputPanel from './ui/components/VoiceInputPanel.vue';
import AccessibilityPanel from './ui/components/AccessibilityPanel.vue';
import ThemeCustomizer from './ui/components/ThemeCustomizer.vue';
import TransparencyPanel from './ui/components/TransparencyPanel.vue';

// Create Vue app
const app = createApp(App);

// Initialize Firebase
let firebaseApp = null;
try {
    firebaseApp = initializeFirebaseApp(firebaseConfig);
    app.provide('firebaseApp', firebaseApp);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.warn('Firebase initialization failed:', error);
}

// Register global components
app.component('AuthPanel', AuthPanel);
app.component('CameraVision', CameraVision);
app.component('AnalyticsPanel', AnalyticsPanel);
app.component('CommunicationPanel', CommunicationPanel);
app.component('CreativityDashboard', CreativityDashboard);
app.component('DeviceControlPanel', DeviceControlPanel);
app.component('MemoryDashboard', MemoryDashboard);
app.component('NotificationPanel', NotificationPanel);
app.component('PersonaVisualization', PersonaVisualization);
app.component('VoiceInputPanel', VoiceInputPanel);
app.component('AccessibilityPanel', AccessibilityPanel);
app.component('ThemeCustomizer', ThemeCustomizer);
app.component('TransparencyPanel', TransparencyPanel);

// Provide global services
app.provide('aiServices', {
    claude: { callClaude, claudeSummarize, claudeAdvancedReasoning, claudeToolUse },
    perplexity: { callPerplexity, perplexityWebSearch, perplexityMultiHopQA, perplexitySummarize, perplexityDocumentAnalysis },
    gemini: { callGemini, geminiMultimodal, geminiCreativeGeneration, geminiSummarize, geminiCodeGeneration },
    gpt: { sendGPTMessage, gptAdvancedChat, gptCreativeWriting, gptSummarize, gptCodeGeneration, gptAgentAction },
    copilot: { callCopilot, generateCopilotCode, copilotTaskAutomation, copilotAdvancedChat, copilotCodeReview, copilotSummarize, copilotAgentAction }
});

app.provide('coreModules', {
    SallieBrain,
    AdaptivePersonaEngine,
    PersonalityBridge,
    EmotionalIntelligence,
    AutonomousTaskSystem,
    AutonomousProgrammingSystem,
    AdvancedLanguageUnderstanding,
    AdvancedMemorySystem,
    CreativeResourcefulSystem
});

// Mount the app
app.mount('#app');

// Initialize Sallie application after Vue is mounted
import('./app.js').then(({ SallieApp }) => {
    const sallieApp = new SallieApp();
    window.sallieApp = sallieApp;

    // Initialize all systems
    sallieApp.initialize().then(() => {
        console.log('Sallie application initialized successfully');

        // Initialize additional modules
        if (window.sallieApp.emotionModule) {
            window.sallieApp.emotionModule.initialize().catch(console.error);
        }
        if (window.sallieApp.taskSystem) {
            window.sallieApp.taskSystem.initialize().catch(console.error);
        }
        if (window.sallieApp.programmingSystem) {
            window.sallieApp.programmingSystem.initialize().catch(console.error);
        }
        if (window.sallieApp.languageSystem) {
            window.sallieApp.languageSystem.initialize().catch(console.error);
        }
        if (window.sallieApp.memorySystem) {
            window.sallieApp.memorySystem.initialize().catch(console.error);
        }
        if (window.sallieApp.creativitySystem) {
            window.sallieApp.creativitySystem.initialize().catch(console.error);
        }
    }).catch(error => {
        console.error('Failed to initialize Sallie application:', error);
    });
}).catch(error => {
    console.error('Failed to load Sallie app:', error);
});

export default app;
