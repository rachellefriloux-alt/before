/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Flow State Guard & Priority Triage System                         │
 * │                                                                              │
 * │   Optimal workflow management for seamless user experience                   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { EventEmitter } from 'events';
import { getEventBus, SallieEventBus } from './EventBus';

// ==============================================================================
// FLOW STATE INTERFACES
// ==============================================================================

export interface FlowStateMetrics {
  focusLevel: number; // 0-1 scale
  interruptions: number;
  taskSwitchCount: number;
  sessionDuration: number; // in milliseconds
  productivityScore: number; // 0-1 scale
  lastActivity: Date;
  energyLevel: number; // 0-1 scale
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  urgency: number; // 0-1 scale
  importance: number; // 0-1 scale
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  energyRequired: number; // 0-1 scale
  dependencies: string[];
  tags: string[];
  context: string;
  deadline?: Date;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  userId: string;
  interruptions: Interruption[];
}

export interface Interruption {
  id: string;
  type: 'external' | 'internal' | 'system' | 'notification';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'severe';
  timestamp: Date;
  duration: number; // in milliseconds
  resolved: boolean;
  resolution?: string;
}

export interface WorkflowSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  tasks: string[];
  completedTasks: string[];
  metrics: FlowStateMetrics;
  interruptions: Interruption[];
  flowStates: FlowStateRecord[];
  notes: string[];
}

export interface FlowStateRecord {
  timestamp: Date;
  state: 'deep_focus' | 'focused' | 'distracted' | 'multitasking' | 'break';
  confidence: number; // 0-1 scale
  triggers: string[];
  duration: number;
}

export interface PriorityMatrix {
  urgent_important: Task[];
  urgent_not_important: Task[];
  not_urgent_important: Task[];
  not_urgent_not_important: Task[];
}

// ==============================================================================
// CONTEXT INTERFACES
// ==============================================================================

export interface UserContext {
  energyLevel: number;
  availableTime: number; // in minutes
  currentMood: string;
  preferredTaskTypes: string[];
  peakHours: number[]; // hours of day (0-23)
  distractionLevel: number; // 0-1 scale
  workStyle: 'focused' | 'collaborative' | 'creative' | 'analytical';
  environment: 'quiet' | 'moderate' | 'busy' | 'noisy';
  device: 'mobile' | 'tablet' | 'desktop';
}

export interface EnvironmentContext {
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  notifications: boolean;
  availableTools: string[];
  networkQuality: 'poor' | 'fair' | 'good' | 'excellent';
  batteryLevel?: number; // 0-100 for mobile devices
}

// ==============================================================================
// CONFIGURATION INTERFACES
// ==============================================================================

export interface FlowGuardConfig {
  enableFlowProtection: boolean;
  maxInterruptions: number;
  deepFocusThreshold: number; // in minutes
  autoBreakInterval: number; // in minutes
  priorityAlgorithm: 'eisenhower' | 'weighted' | 'deadline' | 'energy_based';
  adaptivePriority: boolean;
  contextAware: boolean;
  learningEnabled: boolean;
}

// ==============================================================================
// FLOW STATE GUARD MAIN CLASS
// ==============================================================================

export class FlowStateGuard extends EventEmitter {
  private eventBus: SallieEventBus;
  private config: FlowGuardConfig;
  private currentSession: WorkflowSession | null = null;
  private tasks: Map<string, Task> = new Map();
  private userContext: UserContext;
  private environmentContext: EnvironmentContext;
  private flowStateHistory: FlowStateRecord[] = [];
  private priorityEngine: PriorityEngine;
  private interruptionManager: InterruptionManager;
  private adaptiveScheduler: AdaptiveScheduler;

