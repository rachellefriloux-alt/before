// Optional Enhancements for Perplexity
export async function perplexityWebSearch(query, options = {}) {
  return callPerplexity(`Web search: ${query}`, 'search', options);
}

export async function perplexityMultiHopQA(question, context = '', options = {}) {
  return callPerplexity(`${context}\n${question}`, 'multi-hop-qa', options);
}

export async function perplexitySummarize(text, options = {}) {
  return callPerplexity(`Summarize: ${text}`, 'summarize', options);
}

export async function perplexityDocumentAnalysis(document, options = {}) {
  return callPerplexity(`Analyze document: ${document}`, 'doc-analysis', options);
}

import axios from 'axios';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export async function callPerplexity(prompt, mode, options = {}) {
  const response = await axios.post('https://api.perplexity.ai/v1/chat', {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}


// Optional Enhancements for Perplexity
export async function perplexityWebSearch(query, options = {}) {
  return callPerplexity(`Web search: ${query}`, 'search', options);
}

export async function perplexityMultiHopQA(question, context = '', options = {}) {
  return callPerplexity(`${context}\n${question}`, 'multi-hop-qa', options);
}

export async function perplexitySummarize(text, options = {}) {
  return callPerplexity(`Summarize: ${text}`, 'summarize', options);
}

export async function perplexityDocumentAnalysis(document, options = {}) {
  return callPerplexity(`Analyze document: ${document}`, 'doc-analysis', options);
}

import axios from 'axios';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export async function callPerplexity(prompt, mode, options = {}) {
  const response = await axios.post('https://api.perplexity.ai/v1/chat', {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\ai\integrations\PerplexityIntegration.js) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\PerplexityIntegration.js) */
/* --- dest (C:\Users\chell\Desktop\newsal\ai\integrations\PerplexityIntegration.js) --- */
/* Merged master for logical file: ai\integrations\PerplexityIntegration
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\PerplexityIntegration.js (hash:B80EE854C7614E06287A7D2EC51D7CEC83B3B9394FCEF6C146009433090B46AB)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\PerplexityIntegration.js (hash:4FD7BCA3A3687EBA0BB51D473427D46CD2E2EE8F9F54A793A50D749B59A8193E)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\ai\integrations\PerplexityIntegration.js | ext: .js | sha: B80EE854C7614E06287A7D2EC51D7CEC83B3B9394FCEF6C146009433090B46AB ---- */
[BINARY FILE - original copied to merged_sources: ai\integrations\PerplexityIntegration.js]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\ai\integrations\PerplexityIntegration.js | ext: .js | sha: 4FD7BCA3A3687EBA0BB51D473427D46CD2E2EE8F9F54A793A50D749B59A8193E ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\ai\integrations\PerplexityIntegration.js --- */
// Optional Enhancements for Perplexity
export async function perplexityWebSearch(query, options = {}) {
  return callPerplexity(`Web search: ${query}`, 'search', options);
}
export async function perplexityMultiHopQA(question, context = '', options = {}) {
  return callPerplexity(`${context}\n${question}`, 'multi-hop-qa', options);
export async function perplexitySummarize(text, options = {}) {
  return callPerplexity(`Summarize: ${text}`, 'summarize', options);
export async function perplexityDocumentAnalysis(document, options = {}) {
  return callPerplexity(`Analyze document: ${document}`, 'doc-analysis', options);
import axios from 'axios';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
export async function callPerplexity(prompt, mode, options = {}) {
  const response = await axios.post('https://api.perplexity.ai/v1/chat', {
    prompt,
    mode,
    ...options
  }, {
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
