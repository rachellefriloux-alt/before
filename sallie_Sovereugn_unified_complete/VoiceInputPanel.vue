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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\VoiceInputPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\VoiceInputPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\VoiceInputPanel.vue) --- */
<!-- Merged master for logical file: ui\components\VoiceInputPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\VoiceInputPanel.vue (hash:A97B41711EF24A9BFE211222ED83C96E09316B09090B8EBBCF839BE149114836)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\VoiceInputPanel.vue (hash:79245AC3CF41098EAA7743615DA4A4DF953DB88A98A4E7F4E15E4D82A1377C86)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\VoiceInputPanel.vue | ext: .vue | sha: A97B41711EF24A9BFE211222ED83C96E09316B09090B8EBBCF839BE149114836 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\VoiceInputPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\VoiceInputPanel.vue | ext: .vue | sha: 79245AC3CF41098EAA7743615DA4A4DF953DB88A98A4E7F4E15E4D82A1377C86 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\VoiceInputPanel.vue --- */
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
          this.error = 'Speech recognition error.';
          this.logAnalytics('error', { error: this.error });
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
