/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Type definitions for the memory management system.
 * Got it, love.
 */

export enum MemoryType {
  FACT = 'FACT',
  PREFERENCE = 'PREFERENCE',
  QUICK_CAPTURE = 'QUICK_CAPTURE'
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
}
