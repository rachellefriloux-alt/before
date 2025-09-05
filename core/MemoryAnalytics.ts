/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Memory analytics and usage tracking system.
 * Got it, love.
 */

import MemoryManager from './MemoryManager';
import { MemoryType, MemoryItem } from '../types/MemoryTypes';

export interface MemoryStats {
  totalMemories: number;
  memoriesByType: Record<MemoryType, number>;
  averageImportance: number;
  topTags: Array<{ tag: string; count: number }>;
  memoryGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  performanceMetrics: {
    averageSearchTime: number;
    cacheHitRate: number;
    storageSize: number;
  };
  usagePatterns: {
    mostActiveHours: number[];
    mostUsedTypes: MemoryType[];
    averageSessionLength: number;
  };
}

export interface AnalyticsConfig {
  enableTracking: boolean;
  trackPerformance: boolean;
  retentionPeriod: number; // days
  reportInterval: number; // minutes
}

/**
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Memory analytics and usage tracking system.
 * Got it, love.
 */
class MemoryAnalytics {
  private static instance: MemoryAnalytics;
  private memoryManager: MemoryManager;
  private config: AnalyticsConfig;
  private analyticsData: Map<string, any>;
  private performanceMetrics: Map<string, number[]>;
  private lastReportTime: number;

