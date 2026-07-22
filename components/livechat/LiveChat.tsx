'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { MessageProps, QuickOption } from './ChatMessage';

const INITIAL_QUICK_OPTIONS: QuickOption[] = [
  { label: '🔍 Cek Ketersediaan Mobil', action: 'CHECK_AVAILABILITY' },
  { label: '📜 Syarat & Ketentuan Sewa', action: 'VIEW_TERMS' },
  { label: '💰 Daftar Harga & Paket', action: 'VIEW_PRICING' },
  { label: '📦 Status Pesanan Saya', action: 'CHECK_STATUS' },
  { label: '💬 Bicara dengan CS / Admin', action: 'CONNECT_CS' },
];

const WELCOME_MESSAGE: MessageProps = {
  sender: 'bot',
  text: 'Halo! Selamat datang di RentalMobil Jogja 👋\nSaya adalah asisten virtual bot kami. Pilih kebutuhan Anda di bawah ini atau ketik pesan Anda langsung:',
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  options: INITIAL_QUICK_OPTIONS,
};

type WizardStep = 'IDLE' | 'STEP_START_DATE' | 'STEP_END_DATE' | 'STEP_SERVICE_TYPE' | 'STEP_LOCATION' | 'COMPLETED';

interface BookingFormData {
  startDate?: string;
  endDate?: string;
  serviceType?: string;
  location?: string;
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Wizard state for multi-step data collection
  const [wizardStep, setWizardStep] = useState<WizardStep>('IDLE');
  const [bookingData, setBookingData] = useState<BookingFormData>({});
  const [isLiveAdmin, setIsLiveAdmin] = useState(false);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedMessages = sessionStorage.getItem('rental-chat-history-v2');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        setMessages([WELCOME_MESSAGE]);
      }
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (mounted && messages.length > 0) {
      sessionStorage.setItem('rental-chat-history-v2', JSON.stringify(messages));
    }
  }, [messages, mounted]);

  // Unread badge logic
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const addBotMessage = async (
    text: string,
    options?: QuickOption[],
    whatsappUrl?: string
  ) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const botMsg: MessageProps = {
      sender: 'bot',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      options,
      whatsappUrl,
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  const addUserMessage = (text: string) => {
    const userMsg: MessageProps = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  // Handle freeform user input (typed message)
  const handleSendMessage = async (text: string) => {
    addUserMessage(text);

    // If wizard is active, handle input as step response
    if (wizardStep === 'STEP_START_DATE') {
      setBookingData((prev) => ({ ...prev, startDate: text }));
      setWizardStep('STEP_END_DATE');
      await addBotMessage('Catatan diterima! Sekarang silakan ketik **Tanggal & Jam Selesai Sewa** (Contoh: 27 Juli 2026, 18:00 WIB):');
      return;
    }

    if (wizardStep === 'STEP_END_DATE') {
      setBookingData((prev) => ({ ...prev, endDate: text }));
      setWizardStep('STEP_SERVICE_TYPE');
      await addBotMessage(
        'Pilih **Jenis Layanan** yang Anda butuhkan:',
        [
          { label: '🔑 Lepas Kunci', action: 'SELECT_SERVICE', value: 'Lepas Kunci' },
          { label: '👨‍✈️ Dengan Driver', action: 'SELECT_SERVICE', value: 'Dengan Driver' },
        ]
      );
      return;
    }

    if (wizardStep === 'STEP_LOCATION') {
      const updatedData = { ...bookingData, location: text };
      setBookingData(updatedData);
      setWizardStep('COMPLETED');

      const waSummary = `Halo CS RentalMobil Jogja, saya ingin cek ketersediaan armada dengan rincian berikut:%0A- Mulai: ${encodeURIComponent(updatedData.startDate || '-')}%0A- Selesai: ${encodeURIComponent(updatedData.endDate || '-')}%0A- Layanan: ${encodeURIComponent(updatedData.serviceType || '-')}%0A- Lokasi: ${encodeURIComponent(updatedData.location || '-')}`;
      const waUrl = `https://wa.me/6281234567890?text=${waSummary}`;

      await addBotMessage(
        `🎉 Terima kasih! Ringkasan pengajuan sewa Anda:\n\n🗓️ **Mulai**: ${updatedData.startDate}\n🏁 **Selesai**: ${updatedData.endDate}\n🚗 **Layanan**: ${updatedData.serviceType}\n📍 **Lokasi**: ${updatedData.location}\n\nSilakan teruskan ke WhatsApp CS Official atau beralih ke Live Chat Admin.`,
        [
          { label: '💬 Hubungi Live Admin CS', action: 'CONNECT_CS' },
          { label: '🔄 Isi Ulang Formulir', action: 'CHECK_AVAILABILITY' },
        ],
        waUrl
      );
      return;
    }

    // Default Bot Auto Reply logic or Live Admin API
    if (isLiveAdmin) {
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
      } catch (err) {}
    } else {
      // Basic keyword matching fallback
      const lower = text.toLowerCase();
      if (lower.includes('harga') || lower.includes('biaya') || lower.includes('paket')) {
        handleOptionClick({ label: 'Daftar Harga', action: 'VIEW_PRICING' });
      } else if (lower.includes('syarat') || lower.includes('ketentuan') || lower.includes('ktp')) {
        handleOptionClick({ label: 'Syarat Sewa', action: 'VIEW_TERMS' });
      } else if (lower.includes('booking') || lower.includes('sewa') || lower.includes('mobil')) {
        handleOptionClick({ label: 'Cek Ketersediaan', action: 'CHECK_AVAILABILITY' });
      } else if (lower.includes('admin') || lower.includes('cs') || lower.includes('bantuan')) {
        handleOptionClick({ label: 'Bicara dengan CS', action: 'CONNECT_CS' });
      } else {
        await addBotMessage(
          'Terima kasih! Pesan Anda telah tercatat. Pilih opsi berikut atau hubungi tim CS kami:',
          INITIAL_QUICK_OPTIONS
        );
      }
    }
  };

  // Handle option button clicks
  const handleOptionClick = async (option: QuickOption) => {
    addUserMessage(option.label);

    switch (option.action) {
      case 'CHECK_AVAILABILITY':
        setWizardStep('STEP_START_DATE');
        setBookingData({});
        await addBotMessage(
          'Mari kami bantu cek ketersediaan unit 🚗\n\nLangkah 1 dari 4:\nSilakan masukkan **Tanggal & Jam Mulai Sewa** (Contoh: 25 Juli 2026, 09:00 WIB):'
        );
        break;

      case 'SELECT_SERVICE':
        const serviceVal = option.value || option.label;
        setBookingData((prev) => ({ ...prev, serviceType: serviceVal }));
        setWizardStep('STEP_LOCATION');
        await addBotMessage(
          `Pilihan layanan: **${serviceVal}** 👍\n\nLangkah 4 dari 4:\nSilakan masukkan **Lokasi Penjemputan / Pengembalian** (Contoh: Bandara YIA / Stasiun Tugu / Hotel):`
        );
        break;

      case 'VIEW_TERMS':
        await addBotMessage(
          '📜 **Syarat & Ketentuan Sewa Mobil Jogja:**\n\n1. **Lepas Kunci**:\n   - e-KTP & SIM A Asli\n   - Identitas penjamin (KTM/NPWP/Passport/Kartu Pegawai)\n   - Akun Sosial Media Aktif\n2. **Dengan Driver**:\n   - Tanpa jaminan dokumen (Driver profesional kami siap melayani).\n3. **Pembayaran**:\n   - DP 50% saat konfirmasi booking.',
          [
            { label: '🔍 Cek Ketersediaan Mobil', action: 'CHECK_AVAILABILITY' },
            { label: '💬 Hubungi CS / Admin', action: 'CONNECT_CS' },
          ]
        );
        break;

      case 'VIEW_PRICING':
        await addBotMessage(
          '💰 **Daftar Harga & Paket Rental:**\n\n• **City Car (Brio/Agya/Ayla)**:\n   - Lepas Kunci: Rp 300.000 / hari\n   - Inc Driver: Rp 450.000 / 12 jam\n• **MPV (Avanza/Xpander/Ertiga)**:\n   - Lepas Kunci: Rp 400.000 / hari\n   - Inc Driver: Rp 550.000 / 12 jam\n• **Premium (Fortuner/Pajero/Innovia)**:\n   - Lepas Kunci: Rp 800.000 / hari\n   - Inc Driver: Rp 1.100.000 / 12 jam',
          [
            { label: '🔍 Cek Ketersediaan Mobil', action: 'CHECK_AVAILABILITY' },
            { label: '💬 Hubungi CS / Admin', action: 'CONNECT_CS' },
          ]
        );
        break;

      case 'CHECK_STATUS':
        await addBotMessage(
          '📦 Untuk mengecek status pesanan Anda:\n\n1. Anda dapat melihat riwayat booking di menu akun Anda.\n2. Atau ketik **Nomor Booking ID** Anda di sini untuk dibantu CS kami.',
          [
            { label: '💬 Tanyakan ke CS Admin', action: 'CONNECT_CS' },
          ]
        );
        break;

      case 'CONNECT_CS':
        setIsLiveAdmin(true);
        const waUrl = 'https://wa.me/6281234567890?text=Halo%20CS%20RentalMobil%20Jogja%2C%20saya%20butuh%20bantuan%20terkait%20pemesanan';
        await addBotMessage(
          '💬 **Menghubungkan ke Customer Service (Live Admin)**...\n\nPesan Anda telah diteruskan ke Dasbor Admin CS kami. Tim kami akan membalas pesan Anda di sini secara langsung, atau Anda dapat menghubungi kami via WhatsApp Official.',
          [
            { label: '🔄 Kembali ke Menu Utama', action: 'RESET_MENU' },
          ],
          waUrl
        );

        // Call backend API to initiate live chat session
        try {
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'User meminta dukungan Live CS Admin' }),
          });
        } catch (err) {}
        break;

      case 'RESET_MENU':
        setWizardStep('IDLE');
        setBookingData({});
        await addBotMessage(
          'Menu telah diperbarui. Silakan pilih opsi kebutuhan Anda:',
          INITIAL_QUICK_OPTIONS
        );
        break;

      default:
        await addBotMessage('Silakan pilih opsi menu di bawah ini:', INITIAL_QUICK_OPTIONS);
        break;
    }
  };

  if (!mounted) return null;

  return (
    <>
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onOptionClick={handleOptionClick}
        isTyping={isTyping}
        statusText={isLiveAdmin ? '🟢 Admin CS Online' : 'Bot CS Aktif 24/7'}
      />

      {/* Floating Bubble Button */}
      {!isOpen && (
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
