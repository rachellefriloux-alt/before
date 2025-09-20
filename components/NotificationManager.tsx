/*
 * Sallie AI Push Notification System
 * Handles local and push notifications with scheduling and management
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface NotificationData {
    id: string;
    title: string;
    body: string;
    data?: any;
    scheduledTime?: Date;
    repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
    category?: string;
    priority?: 'default' | 'high' | 'low';
}

export interface NotificationSettings {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    showPreview: boolean;
    quietHours: {
        enabled: boolean;
        start: string; // HH:MM format
        end: string;   // HH:MM format
    };
}

export class NotificationManager {
    private static instance: NotificationManager;
    private settings: NotificationSettings;
    private scheduledNotifications: Map<string, string> = new Map(); // id -> notificationId

    private readonly STORAGE_KEYS = {
        SETTINGS: 'sallie_notification_settings',
        SCHEDULED: 'sallie_scheduled_notifications'
    };

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    constructor() {
        this.settings = this.getDefaultSettings();
        this.initialize();
    }

    private getDefaultSettings(): NotificationSettings {
        return {
            enabled: true,
            sound: true,
            vibration: true,
            showPreview: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            }
        };
    }

    private async initialize(): Promise<void> {
        // Request permissions
        await this.requestPermissions();

        // Configure notification handler
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: this.settings.enabled && this.settings.showPreview,
                shouldPlaySound: this.settings.sound,
                shouldSetBadge: false,
                shouldShowBanner: this.settings.enabled && this.settings.showPreview,
                shouldShowList: this.settings.enabled,
            }),
        });

        // Load settings and scheduled notifications
        await this.loadSettings();
        await this.loadScheduledNotifications();

        // Set up notification listeners
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
            this.handleNotificationResponse(response);
        });

        // Clean up on app close - this would be handled by the caller
        // Return cleanup function for future use
        const cleanup = () => {
            subscription.remove();
            responseSubscription.remove();
        };

        // Store cleanup for later use
        (this as any).cleanup = cleanup;
    }

    private async requestPermissions(): Promise<boolean> {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Notification permissions not granted');
            return false;
        }

        return true;
    }

    private async loadSettings(): Promise<void> {
        try {
            const settingsData = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            if (settingsData) {
                this.settings = { ...this.settings, ...JSON.parse(settingsData) };
            }
        } catch (error) {
            console.warn('Failed to load notification settings:', error);
        }
    }

    private async saveSettings(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save notification settings:', error);
        }
    }

    private async loadScheduledNotifications(): Promise<void> {
        try {
            const scheduledData = await AsyncStorage.getItem(this.STORAGE_KEYS.SCHEDULED);
            if (scheduledData) {
                const scheduled = JSON.parse(scheduledData);
                this.scheduledNotifications = new Map(Object.entries(scheduled));
            }
        } catch (error) {
            console.warn('Failed to load scheduled notifications:', error);
        }
    }

    private async saveScheduledNotifications(): Promise<void> {
        try {
            const scheduledObj = Object.fromEntries(this.scheduledNotifications);
            await AsyncStorage.setItem(this.STORAGE_KEYS.SCHEDULED, JSON.stringify(scheduledObj));
        } catch (error) {
            console.warn('Failed to save scheduled notifications:', error);
        }
    }

    async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
        this.settings = { ...this.settings, ...newSettings };
        await this.saveSettings();
    }

    getSettings(): NotificationSettings {
        return { ...this.settings };
    }

    async sendImmediateNotification(notification: Omit<NotificationData, 'id' | 'scheduledTime'>): Promise<void> {
        if (!this.settings.enabled) return;

        if (this.isQuietHour()) return;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: notification.title,
                body: notification.body,
                data: notification.data || {},
                sound: this.settings.sound ? 'default' : undefined,
                priority: this.getPriority(notification.priority),
                categoryIdentifier: notification.category
            },
            trigger: null, // Immediate
        });

        console.log('Immediate notification sent:', notificationId);
    }

    async scheduleNotification(notification: NotificationData): Promise<string> {
        if (!this.settings.enabled) {
            throw new Error('Notifications are disabled');
        }

        if (!notification.scheduledTime) {
            throw new Error('Scheduled time is required for scheduled notifications');
        }

        const trigger: any = {
            date: notification.scheduledTime
        };

        if (notification.repeat === 'daily') {
            trigger.repeats = true;
        } else if (notification.repeat === 'weekly') {
            trigger.repeats = true;
            // Weekly would need more complex trigger setup
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: notification.title,
                body: notification.body,
                data: notification.data || {},
                sound: this.settings.sound ? 'default' : undefined,
                priority: this.getPriority(notification.priority),
                categoryIdentifier: notification.category
            },
            trigger
        });

        // Store mapping
        this.scheduledNotifications.set(notification.id, notificationId);
        await this.saveScheduledNotifications();

        return notificationId;
    }

    async cancelScheduledNotification(notificationId: string): Promise<void> {
        const expoNotificationId = this.scheduledNotifications.get(notificationId);
        if (expoNotificationId) {
            await Notifications.cancelScheduledNotificationAsync(expoNotificationId);
            this.scheduledNotifications.delete(notificationId);
            await this.saveScheduledNotifications();
        }
    }

    async cancelAllScheduledNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
        this.scheduledNotifications.clear();
        await this.saveScheduledNotifications();
    }

    getScheduledNotifications(): NotificationData[] {
        // This would need to be enhanced to return full notification data
        // For now, just return the IDs
        return Array.from(this.scheduledNotifications.keys()).map(id => ({ id } as NotificationData));
    }

    private isQuietHour(): boolean {
        if (!this.settings.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMinute] = this.settings.quietHours.start.split(':').map(Number);
        const [endHour, endMinute] = this.settings.quietHours.end.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        if (startTime <= endTime) {
            // Same day quiet hours
            return currentTime >= startTime && currentTime <= endTime;
        } else {
            // Overnight quiet hours
            return currentTime >= startTime || currentTime <= endTime;
        }
    }

    private getPriority(priority?: 'default' | 'high' | 'low'): any {
        switch (priority) {
            case 'high':
                return 'high';
            case 'low':
                return 'low';
            default:
                return 'default';
        }
    }

    private handleNotificationResponse(response: Notifications.NotificationResponse): void {
        const data = response.notification.request.content.data;

        // Handle different types of notifications
        if (data.type === 'reminder') {
            // Handle reminder notification
            console.log('Reminder notification tapped');
        } else if (data.type === 'update') {
            // Handle update notification
            console.log('Update notification tapped');
        }

        // Emit event for other parts of the app to handle
        // You would typically use an event emitter or context here
    }

    async testNotification(): Promise<void> {
        await this.sendImmediateNotification({
            title: 'Test Notification',
            body: 'This is a test notification from Sallie AI',
            data: { type: 'test' }
        });
    }

    async getNotificationHistory(): Promise<Notifications.Notification[]> {
        // Get delivered notifications (limited by platform)
        const delivered = await Notifications.getPresentedNotificationsAsync();
        return delivered;
    }

    async clearNotificationHistory(): Promise<void> {
        await Notifications.dismissAllNotificationsAsync();
    }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();
