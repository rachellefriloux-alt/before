/*
 * Persona: Tough love meets soul care.
 * Module: VoiceConsole
 * Intent: Handle functionality for VoiceConsole
 * Provenance-ID: f91949a7-5de2-4b17-82bc-691382631261
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="voice-console" :class="theme">
    <div class="voice-console-header">
      <h3>Voice Console</h3>
      <div class="voice-status">
        <div class="status-indicator" :class="isListening ? 'active' : 'inactive'"></div>
        <span>{{ isListening ? 'Listening...' : 'Ready' }}</span>
      </div>
    </div>

    <div class="waveform-container" v-if="waveform">
      <div class="waveform-display" v-html="waveform"></div>
    </div>

    <div class="voice-controls" v-if="!isListening">
      <button @click="startListening" class="voice-btn listen-btn">
        Start Listening
      </button>
    </div>

    <div class="voice-controls" v-else>
      <button @click="stopListening" class="voice-btn stop-btn">
        Stop Listening
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceConsole',
  props: {
    waveform: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      isListening: false
    };
  },
  methods: {
    startListening() {
      this.isListening = true;
      // Emit event to parent to start voice recognition
      this.$emit('startListening');
    },
    stopListening() {
      this.isListening = false;
      // Emit event to parent to stop voice recognition
      this.$emit('stopListening');
    }
  }
};
</script>

<style scoped>
.voice-console {
  background: var(--bg-color, #f8f9fa);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.voice-console.dark {
  --bg-color: #2a2a2a;
  --border-color: #444;
  --text-color: #e0e0e0;
  --text-secondary: #b0b0b0;
  --primary-color: #4a9eff;
  --primary-hover: #3a8eff;
  --success-color: #28a745;
  --danger-color: #dc3545;
}

.voice-console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.voice-console h3 {
  margin: 0;
  color: var(--text-color, #333);
  font-size: 1.1rem;
}

.voice-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary, #666);
  transition: background-color 0.3s;
}

.status-indicator.active {
  background: var(--success-color, #28a745);
  animation: pulse 1.5s infinite;
}

.status-indicator.inactive {
  background: var(--text-secondary, #666);
}

.waveform-container {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
}

.waveform-display {
  width: 100%;
  max-width: 300px;
}

.waveform-display svg {
  width: 100%;
  height: auto;
}

.voice-controls {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.voice-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.listen-btn {
  background: var(--primary-color, #007bff);
  color: white;
}

.listen-btn:hover {
  background: var(--primary-hover, #0056b3);
}

.stop-btn {
  background: var(--danger-color, #dc3545);
  color: white;
}

.stop-btn:hover {
  background: #c82333;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
