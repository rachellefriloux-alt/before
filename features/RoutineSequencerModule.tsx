/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Routine sequencer with actionable steps, TTS, and input prompts.
 * Got it, love.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, StyleSheet, DeviceEventEmitter } from 'react-native';
import { Audio } from 'expo-av';
import { useUserStore } from '../app/store/user';

interface RoutineStep {
  id: string;
  name: string;
  description: string;
  action: () => Promise<void>;
  duration?: number;
}

interface Routine {
  id: string;
  name: string;
  steps: RoutineStep[];
}

const RoutineSequencerModule: React.FC = () => {
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const speechSynthesisRef = useRef<any>(null);

  useEffect(() => {
    // Listen for voice trigger events from Kotlin
    const subscription = DeviceEventEmitter.addListener('VoiceTriggerRoutine', handleVoiceTrigger);
    return () => subscription.remove();
  }, []);

  const handleVoiceTrigger = (event: any) => {
    const { routineName } = event;
    executeRoutineByName(routineName);
  };

  const speak = (text: string, options: { rate?: number; pitch?: number } = {}) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getPersonalizedGreeting = (): string => {
    const hour = new Date().getHours();
    const userName = useUserStore.getState().getDisplayName();

    if (hour < 12) {
      return `Good morning, ${userName}. Let's start your day with intention.`;
    } else if (hour < 17) {
      return `Good afternoon, ${userName}. How are you feeling right now?`;
    } else {
      return `Good evening, ${userName}. Let's wind down and reflect on your day.`;
    }
  };

  const morningRoutine: Routine = {
    id: 'morning',
    name: 'Morning Routine',
    steps: [
      {
        id: 'greeting',
        name: 'Personalized Greeting',
        description: 'Start with a warm, personalized welcome',
        action: async () => {
          const greeting = getPersonalizedGreeting();
          speak(greeting, { rate: 0.9, pitch: 1.1 });
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      },
      {
        id: 'gratitude_practice',
        name: 'Gratitude Practice',
        description: 'Take a moment for gratitude',
        action: async () => {
          speak("Let's take a moment for gratitude. What are three things you're grateful for today?", { rate: 0.8, pitch: 1.0 });
          setShowInput(true);
          // Wait for user input
          await new Promise(resolve => {
            const checkInput = () => {
              if (userInput.trim()) {
                speak(`Thank you for sharing: ${userInput}. That's beautiful.`, { rate: 0.9, pitch: 1.1 });
                setUserInput('');
                setShowInput(false);
                resolve(void 0);
              } else {
                setTimeout(checkInput, 1000);
              }
            };
            checkInput();
          });
        }
      },
      {
        id: 'intention_setting',
        name: 'Intention Setting',
        description: 'Set your intention for the day',
        action: async () => {
          speak("What is your main intention for today?", { rate: 0.8, pitch: 1.0 });
          setShowInput(true);
          await new Promise(resolve => {
            const checkInput = () => {
              if (userInput.trim()) {
                speak(`Your intention is: ${userInput}. Hold that close to your heart today.`, { rate: 0.9, pitch: 1.1 });
                setUserInput('');
                setShowInput(false);
                resolve(void 0);
              } else {
                setTimeout(checkInput, 1000);
              }
            };
            checkInput();
          });
        }
      },
      {
        id: 'mindful_breathing',
        name: 'Mindful Breathing',
        description: 'Take 5 deep breaths',
        action: async () => {
          speak("Let's take 5 deep breaths together. Breathe in... and out.", { rate: 0.7, pitch: 0.9 });
          for (let i = 1; i <= 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 4000));
            if (i < 5) {
              speak(`Breath ${i + 1}: In... and out.`, { rate: 0.7, pitch: 0.9 });
            }
          }
          speak("Well done. You're ready to start your day.", { rate: 0.9, pitch: 1.1 });
        },
        duration: 20000
      }
    ]
  };

  const eveningRoutine: Routine = {
    id: 'evening',
    name: 'Evening Wind Down',
    steps: [
      {
        id: 'reflection',
        name: 'Daily Reflection',
        description: 'Reflect on your day',
        action: async () => {
          const greeting = getPersonalizedGreeting();
          speak(`${greeting} Let's reflect on your day.`, { rate: 0.9, pitch: 1.1 });
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      },
      {
        id: 'gratitude_evening',
        name: 'Evening Gratitude',
        description: 'End your day with gratitude',
        action: async () => {
          speak("What are you grateful for from today?", { rate: 0.8, pitch: 1.0 });
          setShowInput(true);
          await new Promise(resolve => {
            const checkInput = () => {
              if (userInput.trim()) {
                speak(`Thank you for sharing: ${userInput}. Sweet dreams, love.`, { rate: 0.9, pitch: 1.1 });
                setUserInput('');
                setShowInput(false);
                resolve(void 0);
              } else {
                setTimeout(checkInput, 1000);
              }
            };
            checkInput();
          });
        }
      }
    ]
  };

  const executeRoutineByName = (routineName: string) => {
    let routine: Routine | null = null;

    switch (routineName) {
      case 'morning':
        routine = morningRoutine;
        break;
      case 'evening':
        routine = eveningRoutine;
        break;
      default:
        Alert.alert('Unknown Routine', `Routine "${routineName}" not found.`);
        return;
    }

    if (routine) {
      executeRoutine(routine);
    }
  };

  const executeRoutine = async (routine: Routine) => {
    setCurrentRoutine(routine);
    setCurrentStepIndex(0);
    setIsRunning(true);

    try {
      for (let i = 0; i < routine.steps.length; i++) {
        setCurrentStepIndex(i);
        const step = routine.steps[i];

        speak(`Step ${i + 1}: ${step.name}`, { rate: 0.9, pitch: 1.0 });
        await new Promise(resolve => setTimeout(resolve, 2000));

        await step.action();

        if (i < routine.steps.length - 1) {
          speak("Moving to the next step.", { rate: 0.9, pitch: 1.0 });
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      speak("Routine completed. You've got this!", { rate: 0.9, pitch: 1.1 });
    } catch (error) {
      console.error('Error executing routine:', error);
      Alert.alert('Routine Error', 'An error occurred during the routine. Please try again.');
    } finally {
      setIsRunning(false);
      setCurrentRoutine(null);
      setCurrentStepIndex(0);
    }
  };

  const handleUserInput = (text: string) => {
    setUserInput(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Routine Sequencer</Text>

      {!isRunning && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => executeRoutine(morningRoutine)}
          >
            <Text style={styles.buttonText}>Start Morning Routine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => executeRoutine(eveningRoutine)}
          >
            <Text style={styles.buttonText}>Start Evening Routine</Text>
          </TouchableOpacity>
        </View>
      )}

      {isRunning && currentRoutine && (
        <View style={styles.runningContainer}>
          <Text style={styles.routineTitle}>{currentRoutine.name}</Text>
          <Text style={styles.stepTitle}>
            Step {currentStepIndex + 1}: {currentRoutine.steps[currentStepIndex]?.name}
          </Text>
          <Text style={styles.stepDescription}>
            {currentRoutine.steps[currentStepIndex]?.description}
          </Text>
        </View>
      )}

      {showInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your response:</Text>
          <TextInput
            style={styles.textInput}
            value={userInput}
            onChangeText={handleUserInput}
            placeholder="Type your response here..."
            multiline
            autoFocus
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  runningContainer: {
    alignItems: 'center',
    padding: 20,
  },
  routineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#007AFF',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  inputContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default RoutineSequencerModule;
