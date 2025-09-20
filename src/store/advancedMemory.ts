import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  timestamp: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  
  // Enhanced context
  emotionalContext: {
    userEmotion: string;
    aiEmotion: string;
    intensity: number;
  };
  
  // Metadata
  metadata: {
    provider?: string;
    processingTime?: number;
    confidence?: number;
    tokens?: { input: number; output: number };
    reasoning?: string;
  };
  
  // Relationships
  replyTo?: string;
  topics: string[];
  entities: string[];
  importance: number; // 0-1 scale
  
  // Memory classification
  memoryType: 'working' | 'episodic' | 'semantic' | 'emotional' | 'procedural';
  archived: boolean;
}

export interface ConversationThread {
  id: string;
  title: string;
  startTime: number;
  lastActivity: number;
  messageCount: number;
  
  // Context
  topics: string[];
  entities: string[];
  emotionalArc: { timestamp: number; emotion: string; intensity: number }[];
  
  // Metadata
  quality: number;
  importance: number;
  category: 'personal' | 'work' | 'creative' | 'support' | 'learning' | 'casual';
  archived: boolean;
  
  // Relationships
  relatedThreads: string[];
  parentThread?: string;
  childThreads: string[];
}

export interface MemoryCluster {
  id: string;
  name: string;
  description: string;
  
  // Content
  messages: string[]; // Message IDs
  concepts: string[];
  patterns: any[];
  
  // Temporal
  timeRange: { start: number; end: number };
  lastAccessed: number;
  accessCount: number;
  
  // Quality
  coherence: number;
  relevance: number;
  emotional_significance: number;
  
  // Relationships
  relatedClusters: string[];
  subClusters: string[];
  parentCluster?: string;
}

export interface ConversationContext {
  currentThread: string | null;
  activeTopics: string[];
  recentEntities: string[];
  emotionalHistory: Array<{ timestamp: number; emotion: string; intensity: number }>;
  conversationGoal?: string;
  userIntent: string;
  contextWindow: ConversationMessage[];
}

export interface AdvancedMemoryStore {
  // Core data
  messages: Record<string, ConversationMessage>;
  threads: Record<string, ConversationThread>;
  clusters: Record<string, MemoryCluster>;
  
  // Current context
  context: ConversationContext;
  
  // Settings
  settings: {
    maxMessagesInMemory: number;
    contextWindowSize: number;
    autoArchiveAfterDays: number;
    memoryCompressionEnabled: boolean;
    emotionalMemoryEnabled: boolean;
    semanticSearchEnabled: boolean;
  };
  
  // Actions
  addMessage: (message: Omit<ConversationMessage, 'id'>) => string;
  updateMessage: (id: string, updates: Partial<ConversationMessage>) => void;
  deleteMessage: (id: string) => void;
  
  createThread: (title: string, category?: ConversationThread['category']) => string;
  updateThread: (id: string, updates: Partial<ConversationThread>) => void;
  archiveThread: (id: string) => void;
  deleteThread: (id: string) => void;
  
  setCurrentThread: (threadId: string | null) => void;
  addTopicToContext: (topic: string) => void;
  updateEmotionalContext: (emotion: string, intensity: number) => void;
  
  // Advanced operations
  searchMessages: (query: string, options?: SearchOptions) => ConversationMessage[];
  getRelatedMessages: (messageId: string, limit?: number) => ConversationMessage[];
  getContextualMessages: (limit?: number) => ConversationMessage[];
  
  generateMemoryCluster: (messageIds: string[]) => string;
  getRelevantClusters: (query: string) => MemoryCluster[];
  
  // Memory management
  compressOldMemories: () => Promise<void>;
  exportConversation: (threadId: string) => Promise<string>;
  importConversation: (data: string) => Promise<void>;
  
  // Analytics
  getConversationStats: () => any;
  getEmotionalInsights: () => any;
  getTopicTrends: () => any;
}

