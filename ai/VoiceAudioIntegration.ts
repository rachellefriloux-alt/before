/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - Voice/Audio Integration System                                    │
 * │                                                                              │
 * │   Advanced voice recognition, text-to-speech, and audio processing          │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Voice/Audio Integration System for Sallie
// Provides comprehensive voice interaction capabilities

import { EventEmitter } from 'events';

export interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
  language?: string;
}

export interface TTSOptions {
  voice?: string;
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
  language?: string;
}

export interface AudioAnalysis {
  volume: number;
  pitch: number;
  tempo: number;
  emotion: string;
  confidence: number;
  features: Record<string, number>;
}

export interface VoiceProfile {
  userId: string;
  voiceSignature: number[];
  preferredVoice: string;
  language: string;
  accent?: string;
  speechPatterns: Record<string, number>;
  lastUpdated: Date;
}

/**
 * Voice Command Processor
 */
export class VoiceCommandProcessor extends EventEmitter {
  private isListening: boolean = false;
  private commandHistory: VoiceCommand[] = [];
  private wakeWord: string = 'sallie';
  private commandPatterns: Map<string, RegExp> = new Map();

  constructor() {
    super();
    this.initializeCommandPatterns();
  }

  /**
   * Start listening for voice commands
   */
  public startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      try {
        // Initialize speech recognition
        const recognition = this.createSpeechRecognition();

        recognition.onstart = () => {
          this.isListening = true;
          this.emit('listening-started');
          resolve();
        };

        recognition.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          const transcript = result[0].transcript.toLowerCase();

          if (transcript.includes(this.wakeWord)) {
            this.processWakeWordDetected(transcript, result[0].confidence);
          }
        };

        recognition.onerror = (event: any) => {
          this.emit('error', event.error);
          reject(new Error(`Speech recognition error: ${event.error}`));
        };

        recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening for voice commands
   */
  public stopListening(): void {
    this.isListening = false;
    this.emit('listening-stopped');
  }

  /**
   * Process a voice command
   */
  public processCommand(command: VoiceCommand): {
    action: string;
    parameters: Record<string, any>;
    confidence: number;
  } {
    this.commandHistory.push(command);

    // Extract action and parameters
    const { action, parameters } = this.parseCommand(command.command);

    // Calculate overall confidence
    const confidence = Math.min(command.confidence, this.calculateContextConfidence(action, parameters));

    return {
      action,
      parameters,
      confidence
    };
  }

  /**
   * Get available voices for TTS
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  /**
   * Set wake word
   */
  public setWakeWord(word: string): void {
    this.wakeWord = word.toLowerCase();
  }

  /**
   * Add custom command pattern
   */
  public addCommandPattern(action: string, pattern: RegExp): void {
    this.commandPatterns.set(action, pattern);
  }

  private createSpeechRecognition(): any {
    // Create speech recognition instance (browser API)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported');
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    return recognition;
  }

  private processWakeWordDetected(transcript: string, confidence: number): void {
    const command = transcript.replace(this.wakeWord, '').trim();

    if (command) {
      const voiceCommand: VoiceCommand = {
        command,
        confidence,
        timestamp: new Date()
      };

      this.emit('command-detected', voiceCommand);
    }
  }

  private parseCommand(command: string): { action: string; parameters: Record<string, any> } {
    const lowerCommand = command.toLowerCase();

    // Check custom patterns first
    for (const [action, pattern] of this.commandPatterns) {
      const match = lowerCommand.match(pattern);
      if (match) {
        return {
          action,
          parameters: this.extractParameters(match, pattern)
        };
      }
    }

    // Default command parsing
    if (lowerCommand.includes('play') || lowerCommand.includes('start')) {
      return { action: 'play', parameters: { content: this.extractContentName(command) } };
    }

    if (lowerCommand.includes('stop') || lowerCommand.includes('pause')) {
      return { action: 'stop', parameters: {} };
    }

    if (lowerCommand.includes('next') || lowerCommand.includes('skip')) {
      return { action: 'next', parameters: {} };
    }

    if (lowerCommand.includes('previous') || lowerCommand.includes('back')) {
      return { action: 'previous', parameters: {} };
    }

    if (lowerCommand.includes('volume')) {
      return { action: 'volume', parameters: { level: this.extractVolumeLevel(command) } };
    }

    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      return { action: 'search', parameters: { query: this.extractSearchQuery(command) } };
    }

