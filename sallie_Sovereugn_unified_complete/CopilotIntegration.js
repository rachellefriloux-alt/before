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


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ai\integrations\CopilotIntegration.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\CopilotIntegration.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ai\integrations\CopilotIntegration.js) --- */
/* Merged master for logical file: ai\integrations\CopilotIntegration
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\CopilotIntegration.js (hash:71186CFF3255FF3B93B04D9B23F2121E597CEEAEE2012F43BC1FDD73123DC892)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\CopilotIntegration.js (hash:ECC43218DE04EC82F5CDCB8736BC0BC60C91F39443FF29ED19817080AE302674)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\CopilotIntegration.js | ext: .js | sha: 71186CFF3255FF3B93B04D9B23F2121E597CEEAEE2012F43BC1FDD73123DC892 ---- */
[BINARY FILE - original copied to merged_sources: ai\integrations\CopilotIntegration.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\CopilotIntegration.js | ext: .js | sha: ECC43218DE04EC82F5CDCB8736BC0BC60C91F39443FF29ED19817080AE302674 ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\CopilotIntegration.js --- */
// Optional Enhancements for Copilot
export async function copilotAdvancedChat(messages, options = {}) {
  return callCopilot(messages.map(m => m.content).join('\n'), 'advanced-chat', options);
}
export async function copilotCodeReview(code, options = {}) {
  return callCopilot(`Review this code: ${code}`, 'code-review', options);
export async function copilotSummarize(text, options = {}) {
  return callCopilot(`Summarize: ${text}`, 'summarize', options);
export async function copilotAgentAction(action, context = '', options = {}) {
  return callCopilot(`${context}\nAction: ${action}`, 'agent', options);
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
export async function generateCopilotCode(taskDescription, language = 'javascript') {
  const response = await axios.post('https://api.githubcopilot.com/v1/code', {
    task: taskDescription,
    language
export async function copilotTaskAutomation(task, context = {}) {
  const response = await axios.post('https://api.githubcopilot.com/v1/automation', {
    task,
    context
