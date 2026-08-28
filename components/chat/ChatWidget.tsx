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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#f97316] text-white flex items-center justify-center shadow-2xl shadow-[#f97316]/50 hover:bg-[#ea580c] transition-all cursor-pointer border-2 border-white/20"
          aria-label={isOpen ? "Tutup Live Chat" : "Buka Live Chat"}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
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
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[480px] max-h-[calc(100vh-7.5rem)] bg-[#1b1838] border border-[#2a2548] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#13112a] border-b border-[#2a2548] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316]/30 flex items-center justify-center text-[#f97316] shrink-0">
                  <Headset size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Customer Support</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Siap Membantu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-[#2a2548] transition-colors cursor-pointer"
                aria-label="Tutup Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {status === 'unauthenticated' ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#13112a] border border-[#2a2548] flex items-center justify-center mb-3 text-[#f97316]">
                    <User size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-white">Login untuk Mulai Chat</h4>
                  <p className="text-xs text-white/50 mt-1 mb-4 max-w-[240px]">
                    Masuk ke akun Anda agar Customer Service kami dapat mengenali pesanan Anda.
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#f97316]/20"
                  >
                    Masuk Sekarang
                  </Link>
                  <div className="mt-4 pt-4 border-t border-[#2a2548] w-full">
                    <p className="text-[11px] text-white/40 mb-2">Atau hubungi cepat via WhatsApp:</p>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#f97316] font-semibold hover:underline"
                    >
                      WhatsApp Kami <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 size={24} className="text-[#f97316] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-white/50 text-xs">
                  <div className="w-10 h-10 rounded-full bg-[#13112a] border border-[#2a2548] flex items-center justify-center mb-2 text-[#f97316]">
                    <Headset size={18} />
                  </div>
                  <p className="font-semibold text-white/80">Halo! Selamat datang di Rental Mobil Jogja.</p>
                  <p className="text-white/40 text-[11px] mt-1">Customer Service kami siap membantu kebutuhan rental Anda. Silakan ketik pesan di bawah.</p>
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
                        <span className="text-[10px] text-white/50 mb-1 flex items-center gap-1 font-medium">
                          <Headset size={11} className="text-[#f97316]" /> {isAdmin ? 'Admin CS Rental' : 'Customer Service'}
                        </span>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#f97316] text-white rounded-br-none shadow-sm font-medium'
                            : 'bg-[#13112a] border border-[#2a2548] text-white/95 rounded-bl-none shadow-sm'
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
              <form onSubmit={handleSend} className="p-3 bg-[#13112a] border-t border-[#2a2548] flex gap-2 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  disabled={sending}
                  className="flex-1 bg-[#1b1838] border border-[#2a2548] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#f97316]/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="w-9 h-9 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-sm"
                  aria-label="Kirim Pesan"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
