import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';
import { TextInput } from 'react-native';

export interface Habit {
    id: string;
    name: string;
    description: string;
    category: 'health' | 'productivity' | 'learning' | 'social' | 'personal' | 'other';
    frequency: 'daily' | 'weekly' | 'monthly';
    targetCount: number; // times per frequency period
    currentStreak: number;
    longestStreak: number;
    completedToday: boolean;
    lastCompletedDate: Date | null;
    createdDate: Date;
    color: string;
    icon: string;
    reminderTime?: string;
    isActive: boolean;
}

export interface HabitLog {
    id: string;
    habitId: string;
    date: Date;
    completed: boolean;
    notes?: string;
}

export interface HabitStats {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    currentStreaks: number;
    longestStreak: number;
    completionRate: number;
    weeklyProgress: { [key: string]: number };
}

interface HabitTrackerProps {
    onHabitCompleted?: (habit: Habit) => void;
    onStatsUpdate?: (stats: HabitStats) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
    onHabitCompleted,
    onStatsUpdate
}) => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
    const [stats, setStats] = useState<HabitStats>({
        totalHabits: 0,
        activeHabits: 0,
        completedToday: 0,
        currentStreaks: 0,
        longestStreak: 0,
        completionRate: 0,
        weeklyProgress: {}
    });
    const [showCreateHabit, setShowCreateHabit] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Habit['category']>('personal');
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        loadHabitData();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [habits, habitLogs]);

    const loadHabitData = async () => {
        try {
            const [storedHabits, storedLogs] = await Promise.all([
                AsyncStorage.getItem('habits'),
                AsyncStorage.getItem('habit_logs')
            ]);

            if (storedHabits) {
                const parsedHabits = JSON.parse(storedHabits).map((h: any) => ({
                    ...h,
                    createdDate: new Date(h.createdDate),
                    lastCompletedDate: h.lastCompletedDate ? new Date(h.lastCompletedDate) : null
                }));
                setHabits(parsedHabits);
            }

            if (storedLogs) {
                const parsedLogs = JSON.parse(storedLogs).map((l: any) => ({
                    ...l,
                    date: new Date(l.date)
                }));
                setHabitLogs(parsedLogs);
            }
        } catch (error) {
            console.error('Error loading habit data:', error);
        }
    };

    const saveHabitData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem('habits', JSON.stringify(habits)),
                AsyncStorage.setItem('habit_logs', JSON.stringify(habitLogs))
            ]);
        } catch (error) {
            console.error('Error saving habit data:', error);
        }
    };

    const calculateStats = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeHabits = habits.filter(h => h.isActive);
        const completedToday = habits.filter(h => h.completedToday).length;

        let totalStreaks = 0;
        let longestStreak = 0;
        let totalCompletions = 0;
        let totalPossible = 0;

        // Calculate weekly progress
        const weeklyProgress: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            weeklyProgress[dateKey] = 0;
        }

        habits.forEach(habit => {
            if (habit.currentStreak > 0) totalStreaks++;
            if (habit.longestStreak > longestStreak) longestStreak = habit.longestStreak;

            // Calculate completion rate
            const habitLogsForHabit = habitLogs.filter(log => log.habitId === habit.id);
            totalCompletions += habitLogsForHabit.filter(log => log.completed).length;
            totalPossible += habitLogsForHabit.length;

            // Update weekly progress
            habitLogsForHabit.forEach(log => {
                const dateKey = log.date.toISOString().split('T')[0];
                if (weeklyProgress[dateKey] !== undefined) {
                    weeklyProgress[dateKey] += log.completed ? 1 : 0;
                }
            });
        });

        const completionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

        const newStats: HabitStats = {
            totalHabits: habits.length,
            activeHabits: activeHabits.length,
            completedToday,
            currentStreaks: totalStreaks,
            longestStreak,
            completionRate,
            weeklyProgress
        };

        setStats(newStats);
        onStatsUpdate?.(newStats);
    };

    const createHabit = (habitData: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'completedToday' | 'lastCompletedDate' | 'createdDate'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: Date.now().toString(),
            currentStreak: 0,
            longestStreak: 0,
            completedToday: false,
            lastCompletedDate: null,
            createdDate: new Date()
        };

        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        saveHabitData();
        setShowCreateHabit(false);
    };

    const toggleHabitCompletion = (habitId: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedHabits = habits.map(habit => {
            if (habit.id === habitId) {
                const wasCompleted = habit.completedToday;
                const newCompleted = !wasCompleted;

                let newStreak = habit.currentStreak;
                let newLongestStreak = habit.longestStreak;

                if (newCompleted) {
                    newStreak = habit.currentStreak + 1;
                    if (newStreak > newLongestStreak) {
                        newLongestStreak = newStreak;
                    }
                } else {
                    newStreak = Math.max(0, habit.currentStreak - 1);
                }

                return {
                    ...habit,
                    completedToday: newCompleted,
                    currentStreak: newStreak,
                    longestStreak: newLongestStreak,
                    lastCompletedDate: newCompleted ? today : habit.lastCompletedDate
                };
            }
            return habit;
        });

        setHabits(updatedHabits);

        // Log the completion
        const logEntry: HabitLog = {
            id: Date.now().toString(),
            habitId,
            date: today,
            completed: !habits.find(h => h.id === habitId)?.completedToday,
            notes: undefined
        };

        const updatedLogs = [...habitLogs.filter(log => !(log.habitId === habitId && log.date.getTime() === today.getTime())), logEntry];
        setHabitLogs(updatedLogs);

        saveHabitData();

        const completedHabit = updatedHabits.find(h => h.id === habitId);
        if (completedHabit && !habits.find(h => h.id === habitId)?.completedToday) {
            onHabitCompleted?.(completedHabit);
        }
    };

    const deleteHabit = (habitId: string) => {
        Alert.alert(
            'Delete Habit',
            'Are you sure you want to delete this habit? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedHabits = habits.filter(h => h.id !== habitId);
                        const updatedLogs = habitLogs.filter(log => log.habitId !== habitId);
                        setHabits(updatedHabits);
                        setHabitLogs(updatedLogs);
                        saveHabitData();
                    }
                }
            ]
        );
    };

    const getCategoryColor = (category: Habit['category']): string => {
        const colors = {
            health: '#28A745',
            productivity: '#007BFF',
            learning: '#6F42C1',
            social: '#FD7E14',
            personal: '#E83E8C',
            other: '#6C757D'
        };
        return colors[category];
    };

    const getCategoryIcon = (category: Habit['category']): string => {
        const icons = {
            health: '🏃',
            productivity: '⚡',
            learning: '📚',
            social: '👥',
            personal: '💝',
            other: '🎯'
        };
        return icons[category];
    };

    const resetDailyCompletions = () => {
        const updatedHabits = habits.map(habit => ({
            ...habit,
            completedToday: false
        }));
        setHabits(updatedHabits);
        saveHabitData();
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Habit Tracker</ThemedText>

                {/* Stats Overview */}
                <EnhancedCard style={styles.statsCard}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.activeHabits}</ThemedText>
                            <ThemedText style={styles.statLabel}>Active Habits</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.completedToday}</ThemedText>
                            <ThemedText style={styles.statLabel}>Completed Today</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.currentStreaks}</ThemedText>
                            <ThemedText style={styles.statLabel}>Current Streaks</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{stats.completionRate.toFixed(0)}%</ThemedText>
                            <ThemedText style={styles.statLabel}>Success Rate</ThemedText>
                        </View>
                    </View>
                </EnhancedCard>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <EnhancedButton
                        label="Create Habit"
                        onPress={() => setShowCreateHabit(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="View Stats"
                        onPress={() => setShowStats(!showStats)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Reset Today"
                        onPress={resetDailyCompletions}
                        style={styles.actionButton}
                    />
                </View>

                {/* Habits List */}
                <View style={styles.habitsSection}>
                    <ThemedText style={styles.sectionTitle}>Today's Habits</ThemedText>
                    {habits.filter(h => h.isActive).map(habit => (
                        <EnhancedCard key={habit.id} style={styles.habitCard}>
                            <View style={styles.habitHeader}>
                                <View style={styles.habitInfo}>
                                    <View style={styles.habitIcon}>
                                        <ThemedText style={styles.iconText}>{getCategoryIcon(habit.category)}</ThemedText>
                                    </View>
                                    <View style={styles.habitDetails}>
                                        <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
                                        <ThemedText style={styles.habitDescription}>{habit.description}</ThemedText>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => toggleHabitCompletion(habit.id)}
                                    style={[
                                        styles.completionButton,
                                        habit.completedToday && styles.completedButton,
                                        { borderColor: getCategoryColor(habit.category) }
                                    ]}
                                >
                                    <ThemedText style={[
                                        styles.completionText,
                                        habit.completedToday && styles.completedText
                                    ]}>
                                        {habit.completedToday ? '✓' : '○'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.habitStats}>
                                <ThemedText style={styles.streakText}>
                                    🔥 {habit.currentStreak} day streak
                                </ThemedText>
                                <ThemedText style={styles.frequencyText}>
                                    {habit.frequency} • {habit.targetCount}x target
                                </ThemedText>
                            </View>

                            <View style={styles.habitActions}>
                                <EnhancedButton
                                    label="Edit"
                                    onPress={() => {/* TODO: Implement edit */ }}
                                    style={styles.editButton}
                                />
                                <EnhancedButton
                                    label="Delete"
                                    onPress={() => deleteHabit(habit.id)}
                                    style={styles.deleteButton}
                                />
                            </View>
                        </EnhancedCard>
                    ))}

                    {habits.filter(h => h.isActive).length === 0 && (
                        <EnhancedCard style={styles.emptyCard}>
                            <ThemedText style={styles.emptyText}>
                                No active habits yet. Create your first habit to get started!
                            </ThemedText>
                        </EnhancedCard>
                    )}
                </View>

                {/* Detailed Stats */}
                {showStats && (
                    <View style={styles.detailedStats}>
                        <ThemedText style={styles.sectionTitle}>Detailed Statistics</ThemedText>

                        <EnhancedCard style={styles.statsDetailCard}>
                            <ThemedText style={styles.statsTitle}>Weekly Progress</ThemedText>
                            <View style={styles.weeklyChart}>
                                {Object.entries(stats.weeklyProgress).map(([date, count]) => (
                                    <View key={date} style={styles.chartBar}>
                                        <View
                                            style={[
                                                styles.chartFill,
                                                { height: `${(count / Math.max(stats.activeHabits, 1)) * 100}%` }
                                            ]}
                                        />
                                        <ThemedText style={styles.chartLabel}>
                                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </ThemedText>
                                    </View>
                                ))}
                            </View>
                        </EnhancedCard>

                        <EnhancedCard style={styles.statsDetailCard}>
                            <ThemedText style={styles.statsTitle}>Habit Categories</ThemedText>
                            {Object.entries(
                                habits.reduce((acc, habit) => {
                                    acc[habit.category] = (acc[habit.category] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([category, count]) => (
                                <View key={category} style={styles.categoryStat}>
                                    <View style={styles.categoryIndicator}>
                                        <ThemedText style={styles.categoryIcon}>
                                            {getCategoryIcon(category as Habit['category'])}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.categoryName}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </ThemedText>
                                    <ThemedText style={styles.categoryCount}>{count}</ThemedText>
                                </View>
                            ))}
                        </EnhancedCard>
                    </View>
                )}

                {/* Create Habit Modal */}
                {showCreateHabit && (
                    <HabitForm
                        onSubmit={createHabit}
                        onCancel={() => setShowCreateHabit(false)}
                    />
                )}
            </ScrollView>
        </ThemedView>
    );
};

// Habit Creation Form Component
const HabitForm: React.FC<{
    onSubmit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'completedToday' | 'lastCompletedDate' | 'createdDate'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Habit['category']>('personal');
    const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
    const [targetCount, setTargetCount] = useState(1);
    const [reminderTime, setReminderTime] = useState('');

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a habit name');
            return;
        }

        onSubmit({
            name: name.trim(),
            description: description.trim(),
            category,
            frequency,
            targetCount,
            color: '#007AFF',
            icon: '🎯',
            reminderTime: reminderTime || undefined,
            isActive: true
        });
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>Create New Habit</ThemedText>

            <TextInput
                placeholder="Habit Name"
                value={name}
                onChangeText={setName}
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
                {(['health', 'productivity', 'learning', 'social', 'personal', 'other'] as const).map(cat => (
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

            <ThemedText style={styles.formSubtitle}>Frequency</ThemedText>
            <View style={styles.frequencyGrid}>
                {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                    <TouchableOpacity
                        key={freq}
                        onPress={() => setFrequency(freq)}
                        style={[
                            styles.frequencyOption,
                            frequency === freq && styles.selectedFrequency
                        ]}
                    >
                        <ThemedText style={styles.frequencyOptionText}>
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <ThemedText style={styles.formSubtitle}>Target Count</ThemedText>
            <View style={styles.targetControls}>
                <TouchableOpacity
                    onPress={() => setTargetCount(Math.max(1, targetCount - 1))}
                    style={styles.targetButton}
                >
                    <ThemedText style={styles.targetButtonText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.targetValue}>{targetCount}</ThemedText>
                <TouchableOpacity
                    onPress={() => setTargetCount(targetCount + 1)}
                    style={styles.targetButton}
                >
                    <ThemedText style={styles.targetButtonText}>+</ThemedText>
                </TouchableOpacity>
            </View>

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label="Create Habit" onPress={handleSubmit} style={styles.submitButton} />
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
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    habitsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    habitCard: {
        marginBottom: 12,
        padding: 16,
    },
    habitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    habitInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    habitIcon: {
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
    habitDetails: {
        flex: 1,
    },
    habitName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    habitDescription: {
        fontSize: 14,
        color: '#666',
    },
    completionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    completedButton: {
        backgroundColor: '#28A745',
    },
    completionText: {
        fontSize: 20,
        color: '#007AFF',
    },
    completedText: {
        color: 'white',
    },
    habitStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    streakText: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '600',
    },
    frequencyText: {
        fontSize: 14,
        color: '#666',
    },
    habitActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        flex: 1,
        marginRight: 8,
    },
    deleteButton: {
        flex: 1,
        marginLeft: 8,
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
    detailedStats: {
        marginBottom: 20,
    },
    statsDetailCard: {
        marginBottom: 12,
        padding: 16,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    weeklyChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
        marginTop: 12,
    },
    chartBar: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 2,
    },
    chartFill: {
        width: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
        minHeight: 4,
    },
    chartLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    categoryStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryIndicator: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    categoryIcon: {
        fontSize: 16,
    },
    categoryName: {
        flex: 1,
        fontSize: 14,
    },
    categoryCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
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
    frequencyGrid: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    frequencyOption: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 4,
        alignItems: 'center',
    },
    selectedFrequency: {
        backgroundColor: '#007AFF',
    },
    frequencyOptionText: {
        fontSize: 14,
    },
    targetControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    targetButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    targetButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    targetValue: {
        fontSize: 18,
        fontWeight: 'bold',
        minWidth: 40,
        textAlign: 'center',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
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

export default HabitTracker;
