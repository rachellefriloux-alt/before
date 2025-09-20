/*
 * Persona: Tough love meets soul care.
 * Module: CopilotIntegration
 * Intent: Handle functionality for CopilotIntegration
 * Provenance-ID: 171ae55a-fc6a-4afa-a708-83c086024a19
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import axios from 'axios';
const COPILOT_API_KEY = process.env.COPILOT_API_KEY;

export async function callCopilot(prompt, mode, options = {}) {
  const response = await axios.post('https://api.githubcopilot.com/v1/chat', {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'Authorization': `Bearer ${COPILOT_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export async function generateCopilotCode(taskDescription, language = 'javascript') {
  const response = await axios.post('https://api.githubcopilot.com/v1/code', {
    task: taskDescription,
    language
  }, {
    headers: {
      'Authorization': `Bearer ${COPILOT_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export async function copilotTaskAutomation(task, context = {}) {
  const response = await axios.post('https://api.githubcopilot.com/v1/automation', {
    task,
    context
  }, {
    headers: {
      'Authorization': `Bearer ${COPILOT_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

// Optional Enhancements for Copilot
export async function copilotAdvancedChat(messages, options = {}) {
  return callCopilot(messages.map(m => m.content).join('\n'), 'advanced-chat', options);
}

export async function copilotCodeReview(code, options = {}) {
  return callCopilot(`Review this code: ${code}`, 'code-review', options);
}

export async function copilotSummarize(text, options = {}) {
  return callCopilot(`Summarize: ${text}`, 'summarize', options);
}

export async function copilotAgentAction(action, context = '', options = {}) {
  return callCopilot(`${context}\nAction: ${action}`, 'agent', options);
}
