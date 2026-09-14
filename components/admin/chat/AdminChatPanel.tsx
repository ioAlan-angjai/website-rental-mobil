'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, Search, User, Phone, Mail, Clock, CheckCheck,
  Loader2, RefreshCw, ExternalLink, ShieldCheck, Headset
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatItem {
  id: string;
  userId: string;
  status: string;
  handledBy: string;
  updatedAt: string;
  unreadCount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
  };
  lastMessage: {
    id: string;
    message: string;
    senderType: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  messages?: any[];
}

export function AdminChatPanel() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [loadingActiveChat, setLoadingActiveChat] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all chats
  const fetchChats = useCallback(async (showLoading = false) => {
    if (showLoading) setLoadingChats(true);
    try {
      const res = await fetch('/api/admin/chat');
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) {
        setChats(data.chats);
        // Auto select first chat if none selected
        if (!selectedChatId && data.chats.length > 0) {
          setSelectedChatId(data.chats[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin chats:', err);
    } finally {
      if (showLoading) setLoadingChats(false);
    }
  }, [selectedChatId]);

  // Fetch single active chat detail and mark read
  const fetchActiveChat = useCallback(async (chatId: string, showLoading = false) => {
    if (showLoading) setLoadingActiveChat(true);
    try {
      const res = await fetch(`/api/admin/chat/${chatId}`);
      const data = await res.json();
      if (data.success && data.chat) {
        setActiveChat(data.chat);
      }
    } catch (err) {
      console.error('Failed to fetch chat detail:', err);
    } finally {
      if (showLoading) setLoadingActiveChat(false);
    }
  }, []);

  // Initial load and polling
  useEffect(() => {
    fetchChats(true);
    const interval = setInterval(() => {
      fetchChats(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  // When selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      fetchActiveChat(selectedChatId, true);
      const interval = setInterval(() => {
        fetchActiveChat(selectedChatId, false);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatId, fetchActiveChat]);

  // Auto scroll to bottom
  useEffect(() => {
    if (activeChat?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  // Send Reply Handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !replyText.trim() || sendingReply) return;

    const msgToSend = replyText.trim();
    setReplyText('');
    setSendingReply(true);

    try {
      const res = await fetch(`/api/admin/chat/${selectedChatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgToSend }),
      });

      if (res.ok) {
        await fetchActiveChat(selectedChatId, false);
        await fetchChats(false);
        inputRef.current?.focus();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengirim balasan.');
      }
    } catch (err) {
      console.error('Send reply error:', err);
      alert('Terjadi kesalahan saat mengirim balasan.');
    } finally {
      setSendingReply(false);
    }
  };

  // Filtered Chats
  const filteredChats = chats.filter((chat) => {
    const name = (chat.user?.name || '').toLowerCase();
    const email = (chat.user?.email || '').toLowerCase();
    const phone = (chat.user?.phone || '').toLowerCase();
    const lastMsg = (chat.lastMessage?.message || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || phone.includes(query) || lastMsg.includes(query);
  });

  const totalUnreadAll = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[580px] text-zinc-950">
      {/* Top Main Bar */}
      <div className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
            <Headset size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
              Live Chat Customer Support
              {totalUnreadAll > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {totalUnreadAll} Pesan Baru
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-500">Kelola dan balas pertanyaan pelanggan secara real-time</p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchChats(true);
            if (selectedChatId) fetchActiveChat(selectedChatId, true);
          }}
          className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <RefreshCw size={14} className={loadingChats ? 'animate-spin' : ''} />
          Segarkan
        </button>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
        {/* Left Column: Customer Conversations List (5 Cols) */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-zinc-200/80 flex flex-col h-full bg-zinc-50/40">
          {/* Search Box */}
          <div className="p-4 border-b border-zinc-200/80 bg-white">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau pesan..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-100/80 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2 space-y-1">
            {loadingChats && chats.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs space-y-2">
                <Loader2 size={24} className="animate-spin mx-auto text-zinc-600" />
                <p>Memuat percakapan...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs space-y-1">
                <MessageSquare size={28} className="mx-auto text-zinc-300 mb-2" />
                <p className="font-bold text-zinc-600">Belum Ada Percakapan</p>
                <p className="text-[11px]">Chat masuk dari pelanggan akan otomatis muncul di sini.</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === selectedChatId;
                const customerName = chat.user?.name || 'Pelanggan';
                const initial = customerName.charAt(0).toUpperCase();
                const lastMsgText = chat.lastMessage?.message || 'Belum ada pesan';
                const lastMsgTime = chat.lastMessage?.createdAt
                  ? new Date(chat.lastMessage.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-white hover:bg-zinc-100/90 text-zinc-900 border border-zinc-200/60'
                    }`}
                  >
                    {/* User Avatar */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                      }`}
                    >
                      {initial}
                    </div>

                    {/* Chat Preview Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                          {customerName}
                        </h4>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          {lastMsgTime}
                        </span>
                      </div>

                      <p className={`text-xs truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {chat.lastMessage?.senderType === 'ADMIN' ? 'Anda: ' : ''}
                        {lastMsgText}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                        {chat.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Feed & Response Form (8 Cols) */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col h-full bg-white">
          {selectedChatId && activeChat ? (
            <>
              {/* Chat Window Header */}
              <div className="px-6 py-3.5 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                    {(activeChat.user?.name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                      {activeChat.user?.name || 'Pelanggan'}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-3 mt-0.5">
                      {activeChat.user?.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {activeChat.user.email}
                        </span>
                      )}
                      {activeChat.user?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {activeChat.user.phone}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {activeChat.user?.phone && (
                  <a
                    href={`https://wa.me/${activeChat.user.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Phone size={13} />
                    WhatsApp
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
                {loadingActiveChat && !activeChat.messages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-zinc-600" />
                  </div>
                ) : (
                  activeChat.messages?.map((msg: any) => {
                    const isAdmin = msg.senderType === 'ADMIN';
                    const isAI = msg.senderType === 'AI';
                    const timeStr = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : '';

                    if (isAI) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="bg-zinc-100 border border-dashed border-zinc-300 text-zinc-600 rounded-2xl px-4 py-2 text-xs text-center max-w-[85%] italic">
                            <span className="font-bold not-italic block mb-0.5 text-zinc-700">Pesan Otomatis Sistem:</span>
                            {msg.message}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-400 font-medium">
                          {isAdmin ? (
                            <span className="font-bold text-zinc-700 flex items-center gap-1">
                              <ShieldCheck size={12} className="text-zinc-900" /> Anda (Admin CS)
                            </span>
                          ) : (
                            <span className="font-bold text-zinc-700 flex items-center gap-1">
                              <User size={12} /> {activeChat.user?.name || 'Pelanggan'}
                            </span>
                          )}
                          <span>•</span>
                          <span>{timeStr}</span>
                        </div>

                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-zinc-900 text-white rounded-br-none shadow-sm font-medium'
                              : 'bg-white text-zinc-900 border border-zinc-200/90 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className={`whitespace-pre-wrap break-words leading-relaxed ${isAdmin ? 'text-white' : 'text-zinc-900'}`}>{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Input */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-zinc-200/80 bg-white flex items-center gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Ketik balasan untuk ${activeChat.user?.name || 'pelanggan'}... (Tekan Enter untuk kirim)`}
                  disabled={sendingReply}
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                >
                  {sendingReply ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Kirim Balasan
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Pilih Percakapan</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Pilih salah satu percakapan pelanggan di daftar sebelah kiri untuk membaca dan membalas pesan secara langsung.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
