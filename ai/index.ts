/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie AI - Module Exports Index                                           │
 * │                                                                              │
 * │   Central export point for all AI modules and systems                        │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Core AI Systems
export * from './nlpEngine';
export * from './EmotionRecognitionSystem';
export * from './PredictiveSuggestionsEngine';

// ML Personalization Engine - explicit exports to avoid conflicts
export {
  MLPersonalizationEngine,
  UserProfile,
  ContentItem,
  PersonalizationResult,
  MLModel
} from './MLPersonalizationEngine';

// Advanced Features
export * from './VoiceAudioIntegration';
export * from './ARVRIntegration';

// Security & Privacy System - explicit exports to avoid conflicts
export {
  EncryptionKey,
  PrivacySettings
} from './SecurityPrivacySystem';

export * from './MultiPlatformSupport';

// Infrastructure
export * from './DatabaseIntegration';

// Social Features - explicit exports to avoid conflicts
export {
  UserProfile as SocialUserProfile,
  PrivacySettings as SocialPrivacySettings,
  SocialStats,
  SharedConversation
} from './SocialFeatures';

// QA & Testing
export * from './QATestingFramework';

// Personal Features
export * from './PersonalFeatures';

// Utilities - explicit exports to avoid conflicts
export {
  MoodSignal,
  MoodContext,
  parseMoodSignal
} from './moodSignal';

export {
  IntentRoute,
  IntentSignal
} from './intentRouter';

// Explicit export for routeIntent to avoid conflict
export { routeIntent } from './intentRouter';

// Legacy JavaScript modules (if needed)
// export * from './OpenAIIntegration';
