/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Personal Features System                                          │
 * │                                                                              │
 * │   Personalized AI features for individual users                              │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Personal Features System for Sallie
// Provides personalized AI features, data management, and goal tracking

import { EventEmitter } from 'events';

export interface AIPersonality {
  id: string;
  userId: string;
  name: string;
  description: string;
  avatar?: string;
  voiceSettings: VoiceSettings;
  communicationStyle: CommunicationStyle;
  personalityTraits: Record<string, number>;
  customResponses: CustomResponse[];
  preferences: PersonalityPreferences;
  createdAt: Date;
  lastModified: Date;
  active: boolean;
}

export interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: string;
  accent?: string;
}

export interface CommunicationStyle {
  formality: 'casual' | 'formal' | 'professional';
  verbosity: 'concise' | 'moderate' | 'detailed';
  humor: 'none' | 'light' | 'moderate' | 'high';
  empathy: 'low' | 'medium' | 'high';
  directness: 'indirect' | 'balanced' | 'direct';
}

export interface CustomResponse {
  id: string;
  trigger: string;
  response: string;
  context?: string;
  enabled: boolean;
  usageCount: number;
  lastUsed?: Date;
}

export interface PersonalityPreferences {
  topics: string[];
  avoidTopics: string[];
  preferredActivities: string[];
  dailyGoals: string[];
  reminders: boolean;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  dailySummary: boolean;
  goalReminders: boolean;
  achievementCelebrations: boolean;
  conversationInsights: boolean;
  frequency: 'low' | 'medium' | 'high';
}

export interface PersonalDataExport {
  id: string;
  userId: string;
  format: 'json' | 'csv' | 'pdf';
  includeConversations: boolean;
  includeAnalytics: boolean;
  includeSettings: boolean;
  dateRange: { start: Date; end: Date };
  createdAt: Date;
  downloadUrl?: string;
  expiresAt: Date;
}

export interface DataBackup {
  id: string;
  userId: string;
  type: 'full' | 'incremental';
  size: number;
  checksum: string;
  createdAt: Date;
  location: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface ConversationArchive {
  id: string;
  userId: string;
  title: string;
  description?: string;
  conversationIds: string[];
  tags: string[];
  category: 'personal' | 'work' | 'learning' | 'entertainment' | 'other';
  privacy: 'private' | 'shared' | 'public';
  createdAt: Date;
  lastAccessed: Date;
  size: number;
  encrypted: boolean;
}

export interface PersonalGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'health' | 'career' | 'learning' | 'relationships' | 'personal' | 'other';
  type: 'short_term' | 'long_term' | 'habit' | 'milestone';
  targetValue?: number;
  currentValue: number;
  unit?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  progress: GoalProgress[];
  reminders: GoalReminder[];
  createdAt: Date;
  completedAt?: Date;
}

export interface GoalProgress {
  id: string;
  value: number;
  note?: string;
  timestamp: Date;
  mood?: number;
  context?: string;
}

export interface GoalReminder {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  time?: string;
  message: string;
  enabled: boolean;
  lastSent?: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: 'goal_completed' | 'streak' | 'milestone' | 'personal_record';
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
  shared: boolean;
}

export interface PersonalInsights {
  id: string;
  userId: string;
  type: 'conversation_patterns' | 'goal_progress' | 'mood_trends' | 'productivity';
  title: string;
  content: string;
  data: any;
  generatedAt: Date;
  viewed: boolean;
}

/**
 * Custom AI Personality Manager
 */
export class CustomAIPersonalityManager extends EventEmitter {
  private personalities: Map<string, AIPersonality> = new Map();
  private activePersonality: Map<string, string> = new Map();

