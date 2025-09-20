<template>
  <div class="voice-input">
    <button @click="startListening" :disabled="listening">🎤 Start Voice</button>
    <span v-if="listening">Listening...</span>
    <span v-if="transcript">Transcript: {{ transcript }}</span>
    <span v-if="error" class="error">Error: {{ error }}</span>
  </div>
</template>
<script>
export default {
  data() {
    return { listening: false, transcript: '', error: '' };
  },
  methods: {
    startListening() {
      this.listening = true;
      this.transcript = '';
      this.error = '';
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        this.error = 'Speech recognition not supported.';
        this.listening = false;
        return;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        this.transcript = event.results[0][0].transcript;
        this.listening = false;
      };
      recognition.onerror = (event) => {
        this.error = event.error;
        this.listening = false;
      };
      recognition.onend = () => {
        this.listening = false;
      };
      recognition.start();
    }
  }
}
</script>
<style>
.voice-input { margin: 12px 0; }
</style>
