/*
 * Persona: Tough love meets soul care.
 * Module: storage
 * Intent: Handle functionality for storage
 * Provenance-ID: 46d12973-478e-4356-a591-dd936fc1e41b
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Source: SalleCompanion-1/server/storage.ts (migrated 2025-08-27)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { User, InsertUser, Conversation, InsertConversation, Task, InsertTask, Memory, InsertMemory, PersonaState, InsertPersonaState } from "../../../shared/src/schema";
// Simple UUID generator for React Native compatibility
function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface IStorage {
  // User management
  getUser?(id: string): Promise<User | undefined>;
  createUser?(user: InsertUser): Promise<User>;
  updateUser?(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser?(id: string): Promise<boolean>;

  // Conversation management
  getConversation?(id: string): Promise<Conversation | undefined>;
  createConversation?(conversation: InsertConversation): Promise<Conversation>;
  updateConversation?(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation?(id: string): Promise<boolean>;
  getUserConversations?(userId: string): Promise<Conversation[]>;

  // Task management
  getTask?(id: string): Promise<Task | undefined>;
  createTask?(task: InsertTask): Promise<Task>;
  updateTask?(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask?(id: string): Promise<boolean>;
  getUserTasks?(userId: string): Promise<Task[]>;

  // Memory management
  getMemory?(id: string): Promise<Memory | undefined>;
  createMemory?(memory: InsertMemory): Promise<Memory>;
  updateMemory?(id: string, updates: Partial<Memory>): Promise<Memory | undefined>;
  deleteMemory?(id: string): Promise<boolean>;
  getUserMemories?(userId: string): Promise<Memory[]>;

  // Persona state management
  getPersonaState?(userId: string): Promise<PersonaState | undefined>;
  createPersonaState?(personaState: InsertPersonaState): Promise<PersonaState>;
  updatePersonaState?(userId: string, updates: Partial<PersonaState>): Promise<PersonaState | undefined>;
  deletePersonaState?(userId: string): Promise<boolean>;
}

export class MemStorage {
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private tasks: Map<string, Task> = new Map();
  private memories: Map<string, Memory> = new Map();
  private personaStates: Map<string, PersonaState> = new Map();

  constructor() {
    // Initialize default users
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const defaultUsers = [
      {
        username: "you",
        email: "you@example.com",
        firebaseUid: "default-you",
        permissions: { fullAccess: true, memory: true, creativity: true, deviceControl: true, notifications: true, analytics: true },
        profile: { name: "You", avatar: "https://pixabay.com/get/gb5d05698b2a3d1d8af44cd36215543d55b53b18d345d3d712f2e8dfd90881b6bcca03dd0d80a84167e321efcf1ccee8b7a67813a7fcb4824d54890d48da99a74_1280.jpg" }
      },
      {
        username: "austin",
        email: "austin@example.com",
        firebaseUid: "default-austin",
        permissions: { fullAccess: true, memory: true, creativity: true, deviceControl: true, notifications: true, analytics: true },
        profile: { name: "Austin", avatar: "https://pixabay.com/get/gc8b1e7e8b2a3d1d8af44cd36215543d55b53b18d345d3d712f2e8dfd90881b6bcca03dd0d80a84167e321efcf1ccee8b7a67813a7fcb4824d54890d48da99a74_1280.jpg" }
      }
    ];
    // ...existing code to add default users...
  }
  // ...existing code for storage methods...
}