  constructor(config: FlowGuardConfig) {
    super();
    this.config = config;
    this.eventBus = getEventBus();
    this.priorityEngine = new PriorityEngine(config);
    this.interruptionManager = new InterruptionManager(config);
    this.adaptiveScheduler = new AdaptiveScheduler(config);
    
    this.userContext = this.initializeUserContext();
    this.environmentContext = this.initializeEnvironmentContext();
    
    this.setupEventListeners();
    this.startFlowMonitoring();
  }

  // ==============================================================================
  // SESSION MANAGEMENT
  // ==============================================================================

  /**
   * Start a new workflow session
   */
  async startSession(userId: string, options: {
    focusGoal?: string;
    duration?: number;
    taskIds?: string[];
  } = {}): Promise<string> {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      tasks: options.taskIds || [],
      completedTasks: [],
      metrics: this.initializeMetrics(),
      interruptions: [],
      flowStates: [],
      notes: [],
    };

    // Initialize adaptive context
    if (this.config.contextAware) {
      await this.updateContext();
    }

    // Start flow monitoring
    this.startFlowTracking();

    this.eventBus.emitSallieEvent(this.eventBus.createEvent(
      'flowGuard:sessionStarted',
      { sessionId, userId, options },
      'FlowStateGuard'
    ));

