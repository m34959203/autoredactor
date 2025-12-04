// AI Service - supports multiple free AI providers

export type AIProvider = 'groq' | 'gemini' | 'huggingface';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async chat(messages: Message[]): Promise<string> {
    try {
      switch (this.config.provider) {
        case 'groq':
          return await this.chatWithGroq(messages);
        case 'gemini':
          return await this.chatWithGemini(messages);
        case 'huggingface':
          return await this.chatWithHuggingFace(messages);
        default:
          throw new Error('Unsupported AI provider');
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  private async chatWithGroq(messages: Message[]): Promise<string> {
    // Groq uses OpenAI-compatible API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast and free model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response';
  }

  private async chatWithGemini(messages: Message[]): Promise<string> {
    // Convert messages to Gemini format
    const prompt = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response';
  }

  private async chatWithHuggingFace(messages: Message[]): Promise<string> {
    // Using Hugging Face Inference API
    const prompt = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const response = await fetch(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HuggingFace API error: ${error}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || 'No response';
  }
}

export default AIService;
