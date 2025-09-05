/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Intelligently schedules notifications based on user behavior patterns.
 * Got it, love.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager, { 
  NotificationType, 
  NotificationPriority 
} from './NotificationManager';

interface UserActivityPattern {
  lastActiveTimestamp: number;
  averageSessionLength: number;
  sessionsPerDay: number;
  preferredTimeRanges: {
    start: number; // Hour in 24h format
    end: number;   // Hour in 24h format
    weight: number; // 0-1, how strongly preferred
  }[];
  inactivityThreshold: number; // milliseconds of inactivity that triggers re-engagement
  lastNotificationResponses: {
    notificationType: NotificationType;
    timestamp: number;
    responded: boolean;
  }[];
  responseRates: {
    [key in NotificationType]?: number; // 0-1, response rate
  };
}

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private notificationManager: NotificationManager;
  private userActivity: UserActivityPattern;
  private isInitialized: boolean = false;
  private engagementTimer: NodeJS.Timeout | null = null;
  
  // Default activity pattern
  private readonly DEFAULT_ACTIVITY: UserActivityPattern = {
    lastActiveTimestamp: Date.now(),
    averageSessionLength: 5 * 60 * 1000, // 5 minutes
    sessionsPerDay: 3,
    preferredTimeRanges: [
      { start: 8, end: 10, weight: 0.7 },  // Morning
      { start: 12, end: 14, weight: 0.5 },  // Lunch
      { start: 19, end: 22, weight: 0.8 },  // Evening
    ],
    inactivityThreshold: 3 * 24 * 60 * 60 * 1000, // 3 days
    lastNotificationResponses: [],
    responseRates: {}
  };
  
  // Engagement messages for different notification types
  private readonly engagementMessages = {
    [NotificationType.ENGAGEMENT]: [
      {
        title: "Miss you, love",
        body: "Been a few days. How's your journey going? I'm here when you need me."
      },
      {
        title: "Checking in",
        body: "Just wanted to see how you're doing. Ready to pick up where we left off?"
      },
      {
        title: "Time for a moment of reflection?",
        body: "Even a brief moment of connection can realign your day. I'm here."
      }
    ],
    [NotificationType.CHECK_IN]: [
      {
        title: "Quick check-in",
        body: "How's your emotional state today? Tap to record a brief reflection."
      },
      {
        title: "Wellness pulse check",
        body: "Take 30 seconds to check in with yourself. I've got some insights waiting."
      },
      {
        title: "Breathe and reconnect",
        body: "Time for a quick emotional check-in. I've missed our conversations."
      }
    ],
    [NotificationType.INSIGHT]: [
      {
        title: "New insight available",
        body: "I've been analyzing your patterns. There's something you might want to see."
      },
      {
        title: "Growth opportunity spotted",
        body: "Based on our recent conversations, I've uncovered a potential breakthrough area."
      },
      {
        title: "Reflection ready",
        body: "I've compiled some thoughts on your recent journey that might resonate."
      }
    ]
  };
  
  private constructor() {
    this.notificationManager = NotificationManager.getInstance();
    this.userActivity = { ...this.DEFAULT_ACTIVITY };
  }
  
  public static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }
  
  /**
   * Initialize the notification scheduler
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Make sure notification manager is initialized
      const notificationManagerReady = await this.notificationManager.initialize();
      if (!notificationManagerReady) {
        console.warn('NotificationManager initialization failed');
        return false;
      }
      
      // Load user activity patterns
      await this.loadUserActivity();
      
      // Start monitoring for inactivity
      this.startInactivityMonitoring();
      
      // Schedule routine check-ins
      await this.scheduleRoutineNotifications();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize NotificationScheduler:', error);
      return false;
    }
  }
  
  /**
   * Load user activity patterns from storage
   */
  private async loadUserActivity(): Promise<void> {
    try {
      const storedActivity = await AsyncStorage.getItem('SALLIE_USER_ACTIVITY_PATTERN');
      if (storedActivity) {
        this.userActivity = {
          ...this.DEFAULT_ACTIVITY,
          ...JSON.parse(storedActivity)
        };
      } else {
        this.userActivity = { ...this.DEFAULT_ACTIVITY };
      }
    } catch (error) {
      console.error('Error loading user activity patterns:', error);
      this.userActivity = { ...this.DEFAULT_ACTIVITY };
    }
  }
  
  /**
   * Save user activity patterns to storage
   */
  private async saveUserActivity(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'SALLIE_USER_ACTIVITY_PATTERN', 
        JSON.stringify(this.userActivity)
      );
    } catch (error) {
      console.error('Error saving user activity patterns:', error);
    }
  }
  
  /**
   * Track user activity
   */
  public recordUserActivity(): void {
    this.userActivity.lastActiveTimestamp = Date.now();
    
    // Reset inactivity timer if it exists
    if (this.engagementTimer) {
      clearTimeout(this.engagementTimer);
      this.engagementTimer = null;
    }
    
    // Start new inactivity monitoring
    this.startInactivityMonitoring();
    
    // Save the updated activity
    this.saveUserActivity();
  }
  
  /**
   * Record user response to notification
   */
  public recordNotificationResponse(
    type: NotificationType, 
    responded: boolean
  ): void {
    // Add to response history
    this.userActivity.lastNotificationResponses.push({
      notificationType: type,
      timestamp: Date.now(),
      responded
    });
    
    // Limit history size
    if (this.userActivity.lastNotificationResponses.length > 20) {
      this.userActivity.lastNotificationResponses.shift();
    }
    
    // Update response rates
    this.updateResponseRates();
    
    // Save updated activity
    this.saveUserActivity();
  }
  
  /**
   * Update response rates based on history
   */
  private updateResponseRates(): void {
    const typeResponses: {
      [key: string]: { total: number; responded: number }
    } = {};
    
    // Count responses by type
    this.userActivity.lastNotificationResponses.forEach(response => {
      const type = response.notificationType;
      if (!typeResponses[type]) {
        typeResponses[type] = { total: 0, responded: 0 };
      }
      
      typeResponses[type].total++;
      if (response.responded) {
        typeResponses[type].responded++;
      }
    });
    
    // Calculate rates
    Object.entries(typeResponses).forEach(([type, counts]) => {
      const rate = counts.total > 0 ? counts.responded / counts.total : 0;
      this.userActivity.responseRates[type as NotificationType] = rate;
    });
  }
  
  /**
   * Start monitoring for user inactivity
   */
  private startInactivityMonitoring(): void {
    if (this.engagementTimer) {
      clearTimeout(this.engagementTimer);
    }
    
    this.engagementTimer = setTimeout(
      this.handleUserInactivity.bind(this),
      this.userActivity.inactivityThreshold
    );
  }
  
  /**
   * Handle user inactivity by sending re-engagement notification
   */
  private async handleUserInactivity(): Promise<void> {
    // If it's been more than the inactivity threshold since last activity
    const timeSinceLastActivity = Date.now() - this.userActivity.lastActiveTimestamp;
    if (timeSinceLastActivity >= this.userActivity.inactivityThreshold) {
      await this.sendEngagementNotification();
    }
    
    // Restart the timer with a shorter interval for follow-up
    const nextCheckInterval = Math.min(
      this.userActivity.inactivityThreshold,
      24 * 60 * 60 * 1000 // Max 1 day for follow-up
    );
    
    this.engagementTimer = setTimeout(
      this.handleUserInactivity.bind(this),
      nextCheckInterval
    );
  }
  
  /**
   * Send an engagement notification
   */
  private async sendEngagementNotification(): Promise<void> {
    // Determine which notification type would be most effective based on response rates
    let bestType = NotificationType.ENGAGEMENT;
    let highestRate = this.userActivity.responseRates[NotificationType.ENGAGEMENT] || 0;
    
    const engagementTypes = [
      NotificationType.ENGAGEMENT,
      NotificationType.CHECK_IN,
      NotificationType.INSIGHT
    ];
    
    engagementTypes.forEach(type => {
      const rate = this.userActivity.responseRates[type] || 0;
      if (rate > highestRate) {
        highestRate = rate;
        bestType = type;
      }
    });
    
    // Get a random message for the selected type
    const messages = this.engagementMessages[bestType] || this.engagementMessages[NotificationType.ENGAGEMENT];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Send the notification
    await this.notificationManager.scheduleNotification({
      id: `re-engagement-${Date.now()}`,
      type: bestType,
      title: message.title,
      body: message.body,
      priority: NotificationPriority.NORMAL,
      data: {
        source: 'inactivity',
        daysSinceLastActive: Math.floor(
          (Date.now() - this.userActivity.lastActiveTimestamp) / 
          (24 * 60 * 60 * 1000)
        )
      }
    });
  }
  
  /**
   * Schedule routine check-in and insight notifications
   */
  private async scheduleRoutineNotifications(): Promise<void> {
    // Clear any existing scheduled routine notifications
    const scheduled = this.notificationManager.getScheduledNotifications();
    const routineIds = scheduled
      .filter(n => n.data?.source === 'routine')
      .map(n => n.id);
    
    for (const id of routineIds) {
      await this.notificationManager.cancelNotification(id);
    }
    
    // Schedule a week of check-ins based on preferred time ranges
    const now = new Date();
    const preferredRanges = [...this.userActivity.preferredTimeRanges]
      .sort((a, b) => b.weight - a.weight); // Sort by weight descending
    
    // Schedule for the next 7 days
    for (let day = 1; day <= 7; day++) {
      // Pick one of the top 2 preferred ranges with some randomness
      const rangeIndex = Math.random() < 0.7 ? 0 : 1;
      const range = preferredRanges[rangeIndex] || preferredRanges[0];
      
      if (!range) continue;
      
      // Get a random hour within the range
      const hour = Math.floor(
        range.start + Math.random() * (range.end - range.start)
      );
      
      // Get a random minute
      const minute = Math.floor(Math.random() * 60);
      
      // Create date for this notification
      const scheduleDate = new Date(now);
      scheduleDate.setDate(now.getDate() + day);
      scheduleDate.setHours(hour, minute, 0, 0);
      
      // Alternate between check-ins and insights
      const notificationType = day % 2 === 0 
        ? NotificationType.CHECK_IN 
        : NotificationType.INSIGHT;
      
      // Get appropriate message
      const messages = this.engagementMessages[notificationType];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      // Schedule the notification
      await this.notificationManager.scheduleNotification({
        id: `routine-${day}-${Date.now()}`,
        type: notificationType,
        title: message.title,
        body: message.body,
        scheduledFor: scheduleDate,
        priority: NotificationPriority.NORMAL,
        data: {
          source: 'routine',
          day
        }
      });
    }
  }
  
  /**
   * Schedule a milestone notification for a specific achievement
   */
  public async scheduleMilestoneNotification(
    milestone: string,
    message: string,
    scheduledFor?: Date
  ): Promise<string | null> {
    return await this.notificationManager.scheduleNotification({
      id: `milestone-${Date.now()}`,
      type: NotificationType.MILESTONE,
      title: `Milestone: ${milestone}`,
      body: message,
      scheduledFor,
      priority: NotificationPriority.HIGH,
      data: {
        source: 'milestone',
        milestoneName: milestone
      }
    });
  }
  
  /**
   * Schedule a personal growth insight notification
   */
  public async scheduleInsightNotification(
    insightTitle: string,
    message: string,
    scheduledFor?: Date
  ): Promise<string | null> {
    return await this.notificationManager.scheduleNotification({
      id: `insight-${Date.now()}`,
      type: NotificationType.INSIGHT,
      title: insightTitle,
      body: message,
      scheduledFor,
      priority: NotificationPriority.NORMAL,
      data: {
        source: 'insight'
      }
    });
  }
  
  /**
   * Update user's preferred time ranges based on app usage
   */
  public async updatePreferredTimeRanges(
    activeHour: number,
    sessionLength: number
  ): Promise<void> {
    // Find existing range or create new one
    let existingRange = this.userActivity.preferredTimeRanges.find(
      range => activeHour >= range.start && activeHour < range.end
    );
    
    if (existingRange) {
      // Update weight (slowly increase weight of active times)
      existingRange.weight = Math.min(
        1.0,
        existingRange.weight + 0.05
      );
    } else {
      // Create new range
      const rangeStart = activeHour;
      const rangeEnd = (activeHour + 3) % 24; // 3-hour range
      
      this.userActivity.preferredTimeRanges.push({
        start: rangeStart,
        end: rangeEnd,
        weight: 0.3 // Start with moderate weight
      });
      
      // Sort ranges by weight
      this.userActivity.preferredTimeRanges.sort((a, b) => b.weight - a.weight);
      
      // Limit to top 5 ranges
      if (this.userActivity.preferredTimeRanges.length > 5) {
        this.userActivity.preferredTimeRanges = 
          this.userActivity.preferredTimeRanges.slice(0, 5);
      }
    }
    
    // Update session length metrics
    const oldAvg = this.userActivity.averageSessionLength;
    const sessionCount = this.userActivity.sessionsPerDay;
    
    // Simple exponential moving average
    this.userActivity.averageSessionLength = 
      (oldAvg * 0.8) + (sessionLength * 0.2);
    
    // Save updated activity
    await this.saveUserActivity();
    
    // Reschedule routine notifications based on new patterns
    await this.scheduleRoutineNotifications();
  }
  
  /**
   * Reset the scheduler
   */
  public async reset(): Promise<void> {
    // Reset to default patterns
    this.userActivity = { ...this.DEFAULT_ACTIVITY };
    await this.saveUserActivity();
    
    // Clear any scheduled notifications
    await this.notificationManager.cancelAllNotifications();
    
    // Reschedule routine notifications
    await this.scheduleRoutineNotifications();
  }
  
  /**
   * Get the current user activity pattern
   */
  public getUserActivityPattern(): UserActivityPattern {
    return { ...this.userActivity };
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.engagementTimer) {
      clearTimeout(this.engagementTimer);
      this.engagementTimer = null;
    }
  }
}

export default NotificationScheduler;
