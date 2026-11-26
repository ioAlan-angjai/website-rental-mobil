import prisma from '@/lib/prisma';
import { benefitsJogja, faqJogja, servicesJogja, stepsJogja } from '@/lib/site-content';

export interface ChatHistoryItem {
  role: 'USER' | 'AI' | 'ADMIN';
  message: string;
}

export interface ChatbotResult {
  reply: string;
  requestHandover: boolean;
  usedFallback: boolean;
}

const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];
const DEPRECATED_GEMINI_MODELS = new Set(['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']);

const WEBSITE_FAQ_KNOWLEDGE = [
  {
    category: 'Booking & Reservasi',
    items: [
      {
        q: 'Bagaimana cara melakukan booking mobil?',
        a: 'Pilih armada di halaman /armada lalu klik "Sewa" (atau buka /booking). Ikuti 7 langkah pemesanan: (1) Pilih layanan & armada & tanggal, (2) Atur jam ambil/kembali & lokasi penjemputan/pengantaran, (3) Cek data rental, (4) Isi data penyewa, (5) Upload foto KTP & SIM A, (6) Review ringkasan, (7) Bayar DP 50%.',
      },
      {
        q: 'Apakah bisa booking tanpa login?',
        a: 'Tidak bisa. Untuk keamanan verifikasi dokumen (e-KTP & SIM A) serta pelacakan status pesanan secara transparan, pelanggan wajib login atau daftar akun terlebih dahulu.',
      },
      {
        q: 'Berapa minimal durasi sewa?',
        a: 'Minimal durasi sewa harian adalah 24 jam (1 hari).',
      },
      {
        q: 'Bisakah saya mengubah jadwal booking?',
        a: 'Pengubahan jadwal (reschedule) dapat diajukan maksimal H-1 sebelum waktu sewa dimulai dengan menghubungi admin WhatsApp +62 812-3456-7890.',
      },
    ],
  },
  {
    category: 'Pembayaran & DP',
    items: [
      {
        q: 'Metode pembayaran apa saja yang didukung?',
        a: 'Pembayaran Instan (QRIS untuk GoPay/OVO/Dana/ShopeePay/BCA Mobile, serta Virtual Account BCA, BNI, BRI, dan Mandiri Bill Payment terverifikasi otomatis) maupun Transfer Bank Manual (BCA, BNI, Mandiri) dengan unggah bukti transfer.',
      },
      {
        q: 'Berapa DP yang harus dibayar?',
        a: 'DP reservasi sebesar 50% dari total nilai sewa armada untuk mengunci ketersediaan unit.',
      },
      {
        q: 'Apakah DP bisa dikembalikan jika batal?',
        a: 'DP tidak dapat diuangkan kembali kecuali terjadi kendala ketersediaan unit dari pihak manajemen kami.',
      },
    ],
  },
  {
    category: 'Kebijakan Pembatalan',
    items: [
      {
        q: 'Bagaimana cara membatalkan pesanan & apakah ada potongan?',
        a: 'Hubungi admin melalui WhatsApp atau menu /riwayat-booking sebelum jadwal sewa dimulai. Pembatalan H-1 dikenakan penalti 50% DP, sedangkan pembatalan kurang dari 24 jam sebelum jadwal sewa mengakibatkan DP hangus.',
      },
    ],
  },
  {
    category: 'Serah Terima, Antar-Jemput & Pengembalian',
    items: [
      {
        q: 'Apakah bisa pengantaran atau penjemputan unit di Stasiun Tugu, Lempuyangan, Bandara YIA, atau hotel?',
        a: 'Ya, bisa! Kami melayani antar-jemput dan serah terima unit langsung di Bandara Internasional Yogyakarta (YIA), Stasiun Tugu, Stasiun Lempuyangan, hotel area Yogyakarta, atau ambil langsung di garasi Jl. Kaliurang KM 5.5, Sleman. Cukup isi titik lokasi pada Langkah 2 form booking.',
      },
      {
        q: 'Apakah bisa pengembalian di lokasi berbeda?',
        a: 'Bisa, dengan kesepakatan awal dan biaya operasional penjemputan tambahan yang wajar.',
      },
      {
        q: 'Bagaimana jika terlambat mengembalikan kendaraan?',
        a: 'Terdapat masa toleransi keterlambatan 30 menit. Keterlambatan pengembalian dikenakan denda proporsional (10% dari tarif sewa harian per jam keterlambatan atau Rp 50.000/jam sesuai ketentuan tagihan pelunasan; keterlambatan lebih dari 6 jam dihitung setara tarif 1 hari penuh).',
      },
    ],
  },
  {
    category: 'Ketentuan Umum & Layanan Driver',
    items: [
      {
        q: 'Bagaimana ketentuan BBM, tol, parkir, dan wilayah operasional?',
        a: 'BBM diserahkan pada indikator tertentu dan wajib dikembalikan pada posisi yang sama (tidak termasuk tarif sewa). Biaya tol, parkir, dan tiket wisata ditanggung penyewa. Wilayah operasional standar adalah D.I. Yogyakarta; untuk perjalanan luar kota (Solo, Semarang, dll.) wajib konfirmasi terlebih dahulu (tarif driver luar kota menyesuaikan akomodasi).',
      },
      {
        q: 'Bagaimana jika terjadi kendala darurat di jalan?',
        a: 'Tersedia garansi unit pengganti 24 jam, asuransi perjalanan, dan hotline darurat 24 jam non-stop via WhatsApp +62 812-3456-7890.',
      },
    ],
  },
  {
    category: 'Pelunasan & Invoice',
    items: [
      {
        q: 'Kapan pelunasan sisa tagihan dilakukan dan apakah dapat invoice?',
        a: 'Pelunasan sisa 50% (ditambah denda jika ada) dilakukan saat atau setelah kendaraan dikembalikan melalui menu /riwayat-booking -> halaman Pelunasan. Invoice digital resmi otomatis terbit dan dapat diunduh/dicetak dari akun Anda.',
      },
    ],
  },
];

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10);
}

