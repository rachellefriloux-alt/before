import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';
import ProgressBarAnimated from '../components/ProgressBarAnimated';

export interface HealthMetric {
    id: string;
    type: HealthMetricType;
    value: number;
    unit: string;
    date: Date;
    notes?: string;
}

export interface FitnessGoal {
    id: string;
    type: FitnessGoalType;
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: Date;
    targetDate: Date;
    completed: boolean;
}

export type HealthMetricType =
    | 'steps'
    | 'calories'
    | 'heart_rate'
    | 'sleep_hours'
    | 'water_intake'
    | 'weight'
    | 'blood_pressure_systolic'
    | 'blood_pressure_diastolic'
    | 'mood'
    | 'energy_level';

export type FitnessGoalType =
    | 'daily_steps'
    | 'weekly_exercise'
    | 'monthly_weight_loss'
    | 'sleep_hours'
    | 'hydration'
    | 'custom';

interface HealthFitnessTrackerProps {
    onHealthUpdate?: (metric: HealthMetric) => void;
    onGoalAchieved?: (goal: FitnessGoal) => void;
}

export const HealthFitnessTracker: React.FC<HealthFitnessTrackerProps> = ({
    onHealthUpdate,
    onGoalAchieved
}) => {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [goals, setGoals] = useState<FitnessGoal[]>([]);
    const [todayMetrics, setTodayMetrics] = useState<Record<HealthMetricType, number>>({
        steps: 0,
        calories: 0,
        heart_rate: 0,
        sleep_hours: 0,
        water_intake: 0,
        weight: 0,
        blood_pressure_systolic: 0,
        blood_pressure_diastolic: 0,
        mood: 5,
        energy_level: 5
    });

    useEffect(() => {
        loadHealthData();
        loadFitnessGoals();
    }, []);

    const loadHealthData = async () => {
        try {
            const stored = await AsyncStorage.getItem('sallie_health_metrics');
            if (stored) {
                const parsedMetrics: HealthMetric[] = JSON.parse(stored).map((m: any) => ({
                    ...m,
                    date: new Date(m.date)
                }));
                setMetrics(parsedMetrics);

                // Calculate today's metrics
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayData = parsedMetrics.filter(m => new Date(m.date) >= today);

                const todaySummary = todayData.reduce((acc, metric) => {
                    acc[metric.type] = (acc[metric.type] || 0) + metric.value;
                    return acc;
                }, {} as Record<HealthMetricType, number>);

                setTodayMetrics({ ...todayMetrics, ...todaySummary });
            }
        } catch (error) {
            console.error('Error loading health data:', error);
        }
    };

    const loadFitnessGoals = async () => {
        try {
            const stored = await AsyncStorage.getItem('sallie_fitness_goals');
            if (stored) {
                const parsedGoals: FitnessGoal[] = JSON.parse(stored).map((g: any) => ({
                    ...g,
                    startDate: new Date(g.startDate),
                    targetDate: new Date(g.targetDate)
                }));
                setGoals(parsedGoals);
            }
        } catch (error) {
            console.error('Error loading fitness goals:', error);
        }
    };

    const saveHealthData = async (dataToSave: HealthMetric[]) => {
        try {
            await AsyncStorage.setItem('sallie_health_metrics', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving health data:', error);
        }
    };

    const saveFitnessGoals = async (goalsToSave: FitnessGoal[]) => {
        try {
            await AsyncStorage.setItem('sallie_fitness_goals', JSON.stringify(goalsToSave));
        } catch (error) {
            console.error('Error saving fitness goals:', error);
        }
    };

    const addHealthMetric = (type: HealthMetricType, value: number, unit: string, notes?: string) => {
        const newMetric: HealthMetric = {
            id: Date.now().toString(),
            type,
            value,
            unit,
            date: new Date(),
            notes
        };

        const updatedMetrics = [...metrics, newMetric];
        setMetrics(updatedMetrics);
        saveHealthData(updatedMetrics);

        // Update today's metrics
        setTodayMetrics(prev => ({
            ...prev,
            [type]: (prev[type] || 0) + value
        }));

        onHealthUpdate?.(newMetric);
    };

    const createFitnessGoal = (goalData: Partial<FitnessGoal>) => {
        const newGoal: FitnessGoal = {
            id: Date.now().toString(),
            type: goalData.type || 'custom',
            targetValue: goalData.targetValue || 100,
            currentValue: 0,
            unit: goalData.unit || 'units',
            startDate: new Date(),
            targetDate: goalData.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            completed: false,
            ...goalData
        };

        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        saveFitnessGoals(updatedGoals);
    };

    const updateGoalProgress = (goalId: string, newValue: number) => {
        const updatedGoals = goals.map(goal => {
            if (goal.id === goalId) {
                const updatedGoal = {
                    ...goal,
                    currentValue: newValue,
                    completed: newValue >= goal.targetValue
                };

                if (updatedGoal.completed && !goal.completed) {
                    onGoalAchieved?.(updatedGoal);
                }

                return updatedGoal;
            }
            return goal;
        });

        setGoals(updatedGoals);
        saveFitnessGoals(updatedGoals);
    };

    const getMetricIcon = (type: HealthMetricType): string => {
        switch (type) {
            case 'steps': return '🚶';
            case 'calories': return '🔥';
            case 'heart_rate': return '❤️';
            case 'sleep_hours': return '😴';
            case 'water_intake': return '💧';
            case 'weight': return '⚖️';
            case 'blood_pressure_systolic':
            case 'blood_pressure_diastolic': return '🩸';
            case 'mood': return '😊';
            case 'energy_level': return '⚡';
            default: return '📊';
        }
    };

    const getMetricDisplayName = (type: HealthMetricType): string => {
        switch (type) {
            case 'steps': return 'Steps';
            case 'calories': return 'Calories';
            case 'heart_rate': return 'Heart Rate';
            case 'sleep_hours': return 'Sleep Hours';
            case 'water_intake': return 'Water Intake';
            case 'weight': return 'Weight';
            case 'blood_pressure_systolic': return 'Blood Pressure (Systolic)';
            case 'blood_pressure_diastolic': return 'Blood Pressure (Diastolic)';
            case 'mood': return 'Mood';
            case 'energy_level': return 'Energy Level';
            default: return type;
        }
    };

    const getGoalProgress = (goal: FitnessGoal): number => {
        return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
    };

    const renderMetricCard = (type: HealthMetricType) => {
        const value = todayMetrics[type];
        const target = getMetricTarget(type);
        const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;

        return (
            <EnhancedCard key={type} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                    <ThemedText style={styles.metricIcon}>{getMetricIcon(type)}</ThemedText>
                    <ThemedText style={styles.metricTitle}>{getMetricDisplayName(type)}</ThemedText>
                </View>

                <View style={styles.metricValue}>
                    <ThemedText style={styles.metricNumber}>
                        {value.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={styles.metricUnit}>{getMetricUnit(type)}</ThemedText>
                </View>

                {target > 0 && (
                    <View style={styles.metricProgress}>
                        <ProgressBarAnimated
                            progress={progress / 100}
                            height={6}
                            color={progress >= 100 ? '#4CAF50' : '#007AFF'}
                        />
                        <ThemedText style={styles.progressText}>
                            {Math.round(progress)}% of daily goal
                        </ThemedText>
                    </View>
                )}

                <EnhancedButton
                    label="Add Entry"
                    onPress={() => handleAddMetric(type)}
                    style={styles.addEntryButton}
                />
            </EnhancedCard>
        );
    };

    const renderGoalCard = (goal: FitnessGoal) => (
        <EnhancedCard key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
                <ThemedText style={styles.goalTitle}>{goal.type.replace('_', ' ').toUpperCase()}</ThemedText>
                <View style={[styles.goalStatus, { backgroundColor: goal.completed ? '#4CAF50' : '#FFA500' }]}>
                    <ThemedText style={styles.goalStatusText}>
                        {goal.completed ? 'Complete' : 'In Progress'}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.goalProgress}>
                <ThemedText style={styles.goalValue}>
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                </ThemedText>
                <ProgressBarAnimated
                    progress={getGoalProgress(goal) / 100}
                    height={8}
                    color={goal.completed ? '#4CAF50' : '#007AFF'}
                />
            </View>

            <View style={styles.goalActions}>
                <EnhancedButton
                    label="Update Progress"
                    onPress={() => handleUpdateGoal(goal)}
                    style={styles.goalActionButton}
                />
            </View>
        </EnhancedCard>
    );

    const handleAddMetric = (type: HealthMetricType) => {
        const unit = getMetricUnit(type);
        Alert.prompt(
            `Add ${getMetricDisplayName(type)}`,
            `Enter value in ${unit}:`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add',
                    onPress: (value) => {
                        const numValue = parseFloat(value || '0');
                        if (!isNaN(numValue)) {
                            addHealthMetric(type, numValue, unit);
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateGoal = (goal: FitnessGoal) => {
        Alert.prompt(
            'Update Goal Progress',
            `Current: ${goal.currentValue} ${goal.unit}`,
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

    const getMetricTarget = (type: HealthMetricType): number => {
        switch (type) {
            case 'steps': return 10000;
            case 'calories': return 2000;
            case 'sleep_hours': return 8;
            case 'water_intake': return 8; // glasses
            default: return 0;
        }
    };

    const getMetricUnit = (type: HealthMetricType): string => {
        switch (type) {
            case 'steps': return 'steps';
            case 'calories': return 'cal';
            case 'heart_rate': return 'bpm';
            case 'sleep_hours': return 'hrs';
            case 'water_intake': return 'glasses';
            case 'weight': return 'lbs';
            case 'blood_pressure_systolic':
            case 'blood_pressure_diastolic': return 'mmHg';
            case 'mood':
            case 'energy_level': return '/10';
            default: return 'units';
        }
    };

    const getHealthScore = (): number => {
        let score = 0;
        let totalMetrics = 0;

        Object.entries(todayMetrics).forEach(([type, value]) => {
            const target = getMetricTarget(type as HealthMetricType);
            if (target > 0) {
                const percentage = Math.min((value / target) * 100, 100);
                score += percentage;
                totalMetrics++;
            }
        });

        return totalMetrics > 0 ? score / totalMetrics : 0;
    };

    const healthScore = getHealthScore();

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Health & Fitness Tracker</ThemedText>
                <EnhancedButton
                    label="Add Goal"
                    onPress={() => createFitnessGoal({ type: 'custom', targetValue: 100, unit: 'units' })}
                    style={styles.addButton}
                />
            </View>

            <View style={styles.overviewContainer}>
                <EnhancedCard style={styles.overviewCard}>
                    <ThemedText style={styles.overviewTitle}>Today's Health Score</ThemedText>
                    <View style={styles.scoreContainer}>
                        <ThemedText style={styles.scoreValue}>{Math.round(healthScore)}%</ThemedText>
                        <ProgressBarAnimated
                            progress={healthScore / 100}
                            height={12}
                            color={healthScore >= 80 ? '#4CAF50' : healthScore >= 60 ? '#FFA500' : '#FF4444'}
                        />
                    </View>
                    <ThemedText style={styles.scoreDescription}>
                        {healthScore >= 80 ? 'Excellent!' : healthScore >= 60 ? 'Good progress' : 'Room for improvement'}
                    </ThemedText>
                </EnhancedCard>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Today's Metrics</ThemedText>
                    <View style={styles.metricsGrid}>
                        {(Object.keys(todayMetrics) as HealthMetricType[]).map(renderMetricCard)}
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Fitness Goals</ThemedText>
                    {goals.map(renderGoalCard)}
                </View>
            </ScrollView>
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
    overviewContainer: {
        marginBottom: 16,
    },
    overviewCard: {
        padding: 20,
        alignItems: 'center',
    },
    overviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    scoreContainer: {
        width: '100%',
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    scoreDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        width: '48%',
        marginBottom: 12,
        padding: 12,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    metricTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
    },
    metricValue: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    metricNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    metricUnit: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    metricProgress: {
        marginBottom: 8,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    addEntryButton: {
        alignSelf: 'stretch',
    },
    goalCard: {
        marginBottom: 12,
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    goalStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    goalStatusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    goalProgress: {
        marginBottom: 12,
    },
    goalValue: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
        color: '#007AFF',
    },
    goalActions: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    goalActionButton: {
        minWidth: 120,
    },
});

export default HealthFitnessTracker;
