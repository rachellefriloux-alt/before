/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Functexport interface MemorySearchParams {
  type?: MemoryType;
  priority?: MemoryPriority;
  contentKeywords?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  limit?: number;
  fuzzySearch?: boolean;
  semanticQuery?: string;
  contextFilters?: {
    location?: string;
    activity?: string;
    emotion?: string;
    associatedPersons?: string[];
  };
  sortBy?: 'timestamp' | 'importance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}efinitions for the memory management system.
 * Got it, love.
 */

export enum MemoryType {
  FACT = 'FACT',
  PREFERENCE = 'PREFERENCE',
  QUICK_CAPTURE = 'QUICK_CAPTURE',
  PERSON = 'PERSON',
  TASK = 'TASK',
  EMOTION = 'EMOTION'
}

export enum MemoryPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  createdAt: string;
  priority: MemoryPriority;
  tags?: string[];
  associatedMemories?: string[];
  modifiedAt?: string;
  emotionalContext?: {
    sentiment: number;
    intensity: number;
  };
  // Extended fields for specific memory types
  personData?: PersonData;
  taskData?: TaskData;
  emotionData?: EmotionData;
  // Additional properties for compatibility
  timestamp?: number;
  importance?: number;
  context?: {
    location?: string;
    activity?: string;
    emotion?: string;
    associatedPersons?: string[];
  };
}

export interface PersonData {
  name: string;
  relationship: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  birthday?: string;
  notes?: string;
  lastInteraction?: string;
}

export interface TaskData {
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  category?: string;
  subtasks?: string[];
}

export interface EmotionData {
  emotion: string;
  intensity: number; // 1-10 scale
  trigger?: string;
  context?: string;
  duration?: number; // minutes
  copingStrategies?: string[];
}

export interface MemorySearchParams {
  type?: MemoryType;
  priority?: MemoryPriority;
  contentKeywords?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  limit?: number;
  fuzzySearch?: boolean;
  semanticQuery?: string;
  contextFilters?: {
    location?: string;
    activity?: string;
    emotion?: string;
    associatedPersons?: string[];
  };
  sortBy?: 'timestamp' | 'importance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions {
  limit?: number;
  sortBy?: 'timestamp' | 'importance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  type?: MemoryType;
  fromDate?: number;
  toDate?: number;
  importance?: number;
  tags?: string[];
  contentKeywords?: string[];
  fuzzySearch?: boolean;
  semanticQuery?: string;
  contextFilters?: {
    location?: string;
    activity?: string;
    emotion?: string;
    associatedPersons?: string[];
  };
}

export interface MemoryItem extends Memory {
  // MemoryItem is an alias for Memory for backward compatibility
}