export function shouldRequestAdminHandover(message: string): boolean {
  const normalized = message.toLowerCase();
  const triggers = [
    'hubungi admin',
    'bicara dengan admin',
    'bicara admin',
    'chat admin',
    'minta admin',
    'cs manusia',
    'customer service manusia',
    'sambungkan ke admin',
    'operator manusia',
    'komplain',
    'keluhan',
  ];
  return triggers.some((phrase) => normalized.includes(phrase));
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatStatusBooking(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu Konfirmasi',
    WAITING_DP: 'Menunggu Pembayaran DP',
    DP_CONFIRMED: 'DP Terkonfirmasi',
    IN_PROGRESS: 'Sedang Berjalan',
    WAITING_RETURN: 'Menunggu Pengembalian',
    WAITING_PAYMENT: 'Menunggu Pelunasan',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REJECTED: 'Ditolak',
    DENIED: 'Ditolak',
  };
  return labels[status] || status;
}

function parseJsonStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function loadChatbotContext(userId?: string) {
  const [cars, driverSetting, userBookings] = await Promise.all([
    prisma.car.findMany({
      select: {
        name: true,
        brand: true,
        category: true,
        year: true,
        transmission: true,
        fuelType: true,
        seats: true,
        pricePerDay: true,
        status: true,
        features: true,
        description: true,
      },
      orderBy: [{ status: 'asc' }, { pricePerDay: 'asc' }],
    }),
    prisma.setting.findUnique({
      where: { key: 'DRIVER_FEE_PER_DAY' },
    }),
    userId
      ? prisma.booking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            startDateTime: true,
            endDateTime: true,
            serviceType: true,
            pickupLocation: true,
            totalPrice: true,
            dpAmount: true,
            remainingAmount: true,
            dpPaid: true,
            fullPaid: true,
            car: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const driverFeePerDay = driverSetting ? parseInt(driverSetting.value, 10) || 150000 : 150000;
  return { cars, driverFeePerDay, userBookings };
}

function buildSystemInstruction(
  context: Awaited<ReturnType<typeof loadChatbotContext>>,
  isLoggedIn: boolean
): string {
  const availableCars = context.cars.filter((c) => c.status === 'AVAILABLE');
  const unavailableCars = context.cars.filter((c) => c.status !== 'AVAILABLE');

  const availableList =
    availableCars.length > 0
      ? availableCars
          .map((c) => {
            const features = parseJsonStringArray(c.features);
            const featuresText = features.length > 0 ? ` | Fitur: ${features.slice(0, 5).join(', ')}` : '';
            return `- ${c.name} (${c.brand}, ${c.category}, ${c.year}) | ${c.transmission} | ${c.fuelType} | ${c.seats} kursi | ${formatRupiah(c.pricePerDay)}/hari${featuresText}`;
          })
          .join('\n')
      : '- Saat ini belum ada unit yang berstatus AVAILABLE.';

  const unavailableList =
    unavailableCars.length > 0
      ? unavailableCars.map((c) => `- ${c.name} (Status: ${c.status})`).join('\n')
      : '- Tidak ada.';

  const servicesList = servicesJogja
    .map((s) => `- ${s.title}: ${s.description} (${s.priceNote}; ${s.bullets.join('; ')})`)
    .join('\n');

  const benefitsList = benefitsJogja.map((b) => `- ${b.title}: ${b.description}`).join('\n');
  const stepsList = stepsJogja.map((s) => `${s.number}. ${s.title}: ${s.description}`).join('\n');

  const shortFaqList = faqJogja.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
  const detailedFaqList = WEBSITE_FAQ_KNOWLEDGE.map(
    (cat) => `[${cat.category}]\n` + cat.items.map((item) => `Q: ${item.q}\nA: ${item.a}`).join('\n')
  ).join('\n\n');

  const bookingSummary = isLoggedIn
    ? context.userBookings.length > 0
      ? context.userBookings
          .map(
            (b) =>
              `- ID ${b.id.slice(0, 8)} | Mobil: ${b.car.name} | Layanan: ${b.serviceType} | Lokasi: ${b.pickupLocation || '-'} | Jadwal: ${b.startDateTime.toLocaleDateString('id-ID')} s/d ${b.endDateTime.toLocaleDateString('id-ID')} | Status: ${formatStatusBooking(b.status)} | Total: ${formatRupiah(b.totalPrice)} | DP (${b.dpPaid ? 'Sudah Bayar' : 'Belum Bayar'}): ${formatRupiah(b.dpAmount)} | Sisa Tagihan (${b.fullPaid ? 'Lunas' : 'Belum Lunas'}): ${formatRupiah(b.remainingAmount)}`
          )
          .join('\n')
      : '- Pengguna belum memiliki riwayat booking.'
    : '- Pengunjung belum login (tidak bisa melihat data booking pribadi).';

  return `Kamu adalah Asisten AI resmi untuk website "RentalMobil Jogja" (berdiri sejak 2020 di Yogyakarta).

ATURAN KETAT JAWABAN:
1. FOKUS PADA INTI PERTANYAAN: Jawab pertanyaan pengguna secara langsung terlebih dahulu (misal jika tanya pengantaran ke Stasiun Tugu, langsung jawab bisa/tidaknya dan cara mengisinya di form booking — JANGAN tiba-tiba membuang daftar semua mobil kecuali pengguna memang bertanya tentang pilihan/rekomendasi/harga mobil).
2. GUNAKAN HANYA DATA NYATA: Jangan mengarang nama mobil, harga, promo, atau kebijakan yang tidak ada di bawah ini. Jika ada hal yang tidak tercantum, sampaikan secara jujur dan arahkan ke WhatsApp +62 812-3456-7890 atau Admin CS.
3. REKOMENDASI & HITUNGAN BIAYA: Jika pengguna bertanya rekomendasi (misal jumlah penumpang, budget, transmisi matic/manual, durasi hari, atau dengan driver/lepas kunci), pilihkan unit yang sesuai dari daftar AVAILABLE dan hitungkan estimasi biayanya (Harga unit/hari + biaya driver ${formatRupiah(context.driverFeePerDay)}/hari jika pakai driver, dikali jumlah hari, serta nominal DP 50%).
4. GAYA BAHASA & FORMAT: Gunakan bahasa Indonesia yang ramah, natural, santai namun sopan & profesional. Pahami pertanyaan informal/singkatan (misal "dp", "yia", "lepas kunci", "brp", "gk"). Ringkas (maksimal 5-7 kalimat atau poin seperlunya). Hindari markdown tabel/heading; cukup teks biasa, poin "-", dan **tebal** secukupnya.
5. NAVIGASI HALAMAN: Arahkan seperlunya ke /armada (katalog mobil), /booking (pesan mobil), /riwayat-booking (pantau pesanan & pelunasan), /layanan, /faq, atau /kontak.
${
  isLoggedIn
    ? '6. HANDOVER ADMIN: Jika pengguna meminta bicara dengan admin manusia, butuh negosiasi luar kota/khusus, atau menyampaikan keluhan serius, akhiri balasanmu dengan token persis [HANDOVER_ADMIN] di baris terakhir.'
    : '6. PENGUNJUNG BELUM LOGIN: Jika pengunjung menanyakan status pesanan pribadi atau meminta chat admin langsung di website, sarankan login terlebih dahulu di /login atau hubungi WhatsApp +62 812-3456-7890. JANGAN sertakan token [HANDOVER_ADMIN].'
}

PROFIL & KONTAK USAHA:
- Nama: RentalMobil Jogja (melayani sejak 2020 untuk wisata, dinas, & korporat)
- Alamat Garasi & Kantor: Jl. Kaliurang KM 5.5, Sleman, D.I. Yogyakarta 55281
- Jam Operasional Reservasi & Penjemputan: Setiap hari (Senin–Minggu & Libur) pukul 08.00 – 21.00 WIB
- Layanan Darurat / Hotline WhatsApp: 24 Jam non-stop (+62 812-3456-7890 / +62 856-7890-1234)
- Email: info@rentalmobiljogja.com / booking@rentalmobiljogja.com
- Tarif Layanan Driver: +${formatRupiah(context.driverFeePerDay)} / hari (di luar harga sewa unit; standar layanan 12 jam/hari dalam kota Jogja; belum termasuk BBM, tol, parkir, tiket wisata).

LAYANAN & KEUNGGULAN KAMI:
${servicesList}

KEUNGGULAN:
${benefitsList}

ALUR SINGKAT PEMESANAN:
${stepsList}

ARMADA TERSEDIA SAAT INI (AVAILABLE):
${availableList}

ARMADA SEDANG TIDAK TERSEDIA:
${unavailableList}

FAQ RINGKAS:
${shortFaqList}

PENGETAHUAN LENGKAP & KEBIJAKAN RENTAL:
${detailedFaqList}

DATA BOOKING PENGGUNA SAAT INI:
${bookingSummary}`;
}

function buildGeminiContents(history: ChatHistoryItem[], currentMessage: string) {
  const recentHistory = history.slice(-10);
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const item of recentHistory) {
    const trimmed = item.message?.trim();
    if (!trimmed) continue;
    const role: 'user' | 'model' = item.role === 'USER' ? 'user' : 'model';
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n${trimmed}`;
    } else {
      contents.push({ role, parts: [{ text: trimmed }] });
    }
  }

  // Gemini requires first message in contents to be 'user'
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  const last = contents[contents.length - 1];
  if (last && last.role === 'user') {
    last.parts[0].text += `\n${currentMessage}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: currentMessage }] });
  }

  return contents;
}

