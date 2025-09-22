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
