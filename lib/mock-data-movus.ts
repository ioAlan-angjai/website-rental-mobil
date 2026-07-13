// lib/mock-data-movus.ts

export interface CarMovus {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: 'economy' | 'family' | 'suv' | 'mpv';
  pricePerMonth: number; // Harga bulanan (skema sewa jadi milik)
  pricePerDay: number; // Harga harian
  transmission: 'Manual' | 'Otomatis';
  seats: number;
  fuelType: 'Bensin' | 'Diesel' | 'Listrik';
  mileage: number;
  images: string[];
  description: string;
  availability: boolean;
  tag: 'Terlaris' | 'Promo' | 'Terbaru' | 'Eksklusif';
  features: string[];
}

export const mockCarsMovus: CarMovus[] = [
  {
    id: "car-mov-001",
    name: "Honda Brio Satya 1.2 E",
    brand: "Honda",
    model: "Brio",
    year: 2023,
    category: "economy",
    pricePerMonth: 3400000,
    pricePerDay: 180000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    mileage: 12000,
    images: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80",
    ],
    description: "City car paling populer di Indonesia. Sangat hemat bahan bakar, gesit, dan nyaman untuk penggunaan sehari-hari di kota Yogyakarta.",
    availability: true,
    tag: "Terlaris",
    features: ["AC", "Audio Bluetooth", "Dual SRS Airbags", "ABS + EBD", "Bebas Keluar Kota"],
  },
  {
    id: "car-mov-002",
    name: "Toyota Avanza 1.5 G CVT",
    brand: "Toyota",
    model: "Avanza",
    year: 2023,
    category: "family",
    pricePerMonth: 4600000,
    pricePerDay: 250000,
    transmission: "Otomatis",
    seats: 7,
    fuelType: "Bensin",
    mileage: 18000,
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Mobil keluarga sejuta umat dengan kabin ekstra luas dan suspensi baru yang sangat nyaman. Pilihan terbaik untuk keluarga atau rombongan.",
    availability: true,
    tag: "Terlaris",
    features: ["AC Double Blower", "Touchscreen Head Unit", "Start/Stop Engine Button", "Toyota Safety Sense"],
  },
  {
    id: "car-mov-003",
    name: "Mitsubishi Xpander Ultimate 1.5",
    brand: "Mitsubishi",
    model: "Xpander",
    year: 2023,
    category: "mpv",
    pricePerMonth: 5200000,
    pricePerDay: 300000,
    transmission: "Otomatis",
    seats: 7,
    fuelType: "Bensin",
    mileage: 15000,
    images: [
      "https://images.unsplash.com/photo-1627454820516-dc767bcb4d3e?w=800&auto=format&fit=crop&q=80",
    ],
    description: "MPV premium dengan kenyamanan ala sedan. Interior sangat mewah, kabin kedap suara, dan performa mesin yang responsif.",
    availability: true,
    tag: "Promo",
    features: ["Cruise Control", "Panoramic Sunroof", "Active Stability Control", "Electric Parking Brake"],
  },
  {
    id: "car-mov-004",
    name: "Honda HR-V SE 1.5 CVT",
    brand: "Honda",
    model: "HR-V",
    year: 2023,
    category: "suv",
    pricePerMonth: 6500000,
    pricePerDay: 380000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    mileage: 9000,
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Crossover SUV mewah untuk Anda yang berjiwa muda. Dilengkapi panoramic glass roof, Honda Sensing, dan desain eksterior futuristik.",
    availability: true,
    tag: "Terbaru",
    features: ["Panoramic Glass Roof", "Honda SENSING", "Leather Seats", "Sequential LED Turning Signal"],
  },
  {
    id: "car-mov-005",
    name: "Toyota Raize 1.0T GR Sport",
    brand: "Toyota",
    model: "Raize",
    year: 2023,
    category: "suv",
    pricePerMonth: 4400000,
    pricePerDay: 230000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    mileage: 14000,
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Compact SUV bermesin Turbo yang sangat bertenaga dan efisien. Tampilan sporty khas Gazoo Racing dengan warna two-tone yang keren.",
    availability: true,
    tag: "Promo",
    features: ["Turbocharged Engine", "GR Sport Bodykit", "Paddle Shift", "6 Airbags"],
  },
  {
    id: "car-mov-006",
    name: "Hyundai Creta Prime 1.5 IVT",
    brand: "Hyundai",
    model: "Creta",
    year: 2023,
    category: "suv",
    pricePerMonth: 5400000,
    pricePerDay: 320000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    mileage: 11000,
    images: [
      "https://images.unsplash.com/photo-1669865660857-4148f95c479e?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Smart SUV dengan fitur konektivitas terlengkap. Dilengkapi Hyundai Bluelink, Bose Premium Sound System, dan ventilasi kursi depan.",
    availability: true,
    tag: "Eksklusif",
    features: ["Hyundai Bluelink", "Bose Sound System", "Cooled Seats", "Panoramic Sunroof"],
  },
  {
    id: "car-mov-007",
    name: "Daihatsu Rocky 1.2 X CVT",
    brand: "Daihatsu",
    model: "Rocky",
    year: 2022,
    category: "economy",
    pricePerMonth: 3800000,
    pricePerDay: 200000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    mileage: 22000,
    images: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Compact SUV andalan harian dengan harga bersahabat. Ground clearance tinggi membuat berkendara di berbagai medan menjadi lebih percaya diri.",
    availability: true,
    tag: "Promo",
    features: ["Digital Instrument Cluster", "LED Headlamp", "Hill Start Assist", "Android Auto & Carplay"],
  },
  {
    id: "car-mov-008",
    name: "Wuling Air EV Long Range",
    brand: "Wuling",
    model: "Air EV",
    year: 2023,
    category: "economy",
    pricePerMonth: 4200000,
    pricePerDay: 220000,
    transmission: "Otomatis",
    seats: 4,
    fuelType: "Listrik",
    mileage: 6000,
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Mobil listrik mikro paling populer di Indonesia. Bebas emisi, biaya operasional ultra-rendah, dan radius putar sangat kecil untuk gang sempit.",
    availability: true,
    tag: "Terlaris",
    features: ["100% Listrik (EV)", "Jarak Tempuh 300km", "Dual Screen 10.25 inci", "Smart Start System"],
  },
  {
    id: "car-mov-009",
    name: "Toyota Innova Zenix 2.0 G",
    brand: "Toyota",
    model: "Innova Zenix",
    year: 2023,
    category: "family",
    pricePerMonth: 7800000,
    pricePerDay: 450000,
    transmission: "Otomatis",
    seats: 7,
    fuelType: "Bensin",
    mileage: 8000,
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Generasi terbaru Kijang Innova dengan platform monokok TNGA. Sangat luas, kenyamanan kabin luar biasa, dan performa suspensi premium.",
    availability: true,
    tag: "Eksklusif",
    features: ["Kabin Extra Lapang", "Platform TNGA", "Electric Parking Brake", "Captain Seats"],
  },
  {
    id: "car-mov-010",
    name: "Daihatsu Sigra 1.2 R DLX",
    brand: "Daihatsu",
    model: "Sigra",
    year: 2023,
    category: "economy",
    pricePerMonth: 2900000,
    pricePerDay: 150000,
    transmission: "Manual",
    seats: 7,
    fuelType: "Bensin",
    mileage: 26000,
    images: [
      "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Mobil keluarga 7-seater paling ekonomis. Perawatan sangat murah, hemat bensin, dan sangat diandalkan untuk operasional sehari-hari.",
    availability: true,
    tag: "Promo",
    features: ["7 Kursi Penumpang", "Sangat Irit Bahan Bakar", "Rear AC Circulator", "Sensor Parkir Depan Belakang"],
  },
];

export interface TestimonialMovus {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

export const mockTestimonialsMovus: TestimonialMovus[] = [
  {
    name: "Budi Santoso",
    role: "Driver Online - Yogyakarta",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Sewa 5 tahun di RentalMobil ini beneran jadi milik! Tanpa DP awal sama sekali, bantu banget buat saya yang baru mulai narik taksi online. Asuransi dan pajaknya juga ditanggung penuh.",
  },
  {
    name: "Siti Nurhaliza",
    role: "Ibu Rumah Tangga - Condongcatur",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Pilihan terbaik buat keluarga kecil kami. Mobilnya selalu diservis rutin tepat waktu, gratis pula biaya sparepart-nya. Setelah 5 tahun, mobil ini akan resmi dibalik nama jadi milik kami secara gratis!",
  },
  {
    name: "Raka Wijaya",
    role: "Wirausaha - Sleman",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Sangat puas dengan opsi bebas ke luar kota. Kadang harus antar barang usaha ke Jawa Tengah dan Jawa Timur, tidak pernah dipungut denda tambahan. Customer servicenya responsif 24 jam.",
  },
  {
    name: "Maya Putri",
    role: "Karyawan Swasta - Depok, Sleman",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Awalnya skeptis, tapi ternyata syaratnya gampang banget. Dokumen langsung disurvey online, 3 hari kemudian mobil langsung diserahterimakan depan rumah. Tanpa bayar sepeser pun di awal!",
  },
  {
    name: "Anto Suryanto",
    role: "Freelance Designer - Kotagede",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "RentalMobil memberikan fleksibilitas luar biasa. Tidak perlu pusing mikirin biaya perpanjangan STNK tahunan atau ganti oli bulanan, semuanya sudah include dalam biaya sewa bulanan yang flat.",
  },
  {
    name: "Lisa Chen",
    role: "Mahasiswi Pascasarjana - Yogyakarta",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Pilihan mobil listrik Wuling Air EV sangat cocok buat mobilitas harian saya ke kampus. Ramah lingkungan, irit baterai, dan skema pembayaran bulanan yang sangat transparan tanpa biaya siluman.",
  },
];

export const mockBenefitsMovus = [
  {
    title: "GRATIS Sparepart 5 Tahun",
    description: "Semua pergantian komponen yang aus seperti kampas rem, ban, aki, dan wiper ditanggung penuh oleh kami selama 5 tahun penuh.",
    icon: "🔧",
  },
  {
    title: "GRATIS Pajak 5 Tahun",
    description: "Kami yang mengurus dan membayar pajak kendaraan bermotor (STNK) tahunan dan lima tahunan. Anda hanya perlu fokus berkendara.",
    icon: "📄",
  },
  {
    title: "GRATIS Servis & Asuransi",
    description: "Sudah termasuk perawatan berkala rutin (ganti oli & filter) serta asuransi Comprehensive (All-Risk) untuk melindungi perjalanan Anda.",
    icon: "🛡️",
  },
  {
    title: "BEBAS Ke Luar Kota",
    description: "Gunakan mobil untuk perjalanan dinas, usaha, atau liburan keluarga ke seluruh wilayah Indonesia tanpa ada batasan wilayah operasional.",
    icon: "🛣️",
  },
  {
    title: "Customer Service 24 Jam",
    description: "Tim darurat kami siap sedia melayani Anda kapan pun terjadi kendala teknis di jalanan, lengkap dengan towing gratis jika diperlukan.",
    icon: "📞",
  },
  {
    title: "GRATIS Biaya Balik Nama",
    description: "Setelah masa sewa 5 tahun selesai, mobil kami balik nama secara legal atas nama Anda. Seluruh biaya administrasi kami tanggung gratis.",
    icon: "🤝",
  },
];

export const mockStepsMovus = [
  {
    step: "01",
    title: "Kirim Dokumen Pengajuan",
    description: "Upload foto KTP, Kartu Keluarga, dan bukti penghasilan secara online lewat formulir pendaftaran kami.",
  },
  {
    step: "02",
    title: "Pemeriksaan Kelengkapan",
    description: "Tim verifikasi kami akan memeriksa keaslian dan kelayakan dokumen Anda dalam waktu maksimal 24 jam.",
  },
  {
    step: "03",
    title: "Booking Survey",
    description: "Kami akan melakukan survey verifikasi singkat secara online atau tatap muka sesuai jadwal luang Anda.",
  },
  {
    step: "04",
    title: "Pilih Mobilmu",
    description: "Setelah disetujui, pilih mobil impian yang tersedia dari garasi kami sesuai dengan budget bulanan Anda.",
  },
  {
    step: "05",
    title: "Serah Terima Mobil",
    description: "Mobil akan kami kirim langsung ke alamat rumah Anda, lengkap dengan serah terima kunci dan penandatanganan akad sewa.",
  },
];

export const mockFAQS = [
  {
    question: "Bagaimana skema sewa jadi milik ini bekerja?",
    answer: "Anda menyewa mobil pilihan Anda dengan tarif flat bulanan selama 60 bulan (5 tahun). Selama masa tersebut, seluruh biaya perawatan, servis rutin, asuransi all-risk, sparepart habis pakai, dan pajak kendaraan ditanggung penuh oleh RentalMobil. Setelah genap 5 tahun, kepemilikan mobil tersebut resmi dialihkan atas nama Anda tanpa biaya tambahan.",
  },
  {
    question: "Apakah benar-benar tanpa biaya awal?",
    answer: "Ya, benar. Skema kami tidak memerlukan uang muka (down payment) sama sekali. Anda hanya perlu membayar sewa bulan pertama saat proses serah terima mobil selesai dilakukan.",
  },
  {
    question: "Bagaimana jika saya ingin mengembalikan mobil sebelum 5 tahun?",
    answer: "Anda dapat mengajukan pengakhiran kontrak sewa lebih awal dengan ketentuan penalti yang sangat bersahabat dan transparan, sesuai yang tercantum di surat perjanjian sewa.",
  },
  {
    question: "Dokumen apa saja yang diperlukan?",
    answer: "Anda hanya perlu mempersiapkan KTP suami/istri (jika sudah menikah), Kartu Keluarga, SIM A yang masih aktif, dan bukti pendapatan 3 bulan terakhir (slip gaji atau mutasi rekening).",
  },
];
