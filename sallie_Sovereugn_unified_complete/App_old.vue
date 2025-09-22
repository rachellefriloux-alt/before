<template>
  <div id="app">
    <div class="container">
      <!-- Header with Salle branding -->
      <header class="app-header">
        <div class="brand-section">
          <h1 class="brand-name">Salle 1.0</h1>
          <p class="brand-tagline">Your backup brain, business partner, and editor.</p>
        </div>
      </header>

      <!-- Main content area -->
      <main class="main-content">
        <!-- Quick input field -->
        <div class="input-section">
          <textarea
            v-model="userInput"
            placeholder="What do you need, love? Ask me anything or just capture a quick thought..."
            class="main-input"
            @keydown.ctrl.enter="processInput"
          ></textarea>
          <button @click="processInput" class="process-btn" :disabled="!userInput.trim()">
            Got it, love
          </button>
        </div>

        <!-- Response area -->
        <div v-if="currentResponse" class="response-section">
          <div class="response-content" v-html="currentResponse"></div>
        </div>

        <!-- Quick capture list -->
        <div class="quick-capture">
          <h3>Quick Capture</h3>
          <ul v-if="capturedItems.length > 0">
            <li v-for="(item, index) in capturedItems" :key="index" class="captured-item">
              {{ item.text }}
              <button @click="removeCapture(index)" class="remove-btn">×</button>
            </li>
          </ul>
          <p v-else class="empty-state">Nothing captured yet. Your thoughts, safe and sound when you're ready.</p>
        </div>

        <!-- Persona switcher -->
        <div class="persona-section">
          <h3>Current Mode</h3>
          <select v-model="currentPersona" @change="switchPersona" class="persona-select">
            <option value="grace-grind">Grace & Grind</option>
            <option value="southern-grit">Southern Grit</option>
            <option value="hustle-legacy">Hustle Legacy</option>
            <option value="soul-care">Soul Care</option>
            <option value="quiet-power">Quiet Power</option>
            <option value="midnight-hustle">Midnight Hustle</option>
          </select>
        </div>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <p>&copy; 2024 Salle 1.0 - Built with tough love meets soul care</p>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SalleApp',
  data() {
    return {
      userInput: '',
      currentResponse: '',
      capturedItems: [],
      currentPersona: 'grace-grind',
      isProcessing: false
    }
  },
  methods: {
    async processInput() {
      if (!this.userInput.trim() || this.isProcessing) return;
      
      this.isProcessing = true;
      const input = this.userInput.trim();
      
      try {
        // Check if it's a quick capture (no question, just a statement)
        if (this.isQuickCapture(input)) {
          this.addToCapture(input);
          this.currentResponse = "Captured that for you, love. Safe and sound.";
        } else {
          // Process as a full AI request
          this.currentResponse = await this.handleUserAction(input);
        }
      } catch (error) {
        this.currentResponse = "Something went sideways, but we're handling it. Try again, love.";
      } finally {
        this.userInput = '';
        this.isProcessing = false;
      }
    },

    isQuickCapture(input) {
      // Simple heuristic: if it doesn't end with ?, doesn't contain command words, treat as capture
      const commandWords = ['call', 'text', 'open', 'set', 'find', 'search', 'write', 'draft', 'help'];
      const hasCommand = commandWords.some(word => input.toLowerCase().includes(word));
      const isQuestion = input.includes('?') || input.toLowerCase().startsWith('what') || 
                        input.toLowerCase().startsWith('how') || input.toLowerCase().startsWith('why');
      
      return !hasCommand && !isQuestion && input.length < 200;
    },

    addToCapture(text) {
      this.capturedItems.unshift({
        text,
        timestamp: new Date()
      });
      // Keep only last 50 items
      if (this.capturedItems.length > 50) {
        this.capturedItems.pop();
      }
      this.saveCaptures();
    },

    removeCapture(index) {
      this.capturedItems.splice(index, 1);
      this.saveCaptures();
    },

    async handleUserAction(input) {
      // This would normally call the AI service
      // For now, return a sample response based on persona
      const responses = {
        'grace-grind': "I hear you, love. Let's tackle this with both grace and grit.",
        'southern-grit': "Honey, we're gonna handle this like the strong woman you are.",
        'hustle-legacy': "Time to make moves that matter. Legacy building starts now.",
        'soul-care': "First things first - how are YOU doing? Let's take care of that soul.",
        'quiet-power': "Sometimes the strongest move is the quiet one. Let's think this through.",
        'midnight-hustle': "When the world's asleep, that's when we do our best work."
      };
      
      return responses[this.currentPersona] || responses['grace-grind'];
    },

    switchPersona() {
      // Update UI theme based on persona
      document.body.className = `persona-${this.currentPersona}`;
      localStorage.setItem('currentPersona', this.currentPersona);
    },

    saveCaptures() {
      localStorage.setItem('quickCaptures', JSON.stringify(this.capturedItems));
    },

    loadCaptures() {
      const saved = localStorage.getItem('quickCaptures');
      if (saved) {
        this.capturedItems = JSON.parse(saved);
      }
    },

    loadPersona() {
      const saved = localStorage.getItem('currentPersona');
      if (saved) {
        this.currentPersona = saved;
        this.switchPersona();
      }
    }
  },

  mounted() {
    this.loadCaptures();
    this.loadPersona();
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', 'Helvetica', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.brand-name {
  font-size: 3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-tagline {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
}

.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.input-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.main-input {
  width: 100%;
  height: 120px;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.1rem;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
}

.main-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.process-btn {
  margin-top: 15px;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.process-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.process-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.response-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.quick-capture,
.persona-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.quick-capture h3,
.persona-section h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.captured-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.remove-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.persona-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.empty-state {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.app-footer {
  margin-top: 40px;
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive design */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .brand-name {
    font-size: 2rem;
  }

  .container {
    padding: 15px;
  }
}

/* Persona-based themes */
body.persona-grace-grind {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}

body.persona-southern-grit {
  --primary-color: #d4a574;
  --secondary-color: #8b4513;
}

body.persona-hustle-legacy {
  --primary-color: #ff6b6b;
  --secondary-color: #ee5a52;
}

body.persona-soul-care {
  --primary-color: #4ecdc4;
  --secondary-color: #44a08d;
}

body.persona-quiet-power {
  --primary-color: #6c5ce7;
  --secondary-color: #5f3dc4;
}

body.persona-midnight-hustle {
  --primary-color: #2d3436;
  --secondary-color: #636e72;
}
</style>