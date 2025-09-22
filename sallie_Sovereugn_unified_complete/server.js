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
                                         