    this.emit('session:started', this.currentSession);
    return sessionId;
  }

  /**
   * End the current session
   */
  async endSession(notes?: string[]): Promise<WorkflowSession | null> {
    if (!this.currentSession) {
      return null;
    }

    this.currentSession.endTime = new Date();
    if (notes) {
      this.currentSession.notes.push(...notes);
    }

    // Calculate final metrics
    await this.calculateSessionMetrics();

    // Save session data
    await this.saveSession(this.currentSession);

    const completedSession = { ...this.currentSession };
    this.currentSession = null;

    this.eventBus.emitSallieEvent(this.eventBus.createEvent(
      'flowGuard:sessionEnded',
      completedSession,
      'FlowStateGuard'
    ));

    this.emit('session:ended', completedSession);
    return completedSession;
  }

  // ==============================================================================
  // TASK MANAGEMENT
  // ==============================================================================

  /**
   * Add a new task
   */
  async addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'interruptions'>): Promise<string> {
    const task: Task = {
      id: this.generateTaskId(),
      createdAt: new Date(),
      status: 'pending',
      interruptions: [],
      ...taskData,
    };

    this.tasks.set(task.id, task);

    // Update priority if adaptive
    if (this.config.adaptivePriority) {
      await this.priorityEngine.updateTaskPriority(task, this.userContext, this.environmentContext);
    }

    this.eventBus.emitSallieEvent(this.eventBus.createEvent(
      'flowGuard:taskAdded',
      task,
      'FlowStateGuard'
    ));

    this.emit('task:added', task);
    return task.id;
  }

  /**
   * Start working on a task
   */
  async startTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') {
      return false;
    }

    // Check for flow protection
    if (this.config.enableFlowProtection && this.isInDeepFocus()) {
      const shouldInterrupt = await this.interruptionManager.evaluateInterruption({
        type: 'internal',
        description: `Task switch to: ${task.title}`,
        impact: 'medium',
        timestamp: new Date(),
        duration: 0,
        resolved: false,
      } as Interruption);

      if (!shouldInterrupt) {
        this.emit('task:blocked', { taskId, reason: 'flow_protection' });
        return false;
      }
    }

    task.status = 'in_progress';
    task.startedAt = new Date();

    // Add to current session
    if (this.currentSession && !this.currentSession.tasks.includes(taskId)) {
      this.currentSession.tasks.push(taskId);
    }

    this.eventBus.emitSallieEvent(this.eventBus.createEvent(
      'flowGuard:taskStarted',
      task,
      'FlowStateGuard'
    ));

    this.emit('task:started', task);
    return true;
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, notes?: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'in_progress') {
      return false;
    }

    task.status = 'completed';
    task.completedAt = new Date();
    
    if (task.startedAt) {
      task.actualDuration = task.completedAt.getTime() - task.startedAt.getTime();
    }

    // Add to completed tasks in session
    if (this.currentSession) {
      this.currentSession.completedTasks.push(taskId);
    }

    // Learn from task completion for adaptive scheduling
    if (this.config.learningEnabled) {
      await this.adaptiveScheduler.learnFromCompletion(task, this.userContext);
    }

    this.eventBus.emitSallieEvent(this.eventBus.createEvent(
      'flowGuard:taskCompleted',
      { task, notes },
      'FlowStateGuard'
    ));

    this.emit('task:completed', task);
    return true;
  }

  // ==============================================================================
  // PRIORITY MANAGEMENT
  // ==============================================================================

  /**
   * Get prioritized task list
   */
  async getPrioritizedTasks(limit?: number): Promise<Task[]> {
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending');
    
    return await this.priorityEngine.prioritizeTasks(
      pendingTasks,
      this.userContext,
      this.environmentContext,
      limit
    );
  }

  /**
   * Get Eisenhower matrix
   */
  async getEisenhowerMatrix(): Promise<PriorityMatrix> {
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending');
    
    return {
      urgent_important: pendingTasks.filter(t => t.urgency > 0.7 && t.importance > 0.7),
      urgent_not_important: pendingTasks.filter(t => t.urgency > 0.7 && t.importance <= 0.7),
      not_urgent_important: pendingTasks.filter(t => t.urgency <= 0.7 && t.importance > 0.7),
      not_urgent_not_important: pendingTasks.filter(t => t.urgency <= 0.7 && t.importance <= 0.7),
    };
  }

  /**
   * Suggest next task based on context
   */
  async suggestNextTask(): Promise<Task | null> {
    const prioritizedTasks = await this.getPrioritizedTasks(5);
    
    if (prioritizedTasks.length === 0) {
      return null;
    }

    // Apply context-aware filtering
    const contextOptimalTasks = prioritizedTasks.filter(task => {
      // Energy level check
      if (task.energyRequired > this.userContext.energyLevel) {
        return false;
      }

      // Time availability check
      if (task.estimatedDuration > this.userContext.availableTime) {
        return false;
      }

      // Complexity vs energy check
      const complexityEnergyMap = {
        simple: 0.2,
        moderate: 0.5,
        complex: 0.7,
        expert: 0.9,
      };

      if (complexityEnergyMap[task.complexity] > this.userContext.energyLevel) {
        return false;
      }

      return true;
    });

    return contextOptimalTasks[0] || prioritizedTasks[0];
  }

  // ==============================================================================
  // FLOW STATE MONITORING
  // ==============================================================================

  private startFlowMonitoring(): void {
    // Monitor flow state every 30 seconds
    setInterval(() => {
      this.analyzeCurrentFlowState();
    }, 30000);

    // Monitor for interruptions
    setInterval(() => {
      this.detectInterruptions();
    }, 5000);
  }

  private startFlowTracking(): void {
    if (!this.currentSession) return;

    const trackingInterval = setInterval(() => {
      if (!this.currentSession) {
        clearInterval(trackingInterval);
        return;
      }

      const flowState = this.analyzeCurrentFlowState();
      this.currentSession.flowStates.push(flowState);
      this.flowStateHistory.push(flowState);

      // Limit history size
      if (this.flowStateHistory.length > 1000) {
        this.flowStateHistory = this.flowStateHistory.slice(-500);
      }
    }, 60000); // Every minute
  }

  private analyzeCurrentFlowState(): FlowStateRecord {
    // Simplified flow state analysis
    const interruptions = this.getRecentInterruptions(300000); // Last 5 minutes
    const taskSwitches = this.getRecentTaskSwitches(300000);
    
    let state: FlowStateRecord['state'] = 'focused';
    let confidence = 0.8;

    if (interruptions.length === 0 && taskSwitches === 0) {
      state = 'deep_focus';
      confidence = 0.9;
    } else if (interruptions.length > 3 || taskSwitches > 2) {
      state = 'distracted';
      confidence = 0.7;
    } else if (taskSwitches > 1) {
      state = 'multitasking';
      confidence = 0.6;
    }

    const flowState: FlowStateRecord = {
      timestamp: new Date(),
      state,
      confidence,
      triggers: [],
      duration: 60000, // 1 minute intervals
    };

    return flowState;
  }

  private isInDeepFocus(): boolean {
    const recentStates = this.flowStateHistory.slice(-5); // Last 5 minutes
    const deepFocusStates = recentStates.filter(s => s.state === 'deep_focus').length;
    return deepFocusStates >= 3; // 3 out of 5 minutes in deep focus
  }

  private detectInterruptions(): void {
    // This would integrate with system notifications, app switching, etc.
    // For now, this is a placeholder for interrupt detection logic
  }

  // ==============================================================================
  // CONTEXT MANAGEMENT
  // ==============================================================================

  async updateContext(): Promise<void> {
    // Update environment context
    this.environmentContext = {
      ...this.environmentContext,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
    };

    // Update user context based on recent activity
    await this.updateUserEnergyLevel();
    await this.updateDistractionLevel();

    this.emit('context:updated', {
      user: this.userContext,
      environment: this.environmentContext,
    });
  }

  private async updateUserEnergyLevel(): Promise<void> {
    // Simplified energy level calculation
    const hour = new Date().getHours();
    const peakHours = this.userContext.peakHours;
    
    if (peakHours.includes(hour)) {
      this.userContext.energyLevel = Math.min(1, this.userContext.energyLevel + 0.1);
    } else if (hour < 6 || hour > 22) {
      this.userContext.energyLevel = Math.max(0, this.userContext.energyLevel - 0.2);
    }
  }

  private async updateDistractionLevel(): Promise<void> {
    const recentInterruptions = this.getRecentInterruptions(600000); // Last 10 minutes
    this.userContext.distractionLevel = Math.min(1, recentInterruptions.length * 0.1);
  }

  // ==============================================================================
  // METRICS AND ANALYTICS
  // ==============================================================================

  private async calculateSessionMetrics(): Promise<void> {
    if (!this.currentSession) return;

    const session = this.currentSession;
    const duration = Date.now() - session.startTime.getTime();
    const completedTasks = session.completedTasks.length;
    const totalTasks = session.tasks.length;

    session.metrics = {
      focusLevel: this.calculateAverageFocusLevel(),
      interruptions: session.interruptions.length,
      taskSwitchCount: this.calculateTaskSwitches(),
      sessionDuration: duration,
      productivityScore: totalTasks > 0 ? completedTasks / totalTasks : 0,
      lastActivity: new Date(),
      energyLevel: this.userContext.energyLevel,
    };
  }

  private calculateAverageFocusLevel(): number {
    if (!this.currentSession) return 0;

    const focusStates = this.currentSession.flowStates.filter(s => 
      s.state === 'deep_focus' || s.state === 'focused'
    );
    
    return focusStates.length / Math.max(this.currentSession.flowStates.length, 1);
  }

  private calculateTaskSwitches(): number {
    // Count task switches during session
    return 0; // Placeholder
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private initializeUserContext(): UserContext {
    return {
      energyLevel: 0.8,
      availableTime: 60,
      currentMood: 'neutral',
      preferredTaskTypes: [],
      peakHours: [9, 10, 11, 14, 15, 16],
      distractionLevel: 0.3,
      workStyle: 'focused',
      environment: 'quiet',
      device: 'desktop',
    };
  }

  private initializeEnvironmentContext(): EnvironmentContext {
    const now = new Date();
    return {
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      notifications: true,
      availableTools: [],
      networkQuality: 'good',
    };
  }

  private initializeMetrics(): FlowStateMetrics {
    return {
      focusLevel: 0,
      interruptions: 0,
      taskSwitchCount: 0,
      sessionDuration: 0,
      productivityScore: 0,
      lastActivity: new Date(),
      energyLevel: 0.8,
    };
  }

  private getRecentInterruptions(timeWindow: number): Interruption[] {
    if (!this.currentSession) return [];
    
    const cutoff = Date.now() - timeWindow;
    return this.currentSession.interruptions.filter(i => i.timestamp.getTime() > cutoff);
  }

  private getRecentTaskSwitches(timeWindow: number): number {
    // Simplified implementation
    return 0;
  }

  private setupEventListeners(): void {
    this.eventBus.on('task:interrupted', (event) => {
      this.handleTaskInterruption(event.payload);
    });

    this.eventBus.on('user:energyChange', (event) => {
      this.userContext.energyLevel = event.payload.energyLevel;
    });
  }

  private handleTaskInterruption(interruption: Interruption): void {
    if (this.currentSession) {
      this.currentSession.interruptions.push(interruption);
    }
  }

  private async saveSession(session: WorkflowSession): Promise<void> {
    // Save session to database or storage
    console.log('Saving session:', session.id);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  /**
   * Get current session info
   */
  getCurrentSession(): WorkflowSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get flow state metrics
   */
  getFlowMetrics(): FlowStateMetrics | null {
    return this.currentSession ? { ...this.currentSession.metrics } : null;
  }

  /**
   * Get productivity insights
   */
  getProductivityInsights(): {
    averageFocusLevel: number;
    interruptionRate: number;
    completionRate: number;
    recommendedBreakTime: Date | null;
  } {
    const avgFocus = this.calculateAverageFocusLevel();
    const interruptionRate = this.currentSession ? 
      this.currentSession.interruptions.length / Math.max(this.currentSession.flowStates.length, 1) : 0;
    
    return {
      averageFocusLevel: avgFocus,
      interruptionRate,
      completionRate: this.currentSession ? 
        this.currentSession.completedTasks.length / Math.max(this.currentSession.tasks.length, 1) : 0,
      recommendedBreakTime: this.calculateRecommendedBreakTime(),
    };
  }

  private calculateRecommendedBreakTime(): Date | null {
    if (!this.currentSession) return null;
    
    const sessionDuration = Date.now() - this.currentSession.startTime.getTime();
    const breakInterval = this.config.autoBreakInterval * 60 * 1000; // Convert to milliseconds
    
    if (sessionDuration > breakInterval) {
      return new Date();
    }
    
    return new Date(this.currentSession.startTime.getTime() + breakInterval);
  }
}

// ==============================================================================
// SUPPORTING CLASSES
// ==============================================================================

class PriorityEngine {
  constructor(private config: FlowGuardConfig) {}

  async prioritizeTasks(
    tasks: Task[],
    userContext: UserContext,
    environmentContext: EnvironmentContext,
    limit?: number
  ): Promise<Task[]> {
    let prioritized: Task[];

    switch (this.config.priorityAlgorithm) {
      case 'eisenhower':
        prioritized = this.eisenhowerSort(tasks);
        break;
      case 'weighted':
        prioritized = this.weightedSort(tasks, userContext);
        break;
      case 'deadline':
        prioritized = this.deadlineSort(tasks);
        break;
      case 'energy_based':
        prioritized = this.energyBasedSort(tasks, userContext);
        break;
      default:
        prioritized = this.weightedSort(tasks, userContext);
    }

    return limit ? prioritized.slice(0, limit) : prioritized;
  }

  async updateTaskPriority(
    task: Task,
    userContext: UserContext,
    environmentContext: EnvironmentContext
  ): Promise<void> {
    // Adaptive priority adjustment based on context
    const timeBoost = task.deadline ? this.calculateDeadlineBoost(task.deadline) : 0;
    const energyMatch = this.calculateEnergyMatch(task, userContext);
    
    task.urgency = Math.min(1, task.urgency + timeBoost);
    task.importance = Math.min(1, task.importance + energyMatch);
  }

  private eisenhowerSort(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      const scoreA = a.urgency + a.importance;
      const scoreB = b.urgency + b.importance;
      return scoreB - scoreA;
    });
  }

  private weightedSort(tasks: Task[], userContext: UserContext): Task[] {
    return tasks.sort((a, b) => {
      const scoreA = this.calculateWeightedScore(a, userContext);
      const scoreB = this.calculateWeightedScore(b, userContext);
      return scoreB - scoreA;
    });
  }

  private deadlineSort(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });
  }

  private energyBasedSort(tasks: Task[], userContext: UserContext): Task[] {
    return tasks.sort((a, b) => {
      const matchA = Math.abs(a.energyRequired - userContext.energyLevel);
      const matchB = Math.abs(b.energyRequired - userContext.energyLevel);
      return matchA - matchB;
    });
  }

  private calculateWeightedScore(task: Task, userContext: UserContext): number {
    let score = 0;
    
    // Base priority (40% weight)
    score += (task.urgency * 0.6 + task.importance * 0.4) * 0.4;
    
    // Energy match (20% weight)
    const energyMatch = 1 - Math.abs(task.energyRequired - userContext.energyLevel);
    score += energyMatch * 0.2;
    
    // Time fit (20% weight)
    const timeFit = task.estimatedDuration <= userContext.availableTime ? 1 : 0.5;
    score += timeFit * 0.2;
    
    // Deadline urgency (20% weight)
    const deadlineBoost = task.deadline ? this.calculateDeadlineBoost(task.deadline) : 0;
    score += deadlineBoost * 0.2;
    
    return score;
  }

  private calculateDeadlineBoost(deadline: Date): number {
    const hoursUntilDeadline = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilDeadline < 2) return 0.5;
    if (hoursUntilDeadline < 24) return 0.3;
    if (hoursUntilDeadline < 72) return 0.1;
    return 0;
  }

  private calculateEnergyMatch(task: Task, userContext: UserContext): number {
    return 1 - Math.abs(task.energyRequired - userContext.energyLevel);
  }
}

