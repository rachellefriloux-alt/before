import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';
import ProgressBarAnimated from '../components/ProgressBarAnimated';
import { Goal, GoalCategory, GoalPriority, GoalStatus, Milestone } from '../types/goal';

interface GoalTrackerProps {
    onGoalUpdate?: (goal: Goal) => void;
    onGoalComplete?: (goal: Goal) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
    onGoalUpdate,
    onGoalComplete
}) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');
    const [showAddGoal, setShowAddGoal] = useState(false);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            // Load goals from secure storage
            const storedGoals = await loadGoalsFromStorage();
            setGoals(storedGoals);
        } catch (error) {
            console.error('Error loading goals:', error);
        }
    };

    const loadGoalsFromStorage = async (): Promise<Goal[]> => {
        // Implementation for loading goals from encrypted storage
        return [];
    };

    const saveGoalsToStorage = async (goalsToSave: Goal[]) => {
        // Implementation for saving goals to encrypted storage
        console.log('Saving goals:', goalsToSave.length);
    };

    const createGoal = (goalData: Partial<Goal>) => {
        const newGoal: Goal = {
            id: Date.now().toString(),
            title: goalData.title || '',
            description: goalData.description || '',
            category: goalData.category || 'personal',
            priority: goalData.priority || 'medium',
            status: 'not_started',
            progress: 0,
            targetValue: goalData.targetValue || 100,
            currentValue: 0,
            unit: goalData.unit || 'units',
            startDate: new Date(),
            targetDate: goalData.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            milestones: [],
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...goalData
        };

        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        saveGoalsToStorage(updatedGoals);
        setShowAddGoal(false);
    };

    const updateGoalProgress = (goalId: string, newValue: number) => {
        const updatedGoals = goals.map(goal => {
            if (goal.id === goalId) {
                const updatedGoal = {
                    ...goal,
                    currentValue: newValue,
                    progress: Math.min((newValue / goal.targetValue) * 100, 100),
                    updatedAt: new Date()
                };

                // Check if goal is completed
                if (updatedGoal.progress >= 100 && goal.status !== 'completed') {
                    updatedGoal.status = 'completed';
                    updatedGoal.completedDate = new Date();
                    onGoalComplete?.(updatedGoal);
                }

                onGoalUpdate?.(updatedGoal);
                return updatedGoal;
            }
            return goal;
        });

        setGoals(updatedGoals);
        saveGoalsToStorage(updatedGoals);
    };

    const getGoalsByCategory = () => {
        if (selectedCategory === 'all') return goals;
        return goals.filter(goal => goal.category === selectedCategory);
    };

    const getGoalStats = () => {
        const total = goals.length;
        const completed = goals.filter(g => g.status === 'completed').length;
        const inProgress = goals.filter(g => g.status === 'in_progress').length;

        return {
            total,
            completed,
            inProgress,
            completionRate: total > 0 ? (completed / total) * 100 : 0
        };
    };

    const renderGoalCard = (goal: Goal) => (
        <EnhancedCard key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
                <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) }]}>
                    <ThemedText style={styles.priorityText}>{goal.priority.toUpperCase()}</ThemedText>
                </View>
            </View>

            <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <ThemedText style={styles.progressText}>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </ThemedText>
                    <ThemedText style={styles.progressPercent}>
                        {Math.round(goal.progress)}%
                    </ThemedText>
                </View>
                <ProgressBarAnimated
                    progress={goal.progress / 100}
                    height={8}
                    backgroundColor="#e0e0e0"
                    color={getStatusColor(goal.status)}
                />
            </View>

            <View style={styles.goalActions}>
                <EnhancedButton
                    label="Update Progress"
                    onPress={() => handleProgressUpdate(goal)}
                    style={styles.actionButton}
                />
                <EnhancedButton
                    label={goal.status === 'in_progress' ? 'Pause' : 'Start'}
                    onPress={() => toggleGoalStatus(goal)}
                    style={styles.actionButton}
                />
            </View>
        </EnhancedCard>
    );

    const handleProgressUpdate = (goal: Goal) => {
        Alert.prompt(
            'Update Progress',
            `Current: ${goal.currentValue} ${goal.unit}\nTarget: ${goal.targetValue} ${goal.unit}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Update',
                    onPress: (value) => {
                        const numValue = parseFloat(value || '0');
                        if (!isNaN(numValue)) {
                            updateGoalProgress(goal.id, numValue);
                        }
                    }
                }
            ]
        );
    };

    const toggleGoalStatus = (goal: Goal) => {
        const newStatus: GoalStatus = goal.status === 'in_progress' ? 'on_hold' : 'in_progress';
        const updatedGoals = goals.map(g =>
            g.id === goal.id ? { ...g, status: newStatus, updatedAt: new Date() } : g
        );
        setGoals(updatedGoals);
        saveGoalsToStorage(updatedGoals);
    };

    const getPriorityColor = (priority: GoalPriority): string => {
        switch (priority) {
            case 'critical': return '#ff4444';
            case 'high': return '#ff8800';
            case 'medium': return '#ffaa00';
            case 'low': return '#44aa44';
            default: return '#666666';
        }
    };

    const getStatusColor = (status: GoalStatus): string => {
        switch (status) {
            case 'completed': return '#44aa44';
            case 'in_progress': return '#007aff';
            case 'on_hold': return '#ff8800';
            case 'not_started': return '#cccccc';
            case 'cancelled': return '#ff4444';
            default: return '#666666';
        }
    };

    const stats = getGoalStats();
    const filteredGoals = getGoalsByCategory();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Goal Tracker</ThemedText>
                <EnhancedButton
                    label="Add Goal"
                    onPress={() => setShowAddGoal(true)}
                    style={styles.addButton}
                />
            </View>

            <View style={styles.statsContainer}>
                <EnhancedCard style={styles.statsCard}>
                    <ThemedText style={styles.statsTitle}>Progress Overview</ThemedText>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
                            <ThemedText style={styles.statLabel}>Total Goals</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.completed}</ThemedText>
                            <ThemedText style={styles.statLabel}>Completed</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.inProgress}</ThemedText>
                            <ThemedText style={styles.statLabel}>In Progress</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{Math.round(stats.completionRate)}%</ThemedText>
                            <ThemedText style={styles.statLabel}>Success Rate</ThemedText>
                        </View>
                    </View>
                </EnhancedCard>
            </View>

            <ScrollView style={styles.goalsList}>
                {filteredGoals.map(renderGoalCard)}
            </ScrollView>

            {showAddGoal && (
                <GoalCreationModal
                    onClose={() => setShowAddGoal(false)}
                    onCreate={createGoal}
                />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        minWidth: 100,
    },
    statsContainer: {
        marginBottom: 16,
    },
    statsCard: {
        padding: 16,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007aff',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    goalsList: {
        flex: 1,
    },
    goalCard: {
        marginBottom: 12,
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    goalDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007aff',
    },
    goalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

// Placeholder for GoalCreationModal - will be implemented next
const GoalCreationModal: React.FC<{
    onClose: () => void;
    onCreate: (goal: Partial<Goal>) => void;
}> = ({ onClose, onCreate }) => {
    // Simple implementation for now
    const handleCreate = () => {
        onCreate({
            title: 'Sample Goal',
            description: 'This is a sample goal for testing',
            category: 'personal',
            priority: 'medium',
            targetValue: 100,
            unit: 'tasks'
        });
        onClose();
    };

    return (
        <View style={styles.modalContainer}>
            <ThemedText>Goal Creation Modal</ThemedText>
            <EnhancedButton label="Create Sample Goal" onPress={handleCreate} />
            <EnhancedButton label="Cancel" onPress={onClose} />
        </View>
    );
};

export default GoalTracker;
