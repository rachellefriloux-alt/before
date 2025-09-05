/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced voice interaction and speech processing system.
 * Got it, love.
 */

export class VoiceInteractionManager {
    constructor() {
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = null;
        this.audioContext = null;
        this.mediaStream = null;
        this.voiceSettings = {
            voice: 'female',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8
        };
        this.conversationHistory = [];
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize speech recognition
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = 'en-US';
            }

            // Initialize speech synthesis
            if ('speechSynthesis' in window) {
                this.synthesis = window.speechSynthesis;
            }

            // Initialize audio context for advanced processing
            if ('AudioContext' in window || 'webkitAudioContext' in window) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            }

            this.isInitialized = true;
            return true;
        } catch (error) {
            return false;
        }
    }

    async startListening(onResult, onError) {
        if (!this.isInitialized || !this.recognition) {
            throw new Error('Voice interaction not initialized');
        }

        if (this.isListening) {
            throw new Error('Already listening');
        }

        return new Promise((resolve, reject) => {
            this.recognition.onstart = () => {
                this.isListening = true;
                resolve();
            };

            this.recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                this.conversationHistory.push({
                    type: 'speech',
                    content: result,
                    timestamp: Date.now()
                });
                if (onResult) onResult(result);
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                if (onError) onError(event.error);
                reject(new Error(`Speech recognition error: ${event.error}`));
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };

            this.recognition.start();
        });
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    async speak(text, options = {}) {
        if (!this.isInitialized || !this.synthesis) {
            throw new Error('Speech synthesis not available');
        }

        if (this.isSpeaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Apply voice settings
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(voice =>
            voice.name.toLowerCase().includes(this.voiceSettings.voice)
        );

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = options.rate || this.voiceSettings.rate;
        utterance.pitch = options.pitch || this.voiceSettings.pitch;
        utterance.volume = options.volume || this.voiceSettings.volume;

        return new Promise((resolve, reject) => {
            utterance.onstart = () => {
                this.isSpeaking = true;
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                this.conversationHistory.push({
                    type: 'synthesis',
                    content: text,
                    timestamp: Date.now()
                });
                resolve();
            };

            utterance.onerror = (event) => {
                this.isSpeaking = false;
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };

            this.synthesis.speak(utterance);
        });
    }

    async analyzeVoiceEmotion() {
        // Placeholder for voice emotion analysis
        // This would typically involve:
        // 1. Extract audio features (pitch, volume, speed)
        // 2. Use machine learning model to detect emotions
        // 3. Return emotional analysis

        return {
            primaryEmotion: 'neutral',
            confidence: 0.5,
            features: {
                pitch: 0,
                volume: 0,
                speed: 0
            }
        };
    }

    updateVoiceSettings(settings) {
        this.voiceSettings = { ...this.voiceSettings, ...settings };
    }

    getConversationHistory() {
        return [...this.conversationHistory];
    }

    clearConversationHistory() {
        this.conversationHistory = [];
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
            return true;
        } catch (error) {
            return false;
        }
    }

    getAvailableVoices() {
        if (!this.synthesis) return [];

        return this.synthesis.getVoices().map(voice => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default
        }));
    }

    destroy() {
        this.stopListening();

        if (this.isSpeaking && this.synthesis) {
            this.synthesis.cancel();
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.conversationHistory = [];
        this.isInitialized = false;
    }
}

export default VoiceInteractionManager;
