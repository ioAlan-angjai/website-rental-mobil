// app/api/chat/route.ts
import { NextResponse } from 'next/server';

const AUTO_REPLIES = [
  {
    keywords: ['harga', 'tarif', 'biaya', 'sewa', 'berapa'],
    reply: 'Harga sewa mobil kami mulai dari Rp 300.000 per hari untuk city car, hingga Rp 1.100.000 untuk microbus. Harga sudah termasuk asuransi, namun BBM belum termasuk. Silakan cek halaman Armada untuk detail lengkap.',
  },
  {
    keywords: ['syarat', 'dokumen', 'ktp', 'sim', 'persyaratan'],
    reply: 'Untuk sewa lepas kunci: KTP, SIM A yang masih valid, dan deposit jaminan. Untuk sewa dengan driver: cukup KTP saja. Proses verifikasi sangat mudah dan cepat!',
  },
  {
    keywords: ['driver', 'sopir', 'pengemudi'],
    reply: 'Kami menyediakan layanan sewa dengan driver profesional yang ramah dan berpengalaman. Durasi 12 jam per hari (08.00-20.00 WIB). Driver paham rute wisata di Jogja dan sekitarnya.',
  },
  {
    keywords: ['lepas kunci', 'tanpa driver', 'sendiri'],
    reply: 'Layanan lepas kunci memungkinkan Anda berkendara sendiri dengan bebas. Durasi sewa 24 jam penuh. Mobil diserahkan dalam kondisi full tank dan harus dikembalikan full tank juga.',
  },
  {
    keywords: ['booking', 'pesan', 'reservasi'],
    reply: 'Anda bisa booking langsung melalui halaman Booking di website kami, atau hubungi kami via WhatsApp di +62 812-3456-7890 untuk respon lebih cepat.',
  },
  {
    keywords: ['alamat', 'lokasi', 'kantor', 'dimana'],
    reply: 'Kantor kami berlokasi di Jl. Kaliurang KM 5.5, Sleman, Yogyakarta 55281. Kami juga menyediakan layanan antar-jemput ke bandara, stasiun, atau hotel Anda.',
  },
  {
    keywords: ['jam', 'buka', 'operasional', 'tutup'],
    reply: 'Kami buka setiap hari dari jam 08.00 - 21.00 WIB. Untuk kebutuhan darurat di luar jam operasional, Anda bisa hubungi kami via WhatsApp.',
  },
  {
    keywords: ['bbm', 'bensin', 'bahan bakar'],
    reply: 'BBM tidak termasuk dalam harga sewa. Mobil diserahkan dalam kondisi full tank dan harus dikembalikan dalam kondisi full tank.',
  },
  {
    keywords: ['asuransi', 'jaminan', 'kerusakan'],
    reply: 'Semua mobil kami sudah tercover asuransi all risk. Namun untuk sewa lepas kunci, diperlukan deposit jaminan yang akan dikembalikan setelah mobil diserahkan dalam kondisi baik.',
  },
  {
    keywords: ['terima kasih', 'thanks', 'makasih'],
    reply: 'Sama-sama! Senang bisa membantu Anda. Jangan ragu untuk menghubungi kami jika ada pertanyaan lain.',
  },
];

const DEFAULT_REPLY = 'Terima kasih atas pertanyaan Anda. Untuk informasi lebih detail, silakan hubungi customer service kami di +62 812-3456-7890 (WhatsApp) atau email ke info@rentalmobiljogja.com';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    const lowerMessage = message.toLowerCase();

    // Find matching auto-reply
    let reply = DEFAULT_REPLY;
    for (const autoReply of AUTO_REPLIES) {
      if (autoReply.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        reply = autoReply.reply;
        break;
      }
    }

    // Log chat to console (in production, you might want to log to a file or database)
    console.log(`[CHAT] User: ${message}`);
    console.log(`[CHAT] Bot: ${reply}`);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
