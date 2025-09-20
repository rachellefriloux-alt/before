/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Express server for serving the Sallie interface.
 * Got it, love.
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static('.'));
app.use(express.json({ limit: '10mb' }));

// Serve the main application
app.get('/', (req, res) => {
  // Read the HTML file and inject the API key
  const fs = require('fs');
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  // Inject API key availability (but not the key itself for security)
  const apiKeyAvailable = !!process.env.OPENAI_API_KEY;
  html = html.replace('</head>', `
    <script>
      window.API_KEY_AVAILABLE = ${apiKeyAvailable};
    </script>
  </head>`);

  res.send(html);
});

// API endpoints
app.post('/api/chat', (req, res) => {
  // Handle chat requests
  const { message, context } = req.body;

  try {
    // Basic message processing
    const processedMessage = message.toLowerCase().trim();

    let response = 'Got it, love. I\'m processing your message.';

    // Simple response logic based on message content
    if (processedMessage.includes('hello') || processedMessage.includes('hi')) {
      response = 'Hello! How are you feeling today?';
    } else if (processedMessage.includes('how are you')) {
      response = 'I\'m doing well, thank you for asking. How can I support you today?';
    } else if (processedMessage.includes('help')) {
      response = 'I\'m here to help. What would you like assistance with?';
    } else if (processedMessage.includes('thank')) {
      response = 'You\'re welcome! Is there anything else I can do for you?';
    } else if (processedMessage.includes('mood') || processedMessage.includes('feeling')) {
      response = 'I understand you\'re sharing about your feelings. Would you like to talk more about that?';
    } else if (processedMessage.length > 100) {
      response = 'That\'s quite a detailed message. Let me think about how to best respond to that.';
    } else if (processedMessage.includes('?')) {
      response = 'That\'s a great question. Let me provide some thoughts on that.';
    }

    // Add context awareness if available
    if (context && context.userName) {
      response = response.replace('you', context.userName);
    }

    res.json({
      response,
      timestamp: Date.now(),
      messageId: generateMessageId(),
      sentiment: analyzeSentiment(processedMessage)
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      error: 'Sorry, I encountered an error processing your message.',
      timestamp: Date.now()
    });
  }
});

// Helper functions
function generateMessageId() {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function analyzeSentiment(message) {
  // Simple sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'wonderful', 'amazing', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'sad', 'angry', 'hate', 'awful', 'horrible', 'disappointed'];

  const words = message.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Start server
app.listen(PORT, () => {
  // Server started
});
                                         