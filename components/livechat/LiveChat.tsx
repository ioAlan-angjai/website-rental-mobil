'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { MessageProps, QuickOption } from './ChatMessage';

// Utility: generate UUID-like guest ID
function generateGuestId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'guest_';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility: ambil atau buat guest session ID dari sessionStorage
function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'guest_ssr';
  const key = 'rental-guest-session-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = generateGuestId();
    sessionStorage.setItem(key, id);
  }
  return id;
}

const WELCOME_MESSAGE: MessageProps = {
  sender: 'bot',
  text: 'Halo! Selamat datang di **RentalMobil Jogja**\n\nSaya adalah asisten virtual kami. Silakan tanya seputar:\n- Harga & paket sewa\n- Syarat & ketentuan\n- Proses booking\n- Pembayaran & DP\n- Denda keterlambatan\n- Jam operasional\n\nKetik pesan Anda langsung di bawah ini:',
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_OPTIONS: QuickOption[] = [
  { label: 'Cek Ketersediaan Mobil', action: 'CHECK_AVAILABILITY' },
  { label: 'Syarat & Ketentuan Sewa', action: 'VIEW_TERMS' },
  { label: 'Daftar Harga & Paket', action: 'VIEW_PRICING' },
  { label: 'Status Pesanan Saya', action: 'CHECK_STATUS' },
  { label: 'Hubungi CS / Admin', action: 'CONNECT_CS' },
];

type WizardStep = 'IDLE' | 'STEP_START_DATE' | 'STEP_END_DATE' | 'STEP_SERVICE_TYPE' | 'STEP_LOCATION' | 'COMPLETED';

interface BookingFormData {
  startDate?: string;
  endDate?: string;
  serviceType?: string;
  location?: string;
}

interface ChatMessageFromAPI {
  id: string;
  message: string;
  senderType: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  createdAt: string;
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [handledBy, setHandledBy] = useState<'AI' | 'ADMIN'>('AI');
  const [chatStatus, setChatStatus] = useState<string>('ACTIVE');
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const pathname = usePathname();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Guest session ID — persistent per session (sessionStorage)
  const guestIdRef = useRef<string | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>('IDLE');
  const [bookingData, setBookingData] = useState<BookingFormData>({});

  // Convert API message to UI format
  // API senderType: 'USER' | 'ADMIN' | 'AI'
  // UI sender:      'user' | 'admin' | 'bot'
  const formatMessageFromAPI = useCallback((msg: ChatMessageFromAPI): MessageProps => {
    const timestamp = new Date(msg.createdAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let sender: 'user' | 'bot' | 'admin';
    if (msg.senderType === 'AI') {
      sender = 'bot';
    } else if (msg.senderType === 'ADMIN') {
      sender = 'admin';
    } else {
      sender = 'user';
    }

    return {
      sender,
      text: msg.message,
      timestamp,
    };
  }, []);

  // HTTP helper: fetch dengan guest header
  const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
    const guestId = guestIdRef.current;
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };
    // Selalu kirim guest session ID sebagai header isolasi
    if (guestId) {
      headers['x-guest-session-id'] = guestId;
    }
    return fetch(url, { ...options, headers });
  }, []);

  // Fetch chat session from DB
  const fetchChatSession = useCallback(async () => {
    try {
      const res = await apiFetch('/api/chat');
      const data = await res.json();

      if (data.success && data.chat) {
        setChatId(data.chat.id);
        setHandledBy(data.chat.handledBy || 'AI');
        setChatStatus(data.chat.status || 'ACTIVE');

        if (data.chat.messages && data.chat.messages.length > 0) {
          const uiMessages = data.chat.messages.map((m: any) => ({
            id: m.id,
            message: m.message,
            senderType: m.senderType,
            senderId: m.senderId,
            sender: m.sender,
            createdAt: m.createdAt,
          }));

          setMessages(uiMessages.map(formatMessageFromAPI));
          setLastMessageCount(uiMessages.length);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat session:', err);
    }
  }, [apiFetch, formatMessageFromAPI]);

  // Poll for new messages (for real-time update)
  const pollForMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const res = await apiFetch('/api/chat');
      const data = await res.json();

      if (data.success && data.chat) {
        setHandledBy(data.chat.handledBy || 'AI');
        setChatStatus(data.chat.status || 'ACTIVE');

        // Gunakan messageCount dari server untuk sinkronisasi yang akurat
        if (data.messageCount !== undefined && data.messageCount > lastMessageCount) {
          // Fetch ulang semua pesan jika ada selisih di DB
          await fetchChatSession();
          setLastMessageCount(data.messageCount);
          
          // Notif unread
          if (!isOpen) setUnreadCount((prev) => prev + 1);
        }

        // Jika chat ditutup
        if (data.chat.status === 'CLOSED') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }
    } catch {
      // Silent fail for polling
    }
  }, [chatId, lastMessageCount, isOpen, formatMessageFromAPI, apiFetch]);

  // Init guest session ID
  useEffect(() => {
    guestIdRef.current = getOrCreateGuestId();
  }, []);

  // Initial fetch
  useEffect(() => {
    if (guestIdRef.current) {
      fetchChatSession();
    }
  }, [fetchChatSession]);

  // Polling interval
  useEffect(() => {
    if (chatId && chatStatus === 'ACTIVE') {
      pollingRef.current = setInterval(pollForMessages, 3000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [chatId, chatStatus, pollForMessages]);

  // Mount handler
  useEffect(() => {
    setMounted(true);
  }, []);

  // Unread badge reset
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Kirim pesan dan dapatkan respons AI
  const sendMessage = async (text: string) => {
    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (data.success) {
        // Tambah pesan user secara lokal (segera)
        const userMsg: MessageProps = {
          sender: 'user',
          text,
          timestamp: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, userMsg]);

        // Sinkron lastMessageCount dari server (termasuk AI response yg sudah di-DB)
        if (data.messageCount !== undefined) {
          setLastMessageCount(data.messageCount);
        } else {
          setLastMessageCount((prev) => prev + 1);
        }

        // Jika AI merespon langsung
        if (data.aiResponse) {
          setIsTyping(true);
          await new Promise((resolve) => setTimeout(resolve, 800));
          setIsTyping(false);

          const botMsg: MessageProps = {
            sender: 'bot',
            text: data.aiResponse,
            timestamp: new Date().toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
          setMessages((prev) => [...prev, botMsg]);
          setLastMessageCount((prev) => prev + 1);
        }

        // Update handledBy
        if (data.handledBy) {
          setHandledBy(data.handledBy);
        }
      }
    } catch {
      // Tambah error message lokal
      const errorMsg: MessageProps = {
        sender: 'bot',
        text: 'Terjadi gangguan jaringan. Pesan tidak terkirim. Silakan coba lagi.',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Handle user text input
  const handleSendMessage = async (text: string) => {
    // Wizard step handling
    if (wizardStep === 'STEP_START_DATE') {
      setBookingData((prev) => ({ ...prev, startDate: text }));
      setWizardStep('STEP_END_DATE');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Catatan diterima! Sekarang silakan ketik **Tanggal & Jam Selesai Sewa** (Contoh: 27 Juli 2026, 18:00 WIB):',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    if (wizardStep === 'STEP_END_DATE') {
      setBookingData((prev) => ({ ...prev, endDate: text }));
      setWizardStep('STEP_SERVICE_TYPE');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Pilih **Jenis Layanan** yang Anda butuhkan:',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: 'Lepas Kunci', action: 'SELECT_SERVICE', value: 'Lepas Kunci' },
            { label: 'Dengan Driver', action: 'SELECT_SERVICE', value: 'Dengan Driver' },
          ],
        },
      ]);
      return;
    }

    if (wizardStep === 'STEP_LOCATION') {
      const updatedData = { ...bookingData, location: text };
      setBookingData(updatedData);
      setWizardStep('COMPLETED');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      const summary = `Ringkasan Pengajuan Sewa:\n\nMulai: ${updatedData.startDate}\nSelesai: ${updatedData.endDate}\nLayanan: ${updatedData.serviceType}\nLokasi: ${updatedData.location}\n\nSilakan hubungi CS kami untuk menyelesaikan booking. Klik tombol di bawah atau ketik "CS" atau "admin".`;

      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: summary,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          options: [
            { label: 'Hubungi Live Admin CS', action: 'CONNECT_CS' },
            { label: 'Isi Ulang Formulir', action: 'CHECK_AVAILABILITY' },
          ],
        },
      ]);
      return;
    }

    // Default: kirim pesan ke AI backend
    setIsTyping(true);
    await sendMessage(text);
    setIsTyping(false);
  };

  // Handle option button clicks
  const handleOptionClick = async (option: QuickOption) => {
    // Tambah user message lokal
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: option.label,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    switch (option.action) {
      case 'CHECK_AVAILABILITY':
        setWizardStep('STEP_START_DATE');
        setBookingData({});
        setIsTyping(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'Mari kami bantu cek ketersediaan unit.\n\nLangkah 1 dari 4:\nSilakan masukkan **Tanggal & Jam Mulai Sewa** (Contoh: 25 Juli 2026, 09:00 WIB):',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        break;

      case 'SELECT_SERVICE':
        const serviceVal = option.value || option.label;
        setBookingData((prev) => ({ ...prev, serviceType: serviceVal }));
        setWizardStep('STEP_LOCATION');
        setIsTyping(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `Pilihan layanan: **${serviceVal}**\n\nLangkah 4 dari 4:\nSilakan masukkan **Lokasi Penjemputan / Pengembalian** (Contoh: Bandara YIA / Stasiun Tugu / Hotel):`,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        break;

      case 'VIEW_TERMS':
        setIsTyping(true);
        await sendMessage('Apa saja syarat dan ketentuan sewa mobil?');
        setIsTyping(false);
        break;

      case 'VIEW_PRICING':
        setIsTyping(true);
        await sendMessage('Berapa harga sewa mobil di RentalMobil Jogja?');
        setIsTyping(false);
        break;

      case 'CHECK_STATUS':
        setIsTyping(true);
        await sendMessage('Bagaimana cara mengecek status pesanan saya?');
        setIsTyping(false);
        break;

      case 'CONNECT_CS':
        setIsTyping(true);
        await sendMessage('Saya ingin berbicara dengan admin atau customer service');
        setIsTyping(false);
        break;

      case 'RESET_MENU':
        setWizardStep('IDLE');
        setBookingData({});
        setIsTyping(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'Silakan tanyakan apa saja tentang layanan rental kami:',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            options: QUICK_OPTIONS,
          },
        ]);
        break;

      default:
        break;
    }
  };

  if (!mounted) return null;

  // Don't render on admin pages — must be after all hooks
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/livechat-cs')) return null;

  // Status text
  const statusText =
    handledBy === 'ADMIN' && chatStatus === 'ACTIVE'
      ? 'Admin CS Online'
      : handledBy === 'ADMIN' && chatStatus === 'CLOSED'
      ? 'Sesi Chat Ditutup'
      : 'Bot CS Aktif 24/7';

  return (
    <>
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onOptionClick={handleOptionClick}
        isTyping={isTyping}
        statusText={statusText}
        handledBy={handledBy}
      />

      {/* Floating Bubble Button */}
      {!isOpen && chatStatus !== 'CLOSED' && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 group border border-zinc-700/50"
          aria-label="Buka Widget Chat"
        >
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform text-white" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Pulse Ring */}
          <span className="absolute inset-0 rounded-full bg-zinc-900 animate-ping opacity-25 -z-10"></span>
        </button>
      )}
    </>
  );
}
