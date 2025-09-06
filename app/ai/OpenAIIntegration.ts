import { ConfigurableFormData, PRESET_CONFIGS } from '../../utils/formDataUtils';

export interface OpenAIResponse {
  content: string;
  confidence: number;
  reasoning?: string;
  suggestedActions?: string[];
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface OpenAIConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enableFallback: boolean;
  /** Configuration for file upload FormData formatting */
  uploadFormatConfig?: {
    arrayFormat?: 'brackets' | 'indexed' | 'comma' | 'repeat';
    objectFormat?: 'brackets' | 'dot' | 'underscore';
  };
}

export class OpenAIIntegration {
  private config: OpenAIConfig;
  private baseURL = 'https://api.openai.com/v1';
  private fallbackResponses: string[] = [
    "I understand what you're saying. Can you tell me more about that?",
    "That's really interesting. How does that make you feel?",
    "I'm here to listen and support you. What would be most helpful right now?",
    "Thanks for sharing that with me. What's most important to you about this?",
    "I can sense this matters to you. Would you like to explore it further?",
  ];

  constructor(config?: Partial<OpenAIConfig>) {
    this.config = {
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
      model: 'gpt-4o-mini', // More cost-effective option
      maxTokens: 500,
      temperature: 0.7,
      enableFallback: true,
      ...config,
    };
  }

  async generateResponse(systemPrompt: string, userInput: string): Promise<OpenAIResponse> {
    // Check if we should use AI or fallback
    if (!this.config.apiKey || !this.isAPIAvailable()) {
      return this.getFallbackResponse(userInput);
    }

    try {
      const response = await this.callOpenAI(systemPrompt, userInput);
      return this.processOpenAIResponse(response);
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      if (this.config.enableFallback) {
        return this.getFallbackResponse(userInput);
      } else {
        throw error;
      }
    }
  }

