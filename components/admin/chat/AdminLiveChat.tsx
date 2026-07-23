'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare, Send, User, Bot, PhoneCall, RefreshCw,
  Search, ArrowLeft, Hand, XCircle, CheckCircle2, Clock, Loader2,
  MoreVertical, ChevronDown, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ChatSession {
  id: string;
  userId: string;
  status: string;
  handledBy: 'AI' | 'ADMIN';
  updatedAt: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
  };
  messages: Array<{
    id: string;
    message: string;
    createdAt: string;
  }>;
}

interface MessageItem {
  id: string;
  chatId: string;
  senderId: string;
  senderType: string;
  message: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role: string;
  };
}

function relativeTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return format(date, 'dd MMM', { locale: idLocale });
  } catch {
    return '';
  }
}

export function AdminLiveChat() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chats');
      const data = await res.json();
      if (data.success && data.data) {
        setChats((prev) => {
          // Track unread: count new chats or chats with new messages
          const newUnread: Record<string, number> = {};
          for (const c of data.data) {
            const prevChat = prev.find((p) => p.id === c.id);
            if (prevChat && c.messages[0]?.id !== prevChat.messages[0]?.id) {
              newUnread[c.id] = (unreadMap[c.id] || 0) + 1;
            } else if (!prevChat) {
              newUnread[c.id] = 1;
            }
          }
          setUnreadMap((prevMap) => ({ ...prevMap, ...newUnread }));
          return data.data;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/chats/${chatId}/messages`);
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data);
        if (data.chat) {
          setSelectedChat(prev => prev ? { ...prev, handledBy: data.chat.handledBy } : null);
        }
      }
      // Mark as read
      setUnreadMap((prev) => ({ ...prev, [chatId]: 0 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  useEffect(() => {
    if (!selectedChat?.id) return;
    fetchMessages(selectedChat.id);
    const interval = setInterval(() => {
      fetchMessages(selectedChat.id);
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedChat?.id, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Actions ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat || actionLoading) return;

    setActionLoading(true);
    const msg = inputText.trim();
    setInputText('');

    try {
      // Auto take-over jika belum di-handle admin
      if (selectedChat.handledBy !== 'ADMIN') {
        await fetch(`/api/admin/chats/${selectedChat.id}`, { method: 'POST' });
        setSelectedChat((prev) => prev ? { ...prev, handledBy: 'ADMIN' } : null);
      }

      const res = await fetch(`/api/admin/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        fetchChats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTakeOver = async () => {
    if (!selectedChat || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/chats/${selectedChat.id}`, { method: 'POST' });
      if (res.ok) {
        setSelectedChat((prev) => prev ? { ...prev, handledBy: 'ADMIN' } : null);
        fetchChats();
        fetchMessages(selectedChat.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseChat = async () => {
    if (!selectedChat || !confirm('Tutup sesi chat ini?') || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/chats/${selectedChat.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedChat(null);
        setShowMobileList(true);
        fetchChats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectChat = (chat: ChatSession) => {
    setSelectedChat(chat);
    setShowMobileList(false);
    setUnreadMap((prev) => ({ ...prev, [chat.id]: 0 }));
  };

  // --- Filter ---
  const filteredChats = chats.filter((c) => {
    const name = (c.user?.name || 'Guest User').toLowerCase();
    const email = (c.user?.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  // Sorted: AI-handled first (need attention), then by updatedAt
  const sortedChats = [...filteredChats].sort((a, b) => {
    // AI-handled first (priority)
    if (a.handledBy === 'AI' && b.handledBy !== 'AI') return -1;
    if (a.handledBy !== 'AI' && b.handledBy === 'AI') return 1;
    // Then by updatedAt descending
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm relative">
      {/* ===== SIDEBAR - Chat List ===== */}
      <div
        ref={chatListRef}
        className={cn(
          "w-full md:w-[350px] lg:w-[380px] border-r border-zinc-200/80 flex flex-col shrink-0 bg-zinc-50/50 absolute md:relative inset-0 z-10 md:z-auto transition-transform duration-200",
          !showMobileList && "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200/80 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-zinc-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Live Chat CS
              <Badge variant="secondary" className="text-[10px] ml-1 bg-zinc-100 text-zinc-600">
                {chats.length}
              </Badge>
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
              onClick={fetchChats}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {loadingChats ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-zinc-200 rounded w-1/3" />
                    <div className="h-2.5 bg-zinc-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <MessageSquare className="h-10 w-10 text-zinc-300 mb-3" />
              <p className="text-sm font-semibold text-zinc-600">Belum Ada Chat</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
                Chat dari calon penyewa akan muncul di sini secara otomatis.
              </p>
            </div>
          ) : (
            sortedChats.map((c) => {
              const isSelected = selectedChat?.id === c.id;
              const userName = c.user?.name || 'Calon Penyewa';
              const lastMsg = c.messages[0]?.message || 'Percakapan dimulai';
              const timeStr = relativeTime(c.updatedAt);
              const unread = unreadMap[c.id] || 0;
              const needsAttention = c.handledBy === 'AI' && c.status === 'ACTIVE';

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectChat(c)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative",
                    isSelected ? "bg-blue-50/80" : "hover:bg-zinc-100/80",
                    needsAttention && !isSelected && "bg-amber-50/40"
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                  )}
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-zinc-200">
                      <AvatarFallback className={cn(
                        "text-white font-bold text-xs",
                        c.handledBy === 'AI' ? "bg-amber-600" : "bg-emerald-600"
                      )}>
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 truncate max-w-[140px]">
                        {userName}
                        {needsAttention && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                            <Clock size={8} /> AI
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0 ml-2">{timeStr}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{lastMsg}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {c.handledBy === 'ADMIN' ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                          <CheckCircle2 size={8} className="mr-0.5" /> Admin
                        </Badge>
                      ) : c.status === 'CLOSED' ? (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-zinc-100 text-zinc-500 border-zinc-200">
                          Ditutup
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== CHAT AREA ===== */}
      {selectedChat ? (
        <div className={cn(
          "flex-1 flex flex-col bg-white w-full",
          showMobileList && "hidden md:flex"
        )}>
          {/* Chat Header */}
          <div className="p-3 md:p-4 border-b border-zinc-200/80 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile back button */}
              <button
                onClick={() => setShowMobileList(true)}
                className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-zinc-100 text-zinc-600"
              >
                <ArrowLeft size={18} />
              </button>

              <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-zinc-200 shrink-0">
                <AvatarFallback className={cn(
                  "text-white font-bold text-xs",
                  selectedChat.handledBy === 'AI' ? "bg-amber-600" : "bg-emerald-600"
                )}>
                  {(selectedChat.user?.name || 'C').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-zinc-900 truncate flex items-center gap-2">
                  {selectedChat.user?.name || 'Calon Penyewa'}
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block shrink-0" title="Online" />
                </h3>
                <p className="text-[11px] text-zinc-500 truncate">
                  {selectedChat.handledBy === 'AI' ? 'Chatbot AI — perlu di-take over' : 'Admin sedang menangani'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {selectedChat.handledBy === 'AI' && selectedChat.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTakeOver}
                  disabled={actionLoading}
                  className="text-xs gap-1.5 h-8 border-zinc-300"
                >
                  <Hand size={13} />
                  <span className="hidden sm:inline">Take Over</span>
                </Button>
              )}
              {selectedChat.status === 'ACTIVE' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  disabled={actionLoading}
                  className="text-xs gap-1.5 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle size={13} />
                  <span className="hidden sm:inline">Tutup</span>
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-zinc-50/50">
            {loadingMessages ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse items-start">
                    <div className="w-7 h-7 rounded-full bg-zinc-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-8 bg-zinc-200 rounded-2xl w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-xs text-zinc-500">Belum ada pesan. Mulai percakapan dengan mengirim pesan pertama.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isAdmin = m.senderType === 'ADMIN';
                const isAI = m.senderType === 'AI';
                const timeStr = relativeTime(m.createdAt);

                return (
                  <div key={m.id} className={cn("flex gap-2 items-end max-w-[85%] md:max-w-[75%]", (isAdmin) ? "ml-auto flex-row-reverse" : "")}>
                    <Avatar className="h-6 w-6 md:h-7 md:w-7 border shrink-0">
                      <AvatarFallback className={cn(
                        "text-[10px] font-bold text-white",
                        isAdmin ? "bg-blue-600" : isAI ? "bg-emerald-600" : "bg-zinc-800"
                      )}>
                        {isAdmin ? <User size={12} /> : isAI ? <Bot size={12} /> : <User size={12} />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col space-y-1", isAdmin && "items-end")}>
                      <div
                        className={cn(
                          "px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-sm break-words",
                          isAdmin
                            ? "bg-blue-600 text-white rounded-br-none"
                            : isAI
                            ? "bg-emerald-600 text-white rounded-bl-none"
                            : "bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-none"
                        )}
                      >
                        {m.message}
                      </div>
                      <span className="text-[9px] text-zinc-400 px-1">{timeStr}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {selectedChat.status === 'ACTIVE' && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200/80 bg-white shrink-0">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  placeholder="Balas pesan calon penyewa..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs resize-none max-h-[100px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white placeholder:text-zinc-400 leading-relaxed"
                  style={{ minHeight: '38px' }}
                  disabled={actionLoading}
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim() || actionLoading}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl w-10 h-10 p-0 shrink-0 shadow-sm"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className={cn(
          "flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-zinc-50/30",
          showMobileList && "hidden"
        )}>
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="font-bold text-base text-zinc-700">Pilih Percakapan</h3>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
            Pilih percakapan di sebelah kiri untuk melihat riwayat pesan atau mengambil alih chat dari AI chatbot.
          </p>
          <div className="flex gap-6 mt-6 text-left">
            <div className="text-[11px] text-zinc-500 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                <span>AI Chat = perlu respon admin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Sedang ditangani admin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Unread messages</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
