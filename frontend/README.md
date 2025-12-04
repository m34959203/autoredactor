# 🚀 SaaS Landing Page with AI Chat (OpenRouter)

A modern, production-ready React landing page template with integrated AI chat using **OpenRouter.ai** - access to GPT-4, Claude, Llama, and 100+ AI models through one API!

## ✨ Features

- 🎨 **Beautiful Landing Page** - Modern SaaS design with gradients and animations
- 🤖 **OpenRouter AI Integration** - Chat with GPT-4, Claude, Llama, and more!
- 🆓 **Free AI Models** - Llama 3.1 (8B & 70B) completely free
- 💰 **Pay-as-you-go** - Premium models available (GPT-4, Claude 3)
- ⚡ **Lightning Fast** - Built with Vite for instant HMR
- 🎯 **TypeScript** - Fully type-safe codebase
- 💅 **Tailwind CSS v4** - Latest styling framework
- 📱 **Fully Responsive** - Works on all devices
- 🔒 **Secure** - Environment variables for API keys
- 🚂 **Railway Ready** - Deploy in 5 minutes!

## 🤖 AI Models Available

### 🆓 Free Models
- **Llama 3.1 8B** - Fast & Free
- **Llama 3.1 70B** - Powerful & Free

### 💰 Premium Models
- **GPT-4 Turbo** - Most capable (OpenAI)
- **GPT-3.5 Turbo** - Fast & affordable (OpenAI)
- **Claude 3 Opus** - Best reasoning (Anthropic)
- **Claude 3 Sonnet** - Balanced (Anthropic)
- **Gemini Pro 1.5** - Huge context (Google)
- **Mistral Large** - European AI (Mistral)

## 🚀 Quick Start

### Installation

```bash
cd frontend
npm install
```

### Get OpenRouter API Key (Free!)

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up (free, no credit card needed)
3. Create API key
4. **Get $1 free credit!**

### Configure API Key

```bash
# Copy example env file
cp .env.example .env

# Add your API key to .env
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run start
```

## 🚂 Deploy to Railway (5 minutes)

This project is **ready to deploy** to Railway.com!

### Quick Deploy

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from your GitHub repo
4. Add environment variable:
   ```
   VITE_OPENROUTER_API_KEY=your_key_here
   ```
5. Deploy! 🎉

Railway will:
- ✅ Auto-detect Node.js project
- ✅ Build your app
- ✅ Serve static files
- ✅ Provide HTTPS URL
- ✅ $5 free credit/month

📖 **Full Deployment Guide**: See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── saa-s-template.tsx  # Landing page
│   │       └── ai-chat.tsx          # AI chat component
│   ├── services/
│   │   └── ai-service.ts            # OpenRouter integration
│   ├── demo.tsx
│   ├── App.tsx
│   └── main.tsx
├── railway.json                     # Railway config
├── nixpacks.toml                    # Build config
├── RAILWAY_DEPLOY.md                # Deployment guide
├── OPENROUTER_GUIDE.md              # OpenRouter guide
└── package.json
```

## 🛠 Technology Stack

- **React 19** - Latest version
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS v4** - Styling
- **OpenRouter AI** - Access to 100+ AI models
- **serve** - Production server
- **Railway.com** - Deployment platform

## 🎨 Components

### Landing Page (`saa-s-template.tsx`)

- Responsive navigation with mobile menu
- Hero section with gradient effects
- AI demo section with interactive chat
- Feature cards with hover effects
- Custom button components

### AI Chat (`ai-chat.tsx`)

- Real-time chat interface
- 8 AI models to choose from
- Beautiful gradient UI
- Free & premium model options
- Message history
- Loading states
- Provider information

## 📝 Usage Examples

### Basic Usage

```tsx
import Component from "@/components/ui/saa-s-template";

function App() {
  return <Component />;
}
```

### AI Chat Standalone

```tsx
import AIChat from "@/components/ui/ai-chat";

function MyPage() {
  return (
    <div style={{ height: '600px' }}>
      <AIChat
        model="llama-3.1-8b"  // Free model!
        apiKey={import.meta.env.VITE_OPENROUTER_API_KEY}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

### Switch AI Models

```tsx
// Use free model
<AIChat model="llama-3.1-8b" />

// Use premium model
<AIChat model="gpt-4-turbo" />

// Use Claude
<AIChat model="claude-3-sonnet" />
```

## 🔒 Environment Variables

```env
# Required for AI chat
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**⚠️ Important**:
- Never commit `.env` files to git!
- Use Railway Variables for production
- Prefix with `VITE_` for Vite projects

## 💰 Pricing

### Development (Free)
- Use free Llama models
- No credit card needed
- Perfect for testing

### Production
- **Free tier**: $1 credit on signup
- **Llama models**: Always FREE
- **GPT-3.5**: ~$0.002/1K tokens
- **GPT-4**: ~$0.01/1K tokens
- **Claude 3**: ~$0.003-0.015/1K tokens

**Example**: 1000 messages with Llama = $0 FREE!

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### AI Chat Not Working

1. Check API key is valid (starts with `sk-or-v1-`)
2. Verify environment variable is set
3. Restart dev server
4. Try free model first (Llama 3.1 8B)

### Railway Deployment Issues

1. Make sure `VITE_OPENROUTER_API_KEY` is in Railway Variables
2. Check build logs in Railway dashboard
3. Verify `package.json` has `start` script

## 📚 Documentation

- [🚂 Railway Deployment Guide](./RAILWAY_DEPLOY.md) - Complete deployment guide
- [🤖 OpenRouter Guide](./OPENROUTER_GUIDE.md) - AI integration guide
- [📖 Integration Guide](./INTEGRATION_GUIDE.md) - Development guide

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [OpenRouter](https://openrouter.ai/docs)
- [Railway](https://docs.railway.app)

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add more AI features
- Improve UI components
- Fix bugs
- Add documentation

## 🌟 Features Roadmap

- [ ] Conversation history export
- [ ] Voice input/output
- [ ] Image generation
- [ ] Custom system prompts
- [ ] Dark/Light theme toggle
- [ ] Markdown rendering
- [ ] Code syntax highlighting

## 📄 License

Open source - MIT License

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and OpenRouter AI**

**Powered by**: OpenRouter.ai 🌐 | Railway.com 🚂

## 🎉 Quick Links

- 🔑 **Get API Key**: [openrouter.ai/keys](https://openrouter.ai/keys)
- 🚂 **Deploy**: [railway.app](https://railway.app)
- 📖 **Docs**: [OpenRouter Docs](https://openrouter.ai/docs)
- 💬 **Support**: [Discord](https://discord.gg/openrouter)

**Ready to deploy?** Follow the [Railway Deployment Guide](./RAILWAY_DEPLOY.md)!
