'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Bot, PhoneCall, RefreshCw, Search, CheckCircle, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ChatSession {
  id: string;
  userId: string;
  status: string;
  handledBy: 'AI' | 'ADMIN';
  updatedAt: string;
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

export function AdminLiveChat() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chats');
      const data = await res.json();
      if (data.success && data.data) {
        setChats(data.data);
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
          setSelectedChat(prev => prev ? ({ ...prev, handledBy: data.chat.handledBy }) : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat?.id, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat || actionLoading) return;

    setActionLoading(true);
    const msg = inputText.trim();
    setInputText('');

    try {
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
        fetchChats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredChats = chats.filter((c) => {
    const name = (c.user?.name || 'Guest User').toLowerCase();
    const email = (c.user?.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="flex h-[calc(100vh-100px)] rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm">
      <div className="w-80 border-r border-zinc-200/80 flex flex-col shrink-0 bg-zinc-50/50">
        <div className="p-4 border-b border-zinc-200/80 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-zinc-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Live Chat CS
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-zinc-50 border-zinc-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {loadingChats ? (
            <div className="p-8 text-center text-xs text-zinc-400">Memuat percakapan...</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">Belum ada chat masuk</div>
          ) : (
            filteredChats.map((c) => {
              const isSelected = selectedChat?.id === c.id;
              const userName = c.user?.name || 'Calon Penyewa';
              const lastMsg = c.messages[0]?.message || 'Percakapan dimulai';
              const timeStr = c.updatedAt ? format(parseISO(c.updatedAt), 'HH:mm', { locale: idLocale }) : '';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedChat(c)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-zinc-100/80",
                    isSelected && "bg-blue-50/80 border-l-4 border-blue-600"
                  )}
                >
                  <Avatar className="h-10 w-10 border border-zinc-200 shrink-0">
                    <AvatarFallback className="bg-zinc-900 text-white font-bold text-xs">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 truncate">{userName}</span>
                      <span className="text-[10px] text-zinc-400">{timeStr}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{lastMsg}</p>
                    <Badge variant="outline" className={cn("mt-1.5 text-[9px] px-1.5 py-0 font-semibold", c.handledBy === 'AI' ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')}>
                      {c.handledBy}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-zinc-200/80 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-zinc-200">
                <AvatarFallback className="bg-zinc-900 text-white font-bold text-xs">{(selectedChat.user?.name || 'C').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-sm text-zinc-900">{selectedChat.user?.name || 'Calon Penyewa'}</h3>
                <p className="text-xs text-zinc-500">{selectedChat.handledBy === 'AI' ? 'Sesi AI Chatbot' : 'Admin sedang menangani'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedChat.handledBy === 'AI' && (
                <Button variant="outline" size="sm" onClick={handleTakeOver} disabled={actionLoading} className="text-xs gap-1.5">
                  <Hand size={14} /> Take Over
                </Button>
              )}
              {selectedChat.status === 'ACTIVE' && (
                <Button variant="destructive" size="sm" onClick={handleCloseChat} disabled={actionLoading} className="text-xs gap-1.5">
                  Tutup Chat
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
            {loadingMessages ? (
              <div className="p-8 text-center text-xs text-zinc-400">Memuat riwayat...</div>
            ) : (
              messages.map((m) => {
                const isAdmin = m.senderType === 'ADMIN';
                const isAI = m.senderType === 'AI';
                const timeStr = m.createdAt ? format(parseISO(m.createdAt), 'HH:mm', { locale: idLocale }) : '';

                return (
                  <div key={m.id} className={cn("flex gap-2.5 items-end max-w-[75%]", (isAdmin || isAI) ? "ml-auto flex-row-reverse" : "")}>
                    <Avatar className="h-7 w-7 border shrink-0">
                      <AvatarFallback className={cn("text-[10px] font-bold text-white", isAdmin ? "bg-blue-600" : isAI ? "bg-emerald-600" : "bg-zinc-800")}>
                        {isAdmin ? <User size={14} /> : isAI ? <Bot size={14} /> : <User size={14} />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col space-y-1", (isAdmin || isAI) && "items-end")}>
                      <div className={cn("px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-sm", isAdmin ? "bg-blue-600 text-white rounded-br-none" : isAI ? "bg-emerald-600 text-white rounded-br-none" : "bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-none")}>
                        {m.message}
                      </div>
                      <span className="text-[10px] text-zinc-400 px-1">{timeStr}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedChat.status === 'ACTIVE' && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200/80 bg-white flex gap-2">
              <Input
                placeholder="Balas pesan calon penyewa..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-zinc-50 border-zinc-200 h-10 text-xs rounded-xl focus:bg-white"
              />
              <Button type="submit" disabled={!inputText.trim() || actionLoading} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-10 px-4">
                <Send size={16} />
              </Button>
            </form>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-50/30">
          <MessageSquare className="h-12 w-12 text-zinc-300 mb-3" />
          <h3 className="font-bold text-sm text-zinc-700">Pilih Chat</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">Pilih percakapan di sebelah kiri untuk melihat riwayat atau mengambil alih chat dari AI.</p>
        </div>
      )}
    </div>
  );
}