interface SearchOptions {
  timeRange?: { start: number; end: number };
  emotions?: string[];
  topics?: string[];
  minImportance?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'importance' | 'relevance';
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useAdvancedMemoryStore = create<AdvancedMemoryStore>()(
  persist(
    (set, get) => ({
      messages: {},
      threads: {},
      clusters: {},
      
      context: {
        currentThread: null,
        activeTopics: [],
        recentEntities: [],
        emotionalHistory: [],
        userIntent: 'general',
        contextWindow: [],
      },
      
      settings: {
        maxMessagesInMemory: 10000,
        contextWindowSize: 20,
        autoArchiveAfterDays: 30,
        memoryCompressionEnabled: true,
        emotionalMemoryEnabled: true,
        semanticSearchEnabled: true,
      },

      addMessage: (messageData) => {
        const id = generateId();
        const message: ConversationMessage = {
          ...messageData,
          id,
          timestamp: messageData.timestamp || Date.now(),
          topics: messageData.topics || [],
          entities: messageData.entities || [],
          importance: messageData.importance || 0.5,
          memoryType: messageData.memoryType || 'working',
          archived: false,
        };

        set((state) => {
          const newMessages = { ...state.messages, [id]: message };
          
          // Update context window
          const contextWindow = [...state.context.contextWindow, message]
            .slice(-state.settings.contextWindowSize);
          
          // Update thread
          const threadId = message.conversationId;
          let updatedThreads = state.threads;
          if (threadId && state.threads[threadId]) {
            const thread = state.threads[threadId];
            updatedThreads = {
              ...state.threads,
              [threadId]: {
                ...thread,
                lastActivity: message.timestamp,
                messageCount: thread.messageCount + 1,
                topics: Array.from(new Set([...thread.topics, ...message.topics])),
                entities: Array.from(new Set([...thread.entities, ...message.entities])),
                emotionalArc: [
                  ...thread.emotionalArc,
                  {
                    timestamp: message.timestamp,
                    emotion: message.emotionalContext.userEmotion,
                    intensity: message.emotionalContext.intensity,
                  }
                ].slice(-50), // Keep last 50 emotional states
              }
            };
          }
          
          return {
            messages: newMessages,
            threads: updatedThreads,
            context: {
              ...state.context,
              contextWindow,
            }
          };
        });

        return id;
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [id]: { ...state.messages[id], ...updates }
          }
        }));
      },

      deleteMessage: (id) => {
        set((state) => {
          const { [id]: deleted, ...remainingMessages } = state.messages;
          return { messages: remainingMessages };
        });
      },

      createThread: (title, category = 'casual') => {
        const id = generateId();
        const thread: ConversationThread = {
          id,
          title,
          startTime: Date.now(),
          lastActivity: Date.now(),
          messageCount: 0,
          topics: [],
          entities: [],
          emotionalArc: [],
          quality: 0.5,
          importance: 0.5,
          category,
          archived: false,
          relatedThreads: [],
          childThreads: [],
        };

        set((state) => ({
          threads: { ...state.threads, [id]: thread }
        }));

        return id;
      },

      updateThread: (id, updates) => {
        set((state) => ({
          threads: {
            ...state.threads,
            [id]: { ...state.threads[id], ...updates }
          }
        }));
      },

      archiveThread: (id) => {
        set((state) => ({
          threads: {
            ...state.threads,
            [id]: { ...state.threads[id], archived: true }
          }
        }));
      },

      deleteThread: (id) => {
        set((state) => {
          const { [id]: deleted, ...remainingThreads } = state.threads;
          
          // Also delete associated messages
          const messagesToDelete = Object.keys(state.messages).filter(
            msgId => state.messages[msgId].conversationId === id
          );
          
          const remainingMessages = { ...state.messages };
          messagesToDelete.forEach(msgId => delete remainingMessages[msgId]);
          
          return { 
            threads: remainingThreads,
            messages: remainingMessages
          };
        });
      },

      setCurrentThread: (threadId) => {
        set((state) => ({
          context: { ...state.context, currentThread: threadId }
        }));
      },

      addTopicToContext: (topic) => {
        set((state) => ({
          context: {
            ...state.context,
            activeTopics: Array.from(new Set([...state.context.activeTopics, topic])).slice(-10)
          }
        }));
      },

      updateEmotionalContext: (emotion, intensity) => {
        set((state) => ({
          context: {
            ...state.context,
            emotionalHistory: [
              ...state.context.emotionalHistory,
              { timestamp: Date.now(), emotion, intensity }
            ].slice(-20)
          }
        }));
      },