    if (lowerCommand.includes('remind') || lowerCommand.includes('reminder')) {
      return { action: 'reminder', parameters: { text: this.extractReminderText(command) } };
    }

    // Default fallback
    return { action: 'unknown', parameters: { original: command } };
  }

  private extractParameters(match: RegExpMatchArray, pattern: RegExp): Record<string, any> {
    const parameters: Record<string, any> = {};

    // Extract named groups from regex
    const groups = match.groups;
    if (groups) {
      Object.assign(parameters, groups);
    }

    return parameters;
  }

  private calculateContextConfidence(action: string, parameters: Record<string, any>): number {
    // Calculate confidence based on context and command clarity
    let confidence = 0.8; // Base confidence

    // Reduce confidence for unknown actions
    if (action === 'unknown') {
      confidence -= 0.3;
    }

    // Increase confidence for specific parameters
    if (Object.keys(parameters).length > 0) {
      confidence += 0.1;
    }

    // Reduce confidence for ambiguous commands
    if (action === 'search' && !parameters.query) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private extractContentName(command: string): string {
    // Extract content name from play commands
    const playPatterns = [
      /play\s+(?:the\s+)?(.+)/i,
      /start\s+(?:the\s+)?(.+)/i,
      /listen\s+to\s+(.+)/i
    ];

    for (const pattern of playPatterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  private extractVolumeLevel(command: string): number {
    // Extract volume level from commands
    const volumePatterns = [
      /volume\s+(?:to\s+)?(\d+)/i,
      /set\s+volume\s+(?:to\s+)?(\d+)/i,
      /(?:turn\s+)?(?:up|down)\s+volume/i
    ];

    for (const pattern of volumePatterns) {
      const match = command.match(pattern);
      if (match) {
        if (match[1]) {
          return Math.min(100, Math.max(0, parseInt(match[1])));
        } else if (command.includes('up')) {
          return 75; // Default increase
        } else if (command.includes('down')) {
          return 25; // Default decrease
        }
      }
    }

    return 50; // Default volume
  }

  private extractSearchQuery(command: string): string {
    // Extract search query from commands
    const searchPatterns = [
      /search\s+(?:for\s+)?(.+)/i,
      /find\s+(.+)/i,
      /look\s+(?:for\s+)?(.+)/i
    ];

    for (const pattern of searchPatterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  private extractReminderText(command: string): string {
    // Extract reminder text from commands
    const reminderPatterns = [
      /remind\s+me\s+(?:to\s+)?(.+)/i,
      /set\s+(?:a\s+)?reminder\s+(?:to\s+)?(.+)/i,
      /reminder\s+(.+)/i
    ];

    for (const pattern of reminderPatterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  private initializeCommandPatterns(): void {
    // Initialize common command patterns
    this.commandPatterns.set('play_music', /(?:play|start)\s+(?:some\s+)?music/i);
    this.commandPatterns.set('play_playlist', /(?:play|start)\s+(?:the\s+)?playlist\s+(.+)/i);
    this.commandPatterns.set('set_timer', /set\s+(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(?:minutes?|mins?)/i);
    this.commandPatterns.set('weather', /what(?:'s| is)\s+(?:the\s+)?weather/i);
    this.commandPatterns.set('time', /what(?:'s| is)\s+(?:the\s+)?time/i);
    this.commandPatterns.set('navigation', /(?:take me to|navigate to|go to)\s+(.+)/i);
  }
}

/**
 * Text-to-Speech Engine
 */
export class TTSEngine extends EventEmitter {
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;
  private speechQueue: Array<{ text: string; options: TTSOptions }> = [];

  constructor() {
    super();
    this.initializeVoices();
  }

  /**
   * Speak text with options
   */
  public speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!speechSynthesis) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply options
      if (options.voice) {
        utterance.voice = this.getVoiceByName(options.voice);
      } else if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }

      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.language || 'en-US';

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.emit('speaking-started', text);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.emit('speaking-ended', text);
        resolve();
      };

      utterance.onerror = (event) => {
        this.emit('error', event.error);
        reject(new Error(`TTS error: ${event.error}`));
      };

      // Add to queue if already speaking
      if (this.isSpeaking) {
        this.speechQueue.push({ text, options });
      } else {
        speechSynthesis.speak(utterance);
      }
    });
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
      this.speechQueue = [];
      this.emit('stopped');
    }
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (speechSynthesis && this.isSpeaking) {
      speechSynthesis.pause();
      this.emit('paused');
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (speechSynthesis) {
      speechSynthesis.resume();
      this.emit('resumed');
    }
  }

  /**
   * Set default voice
   */
  public setVoice(voiceName: string): boolean {
    const voice = this.getVoiceByName(voiceName);
    if (voice) {
      this.currentVoice = voice;
      return true;
    }
    return false;
  }

  /**
   * Get current voice
   */
  public getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.currentVoice;
  }

  /**
   * Check if TTS is supported
   */
  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  private initializeVoices(): void {
    if (speechSynthesis) {
      // Wait for voices to load
      speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0 && !this.currentVoice) {
          // Set default voice (prefer English)
          const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
          this.currentVoice = englishVoice || voices[0];
        }
      };

      // Trigger voice loading
      speechSynthesis.getVoices();
    }
  }

  private getVoiceByName(name: string): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices();
    return voices.find(voice =>
      voice.name.toLowerCase().includes(name.toLowerCase()) ||
      voice.voiceURI.toLowerCase().includes(name.toLowerCase())
    ) || null;
  }
}

/**
 * Speech Recognition Engine
 */
export class SpeechRecognitionEngine extends EventEmitter {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: string = 'en-US';
  private continuousMode: boolean = true;

  constructor() {
    super();
  }

  /**
   * Start speech recognition
   */
  public startListening(options: {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      try {
        this.recognition = this.createSpeechRecognition();

        if (options.language) {
          this.currentLanguage = options.language;
        }

        this.recognition.lang = this.currentLanguage;
        this.recognition.continuous = options.continuous !== false;
        this.recognition.interimResults = options.interimResults !== false;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.emit('listening-started');
          resolve();
        };

        this.recognition.onresult = (event: any) => {
          const results = Array.from(event.results) as any[];
          const lastResult = results[results.length - 1];

          const speechResult: SpeechRecognitionResult = {
            transcript: lastResult[0].transcript,
            confidence: lastResult[0].confidence,
            isFinal: lastResult.isFinal,
            alternatives: results.slice(0, -1).map((result: any) => result[0].transcript),
            language: this.currentLanguage
          };

          this.emit('result', speechResult);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.emit('listening-ended');
        };

        this.recognition.onerror = (event: any) => {
          this.emit('error', event.error);
          reject(new Error(`Speech recognition error: ${event.error}`));
        };

        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop speech recognition
   */
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort speech recognition
   */
  public abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
      this.emit('aborted');
    }
  }

  /**
   * Check if speech recognition is supported
   */
  public isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): string[] {
    // Common supported languages for speech recognition
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
      'es-ES', 'es-US', 'fr-FR', 'de-DE', 'it-IT',
      'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN', 'ru-RU'
    ];
  }

  /**
   * Set recognition language
   */
  public setLanguage(language: string): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  private createSpeechRecognition(): any {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported');
    }

    return new SpeechRecognition();
  }
}

