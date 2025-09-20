<template>
  <div class="camera-vision" :class="theme" aria-label="Camera Vision AI" tabindex="0">
    <h3>Camera Vision</h3>
    <video ref="video" autoplay playsinline width="320" height="240" aria-label="Live camera feed"></video>
    <div class="service-select">
      <label for="vision-service">Vision Service:</label>
      <select id="vision-service" v-model="selectedServices" multiple aria-label="Select Vision Services" tabindex="1">
        <option value="google">Google Vision</option>
        <option value="gemini">Gemini</option>
        <option value="openai">OpenAI</option>

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
    </div>
    <div v-if="results.length">
      <h4>Results:</h4>
      <div v-for="serviceResult in results" :key="serviceResult.service">
        <h5>{{ capitalize(serviceResult.service) }} Results:</h5>
        <ul>
          <li v-for="result in serviceResult.results" :key="result.id" tabindex="3" :aria-label="result.label + ' ' + result.confidence + '%'">
              <strong>{{ result.label }}</strong> ({{ result.confidence }}%)<br />
          </li>
          </ul>
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
      _debounceTimeout: null
    };
  },
  methods: {
    initCamera: async function() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = stream;
      } catch (e) {
        this.error = 'Camera access denied.';
      }
    },
    captureFrame: async function() {
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
      this.logAnalytics('frame_analysis', { services: this.selectedServices });
      if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
      this._debounceTimeout = setTimeout(async () => {
        try {
          let allResults = [];
          for (const service of this.selectedServices) {
            let results = [];
            // Add your service analysis logic here
          }
          this.results = allResults;
        } catch (e) {
          this.error = e.message || 'Analysis failed.';
          this.logAnalytics('error', { error: this.error });
        }
        this.loading = false;
      }, 300);
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
      // Replace with your analytics provider
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
      });
    }
  },
  mounted() {
    this.initCamera();
  },
  watch: {
    selectedServices: function(newVal) {
      localStorage.setItem('selectedServices', JSON.stringify(newVal));
      this.logAnalytics('service_selection', { selected: newVal });
    },
    customApiEndpoint: function(newVal) {
      localStorage.setItem('customApiEndpoint', newVal);
    },
    theme: function(newVal) {
      localStorage.setItem('theme', newVal);
    }
  },
  beforeDestroy() {
    this.logEngagementEnd();
  }

            theme: function(newVal) {
              localStorage.setItem('theme', newVal);
            }
          },
          beforeDestroy() {
            this.logEngagementEnd();
          }
        };
      <span v-else-if="error.includes('auth')">Authentication required. Please log in.</span>
    </div>
    <div v-if="results.length">
      <h4>Results:</h4>
      <div v-for="serviceResult in results" :key="serviceResult.service">
        <h5>{{ capitalize(serviceResult.service) }} Results:</h5>
        </ul>
      </div>
    </div>
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        this.frameThumbnail = imageData;
        this.logAnalytics('frame_analysis', { services: this.selectedServices });
        // Debounce: prevent rapid repeated analysis
        if (this._debounceTimeout) clearTimeout(this._debounceTimeout);
        this._debounceTimeout = setTimeout(async () => {
          try {
            let allResults = [];
            for (const service of this.selectedServices) {
              let results = [];
              if (service === 'google') {
                results = await this.analyzeWithGoogleVision(imageData);
              } else if (service === 'gemini') {
                results = await this.analyzeWithGemini(imageData);
              } else if (service === 'openai') {
                results = await this.analyzeWithOpenAI(imageData);
              } else if (service === 'perplexity') {
                results = await this.analyzeWithPerplexity(imageData);
              } else if (service === 'custom' && this.customApiEndpoint) {
                results = await this.analyzeWithCustomApi(imageData, this.customApiEndpoint);
              }
              // Add actionable suggestions for common objects
              results = results.map(r => ({ ...r, suggestion: this.getSuggestionForLabel(r.label) }));
              allResults.push({ service, results });
            }
            this.results = allResults;
          } catch (e) {
            this.error = e.message || 'Analysis failed.';
            this.logAnalytics('error', { error: this.error });
          }
          this.loading = false;
        }, 300);
      },
      analyzeWithCustomApi: async function(imageData, endpoint) {
        // Example custom API integration
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
          this.logAnalytics('error', { error: this.error });
          return [];
        }
      },
      getSuggestionForLabel: function(label) {
        // Actionable suggestions for common objects
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
          'Remote': 'Replace batteries every 6 months.'
        };
        return suggestions[label] || '';
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
      toggleTheme: function() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.logAnalytics('theme_toggle', { theme: this.theme });
      },
      logAnalytics: function(event, data) {
        // Replace with your analytics provider (e.g., Plausible, PostHog, Google Analytics)
        // Example: send to backend endpoint
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
        });
        // For debugging
        // console.log('Analytics event:', event, data);
      },
      capitalize: function(value) {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    },
    watch: {
      selectedServices: function(newVal) {
        localStorage.setItem('selectedServices', JSON.stringify(newVal));
        this.logAnalytics('service_selection', { selected: newVal });
      },
      customApiEndpoint: function(newVal) {
        localStorage.setItem('customApiEndpoint', newVal);
      },
      theme: function(newVal) {
        localStorage.setItem('theme', newVal);
      }
    },
    beforeDestroy() {
      this.logEngagementEnd();
    },
