/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Routine sequencer for managing and executing user routines.
 * Got it, love.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUserStore } from '../app/store/user';

export interface RoutineStep {
  id: string;
  name: string;
  description: string;
  duration?: number; // in seconds
  action: (userId: string) => Promise<void>;
  completed?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  steps: RoutineStep[];
  category: 'morning' | 'evening' | 'workout' | 'meditation' | 'custom';
  estimatedDuration: number; // in minutes
}

export interface RoutineExecution {
  routineId: string;
  startTime: Date;
  currentStep: number;
  completedSteps: string[];
  status: 'running' | 'paused' | 'completed' | 'cancelled';
}

class RoutineManager {
  private routines: Map<string, Routine> = new Map();
  private executions: Map<string, RoutineExecution> = new Map();
  private executionHistory: Map<string, RoutineExecution[]> = new Map();

  constructor() {
    this.initializeDefaultRoutines();
  }

  private initializeDefaultRoutines() {
    // Morning routine
    this.routines.set('morning_routine', {
      id: 'morning_routine',
      name: 'Morning Routine',
      description: 'Start your day with intention and energy',
      category: 'morning',
      estimatedDuration: 15,
      steps: [
        {
          id: 'morning_greeting',
          name: 'Morning Greeting',
          description: 'Personalized morning greeting from Sallie',
          action: async () => {
            console.log('Executing morning greeting');
            // Generate personalized greeting based on user data
            const personalizedGreeting = await this.generatePersonalizedGreeting();
            console.log(`Personalized greeting: ${personalizedGreeting}`);

            // Integrate with TTS system
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(personalizedGreeting);
              utterance.rate = 0.9;
              utterance.pitch = 1.1;
              window.speechSynthesis.speak(utterance);
            }
          }
        },
        {
          id: 'gratitude_practice',
          name: 'Gratitude Practice',
          description: 'Take a moment for gratitude',
          duration: 60,
          action: async () => {
            console.log('Executing gratitude practice');
            // Enhanced gratitude practice with input prompt
            Alert.prompt(
              'Gratitude Practice',
              'Take a deep breath and think of three things you\'re grateful for today. What\'s one thing that made you smile?',
              [
                {
                  text: 'Skip',
                  style: 'cancel'
                },
                {
                  text: 'Share Gratitude',
                  onPress: (gratitude) => {
                    if (gratitude && gratitude.trim()) {
                      console.log(`Gratitude recorded: ${gratitude}`);
                      Alert.alert(
                        'Gratitude Recorded 💝',
                        `"${gratitude}"\n\nThat's beautiful! Gratitude like this builds real strength. You're cultivating something powerful here.`,
                        [{ text: 'Continue' }]
                      );
                    }
                  }
                }
              ],
              'plain-text',
              '',
              'default'
            );
          }
        },
        {
          id: 'goal_setting',
          name: 'Goal Setting',
          description: 'Set intentions for the day',
          action: async () => {
            console.log('Executing goal setting');
            // Open goal setting interface
            Alert.alert(
              'Daily Intentions',
              'What\'s your main focus for today? Let\'s set a clear intention.',
              [
                {
                  text: 'Set Goal',
                  onPress: () => {
                    // Enhanced goal setting with input prompt
                    Alert.prompt(
                      'Set Your Daily Intention',
                      'What\'s your main focus for today? Be specific and actionable.',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        },
                        {
                          text: 'Set Goal',
                          onPress: (goal) => {
                            if (goal && goal.trim()) {
                              console.log(`Goal set: ${goal}`);
                              Alert.alert(
                                'Goal Set! 💪',
                                `"${goal}"\n\nYou've got this! Remember, progress over perfection. I'll help you stay on track.`,
                                [{ text: 'Let\'s Go!' }]
                              );
                            }
                          }
                        }
                      ],
                      'plain-text',
                      '',
                      'default'
                    );
                  }
                },
                {
                  text: 'Skip',
                  style: 'cancel'
                }
              ]
            );
          }
        }
      ]
    });

    // Evening routine
    this.routines.set('evening_routine', {
      id: 'evening_routine',
      name: 'Evening Wind Down',
      description: 'Prepare for restful sleep',
      category: 'evening',
      estimatedDuration: 20,
      steps: [
        {
          id: 'reflection',
          name: 'Daily Reflection',
          description: 'Reflect on the day\'s achievements',
          action: async () => {
            console.log('Executing daily reflection');
            // Show reflection prompt
            Alert.alert(
              'Daily Reflection',
              'What\'s one thing you\'re proud of accomplishing today? Take a moment to acknowledge your progress.',
              [
                {
                  text: 'Reflect',
                  onPress: () => {
                    // Enhanced reflection with input prompt
                    Alert.prompt(
                      'Daily Reflection',
                      'What\'s one thing you\'re proud of accomplishing today? Take a moment to acknowledge your progress and growth.',
                      [
                        {
                          text: 'Skip',
                          style: 'cancel'
                        },
                        {
                          text: 'Reflect',
                          onPress: (reflection) => {
                            if (reflection && reflection.trim()) {
                              console.log(`Reflection recorded: ${reflection}`);
                              Alert.alert(
                                'Reflection Recorded ✨',
                                `"${reflection}"\n\nThat's real progress! You're building something meaningful here. Keep going, you've got this.`,
                                [{ text: 'Thank You' }]
                              );
                            }
                          }
                        }
                      ],
                      'plain-text',
                      '',
                      'default'
                    );
                  }
                },
                {
                  text: 'Skip',
                  style: 'cancel'
                }
              ]
            );
          }
        },
        {
          id: 'gratitude_evening',
          name: 'Evening Gratitude',
          description: 'Express gratitude before sleep',
          action: async () => {
            console.log('Executing evening gratitude');
            // Show evening gratitude prompt
            Alert.alert(
              'Evening Gratitude',
              'As you prepare for rest, think of one person or thing you\'re grateful for. Sweet dreams, you\'ve earned them.',
              [
                {
                  text: 'Grateful',
                  onPress: () => {
                    // Enhanced evening gratitude with input prompt
                    Alert.prompt(
                      'Evening Gratitude',
                      'As you prepare for rest, what or who are you grateful for today?',
                      [
                        {
                          text: 'Skip',
                          style: 'cancel'
                        },
                        {
                          text: 'Express Gratitude',
                          onPress: (gratitude) => {
                            if (gratitude && gratitude.trim()) {
                              console.log(`Evening gratitude: ${gratitude}`);
                              Alert.alert(
                                'Gratitude Recorded 🌙',
                                `"${gratitude}"\n\nThat's beautiful. Gratitude like this builds real strength. Sleep well, you've earned your rest.`,
                                [{ text: 'Sweet Dreams' }]
                              );
                            }
                          }
                        }
                      ],
                      'plain-text',
                      '',
                      'default'
                    );
                  }
                },
                {
                  text: 'Skip',
                  style: 'cancel'
                }
              ]
            );
          }
        }
      ]
    });
  }

  getRoutine(routineId: string): Routine | undefined {
    return this.routines.get(routineId);
  }

  getAllRoutines(): Routine[] {
    return Array.from(this.routines.values());
  }

  getRoutinesByCategory(category: Routine['category']): Routine[] {
    return this.getAllRoutines().filter(routine => routine.category === category);
  }

  async executeRoutine(routineId: string, userId: string): Promise<boolean> {
    const routine = this.routines.get(routineId);
    if (!routine) {
      console.error(`Routine ${routineId} not found`);
      return false;
    }

    const execution: RoutineExecution = {
      routineId,
      startTime: new Date(),
      currentStep: 0,
      completedSteps: [],
      status: 'running'
    };

    this.executions.set(`${userId}_${routineId}`, execution);

    try {
      for (let i = 0; i < routine.steps.length; i++) {
        const step = routine.steps[i];
        execution.currentStep = i;

        console.log(`Executing step: ${step.name}`);
        await step.action(userId);

        execution.completedSteps.push(step.id);

        // Add delay between steps if duration is specified
        if (step.duration && step.duration > 0) {
          await new Promise(resolve => setTimeout(resolve, step.duration! * 1000));
        }
      }

      execution.status = 'completed';
      console.log(`Routine ${routineId} completed successfully`);
      return true;

    } catch (error) {
      console.error(`Error executing routine ${routineId}:`, error);
      execution.status = 'cancelled';
      return false;
    }
  }

  getExecutionStatus(userId: string, routineId: string): RoutineExecution | undefined {
    return this.executions.get(`${userId}_${routineId}`);
  }

  pauseRoutine(userId: string, routineId: string): boolean {
    const execution = this.executions.get(`${userId}_${routineId}`);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      return true;
    }
    return false;
  }

  resumeRoutine(userId: string, routineId: string): boolean {
    const execution = this.executions.get(`${userId}_${routineId}`);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      return true;
    }
    return false;
  }

  cancelRoutine(userId: string, routineId: string): boolean {
    const execution = this.executions.get(`${userId}_${routineId}`);
    if (execution) {
      execution.status = 'cancelled';
      return true;
    }
    return false;
  }

  private async generatePersonalizedGreeting(): Promise<string> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Base greeting components
    let timeGreeting = '';
    let dayContext = '';
    let motivation = '';
    // Get user name from store
    let userName = 'friend'; // Default fallback
    try {
      // Access user store to get display name
      const userStore = useUserStore.getState();
      userName = userStore.getDisplayName();
    } catch (error) {
      console.warn('Could not access user store for name:', error);
    }

    // Time-based greeting
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
      if (hour < 7) {
        timeGreeting += ', early riser';
      } else if (hour < 9) {
        timeGreeting += ', beautiful soul';
      }
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    // Day of week context
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dayOfWeek];

    if (dayOfWeek === 1) { // Monday
      dayContext = 'Ready to conquer this Monday?';
    } else if (dayOfWeek === 5) { // Friday
      dayContext = 'TGIF! Let\'s make this Friday amazing.';
    } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      dayContext = 'Enjoying your weekend? Let\'s make it count.';
    }

    // Check previous routine completion for motivation
    // TODO: Implement execution history tracking
    motivation = 'Every step forward counts. Let\'s build something beautiful today.';

    // Combine greeting components
    const greeting = `${timeGreeting}! I'm Sallie, your tough love companion. ${dayContext || motivation} Let's get you started right with some soul care that actually works.`;

    return greeting;
  }

  private getRecentExecution(userId: string): RoutineExecution | undefined {
    // Find the most recent execution for this user
    const userExecutions = Array.from(this.executions.entries())
      .filter(([key]) => key.startsWith(`${userId}_`))
      .map(([, execution]) => execution)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    return userExecutions[0];
  }
}

