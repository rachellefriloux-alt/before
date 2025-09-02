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
      console.log('Sallie server initialized - API key available:', ${apiKeyAvailable});
    </script>
  </head>`);

  res.send(html);
});

// API endpoints
app.post('/api/chat', (req, res) => {
  // Handle chat requests
  const { message, context } = req.body;

  // Placeholder response - integrate with actual AI logic
  res.json({
    response: 'Got it, love. I\'m processing your message.',
    timestamp: Date.now()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Sallie server running on port ${PORT}`);
  console.log('Got it, love. Ready to help!');
});
                                         