  private constructor() {
    this.memoryManager = MemoryManager.getInstance();
    this.config = {
      enableTracking: true,
      trackPerformance: true,
      retentionPeriod: 30, // 30 days
      reportInterval: 60 // 1 hour
    };
    this.analyticsData = new Map();
    this.performanceMetrics = new Map();
    this.lastReportTime = Date.now();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MemoryAnalytics {
    if (!MemoryAnalytics.instance) {
      MemoryAnalytics.instance = new MemoryAnalytics();
    }
    return MemoryAnalytics.instance;
  }

  /**
   * Initialize analytics tracking
   */
  public async initialize(): Promise<void> {
    if (!this.config.enableTracking) return;

    // Load existing analytics data
    await this.loadAnalyticsData();

    // Start periodic reporting
    this.startPeriodicReporting();
  }

  /**
   * Track memory operation
   */
  public trackOperation(operation: string, duration?: number): void {
    if (!this.config.enableTracking) return;

    const timestamp = Date.now();
    const key = `${operation}_${new Date(timestamp).toISOString().split('T')[0]}`;

    if (!this.analyticsData.has(key)) {
      this.analyticsData.set(key, { count: 0, totalDuration: 0 });
    }

    const data = this.analyticsData.get(key);
    data.count++;
    if (duration !== undefined) {
      data.totalDuration += duration;
    }

    this.analyticsData.set(key, data);
  }

  /**
   * Track search performance
   */
  public trackSearch(query: string, resultCount: number, duration: number): void {
    if (!this.config.trackPerformance) return;

    this.trackOperation('search', duration);

    // Track search patterns
    const searchKey = `search_pattern_${query.length > 10 ? query.substring(0, 10) + '...' : query}`;
    this.trackOperation(searchKey);

    // Track result distribution
    const resultKey = `search_results_${resultCount}`;
    this.trackOperation(resultKey);
  }

  /**
   * Get comprehensive memory statistics
   */
  public async getMemoryStats(): Promise<MemoryStats> {
    const allMemories = await this.getAllMemories();

    // Count by type
    const memoriesByType = Object.values(MemoryType).reduce((acc, type) => {
      acc[type] = allMemories.filter(m => m.type === type).length;
      return acc;
    }, {} as Record<MemoryType, number>);

    // Calculate average importance
    const averageImportance = allMemories.length > 0
      ? allMemories.reduce((sum, m) => sum + (m.importance || 0), 0) / allMemories.length
      : 0;

    // Get top tags
    const tagCounts = new Map<string, number>();
    allMemories.forEach(memory => {
      memory.tags?.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Calculate growth rates
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const dailyGrowth = allMemories.filter(m => m.timestamp && (now - m.timestamp < oneDay)).length;
    const weeklyGrowth = allMemories.filter(m => m.timestamp && (now - m.timestamp < oneWeek)).length;
    const monthlyGrowth = allMemories.filter(m => m.timestamp && (now - m.timestamp < oneMonth)).length;

    // Performance metrics
    const searchTimes = this.performanceMetrics.get('search') || [];
    const averageSearchTime = searchTimes.length > 0
      ? searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length
      : 0;

    return {
      totalMemories: allMemories.length,
      memoriesByType,
      averageImportance,
      topTags,
      memoryGrowth: {
        daily: dailyGrowth,
        weekly: weeklyGrowth,
        monthly: monthlyGrowth
      },
      performanceMetrics: {
        averageSearchTime,
        cacheHitRate: 0.85, // Placeholder - would need cache tracking
        storageSize: this.estimateStorageSize(allMemories)
      },
      usagePatterns: {
        mostActiveHours: this.calculateActiveHours(allMemories),
        mostUsedTypes: this.getMostUsedTypes(memoriesByType),
        averageSessionLength: 0 // Would need session tracking
      }
    };
  }

  /**
   * Get memory usage insights
   */
  public async getInsights(): Promise<string[]> {
    const stats = await this.getMemoryStats();
    const insights: string[] = [];

    // Memory distribution insights
    const total = stats.totalMemories;
    if (total > 0) {
      const topType = Object.entries(stats.memoriesByType)
        .sort((a, b) => b[1] - a[1])[0];

      insights.push(`You have ${total} memories, with ${topType[1]} being ${topType[0].toLowerCase()}s.`);

      // Tag insights
      if (stats.topTags.length > 0) {
        insights.push(`Your most used tag is "${stats.topTags[0].tag}" (${stats.topTags[0].count} memories).`);
      }

      // Growth insights
      if (stats.memoryGrowth.daily > 0) {
        insights.push(`You've added ${stats.memoryGrowth.daily} memories in the last 24 hours.`);
      }

      // Performance insights
      if (stats.performanceMetrics.averageSearchTime > 100) {
        insights.push(`Search performance could be improved - average search time is ${stats.performanceMetrics.averageSearchTime.toFixed(0)}ms.`);
      }
    }

    return insights;
  }

  /**
   * Generate usage report
   */
  public async generateReport(): Promise<string> {
    const stats = await this.getMemoryStats();
    const insights = await this.getInsights();

    let report = `=== Sallie Memory Analytics Report ===\n\n`;
    report += `Total Memories: ${stats.totalMemories}\n`;
    report += `Average Importance: ${stats.averageImportance.toFixed(1)}/5\n\n`;

    report += `Memory Distribution:\n`;
    Object.entries(stats.memoriesByType).forEach(([type, count]) => {
      const percentage = ((count / stats.totalMemories) * 100).toFixed(1);
      report += `  ${type}: ${count} (${percentage}%)\n`;
    });

    report += `\nTop Tags:\n`;
    stats.topTags.slice(0, 5).forEach(({ tag, count }) => {
      report += `  ${tag}: ${count}\n`;
    });

    report += `\nGrowth:\n`;
    report += `  Daily: ${stats.memoryGrowth.daily}\n`;
    report += `  Weekly: ${stats.memoryGrowth.weekly}\n`;
    report += `  Monthly: ${stats.memoryGrowth.monthly}\n`;

    report += `\nInsights:\n`;
    insights.forEach(insight => {
      report += `  • ${insight}\n`;
    });

    return report;
  }

  // Private helper methods
  private async getAllMemories(): Promise<MemoryItem[]> {
    const memories: MemoryItem[] = [];
    for (const type of Object.values(MemoryType)) {
      try {
        const typeMemories = await this.memoryManager.getAllMemoriesByType(type);
        memories.push(...typeMemories);
      } catch (error) {
        console.warn(`Failed to get memories for type ${type}:`, error);
      }
    }
    return memories;
  }

  private estimateStorageSize(memories: MemoryItem[]): number {
    // Rough estimation: 1KB per memory item
    return memories.length * 1024;
  }

  private calculateActiveHours(memories: MemoryItem[]): number[] {
    const hourCounts = new Array(24).fill(0);
    memories.forEach(memory => {
      const hour = new Date(memory.timestamp || Date.now()).getHours();
      hourCounts[hour]++;
    });

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private getMostUsedTypes(memoriesByType: Record<MemoryType, number>): MemoryType[] {
    return Object.entries(memoriesByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type as MemoryType);
  }

  private async loadAnalyticsData(): Promise<void> {
    // Implementation would load from persistent storage
    // For now, this is a placeholder
  }

  private startPeriodicReporting(): void {
    setInterval(async () => {
      if (Date.now() - this.lastReportTime > this.config.reportInterval * 60 * 1000) {
        const report = await this.generateReport();
        console.log('Memory Analytics Report:', report);
        this.lastReportTime = Date.now();
      }
    }, this.config.reportInterval * 60 * 1000);
  }
}

export default MemoryAnalytics;
