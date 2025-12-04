# 🤖 AI Integration Guide

## Overview

This application is integrated with multiple **FREE** AI providers, allowing you to chat with powerful language models without any cost!

## 🌟 Supported AI Providers

### 1. **Groq** (Recommended ⚡)
- **Model**: Llama 3.3 70B Versatile
- **Speed**: Ultra-fast (responses in milliseconds)
- **Free Tier**: Yes
- **Get API Key**: [https://console.groq.com/keys](https://console.groq.com/keys)

**Why Groq?**
- Fastest inference speed among all providers
- Excellent quality responses
- Generous free tier
- No credit card required

### 2. **Google Gemini**
- **Model**: Gemini Pro
- **Speed**: Fast
- **Free Tier**: Yes
- **Get API Key**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

**Why Gemini?**
- Made by Google
- High-quality responses
- Good context understanding
- Free for personal use

### 3. **HuggingFace**
- **Model**: Llama 3.2 3B Instruct
- **Speed**: Moderate
- **Free Tier**: Yes
- **Get API Key**: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

**Why HuggingFace?**
- Open-source models
- Community-driven
- Wide variety of models
- Free inference API

## 🚀 Quick Start

### Step 1: Get Your Free API Key

Choose one or more providers and get your free API keys:

#### Groq (Recommended)
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to "API Keys"
4. Create a new API key
5. Copy your key

#### Google Gemini
1. Go to [https://makersuite.google.com](https://makersuite.google.com)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy your key

#### HuggingFace
1. Go to [https://huggingface.co](https://huggingface.co)
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token with "read" permission
5. Copy your token

### Step 2: Configure API Keys

You have two options:

#### Option A: Using Environment Variables (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_HUGGINGFACE_API_KEY=your_huggingface_token_here
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

#### Option B: Enter API Key in UI

1. Run the application: `npm run dev`
2. Click "Try AI Chat Now"
3. Enter your API key in the yellow input field
4. Start chatting!

### Step 3: Start Chatting

1. Open the application in your browser
2. Scroll down to the "Experience AI Chat" section
3. Click "Try AI Chat Now"
4. Select your preferred AI provider (Groq, Gemini, or HuggingFace)
5. Start chatting!

## 📦 Installation

The AI dependencies are already included in `package.json`:

```bash
npm install
```

Dependencies:
- `openai` - For Groq API (OpenAI-compatible)
- `@google/generative-ai` - For Google Gemini
- `ai` - Vercel AI SDK

## 🎨 AI Chat Component

### Usage

```tsx
import AIChat from '@/components/ui/ai-chat';

function MyComponent() {
  return (
    <div style={{ height: '600px' }}>
      <AIChat
        provider="groq"  // 'groq' | 'gemini' | 'huggingface'
        apiKey="your-api-key"
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `provider` | `'groq' \| 'gemini' \| 'huggingface'` | No | `'groq'` | AI provider to use |
| `apiKey` | `string` | No | `undefined` | API key (if not in env) |
| `onError` | `(error: string) => void` | No | `undefined` | Error callback |

### Features

- 💬 Real-time chat interface
- 🎨 Beautiful gradient UI
- 📱 Fully responsive
- 🔄 Switch between providers
- ⚡ Fast message rendering
- 🎯 Type-safe TypeScript
- 🎭 Loading states
- ⌨️ Keyboard shortcuts (Enter to send)
- 📝 Message history
- ⏰ Timestamps

## 🛠 AI Service Architecture

The AI integration uses a service-based architecture:

```
src/
├── services/
│   └── ai-service.ts          # AI provider abstraction
└── components/
    └── ui/
        └── ai-chat.tsx         # Chat UI component
```

### AIService Class

```typescript
import AIService from '@/services/ai-service';

const service = new AIService({
  provider: 'groq',
  apiKey: 'your-api-key'
});

const response = await service.chat([
  { role: 'user', content: 'Hello!' }
]);
```

### Supported Methods

#### `chat(messages: Message[]): Promise<string>`

Sends a chat request to the selected AI provider.

**Parameters:**
- `messages` - Array of message objects with `role` and `content`

**Returns:**
- Promise resolving to the AI response string

## 🎯 Provider Comparison

| Feature | Groq | Gemini | HuggingFace |
|---------|------|--------|-------------|
| Speed | ⚡⚡⚡ Ultra Fast | ⚡⚡ Fast | ⚡ Moderate |
| Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Free Tier | ✅ Generous | ✅ Good | ✅ Limited |
| Model Size | 70B | Pro | 3B |
| Setup | Easy | Easy | Easy |
| API Cost | FREE | FREE | FREE |

**Recommendation**: Start with **Groq** for the best experience!

## 🔧 Advanced Configuration

### Custom Model Selection

Modify `src/services/ai-service.ts` to use different models:

```typescript
// For Groq
model: 'llama-3.3-70b-versatile'  // or 'mixtral-8x7b-32768'

// For Gemini
model: 'gemini-pro'  // or 'gemini-pro-vision'

// For HuggingFace
model: 'meta-llama/Llama-3.2-3B-Instruct'  // or any other model
```

### Adjusting Parameters

```typescript
// Temperature (0.0 - 1.0)
temperature: 0.7  // Higher = more creative

// Max tokens
max_tokens: 1024  // Longer responses

// Top P
top_p: 0.9  // Nucleus sampling
```

## 🔒 Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Don't expose API keys in frontend** - Use environment variables
3. **Rotate API keys regularly** - Generate new keys periodically
4. **Use different keys for dev/prod** - Separate environments
5. **Monitor API usage** - Check your provider dashboards

### Environment Variables

All API keys should be prefixed with `VITE_` to be accessible in Vite:

```env
VITE_GROQ_API_KEY=...
VITE_GEMINI_API_KEY=...
VITE_HUGGINGFACE_API_KEY=...
```

Access them in code:
```typescript
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
```

## 🐛 Troubleshooting

### Error: "Invalid API Key"

**Solution:**
1. Check that your API key is correct
2. Make sure you copied the full key
3. Verify the key is active in your provider dashboard
4. Try regenerating a new key

### Error: "Rate limit exceeded"

**Solution:**
1. Wait a few minutes before retrying
2. Check your provider's rate limits
3. Consider using a different provider
4. Upgrade to a paid tier if needed

### Error: "Network error"

**Solution:**
1. Check your internet connection
2. Verify the provider's API is online
3. Check for CORS issues in browser console
4. Try a different provider

### Chat not appearing

**Solution:**
1. Clear browser cache
2. Check browser console for errors
3. Verify component is properly imported
4. Ensure parent container has height set

### Provider selector not working

**Solution:**
1. Refresh the page
2. Clear state by reopening the chat
3. Check that all API keys are configured

## 📊 API Limits (Free Tier)

### Groq
- **Requests**: 30 requests/minute
- **Tokens**: 6,000 tokens/minute
- **Context**: 32,768 tokens

### Google Gemini
- **Requests**: 60 requests/minute
- **Tokens**: Limited by quota
- **Context**: 32,000 tokens

### HuggingFace
- **Requests**: Rate limited
- **Tokens**: Model dependent
- **Context**: Varies by model

## 🚀 Future Enhancements

Planned features:
- [ ] Conversation history persistence
- [ ] Export chat to PDF/Markdown
- [ ] Voice input/output
- [ ] Image generation support
- [ ] Custom system prompts
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Code syntax highlighting
- [ ] Markdown rendering

## 📚 Resources

### Official Documentation
- [Groq Documentation](https://console.groq.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference/index)

### Tutorials
- [Getting Started with Groq](https://console.groq.com/docs/quickstart)
- [Gemini API Quickstart](https://ai.google.dev/tutorials/quickstart)
- [HuggingFace Inference Tutorial](https://huggingface.co/docs/api-inference/quicktour)

## 🤝 Contributing

Want to add more AI providers? Follow these steps:

1. Add the provider to `AIProvider` type in `ai-service.ts`
2. Implement the chat method in `AIService` class
3. Add provider info to `providerInfo` in `ai-chat.tsx`
4. Update documentation

## 📝 License

This AI integration is part of the project and follows the same license.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

**Powered by**: Groq 🚀 | Google Gemini 🤖 | HuggingFace 🤗
