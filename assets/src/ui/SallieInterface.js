/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User interface management and interaction handling.
 * Got it, love.
 */

export class SallieInterface {
  constructor() {
    this.initialized = false;
    this.elements = {};
    this.onUserMessage = null;
    this.onValuesChange = null;
    this.typingIndicatorVisible = false;
    this.valuesVisible = false;
  }

  async initialize() {
    try {
      this.bindElements();
      this.attachEventListeners();
      this.setupAutoResize();
      this.initialized = true;
      console.log('🎨 Sallie interface initialized');
    } catch (error) {
      console.error('Failed to initialize Sallie interface:', error);
      throw error;
    }
  }

  bindElements() {
    // Core elements
    this.elements.statusIndicator = document.getElementById('status-indicator');
    this.elements.statusText = document.getElementById('status-text');
    this.elements.conversation = document.getElementById('conversation');
    this.elements.messageForm = document.getElementById('message-form');
    this.elements.messageInput = document.getElementById('message-input');
    this.elements.sendButton = document.getElementById('send-button');
    this.elements.typingIndicator = document.getElementById('typing-indicator');
    this.elements.valuesPanel = document.getElementById('values-panel');
    this.elements.valuesToggle = document.getElementById('values-toggle');
  }

  attachEventListeners() {
    if (this.elements.messageForm) {
      this.elements.messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleMessageSubmit();
      });
    }

    if (this.elements.sendButton) {
      this.elements.sendButton.addEventListener('click', () => {
        this.handleMessageSubmit();
      });
    }

    if (this.elements.valuesToggle) {
      this.elements.valuesToggle.addEventListener('click', () => {
        this.toggleValuesPanel();
      });
    }

    if (this.elements.messageInput) {
      this.elements.messageInput.addEventListener('input', () => {
        this.updateSendButtonState();
      });

      this.elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleMessageSubmit();
        }
      });
    }
  }

  setupAutoResize() {
    if (this.elements.messageInput) {
      this.elements.messageInput.addEventListener('input', () => {
        this.autoResizeTextarea();
      });
    }
  }

  autoResizeTextarea() {
    const textarea = this.elements.messageInput;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }

  handleMessageSubmit() {
    const input = this.elements.messageInput;
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    input.value = '';

    this.autoResizeTextarea();
    this.updateSendButtonState();

    if (this.onUserMessage) {
      this.onUserMessage(message);
    }
  }

  updateSendButtonState() {
    const input = this.elements.messageInput;
    const button = this.elements.sendButton;

    if (input && button) {
      const hasContent = input.value.trim().length > 0;
      button.disabled = !hasContent;
      button.classList.toggle('active', hasContent);
    }
  }

  showTypingIndicator() {
    if (this.elements.typingIndicator && !this.typingIndicatorVisible) {
      this.elements.typingIndicator.style.display = 'block';
      this.typingIndicatorVisible = true;
    }
  }

  hideTypingIndicator() {
    if (this.elements.typingIndicator && this.typingIndicatorVisible) {
      this.elements.typingIndicator.style.display = 'none';
      this.typingIndicatorVisible = false;
    }
  }

  addMessage(message, isUser = false) {
    if (!this.elements.conversation) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'sallie-message'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;

    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = new Date().toLocaleTimeString();

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timestampDiv);

    this.elements.conversation.appendChild(messageDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.elements.conversation) {
      this.elements.conversation.scrollTop = this.elements.conversation.scrollHeight;
    }
  }

  updateStatus(status, message) {
    if (this.elements.statusIndicator) {
      this.elements.statusIndicator.className = `status-indicator ${status}`;
    }

    if (this.elements.statusText) {
      this.elements.statusText.textContent = message;
    }
  }

  toggleValuesPanel() {
    this.valuesVisible = !this.valuesVisible;

    if (this.elements.valuesPanel) {
      this.elements.valuesPanel.style.display = this.valuesVisible ? 'block' : 'none';
    }

    if (this.elements.valuesToggle) {
      this.elements.valuesToggle.textContent = this.valuesVisible ? 'Hide Values' : 'Show Values';
    }
  }

  setMessageHandler(handler) {
    this.onUserMessage = handler;
  }

  setValuesChangeHandler(handler) {
    this.onValuesChange = handler;
  }

  isInitialized() {
    return this.initialized;
  }
}
                                                                                                                                                                                                                             