  private async callOpenAI(systemPrompt: string, userInput: string): Promise<any> {
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userInput,
      },
    ];

    const requestBody = {
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' },
      tools: [
        {
          type: 'function',
          function: {
            name: 'respond_with_emotion',
            description: 'Respond with emotional intelligence and suggested actions',
            parameters: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'The response content'
                },
                emotion: {
                  type: 'string',
                  description: 'The emotional tone of the response'
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence in the response (0-1)'
                },
                reasoning: {
                  type: 'string',
                  description: 'Brief reasoning for the response approach'
                },
                suggested_actions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Suggested actions for the user'
                }
              },
              required: ['content', 'emotion', 'confidence']
            }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'respond_with_emotion' } }
    };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private processOpenAIResponse(response: any): OpenAIResponse {
    try {
      const choice = response.choices[0];
      const toolCall = choice.message.tool_calls?.[0];
      
      if (toolCall && toolCall.function) {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        return {
          content: functionArgs.content || "I'm here to help you.",
          confidence: functionArgs.confidence || 0.7,
          reasoning: functionArgs.reasoning,
          suggestedActions: functionArgs.suggested_actions,
          tokenUsage: response.usage ? {
            prompt: response.usage.prompt_tokens,
            completion: response.usage.completion_tokens,
            total: response.usage.total_tokens,
          } : undefined,
        };
      } else {
        // Fallback to regular message content
        return {
          content: choice.message.content || this.getRandomFallback(),
          confidence: 0.6,
          reasoning: 'Standard response without tool use',
        };
      }
    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      return this.getFallbackResponse('');
    }
  }

  private getFallbackResponse(userInput: string): OpenAIResponse {
    // Simple pattern matching for fallback responses
    const input = userInput.toLowerCase();
    
    let response: string;
    let confidence: number = 0.5;
    
    if (input.includes('sad') || input.includes('down')) {
      response = "I can sense you're going through a difficult time. I'm here to listen and support you. What's weighing on your heart?";
      confidence = 0.7;
    } else if (input.includes('happy') || input.includes('excited')) {
      response = "I love hearing the joy in your words! It's wonderful that you're feeling positive. What's bringing you this happiness?";
      confidence = 0.7;
    } else if (input.includes('angry') || input.includes('frustrated')) {
      response = "I can feel the intensity in what you're sharing. Those feelings are completely valid. Want to tell me more about what's triggering this?";
      confidence = 0.7;
    } else if (input.includes('help') || input.includes('support')) {
      response = "I'm absolutely here to help you in whatever way I can. What kind of support would be most meaningful to you right now?";
      confidence = 0.8;
    } else if (input.includes('thank') || input.includes('grateful')) {
      response = "Your gratitude really touches me. It means a lot that you feel supported. I'm always here for you.";
      confidence = 0.8;
    } else {
      response = this.getRandomFallback();
      confidence = 0.4;
    }

    return {
      content: response,
      confidence,
      reasoning: 'Local pattern matching fallback',
      suggestedActions: this.generateFallbackActions(input),
    };
  }

  private getRandomFallback(): string {
    return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
  }

  private generateFallbackActions(input: string): string[] {
    const actions: string[] = [];
    
    if (input.includes('sad') || input.includes('down')) {
      actions.push('Take a moment for self-care', 'Reach out to someone you trust', 'Consider what might help you feel better');
    } else if (input.includes('angry') || input.includes('frustrated')) {
      actions.push('Take some deep breaths', 'Consider what\'s behind the anger', 'Think about constructive ways to address the issue');
    } else if (input.includes('help')) {
      actions.push('Be specific about what you need', 'Consider your available resources', 'Take it one step at a time');
    } else {
      actions.push('Reflect on your current feelings', 'Consider what you need most right now', 'Remember that I\'m here to support you');
    }
    
    return actions;
  }

  private isAPIAvailable(): boolean {
    // Simple check for API availability
    // In a real implementation, this might include more sophisticated checks
    return Boolean(this.config.apiKey && this.config.apiKey.length > 10);
  }

  // Public utility methods
  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): OpenAIConfig {
    return { ...this.config, apiKey: this.config.apiKey ? '[HIDDEN]' : '' };
  }

  async testConnection(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }

    try {
      const response = await this.generateResponse(
        'You are a test assistant. Respond with exactly: "Connection successful"',
        'Test connection'
      );
      return response.content.includes('Connection successful') || response.confidence > 0.5;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async generateSummary(text: string, maxLength: number = 100): Promise<string> {
    try {
      const response = await this.generateResponse(
        `Summarize the following text in ${maxLength} characters or less. Be concise but capture the key points.`,
        text
      );
      return response.content;
    } catch (error) {
      console.error('Summary generation error:', error);
      // Simple fallback summary
      return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }
  }

  async generateTags(content: string): Promise<string[]> {
    try {
      const response = await this.generateResponse(
        'Generate 3-5 relevant tags for the following content. Respond with just the tags separated by commas.',
        content
      );
      return response.content.split(',').map(tag => tag.trim().toLowerCase());
    } catch (error) {
      console.error('Tag generation error:', error);
      // Simple fallback tag generation
      const words = content.toLowerCase().split(/\s+/);
      return words.filter(word => word.length > 3).slice(0, 3);
    }
  }

  /**
   * Upload file with configurable FormData formatting
   */
  async uploadFile(file: File | Blob, metadata?: Record<string, any>): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not available');
    }

    try {
      // Create FormData with configured nested formatting
      const formDataConfig = this.config.uploadFormatConfig || PRESET_CONFIGS.OPENAI;
      const configurableFormData = new ConfigurableFormData(formDataConfig);
      
      const uploadData: Record<string, any> = {
        file,
        purpose: 'assistants' // Default purpose for Sallie AI
      };

      // Add metadata if provided
      if (metadata) {
        uploadData.metadata = metadata;
      }

      const formData = await configurableFormData.createForm(uploadData);

      const response = await fetch(`${this.baseURL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files with configurable formatting
   */
  async uploadFiles(files: (File | Blob)[], metadata?: Record<string, any>[]): Promise<any[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadFile(file, metadata?.[index])
    );
    
    return Promise.all(uploadPromises);
  }

  // Memory and learning integration
  async processMemoryForInsights(memories: any[]): Promise<string[]> {
    if (memories.length === 0) return [];

    try {
      const memoryText = memories.map(m => m.content).join('\n');
      const response = await this.generateResponse(
        'Analyze these memories and provide 3-5 key insights about patterns, growth, or important themes. Respond with insights separated by semicolons.',
        memoryText
      );
      return response.content.split(';').map(insight => insight.trim());
    } catch (error) {
      console.error('Memory insights error:', error);
      return ['Memories show ongoing personal growth', 'Conversations demonstrate emotional awareness'];
    }
  }
}
