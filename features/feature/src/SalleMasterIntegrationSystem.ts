/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Master integration system for all enhanced features
 * Got it, love.
 */

import { PerformanceMonitoringSystem } from './PerformanceMonitoringSystem';
import { EnhancedErrorHandler } from './EnhancedErrorHandler';
import { AccessibilityEnhancementSystem } from './AccessibilityEnhancementSystem';
import { CodeOptimizationSystem } from './CodeOptimizationSystem';
import { FeatureFlagManager } from '../../core/featureFlags';

interface SystemHealthReport {
  overall: {
    status: 'excellent' | 'good' | 'needs-attention' | 'critical';
    score: number; // 0-100
    timestamp: number;
  };
  performance: {
    score: number;
    issues: string[];
  };
  accessibility: {
    compliance: string;
    score: number;
    criticalIssues: number;
  };
  errors: {
    recentCount: number;
    recoveryRate: number;
    criticalErrors: number;
  };
  optimization: {
    suggestionsAvailable: number;
    lastOptimization?: number;
  };
  recommendations: string[];
}

export class SalleMasterIntegrationSystem {
  private performanceMonitor: PerformanceMonitoringSystem;
  private errorHandler: EnhancedErrorHandler;
  private accessibilitySystem: AccessibilityEnhancementSystem;
  private optimizationSystem: CodeOptimizationSystem;
  
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: SystemHealthReport | null = null;
  private healthCheckCallbacks: ((report: SystemHealthReport) => void)[] = [];

  constructor() {
    this.performanceMonitor = new PerformanceMonitoringSystem();
    this.errorHandler = new EnhancedErrorHandler();
    this.accessibilitySystem = new AccessibilityEnhancementSystem();
    this.optimizationSystem = new CodeOptimizationSystem();
    
    this.initializeIntegrations();
    this.startHealthMonitoring();
  }

  private initializeIntegrations() {
    // Set up error handler callback for user notifications
    this.errorHandler.setUserNotificationCallback((message: string, severity: string) => {
      this.handleSystemNotification('error', message, severity);
    });

    // Enable accessibility monitoring if feature flag is enabled
    if (FeatureFlagManager.isEnabled('ACCESSIBILITY_ENHANCED')) {
      this.accessibilitySystem.enableRealTimeMonitoring((report) => {
        this.handleAccessibilityUpdate(report);
      });
    }

    // Integrate performance monitoring with error handling
    this.performanceMonitor.recordMetric('system_initialization', Date.now(), 'timestamp');
  }

  private startHealthMonitoring() {
    if (this.healthCheckInterval) return;

    // Run health checks every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Run initial health check
    this.performHealthCheck();
  }

  private async performHealthCheck(): Promise<SystemHealthReport> {
    const timestamp = Date.now();
    
    // Get performance metrics
    const performanceReport = this.performanceMonitor.generateReport();
    
    // Get error statistics
    const errorStats = this.errorHandler.getErrorStats();
    
    // Get accessibility status (simulated for demo)
    const accessibilityReport = this.accessibilitySystem.auditAccessibility([]);
    
    // Get optimization suggestions
    const optimizationSuggestions = this.performanceMonitor.getOptimizationSuggestions();

    // Calculate overall health score
    const performanceWeight = 0.4;
    const accessibilityWeight = 0.3;
    const errorWeight = 0.3;

    const performanceScore = performanceReport.overall.score;
    const accessibilityScore = accessibilityReport.score;
    const errorScore = this.calculateErrorScore(errorStats);

    const overallScore = Math.round(
      performanceScore * performanceWeight +
      accessibilityScore * accessibilityWeight +
      errorScore * errorWeight
    );

    const healthReport: SystemHealthReport = {
      overall: {
        status: this.getHealthStatus(overallScore),
        score: overallScore,
        timestamp
      },
      performance: {
        score: performanceScore,
        issues: performanceReport.recommendations.slice(0, 3) // Top 3 issues
      },
      accessibility: {
        compliance: accessibilityReport.compliance,
        score: accessibilityScore,
        criticalIssues: accessibilityReport.summary.critical
      },
      errors: {
        recentCount: this.getRecentErrorCount(),
        recoveryRate: errorStats.recoveryRate,
        criticalErrors: errorStats.bySeverity.critical || 0
      },
      optimization: {
        suggestionsAvailable: optimizationSuggestions.length,
        lastOptimization: this.getLastOptimizationTime()
      },
      recommendations: this.generateMasterRecommendations(
        performanceReport,
        accessibilityReport,
        errorStats,
        optimizationSuggestions
      )
    };

    this.lastHealthCheck = healthReport;
    this.notifyHealthCheckCallbacks(healthReport);

    // Take automatic actions if needed
    await this.handleAutoRemediation(healthReport);

    return healthReport;
  }

