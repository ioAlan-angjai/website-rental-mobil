# RentalMobil Jogja - Website Premium untuk Mahasiswa Yogyakarta

Website rental mobil modern dengan desain monokrom premium, fitur lengkap, dan backend gratis untuk mahasiswa di Yogyakarta.

## ✨ Fitur Lengkap

### 🔐 Sistem Autentikasi & Authorization
- **Login/Register** dengan NextAuth
- **Dashboard User** - Riwayat booking & profil
- **Dashboard Admin** - Verifikasi pembayaran & monitoring
- **Role-based access control** (USER / ADMIN)

### 📋 Form Booking Multi-Step (4 Step)
1. **Identitas** - Nama, WhatsApp, Email
2. **Layanan & Unit** - Pilih mobil, jenis sewa, tanggal, durasi
3. **Konfirmasi** - Review pesanan & DP 50%
4. **Pembayaran** - Pilih bank & upload bukti transfer

### 🏦 Sistem Pembayaran
- **3 Bank Transfer** - BCA, BNI, Mandiri
- **DP 50%** - Sistem pembayaran awal 50%
- **Upload Bukti** - Drag & drop dengan preview gambar
- **Verifikasi Manual** - Admin bisa verifikasi payment via dashboard

### 🗄️ Database & Backend Gratis
- **Database** - SQLite dengan Prisma ORM
- **Seed Data** - 15+ mobil, akun admin/user, bank accounts
- **API Routes** - Full CRUD untuk booking, payment, auth
- **Prisma Studio** - GUI untuk manage database

### 🎨 UI/UX Premium Monochrome
- **Tema Monokrom** - Hitam, putih, abu-abu premium
- **Animasi Smooth** - Framer Motion transitions
- **Background Ornaments** - Pernak-pernik dekoratif
- **Responsive** - Mobile-first design

## 🚀 Tech Stack 100% Gratis

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: Shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **File Upload**: react-dropzone

### Backend
- **Authentication**: NextAuth.js
- **Database**: SQLite + Prisma
- **ORM**: Prisma Client
- **API**: Next.js API Routes
- **File Storage**: Local (bisa upgrade ke Supabase/Uploadthing)

## 📁 Struktur Project

```
website-rental/
├── app/
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (customer)/          # Customer-facing pages
│   ├── (admin)/             # Admin dashboard
│   ├── account/             # User profile dashboard
│   ├── admin/               # Admin panel
│   ├── api/                 # API endpoints
│   │   ├── auth/            # Authentication routes
│   │   ├── booking/         # Booking CRUD
│   │   ├── admin/           # Admin-only endpoints
│   │   └── cars/            # Car management
│   ├── armada/              # Car catalog
│   ├── booking/             # Booking page (multi-step)
│   ├── kontak/              # Contact page
│   ├── layanan/             # Services page
│   ├── tentang-kami/        # About us
│   └── testimoni/           # Testimonials
├── components/
│   ├── landing/             # Landing page components
│   ├── admin/              # Admin dashboard components
│   ├── ui/                 # Reusable UI components (Shadcn)
│   └── providers/          # React providers (Session, Theme)
├── lib/
│   ├── auth.ts             # Authentication config
│   ├── prisma.ts           # Database client
│   ├── utils.ts            # Utility functions
│   └── mock-data-jogja.ts  # Mock car data for Jogja
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── dev.db              # SQLite database
│   └── seed.ts             # Seed script
└── public/                 # Static assets
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18.x atau lebih baru
- npm atau yarn
- Git

### 1. Clone Repository
```bash
git clone https://github.com/ioAlan-angjai/website-rental-mobil.git
cd website-rental-mobil
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Setup database (create tables & seed data)
npm run db:setup
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Website akan berjalan di **http://localhost:3000**

### 5. Akses Prisma Studio (Optional)
```bash
npx prisma studio
```
GUI database akan berjalan di **http://localhost:5555**

