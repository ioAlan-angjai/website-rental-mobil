'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, X, Send, Loader2, User, Headset, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function ChatWidget() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch {
      // ignore
    }
  }, [status]);

  useEffect(() => {
    if (isOpen && status === 'authenticated') {
      setLoadingMessages(true);
      fetchMessages().finally(() => setLoadingMessages(false));

      // Polling every 3 seconds while open
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, status, fetchMessages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (res.ok) {
        await fetchMessages();
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-xl hover:shadow-2xl hover:bg-foreground/95 transition-all cursor-pointer border-2 border-background/20"
          aria-label={isOpen ? "Tutup Live Chat" : "Buka Live Chat"}
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
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background" />
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
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[490px] max-h-[calc(100vh-7.5rem)] bg-card border border-border rounded-3xl shadow-xl z-50 flex flex-col overflow-hidden text-foreground"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-card border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center text-foreground shrink-0">
                  <Headset size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight">Customer Support</h3>
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Siap Membantu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Tutup Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
              {status === 'unauthenticated' ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mb-3 text-foreground/70">
                    <User size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Masuk untuk Memulai Chat</h4>
                  <p className="text-xs text-foreground/60 mt-1 mb-4 max-w-[240px]">
                    Masuk ke akun Anda agar tim kami dapat mengidentifikasi pesanan & identitas Anda.
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-foreground hover:bg-foreground/90 text-background text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    Masuk Sekarang
                  </Link>
                  <div className="mt-5 pt-4 border-t border-border w-full">
                    <p className="text-[11px] text-foreground/50 mb-1.5">Atau hubungi cepat via WhatsApp:</p>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-foreground font-semibold hover:underline"
                    >
                      WhatsApp Support <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 size={24} className="text-foreground/60 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-foreground/60 text-xs">
                  <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center mb-2.5 text-foreground/70">
                    <Headset size={18} />
                  </div>
                  <p className="font-semibold text-foreground">Halo! Selamat datang di Rental Mobil.</p>
                  <p className="text-foreground/50 text-[11px] mt-1 max-w-[220px]">
                    Customer service kami siap menjawab pertanyaan seputar armada, ketersediaan, dan pemesanan.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.senderType === 'USER';
                  const isAdmin = msg.senderType === 'ADMIN';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {!isUser && (
                        <span className="text-[10px] text-foreground/50 mb-1 flex items-center gap-1 font-medium">
                          <Headset size={11} className="text-foreground/70" /> {isAdmin ? 'Admin Rental' : 'Customer Service'}
                        </span>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-foreground text-background rounded-br-none shadow-xs font-medium'
                            : 'bg-card border border-border text-foreground rounded-bl-none shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            {status === 'authenticated' && (
              <form onSubmit={handleSend} className="p-3 bg-card border-t border-border flex gap-2 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  disabled={sending}
                  className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="w-9 h-9 rounded-xl bg-foreground hover:bg-foreground/90 text-background flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-xs"
                  aria-label="Kirim Pesan"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
