/*
 * Persona: Tough love meets soul care.
 * Module: storage
 * Intent: Handle functionality for storage
 * Provenance-ID: 555418cd-2b70-4788-98ed-bc8500b967c2
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Source: SalleCompanion-1/server/storage.ts (migrated 2025-08-27)

import type { User, InsertUser, Conversation, InsertConversation, Task, InsertTask, Memory, InsertMemory, PersonaState, InsertPersonaState } from "../../shared/src/schema";
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
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Conversation management
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
  getUserConversations(userId: string): Promise<Conversation[]>;

  // Task management
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getUserTasks(userId: string): Promise<Task[]>;

  // Memory management
  getMemory(id: string): Promise<Memory | undefined>;
  createMemory(memory: InsertMemory): Promise<Memory>;
  updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | undefined>;
  deleteMemory(id: string): Promise<boolean>;
  getUserMemories(userId: string): Promise<Memory[]>;

  // Persona state management
  getPersonaState(userId: string): Promise<PersonaState | undefined>;
  createPersonaState(personaState: InsertPersonaState): Promise<PersonaState>;
  updatePersonaState(userId: string, updates: Partial<PersonaState>): Promise<PersonaState | undefined>;
  deletePersonaState(userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
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
    const defaultUsers = [
      {
        id: "user-1",
        username: "you",
        email: "you@example.com",
        firebaseUid: "default-you",
        permissions: { fullAccess: true, memory: true, creativity: true, deviceControl: true, notifications: true, analytics: true },
        profile: { name: "You", avatar: "https://pixabay.com/get/gb5d05698b2a3d1d8af44cd36215543d55b53b18d345d3d712f2e8dfd90881b6bcca03dd0d80a84167e321efcf1ccee8b7a67813a7fcb4824d54890d48da99a74_1280.jpg" },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "user-2",
        username: "austin",
        email: "austin@example.com",
        firebaseUid: "default-austin",
        permissions: { fullAccess: true, memory: true, creativity: true, deviceControl: true, notifications: true, analytics: true },
        profile: { name: "Austin", avatar: "https://pixabay.com/get/gc8b1e7e8b2a3d1d8af44cd36215543d55b53b18d345d3d712f2e8dfd90881b6bcca03dd0d80a84167e321efcf1ccee8b7a67813a7fcb4824d54890d48da99a74_1280.jpg" },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const user of defaultUsers) {
      this.users.set(user.id, user as User);
    }
  }

  // User management methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Conversation management methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const newConversation: Conversation = {
      id: randomUUID(),
      ...conversation,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Conversation;

    this.conversations.set(newConversation.id, newConversation);
    return newConversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const existingConversation = this.conversations.get(id);
    if (!existingConversation) return undefined;

    const updatedConversation = { ...existingConversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.userId === userId);
  }

  // Task management methods
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: randomUUID(),
      ...task,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Task;

    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask = { ...existingTask, ...updates, updatedAt: new Date() };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  // Memory management methods
  async getMemory(id: string): Promise<Memory | undefined> {
    return this.memories.get(id);
  }

  async createMemory(memory: InsertMemory): Promise<Memory> {
    const newMemory: Memory = {
      id: randomUUID(),
      ...memory,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Memory;

    this.memories.set(newMemory.id, newMemory);
    return newMemory;
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | undefined> {
    const existingMemory = this.memories.get(id);
    if (!existingMemory) return undefined;

    const updatedMemory = { ...existingMemory, ...updates, updatedAt: new Date() };
    this.memories.set(id, updatedMemory);
    return updatedMemory;
  }

  async deleteMemory(id: string): Promise<boolean> {
    return this.memories.delete(id);
  }

  async getUserMemories(userId: string): Promise<Memory[]> {
    return Array.from(this.memories.values()).filter(memory => memory.userId === userId);
  }

  // Persona state management methods
  async getPersonaState(userId: string): Promise<PersonaState | undefined> {
    return this.personaStates.get(userId);
  }

  async createPersonaState(personaState: InsertPersonaState): Promise<PersonaState> {
    const newPersonaState: PersonaState = {
      id: randomUUID(),
      ...personaState,
      createdAt: new Date(),
      updatedAt: new Date()
    } as PersonaState;

    this.personaStates.set(personaState.userId, newPersonaState);
    return newPersonaState;
  }

  async updatePersonaState(userId: string, updates: Partial<PersonaState>): Promise<PersonaState | undefined> {
    const existingPersonaState = this.personaStates.get(userId);
    if (!existingPersonaState) return undefined;

    const updatedPersonaState = { ...existingPersonaState, ...updates, updatedAt: new Date() };
    this.personaStates.set(userId, updatedPersonaState);
    return updatedPersonaState;
  }

  async deletePersonaState(userId: string): Promise<boolean> {
    return this.personaStates.delete(userId);
  }
}
