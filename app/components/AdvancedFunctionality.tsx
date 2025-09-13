import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

interface BackgroundTask {
    id: string;
    name: string;
    description: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    startTime?: Date;
    endTime?: Date;
    priority: 'low' | 'medium' | 'high';
}

interface Widget {
    id: string;
    name: string;
    description: string;
    type: 'quick_actions' | 'status' | 'analytics' | 'notifications';
    enabled: boolean;
    size: 'small' | 'medium' | 'large';
    position: { x: number; y: number };
}

interface AdvancedFeature {
    id: string;
    name: string;
    description: string;
    category: 'processing' | 'widgets' | 'automation' | 'integration';
    enabled: boolean;
    complexity: 'basic' | 'intermediate' | 'advanced';
}

export function AdvancedFunctionality() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [advancedFeatures, setAdvancedFeatures] = useState<AdvancedFeature[]>([]);
    const [taskQueue, setTaskQueue] = useState<BackgroundTask[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const taskIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        initializeBackgroundTasks();
        initializeWidgets();
        initializeAdvancedFeatures();
        return () => {
            if (taskIntervalRef.current) {
                clearInterval(taskIntervalRef.current);
            }
        };
    }, []);

    const initializeBackgroundTasks = () => {
        const tasks: BackgroundTask[] = [
            {
                id: '1',
                name: 'Data Synchronization',
                description: 'Sync user data with cloud storage',
                status: 'idle',
                progress: 0,
                priority: 'high',
            },
            {
                id: '2',
                name: 'Cache Optimization',
                description: 'Clean and optimize app cache',
                status: 'idle',
                progress: 0,
                priority: 'medium',
            },
            {
                id: '3',
                name: 'Analytics Processing',
                description: 'Process usage analytics data',
                status: 'idle',
                progress: 0,
                priority: 'low',
            },
            {
                id: '4',
                name: 'Backup Creation',
                description: 'Create automatic backup of user data',
                status: 'idle',
                progress: 0,
                priority: 'high',
            },
            {
                id: '5',
                name: 'Content Indexing',
                description: 'Index user content for faster search',
                status: 'idle',
                progress: 0,
                priority: 'medium',
            },
        ];
        setBackgroundTasks(tasks);
    };

    const initializeWidgets = () => {
        const widgetList: Widget[] = [
            {
                id: '1',
                name: 'Quick Actions',
                description: 'Fast access to common actions',
                type: 'quick_actions',
                enabled: true,
                size: 'medium',
                position: { x: 0, y: 0 },
            },
            {
                id: '2',
                name: 'System Status',
                description: 'Real-time system performance metrics',
                type: 'status',
                enabled: false,
                size: 'small',
                position: { x: 1, y: 0 },
            },
            {
                id: '3',
                name: 'Analytics Dashboard',
                description: 'Usage statistics and insights',
                type: 'analytics',
                enabled: true,
                size: 'large',
                position: { x: 0, y: 1 },
            },
            {
                id: '4',
                name: 'Notification Center',
                description: 'Centralized notification management',
                type: 'notifications',
                enabled: false,
                size: 'medium',
                position: { x: 1, y: 1 },
            },
        ];
        setWidgets(widgetList);
    };

    const initializeAdvancedFeatures = () => {
        const features: AdvancedFeature[] = [
            {
                id: '1',
                name: 'Background Processing',
                description: 'Run tasks in background for better performance',
                category: 'processing',
                enabled: true,
                complexity: 'intermediate',
            },
            {
                id: '2',
                name: 'Widget System',
                description: 'Customizable dashboard widgets',
                category: 'widgets',
                enabled: true,
                complexity: 'advanced',
            },
            {
                id: '3',
                name: 'Automated Workflows',
                description: 'Create automated task sequences',
                category: 'automation',
                enabled: false,
                complexity: 'advanced',
            },
            {
                id: '4',
                name: 'Third-party Integration',
                description: 'Connect with external services',
                category: 'integration',
                enabled: false,
                complexity: 'intermediate',
            },
            {
                id: '5',
                name: 'Smart Scheduling',
                description: 'AI-powered task scheduling',
                category: 'automation',
                enabled: false,
                complexity: 'advanced',
            },
            {
                id: '6',
                name: 'Real-time Collaboration',
                description: 'Live collaboration features',
                category: 'integration',
                enabled: false,
                complexity: 'intermediate',
            },
        ];
        setAdvancedFeatures(features);
    };

    const startBackgroundTask = (taskId: string) => {
        setBackgroundTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, status: 'running', progress: 0, startTime: new Date() }
                    : task
            )
        );

        // Simulate task progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                completeTask(taskId);
            }

            setBackgroundTasks(prev =>
                prev.map(task =>
                    task.id === taskId
                        ? { ...task, progress: Math.round(progress) }
                        : task
                )
            );
        }, 500);
    };

    const completeTask = (taskId: string) => {
        setBackgroundTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, status: 'completed', progress: 100, endTime: new Date() }
                    : task
            )
        );
    };

    const toggleWidget = (widgetId: string) => {
        setWidgets(prev =>
            prev.map(widget =>
                widget.id === widgetId
                    ? { ...widget, enabled: !widget.enabled }
                    : widget
            )
        );
    };

    const toggleAdvancedFeature = (featureId: string) => {
        setAdvancedFeatures(prev =>
            prev.map(feature =>
                feature.id === featureId
                    ? { ...feature, enabled: !feature.enabled }
                    : feature
            )
        );
    };

    const startTaskQueue = () => {
        const pendingTasks = backgroundTasks.filter(task => task.status === 'idle');
        if (pendingTasks.length === 0) {
            Alert.alert('No Tasks', 'All tasks are already completed or running');
            return;
        }

        setIsProcessing(true);
        setTaskQueue(pendingTasks);

        // Process tasks sequentially
        let currentIndex = 0;
        const processNextTask = () => {
            if (currentIndex >= pendingTasks.length) {
                setIsProcessing(false);
                setTaskQueue([]);
                Alert.alert('Complete', 'All background tasks have been processed');
                return;
            }

            const task = pendingTasks[currentIndex];
            startBackgroundTask(task.id);

            // Wait for task to complete before starting next
            const checkCompletion = () => {
                const updatedTask = backgroundTasks.find(t => t.id === task.id);
                if (updatedTask?.status === 'completed') {
                    currentIndex++;
                    setTimeout(processNextTask, 1000); // Brief pause between tasks
                } else {
                    setTimeout(checkCompletion, 500);
                }
            };

            setTimeout(checkCompletion, 500);
        };

        processNextTask();
    };

    const resetAllTasks = () => {
        setBackgroundTasks(prev =>
            prev.map(task => ({
                ...task,
                status: 'idle',
                progress: 0,
                startTime: undefined,
                endTime: undefined,
            }))
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'idle': return '#888';
            case 'running': return '#F59E0B';
            case 'completed': return '#10B981';
            case 'failed': return '#EF4444';
            default: return '#888';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return '#888';
        }
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'basic': return '#10B981';
            case 'intermediate': return '#F59E0B';
            case 'advanced': return '#EF4444';
            default: return '#888';
        }
    };

    const renderBackgroundTasks = () => (
        <View style={styles.tasksContainer}>
            <View style={styles.tasksHeader}>
                <Text style={styles.sectionTitle}>Background Tasks</Text>
                <View style={styles.taskControls}>
                    <EnhancedButton
                        title="Start All"
                        variant="primary"
                        onPress={startTaskQueue}
                        disabled={isProcessing}
                        style={styles.controlButton}
                    />
                    <EnhancedButton
                        title="Reset"
                        variant="outline"
                        onPress={resetAllTasks}
                        style={styles.controlButton}
                    />
                </View>
            </View>

            {isProcessing && (
                <View style={styles.processingIndicator}>
                    <ActivityIndicator size="small" color="#FFD700" />
                    <Text style={styles.processingText}>
                        Processing {taskQueue.length} task(s)...
                    </Text>
                </View>
            )}

            {backgroundTasks.map(task => (
                <EnhancedCard key={task.id} variant="glass" style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskName}>{task.name}</Text>
                            <Text style={styles.taskDescription}>{task.description}</Text>
                        </View>
                        <View style={styles.taskMeta}>
                            <View style={[
                                styles.priorityBadge,
                                { backgroundColor: getPriorityColor(task.priority) }
                            ]}>
                                <Text style={styles.priorityText}>{task.priority}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(task.status) }
                            ]}>
                                <Text style={styles.statusText}>{task.status}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.taskProgress}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${task.progress}%` },
                                    { backgroundColor: getStatusColor(task.status) }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{task.progress}%</Text>
                    </View>

                    {task.status === 'idle' && (
                        <EnhancedButton
                            title="Start Task"
                            variant="outline"
                            onPress={() => startBackgroundTask(task.id)}
                            style={styles.startTaskButton}
                        />
                    )}
                </EnhancedCard>
            ))}
        </View>
    );

    const renderWidgets = () => (
        <View style={styles.widgetsContainer}>
            <Text style={styles.sectionTitle}>Widget Management</Text>
            {widgets.map(widget => (
                <EnhancedCard key={widget.id} variant="glass" style={styles.widgetCard}>
                    <View style={styles.widgetHeader}>
                        <View style={styles.widgetInfo}>
                            <Text style={styles.widgetName}>{widget.name}</Text>
                            <Text style={styles.widgetDescription}>{widget.description}</Text>
                            <Text style={styles.widgetType}>Type: {widget.type.replace('_', ' ')}</Text>
                        </View>
                        <Switch
                            value={widget.enabled}
                            onValueChange={() => toggleWidget(widget.id)}
                            trackColor={{ false: '#767577', true: '#FFD700' }}
                            thumbColor={widget.enabled ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.widgetDetails}>
                        <Text style={styles.widgetSize}>Size: {widget.size}</Text>
                        <Text style={styles.widgetPosition}>
                            Position: ({widget.position.x}, {widget.position.y})
                        </Text>
                    </View>
                </EnhancedCard>
            ))}
        </View>
    );

    const renderAdvancedFeatures = () => (
        <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Advanced Features</Text>
            {advancedFeatures.map(feature => (
                <EnhancedCard key={feature.id} variant="glass" style={styles.featureCard}>
                    <View style={styles.featureHeader}>
                        <View style={styles.featureInfo}>
                            <Text style={styles.featureName}>{feature.name}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                            <Text style={styles.featureCategory}>Category: {feature.category}</Text>
                        </View>
                        <View style={styles.featureMeta}>
                            <View style={[
                                styles.complexityBadge,
                                { backgroundColor: getComplexityColor(feature.complexity) }
                            ]}>
                                <Text style={styles.complexityText}>{feature.complexity}</Text>
                            </View>
                            <Switch
                                value={feature.enabled}
                                onValueChange={() => toggleAdvancedFeature(feature.id)}
                                trackColor={{ false: '#767577', true: '#FFD700' }}
                                thumbColor={feature.enabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </EnhancedCard>
            ))}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Advanced Functionality</Text>

            {/* Background Tasks */}
            {renderBackgroundTasks()}

            {/* Widgets */}
            {renderWidgets()}

            {/* Advanced Features */}
            {renderAdvancedFeatures()}

            {/* System Status */}
            <EnhancedCard variant="glass" style={styles.statusCard}>
                <Text style={styles.statusTitle}>System Status</Text>
                <View style={styles.statusGrid}>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Active Tasks</Text>
                        <Text style={styles.statusValue}>
                            {backgroundTasks.filter(t => t.status === 'running').length}
                        </Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Enabled Widgets</Text>
                        <Text style={styles.statusValue}>
                            {widgets.filter(w => w.enabled).length}
                        </Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Active Features</Text>
                        <Text style={styles.statusValue}>
                            {advancedFeatures.filter(f => f.enabled).length}
                        </Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Completed Tasks</Text>
                        <Text style={styles.statusValue}>
                            {backgroundTasks.filter(t => t.status === 'completed').length}
                        </Text>
                    </View>
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
    tasksContainer: {
        marginBottom: 24,
    },
    tasksHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    taskControls: {
        flexDirection: 'row',
        gap: 8,
    },
    controlButton: {
        minWidth: 80,
    },
    processingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,215,0,0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    processingText: {
        color: '#FFD700',
        marginLeft: 8,
        fontFamily: 'SpaceMono',
    },
    taskCard: {
        padding: 16,
        marginBottom: 8,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    taskInfo: {
        flex: 1,
    },
    taskName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    taskDescription: {
        fontSize: 14,
        color: '#ccc',
        fontFamily: 'SpaceMono',
    },
    taskMeta: {
        alignItems: 'flex-end',
        gap: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    taskProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginRight: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: '#f5f5f5',
        fontFamily: 'SpaceMono',
    },
    startTaskButton: {
        marginTop: 8,
    },
    widgetsContainer: {
        marginBottom: 24,
    },
    widgetCard: {
        padding: 16,
        marginBottom: 8,
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    widgetInfo: {
        flex: 1,
    },
    widgetName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    widgetDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    widgetType: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    widgetDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    widgetSize: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    widgetPosition: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    featuresContainer: {
        marginBottom: 24,
    },
    featureCard: {
        padding: 16,
        marginBottom: 8,
    },
    featureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    featureInfo: {
        flex: 1,
    },
    featureName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    featureDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    featureCategory: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    featureMeta: {
        alignItems: 'flex-end',
        gap: 8,
    },
    complexityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    complexityText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    statusCard: {
        padding: 16,
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 18,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    statusItem: {
        flex: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    statusValue: {
        fontSize: 24,
        color: '#FFD700',
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
});
