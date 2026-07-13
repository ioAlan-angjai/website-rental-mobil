'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage, MessageProps } from './ChatMessage';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: MessageProps[];
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
}

export function ChatWindow({ isOpen, onClose, messages, onSendMessage, isTyping = false }: ChatWindowProps) {
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
    <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden">
      
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold">RentalMobil Jogja</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-xs opacity-90">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Tutup chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
        {messages.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Bot size={28} className="text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Halo! Ada yang bisa kami bantu?
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage key={idx} {...msg} />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ketik pesan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 shrink-0"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </form>

    </div>
  );
}