  /**
   * Create custom personality
   */
  public async createPersonality(
    personalityData: Omit<AIPersonality, 'id' | 'createdAt' | 'lastModified' | 'active'>
  ): Promise<AIPersonality> {
    const personality: AIPersonality = {
      ...personalityData,
      id: `personality_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      lastModified: new Date(),
      active: false
    };

    this.personalities.set(personality.id, personality);
    this.emit('personality-created', personality);
    return personality;
  }

  /**
   * Update personality
   */
  public async updatePersonality(
    personalityId: string,
    updates: Partial<AIPersonality>
  ): Promise<AIPersonality> {
    const personality = this.personalities.get(personalityId);
    if (!personality) {
      throw new Error('Personality not found');
    }

    const updatedPersonality = {
      ...personality,
      ...updates,
      lastModified: new Date()
    };

    this.personalities.set(personalityId, updatedPersonality);
    this.emit('personality-updated', updatedPersonality);
    return updatedPersonality;
  }

  /**
   * Activate personality for user
   */
  public async activatePersonality(userId: string, personalityId: string): Promise<void> {
    const personality = this.personalities.get(personalityId);
    if (!personality || personality.userId !== userId) {
      throw new Error('Personality not found or access denied');
    }

    // Deactivate current personality
    const currentActive = this.activePersonality.get(userId);
    if (currentActive) {
      const currentPersonality = this.personalities.get(currentActive);
      if (currentPersonality) {
        currentPersonality.active = false;
        this.personalities.set(currentActive, currentPersonality);
      }
    }

    // Activate new personality
    personality.active = true;
    this.personalities.set(personalityId, personality);
    this.activePersonality.set(userId, personalityId);

    this.emit('personality-activated', { userId, personality });
  }

  /**
   * Get active personality for user
   */
  public getActivePersonality(userId: string): AIPersonality | null {
    const personalityId = this.activePersonality.get(userId);
    return personalityId ? this.personalities.get(personalityId) || null : null;
  }

  /**
   * Get user personalities
   */
  public getUserPersonalities(userId: string): AIPersonality[] {
    return Array.from(this.personalities.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  /**
   * Delete personality
   */
  public async deletePersonality(userId: string, personalityId: string): Promise<void> {
    const personality = this.personalities.get(personalityId);
    if (!personality || personality.userId !== userId) {
      throw new Error('Personality not found or access denied');
    }

    // If this was the active personality, clear it
    if (this.activePersonality.get(userId) === personalityId) {
      this.activePersonality.delete(userId);
    }

    this.personalities.delete(personalityId);
    this.emit('personality-deleted', { userId, personalityId });
  }

  /**
   * Add custom response
   */
  public async addCustomResponse(
    personalityId: string,
    responseData: Omit<CustomResponse, 'id' | 'usageCount' | 'lastUsed'>
  ): Promise<CustomResponse> {
    const personality = this.personalities.get(personalityId);
    if (!personality) {
      throw new Error('Personality not found');
    }

    const customResponse: CustomResponse = {
      ...responseData,
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      usageCount: 0
    };

    personality.customResponses.push(customResponse);
    this.personalities.set(personalityId, personality);
    this.emit('custom-response-added', { personalityId, response: customResponse });
    return customResponse;
  }

  /**
   * Update custom response
   */
  public async updateCustomResponse(
    personalityId: string,
    responseId: string,
    updates: Partial<CustomResponse>
  ): Promise<void> {
    const personality = this.personalities.get(personalityId);
    if (!personality) {
      throw new Error('Personality not found');
    }

    const response = personality.customResponses.find(r => r.id === responseId);
    if (!response) {
      throw new Error('Custom response not found');
    }

    Object.assign(response, updates);
    this.personalities.set(personalityId, personality);
    this.emit('custom-response-updated', { personalityId, responseId, updates });
  }

  /**
   * Use custom response (track usage)
   */
  public async useCustomResponse(personalityId: string, responseId: string): Promise<void> {
    const personality = this.personalities.get(personalityId);
    if (!personality) {
      throw new Error('Personality not found');
    }

    const response = personality.customResponses.find(r => r.id === responseId);
    if (!response) {
      throw new Error('Custom response not found');
    }

    response.usageCount++;
    response.lastUsed = new Date();
    this.personalities.set(personalityId, personality);
  }

  /**
   * Generate personality recommendations
   */
  public generatePersonalityRecommendations(userId: string): {
    suggestedTraits: Record<string, number>;
    communicationImprovements: string[];
    customResponseIdeas: string[];
  } {
    // Analyze user's conversation history and preferences
    // This would use ML to analyze patterns and suggest improvements
    return {
      suggestedTraits: {
        empathy: 0.8,
        humor: 0.6,
        directness: 0.7
      },
      communicationImprovements: [
        'Try using more empathetic language',
        'Consider adding light humor to responses',
        'Be more direct when giving advice'
      ],
      customResponseIdeas: [
        'Add a custom greeting for morning conversations',
        'Create responses for common questions',
        'Set up automated check-ins for goals'
      ]
    };
  }
}

/**
 * Personal Data Management System
 */
export class PersonalDataManagementSystem extends EventEmitter {
  private exports: Map<string, PersonalDataExport> = new Map();
  private backups: Map<string, DataBackup> = new Map();

  /**
   * Request data export
   */
  public async requestDataExport(
    exportData: Omit<PersonalDataExport, 'id' | 'createdAt' | 'downloadUrl' | 'expiresAt'>
  ): Promise<PersonalDataExport> {
    const exportRequest: PersonalDataExport = {
      ...exportData,
      id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.exports.set(exportRequest.id, exportRequest);
    this.emit('export-requested', exportRequest);

    // Start export process
    this.processDataExport(exportRequest);

    return exportRequest;
  }

  /**
   * Get export status
   */
  public getExportStatus(exportId: string): PersonalDataExport | null {
    return this.exports.get(exportId) || null;
  }

  /**
   * Get user exports
   */
  public getUserExports(userId: string): PersonalDataExport[] {
    return Array.from(this.exports.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Create data backup
   */
  public async createBackup(
    backupData: Omit<DataBackup, 'id' | 'createdAt' | 'status'>
  ): Promise<DataBackup> {
    const backup: DataBackup = {
      ...backupData,
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'pending'
    };

    this.backups.set(backup.id, backup);
    this.emit('backup-created', backup);

    // Start backup process
    this.processDataBackup(backup);

    return backup;
  }

  /**
   * Get backup status
   */
  public getBackupStatus(backupId: string): DataBackup | null {
    return this.backups.get(backupId) || null;
  }

  /**
   * Get user backups
   */
  public getUserBackups(userId: string): DataBackup[] {
    return Array.from(this.backups.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Delete old exports and backups
   */
  public async cleanupOldData(): Promise<void> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Clean up old exports
    for (const [id, export_] of this.exports) {
      if (export_.createdAt < thirtyDaysAgo) {
        this.exports.delete(id);
        this.emit('export-cleaned', id);
      }
    }

    // Clean up old backups (keep last 10 per user)
    const userBackups = new Map<string, DataBackup[]>();
    for (const backup of this.backups.values()) {
      const userList = userBackups.get(backup.userId) || [];
      userList.push(backup);
      userBackups.set(backup.userId, userList);
    }

    for (const [userId, backups] of userBackups) {
      if (backups.length > 10) {
        const toDelete = backups
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(10);

        for (const backup of toDelete) {
          this.backups.delete(backup.id);
          this.emit('backup-cleaned', backup.id);
        }
      }
    }

    this.emit('cleanup-completed');
  }

  /**
   * Get data usage statistics
   */
  public getDataUsageStats(userId: string): {
    totalExports: number;
    totalBackups: number;
    dataExported: number;
    storageUsed: number;
    lastExport: Date | null;
    lastBackup: Date | null;
  } {
    const userExports = this.getUserExports(userId);
    const userBackups = this.getUserBackups(userId);

    return {
      totalExports: userExports.length,
      totalBackups: userBackups.length,
      dataExported: userExports.reduce((sum, e) => sum + (e.downloadUrl ? 1 : 0), 0),
      storageUsed: userBackups.reduce((sum, b) => sum + b.size, 0),
      lastExport: userExports.length > 0 ? userExports[0].createdAt : null,
      lastBackup: userBackups.length > 0 ? userBackups[0].createdAt : null
    };
  }

  private async processDataExport(exportRequest: PersonalDataExport): Promise<void> {
    try {
      // Simulate data export process
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Generate download URL (in real implementation, this would be a secure URL)
      exportRequest.downloadUrl = `https://api.sallie.ai/exports/${exportRequest.id}.${exportRequest.format}`;

      this.exports.set(exportRequest.id, exportRequest);
      this.emit('export-completed', exportRequest);
    } catch (error) {
      this.emit('export-failed', { exportRequest, error });
    }
  }

