import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';

export interface Goal {
    id: string;
    title: string;
    description: string;
    category: 'health' | 'career' | 'personal' | 'financial' | 'learning' | 'relationships' | 'other';
    type: 'short-term' | 'long-term' | 'milestone' | 'habit-based';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'cancelled';
    progress: number; // 0-100
    targetValue: number;
    currentValue: number;
    unit: string; // e.g., "hours", "pages", "pounds", "dollars"
    deadline?: Date;
    createdDate: Date;
    completedDate?: Date;
    milestones: Milestone[];
    tags: string[];
    linkedHabits: string[]; // habit IDs
    notes: string;
    color: string;
    icon: string;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    completed: boolean;
    deadline?: Date;
    createdDate: Date;
}

export interface GoalStats {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    overdueGoals: number;
    averageProgress: number;
    goalsByCategory: { [key: string]: number };
    goalsByPriority: { [key: string]: number };
    upcomingDeadlines: Goal[];
}

interface GoalManagerProps {
    onGoalUpdated?: (goal: Goal) => void;
    onGoalCompleted?: (goal: Goal) => void;
    linkedHabits?: any[]; // from HabitTracker
}

export const GoalManager: React.FC<GoalManagerProps> = ({
    onGoalUpdated,
    onGoalCompleted,
    linkedHabits = []
}) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [stats, setStats] = useState<GoalStats>({
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        overdueGoals: 0,
        averageProgress: 0,
        goalsByCategory: {},
        goalsByPriority: {},
        upcomingDeadlines: []
    });
    const [showCreateGoal, setShowCreateGoal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Goal['category']>('personal');
    const [filterStatus, setFilterStatus] = useState<Goal['status'] | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<Goal['category'] | 'all'>('all');
    const [showStats, setShowStats] = useState(false);

    // For progress update modal
    const [progressModalVisible, setProgressModalVisible] = useState(false);
    const [progressModalGoal, setProgressModalGoal] = useState<Goal | null>(null);
    const [progressModalValue, setProgressModalValue] = useState('');

    // For edit goal modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editModalGoal, setEditModalGoal] = useState<Goal | null>(null);

    useEffect(() => {
        loadGoalData();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [goals]);

    const loadGoalData = async () => {
        try {
            const storedGoals = await AsyncStorage.getItem('goals');
            if (storedGoals) {
                const parsedGoals = JSON.parse(storedGoals).map((g: any) => ({
                    ...g,
                    createdDate: new Date(g.createdDate),
                    deadline: g.deadline ? new Date(g.deadline) : undefined,
                    completedDate: g.completedDate ? new Date(g.completedDate) : undefined,
                    milestones: g.milestones.map((m: any) => ({
                        ...m,
                        createdDate: new Date(m.createdDate),
                        deadline: m.deadline ? new Date(m.deadline) : undefined
                    }))
                }));
                setGoals(parsedGoals);
            }
        } catch (error) {
            console.error('Error loading goal data:', error);
        }
    };

    const saveGoalData = async (newGoals?: Goal[]) => {
        try {
            await AsyncStorage.setItem('goals', JSON.stringify(newGoals ?? goals));
        } catch (error) {
            console.error('Error saving goal data:', error);
        }
    };

    const calculateStats = () => {
        const now = new Date();
        const activeGoals = goals.filter(g => g.status === 'in-progress');
        const completedGoals = goals.filter(g => g.status === 'completed');
        const overdueGoals = goals.filter(g =>
            g.deadline && g.deadline < now && g.status !== 'completed'
        );

        const averageProgress = activeGoals.length > 0
            ? activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length
            : 0;

        const goalsByCategory = goals.reduce((acc, goal) => {
            acc[goal.category] = (acc[goal.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const goalsByPriority = goals.reduce((acc, goal) => {
            acc[goal.priority] = (acc[goal.priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const upcomingDeadlines = goals
            .filter(g => g.deadline && g.status !== 'completed')
            .sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()))
            .slice(0, 5);

        const newStats: GoalStats = {
            totalGoals: goals.length,
            activeGoals: activeGoals.length,
            completedGoals: completedGoals.length,
            overdueGoals: overdueGoals.length,
            averageProgress,
            goalsByCategory,
            goalsByPriority,
            upcomingDeadlines
        };

        setStats(newStats);
    };

    const createGoal = (goalData: Omit<Goal, 'id' | 'progress' | 'currentValue' | 'createdDate' | 'milestones' | 'tags' | 'linkedHabits' | 'notes'>) => {
        const newGoal: Goal = {
            ...goalData,
            id: Date.now().toString(),
            progress: 0,
            currentValue: 0,
            createdDate: new Date(),
            milestones: [],
            tags: [],
            linkedHabits: [],
            notes: ''
        };

        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        saveGoalData(updatedGoals);
        setShowCreateGoal(false);
    };

    const updateGoalProgress = (goalId: string, newValue: number) => {
        const updatedGoals = goals.map(goal => {
            if (goal.id === goalId) {
                const updatedGoal = {
                    ...goal,
                    currentValue: newValue,
                    progress: Math.min(100, (newValue / goal.targetValue) * 100)
                };

                // Check if goal is completed
                if (updatedGoal.progress >= 100 && goal.status !== 'completed') {
                    updatedGoal.status = 'completed';
                    updatedGoal.completedDate = new Date();
                    onGoalCompleted?.(updatedGoal);
                }

                onGoalUpdated?.(updatedGoal);
                return updatedGoal;
            }
            return goal;
        });

        setGoals(updatedGoals);
        saveGoalData(updatedGoals);
    };

    const updateGoalStatus = (goalId: string, newStatus: Goal['status']) => {
        const updatedGoals = goals.map(goal => {
            if (goal.id === goalId) {
                const updatedGoal = {
                    ...goal,
                    status: newStatus,
                    completedDate: newStatus === 'completed' ? new Date() : undefined
                };

                if (newStatus === 'completed') {
                    onGoalCompleted?.(updatedGoal);
                }

                return updatedGoal;
            }
            return goal;
        });

        setGoals(updatedGoals);
        saveGoalData(updatedGoals);
    };

    const deleteGoal = (goalId: string) => {
        Alert.alert(
            'Delete Goal',
            'Are you sure you want to delete this goal? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedGoals = goals.filter(g => g.id !== goalId);
                        setGoals(updatedGoals);
                        saveGoalData(updatedGoals);
                    }
                }
            ]
        );
    };

    const addMilestone = (goalId: string, milestone: Omit<Milestone, 'id' | 'currentValue' | 'completed' | 'createdDate'>) => {
        const updatedGoals = goals.map(goal => {
            if (goal.id === goalId) {
                const newMilestone: Milestone = {
                    ...milestone,
                    id: Date.now().toString(),
                    currentValue: 0,
                    completed: false,
                    createdDate: new Date()
                };

                return {
                    ...goal,
                    milestones: [...goal.milestones, newMilestone]
                };
            }
            return goal;
        });

        setGoals(updatedGoals);
        saveGoalData(updatedGoals);
    };

    const updateMilestoneProgress = (goalId: string, milestoneId: string, newValue: number) => {
        const updatedGoals = goals.map(goal => {
            if (goal.id === goalId) {
                const updatedMilestones = goal.milestones.map(milestone => {
                    if (milestone.id === milestoneId) {
                        return {
                            ...milestone,
                            currentValue: newValue,
                            completed: newValue >= milestone.targetValue
                        };
                    }
                    return milestone;
                });

                return {
                    ...goal,
                    milestones: updatedMilestones
                };
            }
            return goal;
        });

        setGoals(updatedGoals);
        saveGoalData(updatedGoals);
    };

    const getCategoryColor = (category: Goal['category']): string => {
        const colors = {
            health: '#28A745',
            career: '#007BFF',
            personal: '#E83E8C',
            financial: '#28A745',
            learning: '#6F42C1',
            relationships: '#FD7E14',
            other: '#6C757D'
        };
        return colors[category];
    };

    const getCategoryIcon = (category: Goal['category']): string => {
        const icons = {
            health: '🏃',
            career: '💼',
            personal: '💝',
            financial: '💰',
            learning: '📚',
            relationships: '👥',
            other: '🎯'
        };
        return icons[category];
    };

    const getPriorityColor = (priority: Goal['priority']): string => {
        const colors = {
            low: '#6C757D',
            medium: '#007BFF',
            high: '#FD7E14',
            critical: '#DC3545'
        };
        return colors[priority];
    };

    const filteredGoals = goals.filter(goal => {
        if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
        if (filterCategory !== 'all' && goal.category !== filterCategory) return false;
        return true;
    });

    // Progress Update Modal
    const openProgressModal = (goal: Goal) => {
        setProgressModalGoal(goal);
        setProgressModalValue(goal.currentValue.toString());
        setProgressModalVisible(true);
    };

    const handleProgressModalSubmit = () => {
        if (!progressModalGoal) return;
        const numValue = parseFloat(progressModalValue);
        if (isNaN(numValue) || numValue < 0) {
            Alert.alert('Error', 'Please enter a valid progress value');
            return;
        }
        updateGoalProgress(progressModalGoal.id, numValue);
        setProgressModalVisible(false);
        setProgressModalGoal(null);
        setProgressModalValue('');
    };

    // Edit Goal Modal
    const openEditModal = (goal: Goal) => {
        setEditModalGoal(goal);
        setEditModalVisible(true);
    };

    const handleEditModalSubmit = (updatedGoalData: Omit<Goal, 'id' | 'progress' | 'currentValue' | 'createdDate' | 'milestones' | 'tags' | 'linkedHabits' | 'notes'>) => {
        if (!editModalGoal) return;
        const updatedGoals = goals.map(goal =>
            goal.id === editModalGoal.id
                ? {
                    ...goal,
                    ...updatedGoalData
                }
                : goal
        );
        setGoals(updatedGoals);
        saveGoalData(updatedGoals);
        setEditModalVisible(false);
        setEditModalGoal(null);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Goal Manager</ThemedText>

                {/* Stats Overview */}
                <EnhancedCard style={styles.statsCard}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.activeGoals}</ThemedText>
                            <ThemedText style={styles.statLabel}>Active Goals</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.completedGoals}</ThemedText>
                            <ThemedText style={styles.statLabel}>Completed</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.averageProgress.toFixed(0)}%</ThemedText>
                            <ThemedText style={styles.statLabel}>Avg Progress</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.overdueGoals}</ThemedText>
                            <ThemedText style={styles.statLabel}>Overdue</ThemedText>
                        </View>
                    </View>
                </EnhancedCard>

                {/* Filters */}
                <View style={styles.filters}>
                    <View style={styles.filterRow}>
                        <ThemedText style={styles.filterLabel}>Status:</ThemedText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            {(['all', 'not-started', 'in-progress', 'completed', 'paused'] as const).map(status => (
                                <TouchableOpacity
                                    key={status}
                                    onPress={() => setFilterStatus(status)}
                                    style={[
                                        styles.filterChip,
                                        filterStatus === status && styles.activeFilterChip
                                    ]}
                                >
                                    <ThemedText style={[
                                        styles.filterChipText,
                                        filterStatus === status && styles.activeFilterChipText
                                    ]}>
                                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.filterRow}>
                        <ThemedText style={styles.filterLabel}>Category:</ThemedText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            {(['all', 'health', 'career', 'personal', 'financial', 'learning', 'relationships', 'other'] as const).map(category => (
                                <TouchableOpacity
                                    key={category}
                                    onPress={() => setFilterCategory(category)}
                                    style={[
                                        styles.filterChip,
                                        filterCategory === category && styles.activeFilterChip
                                    ]}
                                >
                                    <ThemedText style={[
                                        styles.filterChipText,
                                        filterCategory === category && styles.activeFilterChipText
                                    ]}>
                                        {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <EnhancedButton
                        label="Create Goal"
                        onPress={() => setShowCreateGoal(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="View Stats"
                        onPress={() => setShowStats(!showStats)}
                        style={styles.actionButton}
                    />
                </View>

                {/* Goals List */}
                <View style={styles.goalsSection}>
                    <ThemedText style={styles.sectionTitle}>
                        Goals ({filteredGoals.length})
                    </ThemedText>

                    {filteredGoals.map(goal => (
                        <EnhancedCard key={goal.id} style={styles.goalCard}>
                            <View style={styles.goalHeader}>
                                <View style={styles.goalInfo}>
                                    <View style={styles.goalIcon}>
                                        <ThemedText style={styles.iconText}>{getCategoryIcon(goal.category)}</ThemedText>
                                    </View>
                                    <View style={styles.goalDetails}>
                                        <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                                        <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
                                    </View>
                                </View>
                                <View style={styles.goalMeta}>
                                    <View style={[
                                        styles.priorityBadge,
                                        { backgroundColor: getPriorityColor(goal.priority) }
                                    ]}>
                                        <ThemedText style={styles.priorityText}>
                                            {goal.priority.toUpperCase()}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={[
                                        styles.statusText,
                                        goal.status === 'completed' && styles.completedStatus,
                                        goal.status === 'in-progress' && styles.inProgressStatus
                                    ]}>
                                        {goal.status.replace('-', ' ').toUpperCase()}
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <ThemedText style={styles.progressText}>
                                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                                    </ThemedText>
                                    <ThemedText style={styles.progressPercent}>
                                        {goal.progress.toFixed(0)}%
                                    </ThemedText>
                                </View>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${goal.progress}%` },
                                            { backgroundColor: getCategoryColor(goal.category) }
                                        ]}
                                    />
                                </View>
                            </View>

                            {goal.deadline && (
                                <View style={styles.deadlineSection}>
                                    <ThemedText style={styles.deadlineText}>
                                        📅 Due: {goal.deadline.toLocaleDateString()}
                                    </ThemedText>
                                    {goal.deadline < new Date() && goal.status !== 'completed' && (
                                        <ThemedText style={styles.overdueText}>⚠️ OVERDUE</ThemedText>
                                    )}
                                </View>
                            )}

                            <View style={styles.goalActions}>
                                <EnhancedButton
                                    label="Update Progress"
                                    onPress={() => openProgressModal(goal)}
                                    style={styles.updateButton}
                                />
                                <EnhancedButton
                                    label="Edit"
                                    onPress={() => openEditModal(goal)}
                                    style={styles.editButton}
                                />
                                <EnhancedButton
                                    label="Delete"
                                    onPress={() => deleteGoal(goal.id)}
                                    style={styles.deleteButton}
                                />
                            </View>

                            {/* Milestones */}
                            {goal.milestones.length > 0 && (
                                <View style={styles.milestonesSection}>
                                    <ThemedText style={styles.milestonesTitle}>Milestones</ThemedText>
                                    {goal.milestones.map(milestone => (
                                        <View key={milestone.id} style={styles.milestoneItem}>
                                            <TouchableOpacity
                                                onPress={() => updateMilestoneProgress(goal.id, milestone.id, milestone.completed ? 0 : milestone.targetValue)}
                                                style={styles.milestoneCheckbox}
                                            >
                                                <ThemedText style={styles.milestoneCheck}>
                                                    {milestone.completed ? '✓' : '○'}
                                                </ThemedText>
                                            </TouchableOpacity>
                                            <View style={styles.milestoneDetails}>
                                                <ThemedText style={[
                                                    styles.milestoneTitle,
                                                    milestone.completed && styles.completedMilestone
                                                ]}>
                                                    {milestone.title}
                                                </ThemedText>
                                                <ThemedText style={styles.milestoneProgress}>
                                                    {milestone.currentValue} / {milestone.targetValue}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </EnhancedCard>
                    ))}

                    {filteredGoals.length === 0 && (
                        <EnhancedCard style={styles.emptyCard}>
                            <ThemedText style={styles.emptyText}>
                                {filterStatus === 'all' && filterCategory === 'all'
                                    ? 'No goals yet. Create your first goal to get started!'
                                    : 'No goals match the current filters.'
                                }
                            </ThemedText>
                        </EnhancedCard>
                    )}
                </View>

                {/* Create Goal Modal */}
                {showCreateGoal && (
                    <Modal
                        visible={showCreateGoal}
                        animationType="slide"
                        transparent
                        onRequestClose={() => setShowCreateGoal(false)}
                    >
                        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                            <GoalForm
                                onSubmit={createGoal}
                                onCancel={() => setShowCreateGoal(false)}
                            />
                        </View>
                    </Modal>
                )}

                {/* Progress Update Modal */}
                <Modal
                    visible={progressModalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setProgressModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <EnhancedCard style={styles.formModal}>
                            <ThemedText style={styles.formTitle}>Update Progress</ThemedText>
                            <ThemedText style={styles.formSubtitle}>
                                {progressModalGoal?.title}
                            </ThemedText>
                            <TextInput
                                placeholder={`Current (${progressModalGoal?.unit})`}
                                value={progressModalValue}
                                onChangeText={setProgressModalValue}
                                style={styles.inputField}
                                keyboardType="numeric"
                                placeholderTextColor="#666"
                            />
                            <View style={styles.formActions}>
                                <EnhancedButton label="Cancel" onPress={() => setProgressModalVisible(false)} style={styles.cancelButton} />
                                <EnhancedButton label="Update" onPress={handleProgressModalSubmit} style={styles.submitButton} />
                            </View>
                        </EnhancedCard>
                    </View>
                </Modal>

                {/* Edit Goal Modal */}
                <Modal
                    visible={editModalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        {editModalGoal && (
                            <GoalForm
                                initialValues={editModalGoal}
                                onSubmit={handleEditModalSubmit}
                                onCancel={() => setEditModalVisible(false)}
                            />
                        )}
                    </View>
                </Modal>

                {/* Stats Modal */}
                <Modal
                    visible={showStats}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowStats(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <EnhancedCard style={styles.formModal}>
                            <ThemedText style={styles.formTitle}>Goal Stats</ThemedText>
                            <ThemedText style={styles.formSubtitle}>Total Goals: {stats.totalGoals}</ThemedText>
                            <ThemedText style={styles.formSubtitle}>Active Goals: {stats.activeGoals}</ThemedText>
                            <ThemedText style={styles.formSubtitle}>Completed Goals: {stats.completedGoals}</ThemedText>
                            <ThemedText style={styles.formSubtitle}>Overdue Goals: {stats.overdueGoals}</ThemedText>
                            <ThemedText style={styles.formSubtitle}>Average Progress: {stats.averageProgress.toFixed(1)}%</ThemedText>
                            <ThemedText style={styles.formSubtitle}>Goals by Category:</ThemedText>
                            {Object.entries(stats.goalsByCategory).map(([cat, count]) => (
                                <ThemedText key={cat} style={styles.statLabel}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}: {count}
                                </ThemedText>
                            ))}
                            <ThemedText style={styles.formSubtitle}>Goals by Priority:</ThemedText>
                            {Object.entries(stats.goalsByPriority).map(([pri, count]) => (
                                <ThemedText key={pri} style={styles.statLabel}>
                                    {pri.charAt(0).toUpperCase() + pri.slice(1)}: {count}
                                </ThemedText>
                            ))}
                            <ThemedText style={styles.formSubtitle}>Upcoming Deadlines:</ThemedText>
                            {stats.upcomingDeadlines.length === 0 ? (
                                <ThemedText style={styles.statLabel}>None</ThemedText>
                            ) : (
                                stats.upcomingDeadlines.map(goal => (
                                    <ThemedText key={goal.id} style={styles.statLabel}>
                                        {goal.title} - {goal.deadline?.toLocaleDateString()}
                                    </ThemedText>
                                ))
                            )}
                            <View style={styles.formActions}>
                                <EnhancedButton label="Close" onPress={() => setShowStats(false)} style={styles.submitButton} />
                            </View>
                        </EnhancedCard>
                    </View>
                </Modal>
            </ScrollView>
        </ThemedView>
    );
};

// Goal Creation/Edit Form Component
const GoalForm: React.FC<{
    onSubmit: (goal: Omit<Goal, 'id' | 'progress' | 'currentValue' | 'createdDate' | 'milestones' | 'tags' | 'linkedHabits' | 'notes'>) => void;
    onCancel: () => void;
    initialValues?: Partial<Goal>;
}> = ({ onSubmit, onCancel, initialValues }) => {
    const [title, setTitle] = useState(initialValues?.title ?? '');
    const [description, setDescription] = useState(initialValues?.description ?? '');
    const [category, setCategory] = useState<Goal['category']>(initialValues?.category ?? 'personal');
    const [type, setType] = useState<Goal['type']>(initialValues?.type ?? 'short-term');
    const [priority, setPriority] = useState<Goal['priority']>(initialValues?.priority ?? 'medium');
    const [targetValue, setTargetValue] = useState(initialValues?.targetValue ?? 1);
    const [unit, setUnit] = useState(initialValues?.unit ?? 'items');
    const [deadline, setDeadline] = useState(initialValues?.deadline ? initialValues.deadline.toISOString().slice(0, 10) : '');

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a goal title');
            return;
        }

        if (targetValue <= 0) {
            Alert.alert('Error', 'Target value must be greater than 0');
            return;
        }

        let parsedDeadline: Date | undefined = undefined;
        if (deadline) {
            const d = new Date(deadline);
            if (!isNaN(d.getTime())) {
                parsedDeadline = d;
            }
        }

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            category,
            type,
            priority,
            status: initialValues?.status ?? 'not-started',
            targetValue,
            unit,
            color: initialValues?.color ?? '#007AFF',
            icon: initialValues?.icon ?? '🎯',
            deadline: parsedDeadline
        });
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>{initialValues ? 'Edit Goal' : 'Create New Goal'}</ThemedText>

            <TextInput
                placeholder="Goal Title"
                value={title}
                onChangeText={setTitle}
                style={styles.inputField}
                placeholderTextColor="#666"
            />

            <TextInput
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                style={[styles.inputField, styles.multilineInput]}
                multiline
                numberOfLines={3}
                placeholderTextColor="#666"
            />

            <ThemedText style={styles.formSubtitle}>Category</ThemedText>
            <View style={styles.categoryGrid}>
                {(['health', 'career', 'personal', 'financial', 'learning', 'relationships', 'other'] as const).map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                            styles.categoryOption,
                            category === cat && styles.selectedCategory
                        ]}
                    >
                        <ThemedText style={styles.categoryOptionText}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <ThemedText style={styles.formSubtitle}>Type</ThemedText>
            <View style={styles.typeGrid}>
                {(['short-term', 'long-term', 'milestone', 'habit-based'] as const).map(t => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setType(t)}
                        style={[
                            styles.typeOption,
                            type === t && styles.selectedType
                        ]}
                    >
                        <ThemedText style={styles.typeOptionText}>
                            {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <ThemedText style={styles.formSubtitle}>Priority</ThemedText>
            <View style={styles.priorityGrid}>
                {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                    <TouchableOpacity
                        key={p}
                        onPress={() => setPriority(p)}
                        style={[
                            styles.priorityOption,
                            priority === p && styles.selectedPriority
                        ]}
                    >
                        <ThemedText style={styles.priorityOptionText}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.targetSection}>
                <ThemedText style={styles.formSubtitle}>Target</ThemedText>
                <View style={styles.targetControls}>
                    <TextInput
                        placeholder="Value"
                        value={targetValue.toString()}
                        onChangeText={(value) => {
                            const num = parseFloat(value);
                            if (!isNaN(num) && num > 0) {
                                setTargetValue(num);
                            } else if (value === '') {
                                setTargetValue(0);
                            }
                        }}
                        style={styles.targetInput}
                        keyboardType="numeric"
                        placeholderTextColor="#666"
                    />
                    <TextInput
                        placeholder="Unit"
                        value={unit}
                        onChangeText={setUnit}
                        style={styles.unitInput}
                        placeholderTextColor="#666"
                    />
                </View>
            </View>

            <View style={styles.targetSection}>
                <ThemedText style={styles.formSubtitle}>Deadline (optional)</ThemedText>
                <TextInput
                    placeholder="YYYY-MM-DD"
                    value={deadline}
                    onChangeText={setDeadline}
                    style={styles.inputField}
                    placeholderTextColor="#666"
                />
            </View>

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label={initialValues ? 'Save Changes' : 'Create Goal'} onPress={handleSubmit} style={styles.submitButton} />
            </View>
        </EnhancedCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsCard: {
        marginBottom: 16,
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        width: '48%',
        marginBottom: 16,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    filters: {
        marginBottom: 16,
    },
    filterRow: {
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    filterScroll: {
        flexDirection: 'row',
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    activeFilterChip: {
        backgroundColor: '#007AFF',
    },
    filterChipText: {
        fontSize: 12,
    },
    activeFilterChipText: {
        color: 'white',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    goalsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    goalCard: {
        marginBottom: 12,
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    goalInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    goalIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    goalDetails: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: 14,
        color: '#666',
    },
    goalMeta: {
        alignItems: 'flex-end',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
    },
    completedStatus: {
        color: '#28A745',
    },
    inProgressStatus: {
        color: '#007AFF',
    },
    progressSection: {
        marginBottom: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E9ECEF',
        borderRadius: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    deadlineSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    deadlineText: {
        fontSize: 14,
        color: '#666',
    },
    overdueText: {
        fontSize: 14,
        color: '#DC3545',
        fontWeight: 'bold',
    },
    goalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    updateButton: {
        flex: 1,
        marginRight: 4,
    },
    editButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    deleteButton: {
        flex: 1,
        marginLeft: 4,
    },
    milestonesSection: {
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
        paddingTop: 12,
    },
    milestonesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    milestoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    milestoneCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    milestoneCheck: {
        fontSize: 14,
        color: '#007AFF',
    },
    milestoneDetails: {
        flex: 1,
    },
    milestoneTitle: {
        fontSize: 14,
        marginBottom: 2,
    },
    completedMilestone: {
        textDecorationLine: 'line-through',
        color: '#666',
    },
    milestoneProgress: {
        fontSize: 12,
        color: '#666',
    },
    emptyCard: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    formModal: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        maxHeight: 600,
        zIndex: 1000,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    formSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 12,
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        color: '#000',
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    categoryOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
        marginBottom: 8,
    },
    selectedCategory: {
        backgroundColor: '#007AFF',
    },
    categoryOptionText: {
        fontSize: 14,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    typeOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
        marginBottom: 8,
    },
    selectedType: {
        backgroundColor: '#007AFF',
    },
    typeOptionText: {
        fontSize: 14,
    },
    priorityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    priorityOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
        marginBottom: 8,
    },
    selectedPriority: {
        backgroundColor: '#007AFF',
    },
    priorityOptionText: {
        fontSize: 14,
    },
    targetSection: {
        marginBottom: 16,
    },
    targetControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    targetInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        fontSize: 16,
    },
    unitInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    submitButton: {
        flex: 1,
        marginLeft: 8,
    },
});
