/*
 * Sallie AI Analytics and Insights System
 * Tracks user behavior, provides insights, and enables data-driven improvements
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';

export interface AnalyticsEvent {
    id: string;
    type: string;
    timestamp: number;
    userId?: string;
    sessionId: string;
    data: any;
    metadata?: {
        platform?: string;
        version?: string;
        screen?: string;
        duration?: number;
    };
}

export interface UserInsight {
    id: string;
    type: 'behavior' | 'preference' | 'performance' | 'engagement';
    title: string;
    description: string;
    confidence: number; // 0-1
    data: any;
    timestamp: number;
    actionable: boolean;
}

export interface AnalyticsSettings {
    enabled: boolean;
    trackScreenViews: boolean;
    trackUserInteractions: boolean;
    trackPerformance: boolean;
    anonymizeData: boolean;
    retentionDays: number;
    batchSize: number;
}

export class AnalyticsManager extends EventEmitter {
    private static instance: AnalyticsManager;
    private settings: AnalyticsSettings;
    private currentSessionId: string;
    private eventQueue: AnalyticsEvent[] = [];
    private insights: UserInsight[] = [];
    private isInitialized: boolean = false;

    private readonly STORAGE_KEYS = {
        SETTINGS: 'sallie_analytics_settings',
        EVENTS: 'sallie_analytics_events',
        INSIGHTS: 'sallie_analytics_insights',
        SESSION: 'sallie_current_session'
    };

    static getInstance(): AnalyticsManager {
        if (!AnalyticsManager.instance) {
            AnalyticsManager.instance = new AnalyticsManager();
        }
        return AnalyticsManager.instance;
    }

    constructor() {
        super();
        this.settings = this.getDefaultSettings();
        this.currentSessionId = this.generateSessionId();
        this.initialize();
    }

    private getDefaultSettings(): AnalyticsSettings {
        return {
            enabled: true,
            trackScreenViews: true,
            trackUserInteractions: true,
            trackPerformance: true,
            anonymizeData: true,
            retentionDays: 90,
            batchSize: 10
        };
    }

    private async initialize(): Promise<void> {
        if (this.isInitialized) return;

        await this.loadSettings();
        await this.loadEventQueue();
        await this.loadInsights();
        await this.loadSession();

        // Set up periodic batch processing
        setInterval(() => {
            this.processEventBatch();
        }, 30000); // Process every 30 seconds

        // Set up data cleanup
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000); // Daily cleanup

        this.isInitialized = true;
        this.emit('initialized');
    }

    private async loadSettings(): Promise<void> {
        try {
            const settingsData = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            if (settingsData) {
                this.settings = { ...this.settings, ...JSON.parse(settingsData) };
            }
        } catch (error) {
            console.warn('Failed to load analytics settings:', error);
        }
    }

    private async saveSettings(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save analytics settings:', error);
        }
    }

    private async loadEventQueue(): Promise<void> {
        try {
            const eventsData = await AsyncStorage.getItem(this.STORAGE_KEYS.EVENTS);
            if (eventsData) {
                this.eventQueue = JSON.parse(eventsData);
            }
        } catch (error) {
            console.warn('Failed to load event queue:', error);
        }
    }

    private async saveEventQueue(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(this.eventQueue));
        } catch (error) {
            console.warn('Failed to save event queue:', error);
        }
    }

    private async loadInsights(): Promise<void> {
        try {
            const insightsData = await AsyncStorage.getItem(this.STORAGE_KEYS.INSIGHTS);
            if (insightsData) {
                this.insights = JSON.parse(insightsData);
            }
        } catch (error) {
            console.warn('Failed to load insights:', error);
        }
    }

    private async saveInsights(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.INSIGHTS, JSON.stringify(this.insights));
        } catch (error) {
            console.warn('Failed to save insights:', error);
        }
    }

    private async loadSession(): Promise<void> {
        try {
            const sessionData = await AsyncStorage.getItem(this.STORAGE_KEYS.SESSION);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session.timestamp > Date.now() - 30 * 60 * 1000) { // 30 minutes
                    this.currentSessionId = session.id;
                }
            }
        } catch (error) {
            console.warn('Failed to load session:', error);
        }
    }

    private async saveSession(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify({
                id: this.currentSessionId,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to save session:', error);
        }
    }

    async updateSettings(newSettings: Partial<AnalyticsSettings>): Promise<void> {
        this.settings = { ...this.settings, ...newSettings };
        await this.saveSettings();
    }

    getSettings(): AnalyticsSettings {
        return { ...this.settings };
    }

    trackEvent(type: string, data: any = {}, metadata?: AnalyticsEvent['metadata']): void {
        if (!this.settings.enabled) return;

        const event: AnalyticsEvent = {
            id: this.generateEventId(),
            type,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            data: this.settings.anonymizeData ? this.anonymizeData(data) : data,
            metadata
        };

        this.eventQueue.push(event);
        this.emit('eventTracked', event);

        // Process immediately if queue is full
        if (this.eventQueue.length >= this.settings.batchSize) {
            this.processEventBatch();
        }
    }

    trackScreenView(screenName: string, duration?: number): void {
        if (!this.settings.trackScreenViews) return;

        this.trackEvent('screen_view', {
            screen: screenName,
            duration
        }, {
            screen: screenName,
            duration
        });
    }

    trackUserInteraction(interactionType: string, element: string, data?: any): void {
        if (!this.settings.trackUserInteractions) return;

        this.trackEvent('user_interaction', {
            interactionType,
            element,
            ...data
        });
    }

    trackPerformance(metric: string, value: number, context?: any): void {
        if (!this.settings.trackPerformance) return;

        this.trackEvent('performance', {
            metric,
            value,
            context
        });
    }

    startNewSession(): void {
        this.currentSessionId = this.generateSessionId();
        this.saveSession();
        this.trackEvent('session_start');
    }

    private async processEventBatch(): Promise<void> {
        if (this.eventQueue.length === 0) return;

        const batch = [...this.eventQueue];
        this.eventQueue = [];
        await this.saveEventQueue();

        try {
            // Process batch (send to analytics service)
            await this.sendBatchToAnalytics(batch);

            // Generate insights from batch
            await this.generateInsights(batch);

            this.emit('batchProcessed', { count: batch.length });

        } catch (error) {
            console.error('Failed to process analytics batch:', error);
            // Re-queue failed events
            this.eventQueue.unshift(...batch);
            await this.saveEventQueue();
            this.emit('batchFailed', error);
        }
    }

    private async sendBatchToAnalytics(batch: AnalyticsEvent[]): Promise<void> {
        // This would send data to your analytics service
        // For now, just log it
        console.log('Analytics batch:', batch);

        // In production, you would send to:
        // - Firebase Analytics
        // - Mixpanel
        // - Custom analytics server
        // - etc.
    }

    private async generateInsights(events: AnalyticsEvent[]): Promise<void> {
        const insights: UserInsight[] = [];

        // Analyze screen usage patterns
        const screenViews = events.filter(e => e.type === 'screen_view');
        if (screenViews.length > 0) {
            const screenUsage = this.analyzeScreenUsage(screenViews);
            if (screenUsage.length > 0) {
                insights.push(...screenUsage);
            }
        }

        // Analyze user interaction patterns
        const interactions = events.filter(e => e.type === 'user_interaction');
        if (interactions.length > 0) {
            const interactionInsights = this.analyzeInteractions(interactions);
            if (interactionInsights.length > 0) {
                insights.push(...interactionInsights);
            }
        }

        // Analyze performance metrics
        const performanceEvents = events.filter(e => e.type === 'performance');
        if (performanceEvents.length > 0) {
            const performanceInsights = this.analyzePerformance(performanceEvents);
            if (performanceInsights.length > 0) {
                insights.push(...performanceInsights);
            }
        }

        // Add new insights
        this.insights.push(...insights);
        await this.saveInsights();

        if (insights.length > 0) {
            this.emit('insightsGenerated', insights);
        }
    }

    private analyzeScreenUsage(screenViews: AnalyticsEvent[]): UserInsight[] {
        const insights: UserInsight[] = [];
        const screenCounts: { [key: string]: number } = {};

        // Count screen views
        screenViews.forEach(event => {
            const screen = event.data.screen;
            screenCounts[screen] = (screenCounts[screen] || 0) + 1;
        });

        // Find most used screen
        const mostUsed = Object.entries(screenCounts)
            .sort(([, a], [, b]) => b - a)[0];

        if (mostUsed && mostUsed[1] > 5) {
            insights.push({
                id: this.generateInsightId(),
                type: 'behavior',
                title: 'Most Used Screen',
                description: `You spend most of your time on the ${mostUsed[0]} screen`,
                confidence: Math.min(mostUsed[1] / 10, 1),
                data: { screen: mostUsed[0], count: mostUsed[1] },
                timestamp: Date.now(),
                actionable: true
            });
        }

        return insights;
    }

    private analyzeInteractions(interactions: AnalyticsEvent[]): UserInsight[] {
        const insights: UserInsight[] = [];
        const interactionCounts: { [key: string]: number } = {};

        // Count interaction types
        interactions.forEach(event => {
            const type = event.data.interactionType;
            interactionCounts[type] = (interactionCounts[type] || 0) + 1;
        });

        // Find most common interaction
        const mostCommon = Object.entries(interactionCounts)
            .sort(([, a], [, b]) => b - a)[0];

        if (mostCommon && mostCommon[1] > 10) {
            insights.push({
                id: this.generateInsightId(),
                type: 'engagement',
                title: 'Preferred Interaction',
                description: `You frequently use ${mostCommon[0]} interactions`,
                confidence: Math.min(mostCommon[1] / 20, 1),
                data: { interaction: mostCommon[0], count: mostCommon[1] },
                timestamp: Date.now(),
                actionable: true
            });
        }

        return insights;
    }

    private analyzePerformance(performanceEvents: AnalyticsEvent[]): UserInsight[] {
        const insights: UserInsight[] = [];
        const metrics: { [key: string]: number[] } = {};

        // Collect performance metrics
        performanceEvents.forEach(event => {
            const metric = event.data.metric;
            const value = event.data.value;
            if (!metrics[metric]) metrics[metric] = [];
            metrics[metric].push(value);
        });

        // Analyze slow metrics
        Object.entries(metrics).forEach(([metric, values]) => {
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const slowCount = values.filter(v => v > 1000).length; // > 1 second

            if (slowCount > values.length * 0.3) { // 30% of measurements are slow
                insights.push({
                    id: this.generateInsightId(),
                    type: 'performance',
                    title: 'Performance Issue Detected',
                    description: `${metric} is running slowly (avg: ${avg.toFixed(2)}ms)`,
                    confidence: slowCount / values.length,
                    data: { metric, average: avg, slowCount, totalCount: values.length },
                    timestamp: Date.now(),
                    actionable: true
                });
            }
        });

        return insights;
    }

    getInsights(type?: UserInsight['type'], limit: number = 10): UserInsight[] {
        let filtered = this.insights;

        if (type) {
            filtered = filtered.filter(insight => insight.type === type);
        }

        return filtered
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    getAnalyticsData(timeRange?: { start: number; end: number }): {
        totalEvents: number;
        eventsByType: { [key: string]: number };
        sessionDuration: number;
        insightsCount: number;
    } {
        const events = this.eventQueue;
        const eventsByType: { [key: string]: number } = {};

        events.forEach(event => {
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        });

        return {
            totalEvents: events.length,
            eventsByType,
            sessionDuration: Date.now() - parseInt(this.currentSessionId.split('_')[1]),
            insightsCount: this.insights.length
        };
    }

    private async cleanupOldData(): Promise<void> {
        const cutoffDate = Date.now() - (this.settings.retentionDays * 24 * 60 * 60 * 1000);

        // Clean up old events
        this.eventQueue = this.eventQueue.filter(event => event.timestamp > cutoffDate);
        await this.saveEventQueue();

        // Clean up old insights
        this.insights = this.insights.filter(insight => insight.timestamp > cutoffDate);
        await this.saveInsights();
    }

    private anonymizeData(data: any): any {
        // Remove or hash personal information
        const anonymized = { ...data };

        // Remove common personal fields
        const personalFields = ['email', 'name', 'phone', 'address', 'userId'];
        personalFields.forEach(field => {
            if (anonymized[field]) {
                delete anonymized[field];
            }
        });

        return anonymized;
    }

    private generateEventId(): string {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateInsightId(): string {
        return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async exportAnalyticsData(): Promise<string> {
        const data = {
            events: this.eventQueue,
            insights: this.insights,
            settings: this.settings,
            exportDate: Date.now()
        };

        return JSON.stringify(data, null, 2);
    }

    async clearAnalyticsData(): Promise<void> {
        this.eventQueue = [];
        this.insights = [];
        await this.saveEventQueue();
        await this.saveInsights();
        this.emit('dataCleared');
    }
}

// Export singleton instance
export const analyticsManager = AnalyticsManager.getInstance();
