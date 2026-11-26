'use client';

import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  User,
  Headset,
  Bot,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ChatMessageItem {
  id?: string;
  senderType: 'USER' | 'ADMIN' | 'AI';
  message: string;
  createdAt?: string;
}

const QUICK_PROMPTS = [
  'Mobil apa yang tersedia saat ini?',
  'Syarat sewa lepas kunci apa saja?',
  'Bagaimana cara bayar DP 50%?',
  'Lokasi garasi & jam operasional?',
];

function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong key={partIdx} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <Fragment key={partIdx}>{part}</Fragment>;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </Fragment>
    );
  });
}

export function ChatWidget() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [guestMessages, setGuestMessages] = useState<ChatMessageItem[]>([]);
  const [handledBy, setHandledBy] = useState<'AI' | 'ADMIN'>('AI');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayedMessages = isAuthenticated ? messages : guestMessages;

  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        if (data.chat?.handledBy === 'ADMIN' || data.chat?.handledBy === 'AI') {
          setHandledBy(data.chat.handledBy);
        }
      }
    } catch {
      // ignore polling errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setLoadingMessages(true);
      fetchMessages().finally(() => setLoadingMessages(false));

      const interval = setInterval(fetchMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated, fetchMessages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedMessages, sending, isOpen]);

  const sendMessageText = async (rawText: string) => {
    const messageText = rawText.trim();
    if (!messageText || sending) return;

    setInputText('');
    setSending(true);

    if (isAuthenticated) {
      // Optimistically render user message immediately
      const optimisticUserMsg: ChatMessageItem = {
        senderType: 'USER',
        message: messageText,
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.handledBy === 'ADMIN' || data.handledBy === 'AI') {
            setHandledBy(data.handledBy);
          }
          await fetchMessages();
        }
      } catch (err) {
        console.error('Send message error:', err);
      } finally {
        setSending(false);
      }
    } else {
      const updatedHistory: ChatMessageItem[] = [
        ...guestMessages,
        { senderType: 'USER', message: messageText },
      ];
      setGuestMessages(updatedHistory);

      try {
        const res = await fetch('/api/chat/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            history: guestMessages.map((m) => ({
              role: m.senderType,
              message: m.message,
            })),
          }),
        });

        const data = await res.json();
        const replyText =
          data?.reply ||
          'Maaf, terjadi gangguan sementara. Silakan coba lagi atau hubungi WhatsApp +62 812-3456-7890.';

        setGuestMessages((prev) => [
          ...prev,
          { senderType: 'AI', message: replyText },
        ]);
      } catch (err) {
        console.error('Guest assistant error:', err);
        setGuestMessages((prev) => [
          ...prev,
          {
            senderType: 'AI',
            message:
              'Maaf, gagal terhubung ke Asisten AI. Silakan coba beberapa saat lagi.',
          },
        ]);
      } finally {
        setSending(false);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessageText(inputText);
  };

  const handleSwitchMode = async (targetMode: 'AI' | 'ADMIN') => {
    if (!isAuthenticated || switchingMode) return;
    setSwitchingMode(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handledBy: targetMode }),
      });
      if (res.ok) {
        setHandledBy(targetMode);
        await fetchMessages();
      }
    } catch (err) {
      console.error('Switch chat mode error:', err);
    } finally {
      setSwitchingMode(false);
    }
  };

  const isAIMode = !isAuthenticated || handledBy === 'AI';

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-white/20"
          aria-label={isOpen ? 'Tutup Asisten Chat' : 'Buka Asisten Chat'}
        >
          {isOpen ? (
            <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          ) : (
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          )}

          {/* Online green indicator dot */}
          {!isOpen && (
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900" />
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[390px] h-[530px] max-h-[calc(100vh-7.5rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  {isAIMode ? <Bot size={18} /> : <Headset size={18} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate flex items-center gap-1.5">
                    {isAIMode ? 'Asisten AI RentalMobil' : 'Admin Customer Service'}
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    {isAIMode ? 'Online • Respons Instan' : 'Terhubung ke Admin CS'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isAuthenticated ? (
                  <button
                    type="button"
                    disabled={switchingMode}
                    onClick={() => handleSwitchMode(isAIMode ? 'ADMIN' : 'AI')}
                    className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                    title={
                      isAIMode
                        ? 'Alihkan percakapan ke Admin CS'
                        : 'Kembali gunakan Asisten AI otomatis'
                    }
                  >
                    {switchingMode
                      ? '...'
                      : isAIMode
                      ? 'Hubungi Admin'
                      : 'Tanya AI'}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    <LogIn size={11} /> Masuk
                  </Link>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Tutup Chat"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/70 dark:bg-zinc-950/50">
              {isAuthenticated && loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 size={24} className="text-zinc-400 animate-spin" />
                </div>
              ) : displayedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-3 py-4">
                  <div className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-3 text-zinc-800 dark:text-zinc-200 shadow-xs">
                    <Sparkles size={20} />
                  </div>
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">
                    Halo! Ada yang bisa dibantu?
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1 max-w-[260px] leading-relaxed">
                    Tanyakan ketersediaan &amp; harga mobil, syarat lepas kunci, cara bayar DP, atau pilih topik cepat di bawah:
                  </p>

                  <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendMessageText(prompt)}
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-400 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {displayedMessages.map((msg, idx) => {
                    const isUser = msg.senderType === 'USER';
                    const isAdmin = msg.senderType === 'ADMIN';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        {!isUser && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1 font-medium">
                            {isAdmin ? (
                              <>
                                <Headset size={11} className="text-zinc-600 dark:text-zinc-300" /> Admin CS
                              </>
                            ) : (
                              <>
                                <Bot size={11} className="text-zinc-600 dark:text-zinc-300" /> Asisten AI
                              </>
                            )}
                          </span>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                            isUser
                              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-br-xs font-medium'
                              : 'bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 rounded-bl-xs'
                          }`}
                        >
                          <div
                            className={`whitespace-pre-wrap break-words leading-relaxed ${
                              isUser ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {renderFormattedText(msg.message)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {sending && isAIMode && (
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1 font-medium">
                        <Bot size={11} /> Asisten AI
                      </span>
                      <div className="bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 shadow-xs">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sedang menyiapkan jawaban...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Guest tip banner */}
            {!isAuthenticated && status === 'unauthenticated' && (
              <div className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-300 shrink-0">
                <span className="flex items-center gap-1 truncate">
                  <User size={11} className="shrink-0" /> Masuk untuk cek status booking &amp; chat admin
                </span>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-zinc-900 dark:text-white hover:underline shrink-0 ml-2"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isAIMode
                    ? 'Tanya soal mobil, harga, atau syarat...'
                    : 'Ketik pesan untuk Admin CS...'
                }
                disabled={sending}
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-xs"
                aria-label="Kirim Pesan"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
