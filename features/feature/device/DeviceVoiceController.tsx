/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: DeviceVoiceController - Device-level voice control and integration.
 * Got it, love.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { DeviceEventEmitter } from 'react-native';

interface VoiceCommand {
  id: string;
  phrases: string[];
  action: (params?: any) => Promise<void>;
  description: string;
}

interface DeviceVoiceControllerProps {
  onVoiceCommand?: (command: string, params?: any) => void;
  autoStart?: boolean;
  language?: string;
}

const DeviceVoiceController: React.FC<DeviceVoiceControllerProps> = ({
  onVoiceCommand,
  autoStart = false,
  language = 'en-US'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [available, setAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice commands registry
  const voiceCommands: VoiceCommand[] = [
    {
      id: 'wake_up',
      phrases: ['hey sallie', 'wake up', 'sallie', 'hello sallie'],
      action: async () => {
        await speak("I'm here, love. What can I help you with?");
        onVoiceCommand?.('wake_up');
      },
      description: 'Wake up Sallie'
    },
    {
      id: 'goodbye',
      phrases: ['goodbye', 'bye', 'see you later', 'good night'],
      action: async () => {
        await speak("Goodbye, love. Take care of yourself.");
        onVoiceCommand?.('goodbye');
      },
      description: 'Say goodbye'
    },
    {
      id: 'status',
      phrases: ['how are you', 'status', 'what\'s up', 'how are you doing'],
      action: async () => {
        await speak("I'm doing well, thank you for asking. How are you feeling today?");
        onVoiceCommand?.('status');
      },
      description: 'Check status'
    },
    {
      id: 'help',
      phrases: ['help', 'what can you do', 'commands', 'show commands'],
      action: async () => {
        const helpText = "I can help you with routines, themes, and many other things. Try saying 'start morning routine' or 'switch to dark theme'.";
        await speak(helpText);
        onVoiceCommand?.('help');
      },
      description: 'Show help'
    }
  ];

  useEffect(() => {
    initializeVoiceRecognition();
    if (autoStart) {
      startListening();
    }

    // Listen for voice trigger events from native modules
    const subscription = DeviceEventEmitter.addListener('VoiceTriggerRoutine', handleNativeTrigger);
    const themeSubscription = DeviceEventEmitter.addListener('VoiceTriggerTheme', handleNativeThemeTrigger);
    const godModeSubscription = DeviceEventEmitter.addListener('VoiceTriggerGodMode', handleNativeGodModeTrigger);

    return () => {
      subscription.remove();
      themeSubscription.remove();
      godModeSubscription.remove();
      stopListening();
    };
  }, []);

  const initializeVoiceRecognition = async () => {
    try {
      // Check if speech recognition is available
      if (Platform.OS === 'web') {
        setAvailable('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
      } else {
        // For React Native, we'll use the native VoiceTriggerModule
        setAvailable(true);
      }
    } catch (error) {
      console.error('Voice recognition initialization failed:', error);
      setAvailable(false);
    }
  };

  const startListening = async () => {
    if (!available) {
      Alert.alert('Voice Control Unavailable', 'Voice recognition is not available on this device.');
      return;
    }

    try {
      setIsListening(true);

      if (Platform.OS === 'web') {
        await startWebVoiceRecognition();
      } else {
        // Use native VoiceTriggerModule for React Native
        // This would integrate with the Kotlin VoiceTriggerModule
        console.log('Starting native voice recognition...');
      }
    } catch (error) {
      console.error('Failed to start listening:', error);
      setIsListening(false);
    }
  };

  const startWebVoiceRecognition = () => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice input:', transcript);
        processVoiceInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
        reject(new Error(event.error));
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        resolve(void 0);
      };

      recognitionRef.current.start();
    });
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceInput = async (input: string) => {
    setLastCommand(input);

    // Check for exact command matches
    for (const command of voiceCommands) {
      for (const phrase of command.phrases) {
        if (input.includes(phrase.toLowerCase())) {
          try {
            await command.action();
            return;
          } catch (error) {
            console.error(`Error executing command ${command.id}:`, error);
            await speak("Sorry, I encountered an error. Please try again.");
          }
          return;
        }
      }
    }

    // If no command matched, provide feedback
    await speak("I'm sorry, I didn't understand that command. Try saying 'help' to see available commands.");
    onVoiceCommand?.('unrecognized', { input });
  };

  const speak = async (text: string, options: { rate?: number; pitch?: number } = {}) => {
    return new Promise<void>((resolve) => {
      setIsSpeaking(true);

      if (Platform.OS === 'web') {
        // Use Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = options.rate || 0.9;
          utterance.pitch = options.pitch || 1.1;
          utterance.onend = () => {
            setIsSpeaking(false);
            resolve();
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            resolve();
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
          resolve();
        }
      } else {
        // Use Expo Speech for React Native
        Speech.speak(text, {
          rate: options.rate || 0.9,
          pitch: options.pitch || 1.1,
          onDone: () => {
            setIsSpeaking(false);
            resolve();
          },
          onError: () => {
            setIsSpeaking(false);
            resolve();
          }
        });
      }
    });
  };

  const handleNativeTrigger = (event: any) => {
    console.log('Native routine trigger:', event);
    onVoiceCommand?.('native_routine', event);
  };

  const handleNativeThemeTrigger = (event: any) => {
    console.log('Native theme trigger:', event);
    onVoiceCommand?.('native_theme', event);
  };

  const handleNativeGodModeTrigger = (event: any) => {
    console.log('Native God-Mode trigger:', event);
    onVoiceCommand?.('native_godmode', event);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Voice Controller</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {available ? 'Available' : 'Unavailable'}
        </Text>
        <Text style={styles.statusText}>
          Listening: {isListening ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.statusText}>
          Speaking: {isSpeaking ? 'Yes' : 'No'}
        </Text>
      </View>

      {lastCommand && (
        <Text style={styles.lastCommand}>Last command: "{lastCommand}"</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isListening && styles.buttonActive]}
          onPress={isListening ? stopListening : startListening}
          disabled={!available}
        >
          <Text style={styles.buttonText}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => speak("Hello! I'm Sallie, your AI companion.")}
        >
          <Text style={styles.buttonText}>Test Speech</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commandsContainer}>
        <Text style={styles.commandsTitle}>Available Commands:</Text>
        {voiceCommands.map((command) => (
          <Text key={command.id} style={styles.commandText}>
            • {command.phrases.join(', ')} - {command.description}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lastCommand: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  commandsContainer: {
    marginTop: 10,
  },
  commandsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  commandText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default DeviceVoiceController;
