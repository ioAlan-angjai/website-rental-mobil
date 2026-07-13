// lib/mock-data-jogja.ts

export interface CarJogja {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: 'suv' | 'mpv' | 'sedan' | 'hatchback' | 'elf';
  pricePerDay: number; // Harga sewa per hari
  transmission: 'Manual' | 'Otomatis';
  seats: number;
  fuelType: 'Bensin' | 'Diesel';
  images: string[];
  description: string;
  services: ('Lepas Kunci' | 'Dengan Driver')[]; // Jenis layanan yang didukung
  availability: boolean;
}

export const mockCarsJogja: CarJogja[] = [
  {
    id: "car-jog-001",
    name: "Honda Brio Satya 1.2 E",
    brand: "Honda",
    model: "Brio",
    year: 2022,
    category: "hatchback",
    pricePerDay: 300000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80",
    ],
    description: "City car gesit dan lincah, sangat irit bahan bakar untuk menyusuri jalanan kota Yogyakarta.",
    services: ["Lepas Kunci", "Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-002",
    name: "Toyota Avanza 1.5 G CVT",
    brand: "Toyota",
    model: "Avanza",
    year: 2023,
    category: "mpv",
    pricePerDay: 400000,
    transmission: "Otomatis",
    seats: 7,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Mobil keluarga dengan kabin luas dan suspensi empuk, pilihan populer untuk rombongan wisata.",
    services: ["Lepas Kunci", "Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-003",
    name: "Mitsubishi Xpander Ultimate 1.5",
    brand: "Mitsubishi",
    model: "Xpander",
    year: 2022,
    category: "mpv",
    pricePerDay: 450000,
    transmission: "Otomatis",
    seats: 7,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1627454820516-dc767bcb4d3e?w=800&auto=format&fit=crop&q=80",
    ],
    description: "MPV modern dengan desain futuristik dan tingkat kenyamanan berkendara yang tinggi di kelasnya.",
    services: ["Lepas Kunci", "Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-004",
    name: "Toyota Innova Reborn 2.4 G",
    brand: "Toyota",
    model: "Innova Reborn",
    year: 2021,
    category: "mpv",
    pricePerDay: 500000,
    transmission: "Manual",
    seats: 7,
    fuelType: "Diesel",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop&q=80",
    ],
    description: "MPV tangguh dengan mesin diesel bertenaga, kabin sangat senyap, dan kenyamanan suspensi prima.",
    services: ["Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-005",
    name: "Toyota Innova Zenix 2.0 G",
    brand: "Toyota",
    model: "Innova Zenix",
    year: 2023,
    category: "mpv",
    pricePerDay: 650000,
    transmission: "Otomatis",
    seats: 7,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Innova generasi terbaru dengan platform TNGA, kabin ekstra lapang, dan teknologi berkendara modern.",
    services: ["Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-006",
    name: "Honda HR-V SE 1.5 CVT",
    brand: "Honda",
    model: "HR-V",
    year: 2022,
    category: "suv",
    pricePerDay: 550000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Crossover SUV premium yang stylish dan tangguh, cocok untuk menjelajahi keindahan alam Yogyakarta.",
    services: ["Lepas Kunci", "Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-007",
    name: "Toyota Raize 1.0T GR Sport",
    brand: "Toyota",
    model: "Raize",
    year: 2023,
    category: "suv",
    pricePerDay: 400000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80",
    ],
    description: "SUV ringkas bermesin turbo yang bertenaga, handal untuk perjalanan perkotaan maupun pedesaan.",
    services: ["Lepas Kunci", "Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-008",
    name: "Toyota Yaris 1.5 S TRD",
    brand: "Toyota",
    model: "Yaris",
    year: 2021,
    category: "hatchback",
    pricePerDay: 350000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Hatchback dengan desain sporty khas TRD Sportivo, performa mesin responsif, dan suspensi stabil.",
    services: ["Lepas Kunci", "Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-009",
    name: "Toyota Vios 1.5 G CVT",
    brand: "Toyota",
    model: "Vios",
    year: 2022,
    category: "sedan",
    pricePerDay: 450000,
    transmission: "Otomatis",
    seats: 5,
    fuelType: "Bensin",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Sedan elegan dengan kenyamanan prima, kabin senyap, cocok untuk perjalanan dinas maupun bisnis.",
    services: ["Lepas Kunci", "Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-010",
    name: "Isuzu ELF Microbus 20 Seat",
    brand: "Isuzu",
    model: "ELF",
    year: 2022,
    category: "elf",
    pricePerDay: 950000,
    transmission: "Manual",
    seats: 20,
    fuelType: "Diesel",
    images: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Kendaraan komersial berkapasitas besar, sangat handal untuk wisata rombongan besar di DIY.",
    services: ["Dengan Driver"],
    availability: true,
  },
  {
    id: "car-jog-011",
    name: "Toyota Hiace Commuter 15 Seat",
    brand: "Toyota",
    model: "Hiace",
    year: 2022,
    category: "elf",
    pricePerDay: 1100000,
    transmission: "Manual",
    seats: 15,
    fuelType: "Diesel",
    images: [
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    ],
    description: "Microbus premium dengan kenyamanan suspensi setara MPV, kabin luas, ber-AC dingin menyeluruh.",
    services: ["Dengan Driver"],
    availability: true,
  },
];

export interface TestimonialJogja {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

export const mockTestimonialsJogja: TestimonialJogja[] = [
  {
    name: "Dimas Saputra",
    role: "Karyawan Swasta - Jakarta",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Sangat puas menyewa mobil Brio lepas kunci di sini. Kondisi mobil bersih, terawat, dan proses serah terima di bandara YIA sangat cepat dan profesional.",
  },
  {
    name: "Fitri Astuti",
    role: "Ibu Rumah Tangga - Bandung",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Kami sewa Innova Reborn beserta driver untuk liburan keluarga di Jogja. Sopirnya ramah, sangat paham rute wisata, dan mengemudi dengan sangat aman.",
  },
  {
    name: "Rian Hidayat",
    role: "Wiraswasta - Surabaya",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Pelayanan customer service siaga 24 jam sangat membantu. Sempat ada tanya jawab larut malam mengenai perubahan jadwal, direspon dengan sangat baik.",
  },
  {
    name: "Indah Lestari",
    role: "Dosen - Semarang",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Menggunakan layanan dengan driver untuk kunjungan kerja di UGM. Mobil bersih dan wangi, driver datang tepat waktu, perjalanan bisnis berjalan lancar.",
  },
  {
    name: "Haryo Prabowo",
    role: "Fotografer - Yogyakarta",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Sewa lepas kunci di sini tidak ribet persyaratannya. Tarifnya sangat kompetitif dibanding rental lain di Jogja. Sangat direkomendasikan untuk harian.",
  },
  {
    name: "Cindy Amanda",
    role: "Travel Blogger - Bali",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    text: "Pilihan armada Hiace sangat pas untuk rombongan kami. Mobilnya prima dan suspensinya nyaman untuk perjalanan jauh keliling pantai Gunungkidul.",
  },
];

export interface ServiceJogja {
  title: string;
  description: string;
  priceNote: string;
  bullets: string[];
}

export const mockServicesJogja: ServiceJogja[] = [
  {
    title: "Sewa Mobil Lepas Kunci",
    description: "Sewa mobil tanpa driver untuk kebebasan berkendara pribadi Anda. Cocok bagi Anda yang menginginkan privasi penuh selama mengelilingi Yogyakarta.",
    priceNote: "Mulai dari Rp 300.000 / hari (tidak termasuk bahan bakar)",
    bullets: [
      "Durasi sewa penuh 24 jam per hari",
      "Persyaratan verifikasi mudah dan aman",
      "Unit mobil bersih, wangi, dan disinfeksi rutin",
      "Roadside assistance siaga di area DIY",
    ],
  },
  {
    title: "Sewa Mobil Dengan Driver",
    description: "Layanan sewa mobil disertai pengemudi profesional yang ramah, sopan, dan berpengalaman. Pilihan terbaik untuk kenyamanan perjalanan wisata maupun dinas.",
    priceNote: "Mulai dari Rp 400.000 / hari (tidak termasuk bahan bakar)",
    bullets: [
      "Driver ramah dan bersertifikasi",
      "Paham rute tercepat dan destinasi wisata populer Jogja",
      "Durasi layanan 12 jam per hari",
      "Bebas lelah, Anda tinggal duduk manis menikmati jalanan",
    ],
  },
  {
    title: "Layanan Antar Jemput Unit",
    description: "Kemudahan ekstra untuk penyerahan dan pengembalian unit mobil sewaan langsung di lokasi Anda seperti bandara, stasiun, atau hotel.",
    priceNote: "Hubungi Admin untuk info biaya antar-jemput",
    bullets: [
      "Tersedia untuk Bandara YIA (Yogyakarta International Airport)",
      "Tersedia untuk Stasiun Tugu & Stasiun Lempuyangan",
      "Tersedia untuk pengantaran langsung ke Hotel/Homestay",
      "Serah terima resmi dengan tanda tangan digital",
    ],
  },
];
