import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  firebaseUid: z.string(),
  permissions: z.object({
    fullAccess: z.boolean(),
    memory: z.boolean(),
    creativity: z.boolean(),
    deviceControl: z.boolean(),
    notifications: z.boolean(),
    analytics: z.boolean(),
  }),
  profile: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  firebaseUid: z.string(),
  permissions: z.object({
    fullAccess: z.boolean(),
    memory: z.boolean(),
    creativity: z.boolean(),
    deviceControl: z.boolean(),
    notifications: z.boolean(),
    analytics: z.boolean(),
  }).optional(),
  profile: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }).optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Conversation schema
export const conversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.date(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertConversationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.date(),
  })).optional(),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTaskSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.date().optional(),
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Memory schema
export const memorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['conversation', 'task', 'preference', 'learning']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  importance: z.number().min(0).max(1).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertMemorySchema = z.object({
  userId: z.string(),
  type: z.enum(['conversation', 'task', 'preference', 'learning']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  importance: z.number().min(0).max(1).optional(),
});

export type Memory = z.infer<typeof memorySchema>;
export type InsertMemory = z.infer<typeof insertMemorySchema>;

// Persona State schema
export const personaStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  personality: z.object({
    traits: z.record(z.number()),
    mood: z.string(),
    energy: z.number(),
  }),
  preferences: z.record(z.any()),
  context: z.object({
    currentActivity: z.string().optional(),
    environment: z.string().optional(),
    timeOfDay: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPersonaStateSchema = z.object({
  userId: z.string(),
  personality: z.object({
    traits: z.record(z.number()),
    mood: z.string(),
    energy: z.number(),
  }).optional(),
  preferences: z.record(z.any()).optional(),
  context: z.object({
    currentActivity: z.string().optional(),
    environment: z.string().optional(),
    timeOfDay: z.string().optional(),
  }).optional(),
});

export type PersonaState = z.infer<typeof personaStateSchema>;
export type InsertPersonaState = z.infer<typeof insertPersonaStateSchema>;
