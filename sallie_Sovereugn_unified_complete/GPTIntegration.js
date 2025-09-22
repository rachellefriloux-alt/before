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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ai\integrations\GPTIntegration.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\GPTIntegration.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ai\integrations\GPTIntegration.js) --- */
/* Merged master for logical file: ai\integrations\GPTIntegration
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\GPTIntegration.js (hash:C4AB632C42D285F03CECFDF17387ED6285EA49D621B39D5661BC3553D62BB874)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\GPTIntegration.js (hash:3C8F881F33A8862FBC3502A832DB7894FADC4E35328AA2F05CB769FFBE3478C4)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\GPTIntegration.js | ext: .js | sha: C4AB632C42D285F03CECFDF17387ED6285EA49D621B39D5661BC3553D62BB874 ---- */
[BINARY FILE - original copied to merged_sources: ai\integrations\GPTIntegration.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\GPTIntegration.js | ext: .js | sha: 3C8F881F33A8862FBC3502A832DB7894FADC4E35328AA2F05CB769FFBE3478C4 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\GPTIntegration.js --- */
// Optional Enhancements for GPT-5
export async function gptAdvancedChat(messages, options = {}) {
  return sendGPTMessage('', { messages, ...options });
}
export async function gptCreativeWriting(prompt, options = {}) {
  return sendGPTMessage(prompt, { model: 'gpt-5-creative', ...options });
export async function gptSummarize(text, options = {}) {
  return sendGPTMessage(`Summarize: ${text}`, options);
export async function gptCodeGeneration(taskDescription, language = 'javascript', options = {}) {
  return sendGPTMessage(`Code (${language}): ${taskDescription}`, options);
export async function gptAgentAction(action, context = '', options = {}) {
  return sendGPTMessage(`${context}\nAction: ${action}`, options);
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