  private async processDataBackup(backup: DataBackup): Promise<void> {
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 10000));

      backup.status = 'completed';
      backup.checksum = `checksum_${Date.now()}`;

      this.backups.set(backup.id, backup);
      this.emit('backup-completed', backup);
    } catch (error) {
      backup.status = 'failed';
      backup.error = error instanceof Error ? error.message : 'Backup failed';

      this.backups.set(backup.id, backup);
      this.emit('backup-failed', backup);
    }
  }
}

/**
 * Private Conversation Archiving System
 */
export class PrivateConversationArchivingSystem extends EventEmitter {
  private archives: Map<string, ConversationArchive> = new Map();

  /**
   * Create conversation archive
   */
  public async createArchive(
    archiveData: Omit<ConversationArchive, 'id' | 'createdAt' | 'lastAccessed' | 'size' | 'encrypted'>
  ): Promise<ConversationArchive> {
    const archive: ConversationArchive = {
      ...archiveData,
      id: `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      lastAccessed: new Date(),
      size: this.calculateArchiveSize(archiveData.conversationIds),
      encrypted: true // Always encrypt private archives
    };

    this.archives.set(archive.id, archive);
    this.emit('archive-created', archive);
    return archive;
  }

  /**
   * Update archive
   */
  public async updateArchive(
    archiveId: string,
    updates: Partial<ConversationArchive>
  ): Promise<ConversationArchive> {
    const archive = this.archives.get(archiveId);
    if (!archive) {
      throw new Error('Archive not found');
    }

    const updatedArchive = { ...archive, ...updates };
    this.archives.set(archiveId, updatedArchive);
    this.emit('archive-updated', updatedArchive);
    return updatedArchive;
  }

  /**
   * Get archive
   */
  public getArchive(archiveId: string): ConversationArchive | null {
    const archive = this.archives.get(archiveId);
    if (archive) {
      // Update last accessed time
      archive.lastAccessed = new Date();
      this.archives.set(archiveId, archive);
    }
    return archive || null;
  }

  /**
   * Get user archives
   */
  public getUserArchives(userId: string): ConversationArchive[] {
    return Array.from(this.archives.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  }

  /**
   * Search archives
   */
  public searchArchives(userId: string, query: string, filters?: {
    category?: ConversationArchive['category'];
    privacy?: ConversationArchive['privacy'];
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): ConversationArchive[] {
    let results = this.getUserArchives(userId);

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(archive =>
        archive.title.toLowerCase().includes(lowerQuery) ||
        archive.description?.toLowerCase().includes(lowerQuery) ||
        archive.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(a => a.category === filters.category);
      }

      if (filters.privacy) {
        results = results.filter(a => a.privacy === filters.privacy);
      }

      if (filters.tags) {
        results = results.filter(a =>
          filters.tags!.some(tag => a.tags.includes(tag))
        );
      }

      if (filters.dateRange) {
        results = results.filter(a =>
          a.createdAt >= filters.dateRange!.start &&
          a.createdAt <= filters.dateRange!.end
        );
      }
    }

    return results;
  }

  /**
   * Delete archive
   */
  public async deleteArchive(userId: string, archiveId: string): Promise<void> {
    const archive = this.archives.get(archiveId);
    if (!archive || archive.userId !== userId) {
      throw new Error('Archive not found or access denied');
    }

    this.archives.delete(archiveId);
    this.emit('archive-deleted', { userId, archiveId });
  }

  /**
   * Add conversations to archive
   */
  public async addConversationsToArchive(
    archiveId: string,
    conversationIds: string[]
  ): Promise<void> {
    const archive = this.archives.get(archiveId);
    if (!archive) {
      throw new Error('Archive not found');
    }

    // Add new conversations (avoid duplicates)
    const existingIds = new Set(archive.conversationIds);
    const newIds = conversationIds.filter(id => !existingIds.has(id));

    archive.conversationIds.push(...newIds);
    archive.size = this.calculateArchiveSize(archive.conversationIds);
    archive.lastAccessed = new Date();

    this.archives.set(archiveId, archive);
    this.emit('conversations-added-to-archive', { archiveId, conversationIds: newIds });
  }

  /**
   * Remove conversations from archive
   */
  public async removeConversationsFromArchive(
    archiveId: string,
    conversationIds: string[]
  ): Promise<void> {
    const archive = this.archives.get(archiveId);
    if (!archive) {
      throw new Error('Archive not found');
    }

    const idsToRemove = new Set(conversationIds);
    archive.conversationIds = archive.conversationIds.filter(id => !idsToRemove.has(id));
    archive.size = this.calculateArchiveSize(archive.conversationIds);
    archive.lastAccessed = new Date();

    this.archives.set(archiveId, archive);
    this.emit('conversations-removed-from-archive', { archiveId, conversationIds });
  }

  /**
   * Get archive statistics
   */
  public getArchiveStatistics(userId: string): {
    totalArchives: number;
    totalSize: number;
    byCategory: Record<string, number>;
    byPrivacy: Record<string, number>;
    oldestArchive: Date | null;
    newestArchive: Date | null;
  } {
    const userArchives = this.getUserArchives(userId);

    const byCategory: Record<string, number> = {};
    const byPrivacy: Record<string, number> = {};

    let totalSize = 0;
    let oldestArchive: Date | null = null;
    let newestArchive: Date | null = null;

    userArchives.forEach(archive => {
      byCategory[archive.category] = (byCategory[archive.category] || 0) + 1;
      byPrivacy[archive.privacy] = (byPrivacy[archive.privacy] || 0) + 1;
      totalSize += archive.size;

      if (!oldestArchive || archive.createdAt < oldestArchive) {
        oldestArchive = archive.createdAt;
      }

      if (!newestArchive || archive.createdAt > newestArchive) {
        newestArchive = archive.createdAt;
      }
    });

    return {
      totalArchives: userArchives.length,
      totalSize,
      byCategory,
      byPrivacy,
      oldestArchive,
      newestArchive
    };
  }

  private calculateArchiveSize(conversationIds: string[]): number {
    // Rough estimation: assume 1KB per conversation
    return conversationIds.length * 1024;
  }
}

/**
 * Personal Goal Tracking System
 */
export class PersonalGoalTrackingSystem extends EventEmitter {
  private goals: Map<string, PersonalGoal> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();

  /**
   * Create personal goal
   */
  public async createGoal(
    goalData: Omit<PersonalGoal, 'id' | 'createdAt' | 'currentValue' | 'progress' | 'reminders'>
  ): Promise<PersonalGoal> {
    const goal: PersonalGoal = {
      ...goalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      currentValue: 0,
      progress: [],
      reminders: []
    };

    this.goals.set(goal.id, goal);
    this.emit('goal-created', goal);
    return goal;
  }

  /**
   * Update goal
   */
  public async updateGoal(
    goalId: string,
    updates: Partial<PersonalGoal>
  ): Promise<PersonalGoal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const updatedGoal = { ...goal, ...updates };

    // Check if goal is completed
    if (updates.status === 'completed' && goal.status !== 'completed') {
      updatedGoal.completedAt = new Date();
      await this.checkForAchievements(goal.userId, goal);
    }

    this.goals.set(goalId, updatedGoal);
    this.emit('goal-updated', updatedGoal);
    return updatedGoal;
  }

  /**
   * Update goal progress
   */
  public async updateProgress(
    goalId: string,
    progressData: Omit<GoalProgress, 'id' | 'timestamp'>
  ): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const progress: GoalProgress = {
      ...progressData,
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    goal.progress.push(progress);
    goal.currentValue = progress.value;

    // Check if goal is completed
    if (goal.targetValue && goal.currentValue >= goal.targetValue && goal.status !== 'completed') {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await this.checkForAchievements(goal.userId, goal);
    }

    this.goals.set(goalId, goal);
    this.emit('goal-progress-updated', { goalId, progress });
  }

  /**
   * Get goal
   */
  public getGoal(goalId: string): PersonalGoal | null {
    return this.goals.get(goalId) || null;
  }

  /**
   * Get user goals
   */
  public getUserGoals(userId: string, filters?: {
    category?: PersonalGoal['category'];
    type?: PersonalGoal['type'];
    status?: PersonalGoal['status'];
    priority?: PersonalGoal['priority'];
  }): PersonalGoal[] {
    let userGoals = Array.from(this.goals.values()).filter(g => g.userId === userId);

    if (filters) {
      if (filters.category) {
        userGoals = userGoals.filter(g => g.category === filters.category);
      }

      if (filters.type) {
        userGoals = userGoals.filter(g => g.type === filters.type);
      }

      if (filters.status) {
        userGoals = userGoals.filter(g => g.status === filters.status);
      }

      if (filters.priority) {
        userGoals = userGoals.filter(g => g.priority === filters.priority);
      }
    }

    return userGoals.sort((a, b) => {
      // Sort by priority first, then by deadline
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Delete goal
   */
  public async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal || goal.userId !== userId) {
      throw new Error('Goal not found or access denied');
    }

    this.goals.delete(goalId);
    this.emit('goal-deleted', { userId, goalId });
  }

  /**
   * Add goal reminder
   */
  public async addGoalReminder(
    goalId: string,
    reminderData: Omit<GoalReminder, 'id' | 'lastSent'>
  ): Promise<GoalReminder> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const reminder: GoalReminder = {
      ...reminderData,
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    goal.reminders.push(reminder);
    this.goals.set(goalId, goal);
    this.emit('reminder-added', { goalId, reminder });
    return reminder;
  }

  /**
   * Get goal insights
   */
  public getGoalInsights(userId: string): {
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    completionRate: number;
    averageCompletionTime: number;
    topCategories: string[];
    upcomingDeadlines: PersonalGoal[];
    recentAchievements: Achievement[];
  } {
    const userGoals = this.getUserGoals(userId);
    const userAchievements = this.achievements.get(userId) || [];

    const completedGoals = userGoals.filter(g => g.status === 'completed');
    const activeGoals = userGoals.filter(g => g.status === 'in_progress');

    const completionRate = userGoals.length > 0 ? completedGoals.length / userGoals.length : 0;

    const completionTimes = completedGoals
      .filter(g => g.completedAt)
      .map(g => g.completedAt!.getTime() - g.createdAt.getTime());

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    const categoryCount: Record<string, number> = {};
    userGoals.forEach(goal => {
      categoryCount[goal.category] = (categoryCount[goal.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const upcomingDeadlines = activeGoals
      .filter(g => g.deadline)
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
      .slice(0, 5);

    const recentAchievements = userAchievements
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 5);

    return {
      totalGoals: userGoals.length,
      completedGoals: completedGoals.length,
      activeGoals: activeGoals.length,
      completionRate,
      averageCompletionTime,
      topCategories,
      upcomingDeadlines,
      recentAchievements
    };
  }

  /**
   * Get user achievements
   */
  public getUserAchievements(userId: string): Achievement[] {
    return (this.achievements.get(userId) || [])
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  private async checkForAchievements(userId: string, goal: PersonalGoal): Promise<void> {
    const userAchievements = this.achievements.get(userId) || [];
    const newAchievements: Achievement[] = [];

    // Goal completion achievement
    const goalCompletionAchievement: Achievement = {
      id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'goal_completed',
      title: 'Goal Achiever',
      description: `Completed goal: ${goal.title}`,
      icon: '🎯',
      points: 10,
      unlockedAt: new Date(),
      shared: false
    };
    newAchievements.push(goalCompletionAchievement);

    // Check for streaks
    const completedGoals = Array.from(this.goals.values())
      .filter(g => g.userId === userId && g.status === 'completed')
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

    if (completedGoals.length >= 5) {
      const streakAchievement: Achievement = {
        id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'streak',
        title: 'Goal Streak',
        description: `Completed ${completedGoals.length} goals`,
        icon: '🔥',
        points: completedGoals.length * 5,
        unlockedAt: new Date(),
        shared: false
      };
      newAchievements.push(streakAchievement);
    }

    // Add new achievements
    userAchievements.push(...newAchievements);
    this.achievements.set(userId, userAchievements);

    // Emit achievement events
    newAchievements.forEach(achievement => {
      this.emit('achievement-unlocked', achievement);
    });
  }
}

// Export singleton instances
export const customAIPersonalityManager = new CustomAIPersonalityManager();
export const personalDataManagementSystem = new PersonalDataManagementSystem();
export const privateConversationArchivingSystem = new PrivateConversationArchivingSystem();
export const personalGoalTrackingSystem = new PersonalGoalTrackingSystem();

// Personal Insights Generator
export class PersonalInsightsGenerator extends EventEmitter {
  private insights: Map<string, PersonalInsights[]> = new Map();

  /**
   * Generate insights for user
   */
  public async generateInsights(userId: string): Promise<PersonalInsights[]> {
    const insights: PersonalInsights[] = [];

    // Conversation patterns insight
    const conversationInsight: PersonalInsights = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'conversation_patterns',
      title: 'Your Conversation Patterns',
      content: 'You tend to have longer conversations in the evening and discuss topics related to personal growth and technology.',
      data: {
        peakHours: [19, 20, 21],
        topTopics: ['personal growth', 'technology', 'health'],
        averageLength: 25
      },
      generatedAt: new Date(),
      viewed: false
    };
    insights.push(conversationInsight);

    // Goal progress insight
    const goalInsight: PersonalInsights = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'goal_progress',
      title: 'Goal Progress Analysis',
      content: 'You\'re making great progress on your fitness goals! Consider setting a new challenge.',
      data: {
        completionRate: 0.85,
        streakDays: 12,
        topCategory: 'health'
      },
      generatedAt: new Date(),
      viewed: false
    };
    insights.push(goalInsight);

    // Store insights
    const userInsights = this.insights.get(userId) || [];
    userInsights.push(...insights);
    this.insights.set(userId, userInsights);

    this.emit('insights-generated', { userId, insights });
    return insights;
  }

  /**
   * Get user insights
   */
  public getUserInsights(userId: string, viewed?: boolean): PersonalInsights[] {
    let userInsights = this.insights.get(userId) || [];

    if (viewed !== undefined) {
      userInsights = userInsights.filter(i => i.viewed === viewed);
    }

    return userInsights.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  /**
   * Mark insight as viewed
   */
  public async markInsightViewed(userId: string, insightId: string): Promise<void> {
    const userInsights = this.insights.get(userId) || [];
    const insight = userInsights.find(i => i.id === insightId);

    if (insight) {
      insight.viewed = true;
      this.insights.set(userId, userInsights);
      this.emit('insight-viewed', { userId, insightId });
    }
  }

  /**
   * Delete old insights
   */
  public async cleanupOldInsights(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const [userId, userInsights] of this.insights) {
      const filteredInsights = userInsights.filter(i => i.generatedAt > thirtyDaysAgo);
      this.insights.set(userId, filteredInsights);
    }

    this.emit('insights-cleaned');
  }
}

export const personalInsightsGenerator = new PersonalInsightsGenerator();