function buildDatabaseFallbackReply(
  userMessage: string,
  context: Awaited<ReturnType<typeof loadChatbotContext>>,
  isLoggedIn: boolean
): string {
  const q = userMessage.toLowerCase();
  const availableCars = context.cars.filter((c) => c.status === 'AVAILABLE');

  if (/^(halo|hai|hi|hey|permisi|selamat\s+(pagi|siang|sore|malam)|assalamualaikum)[!.?\s]*$/i.test(q.trim())) {
    return 'Halo! Selamat datang di **RentalMobil Jogja**. Ada yang bisa saya bantu? Anda bisa tanya soal antar-jemput Bandara/Stasiun, daftar & harga mobil, syarat lepas kunci, layanan driver, atau cara pembayaran DP.';
  }

  if (
    q.includes('antar') ||
    q.includes('jemput') ||
    q.includes('pengantaran') ||
    q.includes('penjemputan') ||
    q.includes('stasiun') ||
    q.includes('tugu') ||
    q.includes('lempuyangan') ||
    q.includes('bandara') ||
    q.includes('yia') ||
    q.includes('hotel') ||
    q.includes('lokasi') ||
    q.includes('alamat') ||
    q.includes('garasi') ||
    q.includes('kantor') ||
    q.includes('jam buka') ||
    q.includes('operasional') ||
    q.includes('kontak') ||
    q.includes('whatsapp') ||
    q.includes('telepon')
  ) {
    return 'Tentu bisa! **RentalMobil Jogja** melayani pengantaran dan penjemputan unit di **Stasiun Tugu**, **Stasiun Lempuyangan**, **Bandara YIA**, maupun hotel area Yogyakarta. Anda cukup mengisi titik lokasi pada Langkah 2 form **Booking** (atau pilih **Ambil di Garasi** di **Jl. Kaliurang KM 5.5, Sleman**). Jam operasional reservasi setiap hari **08.00 – 21.00 WIB** (WhatsApp darurat 24 jam: **+62 812-3456-7890**).';
  }

  if (q.includes('status') || q.includes('pesanan') || q.includes('riwayat') || q.includes('pelunasan') || q.includes('invoice')) {
    if (!isLoggedIn) {
      return 'Untuk memeriksa status pesanan, mengunduh invoice, atau melakukan pelunasan, silakan **Masuk** ke akun terlebih dahulu lalu buka halaman **Riwayat Booking**.';
    }
    if (context.userBookings.length === 0) {
      return 'Anda belum memiliki riwayat booking saat ini. Silakan klik menu **Booking** untuk melakukan pemesanan unit mobil.';
    }
    const latest = context.userBookings[0];
    return `Booking terbaru Anda adalah **${latest.car.name}** dengan status **${formatStatusBooking(latest.status)}** (DP: ${formatRupiah(latest.dpAmount)} — ${latest.dpPaid ? 'Sudah Dibayar' : 'Belum Dibayar'}). Detail lengkap, pelunasan, dan invoice tersedia di halaman **Riwayat Booking**.`;
  }

  if (q.includes('batal') || q.includes('cancel') || q.includes('refund') || q.includes('ubah jadwal') || q.includes('reschedule')) {
    return 'Pengajuan ubah jadwal (reschedule) dapat dilakukan maksimal **H-1** sebelum sewa via WhatsApp **+62 812-3456-7890**. Untuk pembatalan: pembatalan H-1 dikenakan penalti **50% DP**, dan pembatalan kurang dari 24 jam mengakibatkan DP hangus (kecuali kendala unit dari pihak kami).';
  }

  if (q.includes('denda') || q.includes('terlambat') || q.includes('telat') || q.includes('bbm') || q.includes('bensin') || q.includes('tol') || q.includes('parkir') || q.includes('luar kota')) {
    return 'Ketentuan rental kami:\n- **BBM, tol, parkir & tiket wisata** ditanggung penyewa (BBM dikembalikan sesuai posisi awal)\n- **Keterlambatan kembali** (setelah toleransi 30 menit) dikenakan denda **10% tarif harian/jam** (>6 jam dihitung 1 hari penuh)\n- Area operasional standar adalah **D.I. Yogyakarta** (rute luar kota wajib konfirmasi terlebih dahulu).';
  }

  if (q.includes('syarat') || q.includes('ktp') || q.includes('sim') || q.includes('lepas kunci') || q.includes('minimal') || q.includes('durasi')) {
    return 'Syarat sewa mobil **Lepas Kunci**:\n- Wajib memiliki akun terdaftar & login saat mengisi form booking\n- Mengunggah foto **e-KTP** asli dan **SIM A** yang masih aktif\n- Durasi sewa minimal **24 jam (1 hari)** dengan DP 50% di awal.';
  }

  if (
    q.includes('qris') ||
    q.includes('transfer') ||
    q.includes('virtual account') ||
    q.includes('rekening') ||
    q.includes('midtrans') ||
    q.includes('cara bayar') ||
    q.includes('metode pembayaran') ||
    ((q.includes('bayar') || q.includes('pembayaran') || q.includes('dp')) &&
      !q.includes('orang') &&
      !q.includes('kursi') &&
      !q.includes('estimasi') &&
      !q.includes('total'))
  ) {
    return 'Pembayaran DP sebesar **50%** dapat dilakukan instan via **QRIS** atau **Virtual Account** (BCA, BNI, BRI, Mandiri) yang terverifikasi otomatis, atau **Transfer Bank Manual** dengan unggah bukti bayar. Sisa tagihan 50% dapat dilunasi melalui menu **Riwayat Booking**.';
  }

  if (q.includes('driver') || q.includes('sopir') || q.includes('supir')) {
    return `Kami menyediakan layanan **Dengan Driver** profesional & menguasai rute wisata Jogja dengan tambahan tarif **${formatRupiah(context.driverFeePerDay)}/hari** (standar 12 jam/hari dalam kota; belum termasuk BBM, tol, dan parkir). Anda bisa memilih opsi ini langsung di Langkah 1 halaman **Booking**.`;
  }

  if (
    q.includes('mobil') ||
    q.includes('armada') ||
    q.includes('harga') ||
    q.includes('tarif') ||
    q.includes('biaya') ||
    q.includes('unit') ||
    q.includes('sewa') ||
    q.includes('kursi') ||
    q.includes('orang') ||
    q.includes('rekomendasi') ||
    q.includes('matic') ||
    q.includes('otomatis') ||
    q.includes('manual') ||
    q.includes('murah')
  ) {
    if (availableCars.length === 0) {
      return 'Saat ini seluruh armada kami sedang terpakai. Silakan cek kembali di halaman **Armada** atau hubungi WhatsApp kami di **+62 812-3456-7890** untuk jadwal terdekat.';
    }
    let filtered = availableCars;
    if (q.includes('matic') || q.includes('otomatis')) {
      const matics = filtered.filter((c) => c.transmission.toLowerCase().includes('otomatis') || c.transmission.toLowerCase().includes('matic'));
      if (matics.length > 0) filtered = matics;
    } else if (q.includes('manual')) {
      const manuals = filtered.filter((c) => c.transmission.toLowerCase().includes('manual'));
      if (manuals.length > 0) filtered = manuals;
    }
    const seatMatch = q.match(/(\d+)\s*(orang|kursi|penumpang)/);
    if (seatMatch) {
      const minSeats = parseInt(seatMatch[1], 10);
      const spacious = filtered.filter((c) => c.seats >= minSeats);
      if (spacious.length > 0) filtered = spacious;
    }
    const topCars = filtered
      .slice(0, 6)
      .map((c) => `- **${c.name}** (${c.seats} kursi, ${c.transmission}) — ${formatRupiah(c.pricePerDay)}/hari`)
      .join('\n');
    return `Berikut pilihan unit mobil yang tersedia dan sesuai kriteria Anda:\n${topCars}\n\nTarif jasa driver tambahan: **${formatRupiah(context.driverFeePerDay)}/hari**. Anda dapat melihat detail lengkap di halaman **Armada** atau langsung pesan di menu **Booking**.`;
  }

  return 'Halo! Saya Asisten AI **RentalMobil Jogja**. Anda bisa menanyakan ketersediaan & harga mobil, antar-jemput Bandara YIA/Stasiun Tugu, syarat sewa lepas kunci, jasa driver, kebijakan pembatalan/denda, atau metode pembayaran DP.';
}

