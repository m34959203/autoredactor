// AI Service - OpenRouter.ai integration
// Access multiple AI models through one API key

export type AIModel =
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'llama-3.1-70b'
  | 'llama-3.1-8b'
  | 'mistral-large'
  | 'gemini-pro';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIConfig {
  apiKey: string;
  model?: AIModel;
}

// Model configurations with details
export const MODELS = {
  'gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Most capable, best for complex tasks',
    contextLength: 128000,
    pricing: 'Low',
  },
  'gpt-3.5-turbo': {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and efficient, good balance',
    contextLength: 16385,
    pricing: 'Very Low',
  },
  'claude-3-opus': {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Powerful reasoning, great for analysis',
    contextLength: 200000,
    pricing: 'Medium',
  },
  'claude-3-sonnet': {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
    contextLength: 200000,
    pricing: 'Low',
  },
  'llama-3.1-70b': {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    description: 'Open source, powerful and free',
    contextLength: 131072,
    pricing: 'Free',
  },
  'llama-3.1-8b': {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    description: 'Fast, efficient, completely free',
    contextLength: 131072,
    pricing: 'Free',
  },
  'mistral-large': {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'European AI, great performance',
    contextLength: 128000,
    pricing: 'Low',
  },
  'gemini-pro': {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    description: 'Google\'s latest, multimodal capable',
    contextLength: 1000000,
    pricing: 'Low',
  },
} as const;

class AIService {
  private apiKey: string;
  private model: AIModel;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(config: AIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'llama-3.1-8b'; // Default to free model
  }

  /**
   * Send a chat message and get AI response
   */
  async chat(messages: Message[]): Promise<string> {
    try {
      const modelId = MODELS[this.model].id;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin, // Required by OpenRouter
          'X-Title': 'AI Chat App', // Optional, for OpenRouter analytics
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(
          error.error?.message ||
          error.error ||
          `OpenRouter API error: ${response.status}`
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response from AI';
    } catch (error) {
      console.error('AI Service Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with AI service');
    }
  }

  /**
   * Get information about current model
   */
  getModelInfo() {
    return MODELS[this.model];
  }

  /**
   * Change the AI model
   */
  setModel(model: AIModel) {
    this.model = model;
  }

  /**
   * Get all available models
   */
  static getAllModels() {
    return MODELS;
  }
}

export default AIService;
