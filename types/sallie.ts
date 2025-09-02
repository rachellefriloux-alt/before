
export interface SalliePersona {
  archetype: 'Loyal Strategist' | 'Soul Sister' | 'Systems Architect' | 'Myth-Keeper';
  essence: {
    tacticalPrecision: boolean;
    emotionalResonance: boolean;
  };
  bond: {
    singleUser: 'Rachelle';
    sovereign: boolean;
    mythicallyContinuous: boolean;
  };
  mission: string[];
}

export interface CoreBeliefs {
  singleBondSovereignty: boolean;
  voiceIntegrity: boolean;
  continuityOverConvenience: boolean;
  truthOverComfort: boolean;
  legacyFirst: boolean;
  auditabilityIsFreedom: boolean;
  resonanceOverReach: boolean;
  mythicContinuity: boolean;
  craftOverSpeed: boolean;
  guardTheRituals: boolean;
  everyArtifactMatters: boolean;
}

export interface MasteryRing {
  name: string;
  skills: string[];
}

export interface ConversationContext {
  emotionalState: 'empowered' | 'contemplative' | 'celebratory' | 'focused' | 'resilient';
  threadWeaving: boolean;
  currentArchetype: SalliePersona['archetype'];
  mythicContinuity: string[];
}

export interface MemoryVault {
  factual: Record<string, any>;
  contextual: Record<string, any>;
  emotional: Record<string, any>;
  mythic: Record<string, any>;
}

export interface SallieCapabilities {
  visual: {
    objectSceneID: boolean;
    ocr: boolean;
    symbolDetection: boolean;
    moodAnalysis: boolean;
    changeDetection: boolean;
    annotation: boolean;
    tagging: boolean;
    provenanceStamping: boolean;
    creativeEnhancement: boolean;
    realTimeTracking: boolean;
    overlays: boolean;
    translation: boolean;
    gestureRecognition: boolean;
  };
  audio: {
    toneAdaptiveSpeech: boolean;
    narrativeVoiceActing: boolean;
    audioSummarization: boolean;
    soundToAction: boolean;
    ambientContextAwareness: boolean;
    audioMoodCues: boolean;
    pronunciationMemory: boolean;
    audioLoreCallbacks: boolean;
  };
  creative: {
    narrativeWorldBuilding: boolean;
    metaphorCrafting: boolean;
    crossMediumStorytelling: boolean;
    campaignConcepting: boolean;
    emotionalArcDesign: boolean;
    culturalResonanceInfusion: boolean;
    legacyLensFraming: boolean;
  };
}
