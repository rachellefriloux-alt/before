<!-- Migrated and adapted from sallie_1.00/ui/components/ChatBubble.vue -->
<template>
  <div class="chat-bubble" :class="{ 'user': isUser, 'sallie': !isUser }">
    <span>{{ message }}</span>
  </div>
</template>
<script>
export default {
  props: {
    message: String,
    isUser: Boolean
  }
}
</script>
<style scoped>
.chat-bubble {
  padding: 1em;
  border-radius: 16px;
  margin: 0.5em 0;
  background: var(--background-tertiary, #334155);
  color: var(--text-primary, #f8fafc);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  max-width: 70%;
}
.chat-bubble.user {
  background: var(--sallie-accent, #06b6d4);
  color: #fff;
  align-self: flex-end;
}
.chat-bubble.sallie {
  background: var(--sallie-primary, #6366f1);
  color: #fff;
  align-self: flex-start;
}
</style>


<!-- Migrated and adapted from sallie_1.00/ui/components/ChatBubble.vue -->
<template>
  <div class="chat-bubble" :class="{ 'user': isUser, 'sallie': !isUser }">
    <span>{{ message }}</span>
  </div>
</template>
<script>
export default {
  props: {
    message: String,
    isUser: Boolean
  }
}
</script>
<style scoped>
.chat-bubble {
  padding: 1em;
  border-radius: 16px;
  margin: 0.5em 0;
  background: var(--background-tertiary, #334155);
  color: var(--text-primary, #f8fafc);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  max-width: 70%;
}
.chat-bubble.user {
  background: var(--sallie-accent, #06b6d4);
  color: #fff;
  align-self: flex-end;
}
.chat-bubble.sallie {
  background: var(--sallie-primary, #6366f1);
  color: #fff;
  align-self: flex-start;
}
</style>


<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Floating chat bubble interface for quick access to Sallie.
  Got it, love.
-->

<template>
  <div 
    class="chat-bubble-container" 
    :class="{ 'expanded': isExpanded, 'minimized': !isExpanded }"
    :style="bubblePosition"
  >
    <!-- Collapsed bubble mode -->
    <div v-if="!isExpanded" class="chat-bubble" @click="toggleExpand">
      <div class="bubble-avatar" :style="avatarStyle">
        <span v-if="hasNotification" class="notification-badge">{{ notificationCount }}</span>
      </div>
      <span class="bubble-pulse" v-if="isListening"></span>
    </div>
    
    <!-- Expanded chat interface -->
    <div v-else class="chat-interface">
      <!-- Header with controls -->
      <div class="chat-header">
        <div class="header-left">
          <div class="avatar" :style="avatarStyle"></div>
          <div class="status-info">
            <h3>{{ personaName }}</h3>
            <span class="status" :class="currentMood">{{ statusMessage }}</span>
          </div>
        </div>
        <div class="header-controls">
          <button class="control-btn minimize" @click="toggleExpand">
            <span class="icon">—</span>
          </button>
          <button class="control-btn video" @click="startVideoCall">
            <span class="icon">📹</span>
          </button>
          <button class="control-btn privacy" @click="togglePrivacyMode">
            <span class="icon">{{ privacyModeActive ? '🔒' : '👁️' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Chat messages area -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="(message, index) in visibleMessages" 
          :key="index"
          class="message"
          :class="message.sender"
        >
          <div class="message-content">
            <div v-if="message.content" v-html="message.content"></div>
            <div v-if="message.isTyping" class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
      
      <!-- Input area -->
      <div class="input-container">
        <button 
          class="voice-btn" 
          @click="toggleVoiceInput"
          :class="{ 'active': isListening }"
        >
          <span class="icon">🎤</span>
        </button>
        <textarea 
          class="message-input" 
          v-model="newMessage" 
          placeholder="Message Sallie..."
          @keydown.enter.prevent="sendMessage"
          ref="messageInput"
        ></textarea>
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!newMessage.trim()"
        >
          <span class="icon">➤</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatBubble',
  data() {
    return {
      isExpanded: false,
      newMessage: '',
      isListening: false,
      hasNotification: false,
      notificationCount: 0,
      privacyModeActive: false,
      personaName: 'Sallie',
      currentMood: 'balanced',
      statusMessage: 'Ready to help',
      messages: [],
      bubblePosition: {
        bottom: '80px',
        right: '20px'
      },
      avatarStyle: {
        backgroundImage: 'url("/assets/sallie-avatar.png")'
      },
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    };
  },
  computed: {
    visibleMessages() {
      // In privacy mode, show only essential messages
      if (this.privacyModeActive) {
        return this.messages.filter(m => m.isEssential);
      }
      return this.messages;
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      this.hasNotification = false;
      this.notificationCount = 0;
      
      if (this.isExpanded) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.$refs.messageInput?.focus();
        });
      }
    },
    
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      // Add user message
      this.messages.push({
        content: this.newMessage,
        sender: 'user',
        timestamp: new Date(),
        isEssential: false
      });
      
      // Clear input and scroll
      const sentMessage = this.newMessage;
      this.newMessage = '';
      this.scrollToBottom();
      
      // Add typing indicator
      this.messages.push({
        isTyping: true,
        sender: 'sallie',
        timestamp: new Date(),
        isEssential: false
      });
      
      // Simulate response (would be replaced with actual AI response)
      setTimeout(() => {
        // Remove typing indicator
        this.messages = this.messages.filter(m => !m.isTyping);
        
        // Add response
        this.messages.push({
          content: `I hear you about "${sentMessage}". Let me help with that, love.`,
          sender: 'sallie',
          timestamp: new Date(),
          isEssential: false
        });
        
        this.scrollToBottom();
      }, 1500);
    },
    
    toggleVoiceInput() {
      this.isListening = !this.isListening;
      // Would integrate with actual speech recognition
    },
    
    togglePrivacyMode() {
      this.privacyModeActive = !this.privacyModeActive;
      // Would trigger system-wide privacy mode
    },
    
    startVideoCall() {
      // Would launch video call interface
      this.$emit('start-video-call');
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$nextTick(() => {
          const container = this.$refs.messagesContainer;
          container.scrollTop = container.scrollHeight;
        });
      }
    },
    
    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    // For receiving new messages
    addMessage(message) {
      this.messages.push(message);
      
      if (!this.isExpanded) {
        this.hasNotification = true;
        this.notificationCount++;
      } else {
        this.scrollToBottom();
      }
    }
  }
};
</script>

<style scoped>
.chat-bubble-container {
  position: fixed;
  z-index: 1000;
  font-family: 'Roboto', sans-serif;
}

.chat-bubble {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #3a86ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.chat-bubble:hover {
  transform: scale(1.05);
}

.bubble-avatar {
  width: 54px;
  height: 54px;
  border-radius: 27px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  background-color: #ff3a5e;
  color: white;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.bubble-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: pulse 1.5s infinite;
}

.chat-interface {
  width: 320px;
  height: 480px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.header-left {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  margin-right: 10px;
}

.status-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status {
  font-size: 12px;
  color: #666;
}

.header-controls {
  display: flex;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background-color: transparent;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.messages-container {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 16px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #3a86ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.sallie {
  align-self: flex-start;
  background-color: #f1f1f1;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  position: absolute;
  bottom: -18px;
  right: 8px;
}

.message.sallie .message-time {
  color: #999;
  left: 8px;
  right: auto;
}

.input-container {
  padding: 12px;
  display: flex;
  align-items: center;
  border-top: 1px solid #eaeaea;
}

.voice-btn, .send-btn {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background-color: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-btn {
  margin-right: 8px;
}

.voice-btn.active {
  background-color: #ff3a5e;
  color: white;
  animation: pulse 1.5s infinite;
}

.send-btn {
  margin-left: 8px;
  background-color: #3a86ff;
  color: white;
}

.send-btn:disabled {
  background-color: #c7d2fe;
  cursor: not-allowed;
}

.message-input {
  flex: 1;
  border: 1px solid #eaeaea;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  max-height: 80px;
  overflow-y: auto;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: #3a86ff;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.4;
}

.typing-indicator span:nth-child(1) {
  animation: blink 1s infinite 0.3s;
}
.typing-indicator span:nth-child(2) {
  animation: blink 1s infinite 0.5s;
}
.typing-indicator span:nth-child(3) {
  animation: blink 1s infinite 0.7s;
}

@keyframes blink {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

@keyframes pulse {
  0% { 
    transform: scale(1);
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chat-interface {
    width: 280px;
    height: 420px;
  }
}
</style>


<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Floating chat bubble interface for quick access to Sallie.
  Got it, love.
-->

<template>
  <div 
    class="chat-bubble-container" 
    :class="{ 'expanded': isExpanded, 'minimized': !isExpanded }"
    :style="bubblePosition"
  >
    <!-- Collapsed bubble mode -->
    <div v-if="!isExpanded" class="chat-bubble" @click="toggleExpand">
      <div class="bubble-avatar" :style="avatarStyle">
        <span v-if="hasNotification" class="notification-badge">{{ notificationCount }}</span>
      </div>
      <span class="bubble-pulse" v-if="isListening"></span>
    </div>
    
    <!-- Expanded chat interface -->
    <div v-else class="chat-interface">
      <!-- Header with controls -->
      <div class="chat-header">
        <div class="header-left">
          <div class="avatar" :style="avatarStyle"></div>
          <div class="status-info">
            <h3>{{ personaName }}</h3>
            <span class="status" :class="currentMood">{{ statusMessage }}</span>
          </div>
        </div>
        <div class="header-controls">
          <button class="control-btn minimize" @click="toggleExpand">
            <span class="icon">—</span>
          </button>
          <button class="control-btn video" @click="startVideoCall">
            <span class="icon">📹</span>
          </button>
          <button class="control-btn privacy" @click="togglePrivacyMode">
            <span class="icon">{{ privacyModeActive ? '🔒' : '👁️' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Chat messages area -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="(message, index) in visibleMessages" 
          :key="index"
          class="message"
          :class="message.sender"
        >
          <div class="message-content">
            <div v-if="message.content" v-html="message.content"></div>
            <div v-if="message.isTyping" class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
      
      <!-- Input area -->
      <div class="input-container">
        <button 
          class="voice-btn" 
          @click="toggleVoiceInput"
          :class="{ 'active': isListening }"
        >
          <span class="icon">🎤</span>
        </button>
        <textarea 
          class="message-input" 
          v-model="newMessage" 
          placeholder="Message Sallie..."
          @keydown.enter.prevent="sendMessage"
          ref="messageInput"
        ></textarea>
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!newMessage.trim()"
        >
          <span class="icon">➤</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatBubble',
  data() {
    return {
      isExpanded: false,
      newMessage: '',
      isListening: false,
      hasNotification: false,
      notificationCount: 0,
      privacyModeActive: false,
      personaName: 'Sallie',
      currentMood: 'balanced',
      statusMessage: 'Ready to help',
      messages: [],
      bubblePosition: {
        bottom: '80px',
        right: '20px'
      },
      avatarStyle: {
        backgroundImage: 'url("/assets/sallie-avatar.png")'
      },
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    };
  },
  computed: {
    visibleMessages() {
      // In privacy mode, show only essential messages
      if (this.privacyModeActive) {
        return this.messages.filter(m => m.isEssential);
      }
      return this.messages;
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      this.hasNotification = false;
      this.notificationCount = 0;
      
      if (this.isExpanded) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.$refs.messageInput?.focus();
        });
      }
    },
    
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      // Add user message
      this.messages.push({
        content: this.newMessage,
        sender: 'user',
        timestamp: new Date(),
        isEssential: false
      });
      
      // Clear input and scroll
      const sentMessage = this.newMessage;
      this.newMessage = '';
      this.scrollToBottom();
      
      // Add typing indicator
      this.messages.push({
        isTyping: true,
        sender: 'sallie',
        timestamp: new Date(),
        isEssential: false
      });
      
      // Simulate response (would be replaced with actual AI response)
      setTimeout(() => {
        // Remove typing indicator
        this.messages = this.messages.filter(m => !m.isTyping);
        
        // Add response
        this.messages.push({
          content: `I hear you about "${sentMessage}". Let me help with that, love.`,
          sender: 'sallie',
          timestamp: new Date(),
          isEssential: false
        });
        
        this.scrollToBottom();
      }, 1500);
    },
    
    toggleVoiceInput() {
      this.isListening = !this.isListening;
      // Would integrate with actual speech recognition
    },
    
    togglePrivacyMode() {
      this.privacyModeActive = !this.privacyModeActive;
      // Would trigger system-wide privacy mode
    },
    
    startVideoCall() {
      // Would launch video call interface
      this.$emit('start-video-call');
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$nextTick(() => {
          const container = this.$refs.messagesContainer;
          container.scrollTop = container.scrollHeight;
        });
      }
    },
    
    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    // For receiving new messages
    addMessage(message) {
      this.messages.push(message);
      
      if (!this.isExpanded) {
        this.hasNotification = true;
        this.notificationCount++;
      } else {
        this.scrollToBottom();
      }
    }
  }
};
</script>

<style scoped>
.chat-bubble-container {
  position: fixed;
  z-index: 1000;
  font-family: 'Roboto', sans-serif;
}

.chat-bubble {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #3a86ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.chat-bubble:hover {
  transform: scale(1.05);
}

.bubble-avatar {
  width: 54px;
  height: 54px;
  border-radius: 27px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  background-color: #ff3a5e;
  color: white;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.bubble-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: pulse 1.5s infinite;
}

.chat-interface {
  width: 320px;
  height: 480px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.header-left {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  margin-right: 10px;
}

.status-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status {
  font-size: 12px;
  color: #666;
}

.header-controls {
  display: flex;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background-color: transparent;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.messages-container {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 16px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #3a86ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.sallie {
  align-self: flex-start;
  background-color: #f1f1f1;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  position: absolute;
  bottom: -18px;
  right: 8px;
}

.message.sallie .message-time {
  color: #999;
  left: 8px;
  right: auto;
}

.input-container {
  padding: 12px;
  display: flex;
  align-items: center;
  border-top: 1px solid #eaeaea;
}

.voice-btn, .send-btn {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background-color: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-btn {
  margin-right: 8px;
}

.voice-btn.active {
  background-color: #ff3a5e;
  color: white;
  animation: pulse 1.5s infinite;
}

.send-btn {
  margin-left: 8px;
  background-color: #3a86ff;
  color: white;
}

.send-btn:disabled {
  background-color: #c7d2fe;
  cursor: not-allowed;
}

.message-input {
  flex: 1;
  border: 1px solid #eaeaea;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  max-height: 80px;
  overflow-y: auto;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: #3a86ff;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.4;
}

.typing-indicator span:nth-child(1) {
  animation: blink 1s infinite 0.3s;
}
.typing-indicator span:nth-child(2) {
  animation: blink 1s infinite 0.5s;
}
.typing-indicator span:nth-child(3) {
  animation: blink 1s infinite 0.7s;
}

@keyframes blink {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

@keyframes pulse {
  0% { 
    transform: scale(1);
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chat-interface {
    width: 280px;
    height: 420px;
  }
}
</style>


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ui\components\ChatBubble.vue) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\ChatBubble.vue) */
/* --- dest (C:\Users\chell\Desktop\newsal\ui\components\ChatBubble.vue) --- */
<!-- Merged master for logical file: ui\components\ChatBubble
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\ChatBubble.vue (hash:C9825349CCF4DD11E0F651C76CA2BCFBB5E515B02206BA4F68029E27D46161C9)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\ChatBubble.vue (hash:6FE5F560732D86B1F5274AF66A2C2AE11FBE5D0CCF94148696EA835A74202671)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ui\components\ChatBubble.vue | ext: .vue | sha: C9825349CCF4DD11E0F651C76CA2BCFBB5E515B02206BA4F68029E27D46161C9 ---- -->
[BINARY FILE - original copied to merged_sources: ui\components\ChatBubble.vue]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ui\components\ChatBubble.vue | ext: .vue | sha: 6FE5F560732D86B1F5274AF66A2C2AE11FBE5D0CCF94148696EA835A74202671 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ui\components\ChatBubble.vue --- */
<!-- Migrated and adapted from sallie_1.00/ui/components/ChatBubble.vue -->
<template>
  <div class="chat-bubble" :class="{ 'user': isUser, 'sallie': !isUser }">
    <span>{{ message }}</span>
  </div>
</template>
<script>
export default {
  props: {
    message: String,
    isUser: Boolean
  }
}
</script>
<style scoped>
.chat-bubble {
  padding: 1em;
  border-radius: 16px;
  margin: 0.5em 0;
  background: var(--background-tertiary, #334155);
  color: var(--text-primary, #f8fafc);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  max-width: 70%;
.chat-bubble.user {
  background: var(--sallie-accent, #06b6d4);
  color: #fff;
  align-self: flex-end;
.chat-bubble.sallie {
  background: var(--sallie-primary, #6366f1);
  align-self: flex-start;
</style>
