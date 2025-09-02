<template>
  <div class="voice-input-panel" :class="theme" aria-label="Voice Input Panel" tabindex="0">
    <h2>Voice Input</h2>
    <button @click="startListening" aria-label="Start Listening" tabindex="1">🎤 Start Listening</button>
    <p v-if="listening" aria-live="polite">Listening...</p>
    <p v-if="transcript">Transcript: {{ transcript }}</p>
    <p v-if="error" class="error" aria-live="assertive">{{ error }}</p>
  </div>
</template>
<script>
export default {
  name: 'VoiceInputPanel',
  props: {
    theme: { type: String, default: 'light' }
  },
  data() {
    return {
      listening: false,
      transcript: '',
      error: '',
      analytics: []
    };
  },
  methods: {
    startListening() {
      this.listening = true;
      this.error = '';
      this.logAnalytics('start_listening', {});
      if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
          this.transcript = event.results[0][0].transcript;
          this.listening = false;
          this.logAnalytics('transcript', { transcript: this.transcript });
        };
        recognition.onerror = (e) => {
          this.listening = false;
          this.error = 'Speech recognition error.';
          this.logAnalytics('error', { error: this.error });
        };
        recognition.start();
      } else {
        this.error = 'Speech recognition not supported in this browser.';
        this.listening = false;
        this.logAnalytics('error', { error: this.error });
      }
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
};
</script>
<style>
.voice-input-panel { padding: 12px; background: #fff7ed; border-radius: 8px; margin-bottom: 12px; }
</style>