export async function generateChatbotReply(params: {
  userMessage: string;
  history?: ChatHistoryItem[];
  userId?: string;
}): Promise<ChatbotResult> {
  const { userMessage, history = [], userId } = params;
  const isLoggedIn = Boolean(userId);

  if (shouldRequestAdminHandover(userMessage)) {
    if (isLoggedIn) {
      return {
        reply:
          'Baik, saya sambungkan percakapan ini ke **Admin Customer Service** kami. Tim kami akan segera merespons pesan Anda di chat ini.',
        requestHandover: true,
        usedFallback: false,
      };
    }
    return {
      reply:
        'Untuk terhubung langsung dengan Admin Customer Service kami, silakan **Masuk** ke akun terlebih dahulu atau hubungi WhatsApp di **+62 812-3456-7890**.',
      requestHandover: false,
      usedFallback: false,
    };
  }

  const context = await loadChatbotContext(userId);
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey.length <= 10) {
    return {
      reply: buildDatabaseFallbackReply(userMessage, context, isLoggedIn),
      requestHandover: false,
      usedFallback: true,
    };
  }

  const systemInstruction = buildSystemInstruction(context, isLoggedIn);
  const contents = buildGeminiContents(history, userMessage);
  const rawConfiguredModel = process.env.GEMINI_MODEL?.trim();
  const configuredModel =
    rawConfiguredModel && !DEPRECATED_GEMINI_MODELS.has(rawConfiguredModel)
      ? rawConfiguredModel
      : undefined;
  const modelsToTry = configuredModel
    ? [configuredModel, ...DEFAULT_GEMINI_MODELS.filter((m) => m !== configuredModel)]
    : DEFAULT_GEMINI_MODELS;

  for (const model of modelsToTry) {
    try {
      const generationConfig: Record<string, any> = {
        temperature: 0.3,
        maxOutputTokens: 1024,
      };
      if (model.includes('gemini-3.') && !model.includes('lite')) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`Gemini API (${model}) failed with ${response.status}:`, errText.slice(0, 300));
        if (response.status === 401 || response.status === 403) {
          break;
        }
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts
        ?.filter((p: any) => !p?.thought && typeof p?.text === 'string')
        .map((p: any) => p.text)
        .join('')
        .trim();

      if (!rawText) {
        continue;
      }

      const hasHandoverTag = isLoggedIn && rawText.includes('[HANDOVER_ADMIN]');
      const cleanReply = rawText.replace(/\[HANDOVER_ADMIN\]/g, '').trim();

      return {
        reply: cleanReply || buildDatabaseFallbackReply(userMessage, context, isLoggedIn),
        requestHandover: hasHandoverTag,
        usedFallback: false,
      };
    } catch (err) {
      console.error(`Gemini API (${model}) exception:`, err);
    }
  }

  return {
    reply: buildDatabaseFallbackReply(userMessage, context, isLoggedIn),
    requestHandover: false,
    usedFallback: true,
  };
}
