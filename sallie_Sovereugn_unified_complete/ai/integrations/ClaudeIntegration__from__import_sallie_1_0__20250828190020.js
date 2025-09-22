/*
 * Persona: Tough love meets soul care.
 * Module: ClaudeIntegration
 * Intent: Handle functionality for ClaudeIntegration
 * Provenance-ID: 41e987fe-9897-4b1b-9384-b2bb0c73b759
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import axios from 'axios';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

export async function callClaude(prompt, mode, options = {}) {
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

// Optional Enhancements for Claude
export async function claudeSummarize(text, options = {}) {
  return callClaude(`Summarize: ${text}`, 'summarize', options);
}

export async function claudeAdvancedReasoning(prompt, context = '', options = {}) {
  return callClaude(`${context}\n${prompt}`, 'reasoning', options);
}

export async function claudeToolUse(prompt, toolName, options = {}) {
  return callClaude(`Use tool ${toolName}: ${prompt}`, 'tool', options);
}