      searchMessages: (query, options = {}) => {
        const state = get();
        const messages = Object.values(state.messages);
        
        let filtered = messages.filter(msg => {
          // Text search
          const textMatch = msg.content.toLowerCase().includes(query.toLowerCase());
          
          // Time range filter
          if (options.timeRange) {
            const inTimeRange = msg.timestamp >= options.timeRange.start && 
                              msg.timestamp <= options.timeRange.end;
            if (!inTimeRange) return false;
          }
          
          // Emotion filter
          if (options.emotions && options.emotions.length > 0) {
            const emotionMatch = options.emotions.some(emotion => 
              msg.emotionalContext.userEmotion === emotion || 
              msg.emotionalContext.aiEmotion === emotion
            );
            if (!emotionMatch) return false;
          }
          
          // Topic filter
          if (options.topics && options.topics.length > 0) {
            const topicMatch = options.topics.some(topic => 
              msg.topics.includes(topic)
            );
            if (!topicMatch) return false;
          }
          
          // Importance filter
          if (options.minImportance !== undefined) {
            if (msg.importance < options.minImportance) return false;
          }
          
          return textMatch;
        });
        
        // Sort results
        const sortBy = options.sortBy || 'timestamp';
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'importance':
              return b.importance - a.importance;
            case 'relevance':
              // Simple relevance: how many times query appears
              const aMatches = (a.content.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length;
              const bMatches = (b.content.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length;
              return bMatches - aMatches;
            case 'timestamp':
            default:
              return b.timestamp - a.timestamp;
          }
        });
        
