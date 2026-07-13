# RentalMobil Jogja - Website Rental Mobil Premium

Platform website modern untuk layanan rental mobil di Yogyakarta dengan desain minimalis monokrom dan pengalaman pengguna yang optimal.

## Deskripsi Proyek

RentalMobil Jogja adalah aplikasi web yang menyediakan layanan penyewaan mobil untuk wilayah Yogyakarta dan sekitarnya. Website ini dibangun dengan teknologi modern dan mengutamakan performa, aksesibilitas, dan user experience.

## Fitur Utama

- **Katalog Armada Lengkap**: Menampilkan berbagai jenis mobil dengan filter pencarian yang canggih
- **Sistem Booking Bertahap**: Proses booking dengan 3 langkah yang mudah dipahami
- **Desain Responsif**: Tampilan optimal di semua perangkat (desktop, tablet, mobile)
- **Animasi Interaktif**: Smooth scroll animations dan hover effects yang elegan
- **Multi-layanan**: Lepas kunci dan dengan sopir

## Teknologi yang Digunakan

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns

## Persyaratan Sistem

- Node.js 18.x atau lebih baru
- npm atau yarn
- Git

## Instalasi

1. Clone repository ini:
```bash
git clone https://github.com/ioAlan-angjai/website-rental-mobil.git
cd website-rental-mobil
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env.local` untuk konfigurasi environment (jika diperlukan):
```bash
# Contoh konfigurasi
NEXT_PUBLIC_API_URL=your_api_url_here
```

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser dan akses: `http://localhost:3000`

## Perintah Tersedia

```bash
# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Struktur Folder

```
website-rental/
├── app/                    # Next.js App Router pages
│   ├── armada/            # Halaman katalog armada
│   ├── booking/           # Halaman booking
│   ├── kontak/            # Halaman kontak
│   ├── layanan/           # Halaman layanan
│   ├── tentang-kami/      # Halaman tentang kami
│   └── testimoni/         # Halaman testimoni
├── components/            # Reusable components
│   ├── landing/          # Landing page components
│   └── ui/               # UI components (Shadcn)
├── lib/                  # Utility functions dan data
└── public/               # Static assets
```

## Fitur Unggulan

### Desain Monokrom Premium
Website menggunakan skema warna hitam-putih dengan aksen abu-abu yang memberikan kesan profesional dan elegan.

### Performance Optimization
- Static Site Generation untuk halaman utama
- Image optimization
- Code splitting otomatis
- Lazy loading untuk komponen

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Screen reader friendly

### Animasi Halus
- Scroll-triggered animations
- Smooth transitions
- Micro-interactions pada hover
- Premium card effects

## Konfigurasi

### Tailwind CSS
File konfigurasi ada di `tailwind.config.ts` untuk customisasi tema, warna, dan spacing.

### TypeScript
Konfigurasi TypeScript strict mode di `tsconfig.json` untuk type safety optimal.

## Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Import project di Vercel
3. Deploy otomatis akan berjalan

### Manual Deployment
```bash
npm run build
npm start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Kontribusi

Kontribusi sangat diterima. Silakan buat issue atau pull request untuk perbaikan dan fitur baru.

## Lisensi

Proyek ini dibuat untuk keperluan komersial RentalMobil Jogja.

## Kontak

Untuk pertanyaan atau dukungan, hubungi:
- Website: [RentalMobil Jogja](https://rentalmobil-jogja.com)
- Email: info@rentalmobil-jogja.com
- WhatsApp: +62 812-3456-7890

## Changelog

### Version 1.0.0 (2026-07-13)
- Initial release
- Implementasi katalog armada dengan filter
- Sistem booking 3 langkah
- Halaman layanan, testimoni, dan kontak
- Design system monokrom premium
- Animasi scroll dan hover effects
- Responsive layout untuk semua device
- Fixed navbar dengan backdrop blur
- Optimasi performa dan SEO

---

Dibuat dengan Next.js dan TypeScript untuk RentalMobil Jogja
