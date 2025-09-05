/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Voice Input Panel Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 * Uses @react-native-voice/voice for speech recognition
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
// import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice'; // Uncomment when package is installed

interface VoiceInputPanelProps {
  theme?: 'light' | 'dark';
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface AnalyticsEvent {
  event: string;
  data: any;
  timestamp: number;
}

const VoiceInputPanel: React.FC<VoiceInputPanelProps> = ({
  theme = 'light',
  onTranscript,
  onError,
  language = 'en-US'
}) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  // Initialize voice recognition
  useEffect(() => {
    // Mock voice availability check
    // In production, replace with: Voice.isAvailable()
    setVoiceAvailable(Platform.OS === 'ios' || Platform.OS === 'android');

    // Mock event handlers - replace with actual Voice event listeners when package is installed
    /*
    const onSpeechResults = (e: SpeechResultsEvent) => {
      const result = e.value?.[0] || '';
      setTranscript(result);
      setListening(false);
      logAnalytics('transcript', { transcript: result });
      onTranscript?.(result);
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
      setListening(false);
      const errorMsg = e.error?.message || 'Speech recognition error occurred.';
      setError(errorMsg);
      logAnalytics('error', { error: errorMsg });
      onError?.(errorMsg);
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    */

    // Cleanup
    return () => {
      // Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onTranscript, onError]);

  // Start listening
  const startListening = async () => {
    if (!voiceAvailable) {
      const errorMsg = 'Voice recognition is not available on this device.';
      setError(errorMsg);
      logAnalytics('error', { error: errorMsg });
      onError?.(errorMsg);
      return;
    }

    try {
      setError('');
      setTranscript('');
      logAnalytics('start_listening', {});

      // Mock voice recognition - replace with Voice.start(language) when package is installed
      setListening(true);
      setTimeout(() => {
        // Simulate getting a transcript
        const mockTranscript = 'Hello, this is a mock voice recognition result. Please install @react-native-voice/voice for actual functionality.';
        setTranscript(mockTranscript);
        setListening(false);
        logAnalytics('transcript', { transcript: mockTranscript });
        onTranscript?.(mockTranscript);
      }, 3000);

      // await Voice.start(language);
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to start voice recognition.';
      setError(errorMsg);
      logAnalytics('error', { error: errorMsg });
      onError?.(errorMsg);
    }
  };

  // Stop listening
  const stopListening = async () => {
    try {
      setListening(false);
      logAnalytics('stop_listening', {});

      // await Voice.stop();
    } catch (e: any) {
      console.warn('Error stopping voice recognition:', e);
    }
  };

  // Log analytics event
  const logAnalytics = (event: string, data: any) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now()
    };

    setAnalytics(prev => [...prev, analyticsEvent]);
  };

  // Handle button press
  const handleButtonPress = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <View
      style={[styles.container, theme === 'dark' && styles.containerDark]}
      accessibilityLabel="Voice Input Panel"
    >
      <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>
        Voice Input
      </Text>

      <TouchableOpacity
        style={[
          styles.voiceButton,
          listening && styles.voiceButtonActive,
          !voiceAvailable && styles.voiceButtonDisabled
        ]}
        onPress={handleButtonPress}
        disabled={!voiceAvailable}
        accessibilityLabel={listening ? "Stop Listening" : "Start Listening"}
        accessibilityHint="Tap to start or stop voice recognition"
      >
        <Text style={styles.voiceIcon}>
          {listening ? '⏹️' : '🎤'}
        </Text>
        <Text style={styles.voiceButtonText}>
          {listening ? 'Stop Listening' : 'Start Listening'}
        </Text>
      </TouchableOpacity>

      {listening && (
        <View style={styles.listeningIndicator}>
          <Text style={styles.listeningText} accessibilityLiveRegion="polite">
            Listening... Speak now
          </Text>
          <View style={styles.pulseAnimation} />
        </View>
      )}

      {transcript ? (
        <View style={styles.transcriptContainer}>
          <Text style={[styles.transcriptLabel, theme === 'dark' && styles.transcriptLabelDark]}>
            Transcript:
          </Text>
          <Text style={[styles.transcriptText, theme === 'dark' && styles.transcriptTextDark]}>
            {transcript}
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text
          style={styles.errorText}
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      ) : null}

      {!voiceAvailable && (
        <Text style={styles.unavailableText}>
          Voice recognition is not available on this device.
          {Platform.OS === 'ios' && '\nMake sure Siri is enabled in Settings.'}
          {Platform.OS === 'android' && '\nMake sure Google app is installed and voice recognition is enabled.'}
        </Text>
      )}

      {/* Debug info for analytics (can be removed in production) */}
      {__DEV__ && analytics.length > 0 && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Analytics Events: {analytics.length}</Text>
          <Text style={styles.debugText}>
            Last event: {analytics[analytics.length - 1]?.event}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: '#2d1810',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  titleDark: {
    color: '#e2e8f0',
  },
  voiceButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
  },
  voiceButtonActive: {
    backgroundColor: '#dc2626',
    transform: [{ scale: 1.05 }],
  },
  voiceButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  voiceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listeningIndicator: {
    alignItems: 'center',
    marginTop: 16,
  },
  listeningText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
  },
  pulseAnimation: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    opacity: 0.7,
  },
  transcriptContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    width: '100%',
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  transcriptLabelDark: {
    color: '#d1d5db',
  },
  transcriptText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 22,
  },
  transcriptTextDark: {
    color: '#f9fafb',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    width: '100%',
  },
  unavailableText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  debugContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#edf2f7',
    borderRadius: 4,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  debugText: {
    fontSize: 10,
    color: '#718096',
  },
});

export default VoiceInputPanel;
