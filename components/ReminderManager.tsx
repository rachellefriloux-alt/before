import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';

export interface Reminder {
    id: string;
    title: string;
    description: string;
    type: ReminderType;
    frequency: ReminderFrequency;
    time: string; // HH:MM format
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    enabled: boolean;
    lastTriggered?: Date;
    nextTrigger?: Date;
    createdAt: Date;
}

export type ReminderType =
    | 'meditation'
    | 'exercise'
    | 'hydration'
    | 'meal'
    | 'goal_check'
    | 'gratitude'
    | 'sleep'
    | 'custom';

export type ReminderFrequency =
    | 'daily'
    | 'weekly'
    | 'weekdays'
    | 'weekends'
    | 'custom';

interface ReminderManagerProps {
    onReminderTriggered?: (reminder: Reminder) => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({
    onReminderTriggered
}) => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState(false);

    useEffect(() => {
        initializeNotifications();
        loadReminders();
        scheduleExistingReminders();
    }, []);

    const initializeNotifications = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationPermission(status === 'granted');

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('reminders', {
                name: 'Sallie Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#007AFF',
            });
        }
    };

    const loadReminders = async () => {
        try {
            const stored = await AsyncStorage.getItem('sallie_reminders');
            if (stored) {
                const parsedReminders: Reminder[] = JSON.parse(stored);
                setReminders(parsedReminders);
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    };

    const saveReminders = async (remindersToSave: Reminder[]) => {
        try {
            await AsyncStorage.setItem('sallie_reminders', JSON.stringify(remindersToSave));
        } catch (error) {
            console.error('Error saving reminders:', error);
        }
    };

    const scheduleExistingReminders = async () => {
        if (!notificationPermission) return;

        // Cancel all existing notifications
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule active reminders
        for (const reminder of reminders) {
            if (reminder.enabled) {
                await scheduleReminder(reminder);
            }
        }
    };

    const scheduleReminder = async (reminder: Reminder) => {
        if (!notificationPermission) return;

        const [hours, minutes] = reminder.time.split(':').map(Number);
        const now = new Date();

        let triggerDate = new Date();
        triggerDate.setHours(hours, minutes, 0, 0);

        // If the time has already passed today, schedule for tomorrow
        if (triggerDate <= now) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        // Handle different frequencies
        if (reminder.frequency === 'weekly' && reminder.daysOfWeek) {
            const currentDay = now.getDay();
            const targetDay = reminder.daysOfWeek.find(day => day >= currentDay) || reminder.daysOfWeek[0];
            const daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) {
                triggerDate.setDate(triggerDate.getDate() + 7 + daysToAdd);
            } else {
                triggerDate.setDate(triggerDate.getDate() + daysToAdd);
            }
        }

        // For now, just log the scheduling - full implementation would require more complex trigger setup
        console.log(`Scheduling reminder: ${reminder.title} for ${triggerDate.toISOString()}`);
        // await Notifications.scheduleNotificationAsync({
        //   content: {
        //     title: reminder.title,
        //     body: reminder.description,
        //     sound: 'default',
        //     priority: Notifications.AndroidNotificationPriority.HIGH,
        //   },
        //   trigger: triggerDate.getTime(),
        //   identifier: reminder.id,
        // });

        // Update next trigger time
        const updatedReminders = reminders.map(r =>
            r.id === reminder.id ? { ...r, nextTrigger: triggerDate } : r
        );
        setReminders(updatedReminders);
    };

    const createReminder = (reminderData: Partial<Reminder>) => {
        const newReminder: Reminder = {
            id: Date.now().toString(),
            title: reminderData.title || 'New Reminder',
            description: reminderData.description || '',
            type: reminderData.type || 'custom',
            frequency: reminderData.frequency || 'daily',
            time: reminderData.time || '09:00',
            daysOfWeek: reminderData.daysOfWeek || [1, 2, 3, 4, 5], // Monday to Friday
            enabled: true,
            createdAt: new Date(),
            ...reminderData
        };

        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        saveReminders(updatedReminders);

        if (newReminder.enabled) {
            scheduleReminder(newReminder);
        }

        setShowCreateForm(false);
    };

    const toggleReminder = async (reminderId: string) => {
        const updatedReminders = reminders.map(reminder => {
            if (reminder.id === reminderId) {
                const updated = { ...reminder, enabled: !reminder.enabled };

                if (updated.enabled) {
                    scheduleReminder(updated);
                } else {
                    Notifications.cancelScheduledNotificationAsync(reminderId);
                }

                return updated;
            }
            return reminder;
        });

        setReminders(updatedReminders);
        saveReminders(updatedReminders);
    };

    const deleteReminder = async (reminderId: string) => {
        await Notifications.cancelScheduledNotificationAsync(reminderId);

        const updatedReminders = reminders.filter(r => r.id !== reminderId);
        setReminders(updatedReminders);
        saveReminders(updatedReminders);
    };

    const getReminderTypeIcon = (type: ReminderType): string => {
        switch (type) {
            case 'meditation': return '🧘';
            case 'exercise': return '💪';
            case 'hydration': return '💧';
            case 'meal': return '🍽️';
            case 'goal_check': return '🎯';
            case 'gratitude': return '🙏';
            case 'sleep': return '😴';
            default: return '⏰';
        }
    };

    const renderReminderCard = (reminder: Reminder) => (
        <EnhancedCard key={reminder.id} style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
                <View style={styles.reminderTitleRow}>
                    <ThemedText style={styles.reminderIcon}>
                        {getReminderTypeIcon(reminder.type)}
                    </ThemedText>
                    <ThemedText style={styles.reminderTitle}>{reminder.title}</ThemedText>
                    <View style={[styles.statusIndicator, { backgroundColor: reminder.enabled ? '#4CAF50' : '#ccc' }]} />
                </View>
                <ThemedText style={styles.reminderTime}>{reminder.time}</ThemedText>
            </View>

            <ThemedText style={styles.reminderDescription}>{reminder.description}</ThemedText>

            <View style={styles.reminderMeta}>
                <ThemedText style={styles.reminderFrequency}>
                    {reminder.frequency.charAt(0).toUpperCase() + reminder.frequency.slice(1)}
                </ThemedText>
                {reminder.nextTrigger && (
                    <ThemedText style={styles.nextTrigger}>
                        Next: {reminder.nextTrigger.toLocaleDateString()} at {reminder.time}
                    </ThemedText>
                )}
            </View>

            <View style={styles.reminderActions}>
                <EnhancedButton
                    label={reminder.enabled ? 'Disable' : 'Enable'}
                    onPress={() => toggleReminder(reminder.id)}
                    style={styles.actionButton}
                />
                <EnhancedButton
                    label="Delete"
                    onPress={() => deleteReminder(reminder.id)}
                    style={[styles.actionButton, styles.deleteButton]}
                />
            </View>
        </EnhancedCard>
    );

    const getActiveRemindersCount = () => {
        return reminders.filter(r => r.enabled).length;
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Personalized Reminders</ThemedText>
                <EnhancedButton
                    label="Add Reminder"
                    onPress={() => setShowCreateForm(true)}
                    style={styles.addButton}
                />
            </View>

            {!notificationPermission && (
                <EnhancedCard style={styles.permissionCard}>
                    <ThemedText style={styles.permissionTitle}>Notifications Required</ThemedText>
                    <ThemedText style={styles.permissionText}>
                        Please enable notifications to receive reminders.
                    </ThemedText>
                    <EnhancedButton
                        label="Enable Notifications"
                        onPress={initializeNotifications}
                        style={styles.permissionButton}
                    />
                </EnhancedCard>
            )}

            <View style={styles.statsContainer}>
                <EnhancedCard style={styles.statsCard}>
                    <ThemedText style={styles.statsTitle}>Reminder Overview</ThemedText>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{reminders.length}</ThemedText>
                            <ThemedText style={styles.statLabel}>Total Reminders</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>{getActiveRemindersCount()}</ThemedText>
                            <ThemedText style={styles.statLabel}>Active</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>
                                {reminders.filter(r => r.lastTriggered).length}
                            </ThemedText>
                            <ThemedText style={styles.statLabel}>Triggered</ThemedText>
                        </View>
                    </View>
                </EnhancedCard>
            </View>

            <ScrollView style={styles.remindersList}>
                {reminders.map(renderReminderCard)}
            </ScrollView>

            {showCreateForm && (
                <ReminderCreationModal
                    onClose={() => setShowCreateForm(false)}
                    onCreate={createReminder}
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
        minWidth: 120,
    },
    permissionCard: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#FFF3CD',
    },
    permissionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    permissionText: {
        color: '#856404',
        marginBottom: 12,
    },
    permissionButton: {
        alignSelf: 'flex-start',
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
    remindersList: {
        flex: 1,
    },
    reminderCard: {
        marginBottom: 12,
        padding: 16,
    },
    reminderHeader: {
        marginBottom: 8,
    },
    reminderTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    reminderIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    reminderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    reminderTime: {
        fontSize: 16,
        color: '#007aff',
        fontWeight: 'bold',
    },
    reminderDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    reminderMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    reminderFrequency: {
        fontSize: 12,
        color: '#666',
    },
    nextTrigger: {
        fontSize: 12,
        color: '#007aff',
    },
    reminderActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    deleteButton: {
        backgroundColor: '#ff4444',
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

// Placeholder for ReminderCreationModal
const ReminderCreationModal: React.FC<{
    onClose: () => void;
    onCreate: (reminder: Partial<Reminder>) => void;
}> = ({ onClose, onCreate }) => {
    const handleCreate = () => {
        onCreate({
            title: 'Daily Meditation',
            description: 'Take 10 minutes to center yourself and meditate',
            type: 'meditation',
            frequency: 'daily',
            time: '08:00'
        });
        onClose();
    };

    return (
        <View style={styles.modalContainer}>
            <ThemedText>Reminder Creation Modal</ThemedText>
            <EnhancedButton label="Create Sample Reminder" onPress={handleCreate} />
            <EnhancedButton label="Cancel" onPress={onClose} />
        </View>
    );
};

const modalStyles = StyleSheet.create({
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

export default ReminderManager;
