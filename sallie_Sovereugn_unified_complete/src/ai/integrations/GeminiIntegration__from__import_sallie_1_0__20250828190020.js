/*
 * Persona: Tough love meets soul care.
 * Module: GeminiIntegration
 * Intent: Handle functionality for GeminiIntegration
 * Provenance-ID: 834ff67c-3ec9-492a-98e3-26ac54170256
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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
