// Optional Enhancements for Gemini
export async function geminiMultimodal(text, imageUrl, options = {}) {
  return callGemini(`Text: ${text}\nImage: ${imageUrl}`, 'multimodal', options);
}

export async function geminiCreativeGeneration(prompt, options = {}) {
  return callGemini(`Creative: ${prompt}`, 'creative', options);
}

export async function geminiSummarize(text, options = {}) {
  return callGemini(`Summarize: ${text}`, 'summarize', options);
}

export async function geminiCodeGeneration(taskDescription, language = 'javascript', options = {}) {
  return callGemini(`Code (${language}): ${taskDescription}`, 'code', options);
}

import axios from 'axios';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function callGemini(prompt, mode, options = {}) {
  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateMessage?key=${GEMINI_API_KEY}`, {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}


// Optional Enhancements for Gemini
export async function geminiMultimodal(text, imageUrl, options = {}) {
  return callGemini(`Text: ${text}\nImage: ${imageUrl}`, 'multimodal', options);
}

export async function geminiCreativeGeneration(prompt, options = {}) {
  return callGemini(`Creative: ${prompt}`, 'creative', options);
}

export async function geminiSummarize(text, options = {}) {
  return callGemini(`Summarize: ${text}`, 'summarize', options);
}

export async function geminiCodeGeneration(taskDescription, language = 'javascript', options = {}) {
  return callGemini(`Code (${language}): ${taskDescription}`, 'code', options);
}

import axios from 'axios';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function callGemini(prompt, mode, options = {}) {
  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateMessage?key=${GEMINI_API_KEY}`, {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ai\integrations\GeminiIntegration.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\GeminiIntegration.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ai\integrations\GeminiIntegration.js) --- */
/* Merged master for logical file: ai\integrations\GeminiIntegration
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\GeminiIntegration.js (hash:F68CAEC79FB2716D78BF7E94AECFB36AA0A2016B499D6353E5CFD60620C9F444)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\GeminiIntegration.js (hash:493F832B24C6D17D81B6DB758DB7B8D4CBA5C1540007FC60F190A08B5FFEFEEB)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\GeminiIntegration.js | ext: .js | sha: F68CAEC79FB2716D78BF7E94AECFB36AA0A2016B499D6353E5CFD60620C9F444 ---- */
[BINARY FILE - original copied to merged_sources: ai\integrations\GeminiIntegration.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\GeminiIntegration.js | ext: .js | sha: 493F832B24C6D17D81B6DB758DB7B8D4CBA5C1540007FC60F190A08B5FFEFEEB ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\GeminiIntegration.js --- */
// Optional Enhancements for Gemini
export async function geminiMultimodal(text, imageUrl, options = {}) {
  return callGemini(`Text: ${text}\nImage: ${imageUrl}`, 'multimodal', options);
}
export async function geminiCreativeGeneration(prompt, options = {}) {
  return callGemini(`Creative: ${prompt}`, 'creative', options);
export async function geminiSummarize(text, options = {}) {
  return callGemini(`Summarize: ${text}`, 'summarize', options);
export async function geminiCodeGeneration(taskDescription, language = 'javascript', options = {}) {
  return callGemini(`Code (${language}): ${taskDescription}`, 'code', options);
import axios from 'axios';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export async function callGemini(prompt, mode, options = {}) {
  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateMessage?key=${GEMINI_API_KEY}`, {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
