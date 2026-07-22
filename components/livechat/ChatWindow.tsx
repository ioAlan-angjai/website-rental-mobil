'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2, PhoneCall, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage, MessageProps, QuickOption } from './ChatMessage';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: MessageProps[];
  onSendMessage: (text: string) => void;
  onOptionClick: (option: QuickOption) => void;
  isTyping?: boolean;
  statusText?: string;
}

export function ChatWindow({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onOptionClick,
  isTyping = false,
  statusText = 'Bot CS Aktif 24/7',
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 w-[92vw] sm:w-[400px] h-[580px] bg-white border border-zinc-200/90 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-zinc-900 text-white p-4 px-5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shadow-inner">
              <Bot size={22} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-white">RentalBot CS</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles size={10} /> AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">{statusText}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20RentalMobil%20Jogja%2C%20saya%20ingin%20bertanya"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-emerald-400 hover:bg-white/10 transition-colors"
            title="Hubungi WhatsApp Official"
          >
            <PhoneCall size={18} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/70">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} {...msg} onOptionClick={onOptionClick} />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-8 h-8 shrink-0 bg-zinc-900 text-white rounded-full flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white border border-zinc-200/80 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-200/80 bg-white shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ketik pesan atau pilih opsi..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-10 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-4 h-10 shrink-0 shadow-sm"
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </form>

    </div>
  );
}
