<!-- Migrated and enhanced from sallie_1.00/ui/components/CommunicationPanel.vue -->
<template>
  <div class="communication-panel">
    <h2>Communication</h2>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'CommunicationPanel',
  props: {
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
    };
  },
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.communication-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  padding: 2em;
  margin: 2em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<!-- Migrated and enhanced from sallie_1.00/ui/components/CommunicationPanel.vue -->
<template>
  <div class="communication-panel">
    <h2>Communication</h2>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'CommunicationPanel',
  props: {
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
    };
  },
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
    }
  }
}
</script>
<style scoped>
.communication-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  padding: 2em;
  margin: 2em 0;
  color: var(--text-primary, #f8fafc);
}
</style>


<template>
  <div class="communication-panel">
    <div class="panel-header">
      <h2>{{ title }}</h2>
      <div class="tone-controls">
        <div class="tone-label">Tone Adjustments:</div>
        <div class="tone-sliders">
          <div v-for="(value, attr) in toneAttributes" :key="attr" class="tone-slider">
            <label>{{ formatToneAttribute(attr) }}</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              :value="value * 100" 
              @input="updateTone(attr, $event)" 
            />
            <span class="tone-value">{{ Math.round(value * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="conversation-container" ref="conversationContainer">
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Processing...</p>
      </div>
      
      <div v-if="messages.length === 0" class="empty-state">
        <p>No messages yet. Start a conversation!</p>
      </div>
      
      <div v-for="(message, index) in messages" :key="index" class="message" :class="message.sender">
        <div class="message-content">
          <p>{{ message.text }}</p>
          <div class="message-metadata">
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            <span v-if="showDetailedInfo && message.sender === 'system'" class="intent-badge">
              {{ formatIntent(message.intent) }}
            </span>
          </div>
        </div>
        
        <div v-if="showDetailedInfo && message.sender === 'user' && message.emotion" 
             class="emotion-indicator" :title="message.emotion.description">
          {{ message.emotion.emoji }} {{ message.emotion.name }}
        </div>
      </div>
    </div>
    
    <div class="input-container">
      <div class="conversation-context">
        <select v-model="selectedConversationType" @change="updateConversationContext">
          <option v-for="type in conversationTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        
        <button 
          class="context-button" 
          @click="toggleDetailedInfo"
          :class="{ active: showDetailedInfo }"
        >
          {{ showDetailedInfo ? 'Hide Details' : 'Show Details' }}
        </button>
      </div>
      
      <div class="message-input">
        <textarea 
          v-model="userInput" 
          placeholder="Type your message..." 
          @keydown.enter.prevent="sendMessage"
          ref="userInputField"
        ></textarea>
        <button @click="sendMessage" :disabled="!userInput.trim() || loading">
          <span v-if="!loading">Send</span>
          <span v-else>...</span>
        </button>
      </div>
    </div>
    
    <div class="panel-footer">
      <button @click="startNewConversation" class="new-conversation-btn">
        New Conversation
      </button>
      <div class="conversation-status">
        <span>{{ conversationStatusText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommunicationPanel',
  
  props: {
    title: {
      type: String,
      default: 'Communication Panel'
    },
    initialConversationType: {
      type: String,
      default: 'GENERAL'
    },
    userId: {
      type: String,
      default: 'default_user'
    }
  },
  
  data() {
    return {
      messages: [],
      userInput: '',
      loading: false,
      conversationId: null,
      selectedConversationType: this.initialConversationType,
      showDetailedInfo: false,
      toneAttributes: {
        formality: 0.5,
        warmth: 0.7,
        directness: 0.6,
        complexity: 0.5,
        humor: 0.3,
        encouragement: 0.6
      },
      conversationTypes: [
        { label: 'General', value: 'GENERAL' },
        { label: 'Casual', value: 'CASUAL' },
        { label: 'Professional', value: 'PROFESSIONAL' },
        { label: 'Educational', value: 'EDUCATIONAL' },
        { label: 'Therapeutic', value: 'THERAPEUTIC' },
        { label: 'Creative', value: 'CREATIVE' },
        { label: 'Technical', value: 'TECHNICAL' }
      ]
    };
  },
  
  computed: {
    conversationStatusText() {
      if (!this.conversationId) {
        return 'No active conversation';
      }
      return `Active conversation: ${this.formatTime(this.conversationStartTime)}`;
    }
  },
  
  mounted() {
    this.startNewConversation();
    
    // Focus the input field
    this.$nextTick(() => {
      this.$refs.userInputField.focus();
    });
  },
  
  methods: {
    async startNewConversation() {
      this.loading = true;
      
      try {
        // Call backend to start a new conversation
        const response = await this.callCommunicationAPI('/api/communication/conversation/start', {
          type: this.selectedConversationType,
          userId: this.userId,
          initialContext: {
            source: 'CommunicationPanel',
            timestamp: Date.now()
          }
        });
        
        if (response && response.id) {
          this.conversationId = response.id;
          this.conversationStartTime = response.startTime;
          this.messages = [];
          
          // Add initial system message
          const welcomeMessage = this.generateWelcomeMessage();
          this.messages.push({
            text: welcomeMessage,
            sender: 'system',
            timestamp: Date.now(),
            intent: 'SOCIAL_GREETING'
          });
        } else {
          console.error('Failed to start conversation', response);
        }
      } catch (error) {
        console.error('Error starting conversation', error);
        this.addSystemErrorMessage('Failed to start a new conversation. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    
    generateWelcomeMessage() {
      const messages = [
        "Hello! How can I assist you today?",
        "Welcome to our conversation. What's on your mind?",
        "Hi there! I'm ready to chat when you are.",
        "Greetings! How are you feeling today?",
        "Hello! I'm here to support you. What would you like to talk about?"
      ];
      
      // Choose randomly
      return messages[Math.floor(Math.random() * messages.length)];
    },
    
    async sendMessage() {
      const message = this.userInput.trim();
      if (!message || this.loading) return;
      
      this.addUserMessage(message);
      this.userInput = '';
      
      // Auto-scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      this.loading = true;
      
      try {
        // Call backend API to process message
        const response = await this.callCommunicationAPI('/api/communication/process', {
          userMessage: message,
          conversationId: this.conversationId,
          additionalContext: {
            selectedConversationType: this.selectedConversationType
          }
        });
        
        if (response && response.text) {
          this.addSystemMessage(response);
        } else {
          console.error('Invalid response', response);
          this.addSystemErrorMessage('I encountered an issue processing your message. Please try again.');
        }
      } catch (error) {
        console.error('Error sending message', error);
        this.addSystemErrorMessage('Sorry, I couldn\'t process your message. Please try again.');
      } finally {
        this.loading = false;
        
        // Focus back on input
        this.$nextTick(() => {
          this.$refs.userInputField.focus();
        });
      }
    },
    
    addUserMessage(text) {
      this.messages.push({
        text,
        sender: 'user',
        timestamp: Date.now()
      });
    },
    
    addSystemMessage(response) {
      const message = {
        text: response.text,
        sender: 'system',
        timestamp: response.timestamp || Date.now(),
        intent: response.intent || 'UNKNOWN',
        responseMode: response.responseMode || 'INFORMATIONAL'
      };
      
      // Add emotional recognition data if available
      if (response.emotionalRecognition) {
        const lastUserMessage = [...this.messages].reverse().find(m => m.sender === 'user');
        if (lastUserMessage) {
          lastUserMessage.emotion = {
            name: response.emotionalRecognition.primaryEmotion,
            confidence: response.emotionalRecognition.confidenceScore,
            description: response.emotionalRecognition.description || '',
            emoji: this.getEmotionEmoji(response.emotionalRecognition.primaryEmotion)
          };
        }
      }
      
      this.messages.push(message);
      
      // Auto-scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    addSystemErrorMessage(text) {
      this.messages.push({
        text,
        sender: 'system',
        timestamp: Date.now(),
        error: true
      });
      
      // Auto-scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // Simulated API call - in real implementation, this would make an actual HTTP request
    async callCommunicationAPI(endpoint, data) {
      // This is a simulation for demo purposes
      // In a real app, this would be an actual API call
      console.log('API call to:', endpoint, data);
      
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          try {
            if (endpoint === '/api/communication/conversation/start') {
              resolve({
                id: `conv_${Date.now()}`,
                startTime: Date.now(),
                type: data.type,
                userId: data.userId
              });
            } else if (endpoint === '/api/communication/process') {
              // Simulate response based on input
              const userMessage = data.userMessage.toLowerCase();
              
              let responseText = 'I understand. Can you tell me more?';
              let intent = 'INFORMATION';
              let responseMode = 'INFORMATIONAL';
              
              // Very simple response simulation
              if (userMessage.includes('hello') || userMessage.includes('hi')) {
                responseText = 'Hello! How are you feeling today?';
                intent = 'SOCIAL_GREETING';
                responseMode = 'SOCIAL';
              } else if (userMessage.includes('?')) {
                responseText = 'That\'s an interesting question. The answer depends on several factors. Let\'s explore this topic together.';
                intent = 'QUERY_GENERAL';
                responseMode = 'INFORMATIONAL';
              } else if (userMessage.includes('sad') || userMessage.includes('unhappy') || userMessage.includes('depressed')) {
                responseText = 'I hear that you\'re feeling down. That\'s completely understandable. Would it help to talk more about what\'s causing these feelings?';
                intent = 'EMOTIONAL_NEGATIVE';
                responseMode = 'EMPATHIC_NEGATIVE';
              } else if (userMessage.includes('happy') || userMessage.includes('great') || userMessage.includes('wonderful')) {
                responseText = 'I\'m so glad to hear you\'re feeling positive! What specifically has been bringing you joy?';
                intent = 'EMOTIONAL_POSITIVE';
                responseMode = 'EMPATHIC_POSITIVE';
              } else if (userMessage.includes('help')) {
                responseText = 'I\'m here to help. Let\'s break down what you\'re experiencing and work through it together.';
                intent = 'SUPPORT_REQUEST';
                responseMode = 'SUPPORTIVE';
              } else if (userMessage.includes('thank')) {
                responseText = 'You\'re welcome! I\'m glad I could be of assistance.';
                intent = 'SOCIAL_GRATITUDE';
                responseMode = 'SOCIAL';
              } else if (userMessage.includes('bye') || userMessage.includes('goodbye')) {
                responseText = 'Take care! Remember I\'m here whenever you need to talk.';
                intent = 'SOCIAL_FAREWELL';
                responseMode = 'SOCIAL';
              }
              
              // Generate emotional recognition
              let emotion = 'NEUTRAL';
              let emotionConfidence = 0.7;
              
              if (userMessage.includes('sad') || userMessage.includes('unhappy') || userMessage.includes('depressed')) {
                emotion = 'SADNESS';
                emotionConfidence = 0.85;
              } else if (userMessage.includes('happy') || userMessage.includes('great') || userMessage.includes('wonderful')) {
                emotion = 'JOY';
                emotionConfidence = 0.9;
              } else if (userMessage.includes('angry') || userMessage.includes('mad') || userMessage.includes('upset')) {
                emotion = 'ANGER';
                emotionConfidence = 0.8;
              } else if (userMessage.includes('afraid') || userMessage.includes('scared') || userMessage.includes('fear')) {
                emotion = 'FEAR';
                emotionConfidence = 0.75;
              } else if (userMessage.includes('confused') || userMessage.includes('unsure')) {
                emotion = 'CONFUSION';
                emotionConfidence = 0.7;
              }
              
              resolve({
                messageId: `msg_${Date.now()}`,
                text: responseText,
                timestamp: Date.now(),
                intent: intent,
                responseMode: responseMode,
                emotionalRecognition: {
                  primaryEmotion: emotion,
                  confidenceScore: emotionConfidence,
                  description: `Detected ${emotion.toLowerCase()} in your message.`
                }
              });
            } else {
              reject(new Error('Unknown endpoint'));
            }
          } catch (err) {
            reject(err);
          }
        }, 1000); // 1 second delay
      });
    },
    
    updateConversationContext() {
      // In a real implementation, this would update the backend about the changed context
      console.log('Conversation context updated:', this.selectedConversationType);
    },
    
    toggleDetailedInfo() {
      this.showDetailedInfo = !this.showDetailedInfo;
    },
    
    async updateTone(attribute, event) {
      const value = event.target.value / 100;
      this.toneAttributes[attribute] = value;
      
      // In a real implementation, this would call the backend to update tone preferences
      console.log('Tone updated:', attribute, value);
      
      try {
        // Simulated API call to update tone preference
        // await this.callCommunicationAPI('/api/communication/tone/update', {
        //   attribute,
        //   level: value,
        //   strength: 0.5
        // });
      } catch (error) {
        console.error('Error updating tone preference', error);
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    formatToneAttribute(attr) {
      // Convert camelCase to Title Case with spaces
      return attr
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
    },
    
    formatIntent(intent) {
      if (!intent) return '';
      
      // Remove prefix and convert to Title Case
      return intent
        .replace(/(QUERY_|COMMAND_|SOCIAL_|EMOTIONAL_)/, '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
    },
    
    getEmotionEmoji(emotion) {
      if (!emotion) return '😐';
      
      const emotionMap = {
        'SADNESS': '😢',
        'JOY': '😊',
        'ANGER': '😠',
        'FEAR': '😨',
        'SURPRISE': '😲',
        'DISGUST': '🤢',
        'CONFUSION': '🤔',
        'EXCITEMENT': '😃',
        'DISAPPOINTMENT': '😞',
        'FRUSTRATION': '😤',
        'ANXIETY': '😰',
        'CONTENTMENT': '😌',
        'GRIEF': '😭',
        'WORRY': '😟',
        'NEUTRAL': '😐'
      };
      
      return emotionMap[emotion] || '😐';
    },
    
    scrollToBottom() {
      const container = this.$refs.conversationContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
.communication-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  padding: 12px 16px;
  background-color: #2c3e50;
  color: white;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.tone-controls {
  margin-top: 10px;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
}

.tone-label {
  margin-bottom: 5px;
  font-weight: 500;
}

.tone-sliders {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tone-slider {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 150px;
}

.tone-slider label {
  min-width: 80px;
  font-size: 0.75rem;
}

.tone-slider input {
  width: 80px;
  height: 4px;
}

.tone-value {
  font-size: 0.7rem;
  width: 30px;
  text-align: right;
}

.conversation-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #ffffff;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.message {
  display: flex;
  margin-bottom: 8px;
  max-width: 80%;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message.system {
  align-self: flex-start;
}

.message-content {
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background-color: #3498db;
  color: white;
  border-top-right-radius: 2px;
}

.message.system .message-content {
  background-color: #ecf0f1;
  color: #34495e;
  border-top-left-radius: 2px;
}

.message p {
  margin: 0;
  line-height: 1.4;
}

.message-metadata {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  margin-top: 4px;
  opacity: 0.7;
}

.timestamp {
  color: inherit;
}

.intent-badge {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.65rem;
}

.emotion-indicator {
  font-size: 0.8rem;
  margin-right: 10px;
  align-self: flex-end;
  margin-bottom: 4px;
  background-color: rgba(52, 152, 219, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}

.input-container {
  padding: 12px;
  background-color: #ecf0f1;
  border-top: 1px solid #dee2e6;
}

.conversation-context {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.conversation-context select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #cbd5e0;
  background-color: white;
  font-size: 0.9rem;
}

.context-button {
  padding: 6px 12px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-button:hover {
  background-color: #1e2b38;
}

.context-button.active {
  background-color: #e74c3c;
}

.message-input {
  display: flex;
  gap: 8px;
}

.message-input textarea {
  flex: 1;
  padding: 10px 14px;
  border-radius: 20px;
  border: 1px solid #cbd5e0;
  font-size: 0.95rem;
  resize: none;
  height: 45px;
  line-height: 1.4;
  outline: none;
  transition: border-color 0.2s;
}

.message-input textarea:focus {
  border-color: #3498db;
}

.message-input button {
  padding: 0 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-input button:hover:not(:disabled) {
  background-color: #2980b9;
}

.message-input button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #2c3e50;
  color: white;
  font-size: 0.8rem;
}

.new-conversation-btn {
  padding: 6px 12px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-conversation-btn:hover {
  background-color: #c0392b;
}

.conversation-status {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>




<template>
  <div class="communication-panel">
    <div class="panel-header">
      <h2>{{ title }}</h2>
      <div class="tone-controls">
        <div class="tone-label">Tone Adjustments:</div>
        <div class="tone-sliders">
          <div v-for="(value, attr) in toneAttributes" :key="attr" class="tone-slider">
            <label>{{ formatToneAttribute(attr) }}</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              :value="value * 100" 
              @input="updateTone(attr, $event)" 
            />
            <span class="tone-value">{{ Math.round(value * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="conversation-container" ref="conversationContainer">
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Processing...</p>
      </div>
      
      <div v-if="messages.length === 0" class="empty-state">
        <p>No messages yet. Start a conversation!</p>
      </div>
      
      <div v-for="(message, index) in messages" :key="index" class="message" :class="message.sender">
        <div class="message-content">
          <p>{{ message.text }}</p>
          <div class="message-metadata">
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            <span v-if="showDetailedInfo && message.sender === 'system'" class="intent-badge">
              {{ formatIntent(message.intent) }}
            </span>
          </div>
        </div>
        
        <div v-if="showDetailedInfo && message.sender === 'user' && message.emotion" 
             class="emotion-indicator" :title="message.emotion.description">
          {{ message.emotion.emoji }} {{ message.emotion.name }}
        </div>
      </div>
    </div>
    
    <div class="input-container">
      <div class="conversation-context">
        <select v-model="selectedConversationType" @change="updateConversationContext">
          <option v-for="type in conversationTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        
        <button 
          class="context-button" 
          @click="toggleDetailedInfo"
          :class="{ active: showDetailedInfo }"
        >
          {{ showDetailedInfo ? 'Hide Details' : 'Show Details' }}
        </button>
      </div>
      
      <div class="message-input">
        <textarea 
          v-model="userInput" 
          placeholder="Type your message..." 
          @keydown.enter.prevent="sendMessage"
          ref="userInputField"
        ></textarea>
        <button @click="sendMessage" :disabled="!userInput.trim() || loading">
          <span v-if="!loading">Send</span>
          <span v-else>...</span>
        </button>
      </div>
    </div>
    
    <div class="panel-footer">
      <button @click="startNewConversation" class="new-conversation-btn">
        New Conversation
      </button>
      <div class="conversation-status">
        <span>{{ conversationStatusText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommunicationPanel',
  
  props: {
    title: {
      type: String,
      default: 'Communication Panel'
    },
    initialConversationType: {
      type: String,
      default: 'GENERAL'
    },
    userId: {
      type: String,
      default: 'default_user'
    }
  },
  
  data() {
    return {
      messages: [],
      userInput: '',
      loading: false,
      conversationId: null,
      selectedConversationType: this.initialConversationType,
      showDetailedInfo: false,
      toneAttributes: {
        formality: 0.5,
        warmth: 0.7,
        directness: 0.6,
        complexity: 0.5,
        humor: 0.3,
        encouragement: 0.6
      },
      conversationTypes: [
        { label: 'General', value: 'GENERAL' },
        { label: 'Casual', value: 'CASUAL' },
        { label: 'Professional', value: 'PROFESSIONAL' },
        { label: 'Educational', value: 'EDUCATIONAL' },
        { label: 'Therapeutic', value: 'THERAPEUTIC' },
        { label: 'Creative', value: 'CREATIVE' },
        { label: 'Technical', value: 'TECHNICAL' }
      ]
    };
  },
  
  computed: {
    conversationStatusText() {
      if (!this.conversationId) {
        return 'No active conversation';
      }
      return `Active conversation: ${this.formatTime(this.conversationStartTime)}`;
    }
  },
  
  mounted() {
    this.startNewConversation();
    
    // Focus the input field
    this.$nextTick(() => {
      this.$refs.userInputField.focus();
    });
  },
  
  methods: {
    async startNewConversation() {
      this.loading = true;
      
      try {
        // Call backend to start a new conversation
        const response = await this.callCommunicationAPI('/api/communication/conversation/start', {
          type: this.selectedConversationType,
          userId: this.userId,
          initialContext: {
            source: 'CommunicationPanel',
            timestamp: Date.now()
          }
        });
        
        if (response && response.id) {
          this.conversationId = response.id;
          this.conversationStartTime = response.startTime;
          this.messages = [];
          
          // Add initial system message
          const welcomeMessage = this.generateWelcomeMessage();
          this.messages.push({
            text: welcomeMessage,
            sender: 'system',
            timestamp: Date.now(),
            intent: 'SOCIAL_GREETING'
          });
        } else {
          console.error('Failed to start conversation', response);
        }
      } catch (error) {
        console.error('Error starting conversation', error);
        this.addSystemErrorMessage('Failed to start a new conversation. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    
    generateWelcomeMessage() {
      const messages = [
        "Hello! How can I assist you today?",
        "Welcome to our conversation. What's on your mind?",
        "Hi there! I'm ready to chat when you are.",
        "Greetings! How are you feeling today?",
        "Hello! I'm here to support you. What would you like to talk about?"
      ];
      
      // Choose randomly
      return messages[Math.floor(Math.random() * messages.length)];
    },
    
    async sendMessage() {
      const message = this.userInput.trim();
      if (!message || this.loading) return;
      
      this.addUserMessage(message);
      this.userInput = '';
      
      // Auto-scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      this.loading = true;
      
      try {
        // Call backend API to process message
        const response = await this.callCommunicationAPI('/api/communication/process', {
          userMessage: message,
          conversationId: this.conversationId,
          additionalContext: {
            selectedConversationType: this.selectedConversationType
          }
        });
        
        if (response && response.text) {
          this.addSystemMessage(response);
        } else {
          console.error('Invalid response', response);
          this.addSystemErrorMessage('I encountered an issue processing your message. Please try again.');
        }
      } catch (error) {
        console.error('Error sending message', error);
        this.addSystemErrorMessage('Sorry, I couldn\'t process your message. Please try again.');
      } finally {
        this.loading = false;
        
        // Focus back on input
        this.$nextTick(() => {
          this.$refs.userInputField.focus();
        });
      }
    },
    
    addUserMessage(text) {
      this.messages.push({
        text,
        sender: 'user',
        timestamp: Date.now()
      });
    },
    
    addSystemMessage(response) {
      const message = {
        text: response.text,
        sender: 'system',
        timestamp: response.timestamp || Date.now(),
        intent: response.intent || 'UNKNOWN',
        responseMode: response.responseMode || 'INFORMATIONAL'
      };
      
      // Add emotional recognition data if available
      if (response.emotionalRecognition) {
        const lastUserMessage = [...this.messages].reverse().find(m => m.sender === 'user');
        if (lastUserMessage) {
          lastUserMessage.emotion = {
            name: response.emotionalRecognition.primaryEmotion,
            confidence: response.emotionalRecognition.confidenceScore,
            description: response.emotionalRecognition.description || '',
            emoji: this.getEmotionEmoji(response.emotionalRecognition.primaryEmotion)
          };
        }
      }
      
      this.messages.push(message);
      
      // Auto-scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    addSystemErrorMessage(text) {
      this.messages.push({
        text,
        sender: 'system',
        timestamp: Date.now(),
        error: true
      });
      
      // Auto-scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // Simulated API call - in real implementation, this would make an actual HTTP request
    async callCommunicationAPI(endpoint, data) {
      // This is a simulation for demo purposes
      // In a real app, this would be an actual API call
      console.log('API call to:', endpoint, data);
      
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          try {
            if (endpoint === '/api/communication/conversation/start') {
              resolve({
                id: `conv_${Date.now()}`,
                startTime: Date.now(),
                type: data.type,
                userId: data.userId
              });
            } else if (endpoint === '/api/communication/process') {
              // Simulate response based on input
              const userMessage = data.userMessage.toLowerCase();
              
              let responseText = 'I understand. Can you tell me more?';
              let intent = 'INFORMATION';
              let responseMode = 'INFORMATIONAL';
              
              // Very simple response simulation
              if (userMessage.includes('hello') || userMessage.includes('hi')) {
                responseText = 'Hello! How are you feeling today?';
                intent = 'SOCIAL_GREETING';
                responseMode = 'SOCIAL';
              } else if (userMessage.includes('?')) {
                responseText = 'That\'s an interesting question. The answer depends on several factors. Let\'s explore this topic together.';
                intent = 'QUERY_GENERAL';
                responseMode = 'INFORMATIONAL';
              } else if (userMessage.includes('sad') || userMessage.includes('unhappy') || userMessage.includes('depressed')) {
                responseText = 'I hear that you\'re feeling down. That\'s completely understandable. Would it help to talk more about what\'s causing these feelings?';
                intent = 'EMOTIONAL_NEGATIVE';
                responseMode = 'EMPATHIC_NEGATIVE';
              } else if (userMessage.includes('happy') || userMessage.includes('great') || userMessage.includes('wonderful')) {
                responseText = 'I\'m so glad to hear you\'re feeling positive! What specifically has been bringing you joy?';
                intent = 'EMOTIONAL_POSITIVE';
                responseMode = 'EMPATHIC_POSITIVE';
              } else if (userMessage.includes('help')) {
                responseText = 'I\'m here to help. Let\'s break down what you\'re experiencing and work through it together.';
                intent = 'SUPPORT_REQUEST';
                responseMode = 'SUPPORTIVE';
              } else if (userMessage.includes('thank')) {
                responseText = 'You\'re welcome! I\'m glad I could be of assistance.';
                intent = 'SOCIAL_GRATITUDE';
                responseMode = 'SOCIAL';
              } else if (userMessage.includes('bye') || userMessage.includes('goodbye')) {
                responseText = 'Take care! Remember I\'m here whenever you need to talk.';
                intent = 'SOCIAL_FAREWELL';
                responseMode = 'SOCIAL';
              }
              
              // Generate emotional recognition
              let emotion = 'NEUTRAL';
              let emotionConfidence = 0.7;
              
              if (userMessage.includes('sad') || userMessage.includes('unhappy') || userMessage.includes('depressed')) {
                emotion = 'SADNESS';
                emotionConfidence = 0.85;
              } else if (userMessage.includes('happy') || userMessage.includes('great') || userMessage.includes('wonderful')) {
                emotion = 'JOY';
                emotionConfidence = 0.9;
              } else if (userMessage.includes('angry') || userMessage.includes('mad') || userMessage.includes('upset')) {
                emotion = 'ANGER';
                emotionConfidence = 0.8;
              } else if (userMessage.includes('afraid') || userMessage.includes('scared') || userMessage.includes('fear')) {
                emotion = 'FEAR';
                emotionConfidence = 0.75;
              } else if (userMessage.includes('confused') || userMessage.includes('unsure')) {
                emotion = 'CONFUSION';
                emotionConfidence = 0.7;
              }
              
              resolve({
                messageId: `msg_${Date.now()}`,
                text: responseText,
                timestamp: Date.now(),
                intent: intent,
                responseMode: responseMode,
                emotionalRecognition: {
                  primaryEmotion: emotion,
                  confidenceScore: emotionConfidence,
                  description: `Detected ${emotion.toLowerCase()} in your message.`
                }
              });
            } else {
              reject(new Error('Unknown endpoint'));
            }
          } catch (err) {
            reject(err);
          }
        }, 1000); // 1 second delay
      });
    },
    
    updateConversationContext() {
      // In a real implementation, this would update the backend about the changed context
      console.log('Conversation context updated:', this.selectedConversationType);
    },
    
    toggleDetailedInfo() {
      this.showDetailedInfo = !this.showDetailedInfo;
    },
    
    async updateTone(attribute, event) {
      const value = event.target.value / 100;
      this.toneAttributes[attribute] = value;
      
      // In a real implementation, this would call the backend to update tone preferences
      console.log('Tone updated:', attribute, value);
      
      try {
        // Simulated API call to update tone preference
        // await this.callCommunicationAPI('/api/communication/tone/update', {
        //   attribute,
        //   level: value,
        //   strength: 0.5
        // });
      } catch (error) {
        console.error('Error updating tone preference', error);
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    formatToneAttribute(attr) {
      // Convert camelCase to Title Case with spaces
      return attr
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
    },
    
    formatIntent(intent) {
      if (!intent) return '';
      
      // Remove prefix and convert to Title Case
      return intent
        .replace(/(QUERY_|COMMAND_|SOCIAL_|EMOTIONAL_)/, '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
    },
    
    getEmotionEmoji(emotion) {
      if (!emotion) return '😐';
      
      const emotionMap = {
        'SADNESS': '😢',
        'JOY': '😊',
        'ANGER': '😠',
        'FEAR': '😨',
        'SURPRISE': '😲',
        'DISGUST': '🤢',
        'CONFUSION': '🤔',
        'EXCITEMENT': '😃',
        'DISAPPOINTMENT': '😞',
        'FRUSTRATION': '😤',
        'ANXIETY': '😰',
        'CONTENTMENT': '😌',
        'GRIEF': '😭',
        'WORRY': '😟',
        'NEUTRAL': '😐'
      };
      
      return emotionMap[emotion] || '😐';
    },
    
    scrollToBottom() {
      const container = this.$refs.conversationContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
.communication-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  padding: 12px 16px;
  background-color: #2c3e50;
  color: white;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.tone-controls {
  margin-top: 10px;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
}

.tone-label {
  margin-bottom: 5px;
  font-weight: 500;
}

.tone-sliders {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tone-slider {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 150px;
}

.tone-slider label {
  min-width: 80px;
  font-size: 0.75rem;
}

.tone-slider input {
  width: 80px;
  height: 4px;
}

.tone-value {
  font-size: 0.7rem;
  width: 30px;
  text-align: right;
}

.conversation-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #ffffff;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.message {
  display: flex;
  margin-bottom: 8px;
  max-width: 80%;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message.system {
  align-self: flex-start;
}

.message-content {
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background-color: #3498db;
  color: white;
  border-top-right-radius: 2px;
}

.message.system .message-content {
  background-color: #ecf0f1;
  color: #34495e;
  border-top-left-radius: 2px;
}

.message p {
  margin: 0;
  line-height: 1.4;
}

.message-metadata {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  margin-top: 4px;
  opacity: 0.7;
}

.timestamp {
  color: inherit;
}

.intent-badge {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.65rem;
}

.emotion-indicator {
  font-size: 0.8rem;
  margin-right: 10px;
  align-self: flex-end;
  margin-bottom: 4px;
  background-color: rgba(52, 152, 219, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}

.input-container {
  padding: 12px;
  background-color: #ecf0f1;
  border-top: 1px solid #dee2e6;
}

.conversation-context {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.conversation-context select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #cbd5e0;
  background-color: white;
  font-size: 0.9rem;
}

.context-button {
  padding: 6px 12px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-button:hover {
  background-color: #1e2b38;
}

.context-button.active {
  background-color: #e74c3c;
}

.message-input {
  display: flex;
  gap: 8px;
}

.message-input textarea {
  flex: 1;
  padding: 10px 14px;
  border-radius: 20px;
  border: 1px solid #cbd5e0;
  font-size: 0.95rem;
  resize: none;
  height: 45px;
  line-height: 1.4;
  outline: none;
  transition: border-color 0.2s;
}

.message-input textarea:focus {
  border-color: #3498db;
}

.message-input button {
  padding: 0 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-input button:hover:not(:disabled) {
  background-color: #2980b9;
}

.message-input button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #2c3e50;
  color: white;
  font-size: 0.8rem;
}

.new-conversation-btn {
  padding: 6px 12px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-conversation-btn:hover {
  background-color: #c0392b;
}

.conversation-status {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>




/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\CommunicationPanel.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\CommunicationPanel.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\CommunicationPanel.vue) --- */
<!-- Merged master for logical file: ui\components\CommunicationPanel
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\CommunicationPanel.vue (hash:A307840F750275AA55AEF564447AACB7EEB92A5C8DB8956DF25EED6AAA3EB888)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\CommunicationPanel.vue (hash:5374A6512254453FF3FE55F952CBA72AC657ACE35D721978A4A257532984D0D6)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\CommunicationPanel.vue | ext: .vue | sha: A307840F750275AA55AEF564447AACB7EEB92A5C8DB8956DF25EED6AAA3EB888 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\CommunicationPanel.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\CommunicationPanel.vue | ext: .vue | sha: 5374A6512254453FF3FE55F952CBA72AC657ACE35D721978A4A257532984D0D6 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\CommunicationPanel.vue --- */
<!-- Migrated and enhanced from sallie_1.00/ui/components/CommunicationPanel.vue -->
<template>
  <div class="communication-panel">
    <h2>Communication</h2>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'CommunicationPanel',
  props: {
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      analytics: [],
      error: ''
    };
  methods: {
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
  }
}
</script>
<style scoped>
.communication-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  padding: 2em;
  margin: 2em 0;
  color: var(--text-primary, #f8fafc);
</style>