/**
 * Audio Analysis Engine
 */
export class AudioAnalysisEngine extends EventEmitter {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private isAnalyzing: boolean = false;

  constructor() {
    super();
  }

  /**
   * Start audio analysis
   */
  public async startAnalysis(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);

      this.microphone.connect(this.analyser);
      this.analyser.fftSize = 2048;

      this.isAnalyzing = true;
      this.emit('analysis-started');
      this.analyzeAudio();
    } catch (error) {
      throw new Error(`Audio analysis initialization failed: ${error}`);
    }
  }

  /**
   * Stop audio analysis
   */
  public stopAnalysis(): void {
    if (this.microphone) {
      this.microphone.disconnect();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.isAnalyzing = false;
    this.emit('analysis-stopped');
  }

  /**
   * Get current audio analysis
   */
  public getCurrentAnalysis(): AudioAnalysis | null {
    if (!this.analyser || !this.isAnalyzing) {
      return null;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    const volume = this.calculateVolume(dataArray);
    const pitch = this.calculatePitch(dataArray);
    const tempo = this.calculateTempo(dataArray);
    const emotion = this.detectEmotion(dataArray);
    const confidence = this.calculateConfidence(dataArray);

    return {
      volume,
      pitch,
      tempo,
      emotion,
      confidence,
      features: {
        volume,
        pitch,
        tempo,
        dominantFrequency: this.findDominantFrequency(dataArray),
        spectralCentroid: this.calculateSpectralCentroid(dataArray)
      }
    };
  }

  private analyzeAudio(): void {
    if (!this.isAnalyzing) return;

    const analysis = this.getCurrentAnalysis();
    if (analysis) {
      this.emit('analysis', analysis);
    }

    // Continue analyzing
    requestAnimationFrame(() => this.analyzeAudio());
  }

  private calculateVolume(dataArray: Uint8Array): number {
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    return sum / dataArray.length / 255; // Normalize to 0-1
  }

  private calculatePitch(dataArray: Uint8Array): number {
    // Simple pitch estimation using autocorrelation
    const bufferSize = dataArray.length;
    const correlations = new Array(bufferSize);

    for (let i = 0; i < bufferSize; i++) {
      let correlation = 0;
      for (let j = 0; j < bufferSize - i; j++) {
        correlation += dataArray[j] * dataArray[j + i];
      }
      correlations[i] = correlation;
    }

    // Find peak in correlations (excluding DC component)
    let maxCorrelation = 0;
    let maxIndex = 0;
    for (let i = 1; i < bufferSize / 2; i++) {
      if (correlations[i] > maxCorrelation) {
        maxCorrelation = correlations[i];
        maxIndex = i;
      }
    }

    // Convert to frequency
    const sampleRate = this.audioContext?.sampleRate || 44100;
    return sampleRate / maxIndex;
  }

  private calculateTempo(dataArray: Uint8Array): number {
    // Estimate tempo based on rhythmic patterns
    // This is a simplified implementation
    const energy = dataArray.map(val => val * val);
    const threshold = energy.reduce((a, b) => a + b, 0) / energy.length;

    let beats = 0;
    let lastBeat = false;

    for (const e of energy) {
      const isBeat = e > threshold;
      if (isBeat && !lastBeat) {
        beats++;
      }
      lastBeat = isBeat;
    }

    // Estimate BPM (assuming 1 second of audio)
    return beats * 60;
  }

  private detectEmotion(dataArray: Uint8Array): string {
    const volume = this.calculateVolume(dataArray);
    const pitch = this.calculatePitch(dataArray);
    const spectralCentroid = this.calculateSpectralCentroid(dataArray);

    // Simple emotion detection based on audio features
    if (volume > 0.7 && pitch > 200) {
      return 'excited';
    } else if (volume < 0.3 && pitch < 150) {
      return 'calm';
    } else if (spectralCentroid > 3000) {
      return 'angry';
    } else if (pitch > 180 && pitch < 220) {
      return 'happy';
    } else {
      return 'neutral';
    }
  }

  private calculateConfidence(dataArray: Uint8Array): number {
    const volume = this.calculateVolume(dataArray);
    const signalStrength = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

    // Higher confidence with stronger signals
    return Math.min(1, signalStrength / 128);
  }

  private findDominantFrequency(dataArray: Uint8Array): number {
    let maxValue = 0;
    let maxIndex = 0;

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    const sampleRate = this.audioContext?.sampleRate || 44100;
    return (maxIndex * sampleRate) / (2 * dataArray.length);
  }

  private calculateSpectralCentroid(dataArray: Uint8Array): number {
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const frequency = (i * (this.audioContext?.sampleRate || 44100)) / (2 * dataArray.length);
      numerator += frequency * dataArray[i];
      denominator += dataArray[i];
    }

    return denominator > 0 ? numerator / denominator : 0;
  }
}