        return filtered.slice(0, options.limit || 50);
      },

      getRelatedMessages: (messageId, limit = 10) => {
        const state = get();
        const targetMessage = state.messages[messageId];
        if (!targetMessage) return [];
        
        const messages = Object.values(state.messages);
        
        // Find messages with similar topics, entities, or in same conversation
        const related = messages
          .filter(msg => msg.id !== messageId)
          .map(msg => {
            let score = 0;
            
            // Same conversation bonus
            if (msg.conversationId === targetMessage.conversationId) {
              score += 0.3;
            }
            
            // Topic similarity
            const commonTopics = msg.topics.filter(topic => 
              targetMessage.topics.includes(topic)
            );
            score += commonTopics.length * 0.2;
            
            // Entity similarity
            const commonEntities = msg.entities.filter(entity => 
              targetMessage.entities.includes(entity)
            );
            score += commonEntities.length * 0.1;
            
            // Temporal proximity (within 24 hours)
            const timeDiff = Math.abs(msg.timestamp - targetMessage.timestamp);
            if (timeDiff < 24 * 60 * 60 * 1000) {
              score += 0.1 * (1 - timeDiff / (24 * 60 * 60 * 1000));
            }
            
            return { message: msg, score };
          })
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.message);
        
        return related;
      },

      getContextualMessages: (limit = 20) => {
        const state = get();
        return state.context.contextWindow.slice(-limit);
      },

      generateMemoryCluster: (messageIds) => {
        const state = get();
        const messages = messageIds.map(id => state.messages[id]).filter(Boolean);
        
        if (messages.length === 0) return '';
        
        const clusterId = generateId();
        
        // Analyze messages to create cluster
        const allTopics = messages.flatMap(m => m.topics);
        const topicCounts = allTopics.reduce((acc, topic) => {
          acc[topic] = (acc[topic] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const dominantTopics = Object.entries(topicCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([topic]) => topic);
        
        const timeRange = {
          start: Math.min(...messages.map(m => m.timestamp)),
          end: Math.max(...messages.map(m => m.timestamp))
        };
        
        const cluster: MemoryCluster = {
          id: clusterId,
          name: `Cluster: ${dominantTopics.join(', ')}`,
          description: `Memory cluster containing ${messages.length} messages about ${dominantTopics.slice(0, 3).join(', ')}`,
          messages: messageIds,
          concepts: dominantTopics,
          patterns: [], // Would be filled by ML analysis
          timeRange,
          lastAccessed: Date.now(),
          accessCount: 0,
          coherence: 0.7, // Would be calculated
          relevance: 0.8, // Would be calculated
          emotional_significance: messages.reduce((avg, m) => avg + m.importance, 0) / messages.length,
          relatedClusters: [],
          subClusters: [],
        };
        
        set((state) => ({
          clusters: { ...state.clusters, [clusterId]: cluster }
        }));
        
        return clusterId;
      },

      getRelevantClusters: (query) => {
        const state = get();
        const clusters = Object.values(state.clusters);
        
        return clusters
          .filter(cluster => {
            const queryLower = query.toLowerCase();
            return (
              cluster.name.toLowerCase().includes(queryLower) ||
              cluster.description.toLowerCase().includes(queryLower) ||
              cluster.concepts.some(concept => 
                concept.toLowerCase().includes(queryLower)
              )
            );
          })
          .sort((a, b) => b.relevance - a.relevance);
      },

      compressOldMemories: async () => {
        const state = get();
        const cutoffDate = Date.now() - (state.settings.autoArchiveAfterDays * 24 * 60 * 60 * 1000);
        
        // Archive old messages
        const messagesToArchive = Object.values(state.messages)
          .filter(msg => msg.timestamp < cutoffDate && !msg.archived && msg.importance < 0.7);
        
        messagesToArchive.forEach(msg => {
          get().updateMessage(msg.id, { archived: true });
        });
        
        // Create clusters for archived content
        if (messagesToArchive.length > 10) {
          const clusterId = get().generateMemoryCluster(messagesToArchive.map(m => m.id));
          console.log(`Created memory cluster ${clusterId} for ${messagesToArchive.length} archived messages`);
        }
      },

      exportConversation: async (threadId) => {
        const state = get();
        const thread = state.threads[threadId];
        if (!thread) throw new Error('Thread not found');
        
        const messages = Object.values(state.messages)
          .filter(msg => msg.conversationId === threadId)
          .sort((a, b) => a.timestamp - b.timestamp);
        
        const exportData = {
          thread,
          messages,
          exportedAt: Date.now(),
          version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
      },

      importConversation: async (data) => {
        const parsed = JSON.parse(data);
        const { thread, messages } = parsed;
        
        // Import thread
        const newThreadId = generateId();
        set((state) => ({
          threads: { ...state.threads, [newThreadId]: { ...thread, id: newThreadId } }
        }));
        
        // Import messages
        messages.forEach((msg: ConversationMessage) => {
          const newId = generateId();
          set((state) => ({
            messages: {
              ...state.messages,
              [newId]: { ...msg, id: newId, conversationId: newThreadId }
            }
          }));
        });
      },

      getConversationStats: () => {
        const state = get();
        const messages = Object.values(state.messages);
        const threads = Object.values(state.threads);
        
        return {
          totalMessages: messages.length,
          totalThreads: threads.length,
          avgMessagesPerThread: messages.length / Math.max(threads.length, 1),
          mostActiveThread: threads.reduce((max, thread) => 
            thread.messageCount > (max?.messageCount || 0) ? thread : max, null as ConversationThread | null
          ),
          emotionalDistribution: messages.reduce((acc, msg) => {
            const emotion = msg.emotionalContext.userEmotion;
            acc[emotion] = (acc[emotion] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          topTopics: messages.flatMap(m => m.topics)
            .reduce((acc, topic) => {
              acc[topic] = (acc[topic] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
        };
      },

      getEmotionalInsights: () => {
        const state = get();
        const messages = Object.values(state.messages);
        
        const emotionalTimeline = messages
          .map(msg => ({
            timestamp: msg.timestamp,
            emotion: msg.emotionalContext.userEmotion,
            intensity: msg.emotionalContext.intensity
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        
        const emotionFrequency = emotionalTimeline.reduce((acc, item) => {
          acc[item.emotion] = (acc[item.emotion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          emotionalTimeline,
          emotionFrequency,
          averageIntensity: emotionalTimeline.reduce((sum, item) => sum + item.intensity, 0) / emotionalTimeline.length,
          dominantEmotion: Object.entries(emotionFrequency).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral'
        };
      },

      getTopicTrends: () => {
        const state = get();
        const messages = Object.values(state.messages);
        
        const topicsByTime = messages.reduce((acc, msg) => {
          const day = new Date(msg.timestamp).toDateString();
          if (!acc[day]) acc[day] = [];
          acc[day].push(...msg.topics);
          return acc;
        }, {} as Record<string, string[]>);
        
        const trendingTopics = Object.entries(topicsByTime)
          .map(([date, topics]) => ({
            date,
            topics: topics.reduce((acc, topic) => {
              acc[topic] = (acc[topic] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return trendingTopics;
      },
    }),
    {
      name: 'advanced-memory-storage',
      storage: {
        getItem: async (name) => {
          const value = await SecureStore.getItemAsync(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        }
      }
    }
  )
);

export default useAdvancedMemoryStore;