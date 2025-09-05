/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Comprehensive performance monitoring and optimization system
 * Got it, love.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  threshold?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceReport {
  overall: {
    score: number; // 0-100
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  };
  metrics: PerformanceMetric[];
  recommendations: string[];
  trends: {
    improving: string[];
    degrading: string[];
    stable: string[];
  };
}

export class PerformanceMonitoringSystem {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, number> = new Map();
  private monitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeThresholds();
    this.startMonitoring();
  }

  private initializeThresholds() {
    // Performance thresholds based on best practices
    this.thresholds.set('app_startup_time', 3000); // 3 seconds
    this.thresholds.set('memory_usage', 150 * 1024 * 1024); // 150MB
    this.thresholds.set('frame_rate', 55); // fps
    this.thresholds.set('bundle_size', 5 * 1024 * 1024); // 5MB
    this.thresholds.set('api_response_time', 1000); // 1 second
    this.thresholds.set('render_time', 16); // 16ms for 60fps
    this.thresholds.set('interaction_delay', 100); // 100ms
  }

  startMonitoring() {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collect metrics every 5 seconds
  }

  stopMonitoring() {
    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private collectMetrics() {
    // Memory usage
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.recordMetric('memory_usage', memory.usedJSHeapSize, 'bytes');
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes');
    }

    // Frame rate (simplified - would need proper implementation in React Native)
    this.recordMetric('frame_rate', this.estimateFrameRate(), 'fps');

    // Network timing (if available)
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        this.recordMetric('app_startup_time', nav.loadEventEnd - nav.fetchStart, 'ms');
        this.recordMetric('dom_content_loaded', nav.domContentLoadedEventEnd - nav.fetchStart, 'ms');
      }

      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      resourceEntries.forEach(resource => {
        if (resource.name.includes('api') || resource.name.includes('/api/')) {
          this.recordMetric('api_response_time', resource.responseEnd - resource.requestStart, 'ms');
        }
      });
    }
  }

  private estimateFrameRate(): number {
    // Simplified frame rate estimation
    // In a real implementation, this would measure actual frame drops
    return 60; // Placeholder
  }

  recordMetric(name: string, value: number, unit: string, severity?: 'low' | 'medium' | 'high' | 'critical') {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      threshold: this.thresholds.get(name),
      severity: severity || this.calculateSeverity(name, value)
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricHistory = this.metrics.get(name)!;
    metricHistory.push(metric);

    // Keep only last 100 measurements per metric
    if (metricHistory.length > 100) {
      metricHistory.splice(0, metricHistory.length - 100);
    }
  }

  private calculateSeverity(name: string, value: number): 'low' | 'medium' | 'high' | 'critical' {
    const threshold = this.thresholds.get(name);
    if (!threshold) return 'low';

    const ratio = value / threshold;

    // Different metrics have different "good" directions
    const isLowerBetter = ['app_startup_time', 'memory_usage', 'api_response_time', 'render_time', 'interaction_delay'].includes(name);

    if (isLowerBetter) {
      if (ratio > 2) return 'critical';
      if (ratio > 1.5) return 'high';
      if (ratio > 1) return 'medium';
      return 'low';
    } else {
      // Higher is better (like frame_rate)
      if (ratio < 0.5) return 'critical';
      if (ratio < 0.7) return 'high';
      if (ratio < 0.9) return 'medium';
      return 'low';
    }
  }

  generateReport(): PerformanceReport {
    const allMetrics: PerformanceMetric[] = [];
    const recommendations: string[] = [];
    const trends = { improving: [], degrading: [], stable: [] };

    // Collect latest metrics and analyze trends
    for (const [name, metricHistory] of this.metrics.entries()) {
      if (metricHistory.length === 0) continue;

      const latest = metricHistory[metricHistory.length - 1];
      allMetrics.push(latest);

      // Analyze trends (compare last 10 vs previous 10)
      if (metricHistory.length >= 20) {
        const recent = metricHistory.slice(-10);
        const previous = metricHistory.slice(-20, -10);
        
        const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
        const previousAvg = previous.reduce((sum, m) => sum + m.value, 0) / previous.length;
        
        const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;
        
        if (Math.abs(changePercent) < 5) {
          trends.stable.push(name);
        } else {
          const isLowerBetter = ['app_startup_time', 'memory_usage', 'api_response_time', 'render_time', 'interaction_delay'].includes(name);
          const isImproving = isLowerBetter ? changePercent < 0 : changePercent > 0;
          
          if (isImproving) {
            trends.improving.push(name);
          } else {
            trends.degrading.push(name);
          }
        }
      }

      // Generate recommendations based on severity
      if (latest.severity === 'critical' || latest.severity === 'high') {
        recommendations.push(...this.getRecommendations(name, latest));
      }
    }

    // Calculate overall score
    const score = this.calculateOverallScore(allMetrics);
    const status = this.getStatusFromScore(score);

    return {
      overall: { score, status },
      metrics: allMetrics,
      recommendations,
      trends
    };
  }

  private calculateOverallScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100;

    let totalScore = 0;
    let weightedCount = 0;

    metrics.forEach(metric => {
      let score = 100;
      const threshold = metric.threshold;

      if (threshold) {
        const isLowerBetter = ['app_startup_time', 'memory_usage', 'api_response_time', 'render_time', 'interaction_delay'].includes(metric.name);
        
        if (isLowerBetter) {
          score = Math.max(0, 100 - ((metric.value / threshold - 1) * 50));
        } else {
          score = Math.min(100, (metric.value / threshold) * 100);
        }
      }

      // Weight more important metrics higher
      const weight = this.getMetricWeight(metric.name);
      totalScore += score * weight;
      weightedCount += weight;
    });

    return Math.round(totalScore / weightedCount);
  }

  private getMetricWeight(metricName: string): number {
    const weights: { [key: string]: number } = {
      'app_startup_time': 3,
      'frame_rate': 3,
      'memory_usage': 2,
      'api_response_time': 2,
      'render_time': 2,
      'interaction_delay': 2,
      'bundle_size': 1,
      'dom_content_loaded': 1
    };

    return weights[metricName] || 1;
  }

  private getStatusFromScore(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  private getRecommendations(metricName: string, metric: PerformanceMetric): string[] {
    const recommendations: { [key: string]: string[] } = {
      'app_startup_time': [
        'Consider lazy loading non-critical components',
        'Optimize bundle size by removing unused dependencies',
        'Implement code splitting for faster initial load',
        'Use splash screen to improve perceived performance'
      ],
      'memory_usage': [
        'Check for memory leaks in event listeners',
        'Optimize image sizes and use appropriate formats',
        'Implement proper cleanup in component unmounting',
        'Consider using object pooling for frequently created objects'
      ],
      'frame_rate': [
        'Optimize animations to use native driver',
        'Reduce the number of components re-rendering',
        'Use React.memo and useMemo for expensive computations',
        'Consider virtualizing long lists'
      ],
      'api_response_time': [
        'Implement request caching',
        'Use pagination for large data sets',
        'Consider using GraphQL for more efficient queries',
        'Optimize database queries on the backend'
      ],
      'bundle_size': [
        'Analyze bundle with webpack-bundle-analyzer',
        'Remove unused dependencies',
        'Use tree shaking to eliminate dead code',
        'Consider using dynamic imports for large libraries'
      ],
      'render_time': [
        'Optimize component render methods',
        'Use React.memo to prevent unnecessary re-renders',
        'Consider using React.lazy for code splitting',
        'Optimize CSS and avoid complex selectors'
      ]
    };

    return recommendations[metricName] || ['Monitor this metric and investigate performance bottlenecks'];
  }

  getMetricHistory(metricName: string): PerformanceMetric[] {
    return this.metrics.get(metricName) || [];
  }

  getCurrentMetrics(): { [key: string]: PerformanceMetric } {
    const current: { [key: string]: PerformanceMetric } = {};
    
    for (const [name, history] of this.metrics.entries()) {
      if (history.length > 0) {
        current[name] = history[history.length - 1];
      }
    }

    return current;
  }

  // Integration with optimization suggestions
  getOptimizationSuggestions(): string[] {
    const report = this.generateReport();
    const suggestions: string[] = [];

    // Add general suggestions based on overall score
    if (report.overall.score < 70) {
      suggestions.push(
        'Performance is below optimal. Consider running the code optimization system.',
        'Review recent changes that might have impacted performance.',
        'Consider implementing performance monitoring in production.'
      );
    }

    // Add trend-based suggestions
    if (report.trends.degrading.length > 0) {
      suggestions.push(
        `Performance degrading in: ${report.trends.degrading.join(', ')}. Investigate recent changes.`
      );
    }

    if (report.trends.improving.length > 0) {
      suggestions.push(
        `Good job! Performance improving in: ${report.trends.improving.join(', ')}.`
      );
    }

    return [...suggestions, ...report.recommendations];
  }

  // Method to manually trigger performance measurement
  measurePerformance<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.recordMetric(`${name}_execution_time`, endTime - startTime, 'ms');
    return result;
  }

  // Async version
  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    this.recordMetric(`${name}_execution_time`, endTime - startTime, 'ms');
    return result;
  }
}