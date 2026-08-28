// lib/site-content.ts - Static Marketing Copy & Service Info for RentalMobil Jogja

export interface ServiceItem {
  title: string;
  description: string;
  priceNote: string;
  bullets: string[];
}

export const servicesJogja: ServiceItem[] = [
  {
    title: "Sewa Lepas Kunci (Self Drive)",
    description: "Kebebasan penuh menjelajahi Yogyakarta dan sekitarnya sesuai rute dan jadwal Anda sendiri. Syarat mudah dan proses cepat.",
    priceNote: "Mulai Rp250.000 / 24 jam",
    bullets: [
      "Durasi sewa minimal 24 jam",
      "Serah terima di Bandara YIA / Stasiun / Hotel",
      "Kondisi armada bersih, wangi, & terawat prima",
      "BBM tidak termasuk (dikembalikan sesuai awal)",
    ],
  },
  {
    title: "Sewa Include Driver",
    description: "Nikmati perjalanan wisata tanpa lelah menyetir. Didampingi driver profesional, ramah, dan hafal seluruh destinasi wisata Jogja.",
    priceNote: "Mulai Rp400.000 / hari (Mobil + Driver)",
    bullets: [
      "Driver berpengalaman & berlisensi resmi",
      "Rute fleksibel sesuai preferensi Anda",
      "Termasuk jasa antar ke spot kuliner lokal",
      "Belum termasuk BBM, tol, & parkir",
    ],
  },
  {
    title: "Antar Jemput Bandara & Stasiun",
    description: "Layanan penjemputan dan pengantaran tepat waktu di Bandara Internasional Yogyakarta (YIA), Stasiun Tugu, atau Stasiun Lempuyangan.",
    priceNote: "Tarif all-in transparan",
    bullets: [
      "Driver siaga sebelum jadwal kedatangan Anda",
      "Bebas antre kendaraan umum",
      "Armada nyaman ber-AC dingin",
      "Bantuan bagasi oleh driver",
    ],
  },
];

export interface BenefitItem {
  title: string;
  description: string;
}

export const benefitsJogja: BenefitItem[] = [
  {
    title: "Armada Terbaru & Terawat",
    description: "Semua unit rutin diservis di bengkel resmi untuk menjamin keselamatan dan kenyamanan perjalanan Anda.",
  },
  {
    title: "Harga Transparan & Kompetitif",
    description: "Tidak ada biaya tersembunyi. Semua tarif sewa, DP, dan ketentuan denda tertera jelas di sistem.",
  },
  {
    title: "Layanan Pelanggan 24 Jam",
    description: "Tim customer support dan bantuan darurat siaga 24/7 untuk memastikan perjalanan Anda lancar tanpa kendala.",
  },
  {
    title: "Proses Booking & Bayar Cepat",
    description: "Reservasi online dalam hitungan menit dengan dukungan Payment Gateway otomatis (QRIS, VA Bank) atau transfer manual.",
  },
];

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export const stepsJogja: StepItem[] = [
  {
    number: "01",
    title: "Pilih Mobil & Tanggal",
    description: "Pilih armada sesuai kebutuhan Anda, tentukan tanggal mulai & selesai, serta opsi lepas kunci atau include driver.",
  },
  {
    number: "02",
    title: "Upload KTP & Bayar DP",
    description: "Lengkapi data identitas (KTP & SIM) dan selesaikan pembayaran DP 50% melalui QRIS atau transfer bank.",
  },
  {
    number: "03",
    title: "Terima & Nikmati Perjalanan",
    description: "Mobil siap diserahterimakan di lokasi yang Anda tentukan. Nikmati liburan seru dan nyaman di Yogyakarta!",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqJogja: FAQItem[] = [
  {
    question: "Apa saja syarat sewa mobil lepas kunci?",
    answer: "Penyewa wajib memiliki akun terdaftar, mengunggah foto e-KTP asli yang masih berlaku, dan foto SIM A aktif saat melakukan reservasi.",
  },
  {
    question: "Berapa minimal durasi sewa mobil?",
    answer: "Minimal durasi sewa adalah 24 jam (1 hari). Anda dapat memilih durasi lebih dari 1 hari sesuai kebutuhan perjalanan.",
  },
  {
    question: "Bagaimana sistem pembayarannya?",
    answer: "Pembayaran DP sebesar 50% dilakukan saat reservasi melalui Payment Gateway (QRIS/VA) atau transfer manual. Pelunasan sisa tagihan dilakukan setelah mobil selesai digunakan.",
  },
  {
    question: "Apakah bisa serah terima di Bandara YIA atau Stasiun Tugu?",
    answer: "Tentu bisa! Kami melayani serah terima armada langsung di Bandara Internasional Yogyakarta (YIA), Stasiun Tugu, Stasiun Lempuyangan, maupun hotel tempat Anda menginap.",
  },
  {
    question: "Bagaimana jika terjadi keterlambatan pengembalian?",
    answer: "Keterlambatan pengembalian dikenakan denda proporsional sebesar 10% dari tarif harian unit per jam keterlambatan yang otomatis tercatat di sistem pelunasan.",
  },
];
