/*
 * Persona: Tough love meets soul care.
 * Module: PerplexityIntegration
 * Intent: Handle functionality for PerplexityIntegration
 * Provenance-ID: a358e452-6526-4933-92a7-67322dc66e9d
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

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
