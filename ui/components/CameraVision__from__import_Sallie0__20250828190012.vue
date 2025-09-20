/*
 * Persona: Tough love meets soul care.
 * Module: CameraVision
 * Intent: Handle functionality for CameraVision
 * Provenance-ID: 23cfbe4c-d855-48b3-99df-b1595a9a9e10
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="camera-vision" :class="theme" aria-label="Camera Vision AI" tabindex="0">
    <header class="header">
      <h3>Camera Vision</h3>
      <button @click="toggleTheme" class="theme-toggle" :aria-label="'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' theme'" tabindex="2">
        <span v-if="theme === 'light'">🌙</span>
        <span v-else>☀️</span>
      </button>
    </header>
    <video ref="video" autoplay playsinline width="320" height="240" aria-label="Live camera feed"></video>
    <div class="controls">
      <div class="service-select">
        <label for="vision-service">Vision Services:</label>
        <select id="vision-service" v-model="selectedServices" multiple aria-label="Select Vision Services" tabindex="1">
          <option value="google">Google Vision</option>
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
          <option value="perplexity">Perplexity</option>
          <option value="custom" v-if="customApiEndpoint">Custom API</option>
        </select>
      </div>
      <button @click="captureFrame" :disabled="loading || selectedServices.length === 0" class="capture-btn" aria-label="Capture and analyze frame" tabindex="3">
        {{ loading ? 'Analyzing...' : 'Capture Frame' }}
      </button>
    </div>
    <div v-if="customApiEndpoint" class="custom-api">
      <label for="custom-endpoint">Custom API Endpoint:</label>
      <input id="custom-endpoint" v-model="customApiEndpoint" type="url" placeholder="https://your-api.com/analyze" aria-label="Custom API endpoint" tabindex="4">
    </div>
    <canvas ref="canvas" width="320" height="240" style="display:none;"></canvas>
    <div v-if="frameThumbnail" class="thumbnail">
      <h4>Captured Frame:</h4>
      <img :src="frameThumbnail" alt="Frame thumbnail" width="160" height="120" />
    </div>
    <div v-if="loading" class="spinner" aria-live="polite">
      <span>Analyzing...</span>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" stroke="#888" stroke-width="4" fill="none" stroke-dasharray="80" stroke-dashoffset="60"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="1s" repeatCount="indefinite"/></circle></svg>
    </div>
    <div v-if="error" class="error" aria-live="assertive">
      <strong>Error:</strong> {{ error }}<br>
      <span v-if="error.includes('Camera access denied')">Please check your browser permissions and ensure your camera is connected.</span>
      <span v-else-if="error.includes('Analysis failed')">Try again or check your network connection.</span>
      <span v-else-if="error.includes('rate limit')">You are sending requests too quickly. Please wait and try again.</span>
      <span v-else-if="error.includes('auth')">Authentication required. Please log in.</span>
      <button @click="retryAnalysis" class="retry-btn" aria-label="Retry analysis" tabindex="5">Retry</button>
    </div>
    <div v-if="results.length" class="results">
      <h4>Analysis Results:</h4>
      <div v-for="serviceResult in results" :key="serviceResult.service" class="service-result">
        <h5>{{ capitalize(serviceResult.service) }} Results:</h5>
        <div class="result-grid">
          <div v-for="result in serviceResult.results" :key="result.id" class="result-card" tabindex="6" :aria-label="result.label + ' ' + result.confidence + '%'">
            <strong>{{ result.label }}</strong> ({{ result.confidence }}%)<br />
            <small v-if="result.suggestion">{{ result.suggestion }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CameraVision',
  data() {
    return {
      theme: 'light',
      selectedServices: [],
      customApiEndpoint: '',
      frameThumbnail: '',
      loading: false,
      error: '',
      results: [],
      engagementStart: null,
      debounceTimeout: null
    };
  },
  methods: {
    initCamera: async function() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = stream;
        this.logAnalytics('camera_initialized', {});
      } catch (e) {
        this.error = 'Camera access denied.';
        this.logAnalytics('camera_error', { error: e.message });
      }
    },
    captureFrame: async function() {
      if (this.selectedServices.length === 0) {
        this.error = 'Please select at least one vision service.';
        return;
      }
      this.logEngagementStart();
      this.loading = true;
      this.error = '';
      this.results = [];
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      this.frameThumbnail = imageData;
      this.logAnalytics('frame_captured', { services: this.selectedServices });
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(async () => {
        try {
          let allResults = [];
          for (const service of this.selectedServices) {
            let results = [];
            switch (service) {
              case 'google':
                results = await this.analyzeWithGoogleVision(imageData);
                break;
              case 'gemini':
                results = await this.analyzeWithGemini(imageData);
                break;
              case 'openai':
                results = await this.analyzeWithOpenAI(imageData);
                break;
              case 'perplexity':
                results = await this.analyzeWithPerplexity(imageData);
                break;
              case 'custom':
                if (this.customApiEndpoint) {
                  results = await this.analyzeWithCustomApi(imageData, this.customApiEndpoint);
                }
                break;
            }
            // Add actionable suggestions for common objects
            results = results.map(r => ({ ...r, suggestion: this.getSuggestionForLabel(r.label) }));
            allResults.push({ service, results });
          }
          this.results = allResults;
          this.logAnalytics('analysis_complete', { serviceCount: allResults.length });
        } catch (e) {
          this.error = e.message || 'Analysis failed.';
          this.logAnalytics('analysis_error', { error: this.error });
        }
        this.loading = false;
      }, 300);
    },
    retryAnalysis: function() {
      this.error = '';
      this.captureFrame();
      this.logAnalytics('retry_analysis', {});
    },
    toggleTheme: function() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.logAnalytics('theme_toggle', { theme: this.theme });
    },
    analyzeWithGoogleVision: async function(imageData) {
      // Mock implementation - replace with actual Google Vision API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return [
        { id: 1, label: 'Person', confidence: 95, info: 'Human detected' },
        { id: 2, label: 'Laptop', confidence: 87, info: 'Electronic device' }
      ];
    },
    analyzeWithGemini: async function(imageData) {
      // Mock implementation - replace with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      return [
        { id: 1, label: 'Chair', confidence: 92, info: 'Furniture item' },
        { id: 2, label: 'Table', confidence: 89, info: 'Surface for work' }
      ];
    },
    analyzeWithOpenAI: async function(imageData) {
      // Mock implementation - replace with actual OpenAI API call
      await new Promise(resolve => setTimeout(resolve, 1100));
      return [
        { id: 1, label: 'Book', confidence: 94, info: 'Reading material' },
        { id: 2, label: 'Coffee Mug', confidence: 85, info: 'Beverage container' }
      ];
    },
    analyzeWithPerplexity: async function(imageData) {
      // Mock implementation - replace with actual Perplexity API call
      await new Promise(resolve => setTimeout(resolve, 1300));
      return [
        { id: 1, label: 'Plant', confidence: 90, info: 'Living organism' },
        { id: 2, label: 'Window', confidence: 88, info: 'Opening for light' }
      ];
    },
    analyzeWithCustomApi: async function(imageData, endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        const data = await response.json();
        if (!data.labels) return [];
        return data.labels.map((label, idx) => ({
          id: idx + 1,
          label: label.name,
          confidence: Math.round(label.confidence * 100),
          info: `Custom API: ${label.name}`,
          context: this.getContextForLabel(label.name)
        }));
      } catch (e) {
        this.error = 'Custom API error: ' + (e.message || 'Unknown error');
        this.logAnalytics('custom_api_error', { error: this.error });
        return [];
      }
    },
    getSuggestionForLabel: function(label) {
      const suggestions = {
        'Laptop': 'Consider using a cooling pad for long sessions.',
        'Coffee Mug': 'Switch to a reusable mug to reduce waste.',
        'Book': 'Share your favorite book with a friend.',
        'Pen': 'Try a refillable pen for sustainability.',
        'Phone': 'Enable two-factor authentication for security.',
        'Notebook': 'Organize your notes by topic for efficiency.',
        'Glasses': 'Schedule regular eye exams.',
        'Water Bottle': 'Track your daily water intake.',
        'Thermostat': 'Set schedules for energy savings.',
        'Front Door Lock': 'Check smart lock battery regularly.',
        'Living Room Light': 'Use dimmers for mood lighting.',
        'Plant': 'Fertilize monthly for healthy growth.',
        'Chair': 'Adjust lumbar support for comfort.',
        'Table': 'Declutter weekly for productivity.',
        'TV': 'Limit screen time for better sleep.',
        'Remote': 'Replace batteries every 6 months.',
        'Person': 'Remember to stay hydrated and take breaks.',
        'Window': 'Consider energy-efficient window treatments.'
      };
      return suggestions[label] || '';
    },
    getContextForLabel: function(label) {
      // Additional context for labels
      return `Detected: ${label}`;
    },
    capitalize: function(value) {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    logEngagementStart: function() {
      this.engagementStart = Date.now();
    },
    logEngagementEnd: function() {
      if (this.engagementStart) {
        const duration = Date.now() - this.engagementStart;
        this.logAnalytics('engagement', { duration });
        this.engagementStart = null;
      }
    },
    logAnalytics: function(event, data) {
      // Enhanced analytics with more context
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          data: { ...data, component: 'CameraVision' },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      }).catch(err => console.warn('Analytics error:', err));
    }
  },
  mounted() {
    this.initCamera();
  },
  watch: {
    selectedServices(newVal) {
      localStorage.setItem('selectedServices', JSON.stringify(newVal));
      this.logAnalytics('service_selection', { selected: newVal });
    },
    customApiEndpoint(newVal) {
      localStorage.setItem('customApiEndpoint', newVal);
    },
    theme(newVal) {
      localStorage.setItem('theme', newVal);
    }
  },
  beforeUnmount() {
    this.logEngagementEnd();
  },
};
</script>

<style scoped>
.camera-vision {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.camera-vision.light {
  background: #ffffff;
  color: #333333;
}

.camera-vision.dark {
  background: #1a1a1a;
  color: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
  color: inherit;
}

.theme-toggle {
  background: none;
  border: 2px solid currentColor;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: currentColor;
  color: var(--bg-color);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  align-items: end;
}

.service-select {
  flex: 1;
  min-width: 200px;
}

.service-select label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.service-select select {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-color);
  color: inherit;
}

.capture-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s ease;
}

.capture-btn:hover:not(:disabled) {
  background: #0056b3;
}

.capture-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.custom-api {
  margin-bottom: 20px;
}

.custom-api label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.custom-api input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-color);
  color: inherit;
}

.thumbnail {
  margin: 20px 0;
  text-align: center;
}

.thumbnail img {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  color: #007bff;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  padding: 15px;
  margin: 20px 0;
  color: #c33;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #218838;
}

.results {
  margin-top: 30px;
}

.service-result {
  margin-bottom: 25px;
}

.service-result h5 {
  margin-bottom: 15px;
  color: #007bff;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.result-card {
  background: var(--card-bg, #f8f9fa);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.result-card strong {
  font-size: 16px;
  color: #007bff;
}

.result-card small {
  color: #6c757d;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 600px) {
  .camera-vision {
    padding: 15px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .result-grid {
    grid-template-columns: 1fr;
  }

  video {
    width: 100%;
    height: auto;
  }
}

/* Theme variables */
.camera-vision.light {
  --bg-color: #ffffff;
  --card-bg: #f8f9fa;
}

.camera-vision.dark {
  --bg-color: #1a1a1a;
  --card-bg: #2d2d2d;
}
</style>