class InterruptionManager {
  constructor(private config: FlowGuardConfig) {}

  async evaluateInterruption(interruption: Interruption): Promise<boolean> {
    if (!this.config.enableFlowProtection) {
      return true;
    }

    // High priority interruptions always allowed
    if (interruption.impact === 'severe') {
      return true;
    }

    // Check interruption frequency
    const recentInterruptions = this.getRecentInterruptions(600000); // Last 10 minutes
    if (recentInterruptions.length >= this.config.maxInterruptions) {
      return false;
    }

    // Context-based evaluation
    return this.evaluateContextualPriority(interruption);
  }

  private getRecentInterruptions(timeWindow: number): Interruption[] {
    // This would query recent interruptions from storage
    return [];
  }

  private evaluateContextualPriority(interruption: Interruption): boolean {
    // Simplified evaluation - in production would be more sophisticated
    return interruption.impact !== 'low';
  }
}

class AdaptiveScheduler {
  constructor(private config: FlowGuardConfig) {}

  async learnFromCompletion(task: Task, userContext: UserContext): Promise<void> {
    if (!this.config.learningEnabled) return;

    // Learn from task duration accuracy
    if (task.actualDuration && task.estimatedDuration) {
      const accuracy = Math.abs(task.actualDuration - task.estimatedDuration * 60000) / (task.estimatedDuration * 60000);
      
      // Store learning data for future estimations
      console.log(`Task ${task.id} estimation accuracy: ${(1 - accuracy) * 100}%`);
    }

    // Learn from energy requirements
    const energyMatch = 1 - Math.abs(task.energyRequired - userContext.energyLevel);
    console.log(`Task ${task.id} energy match: ${energyMatch * 100}%`);
  }
}