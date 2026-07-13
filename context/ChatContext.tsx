'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ChatMessage } from '@/types';

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  markAsRead: (messageId: string) => void;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const markAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  return (
    <ChatContext.Provider value={{ messages, addMessage, markAsRead, unreadCount }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
