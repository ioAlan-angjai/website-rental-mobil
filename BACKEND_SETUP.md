# Backend Setup Guide - RentalMobil Jogja

## 🎯 Overview

Backend menggunakan stack FULL GRATIS dengan fitur lengkap:
- Authentication (Login/Register)
- Booking System dengan DP 50%
- Payment dengan QRIS & Transfer 3 Bank
- Live Chat Real-time
- Admin Dashboard

## 📦 Tech Stack (100% GRATIS)

### Core Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase (500MB free)
- **ORM**: Prisma
- **Auth**: NextAuth.js v4
- **File Upload**: Uploadthing (2GB free)
- **Email**: Resend (3000 emails/month free)

### Payment & Communication
- **Payment Gateway**: Midtrans/Xendit (fee 2.9% per transaksi)
- **Live Chat**: Socket.io (self-hosted di Vercel)
- **Real-time**: Pusher free tier (200 connections)

## 🚀 Quick Start

### 1. Setup Supabase (Database)

1. Buka [supabase.com](https://supabase.com)
2. Buat project baru (FREE)
3. Copy connection string dari Settings > Database
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan kredensial Anda
```

Isi file `.env`:

```env
# Database (wajib)
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres"

# NextAuth (wajib)
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (untuk storage)
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT-REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dari-supabase-dashboard"
SUPABASE_SERVICE_ROLE_KEY="dari-supabase-dashboard"

# Uploadthing (untuk bukti bayar)
UPLOADTHING_SECRET="dari-uploadthing-dashboard"
UPLOADTHING_APP_ID="dari-uploadthing-dashboard"

# Resend (untuk email)
RESEND_API_KEY="dari-resend-dashboard"

# Midtrans (payment gateway)
MIDTRANS_SERVER_KEY="dari-midtrans-dashboard"
MIDTRANS_CLIENT_KEY="dari-midtrans-dashboard"
MIDTRANS_IS_PRODUCTION="false"

# Bank Transfer Manual
BANK_BCA_NUMBER="1234567890"
BANK_BCA_NAME="PT RentalMobil Jogja"
BANK_BNI_NUMBER="0987654321"
BANK_BNI_NAME="PT RentalMobil Jogja"
BANK_MANDIRI_NUMBER="1122334455"
BANK_MANDIRI_NAME="PT RentalMobil Jogja"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# (Optional) Seed sample data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Models

#### User & Authentication
- `User` - Data pengguna dengan role (USER/ADMIN)
- `Account` - OAuth accounts
- `Session` - User sessions

#### Fleet Management
- `Car` - Armada mobil dengan detail lengkap

#### Booking System
- `Booking` - Transaksi penyewaan
- `Payment` - Pembayaran (DP, Pelunasan, Denda)

#### Communication
- `Chat` - Session chat
- `ChatMessage` - Pesan chat
- `Notification` - Notifikasi user

#### Configuration
- `BankAccount` - Rekening bank untuk transfer
- `Setting` - Pengaturan aplikasi

## 🔐 Authentication

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+6281234567890"
}
```

### Login

```bash
POST /api/auth/signin/credentials
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## 💳 Payment Flow

### 1. Booking Creation
User booking → Status: `PENDING`

### 2. DP Payment (50%)
User upload bukti bayar → Status: `WAITING_DP`

### 3. Admin Verification
Admin approve → Status: `DP_CONFIRMED`

### 4. Start Rental
Tanggal mulai → Status: `IN_PROGRESS`

### 5. Completion & Full Payment
Selesai → Status: `COMPLETED`

### Payment Methods
- **QRIS**: Generate QR code otomatis
- **Bank Transfer**: 3 bank (BCA, BNI, Mandiri)
- **Manual Verification**: Upload bukti transfer

## 📱 API Endpoints

### Public
- `GET /api/cars` - List semua mobil
- `GET /api/cars/:id` - Detail mobil
- `POST /api/booking` - Buat booking (guest/user)

### User (Requires Login)
- `GET /api/user/bookings` - List booking user
- `GET /api/user/bookings/:id` - Detail booking
- `POST /api/booking/:id/payment` - Upload bukti bayar
- `GET /api/chat` - Chat session
- `POST /api/chat/message` - Kirim pesan

### Admin (Requires Admin Role)
- `GET /api/admin/bookings` - Semua booking
- `PATCH /api/admin/bookings/:id/verify` - Verifikasi pembayaran
- `GET /api/admin/cars` - Kelola armada
- `POST /api/admin/cars` - Tambah mobil
- `PATCH /api/admin/cars/:id` - Update mobil
- `DELETE /api/admin/cars/:id` - Hapus mobil

## 🔧 Development Commands

```bash
# Development
npm run dev

# Build production
npm run build

# Start production
npm start

# Database
npx prisma studio        # GUI database
npx prisma db push       # Push schema
npx prisma db seed       # Seed data
npx prisma generate      # Generate client

# Type check
npm run type-check

# Lint
npm run lint
```

## 🌐 Deployment (Vercel - GRATIS)

### 1. Push ke GitHub

```bash
git add .
git commit -m "feat: backend implementation"
git push origin main
```

### 2. Deploy di Vercel

1. Buka [vercel.com](https://vercel.com)
2. Import repository GitHub
3. Add environment variables
4. Deploy

### 3. Setup Supabase untuk Production

1. Update `NEXTAUTH_URL` ke domain Vercel
2. Whitelist domain di Supabase
3. Setup storage buckets untuk upload bukti bayar

## 📈 Monitoring

### Free Tools
- **Vercel Analytics** - Traffic & performance
- **Supabase Dashboard** - Database metrics
- **Resend Dashboard** - Email analytics

### Logs
- Vercel Function Logs
- `console.log` akan muncul di Vercel dashboard

## 🔒 Security

### Implemented
- Password hashing (bcryptjs)
- JWT sessions
- Role-based access control
- Input validation (Zod)
- CSRF protection (NextAuth)

### Best Practices
- Jangan commit `.env`
- Gunai HTTPS di production
- Validasi semua user input
- Rate limiting untuk API

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Cek DATABASE_URL format
# Pastikan IP di-whitelist di Supabase
```

### Prisma Error
```bash
# Regenerate client
npx prisma generate
```

### Build Error
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Midtrans Docs](https://api-docs.midtrans.com/)

## 🆘 Support

Jika ada masalah:
1. Cek dokumentasi di atas
2. Cek error logs di terminal/Vercel
3. Buat issue di GitHub repository

---

**Status**: ✅ Backend siap digunakan
**Last Updated**: 2026-07-13
