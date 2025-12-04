# 🚀 SaaS Landing Page with AI Chat

A modern, production-ready React landing page template with integrated **FREE** AI chat functionality.

## ✨ Features

- 🎨 **Beautiful Landing Page** - Modern SaaS design with gradients and animations
- 🤖 **AI Chat Integration** - Chat with Groq, Gemini, or HuggingFace AI (FREE!)
- ⚡ **Lightning Fast** - Built with Vite for instant HMR
- 🎯 **TypeScript** - Fully type-safe codebase
- 💅 **Tailwind CSS v4** - Latest styling framework
- 📱 **Fully Responsive** - Works on all devices
- 🔒 **Secure** - Environment variables for API keys
- 🎭 **shadcn/ui Structure** - Component organization

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🤖 AI Integration

This project includes a fully functional AI chat interface with support for multiple free AI providers!

### Supported AI Providers

1. **Groq** ⚡ (Recommended)
   - Ultra-fast Llama 3.3 70B model
   - Get API key: [console.groq.com](https://console.groq.com)

2. **Google Gemini** 🤖
   - Powerful Gemini Pro model
   - Get API key: [makersuite.google.com](https://makersuite.google.com/app/apikey)

3. **HuggingFace** 🤗
   - Open-source Llama models
   - Get API key: [huggingface.co](https://huggingface.co/settings/tokens)

### Setup AI Chat

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your free API key from any provider (see links above)

3. Add your API key to `.env`:
   ```env
   VITE_GROQ_API_KEY=your_api_key_here
   ```

4. Restart dev server and enjoy chatting with AI!

📖 **Full AI Documentation**: See [AI_INTEGRATION.md](./AI_INTEGRATION.md) for detailed setup guide.

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── saa-s-template.tsx  # Landing page component
│   │       └── ai-chat.tsx          # AI chat component
│   ├── services/
│   │   └── ai-service.ts            # AI provider integration
│   ├── demo.tsx                     # Demo page
│   ├── App.tsx                      # Main app
│   └── main.tsx                     # Entry point
├── .env.example                     # Example environment variables
├── AI_INTEGRATION.md                # AI integration guide
├── INTEGRATION_GUIDE.md             # General integration guide
└── package.json
```

## 🛠 Technology Stack

- **React 19** - Latest version
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS v4** - Styling
- **AI SDKs** - OpenAI, Google Generative AI
- **shadcn/ui structure** - Component organization

## 🎨 Components

### Landing Page (`saa-s-template.tsx`)

Features:
- Responsive navigation with mobile menu
- Hero section with gradient effects
- AI demo section with interactive chat
- Feature cards with hover effects
- Custom button components with variants

### AI Chat (`ai-chat.tsx`)

Features:
- Real-time chat interface
- Multiple AI provider support
- Beautiful gradient UI
- Message history
- Loading states
- Error handling
- Provider switching

## 📝 Usage Examples

### Using the Landing Page

```tsx
import Component from "@/components/ui/saa-s-template";

function App() {
  return <Component />;
}
```

### Using AI Chat Standalone

```tsx
import AIChat from "@/components/ui/ai-chat";

function MyPage() {
  return (
    <div style={{ height: '600px' }}>
      <AIChat
        provider="groq"
        apiKey={process.env.VITE_GROQ_API_KEY}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

## 🎯 Path Aliases

The project uses `@/` alias for cleaner imports:

```tsx
import Component from "@/components/ui/saa-s-template";
import AIService from "@/services/ai-service";
```

## 🔒 Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in Vite:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HUGGINGFACE_API_KEY=your_hf_token
```

**⚠️ Important**: Never commit `.env` files to git!

## 🐛 Troubleshooting

### AI Chat not working?

1. Check that you have a valid API key
2. Verify the key is in `.env` file
3. Restart the dev server
4. Check browser console for errors

### Build errors?

1. Clear node_modules: `rm -rf node_modules`
2. Reinstall: `npm install`
3. Try building again: `npm run build`

### Tailwind styles not working?

1. Check `postcss.config.js` uses `@tailwindcss/postcss`
2. Verify `index.css` imports Tailwind correctly
3. Clear cache and rebuild

## 📚 Documentation

- [AI Integration Guide](./AI_INTEGRATION.md) - Complete AI setup guide
- [Integration Guide](./INTEGRATION_GUIDE.md) - Project setup guide

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Groq Documentation](https://console.groq.com/docs)
- [Google Gemini API](https://ai.google.dev)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more AI providers
- Improve UI components
- Fix bugs
- Add features
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and AI**

**Powered by**: Groq 🚀 | Google Gemini 🤖 | HuggingFace 🤗
