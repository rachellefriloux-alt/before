import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface VoiceConfig {
  language: string;
  voice?: string;
  rate: number;
  pitch: number;
  quality: 'default' | 'enhanced';
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  duration: number;
  language?: string;
}

export interface VoiceRecording {
  id: string;
  uri: string;
  duration: number;
  timestamp: number;
  transcription?: TranscriptionResult;
}

export class VoiceInteractionSystem {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private voiceConfig: VoiceConfig;
  private recordings: VoiceRecording[] = [];

  constructor(config?: Partial<VoiceConfig>) {
    this.voiceConfig = {
      language: 'en-US',
      rate: 0.75,
      pitch: 1.0,
      quality: 'enhanced',
      ...config,
    };
  }

  async initialize(): Promise<boolean> {
    try {
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Voice interaction requires microphone access to function properly.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      return true;
    } catch (error) {
      console.error('Voice system initialization error:', error);
      return false;
    }
  }

  async startRecording(): Promise<string | null> {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return null;
      }

      // Initialize if needed
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }

      // Create recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 3, // MPEG4AAC
          audioQuality: 127, // MAX
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      await this.recording.startAsync();
      this.isRecording = true;

      const recordingId = `voice_${Date.now()}`;
      console.log('Started recording:', recordingId);
      return recordingId;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      this.recording = null;
      return null;
    }
  }

  async stopRecording(): Promise<VoiceRecording | null> {
    try {
      if (!this.isRecording || !this.recording) {
        console.warn('No active recording to stop');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        console.error('No recording URI available');
        return null;
      }

      const voiceRecording: VoiceRecording = {
        id: `voice_${Date.now()}`,
        uri,
        duration: status.durationMillis || 0,
        timestamp: Date.now(),
      };

      this.recordings.push(voiceRecording);
      console.log('Recording saved:', voiceRecording.id);

      return voiceRecording;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      this.recording = null;
      return null;
    }
  }

  async transcribeAudio(recording: VoiceRecording): Promise<TranscriptionResult | null> {
    try {
      // Note: This is a mock implementation
      // In production, you would integrate with services like:
      // - OpenAI Whisper API
      // - Google Speech-to-Text
      // - Azure Speech Services
      // - Amazon Transcribe

      // Mock transcription based on duration
      const mockTranscriptions = [
        "Hello, how are you today?",
        "Can you help me with something?",
        "I'm feeling a bit overwhelmed right now.",
        "That's really interesting, tell me more.",
        "Thank you for listening to me.",
        "I appreciate your support.",
        "Can we talk about what's been bothering me?",
        "I had a great day today.",
        "I'm not sure how to handle this situation.",
        "You always know what to say.",
      ];

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const randomTranscription = mockTranscriptions[
        Math.floor(Math.random() * mockTranscriptions.length)
      ];

      const result: TranscriptionResult = {
        text: randomTranscription,
        confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
        duration: recording.duration,
        language: this.voiceConfig.language,
      };

      // Update recording with transcription
      const recordingIndex = this.recordings.findIndex(r => r.id === recording.id);
      if (recordingIndex !== -1) {
        this.recordings[recordingIndex].transcription = result;
      }

      return result;
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    }
  }

  async speakText(text: string, options?: Partial<VoiceConfig>): Promise<void> {
    try {
      const speechOptions = {
        language: options?.language || this.voiceConfig.language,
        rate: options?.rate || this.voiceConfig.rate,
        pitch: options?.pitch || this.voiceConfig.pitch,
        voice: options?.voice || this.voiceConfig.voice,
      };

      // Check if speech is available
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices.length);

      await Speech.speak(text, speechOptions);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      // Fallback: Show text visually
      Alert.alert('Sallie Says', text, [{ text: 'OK' }]);
    }
  }

  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('Error checking speech status:', error);
      return false;
    }
  }

  // Voice processing utilities
  async processVoiceInput(text: string): Promise<string> {
    // Clean up transcribed text
    let processedText = text.trim();
    
    // Remove common transcription artifacts
    processedText = processedText.replace(/\b(um|uh|er|ah)\b/gi, '');
    processedText = processedText.replace(/\s+/g, ' ');
    processedText = processedText.trim();
    
    // Capitalize first letter
    if (processedText.length > 0) {
      processedText = processedText.charAt(0).toUpperCase() + processedText.slice(1);
    }
    
    return processedText;
  }

  async analyzeVoiceEmotion(recording: VoiceRecording): Promise<{
    emotion: string;
    confidence: number;
    indicators: string[];
  }> {
    // Mock voice emotion analysis
    // In production, this would use audio analysis libraries or services
    
    const emotions = [
      { emotion: 'happy', indicators: ['upward intonation', 'faster pace'] },
      { emotion: 'sad', indicators: ['lower pitch', 'slower pace'] },
      { emotion: 'excited', indicators: ['high energy', 'rapid speech'] },
      { emotion: 'calm', indicators: ['steady pace', 'even tone'] },
      { emotion: 'anxious', indicators: ['variable pace', 'higher pitch'] },
    ];
    
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      emotion: randomEmotion.emotion,
      confidence: 0.7 + Math.random() * 0.2,
      indicators: randomEmotion.indicators,
    };
  }

  // Configuration management
  updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.voiceConfig = { ...this.voiceConfig, ...newConfig };
  }

  getConfig(): VoiceConfig {
    return { ...this.voiceConfig };
  }

  // Recording management
  getRecordings(): VoiceRecording[] {
    return [...this.recordings];
  }

  async deleteRecording(id: string): Promise<boolean> {
    try {
      const recordingIndex = this.recordings.findIndex(r => r.id === id);
      if (recordingIndex === -1) {
        return false;
      }

      const recording = this.recordings[recordingIndex];
      
      // Delete file if it exists
      try {
        await FileSystem.deleteAsync(recording.uri);
      } catch (fileError) {
        console.warn('Could not delete recording file:', fileError);
      }

      // Remove from array
      this.recordings.splice(recordingIndex, 1);
      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      return false;
    }
  }

  async clearAllRecordings(): Promise<void> {
    for (const recording of this.recordings) {
      await this.deleteRecording(recording.id);
    }
    this.recordings = [];
  }

  // Status getters
  getIsRecording(): boolean {
    return this.isRecording;
  }

  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return 'undetermined';
    }
  }

  // Utility methods for integration
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  generateVoicePersonality(personality: string): Partial<VoiceConfig> {
    const personalities: Record<string, Partial<VoiceConfig>> = {
      tough_love_soul_care: {
        rate: 0.8,
        pitch: 0.9,
        // Would select a warm but confident voice
      },
      gentle_companion: {
        rate: 0.7,
        pitch: 1.1,
        // Would select a soft, nurturing voice
      },
      wise_mentor: {
        rate: 0.75,
        pitch: 0.95,
        // Would select a mature, thoughtful voice
      },
      playful_friend: {
        rate: 0.9,
        pitch: 1.2,
        // Would select an energetic, youthful voice
      },
      professional_assistant: {
        rate: 0.85,
        pitch: 1.0,
        // Would select a clear, professional voice
      },
    };

    return personalities[personality] || { rate: 0.75, pitch: 1.0 };
  }
}