  private calculateErrorScore(errorStats: any): number {
    const baseScore = 100;
    const criticalPenalty = (errorStats.bySeverity.critical || 0) * 30;
    const importantPenalty = (errorStats.bySeverity.high || 0) * 15;
    const mediumPenalty = (errorStats.bySeverity.medium || 0) * 5;
    
    const recoveryBonus = errorStats.recoveryRate > 80 ? 10 : 0;
    
    return Math.max(0, baseScore - criticalPenalty - importantPenalty - mediumPenalty + recoveryBonus);
  }

  private getHealthStatus(score: number): 'excellent' | 'good' | 'needs-attention' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'needs-attention';
    return 'critical';
  }

  private getRecentErrorCount(): number {
    const errorHistory = this.errorHandler.getErrorHistory();
    const recentThreshold = Date.now() - (15 * 60 * 1000); // Last 15 minutes
    return errorHistory.filter(err => err.context.timestamp > recentThreshold).length;
  }

  private getLastOptimizationTime(): number | undefined {
    // This would track when optimizations were last run
    return Date.now() - (60 * 60 * 1000); // Placeholder: 1 hour ago
  }

  private generateMasterRecommendations(
    performanceReport: any,
    accessibilityReport: any,
    errorStats: any,
    optimizationSuggestions: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Performance-based recommendations
    if (performanceReport.overall.score < 70) {
      recommendations.push('Performance is below optimal. Consider running optimization routines.');
    }

    // Accessibility-based recommendations
    if (accessibilityReport.summary.critical > 0) {
      recommendations.push(`Fix ${accessibilityReport.summary.critical} critical accessibility issues immediately.`);
    }

    // Error-based recommendations
    if (errorStats.bySeverity.critical > 0) {
      recommendations.push('Critical errors detected. Investigate and resolve immediately.');
    }

    if (errorStats.recoveryRate < 50) {
      recommendations.push('Low error recovery rate. Review error handling strategies.');
    }

    // Optimization suggestions
    if (optimizationSuggestions.length > 5) {
      recommendations.push('Multiple optimization opportunities available. Run code optimization system.');
    }

    // Proactive recommendations
    if (performanceReport.trends.degrading.length > 0) {
      recommendations.push(`Performance degrading in: ${performanceReport.trends.degrading.join(', ')}`);
    }

    // If everything is good, provide proactive suggestions
    if (recommendations.length === 0) {
      recommendations.push('System health is excellent. Consider proactive optimizations.');
      recommendations.push('Review feature flags for new capabilities to enable.');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private async handleAutoRemediation(report: SystemHealthReport): Promise<void> {
    // Automatic actions based on health report
    
    if (report.overall.status === 'critical') {
      // Critical status - take immediate action
      if (report.errors.criticalErrors > 0) {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // Log critical status
        console.error('Salle System: Critical health status detected', report);
      }
    }

    if (report.performance.score < 50) {
      // Performance is very poor - start emergency optimizations
      this.performanceMonitor.recordMetric('emergency_optimization_triggered', 1, 'count');
    }

    // Auto-enable features based on context
    if (report.accessibility.criticalIssues > 0 && !FeatureFlagManager.isEnabled('ACCESSIBILITY_ENHANCED')) {
      FeatureFlagManager.enable('ACCESSIBILITY_ENHANCED');
    }
  }

  private handleSystemNotification(type: string, message: string, severity: string) {
    // Central notification handling
    this.performanceMonitor.recordMetric(`notification_${type}_${severity}`, 1, 'count');
    
    // In a real app, this would integrate with the notification system
    if (__DEV__) {
      console.log(`Salle System Notification [${severity}]: ${message}`);
    }
  }

  private handleAccessibilityUpdate(report: any) {
    this.performanceMonitor.recordMetric('accessibility_scan_completed', Date.now(), 'timestamp');
    
    if (report.summary.critical > 0) {
      this.handleSystemNotification('accessibility', 
        `${report.summary.critical} critical accessibility issues found`, 
        'high'
      );
    }
  }

  private notifyHealthCheckCallbacks(report: SystemHealthReport) {
    this.healthCheckCallbacks.forEach(callback => {
      try {
        callback(report);
      } catch (error) {
        console.error('Error in health check callback:', error);
      }
    });
  }

  // Public API methods

  /**
   * Get the latest system health report
   */
  getSystemHealth(): SystemHealthReport | null {
    return this.lastHealthCheck;
  }

  /**
   * Force a manual health check
   */
  async runHealthCheck(): Promise<SystemHealthReport> {
    return await this.performHealthCheck();
  }

  /**
   * Subscribe to health check updates
   */
  onHealthUpdate(callback: (report: SystemHealthReport) => void): () => void {
    this.healthCheckCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.healthCheckCallbacks.indexOf(callback);
      if (index > -1) {
        this.healthCheckCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Run comprehensive optimization
   */
  async runComprehensiveOptimization(): Promise<{
    performance: any;
    accessibility: any;
    code: any;
  }> {
    const startTime = Date.now();
    
    // Performance optimization
    const performanceReport = this.performanceMonitor.generateReport();
    
    // Accessibility improvements
    const accessibilityReport = this.accessibilitySystem.auditAccessibility([]);
    
    // Code optimization (sample)
    const codeOptimization = this.optimizationSystem.optimizeCode(
      'console.log("sample");',
      'javascript',
      'balanced'
    );

    const duration = Date.now() - startTime;
    this.performanceMonitor.recordMetric('comprehensive_optimization_duration', duration, 'ms');

    return {
      performance: performanceReport,
      accessibility: accessibilityReport,
      code: codeOptimization
    };
  }

  /**
   * Enable/disable features based on context
   */
  optimizeFeatureFlags(context: { deviceInfo?: any; userPreferences?: any }): void {
    // Automatically optimize feature flags based on context
    
    if (context.deviceInfo?.lowMemory) {
      FeatureFlagManager.disable('PERFORMANCE_PROFILING');
      FeatureFlagManager.disable('REAL_TIME_ANALYTICS');
    }

    if (context.userPreferences?.accessibility) {
      FeatureFlagManager.enable('ACCESSIBILITY_ENHANCED');
      FeatureFlagManager.enable('HAPTIC_FEEDBACK');
    }

    if (context.deviceInfo?.highPerformance) {
      FeatureFlagManager.enable('ADVANCED_VOICE_COMMANDS');
      FeatureFlagManager.enable('PREDICTIVE_ASSISTANCE');
    }
  }

  /**
   * Get system insights and analytics
   */
  getSystemInsights(): {
    uptime: number;
    totalOptimizations: number;
    errorTrends: any;
    performanceTrends: any;
    recommendations: string[];
  } {
    const errorStats = this.errorHandler.getErrorStats();
    const performanceReport = this.performanceMonitor.generateReport();
    
    return {
      uptime: Date.now() - (this.performanceMonitor as any).startTime || 0,
      totalOptimizations: 0, // Would track actual optimizations
      errorTrends: errorStats,
      performanceTrends: performanceReport.trends,
      recommendations: this.lastHealthCheck?.recommendations || []
    };
  }

  /**
   * Emergency shutdown/restart capabilities
   */
  async emergencyRestart(): Promise<void> {
    // Stop all monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.performanceMonitor.stopMonitoring();

    // Clear caches if possible
    if (global.gc) {
      global.gc();
    }

    // Reinitialize systems
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
    
    this.initializeIntegrations();
    this.startHealthMonitoring();

    this.performanceMonitor.recordMetric('emergency_restart_completed', Date.now(), 'timestamp');
  }

  /**
   * Export system state for debugging
   */
  exportSystemState(): any {
    return {
      timestamp: Date.now(),
      lastHealthCheck: this.lastHealthCheck,
      featureFlags: FeatureFlagManager.getAllFlags(),
      errorHistory: this.errorHandler.getErrorHistory().slice(-10),
      performanceMetrics: this.performanceMonitor.getCurrentMetrics(),
      systemInsights: this.getSystemInsights()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.performanceMonitor.stopMonitoring();
    this.healthCheckCallbacks = [];
  }
}