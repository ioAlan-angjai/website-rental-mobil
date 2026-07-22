/**
 * AI Chatbot Engine — RentalMobil Jogja
 *
 * Sistem NLP berbasis intent recognition dengan knowledge base terstruktur.
 * Dirancang untuk: menjawab pertanyaan rental mobil, syarat sewa, harga,
 * pembayaran, DP, denda, jam operasional, dsb.
 *
 * Dapat di-upgrade ke LLM (Gemini/GPT) tanpa mengubah antarmuka.
 */

import prisma from "@/lib/prisma";

// ────────────────────────────────────────────
// Tipe Data
// ────────────────────────────────────────────

export interface ChatContext {
  chatId: string;
  userId: string;
  history: ChatHistoryEntry[];
  handledBy: "AI" | "ADMIN";
}

export interface ChatHistoryEntry {
  role: "user" | "assistant" | "admin";
  message: string;
}

export interface AIResponse {
  message: string;
  shouldEscalate: boolean;
}

// ────────────────────────────────────────────
// Knowledge Base — RentalMobil Jogja
// ────────────────────────────────────────────

interface KnowledgeEntry {
  keywords: string[];
  intents: string[];
  getResponse: (query: string, context?: ChatContext) => string;
}

const OPERATIONAL_HOURS = `
**Jam Operasional RentalMobil Jogja:**
• Senin — Jumat: 08.00 — 21.00 WIB
• Sabtu — Minggu: 08.00 — 21.00 WIB
• Layanan Darurat 24 Jam: +62 812-3456-7890 (WhatsApp)

Anda bisa menghubungi kami via Live Chat atau WhatsApp di jam operasional tersebut.`;

const PRICING_INFO = `
**Daftar Harga Sewa Mobil Jogja:**

• **City Car (Brio/Agya/Ayla)**:
  - Lepas Kunci: Rp 150.000 — 200.000 /hari
  - Dengan Driver: Rp 300.000 — 350.000 /12 jam

• **MPV (Avanza/Xpander/Innova)**:
  - Lepas Kunci: Rp 250.000 — 400.000 /hari
  - Dengan Driver: Rp 450.000 — 550.000 /12 jam

• **SUV (Fortuner/Pajero/Terios)**:
  - Lepas Kunci: Rp 400.000 — 800.000 /hari
  - Dengan Driver: Rp 600.000 — 1.100.000 /12 jam

*Harga sudah termasuk asuransi dasar dan pajak. BBM tidak termasuk untuk layanan lepas kunci.*`;

const TERMS_AND_CONDITIONS = `
**Syarat & Ketentuan Sewa Mobil:**

**Lepas Kunci:**
1. e-KTP Asli (wajib)
2. SIM A Asli (masih berlaku)
3. Identitas penjamin (KTM/NPWP/Paspor/Kartu Pegawai)
4. Akun media sosial aktif
5. Jaminan berupa KTP/SIM/BPKB (dikembalikan setelah selesai)

**Dengan Driver:**
1. Tanpa jaminan dokumen
2. Driver profesional kami siap melayani
3. Biaya sudah termasuk gaji driver

**Ketentuan Umum:**
• Usia minimal 21 tahun untuk lepas kunci
• Mobil harus dikembalikan sesuai waktu yang disepakati
• Denda keterlambatan berlaku (Rp 50.000/jam, maks 1 hari sewa)
• Pelanggan bertanggung jawab atas kerusakan selama masa sewa`;

const PAYMENT_INFO = `
**Informasi Pembayaran:**

• **DP (Uang Muka):** 50% dari total biaya sewa, dibayarkan saat konfirmasi booking
• **Pelunasan:** Dibayarkan saat pengambilan mobil atau di awal sewa
• **Metode Pembayaran:**
  - Transfer BCA — a.n. PT RentalMobil Jogja
  - Transfer BNI — a.n. PT RentalMobil Jogja
  - Transfer Mandiri — a.n. PT RentalMobil Jogja
  - QRIS (tersedia)
  - Tunai (untuk pelunasan)
• Konfirmasi pembayaran dengan mengirim bukti transfer ke WhatsApp CS`;

const LATE_PENALTY = `
**Denda Keterlambatan:**

• Jika mobil dikembalikan melebihi waktu yang disepakati:
  - Denda: Rp 50.000 per jam keterlambatan
  - Maksimal denda setara dengan tarif sewa 1 hari penuh
• Contoh: Jika seharusnya kembali jam 18:00 tetapi kembali jam 20:30, maka denda = 3 jam × Rp 50.000 = Rp 150.000

*Denda dihitung per jam dan dibulatkan ke atas.*`;

