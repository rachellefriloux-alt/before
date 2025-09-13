import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

const { width } = Dimensions.get('window');

interface AnalyticsMetric {
    id: string;
    name: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    period: string;
    category: 'usage' | 'performance' | 'engagement' | 'revenue';
}

interface UserBehavior {
    id: string;
    action: string;
    count: number;
    avgDuration: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: Date;
}

interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    threshold: number;
    status: 'good' | 'warning' | 'critical';
    timestamp: Date;
}

interface Insight {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: 'optimization' | 'engagement' | 'performance' | 'revenue';
    actionable: boolean;
    generatedAt: Date;
}

interface ChartData {
    labels: string[];
    datasets: {
        data: number[];
        color: (opacity: number) => string;
        strokeWidth: number;
    }[];
}

export function AnalyticsInsights() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
    const [userBehavior, setUserBehavior] = useState<UserBehavior[]>([]);
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        initializeMetrics();
        initializeUserBehavior();
        initializePerformanceMetrics();
        initializeInsights();
    }, [selectedTimeRange]);

    const initializeMetrics = () => {
        const mockMetrics: AnalyticsMetric[] = [
            {
                id: '1',
                name: 'Daily Active Users',
                value: 12450,
                change: 12.5,
                changeType: 'increase',
                period: selectedTimeRange,
                category: 'usage',
            },
            {
                id: '2',
                name: 'Session Duration',
                value: 8.5,
                change: -2.1,
                changeType: 'decrease',
                period: selectedTimeRange,
                category: 'engagement',
            },
            {
                id: '3',
                name: 'App Crashes',
                value: 23,
                change: -15.3,
                changeType: 'decrease',
                period: selectedTimeRange,
                category: 'performance',
            },
            {
                id: '4',
                name: 'Revenue',
                value: 45670,
                change: 8.7,
                changeType: 'increase',
                period: selectedTimeRange,
                category: 'revenue',
            },
            {
                id: '5',
                name: 'Feature Adoption',
                value: 78.3,
                change: 5.2,
                changeType: 'increase',
                period: selectedTimeRange,
                category: 'engagement',
            },
            {
                id: '6',
                name: 'API Response Time',
                value: 245,
                change: -8.4,
                changeType: 'decrease',
                period: selectedTimeRange,
                category: 'performance',
            },
        ];
        setMetrics(mockMetrics);
    };

    const initializeUserBehavior = () => {
        const mockBehavior: UserBehavior[] = [
            {
                id: '1',
                action: 'Media Upload',
                count: 3456,
                avgDuration: 45,
                trend: 'up',
                lastUpdated: new Date(),
            },
            {
                id: '2',
                action: 'Chat Interaction',
                count: 8921,
                avgDuration: 120,
                trend: 'stable',
                lastUpdated: new Date(),
            },
            {
                id: '3',
                action: 'Settings Access',
                count: 1234,
                avgDuration: 30,
                trend: 'down',
                lastUpdated: new Date(),
            },
            {
                id: '4',
                action: 'Profile Update',
                count: 567,
                avgDuration: 90,
                trend: 'up',
                lastUpdated: new Date(),
            },
            {
                id: '5',
                action: 'Help & Support',
                count: 234,
                avgDuration: 180,
                trend: 'stable',
                lastUpdated: new Date(),
            },
        ];
        setUserBehavior(mockBehavior);
    };

    const initializePerformanceMetrics = () => {
        const mockPerformance: PerformanceMetric[] = [
            {
                id: '1',
                name: 'CPU Usage',
                value: 45.2,
                unit: '%',
                threshold: 80,
                status: 'good',
                timestamp: new Date(),
            },
            {
                id: '2',
                name: 'Memory Usage',
                value: 67.8,
                unit: '%',
                threshold: 85,
                status: 'good',
                timestamp: new Date(),
            },
            {
                id: '3',
                name: 'Network Latency',
                value: 120,
                unit: 'ms',
                threshold: 200,
                status: 'good',
                timestamp: new Date(),
            },
            {
                id: '4',
                name: 'Storage Usage',
                value: 78.5,
                unit: '%',
                threshold: 90,
                status: 'warning',
                timestamp: new Date(),
            },
            {
                id: '5',
                name: 'Error Rate',
                value: 0.8,
                unit: '%',
                threshold: 5,
                status: 'good',
                timestamp: new Date(),
            },
            {
                id: '6',
                name: 'Uptime',
                value: 99.9,
                unit: '%',
                threshold: 99.5,
                status: 'good',
                timestamp: new Date(),
            },
        ];
        setPerformanceMetrics(mockPerformance);
    };

    const initializeInsights = () => {
        const mockInsights: Insight[] = [
            {
                id: '1',
                title: 'Peak Usage Hours Identified',
                description: 'Users are most active between 7-9 PM. Consider scheduling maintenance during off-peak hours.',
                impact: 'medium',
                category: 'optimization',
                actionable: true,
                generatedAt: new Date(Date.now() - 3600000),
            },
            {
                id: '2',
                title: 'Feature Adoption Opportunity',
                description: 'Only 45% of users have tried the new AI chat feature. Consider targeted notifications.',
                impact: 'high',
                category: 'engagement',
                actionable: true,
                generatedAt: new Date(Date.now() - 7200000),
            },
            {
                id: '3',
                title: 'Performance Optimization Needed',
                description: 'Media upload speeds have decreased by 15% in the last week. Investigate server capacity.',
                impact: 'high',
                category: 'performance',
                actionable: true,
                generatedAt: new Date(Date.now() - 10800000),
            },
            {
                id: '4',
                title: 'Revenue Growth Trend',
                description: 'Premium subscription conversions increased by 23% after the recent pricing update.',
                impact: 'high',
                category: 'revenue',
                actionable: false,
                generatedAt: new Date(Date.now() - 14400000),
            },
            {
                id: '5',
                title: 'User Retention Improvement',
                description: 'Users who complete onboarding are 3x more likely to remain active after 30 days.',
                impact: 'medium',
                category: 'engagement',
                actionable: true,
                generatedAt: new Date(Date.now() - 18000000),
            },
        ];
        setInsights(mockInsights);
    };

    const getChangeColor = (changeType: string) => {
        switch (changeType) {
            case 'increase': return '#10B981';
            case 'decrease': return '#EF4444';
            case 'neutral': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return '#10B981';
            case 'warning': return '#F59E0B';
            case 'critical': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'usage': return '#3B82F6';
            case 'performance': return '#8B5CF6';
            case 'engagement': return '#10B981';
            case 'revenue': return '#F59E0B';
            case 'optimization': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return '↗️';
            case 'down': return '↘️';
            case 'stable': return '→';
            default: return '→';
        }
    };

    const filteredMetrics = selectedCategory === 'all'
        ? metrics
        : metrics.filter(metric => metric.category === selectedCategory);

    const renderMetricsOverview = () => (
        <View style={styles.metricsContainer}>
            <View style={styles.metricsHeader}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.timeRangeSelector}>
                    {(['7d', '30d', '90d'] as const).map(range => (
                        <TouchableOpacity
                            key={range}
                            style={[
                                styles.timeRangeButton,
                                selectedTimeRange === range && styles.timeRangeButtonActive,
                            ]}
                            onPress={() => setSelectedTimeRange(range)}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                selectedTimeRange === range && styles.timeRangeTextActive,
                            ]}>
                                {range}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.categoryFilter}>
                {(['all', 'usage', 'performance', 'engagement', 'revenue'] as const).map(category => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category && styles.categoryButtonActive,
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category && styles.categoryTextActive,
                        ]}>
                            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.metricsGrid}>
                {filteredMetrics.map(metric => (
                    <EnhancedCard key={metric.id} variant="glass" style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricName}>{metric.name}</Text>
                            <View style={[
                                styles.categoryBadge,
                                { backgroundColor: getCategoryColor(metric.category) }
                            ]}>
                                <Text style={styles.categoryBadgeText}>{metric.category}</Text>
                            </View>
                        </View>
                        <Text style={styles.metricValue}>
                            {typeof metric.value === 'number' && metric.value % 1 !== 0
                                ? metric.value.toFixed(1)
                                : metric.value.toLocaleString()}
                            {metric.name.includes('Duration') && ' min'}
                            {metric.name.includes('Revenue') && ' $'}
                        </Text>
                        <View style={styles.metricChange}>
                            <Text style={[
                                styles.changeText,
                                { color: getChangeColor(metric.changeType) }
                            ]}>
                                {metric.changeType === 'increase' ? '+' : ''}
                                {metric.change}%
                            </Text>
                            <Text style={styles.changePeriod}>vs last {metric.period}</Text>
                        </View>
                    </EnhancedCard>
                ))}
            </View>
        </View>
    );

    const renderUserBehavior = () => (
        <View style={styles.behaviorContainer}>
            <Text style={styles.sectionTitle}>User Behavior</Text>
            {userBehavior.map(behavior => (
                <EnhancedCard key={behavior.id} variant="glass" style={styles.behaviorCard}>
                    <View style={styles.behaviorHeader}>
                        <Text style={styles.behaviorAction}>{behavior.action}</Text>
                        <Text style={styles.behaviorTrend}>
                            {getTrendIcon(behavior.trend)}
                        </Text>
                    </View>
                    <View style={styles.behaviorStats}>
                        <View style={styles.behaviorStat}>
                            <Text style={styles.behaviorStatValue}>{behavior.count.toLocaleString()}</Text>
                            <Text style={styles.behaviorStatLabel}>Total Actions</Text>
                        </View>
                        <View style={styles.behaviorStat}>
                            <Text style={styles.behaviorStatValue}>{behavior.avgDuration}s</Text>
                            <Text style={styles.behaviorStatLabel}>Avg Duration</Text>
                        </View>
                    </View>
                    <Text style={styles.behaviorLastUpdated}>
                        Last updated: {behavior.lastUpdated.toLocaleString()}
                    </Text>
                </EnhancedCard>
            ))}
        </View>
    );

    const renderPerformanceMetrics = () => (
        <View style={styles.performanceContainer}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            {performanceMetrics.map(metric => (
                <EnhancedCard key={metric.id} variant="glass" style={styles.performanceCard}>
                    <View style={styles.performanceHeader}>
                        <View style={styles.performanceInfo}>
                            <Text style={styles.performanceName}>{metric.name}</Text>
                            <Text style={styles.performanceValue}>
                                {metric.value}{metric.unit}
                            </Text>
                        </View>
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: getStatusColor(metric.status) }
                        ]} />
                    </View>
                    <View style={styles.performanceDetails}>
                        <Text style={styles.performanceThreshold}>
                            Threshold: {metric.threshold}{metric.unit}
                        </Text>
                        <Text style={styles.performanceTimestamp}>
                            {metric.timestamp.toLocaleString()}
                        </Text>
                    </View>
                </EnhancedCard>
            ))}
        </View>
    );

    const renderInsights = () => (
        <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            {insights.map(insight => (
                <EnhancedCard key={insight.id} variant="glass" style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <View style={[
                            styles.impactBadge,
                            { backgroundColor: getImpactColor(insight.impact) }
                        ]}>
                            <Text style={styles.impactText}>{insight.impact} impact</Text>
                        </View>
                    </View>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                    <View style={styles.insightFooter}>
                        <View style={[
                            styles.categoryBadge,
                            { backgroundColor: getCategoryColor(insight.category) }
                        ]}>
                            <Text style={styles.categoryBadgeText}>{insight.category}</Text>
                        </View>
                        <Text style={styles.insightTimestamp}>
                            {insight.generatedAt.toLocaleString()}
                        </Text>
                    </View>
                    {insight.actionable && (
                        <EnhancedButton
                            title="Take Action"
                            variant="primary"
                            onPress={() => {/* Handle action */ }}
                            style={styles.actionButton}
                        />
                    )}
                </EnhancedCard>
            ))}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Analytics & Insights</Text>

            {/* Metrics Overview */}
            {renderMetricsOverview()}

            {/* User Behavior */}
            {renderUserBehavior()}

            {/* Performance Metrics */}
            {renderPerformanceMetrics()}

            {/* AI Insights */}
            {renderInsights()}

            {/* Export Data */}
            <EnhancedCard variant="glass" style={styles.exportCard}>
                <Text style={styles.exportTitle}>Export Analytics Data</Text>
                <Text style={styles.exportDescription}>
                    Download comprehensive analytics reports for further analysis.
                </Text>
                <View style={styles.exportButtons}>
                    <EnhancedButton
                        title="Export CSV"
                        variant="outline"
                        onPress={() => {/* Handle CSV export */ }}
                        style={styles.exportButton}
                    />
                    <EnhancedButton
                        title="Export PDF"
                        variant="outline"
                        onPress={() => {/* Handle PDF export */ }}
                        style={styles.exportButton}
                    />
                    <EnhancedButton
                        title="Share Report"
                        variant="primary"
                        onPress={() => {/* Handle report sharing */ }}
                        style={styles.exportButton}
                    />
                </View>
            </EnhancedCard>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    metricsContainer: {
        marginBottom: 24,
    },
    metricsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    timeRangeSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    timeRangeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    timeRangeButtonActive: {
        backgroundColor: '#FFD700',
    },
    timeRangeText: {
        color: '#ccc',
        fontSize: 12,
        fontFamily: 'SpaceMono',
    },
    timeRangeTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },
    categoryFilter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    categoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    categoryButtonActive: {
        backgroundColor: '#FFD700',
    },
    categoryText: {
        color: '#ccc',
        fontSize: 12,
        fontFamily: 'SpaceMono',
    },
    categoryTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    metricCard: {
        width: (width - 48) / 2,
        padding: 16,
        marginBottom: 8,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    metricName: {
        fontSize: 14,
        color: '#f5f5f5',
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
        fontFamily: 'SpaceMono',
    },
    categoryBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    metricValue: {
        fontSize: 24,
        color: '#FFD700',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    metricChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    changeText: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    changePeriod: {
        fontSize: 10,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    behaviorContainer: {
        marginBottom: 24,
    },
    behaviorCard: {
        padding: 16,
        marginBottom: 8,
    },
    behaviorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    behaviorAction: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    behaviorTrend: {
        fontSize: 18,
    },
    behaviorStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    behaviorStat: {
        alignItems: 'center',
    },
    behaviorStatValue: {
        fontSize: 20,
        color: '#FFD700',
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    behaviorStatLabel: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    behaviorLastUpdated: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    performanceContainer: {
        marginBottom: 24,
    },
    performanceCard: {
        padding: 16,
        marginBottom: 8,
    },
    performanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    performanceInfo: {
        flex: 1,
    },
    performanceName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    performanceValue: {
        fontSize: 20,
        color: '#FFD700',
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    performanceDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    performanceThreshold: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    performanceTimestamp: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    insightsContainer: {
        marginBottom: 24,
    },
    insightCard: {
        padding: 16,
        marginBottom: 8,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    insightTitle: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
        fontFamily: 'SpaceMono',
    },
    impactBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    impactText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    insightDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 12,
        fontFamily: 'SpaceMono',
    },
    insightFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    insightTimestamp: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    actionButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    exportCard: {
        padding: 16,
        marginBottom: 16,
    },
    exportTitle: {
        fontSize: 18,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    exportDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    exportButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    exportButton: {
        flex: 1,
    },
});
