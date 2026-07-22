'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, X, Loader2, PhoneCall, Sparkles, UserCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage, MessageProps, QuickOption } from './ChatMessage';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: MessageProps[];
  onSendMessage: (text: string) => void;
  onOptionClick: (option: QuickOption) => void;
  isTyping?: boolean;
  statusText?: string;
  handledBy?: 'AI' | 'ADMIN';
}

export function ChatWindow({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onOptionClick,
  isTyping = false,
  statusText = 'Bot CS Aktif 24/7',
  handledBy = 'AI',
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto scroll when messages change or typing
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 80);
    }
  }, [isOpen, messages, isTyping, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay attachment to avoid the trigger click itself
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Auto resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  const isAI = handledBy === 'AI';

  return (
    <>
      {/* Mobile Fullscreen Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden" onClick={onClose} />

      <div
        ref={containerRef}
        className="
          fixed z-50 flex flex-col overflow-hidden bg-white font-sans transition-all duration-200

          /* Mobile (< 640px): Floating modal with safe margins */
          bottom-4 right-4 left-4 sm:left-auto
          max-h-[calc(100vh-32px)]

          /* Tablet & Desktop (>= 640px): Floating bottom-right */
          sm:bottom-6 sm:right-6
          sm:w-[380px] sm:max-w-[calc(100vw-48px)]
          sm:h-[530px] sm:max-h-[calc(100vh-90px)]
          rounded-3xl border border-zinc-200/90
          shadow-2xl
        "
      >
        {/* ===== HEADER ===== */}
        <div className="bg-zinc-900 text-white px-4 md:px-5 py-3.5 md:py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shadow-inner">
                {isAI ? <Bot size={18} /> : <UserCircle size={18} />}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white truncate">
                  {isAI ? 'RentalBot CS' : 'Customer Service'}
                </h3>
                {isAI ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Sparkles size={10} /> AI
                  </span>
                ) : (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1 shrink-0">
                    <UserCircle size={10} /> CS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium truncate">{statusText}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20RentalMobil%20Jogja"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-emerald-400 hover:bg-white/10 transition-colors"
              title="Hubungi WhatsApp"
            >
              <PhoneCall size={16} />
            </a>
            {/* Scroll to bottom button */}
            <button
              onClick={scrollToBottom}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Scroll ke bawah"
            >
              <ChevronDown size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ===== MESSAGES AREA ===== */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 space-y-3.5 bg-zinc-50/70 scroll-smooth">
          {messages.map((msg, idx) => (
            <ChatMessage key={`${msg.timestamp}-${idx}`} {...msg} onOptionClick={onOptionClick} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-7 h-7 md:w-8 md:h-8 shrink-0 bg-zinc-900 text-white rounded-full flex items-center justify-center">
                {isAI ? <Bot size={14} /> : <UserCircle size={14} />}
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-white border border-zinc-200/80 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ===== INPUT AREA ===== */}
        <div className="shrink-0 bg-white border-t border-zinc-200/80 safe-area-bottom">
          <form onSubmit={handleSubmit} className="p-2.5 md:p-3 flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                placeholder={
                  handledBy === 'ADMIN'
                    ? 'Pesan langsung ke admin...'
                    : 'Ketik pesan...'
                }
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                rows={1}
                className="
                  w-full bg-zinc-50 border border-zinc-200 text-zinc-900 
                  placeholder:text-zinc-400 rounded-xl 
                  px-3.5 py-2.5 text-xs sm:text-sm 
                  focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none
                  disabled:opacity-50 resize-none max-h-[120px]
                  leading-relaxed
                "
                style={{ minHeight: '40px' }}
              />
            </div>
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-white rounded-xl w-10 h-10 p-0 shrink-0 shadow-sm transition-all disabled:opacity-40"
            >
              {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
