import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  category?: string;
  priority?: 'default' | 'low' | 'high';
  sound?: boolean;
  badge?: number;
  scheduledDate?: Date;
  repeatInterval?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface NotificationCategory {
  id: string;
  name: string;
  actions?: Array<{
    id: string;
    title: string;
    options?: {
      isDestructive?: boolean;
      isAuthenticationRequired?: boolean;
    };
  }>;
}

export class NotificationSystem {
  private static instance: NotificationSystem;
  private categories: NotificationCategory[] = [];

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem();
    }
    return NotificationSystem.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request permissions
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          throw new Error('Failed to get notification permissions');
        }
      }

      // Set up notification categories
      await this.setupNotificationCategories();

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Set up notification response listener
      Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
      
      // Set up notification received listener
      Notifications.addNotificationReceivedListener(this.handleNotificationReceived);

    } catch (error) {
      console.error('Error initializing notification system:', error);
    }
  }

  private async setupNotificationCategories(): Promise<void> {
    try {
      this.categories = [
        {
          id: 'general',
          name: 'General',
        },
        {
          id: 'reminder',
          name: 'Reminders',
          actions: [
            {
              id: 'snooze',
              title: 'Snooze 15 min',
            },
            {
              id: 'complete',
              title: 'Mark Complete',
            },
          ],
        },
        {
          id: 'message',
          name: 'Messages',
          actions: [
            {
              id: 'reply',
              title: 'Reply',
            },
            {
              id: 'mark_read',
              title: 'Mark as Read',
            },
          ],
        },
        {
          id: 'alarm',
          name: 'Alarms',
          actions: [
            {
              id: 'snooze',
              title: 'Snooze',
            },
            {
              id: 'dismiss',
              title: 'Dismiss',
            },
          ],
        },
      ];

      // Register categories with the system
      await Notifications.setNotificationCategoryAsync('general', []);
      await Notifications.setNotificationCategoryAsync('reminder', [
        {
          identifier: 'snooze',
          buttonTitle: 'Snooze 15 min',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'complete',
          buttonTitle: 'Mark Complete',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);
      await Notifications.setNotificationCategoryAsync('message', [
        {
          identifier: 'reply',
          buttonTitle: 'Reply',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'mark_read',
          buttonTitle: 'Mark as Read',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);
      await Notifications.setNotificationCategoryAsync('alarm', [
        {
          identifier: 'snooze',
          buttonTitle: 'Snooze',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);

    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    try {
      await Notifications.setNotificationChannelAsync('general', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('reminder', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('message', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('alarm', {
        name: 'Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

    } catch (error) {
      console.error('Error setting up Android channels:', error);
    }
  }

  async scheduleNotification(notification: NotificationData): Promise<string | null> {
    try {
      if (!notification.scheduledDate) {
        throw new Error('Scheduled date is required for scheduling notifications');
      }

      const trigger = notification.scheduledDate;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          categoryIdentifier: notification.category || 'general',
          priority: notification.priority || 'default',
          sound: notification.sound !== false,
          badge: notification.badge,
        },
        trigger: {
          // Use a time interval trigger compliant with Expo types
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: trigger?.seconds ?? 5,
          repeats: trigger?.repeats ?? false,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async sendImmediateNotification(notification: Omit<NotificationData, 'scheduledDate'>): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          categoryIdentifier: notification.category || 'general',
          priority: notification.priority || 'default',
          sound: notification.sound !== false,
          badge: notification.badge,
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async getNotificationPermissions() {
    try {
      return await Notifications.getPermissionsAsync();
    } catch (error) {
      console.error('Error getting notification permissions:', error);
      return null;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  private getRepeatIntervalSeconds(interval: string): number {
    switch (interval) {
      case 'minute':
        return 60;
      case 'hour':
        return 60 * 60;
      case 'day':
        return 24 * 60 * 60;
      case 'week':
        return 7 * 24 * 60 * 60;
      case 'month':
        return 30 * 24 * 60 * 60;
      case 'year':
        return 365 * 24 * 60 * 60;
      default:
        return 60;
    }
  }

  private handleNotificationResponse = (response: Notifications.NotificationResponse): void => {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data;

    console.log('Notification response received:', {
      actionIdentifier,
      data,
      notificationId: notification.request.identifier,
    });

    // Handle different action responses
    switch (actionIdentifier) {
      case 'snooze':
        this.handleSnoozeAction(notification.request.identifier, data);
        break;
      case 'complete':
        this.handleCompleteAction(notification.request.identifier, data);
        break;
      case 'reply':
        this.handleReplyAction(notification.request.identifier, data);
        break;
      case 'mark_read':
        this.handleMarkReadAction(notification.request.identifier, data);
        break;
      case 'dismiss':
        this.handleDismissAction(notification.request.identifier, data);
        break;
      default:
        console.log('Unknown action identifier:', actionIdentifier);
    }
  };

  private handleNotificationReceived = (notification: Notifications.Notification): void => {
    console.log('Notification received:', {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
    });
  };

  private handleSnoozeAction(notificationId: string, data: any): void {
    // Reschedule notification for 15 minutes later
    const snoozeDate = new Date(Date.now() + 15 * 60 * 1000);
    this.scheduleNotification({
      id: `${notificationId}_snooze`,
      title: data.title || 'Reminder',
      body: data.body || 'Snoozed reminder',
      data: { ...data, snoozed: true },
      category: 'reminder',
      scheduledDate: snoozeDate,
    });
  }

  private handleCompleteAction(notificationId: string, data: any): void {
    // Mark the reminder as complete
    console.log('Marking reminder as complete:', data);
    // You can implement your completion logic here
  }

  private handleReplyAction(notificationId: string, data: any): void {
    // Handle reply action
    console.log('Handling reply action:', data);
    // You can implement your reply logic here
  }

  private handleMarkReadAction(notificationId: string, data: any): void {
    // Mark message as read
    console.log('Marking message as read:', data);
    // You can implement your mark as read logic here
  }

  private handleDismissAction(notificationId: string, data: any): void {
    // Dismiss the alarm
    console.log('Dismissing alarm:', data);
    // You can implement your dismiss logic here
  }

  getCategories(): NotificationCategory[] {
    return this.categories;
  }
}

export default NotificationSystem;
