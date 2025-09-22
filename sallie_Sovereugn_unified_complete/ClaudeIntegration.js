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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ai\integrations\ClaudeIntegration.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\ClaudeIntegration.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ai\integrations\ClaudeIntegration.js) --- */
/* Merged master for logical file: ai\integrations\ClaudeIntegration
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\ClaudeIntegration.js (hash:2F1081516E92A445DC7ABF29806D19DE07A66C3D56A71050A8D7EE0C35DC1B0B)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\ClaudeIntegration.js (hash:B5E1706FF6B8C870DD857ABAC362113F792C26096E7F7C8C513ACA1182ACC5F2)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\ClaudeIntegration.js | ext: .js | sha: 2F1081516E92A445DC7ABF29806D19DE07A66C3D56A71050A8D7EE0C35DC1B0B ---- */
[BINARY FILE - original copied to merged_sources: ai\integrations\ClaudeIntegration.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\ClaudeIntegration.js | ext: .js | sha: B5E1706FF6B8C870DD857ABAC362113F792C26096E7F7C8C513ACA1182ACC5F2 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\ClaudeIntegration.js --- */
// Optional Enhancements for Claude
export async function claudeSummarize(text, options = {}) {
  return callClaude(`Summarize: ${text}`, 'summarize', options);
}
export async function claudeAdvancedReasoning(prompt, context = '', options = {}) {
  return callClaude(`${context}\n${prompt}`, 'reasoning', options);
export async function claudeToolUse(prompt, toolName, options = {}) {
  return callClaude(`Use tool ${toolName}: ${prompt}`, 'tool', options);
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
