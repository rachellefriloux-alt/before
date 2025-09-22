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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\voice\VoiceInput.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\voice\VoiceInput.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\voice\VoiceInput.vue) --- */
<!-- Merged master for logical file: ui\components\voice\VoiceInput
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\voice\VoiceInput.vue (hash:D24EE50B42C13F4D51B877761B0621D03FF5F57AAD3787E9D3E5E7FB651DA050)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\voice\VoiceInput.vue (hash:388B9A44DEF7186B3B83FDDAC7A2DBEFDDC7AA05AE9D7401BC5DA5DAFD81F219)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\voice\VoiceInput.vue | ext: .vue | sha: D24EE50B42C13F4D51B877761B0621D03FF5F57AAD3787E9D3E5E7FB651DA050 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\voice\VoiceInput.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\voice\VoiceInput.vue | ext: .vue | sha: 388B9A44DEF7186B3B83FDDAC7A2DBEFDDC7AA05AE9D7401BC5DA5DAFD81F219 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\voice\VoiceInput.vue --- */
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
      };
      recognition.onerror = (event) => {
        this.error = event.error;
      recognition.onend = () => {
      recognition.start();
    }
  }
}
</script>
<style>
.voice-input { margin: 12px 0; }
</style>
