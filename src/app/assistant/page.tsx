'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

const SUGGESTED_QUESTIONS = [
  '2.5 Gol Üstü nasıl hesaplanır?',
  'KG Var analizi nedir?',
  'Value Bet fırsatı nasıl değerlendirilir?',
  'Sistem nasıl çalışıyor?',
  'Hangi ligleri analiz ediyorsunuz?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '⚽ Merhaba! Ben GolLazım\'ın AI analiz asistanıyım.\n\nFutbol tahminleri, istatistikler ve analiz sistemi hakkında sorularını yanıtlayabilirim. Ne öğrenmek istersin? 🎯',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      
      const botMsg: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Üzgünüm, bir hata oluştu.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Bağlantı hatası. Lütfen tekrar deneyin.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-white font-bold">AI Analiz Asistanı</h1>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Çevrimiçi
            </p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto chat-scroll space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-purple-500/20 border border-purple-500/30'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-green-400" />
                : <User className="w-4 h-4 text-purple-400" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'assistant'
                ? 'bg-[#13132a] border border-white/5 text-gray-200'
                : 'bg-purple-600 text-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className="text-xs opacity-50 mt-1">
                {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div className="bg-[#13132a] border border-white/5 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Önerilen sorular */}
      {messages.length === 1 && (
        <div className="mb-3">
          <p className="text-gray-500 text-xs mb-2">Önerilen sorular:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full border border-white/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Bir şey sor..."
          className="flex-1 bg-[#13132a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none focus:border-green-500/50 transition-colors"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-12 h-12 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
