/*
 * Persona: Tough love meets soul care.
 * Module: GPTIntegration
 * Intent: Handle functionality for GPTIntegration
 * Provenance-ID: cb961d31-e96c-4746-9664-c05707fd2b6e
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// GPT-5 Integration
import axios from 'axios';
const GPT_API_KEY = process.env.GPT_API_KEY;

export async function sendGPTMessage(message, options = {}) {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-5',
    messages: [{ role: 'user', content: message }],
    ...options
  }, {
    headers: {
      'Authorization': `Bearer ${GPT_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

// Optional Enhancements for GPT-5
export async function gptAdvancedChat(messages, options = {}) {
  return sendGPTMessage('', { messages, ...options });
}

export async function gptCreativeWriting(prompt, options = {}) {
  return sendGPTMessage(prompt, { model: 'gpt-5-creative', ...options });
}

export async function gptSummarize(text, options = {}) {
  return sendGPTMessage(`Summarize: ${text}`, options);
}

export async function gptCodeGeneration(taskDescription, language = 'javascript', options = {}) {
  return sendGPTMessage(`Code (${language}): ${taskDescription}`, options);
}

export async function gptAgentAction(action, context = '', options = {}) {
  return sendGPTMessage(`${context}\nAction: ${action}`, options);
}