// Singleton instance
export const routineManager = new RoutineManager();

interface RoutineSequencerProps {
  userId: string;
  onRoutineComplete?: (routineId: string) => void;
  onStepComplete?: (stepId: string) => void;
}

export const RoutineSequencerModule: React.FC<RoutineSequencerProps> = ({
  userId,
  onRoutineComplete,
  onStepComplete
}) => {
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [execution, setExecution] = useState<RoutineExecution | null>(null);
  const [availableRoutines] = useState<Routine[]>(() => routineManager.getAllRoutines());

  const executeRoutine = useCallback(async (routineId: string) => {
    const routine = routineManager.getRoutine(routineId);
    if (!routine) return;

    setCurrentRoutine(routine);

    const success = await routineManager.executeRoutine(routineId, userId);
    if (success && onRoutineComplete) {
      onRoutineComplete(routineId);
    }
  }, [userId, onRoutineComplete]);

  const pauseRoutine = useCallback(() => {
    if (currentRoutine) {
      routineManager.pauseRoutine(userId, currentRoutine.id);
    }
  }, [userId, currentRoutine]);

  const resumeRoutine = useCallback(() => {
    if (currentRoutine) {
      routineManager.resumeRoutine(userId, currentRoutine.id);
    }
  }, [userId, currentRoutine]);

  const cancelRoutine = useCallback(() => {
    if (currentRoutine) {
      routineManager.cancelRoutine(userId, currentRoutine.id);
      setCurrentRoutine(null);
      setExecution(null);
    }
  }, [userId, currentRoutine]);

  // Update execution status periodically
  useEffect(() => {
    if (!currentRoutine) return;

    const interval = setInterval(() => {
      const status = routineManager.getExecutionStatus(userId, currentRoutine.id);
      setExecution(status || null);

      if (status?.status === 'completed') {
        setCurrentRoutine(null);
        setExecution(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userId, currentRoutine]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Routine Sequencer</Text>

      {!currentRoutine ? (
        <ScrollView style={styles.routineList}>
          <Text style={styles.sectionTitle}>Available Routines</Text>
          {availableRoutines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={styles.routineCard}
              onPress={() => executeRoutine(routine.id)}
            >
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineDescription}>{routine.description}</Text>
              <Text style={styles.routineMeta}>
                {routine.steps.length} steps • {routine.estimatedDuration} min
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.executionContainer}>
          <Text style={styles.currentRoutineTitle}>{currentRoutine.name}</Text>

          {execution && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Step {execution.currentStep + 1} of {currentRoutine.steps.length}
              </Text>
              <Text style={styles.stepName}>
                {currentRoutine.steps[execution.currentStep]?.name || 'Loading...'}
              </Text>
            </View>
          )}

          <View style={styles.controlsContainer}>
            {execution?.status === 'running' && (
              <TouchableOpacity style={styles.controlButton} onPress={pauseRoutine}>
                <Text style={styles.controlButtonText}>Pause</Text>
              </TouchableOpacity>
            )}

            {execution?.status === 'paused' && (
              <TouchableOpacity style={styles.controlButton} onPress={resumeRoutine}>
                <Text style={styles.controlButtonText}>Resume</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.controlButton, styles.cancelButton]}
              onPress={cancelRoutine}
            >
              <Text style={styles.controlButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  routineList: {
    flex: 1,
  },
  routineCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  routineDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  routineMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  executionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentRoutineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 30,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 10,
  },
  stepName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoutineSequencerModule;
