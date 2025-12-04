import React, { useState, useRef, useEffect } from 'react';
import AIService, { type AIProvider } from '@/services/ai-service';

// Icon Components
const Send = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const Bot = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const User = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Sparkles = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  provider?: AIProvider;
  apiKey?: string;
  onError?: (error: string) => void;
}

export default function AIChat({ provider = 'groq', apiKey, onError }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я AI ассистент. Чем могу помочь?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [tempApiKey, setTempApiKey] = useState('');
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(provider);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const effectiveApiKey = apiKey || tempApiKey;
    if (!effectiveApiKey) {
      onError?.('Please enter an API key');
      setShowApiKeyInput(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiService = new AIService({
        provider: currentProvider,
        apiKey: effectiveApiKey,
      });

      const response = await aiService.chat([
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content },
      ]);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowApiKeyInput(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
      console.error('Chat error:', error);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Ошибка: ${errorMessage}. Проверьте API ключ и попробуйте снова.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const providerInfo = {
    groq: { name: 'Groq (Llama 3.3 70B)', color: 'text-orange-400' },
    gemini: { name: 'Google Gemini Pro', color: 'text-blue-400' },
    huggingface: { name: 'HuggingFace (Llama 3.2)', color: 'text-yellow-400' },
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-md border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              AI Chat Assistant
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                FREE
              </span>
            </h3>
            <p className={`text-xs ${providerInfo[currentProvider].color}`}>
              Powered by {providerInfo[currentProvider].name}
            </p>
          </div>

          {/* Provider Selector */}
          <select
            value={currentProvider}
            onChange={(e) => setCurrentProvider(e.target.value as AIProvider)}
            className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="groq">Groq (Fast)</option>
            <option value="gemini">Gemini</option>
            <option value="huggingface">HuggingFace</option>
          </select>
        </div>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-yellow-400" />
            <p className="text-yellow-400 text-sm font-medium">API Key Required</p>
          </div>
          <input
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder={`Enter ${currentProvider} API key...`}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-2">
            Get your free API key from{' '}
            <a
              href={
                currentProvider === 'groq'
                  ? 'https://console.groq.com'
                  : currentProvider === 'gemini'
                  ? 'https://makersuite.google.com/app/apikey'
                  : 'https://huggingface.co/settings/tokens'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              here
            </a>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}
            >
              {message.role === 'user' ? (
                <User size={18} className="text-white" />
              ) : (
                <Bot size={18} className="text-white" />
              )}
            </div>
            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">
                {message.timestamp.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