## 🔧 Setup Environment Variables

Buat file `.env.local` di root folder:
```env
# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Database (SQLite)
DATABASE_URL="file:./dev.db"

# Bank Accounts (untuk testing)
BANK_BCA_NUMBER="1234567890"
BANK_BCA_NAME="PT RentalMobil Jogja"
BANK_BNI_NUMBER="0987654321"
BANK_BNI_NAME="PT RentalMobil Jogja"
BANK_MANDIRI_NUMBER="1122334455"
BANK_MANDIRI_NAME="PT RentalMobil Jogja"
```

## 📊 Akun Demo yang Tersedia

### Admin (untuk verifikasi pembayaran)
```
Email: admin@rentalmobil.com
Password: adminpassword123
URL: http://localhost:3000/admin
```

### User (untuk booking)
```
Email: user@example.com
Password: user123
URL: http://localhost:3000/account
```

## 🧪 Testing Flow Lengkap

### 1. Booking sebagai Guest/User
```
1. Akses http://localhost:3000/booking
2. Isi form 4 step:
   - Step 1: Identitas (Nama, WhatsApp, Email)
   - Step 2: Pilih mobil & layanan
   - Step 3: Review & konfirmasi DP 50%
   - Step 4: Pilih bank & upload bukti transfer
3. Submit booking
```

### 2. Verifikasi sebagai Admin
```
1. Login di http://localhost:3000/login
   Email: admin@rentalmobil.com
   Password: adminpassword123
2. Akses dashboard admin: http://localhost:3000/admin
3. Lihat booking yang masuk
4. Verifikasi pembayaran yang diupload user
```

### 3. User Melihat Status Booking
```
1. Login sebagai user
   Email: user@example.com
   Password: user123
2. Akses dashboard user: http://localhost:3000/account
3. Lihat riwayat booking & status
```

## 📋 Scripts Available

```bash
# Development
npm run dev              # Start dev server

# Build & Production
npm run build            # Build for production
npm start               # Start production server

# Database
npm run db:setup        # Setup database (generate + push + seed)
npm run prisma:generate # Generate Prisma client
npm run prisma:push     # Push schema to database
npm run prisma:seed     # Seed database with sample data
npm run prisma:studio   # Open Prisma Studio GUI

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## 🚀 Deployment

### Deploy ke Vercel (Recommended)
1. Push ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy otomatis

### Deploy Manual
```bash
npm run build
npm start
```

## 🔍 Troubleshooting

### Port Already in Use
Jika port 3000 sudah dipakai:
```bash
# Kill process di port 3000
npx kill-port 3000

# Atau jalankan di port lain
PORT=3001 npm run dev
```

### Database Issues
```bash
# Reset database
rm -rf prisma/dev.db
npm run db:setup

# Atau regenerasi Prisma client
npx prisma generate --force
```

### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Fitur yang Bisa Diupgrade

### Backend Cloud (Opsional)
- **Supabase** untuk PostgreSQL cloud
- **Uploadthing** untuk upload file cloud
- **Resend** untuk email notifications
- **Midtrans** untuk payment gateway otomatis

### Frontend Enhancement
- **Live Chat** dengan Socket.io
- **PWA** (Progressive Web App)
- **Offline Mode** dengan service workers
- **Multi-language** (i18n)

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dibuat untuk keperluan komersial RentalMobil Jogja Yogyakarta.

## 📞 Kontak & Support

- **Website**: [RentalMobil Jogja](https://rentalmobil-jogja.com)
- **Email**: info@rentalmobil-jogja.com
- **WhatsApp**: +62 812-3456-7890
- **Lokasi**: Yogyakarta, Indonesia

---

**Dibuat dengan ❤️ untuk mahasiswa Yogyakarta menggunakan Next.js, TypeScript, dan Tailwind CSS.**

© 2026 RentalMobil Jogja - All rights reserved.