/**
 * Voice Profile Manager
 */
export class VoiceProfileManager {
  private profiles: Map<string, VoiceProfile> = new Map();

  /**
   * Create or update voice profile
   */
  public updateProfile(userId: string, audioFeatures: AudioAnalysis): void {
    let profile = this.profiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        voiceSignature: [],
        preferredVoice: 'default',
        language: 'en-US',
        speechPatterns: {},
        lastUpdated: new Date()
      };
      this.profiles.set(userId, profile);
    }

    // Update voice signature
    profile.voiceSignature = this.updateVoiceSignature(profile.voiceSignature, audioFeatures);

    // Update speech patterns
    this.updateSpeechPatterns(profile, audioFeatures);

    profile.lastUpdated = new Date();
  }

  /**
   * Get voice profile
   */
  public getProfile(userId: string): VoiceProfile | null {
    return this.profiles.get(userId) || null;
  }

  /**
   * Verify voice against profile
   */
  public verifyVoice(userId: string, audioFeatures: AudioAnalysis): number {
    const profile = this.profiles.get(userId);
    if (!profile) return 0;

    // Simple voice verification based on signature similarity
    const similarity = this.calculateSignatureSimilarity(profile.voiceSignature, [
      audioFeatures.volume,
      audioFeatures.pitch,
      audioFeatures.tempo,
      audioFeatures.features.dominantFrequency,
      audioFeatures.features.spectralCentroid
    ]);

    return similarity;
  }

  private updateVoiceSignature(signature: number[], features: AudioAnalysis): number[] {
    const newFeatures = [
      features.volume,
      features.pitch,
      features.tempo,
      features.features.dominantFrequency,
      features.features.spectralCentroid
    ];

    if (signature.length === 0) {
      return newFeatures;
    }

    // Update signature using exponential moving average
    const alpha = 0.1;
    return signature.map((oldVal, index) =>
      alpha * newFeatures[index] + (1 - alpha) * oldVal
    );
  }

  private updateSpeechPatterns(profile: VoiceProfile, features: AudioAnalysis): void {
    const emotion = features.emotion;
    const volume = features.volume;
    const pitch = features.pitch;

    if (!profile.speechPatterns[emotion]) {
      profile.speechPatterns[emotion] = 0;
    }

    // Update pattern counts
    profile.speechPatterns[emotion] += 1;

    // Update volume and pitch preferences
    profile.speechPatterns['avg_volume'] = profile.speechPatterns['avg_volume'] || volume;
    profile.speechPatterns['avg_pitch'] = profile.speechPatterns['avg_pitch'] || pitch;

    profile.speechPatterns['avg_volume'] = 0.9 * profile.speechPatterns['avg_volume'] + 0.1 * volume;
    profile.speechPatterns['avg_pitch'] = 0.9 * profile.speechPatterns['avg_pitch'] + 0.1 * pitch;
  }

  private calculateSignatureSimilarity(signature1: number[], signature2: number[]): number {
    if (signature1.length !== signature2.length) return 0;

    let similarity = 0;
    for (let i = 0; i < signature1.length; i++) {
      const diff = Math.abs(signature1[i] - signature2[i]);
      const maxVal = Math.max(signature1[i], signature2[i]);
      similarity += maxVal > 0 ? 1 - (diff / maxVal) : 1;
    }

    return similarity / signature1.length;
  }
}

// Export singleton instances
export const voiceCommandProcessor = new VoiceCommandProcessor();
export const ttsEngine = new TTSEngine();
export const speechRecognitionEngine = new SpeechRecognitionEngine();
export const audioAnalysisEngine = new AudioAnalysisEngine();
export const voiceProfileManager = new VoiceProfileManager();
