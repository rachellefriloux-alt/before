/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Memory v2 Schema Definitions                                      │
 * │                                                                              │
 * │   Advanced memory structures with provenance, narrative graphs, emotional    │
 * │   tagging, and relationship tracking for comprehensive memory management     │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

export interface MemoryV2Item {
  id: string;
  type: 'episodic' | 'semantic' | 'emotional' | 'procedural' | 'narrative' | 'relationship';
  content: string;
  
  // Core metadata
  timestamp: Date;
  importance: number; // 0-1 scale
  confidence: number; // 0-1 scale
  tags: string[];
  emotionalTags: string[];
  
  // Provenance tracking
  provenance: MemoryProvenance;
  
  // Narrative and relationship linkage
  linkage: MemoryLinkage;
  
  // Access control and versioning
  accessControl: AccessControl;
  version: number;
  lastModified: Date;
  
  // Advanced features
  context?: Record<string, any>;
  associations?: string[];
  sensoryData?: SensoryData;
  locationData?: LocationData;
}

export interface MemoryProvenance {
  source: string;
  sourceType: 'user_input' | 'ai_inference' | 'external_api' | 'memory_consolidation' | 'auto_generated';
  createdAt: Date;
  createdBy: string;
  confidence: number;
  verificationLevel: 'unverified' | 'user_confirmed' | 'ai_validated' | 'cross_referenced';
  parentMemories?: string[];
  derivationMethod?: string;
  evidenceScore: number;
}

export interface MemoryLinkage {
  narrativeThread?: string;
  episodeChain?: string[];
  relationships?: MemoryRelationship[];
  semanticClusters?: string[];
  temporalSequence?: string[];
  causalConnections?: string[];
  associativeLinks?: string[];
}

export interface MemoryRelationship {
  targetMemoryId: string;
  relationshipType: 'causes' | 'supports' | 'contradicts' | 'elaborates' | 'precedes' | 'follows' | 'similar_to';
  strength: number; // 0-1 scale
  confidence: number;
  establishedAt: Date;
}

export interface AccessControl {
  ownerId: string;
  visibility: 'private' | 'shared' | 'public';
  permissions: string[];
  encryptionLevel: 'none' | 'basic' | 'advanced';
  retentionPolicy: RetentionPolicy;
}

export interface RetentionPolicy {
  maxAge?: number; // in milliseconds
  maxVersions?: number;
  archiveAfter?: number;
  deleteAfter?: number;
  consolidationRules?: string[];
}

export interface SensoryData {
  visual?: {
    imageUrl?: string;
    visualDescription?: string;
    colors?: string[];
    objects?: string[];
  };
  auditory?: {
    audioUrl?: string;
    transcription?: string;
    tone?: string;
    volume?: number;
  };
  contextual?: {
    environment?: string;
    mood?: string;
    energy?: string;
  };
}

export interface LocationData {
  coordinates?: { lat: number; lng: number };
  address?: string;
  context?: string;
  significance?: number;
}

// Narrative Graph Structures
export interface NarrativeNode {
  id: string;
  type: 'event' | 'person' | 'concept' | 'emotion' | 'goal' | 'conflict' | 'resolution';
  label: string;
  properties: Record<string, any>;
  memoryIds: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface NarrativeRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'leads_to' | 'caused_by' | 'involves' | 'resolves' | 'conflicts_with' | 'parallel_to';
  weight: number;
  properties: Record<string, any>;
  evidenceScore: number;
  createdAt: Date;
}

// Emotional Tagging
export interface EmotionalContext {
  primaryEmotion: string;
  emotionalIntensity: number;
  emotionalValence: number; // -1 to 1
  emotionalArousal: number; // 0 to 1
  secondaryEmotions?: string[];
  emotionalTriggers?: string[];
  emotionalOutcome?: string;
  moodBefore?: string;
  moodAfter?: string;
}

// Search and Query Interfaces
export interface MemoryQuery {
  text?: string;
  semanticSimilarity?: number;
  timeRange?: { start: Date; end: Date };
  importance?: { min: number; max: number };
  confidence?: { min: number; max: number };
  tags?: string[];
  emotionalTags?: string[];
  memoryTypes?: MemoryV2Item['type'][];
  narrativeThreads?: string[];
  relationships?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'importance' | 'confidence' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface MemorySearchResult {
  memory: MemoryV2Item;
  relevanceScore: number;
  matchReasons: string[];
  relatedMemories: string[];
  narrativeContext?: string[];
}

// Consolidation and Analysis
export interface ConsolidationRule {
  id: string;
  name: string;
  condition: (memories: MemoryV2Item[]) => boolean;
  action: (memories: MemoryV2Item[]) => MemoryV2Item[];
  priority: number;
  enabled: boolean;
}

export interface MemoryAnalytics {
  totalMemories: number;
  memoryTypeDistribution: Record<string, number>;
  averageImportance: number;
  averageConfidence: number;
  narrativeThreadCount: number;
  relationshipCount: number;
  emotionalDistribution: Record<string, number>;
  topTags: Array<{ tag: string; count: number }>;
  memoryGrowthRate: number;
  consolidationStats: {
    lastRun: Date;
    memoriesConsolidated: number;
    duplicatesRemoved: number;
    relationshipsCreated: number;
  };
}

// Backup and Recovery
export interface MemoryBackup {
  id: string;
  timestamp: Date;
  version: string;
  memories: MemoryV2Item[];
  narrativeNodes: NarrativeNode[];
  narrativeRelationships: NarrativeRelationship[];
  analytics: MemoryAnalytics;
  checksum: string;
}

// Default configurations
export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  maxVersions: 5,
  archiveAfter: 90 * 24 * 60 * 60 * 1000, // 3 months
  deleteAfter: 730 * 24 * 60 * 60 * 1000, // 2 years
  consolidationRules: ['duplicate_removal', 'semantic_clustering', 'temporal_grouping'],
};

export const DEFAULT_ACCESS_CONTROL: AccessControl = {
  ownerId: 'user',
  visibility: 'private',
  permissions: ['read', 'write', 'delete'],
  encryptionLevel: 'basic',
  retentionPolicy: DEFAULT_RETENTION_POLICY,
};

export const MEMORY_TYPES = [
  'episodic',
  'semantic', 
  'emotional',
  'procedural',
  'narrative',
  'relationship',
] as const;

export const NARRATIVE_NODE_TYPES = [
  'event',
  'person',
  'concept',
  'emotion',
  'goal',
  'conflict',
  'resolution',
] as const;

export const RELATIONSHIP_TYPES = [
  'causes',
  'supports', 
  'contradicts',
  'elaborates',
  'precedes',
  'follows',
  'similar_to',
] as const;