const BOOKING_PROCESS = `
**Proses Booking:**

1. Pilih mobil yang tersedia di halaman Armada
2. Pilih tanggal mulai dan selesai sewa
3. Pilih layanan (Lepas Kunci / Dengan Driver)
4. Isi data diri dan upload KTP + SIM
5. Bayar DP 50% untuk konfirmasi booking
6. Admin akan memverifikasi pembayaran (estimasi 1×24 jam)
7. Setelah DP terverifikasi, sewa siap dimulai
8. Lakukan pelunasan saat pengambilan mobil

Anda bisa booking langsung melalui website atau menghubungi CS kami.`;

const STUDENT_DISCOUNT = `
**Promo & Diskon Mahasiswa:**

• Diskon khusus mahasiswa: Rp 25.000 — 50.000/hari (tergantung unit)
• Syarat: menunjukkan KTM/Kartu Mahasiswa aktif
• Promo berlaku untuk booking langsung via website
• Tidak dapat digabung dengan promo lain

Khusus untuk mahasiswa Yogyakarta! Tunjukkan KTM Anda saat pengambilan.`;

const CANCELLATION_POLICY = `
**Kebijakan Pembatalan:**

• Pembatalan H-2 sebelum sewa: DP dikembalikan 100%
• Pembatalan H-1 sebelum sewa: DP dikembalikan 50%
• Pembatalan di hari H: DP hangus
• Jika pihak RentalMobil yang membatalkan: DP dikembalikan 200%

*Hubungi CS untuk informasi lebih lanjut.*`;

// ────────────────────────────────────────────
// Intent Recognition Engine
// ────────────────────────────────────────────

interface IntentMatch {
  intent: string;
  score: number;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateIntentScore(query: string, keywords: string[]): number {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(" ");
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedQuery.includes(normalizedKeyword)) {
      // Full phrase match gets higher score
      score += normalizedKeyword.split(" ").length;
    } else {
      // Partial word match
      const keywordWords = normalizedKeyword.split(" ");
      for (const kw of keywordWords) {
        if (kw.length > 2 && queryWords.some((qw) => qw.includes(kw) || kw.includes(qw))) {
          score += 0.5;
        }
      }
    }
  }

  return score;
}

