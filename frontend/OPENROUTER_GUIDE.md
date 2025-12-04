# 🌐 OpenRouter.ai Integration Guide

Access GPT-4, Claude, Llama, and 100+ AI models through one API!

## 🎯 What is OpenRouter?

OpenRouter is a unified API gateway that provides access to multiple AI models:
- **OpenAI**: GPT-4 Turbo, GPT-3.5
- **Anthropic**: Claude 3 Opus, Sonnet
- **Meta**: Llama 3.1 (70B, 8B) - **FREE**
- **Google**: Gemini Pro 1.5
- **Mistral AI**: Mistral Large
- **And 100+ more models!**

## ✨ Benefits

### 1. **One API Key for All Models**
- No need for separate API keys
- Switch between models instantly
- Unified billing and usage tracking

### 2. **Free Models Available**
- Llama 3.1 8B - Completely FREE
- Llama 3.1 70B - Completely FREE
- $1 free credit on signup for premium models

### 3. **Pay As You Go**
- Only pay for what you use
- No subscriptions required
- Transparent pricing

### 4. **Best Routing**
- Automatically selects fastest available endpoint
- Fallback to alternative providers
- High availability

## 🚀 Quick Start

### Step 1: Get Your Free API Key

1. Visit [openrouter.ai](https://openrouter.ai)
2. Click **"Sign In"**
3. Sign in with GitHub/Google
4. Go to **"Keys"** → [openrouter.ai/keys](https://openrouter.ai/keys)
5. Click **"Create Key"**
6. Copy your API key (starts with `sk-or-v1-...`)
7. **Bonus**: Get $1 free credit on signup!

### Step 2: Add to Your Project

**Local Development:**
```bash
# Create .env file
echo "VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here" > .env
```

**Railway Deployment:**
1. Railway Dashboard → Variables
2. Add: `VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here`

### Step 3: Start Using AI!

```typescript
import AIService from '@/services/ai-service';

const ai = new AIService({
  apiKey: 'your-api-key',
  model: 'llama-3.1-8b' // Free model!
});

const response = await ai.chat([
  { role: 'user', content: 'Hello, AI!' }
]);

console.log(response);
```

## 🤖 Available Models

### 🆓 Free Models (No Cost)

#### Llama 3.1 8B
```typescript
model: 'llama-3.1-8b'
```
- **Provider**: Meta
- **Cost**: FREE
- **Best for**: Fast responses, general chat
- **Context**: 128K tokens

#### Llama 3.1 70B
```typescript
model: 'llama-3.1-70b'
```
- **Provider**: Meta
- **Cost**: FREE
- **Best for**: Complex reasoning, analysis
- **Context**: 128K tokens

### 💰 Premium Models (Pay Per Use)

#### GPT-3.5 Turbo
```typescript
model: 'gpt-3.5-turbo'
```
- **Provider**: OpenAI
- **Cost**: ~$0.002/1K tokens
- **Best for**: Fast, affordable, reliable
- **Context**: 16K tokens

#### GPT-4 Turbo
```typescript
model: 'gpt-4-turbo'
```
- **Provider**: OpenAI
- **Cost**: ~$0.01/1K tokens
- **Best for**: Most capable, complex tasks
- **Context**: 128K tokens

#### Claude 3 Sonnet
```typescript
model: 'claude-3-sonnet'
```
- **Provider**: Anthropic
- **Cost**: ~$0.003/1K tokens
- **Best for**: Balanced performance
- **Context**: 200K tokens

#### Claude 3 Opus
```typescript
model: 'claude-3-opus'
```
- **Provider**: Anthropic
- **Cost**: ~$0.015/1K tokens
- **Best for**: Most capable reasoning
- **Context**: 200K tokens

#### Gemini Pro 1.5
```typescript
model: 'gemini-pro'
```
- **Provider**: Google
- **Cost**: ~$0.001/1K tokens
- **Best for**: Huge context window
- **Context**: 1M tokens (!)

#### Mistral Large
```typescript
model: 'mistral-large'
```
- **Provider**: Mistral AI
- **Cost**: ~$0.004/1K tokens
- **Best for**: Fast, European provider
- **Context**: 128K tokens

## 💵 Pricing Examples

### Example 1: Free Chat (Llama 3.1 8B)
```
User: "Hello!"
AI: "Hi there! How can I help?"

Cost: $0.00 (FREE!)
```

### Example 2: Affordable Chat (GPT-3.5)
```
User: "Write a 500 word essay"
AI: [500 word response]

Cost: ~$0.003 (0.3 cents)
```

### Example 3: Premium Chat (GPT-4)
```
User: "Explain quantum physics in detail"
AI: [Detailed 1000 word response]

Cost: ~$0.02 (2 cents)
```

### Monthly Estimates

**Light Use** (100 messages/day with free models):
- Cost: $0/month 🎉

**Moderate Use** (100 messages/day with GPT-3.5):
- Cost: ~$3-5/month

**Heavy Use** (500 messages/day with GPT-4):
- Cost: ~$30-50/month

## 📊 Model Comparison

| Model | Provider | Cost | Speed | Quality | Context |
|-------|----------|------|-------|---------|---------|
| Llama 3.1 8B | Meta | FREE | ⚡⚡⚡ | ⭐⭐⭐⭐ | 128K |
| Llama 3.1 70B | Meta | FREE | ⚡⚡ | ⭐⭐⭐⭐⭐ | 128K |
| GPT-3.5 Turbo | OpenAI | $ | ⚡⚡⚡ | ⭐⭐⭐⭐ | 16K |
| GPT-4 Turbo | OpenAI | $$$ | ⚡⚡ | ⭐⭐⭐⭐⭐ | 128K |
| Claude 3 Sonnet | Anthropic | $$ | ⚡⚡ | ⭐⭐⭐⭐⭐ | 200K |
| Claude 3 Opus | Anthropic | $$$$ | ⚡ | ⭐⭐⭐⭐⭐ | 200K |
| Gemini Pro | Google | $ | ⚡⚡ | ⭐⭐⭐⭐ | 1M |
| Mistral Large | Mistral | $$ | ⚡⚡⚡ | ⭐⭐⭐⭐ | 128K |

## 🔧 Advanced Configuration

### Switching Models Dynamically

```typescript
const ai = new AIService({
  apiKey: process.env.VITE_OPENROUTER_API_KEY,
  model: 'llama-3.1-8b'
});

// Switch to GPT-4 for complex task
ai.setModel('gpt-4-turbo');

const complexResponse = await ai.chat([...]);

// Switch back to free model
ai.setModel('llama-3.1-8b');
```

### Custom Parameters

```typescript
// In ai-service.ts, modify the chat method:
body: JSON.stringify({
  model: modelId,
  messages: messages,
  temperature: 0.7,        // Creativity (0-1)
  max_tokens: 2048,        // Response length
  top_p: 0.9,              // Nucleus sampling
  frequency_penalty: 0,    // Avoid repetition
  presence_penalty: 0,     // Encourage new topics
})
```

## 📈 Monitoring Usage

### OpenRouter Dashboard

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign in
3. Click **"Activity"**

You can see:
- Total requests
- Cost per request
- Models used
- Daily/weekly/monthly usage
- Remaining credits

### Set Up Alerts

1. Dashboard → Settings
2. Set spending limits
3. Get email alerts at thresholds
4. Example: Alert at $5, $10, $20

## 🔒 Security Best Practices

### ✅ Do's

1. **Use Environment Variables**
   ```typescript
   const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
   ```

2. **Rotate Keys Regularly**
   - Create new key every 3-6 months
   - Delete old keys

3. **Set Spending Limits**
   - OpenRouter dashboard → Limits
   - Example: $20/month maximum

4. **Monitor Usage**
   - Check dashboard weekly
   - Review unusual activity

### ❌ Don'ts

1. **Never commit API keys**
   ```bash
   # Bad
   const apiKey = "sk-or-v1-abc123...";

   # Good
   const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
   ```

2. **Don't share keys**
   - Each developer should have their own key
   - Use separate keys for dev/prod

3. **Don't expose in frontend**
   - Already handled with Vite's env vars
   - Keys with `VITE_` prefix are bundled safely

## 🐛 Troubleshooting

### Error: "Invalid API Key"

**Solutions**:
1. Check key starts with `sk-or-v1-`
2. Verify no extra spaces
3. Make sure it's added to Railway Variables (for production)
4. Try creating a new key

### Error: "Rate Limited"

**Solutions**:
1. You've hit free tier limits
2. Wait 1 minute and retry
3. Add payment method to increase limits
4. Switch to different model

### Error: "Insufficient Credits"

**Solutions**:
1. Check balance: [openrouter.ai/credits](https://openrouter.ai/credits)
2. Add credits ($5, $10, $20, etc.)
3. Use free models (Llama)

### Slow Responses

**Solutions**:
1. Use faster models (Llama 3.1 8B, GPT-3.5)
2. Reduce max_tokens
3. Check OpenRouter status
4. Try different model

## 💡 Tips & Tricks

### 1. Model Selection Strategy

```typescript
// Simple questions → Free model
if (simpleQuery) {
  model = 'llama-3.1-8b';
}

// Complex analysis → Premium model
if (needsAnalysis) {
  model = 'gpt-4-turbo';
}

// Long context → Gemini
if (hugeContext) {
  model = 'gemini-pro';
}
```

### 2. Cost Optimization

```typescript
// Start with free model
model = 'llama-3.1-8b';

// Only use premium for specific features
if (userPremium && needsGPT4) {
  model = 'gpt-4-turbo';
}
```

### 3. Fallback Strategy

```typescript
try {
  // Try premium model first
  const response = await ai.chat(messages, 'claude-3-opus');
} catch (error) {
  // Fallback to free model
  const response = await ai.chat(messages, 'llama-3.1-70b');
}
```

## 📚 Resources

- **OpenRouter Docs**: [openrouter.ai/docs](https://openrouter.ai/docs)
- **Model Pricing**: [openrouter.ai/models](https://openrouter.ai/models)
- **API Reference**: [openrouter.ai/docs/api-reference](https://openrouter.ai/docs/api-reference)
- **Discord Community**: [discord.gg/openrouter](https://discord.gg/openrouter)

## 🎉 Conclusion

OpenRouter makes it incredibly easy to use AI in your applications:
- ✅ One API key for all models
- ✅ Free models available
- ✅ Easy to switch models
- ✅ Transparent pricing
- ✅ Great documentation

Start with free Llama models, then upgrade to premium models when needed!

---

**Questions?** Check the [OpenRouter Docs](https://openrouter.ai/docs) or our [AI Integration Guide](./AI_INTEGRATION.md)
