'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { MessageProps } from './ChatMessage';

const WELCOME_MESSAGE: MessageProps = {
  sender: 'bot',
  text: 'Halo! Selamat datang di RentalMobil Jogja. Ada yang bisa kami bantu hari ini?',
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
};

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedMessages = localStorage.getItem('rental-chat-history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
        setMessages([WELCOME_MESSAGE]);
      }
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (mounted && messages.length > 0) {
      localStorage.setItem('rental-chat-history', JSON.stringify(messages));
    }
  }, [messages, mounted]);

  // Increment unread count when bot sends message while chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isOpen]);

  // Reset unread count when chat opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = async (text: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMessage: MessageProps = {
      sender: 'user',
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call API endpoint for auto-reply
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get reply');
      }

      const data = await response.json();

      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const botMessage: MessageProps = {
        sender: 'bot',
        text: data.reply || 'Maaf, saya tidak mengerti. Silakan hubungi customer service kami.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback auto-reply if API fails
      await new Promise((resolve) => setTimeout(resolve, 800));
      const fallbackMessage: MessageProps = {
        sender: 'bot',
        text: 'Maaf, terjadi kesalahan. Silakan hubungi kami via WhatsApp di +62 812-3456-7890.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />

      {/* Floating Bubble Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-6 right-6 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 group"
          aria-label="Buka live chat"
        >
          <MessageSquare size={26} className="group-hover:scale-110 transition-transform" />
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></span>
        </button>
      )}
    </>
  );
}
