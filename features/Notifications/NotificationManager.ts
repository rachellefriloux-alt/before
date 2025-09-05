/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Manages notifications for user engagement and reminders.
 * Got it, love.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUniqueId } from '../../utils/securityUtils';
import { debounce } from '../../utils/performanceUtils';

export enum NotificationType {
  REMINDER = 'REMINDER',
  ENGAGEMENT = 'ENGAGEMENT',
  ACHIEVEMENT = 'ACHIEVEMENT',
  PERSONAL_GROWTH = 'PERSONAL_GROWTH',
  MILESTONE = 'MILESTONE',
  INSIGHT = 'INSIGHT',
  CHECK_IN = 'CHECK_IN'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH'
}

export interface NotificationConfig {
  enableSound: boolean;
  enableVibration: boolean;
  quietHoursStart: number; // Hour in 24h format (0-23)
  quietHoursEnd: number; // Hour in 24h format (0-23)
  daysEnabled: boolean[]; // Index 0 is Sunday, 1 is Monday, etc.
  defaultPriority: NotificationPriority;
  categories: {
    [key in NotificationType]: {
      enabled: boolean;
      maxPerDay: number;
    };
  };
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  expireAfter?: Date;
  persistent?: boolean;
  actionButtons?: {
    identifier: string;
    title: string;
    options?: any;
  }[];
}

export interface ScheduledNotification extends NotificationPayload {
  scheduledId: string;
  scheduledTime: number;
}

class NotificationManager {
  private static instance: NotificationManager;
  private initialized: boolean = false;
  private permissionGranted: boolean = false;
  private config: NotificationConfig;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private sentNotificationsToday: Map<NotificationType, number> = new Map();
  private notificationListeners: Set<Function> = new Set();
  
  // Default configuration
  private readonly DEFAULT_CONFIG: NotificationConfig = {
    enableSound: true,
    enableVibration: true,
    quietHoursStart: 22, // 10 PM
    quietHoursEnd: 8, // 8 AM
    daysEnabled: [true, true, true, true, true, true, true], // All days enabled
    defaultPriority: NotificationPriority.NORMAL,
    categories: {
      [NotificationType.REMINDER]: { enabled: true, maxPerDay: 5 },
      [NotificationType.ENGAGEMENT]: { enabled: true, maxPerDay: 3 },
      [NotificationType.ACHIEVEMENT]: { enabled: true, maxPerDay: 3 },
      [NotificationType.PERSONAL_GROWTH]: { enabled: true, maxPerDay: 2 },
      [NotificationType.MILESTONE]: { enabled: true, maxPerDay: 2 },
      [NotificationType.INSIGHT]: { enabled: true, maxPerDay: 3 },
      [NotificationType.CHECK_IN]: { enabled: true, maxPerDay: 2 }
    }
  };
  
  private constructor() {
    this.config = {...this.DEFAULT_CONFIG};
    
    // Initialize debounced methods
    this.debouncedSaveConfig = debounce(this.saveConfigToStorage.bind(this), 1000);
    
    // Initialize scheduleDailyReset with empty function
    this.scheduleDailyReset = () => {};
  }
  
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  /**
   * Initialize the notification manager
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.permissionGranted;
    }
    
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => {
          const notificationBehavior: Notifications.NotificationBehavior = {
            shouldShowAlert: true,
            shouldPlaySound: this.config.enableSound,
            shouldSetBadge: true,
          };
          
          // Only add priority for Android
          if (Platform.OS === 'android') {
            notificationBehavior.priority = this.getPriorityLevel(this.config.defaultPriority);
          }
          
          return notificationBehavior;
        },
      });
      
      // Load saved configuration
      await this.loadConfig();
      
      // Reset daily notification counters at midnight
      this.setupDailyReset();
      
      // Load scheduled notifications
      await this.loadScheduledNotifications();
      
      // Request permissions
      const permissionStatus = await this.requestPermissions();
      this.permissionGranted = permissionStatus;
      
      // Set up notification received handler
      Notifications.addNotificationReceivedListener(this.handleNotificationReceived.bind(this));
      
      // Set up notification response handler (when user taps notification)
      Notifications.addNotificationResponseReceivedListener(
        this.handleNotificationResponse.bind(this)
      );
      
      this.initialized = true;
      return permissionStatus;
    } catch (error) {
      console.error('Failed to initialize NotificationManager:', error);
      this.initialized = false;
      this.permissionGranted = false;
      return false;
    }
  }
  
  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const settings = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      
      return settings.granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
  
  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const storedConfig = await AsyncStorage.getItem('SALLIE_NOTIFICATION_CONFIG');
      if (storedConfig) {
        this.config = { ...this.DEFAULT_CONFIG, ...JSON.parse(storedConfig) };
      }
      
      const notificationCountsToday = await AsyncStorage.getItem('SALLIE_NOTIFICATION_COUNTS_TODAY');
      if (notificationCountsToday) {
        const counts = JSON.parse(notificationCountsToday);
        Object.entries(counts).forEach(([type, count]) => {
          this.sentNotificationsToday.set(type as NotificationType, count as number);
        });
      }
    } catch (error) {
      console.error('Error loading notification config:', error);
      this.config = { ...this.DEFAULT_CONFIG };
    }
  }
  
  /**
   * Save configuration to storage (debounced)
   */
  private debouncedSaveConfig: () => void;
  