function detectIntent(userMessage: string): IntentMatch[] {
  const normalizedQuery = normalizeText(userMessage);

  const intentPatterns: { intent: string; patterns: string[] }[] = [
    {
      intent: "GREETING",
      patterns: ["halo", "hai", "hey", "siang", "pagi", "malam", "permisi", "assalamualaikum", "selamat pagi", "selamat siang", "selamat malam", "hi", "hello", "hy", "helo"],
    },
    {
      intent: "PRICE",
      patterns: ["harga", "biaya", "tarif", "paket", "berapa", "mahal", "murah", "cost", "price", "rate", "pricing", "sewa", "dapat harga"],
    },
    {
      intent: "CAR_AVAILABILITY",
      patterns: ["tersedia", "mobil", "armada", "ketersediaan", "ready", "unit", "avanza", "xpander", "terios", "ertiga", "fortuner", "pajero", "brio", "agya", "ayla", "innova", "calya", "sigra", "mobil tersedia", "mobil yang", "jenis mobil", "katalog"],
    },
    {
      intent: "TERMS",
      patterns: ["syarat", "ketentuan", "kondisi", "ktp", "sim", "dokumen", "jaminan", "identitas", "penjamin", "umur", "minimal", "syarat sewa", "persyaratan"],
    },
    {
      intent: "PAYMENT",
      patterns: ["bayar", "pembayaran", "transfer", "qris", "bca", "bni", "mandiri", "metode", "rekening", "nomer rekening", "pembayaran", "nomor rekening"],
    },
    {
      intent: "DP",
      patterns: ["dp", "uang muka", "down payment", "50%", "lima puluh", "setengah", "deposit"],
    },
    {
      intent: "PELUNASAN",
      patterns: ["lunas", "pelunasan", "full payment", "sisa", "lunasi", "lunaskan"],
    },
    {
      intent: "PENALTY",
      patterns: ["denda", "telat", "keterlambatan", "lembur", "overtime", "denda telat", "denda keterlambatan", "melebihi", "overdue"],
    },
    {
      intent: "OPERATIONAL_HOURS",
      patterns: ["jam", "operasional", "buka", "tutup", "jam buka", "jam kerja", "24 jam", "darurat", "waktu kerja", "kantor"],
    },
    {
      intent: "BOOKING",
      patterns: ["booking", "pesan", "memesan", "sekarang", "reservasi", "pesan mobil", "booking mobil", "cara booking", "proses booking", "langkah", "mulai"],
    },
    {
      intent: "STATUS_BOOKING",
      patterns: ["status", "pesanan", "order", "cek status", "riwayat", "sudah di", "proses", "diproses", "no booking", "id booking", "nomor booking"],
    },
    {
      intent: "STUDENT_DISCOUNT",
      patterns: ["mahasiswa", "diskon", "pelajar", "student", "ktm", "kartu mahasiswa", "promo", "khusus mahasiswa", "diskon mahasiswa", "murah mahasiswa"],
    },
    {
      intent: "CANCELLATION",
      patterns: ["batal", "cancel", "pembatalan", "refund", "kembali", "uang kembali", "dibatalkan", "membatalkan"],
    },
    {
      intent: "CONTACT_CS",
      patterns: ["cs", "admin", "customer service", "agent", "live chat", "langsung", "bantuan", "butuh bantuan", "tolong", "operator", "staff", "orang", "manusia"],
    },
    {
      intent: "THANKS",
      patterns: ["terima kasih", "makasih", "thanks", "thank you", "trima kasih", "trimakasih", "baik", "oke", "ok", "siap"],
    },
    {
      intent: "GOODBYE",
      patterns: ["selamat tinggal", "dadah", "bye", "sampai jumpa", "goodbye", "see you"],
    },
    {
      intent: "SERVICE_TYPE",
      patterns: ["lepas kunci", "dengan driver", "dengan sopir", "supir", "driver", "jenis layanan", "layanan", "antar jemput"],
    },
    {
      intent: "PICKUP_LOCATION",
      patterns: ["lokasi", "dimana", "alamat", "kantor", "tempat", "penjemputan", "pickup", "pengembalian", "Yogyakarta", "jogja", "sleman", "bantul"],
    },
    {
      intent: "INSURANCE",
      patterns: ["asuransi", "insurance", "jaminan", "proteksi", "tanggung jawab", "ganti rugi", "kerusakan", "kecelakaan"],
    },
    {
      intent: "FUEL",
      patterns: ["bbm", "bensin", "solar", "bahan bakar", "premium", "pertalite", "pertamax", "isi bensin", "fuel"],
    },
    {
      intent: "DRIVER_FEE",
      patterns: ["gaji driver", "biaya driver", "tarif driver", "sopir", "driver fee", "upah driver"],
    },
  ];

  const results: IntentMatch[] = [];

  for (const { intent, patterns } of intentPatterns) {
    const score = calculateIntentScore(normalizedQuery, patterns);
    if (score > 0) {
      results.push({ intent, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ────────────────────────────────────────────
// Response Generator
// ────────────────────────────────────────────

const knowledgeBase: KnowledgeEntry[] = [
  {
    keywords: [],
    intents: ["GREETING"],
    getResponse: () =>
      `Halo! Selamat datang di **RentalMobil Jogja** 👋\n\nSaya asisten virtual kami. Silakan tanya seputar:\n• Harga & paket sewa mobil\n• Syarat & ketentuan sewa\n• Proses booking\n• Pembayaran & DP\n• Denda keterlambatan\n• Jam operasional\n\nAtau ketik langsung pertanyaan Anda!`,
  },
  {
    keywords: [],
    intents: ["THANKS"],
    getResponse: () =>
      `Sama-sama! Senang bisa membantu 😊\n\nJika ada pertanyaan lain, silakan tanya kapan saja. Atau jika butuh bantuan lebih lanjut, silakan hubungi Customer Service kami.`,
  },
  {
    keywords: [],
    intents: ["GOODBYE"],
    getResponse: () =>
      `Terima kasih telah menggunakan layanan **RentalMobil Jogja** 🚗\n\nJika suatu saat perlu bantuan, kami siap melayani. Silakan kembali kapan saja!\n\n*Butuh bantuan lebih lanjut? Hubungi CS kami via WhatsApp.*`,
  },
  {
    keywords: [],
    intents: ["PRICE"],
    getResponse: () => PRICING_INFO + `\n\nKetik "detail [nama mobil]" untuk info harga spesifik, atau hubungi CS untuk negosiasi paket khusus.`,
  },
  {
    keywords: [],
    intents: ["CAR_AVAILABILITY"],
    getResponse: () =>
      `Untuk cek ketersediaan mobil:\n\n1️⃣ Kunjungi halaman **Armada** di website kami\n2️⃣ Pilih tanggal sewa\n3️⃣ Lihat unit yang tersedia\n\nAtau Anda bisa langsung menghubungi CS kami untuk rekomendasi unit yang sesuai kebutuhan.\n\n*Mau saya bantu cek unit tertentu? Sebutkan jenis mobil yang Anda cari!*`,
  },
  {
    keywords: [],
    intents: ["TERMS"],
    getResponse: () => TERMS_AND_CONDITIONS,
  },
  {
    keywords: [],
    intents: ["PAYMENT"],
    getResponse: () => PAYMENT_INFO,
  },
  {
    keywords: [],
    intents: ["DP"],
    getResponse: () =>
      `**Informasi DP (Uang Muka):**\n\n• **Besaran DP:** 50% dari total biaya sewa\n• **Dibayarkan saat:** Konfirmasi booking\n• **Tujuan:** Mengamankan unit mobil untuk Anda\n• **Sisa pelunasan:** Dibayarkan saat pengambilan mobil\n\n**Contoh:** Jika total sewa Rp 500.000, DP yang dibayar Rp 250.000.\n\nKonfirmasi pembayaran dengan mengirim bukti transfer ke WhatsApp CS.`,
  },
  {
    keywords: [],
    intents: ["PELUNASAN"],
    getResponse: () =>
      `**Informasi Pelunasan:**\n\n• Waktu pelunasan: Saat pengambilan mobil (pickup)\n• Sisa yang dibayar: Total biaya — DP yang sudah dibayar\n• Metode: Tunai atau transfer (konfirmasi ke CS)\n• Dokumen: Serah terima kendaraan ditandatangani saat pelunasan\n\n*Jika ada kendala finansial, silakan hubungi CS untuk opsi pembayaran lainnya.*`,
  },
  {
    keywords: [],
    intents: ["PENALTY"],
    getResponse: () => LATE_PENALTY,
  },
  {
    keywords: [],
    intents: ["OPERATIONAL_HOURS"],
    getResponse: () => OPERATIONAL_HOURS,
  },
  {
    keywords: [],
    intents: ["BOOKING"],
    getResponse: () => BOOKING_PROCESS,
  },
  {
    keywords: [],
    intents: ["STATUS_BOOKING"],
    getResponse: () =>
      `Untuk cek status booking:\n\n1️⃣ Login ke akun Anda\n2️⃣ Buka menu **Riwayat Booking**\n3️⃣ Status terbaru akan terlihat di sana\n\nAtau hubungi CS kami dengan menyebutkan **No. Booking ID** Anda.`,
  },
  {
    keywords: [],
    intents: ["STUDENT_DISCOUNT"],
    getResponse: () => STUDENT_DISCOUNT,
  },
  {
    keywords: [],
    intents: ["CANCELLATION"],
    getResponse: () => CANCELLATION_POLICY,
  },
  {
    keywords: [],
    intents: ["SERVICE_TYPE"],
    getResponse: () =>
      `**Jenis Layanan RentalMobil Jogja:**\n\n1️⃣ **Lepas Kunci** 🚗\n   - Mobil tanpa driver\n   - Harga lebih hemat\n   - Bebas eksplorasi\n   - Syarat: KTP + SIM Asli\n\n2️⃣ **Dengan Driver** 👨‍✈️\n   - Mobil + driver profesional\n   - Tanpa jaminan dokumen\n   - Driver paham jalan Jogja\n   - Harga sudah termasuk gaji driver\n\nPilih sesuai kebutuhan! Keduanya bisa booking langsung via website.`,
  },
  {
    keywords: [],
    intents: ["PICKUP_LOCATION"],
    getResponse: () =>
      `**Lokasi & Area Layanan:**\n\n• Kantor: Jl. Kaliurang KM 5.5, Sleman, Yogyakarta\n• Area layanan: Seluruh Yogyakarta & sekitarnya\n• Antar jemput: Tersedia (Bandara YIA, Stasiun Tugu, Terminal, Hotel)\n\n*Kami siap antar mobil ke lokasi Anda di area Jogja.*`,
  },
  {
    keywords: [],
    intents: ["INSURANCE"],
    getResponse: () =>
      `**Asuransi & Perlindungan:**\n\n• Setiap unit dilengkapi asuransi dasar\n• Perlindungan dari kerusakan akibat kecelakaan\n• Tanggung jawab penyewa: Kerusakan akibat kelalaian\n• Biaya perawatan rutin ditanggung pihak rental\n\n*Untuk detail polis asuransi, hubungi CS kami.*`,
  },
  {
    keywords: [],
    intents: ["FUEL"],
    getResponse: () =>
      `**Informasi BBM (Bahan Bakar):**\n\n• **Lepas Kunci:** BBM tidak termasuk, mobil diberikan dalam kondisi FULL TANK dan harus dikembalikan FULL TANK\n• **Dengan Driver:** BBM sudah termasuk dalam biaya sewa\n• Jenis BBM: Pertalite / Pertamax (sesuai spesifikasi mobil)\n\n*Jangan khawatir, semua unit kami dirawat rutin dan irit BBM!*`,
  },
  {
    keywords: [],
    intents: ["DRIVER_FEE"],
    getResponse: () =>
      `**Biaya Driver:**\n\n• Tarif driver: Rp 150.000/hari (sudah termasuk dalam paket Dengan Driver)\n• Driver profesional dan berpengalaman\n• Sudah termasuk gaji, makan, dan istirahat driver\n• Jam kerja driver: 12 jam per hari (lembur dikenakan biaya tambahan)\n\n*Semua driver kami telah melalui pelatihan pelayanan prima.*`,
  },
  {
    keywords: [],
    intents: ["CONTACT_CS"],
    getResponse: () =>
      `Anda dapat menghubungi Customer Service kami melalui:\n\n1️⃣ **Live Chat — Admin CS** (di sini)\n   Team kami akan merespon segera\n   \n2️⃣ **WhatsApp Official**\n   +62 812-3456-890\n\n3️⃣ **Telepon**\n   +62 812-3456-7890\n\nSedang saya sambungkan ke Admin CS kami...`,
  },
];

// ────────────────────────────────────────────
// Context-Aware Response Builder
// ────────────────────────────────────────────

function getContextSummary(context?: ChatContext): string {
  if (!context || context.history.length === 0) return "";

  // Ambil 3 pesan terakhir untuk konteks
  const recentHistory = context.history.slice(-6);
  const summary = recentHistory
    .map((h) => `[${h.role.toUpperCase()}]: ${h.message}`)
    .join("\n");

  return summary;
}

function buildFallbackResponse(context?: ChatContext): string {
  // Check if user is repeating the same question
  if (context && context.history.length >= 3) {
    const lastMessages = context.history.slice(-3);
    const allSameIntent = lastMessages.every(
      (m) => m.role === "user" && m.message.length < 100
    );
    if (allSameIntent) {
      return `Maaf, saya belum bisa menjawab pertanyaan tersebut dengan tepat.\n\nTapi tenang! Tim Customer Service kami akan membantu Anda. Silakan klik tombol **"Hubungi Admin"** untuk terhubung langsung dengan CS kami.`;
    }
  }

  return `Maaf, saya belum memiliki informasi yang cukup untuk menjawab pertanyaan tersebut.\n\nSaya akan mengarahkan Anda ke Customer Service kami yang siap membantu Anda secara langsung. Tim CS kami akan merespon dalam beberapa saat.\n\n*Atau Anda bisa menghubungi WhatsApp Official kami: +62 812-3456-7890*`;
}

function shouldEscalateToCS(intents: IntentMatch[], message: string): boolean {
  // Escalate if:
  // 1. User explicitly asks for CS/Admin
  // 2. Multiple low-confidence intents (confused)
  // 3. Negative sentiment indicators
  // 4. Ask for something very specific like booking modification
  const msg = message.toLowerCase();

  const escalationTriggers = [
    "komplain", "keluhan", "marah", "kecewa", "kesal",
    "batal booking", "cancel booking", "ubah booking",
    "ganti mobil", "refund", "uang kembali",
    "error", "salah", "bug", "tidak bisa",
  ];

  if (escalationTriggers.some((t) => msg.includes(t))) {
    return true;
  }

  // If CONTACT_CS intent is strong
  if (intents.some((i) => i.intent === "CONTACT_CS" && i.score >= 2)) {
    return true;
  }

  // If no strong intents detected
  if (intents.length === 0) {
    return true;
  }

  return false;
}

// ────────────────────────────────────────────
// Main AI Response Function
// ────────────────────────────────────────────

export async function generateAIResponse(
  userMessage: string,
  context?: ChatContext
): Promise<AIResponse> {
  try {
    const intents = detectIntent(userMessage);

    // Cek apakah perlu di-escalate ke admin
    const escalate = shouldEscalateToCS(intents, userMessage);

    // Jika escalate, langsung return dengan flag
    if (escalate) {
      // Cek dulu apakah ada intent spesifik yang bisa dijawab sebelum escalate
      if (intents.length > 0 && intents[0].intent !== "CONTACT_CS") {
        const response = generateIntentResponse(intents, userMessage, context);
        // If the response mentions contacting CS, then escalate
        if (response.toLowerCase().includes("customer service") || response.toLowerCase().includes("hubungi cs")) {
          return { message: response, shouldEscalate: true };
        }
        return { message: response, shouldEscalate: false };
      }

      // Pure escalation
      return {
        message: `Maaf, saya akan menghubungkan Anda ke Customer Service kami.\n\nMohon tunggu sebentar, Admin CS kami akan membalas pesan Anda secara langsung. Terima kasih atas kesabarannya 🙏`,
        shouldEscalate: true,
      };
    }

    // Generate response based on detected intents
    const response = generateIntentResponse(intents, userMessage, context);
    return { message: response, shouldEscalate: false };
  } catch (error) {
    console.error("AI Chatbot error:", error);
    return {
      message: `Maaf, terjadi gangguan pada sistem. Tim Customer Service kami akan membantu Anda. Silakan tunggu sebentar ya 🙏`,
      shouldEscalate: true,
    };
  }
}

function generateIntentResponse(
  intents: IntentMatch[],
  userMessage: string,
  context?: ChatContext
): string {
  // Jika tidak ada intent yang dikenali
  if (intents.length === 0) {
    return buildFallbackResponse(context);
  }

  const primaryIntent = intents[0].intent;

  // Cari response dari knowledge base
  const entry = knowledgeBase.find((k) => k.intents.includes(primaryIntent));
  if (entry) {
    // Jika intent GREETING dan ada riwayat chat > 2, beri response singkat
    if (primaryIntent === "GREETING" && context && context.history.length > 2) {
      return `Halo lagi! 😊 Ada yang bisa saya bantu terkait rental mobil?`;
    }

    const response = entry.getResponse(userMessage, context);

    // Tambahkan konteks jika perlu
    if (primaryIntent === "PRICE" && context) {
      // Check if user mentioned specific car type in history
      const lastUserMsg = context.history.filter((h) => h.role === "user").pop();
      if (lastUserMsg) {
        const carTypes = ["city car", "mpv", "suv", "brio", "avanza", "fortuner", "pajero", "ertiga", "xpander", "terios", "innova", "agya", "ayla", "calya", "sigra"];
        const mentionedCar = carTypes.find((c) =>
          lastUserMsg.message.toLowerCase().includes(c)
        );
        if (mentionedCar) {
          return response; // Already has the right info
        }
      }
    }

    return response;
  }

  // Fallback
  return buildFallbackResponse(context);
}

// ────────────────────────────────────────────
// Konversi senderType untuk DB
// ────────────────────────────────────────────

export async function handleAIChat(
  chatId: string,
  userMessage: string,
  userId: string
): Promise<{ aiMessage: string; shouldEscalate: boolean }> {
  // Ambil riwayat chat dari DB untuk konteks
  const messages = await prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const history: ChatHistoryEntry[] = messages.map((m) => ({
    role: m.senderType === "USER" ? "user" : m.senderType === "ADMIN" ? "admin" : "assistant",
    message: m.message,
  }));

  // Cek status chat
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || chat.handledBy === "ADMIN") {
    // Chat sudah di-take-over admin, AI tidak menjawab
    return { aiMessage: "", shouldEscalate: true };
  }

  const context: ChatContext = {
    chatId,
    userId,
    history,
    handledBy: chat.handledBy as "AI" | "ADMIN",
  };

  const response = await generateAIResponse(userMessage, context);

  if (response.message) {
    // Simpan respons AI ke database
    // Gunakan userId AI khusus (bisa pakai ID admin pertama atau "ai-bot")
    const aiUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
    });

    await prisma.chatMessage.create({
      data: {
        chatId,
        senderId: aiUser?.id || userId,
        senderType: "AI",
        message: response.message,
      },
    });
  }

  return {
    aiMessage: response.message,
    shouldEscalate: response.shouldEscalate,
  };
}