  /**
   * Actual implementation of saving config
   */
  private async saveConfigToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('SALLIE_NOTIFICATION_CONFIG', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving notification config:', error);
    }
  }
  
  /**
   * Save notification counts to storage
   */
  private async saveNotificationCounts(): Promise<void> {
    try {
      const counts: {[key: string]: number} = {};
      this.sentNotificationsToday.forEach((count, type) => {
        counts[type] = count;
      });
      
      await AsyncStorage.setItem('SALLIE_NOTIFICATION_COUNTS_TODAY', JSON.stringify(counts));
    } catch (error) {
      console.error('Error saving notification counts:', error);
    }
  }
  
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.debouncedSaveConfig();
  }
  
  /**
   * Schedule a notification
   */
  public async scheduleNotification(notification: NotificationPayload): Promise<string | null> {
    if (!this.initialized || !this.permissionGranted) {
      console.warn('Cannot schedule notification: not initialized or permission not granted');
      return null;
    }
    
    // Check if we're in quiet hours
    if (this.isQuietHours()) {
      console.log('Not scheduling notification during quiet hours');
      return null;
    }
    
    // Check if the notification type is enabled
    if (!this.config.categories[notification.type]?.enabled) {
      console.log(`Notifications of type ${notification.type} are disabled`);
      return null;
    }
    
    // Check if we've reached the max limit for this type today
    const currentCount = this.sentNotificationsToday.get(notification.type) || 0;
    const maxAllowed = this.config.categories[notification.type].maxPerDay;
    if (currentCount >= maxAllowed) {
      console.log(`Max notifications (${maxAllowed}) for ${notification.type} reached today`);
      return null;
    }
    
    try {
      const priority = notification.priority || this.config.defaultPriority;
      
      const scheduledTime = notification.scheduledFor ? notification.scheduledFor.getTime() : Date.now();
      
      // Add notification to scheduled list
      const notificationId = notification.id || generateUniqueId();
      
      let identifier: string;
      
      // If scheduled for the future
      if (notification.scheduledFor && notification.scheduledFor > new Date()) {
        identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            sound: this.config.enableSound,
            vibrate: this.config.enableVibration ? [0, 250, 250, 250] : undefined,
            priority: this.getPriorityLevel(priority),
            ...this.getActionButtons(notification),
          },
          trigger: {
            date: notification.scheduledFor,
            channelId: notification.type.toLowerCase(),
          },
        });
        
        // Store scheduled notification
        this.scheduledNotifications.set(notificationId, {
          ...notification,
          scheduledId: identifier,
          scheduledTime,
        });
        
        // Save to storage
        this.saveScheduledNotifications();
        
      } else {
        // Send immediately
        identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            sound: this.config.enableSound,
            vibrate: this.config.enableVibration ? [0, 250, 250, 250] : undefined,
            priority: this.getPriorityLevel(priority),
            ...this.getActionButtons(notification),
          },
          trigger: null, // Send immediately
        });
        
        // Increment count for this notification type
        this.sentNotificationsToday.set(
          notification.type,
          (this.sentNotificationsToday.get(notification.type) || 0) + 1
        );
        
        // Save counts
        this.saveNotificationCounts();
      }
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }
  
  /**
   * Schedule a reminder notification for a specific date/time
   */
  public async scheduleReminder(
    title: string,
    body: string,
    dateTime: Date,
    data?: any
  ): Promise<string | null> {
    const notification: NotificationPayload = {
      id: generateUniqueId(),
      type: NotificationType.REMINDER,
      title,
      body,
      data,
      scheduledFor: dateTime,
      priority: NotificationPriority.NORMAL,
    };
    
    return this.scheduleNotification(notification);
  }
  
  /**
   * Send an engagement notification now
   */
  public async sendEngagementNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string | null> {
    const notification: NotificationPayload = {
      id: generateUniqueId(),
      type: NotificationType.ENGAGEMENT,
      title,
      body,
      data,
      priority: NotificationPriority.NORMAL,
    };
    
    return this.scheduleNotification(notification);
  }
  
  /**
   * Send an achievement notification
   */
  public async sendAchievementNotification(
    achievement: string,
    message: string,
    data?: any
  ): Promise<string | null> {
    const notification: NotificationPayload = {
      id: generateUniqueId(),
      type: NotificationType.ACHIEVEMENT,
      title: `Achievement Unlocked: ${achievement}`,
      body: message,
      data: { ...data, achievementName: achievement },
      priority: NotificationPriority.HIGH,
    };
    
    return this.scheduleNotification(notification);
  }
  
  /**
   * Send a personal growth notification
   */
  public async sendPersonalGrowthNotification(
    insight: string,
    message: string,
    data?: any
  ): Promise<string | null> {
    const notification: NotificationPayload = {
      id: generateUniqueId(),
      type: NotificationType.PERSONAL_GROWTH,
      title: `Personal Growth Insight`,
      body: message,
      data: { ...data, insight },
      priority: NotificationPriority.NORMAL,
    };
    
    return this.scheduleNotification(notification);
  }
  
  /**
   * Cancel a scheduled notification
   */
  public async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      const scheduledNotification = this.scheduledNotifications.get(notificationId);
      if (scheduledNotification) {
        await Notifications.cancelScheduledNotificationAsync(scheduledNotification.scheduledId);
        this.scheduledNotifications.delete(notificationId);
        this.saveScheduledNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }
  
  /**
   * Cancel all scheduled notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
      this.saveScheduledNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }
  
  /**
   * Load scheduled notifications from storage
   */
  private async loadScheduledNotifications(): Promise<void> {
    try {
      const storedNotifications = await AsyncStorage.getItem('SALLIE_SCHEDULED_NOTIFICATIONS');
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications) as ScheduledNotification[];
        parsed.forEach(notification => {
          this.scheduledNotifications.set(notification.id, notification);
        });
        
        // Clean up expired notifications
        this.cleanupExpiredNotifications();
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  }
  
  /**
   * Save scheduled notifications to storage
   */
  private async saveScheduledNotifications(): Promise<void> {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      await AsyncStorage.setItem('SALLIE_SCHEDULED_NOTIFICATIONS', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }
  
  /**
   * Clean up expired notifications
   */
  private async cleanupExpiredNotifications(): Promise<void> {
    const now = Date.now();
    const expired: string[] = [];
    
    this.scheduledNotifications.forEach((notification, id) => {
      if (notification.expireAfter && new Date(notification.expireAfter).getTime() < now) {
        expired.push(id);
      }
    });
    
    for (const id of expired) {
      await this.cancelNotification(id);
    }
  }
  
  /**
   * Handle notification received
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const data = notification.request.content.data;
    
    // Notify all listeners
    this.notificationListeners.forEach(listener => {
      try {
        listener('received', notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }
  
  /**
   * Handle notification response (user tapped notification)
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    // Notify all listeners
    this.notificationListeners.forEach(listener => {
      try {
        listener('response', response);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }
  
  /**
   * Add notification listener
   * @returns A function to remove the listener
   */
  public addNotificationListener(listener: Function): () => void {
    this.notificationListeners.add(listener);
    
    return () => {
      this.notificationListeners.delete(listener);
    };
  }
  
  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Check if notifications are enabled for this day
    if (!this.config.daysEnabled[dayOfWeek]) {
      return true; // Treat as quiet hours if day is disabled
    }
    
    // Handle wraparound case (e.g., quiet hours 22-8)
    if (this.config.quietHoursStart > this.config.quietHoursEnd) {
      return hour >= this.config.quietHoursStart || hour < this.config.quietHoursEnd;
    } else {
      // Normal case (e.g., quiet hours 0-6)
      return hour >= this.config.quietHoursStart && hour < this.config.quietHoursEnd;
    }
  }
  
  /**
   * Set up daily reset of notification counters
   */
  private setupDailyReset(): void {
    const resetCounters = async () => {
      this.sentNotificationsToday.clear();
      await this.saveNotificationCounts();
      
      // Schedule next reset
      this.scheduleDailyReset();
    };
    
    this.scheduleDailyReset = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      setTimeout(resetCounters, timeUntilMidnight);
    };
    
    // Start the first reset timer
    this.scheduleDailyReset();
  }
  
  private scheduleDailyReset: () => void;
  
  /**
   * Get notification priority level for the platform
   */
  private getPriorityLevel(priority: NotificationPriority): Notifications.AndroidNotificationPriority | undefined {
    if (Platform.OS === 'android') {
      switch (priority) {
        case NotificationPriority.LOW:
          return Notifications.AndroidNotificationPriority.LOW;
        case NotificationPriority.HIGH:
          return Notifications.AndroidNotificationPriority.HIGH;
        default:
          return Notifications.AndroidNotificationPriority.DEFAULT;
      }
    } else {
      // iOS doesn't use the same priority system, return undefined
      return undefined;
    }
  }
  
  /**
   * Get action buttons configuration for the notification
   */
  private getActionButtons(notification: NotificationPayload): any {
    if (!notification.actionButtons || notification.actionButtons.length === 0) {
      return {};
    }
    
    if (Platform.OS === 'android') {
      return {
        categoryIdentifier: `sallie_${notification.type.toLowerCase()}`,
      };
    } else {
      return {
        categoryIdentifier: `sallie_${notification.type.toLowerCase()}`,
      };
    }
  }
  
  /**
   * Get all scheduled notifications
   */
  public getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }
  
  /**
   * Get notification counts for today
   */
  public getNotificationCounts(): Map<NotificationType, number> {
    return new Map(this.sentNotificationsToday);
  }
  
  /**
   * Get current notification configuration
   */
  public getConfig(): NotificationConfig {
    return { ...this.config };
  }
}

export default NotificationManager;
