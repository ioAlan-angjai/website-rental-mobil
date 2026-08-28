# RentalMobil Jogja - Sistem Informasi Rental Mobil

Platform rental mobil digital terintegrasi untuk wilayah Yogyakarta dan sekitarnya. Sistem ini dilengkapi dengan integrasi database Supabase PostgreSQL, payment gateway otomatis Midtrans, sistem pelunasan, manajemen armada dan driver, live chat, serta auto-invoice generator.

---

## Daftar Isi

1. Tech Stack
2. User Role dan Hak Akses
3. Fitur Utama
4. Struktur Proyek
5. Prasyarat Sistem
6. Panduan Instalasi dan Menjalankan
7. Konfigurasi Environment Variables
8. Akun Demo untuk Pengujian
9. Alur Transaksi dan Pengujian
10. Daftar Script Perintah
11. Lisensi dan Kontak

---

## 1. Tech Stack

### Frontend
- Framework: Next.js 14 (App Router Architecture)
- Bahasa Pemrograman: TypeScript
- Styling: Tailwind CSS
- Komponen UI: Shadcn UI, Radix UI Primitives
- Ikon: Lucide React
- Animasi: Framer Motion
- Form Handling & Upload: React Dropzone, FormData API
- Manajemen Tanggal: date-fns

### Backend dan Database
- Runtime: Node.js
- Framework API: Next.js API Routes (Route Handlers)
- Autentikasi: NextAuth.js (JWT Session Strategy & Credentials Provider)
- Enkripsi Password: Bcrypt.js
- Database: Supabase PostgreSQL
- Object-Relational Mapping (ORM): Prisma Client
- Connection Pooler: Supabase Transaction / Session Pooler (IPv4 Compatible)

### Integrasi Pihak Ketiga
- Payment Gateway: Midtrans Snap API (QRIS, GoPay, ShopeePay, Virtual Account BCA, BNI, Mandiri, Permata, Kartu Kredit) dan Webhook Notification
- Penyimpanan Berkas: Local Physical File Storage (`public/uploads/`) dengan sanitasi nama berkas

---

## 2. User Role dan Hak Akses

Sistem menggunakan kontrol akses berbasis peran (Role-Based Access Control / RBAC) dengan pembagian hak akses sebagai berikut:

### 1. Guest (Pengunjung Tanpa Login)
- Menjelajahi halaman beranda, katalog armada, detail unit, layanan, FAQ, dan kontak.
- Membaca ulasan dan testimoni pelanggan.
- Berinteraksi melalui widget live chat.
- Mengakses halaman pendaftaran akun dan login.

### 2. User (Pelanggan Terdaftar)
- Semua hak akses Guest.
- Melakukan reservasi mobil (lepas kunci maupun dengan supir) melalui formulir booking interaktif.
- Mengunggah dokumen identitas wajib (KTP dan SIM A).
- Memilih metode pembayaran DP 50% (Instan via Midtrans Snap atau Transfer Bank Manual).
- Mengakses halaman Riwayat Booking untuk memantau linimasa status pesanan secara real-time.
- Melanjutkan pembayaran DP yang tertunda langsung dari riwayat booking.
- Melakukan konfirmasi pelunasan sisa tagihan (termasuk denda keterlambatan jika ada) via halaman Pelunasan.
- Melihat dan mencetak Invoice digital resmi berformat standar cetak (PDF-ready).
- Mengelola profil pengguna dan mengubah kata sandi.

### 3. Admin (Pengelola Rental)
- Semua hak akses User.
- Mengakses Dashboard Admin terlindungi (`/admin`).
- Manajemen Armada: Tambah mobil baru, edit spesifikasi, update status unit (AVAILABLE, BOOKED, MAINTENANCE), dan hapus unit.
- Manajemen Booking: Verifikasi pembayaran DP manual, ubah status pesanan (DP_CONFIRMED, IN_PROGRESS, WAITING_RETURN, WAITING_PAYMENT, COMPLETED, CANCELLED, REJECTED), serta input denda dan biaya tambahan.
- Manajemen Driver: Tambah profil driver, atur nomor telepon, alamat, pengalaman, dan status ketersediaan (READY, ON_DUTY, OFF).
- Manajemen Pengaturan Bisnis: Mengatur tarif jasa driver per hari, persentase DP, denda per jam, dan kontak operasional.
- Manajemen Rekening Bank: Menambah dan memperbarui data rekening bank tujuan transfer manual.
- Manajemen Testimoni: Mengelola ulasan yang ditampilkan di landing page.
- Monitoring Pembayaran: Melihat rekap transaksi dan bukti transfer yang diunggah pelanggan.

---

## 3. Fitur Utama

### A. Katalog Armada Real-Time
- Seluruh data mobil diambil langsung dari Supabase PostgreSQL.
- Filter pencarian berdasarkan nama, kategori (City Car, MPV, SUV, Luxury, Van), jenis transmisi, dan kapasitas kursi.
- Halaman detail unit lengkap dengan spesifikasi teknis, fitur kendaraan, dan tombol booking langsung.

### B. Formulir Reservasi Multi-Step
- Alur 7 langkah terstruktur: Pemilihan Layanan, Jadwal Sewa, Pilihan Supair, Data Pemesan, Dokumen Identitas (KTP & SIM), Konfirmasi Pesanan, dan Pembayaran DP 50%.
- Kalkulasi otomatis durasi sewa dan total nominal tagihan secara real-time.

### C. Pembayaran Ganda (Dual Payment Gateway & Manual)
- Pembayaran Otomatis Midtrans: Menampilkan popup Snap untuk scan QRIS instan atau Virtual Account otomatis. Status pesanan langsung terupdate otomatis setelah transaksi sukses.
- Transfer Bank Manual: Dukungan rekening BCA, BNI, dan Mandiri dengan fitur salin nomor rekening dan upload struk transfer fisik.

### D. Sistem Pelunasan dan Kalkulasi Denda
- Perhitungan proporsional sisa tagihan pelunasan saat mobil selesai digunakan.
- Penghitungan denda keterlambatan otomatis dan biaya tambahan operasional.
- Dukungan pelunasan instan via QRIS Midtrans atau transfer manual.

### E. Live Chat Pelanggan
- Widget obrolan mengambang di seluruh halaman publik untuk komunikasi langsung pelanggan.
- Riwayat pesan tersimpan di tabel database Supabase PostgreSQL.

### F. Auto-Generated Invoicing
- Pembuatan nomor invoice resmi berformat standar (`INV-YYYYMM-XXXXXX`) secara otomatis saat diakses.
- Tampilan responsif dengan optimasi CSS cetak (`@media print`) untuk pengunduhan PDF dan pencetakan fisik.

### G. Optimasi Mesin Pencari (SEO)
- Sitemap Dinamis (`/sitemap.xml`) yang otomatis memuat seluruh halaman statis dan halaman detail armada dari database.
- Robots.txt (`/robots.txt`) untuk mengontrol perayapan mesin pencari terhadap rute publik dan memproteksi rute privat.

---

## 4. Struktur Proyek

```
website-rental/
├── app/
│   ├── (auth)/                  # Rute autentikasi (login, register)
│   ├── admin/                   # Halaman dashboard admin
│   ├── api/                     # Endpoint API backend
│   │   ├── admin/               # Endpoint internal admin (cars, bookings, drivers, banks, settings)
│   │   ├── auth/                # Endpoint autentikasi NextAuth & password reset
│   │   ├── booking/             # Endpoint transaksi dan pelunasan booking
│   │   ├── cars/                # Endpoint publik data mobil
│   │   ├── chat/                # Endpoint pesan live chat
│   │   ├── cron/                # Endpoint otomatisasi booking expiry
│   │   ├── invoice/             # Endpoint penarikan data invoice
│   │   ├── payment/             # Endpoint Midtrans transaksi & webhook
│   │   ├── testimonials/        # Endpoint data ulasan pelanggan
│   │   └── upload/              # Endpoint upload berkas fisik
│   ├── armada/                  # Halaman katalog dan detail mobil
│   ├── booking/                 # Formulir pemesanan multi-step
│   ├── faq/                     # Halaman tanya jawab
│   ├── invoice/                 # Halaman cetak invoice resmi
│   ├── kontak/                  # Halaman informasi kontak
│   ├── layanan/                 # Halaman daftar layanan sewa
│   ├── pelunasan/               # Halaman pelunasan tagihan booking
│   ├── profil/                  # Halaman profil dan pengaturan akun
│   ├── riwayat-booking/         # Halaman riwayat dan pelacakan pesanan
│   ├── testimoni/               # Halaman ulasan pelanggan
│   ├── robots.ts                # Generator robots.txt dinamis
│   ├── sitemap.ts               # Generator sitemap.xml dinamis
│   ├── layout.tsx               # Root layout aplikasi
│   └── page.tsx                 # Halaman utama (Landing Page)
├── components/
│   ├── admin/                   # Komponen dashboard admin
│   ├── chat/                    # Widget live chat mengambang
│   ├── landing/                 # Komponen antarmuka landing page
│   └── ui/                      # Komponen UI dasar (Button, Card, Input, dll.)
├── lib/
│   ├── auth.ts                  # Konfigurasi NextAuth
│   ├── booking-status.ts        # Helper pemetaan status booking
│   ├── payment-gateway.ts       # Integrasi server Midtrans
│   ├── prisma.ts                # Client database Prisma
│   ├── site-content.ts          # Salinan teks informasi layanan
│   ├── snap.ts                  # Helper pemanggil Midtrans Snap frontend
│   └── upload.ts                # Helper upload berkas lokal
├── prisma/
│   ├── schema.prisma            # Definisi skema database PostgreSQL
│   └── seed.ts                  # Script seeding data awal
├── public/
│   ├── uploads/                 # Direktori penyimpanan berkas terunggah
│   └── images/                  # Aset gambar statis
├── .env                         # Konfigurasi environment variables
├── package.json                 # Dependensi proyek
└── tsconfig.json                # Konfigurasi TypeScript
```

---

## 5. Prasyarat Sistem

Sebelum menjalankan proyek, pastikan perangkat Anda telah memenuhi prasyarat berikut:
- Node.js versi 18.17.0 atau versi yang lebih baru
- npm (Node Package Manager) versi 9.x ke atas atau yarn / pnpm
- Koneksi internet aktif untuk sinkronisasi database Supabase dan gateway Midtrans
- Git untuk manajemen versi kode sumber

---

## 6. Panduan Instalasi dan Menjalankan

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/ioAlan-angjai/website-rental-mobil.git
cd website-rental-mobil
```

### Langkah 2: Instalasi Dependensi
```bash
npm install
```

### Langkah 3: Konfigurasi File Environment
Salin atau buat file `.env` di direktori utama proyek sesuai panduan pada Bagian 7.

### Langkah 4: Sinkronisasi dan Seeding Database
Jalankan perintah berikut untuk meng-generate client Prisma, menyinkronkan skema ke Supabase PostgreSQL, dan mengisi data awal:
```bash
# Generate Prisma Client
npx prisma generate

# Sinkronkan skema ke Supabase PostgreSQL
npx prisma db push

# Jalankan Seeding Data Awal (Mobil, Driver, Testimoni, Akun Admin & Demo)
npm run prisma:seed
```

### Langkah 5: Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban dan akses alamat: `http://localhost:3000`

---

## 7. Konfigurasi Environment Variables

Buat atau sesuaikan file `.env` di root direktori dengan struktur variabel berikut:

```env
# Database Supabase PostgreSQL (IPv4 Pooler)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-key"

# Supabase API Keys (Opsional untuk integrasi SDK)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY="Mid-server-xxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxxxxxx"
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxxxxxx"
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"

# Rekening Bank Transfer Manual
BANK_BCA_NUMBER="1234567890"
BANK_BCA_NAME="PT RentalMobil Jogja"
BANK_BNI_NUMBER="0987654321"
BANK_BNI_NAME="PT RentalMobil Jogja"
BANK_MANDIRI_NUMBER="1122334455"
BANK_MANDIRI_NAME="PT RentalMobil Jogja"

# Keamanan Cron Job
CRON_SECRET="your-cron-secret-key"
```

---

## 8. Akun Demo untuk Pengujian

Setelah menjalankan script seeding (`npm run prisma:seed`), akun-akun berikut tersedia untuk pengujian:

### Akun Administrator
- Email: `admin@rentalmobil.com`
- Password: `adminpassword123`
- Peran: ADMIN
- Akses: `http://localhost:3000/admin`

### Akun Pelanggan (User)
- Email: `user@example.com`
- Password: `user123`
- Peran: USER
- Akses: `http://localhost:3000/riwayat-booking`

---

## 9. Alur Transaksi dan Pengujian

### 1. Alur Pemesanan dan Pembayaran DP (User)
1. Kunjungi halaman katalog `http://localhost:3000/armada` dan pilih salah satu armada yang tersedia.
2. Klik tombol "Booking Sekarang" untuk masuk ke form multi-step `http://localhost:3000/booking`.
3. Lengkapi formulir: pilih tipe layanan (Lepas Kunci / Dengan Supir), tentukan tanggal dan jam sewa, isi identitas pemesan, dan upload foto identitas (KTP & SIM).
4. Pada langkah pembayaran DP 50%:
   - Pilih "Instan (QRIS & VA)" untuk membuka popup Midtrans Snap dan menyelesaikan simulasi pembayaran.
   - Atau pilih "Transfer Manual" dan unggah foto struk bukti transfer.
5. Submit pesanan dan sistem akan mengarahkan ke halaman Riwayat Booking.

### 2. Alur Verifikasi dan Manajemen Operasional (Admin)
1. Login menggunakan akun Administrator di `http://localhost:3000/login`.
2. Masuk ke panel admin di `http://localhost:3000/admin`.
3. Pada tab "Booking", periksa daftar pesanan baru.
4. Klik tombol verifikasi untuk menyetujui bukti pembayaran manual atau mengubah status mobil menjadi berjalan (`IN_PROGRESS`).
5. Pada tab "Driver", pantau status penugasan supir armada.
6. Saat masa sewa berakhir, ubah status menjadi `WAITING_PAYMENT` jika terdapat denda atau sisa tagihan yang perlu dilunasi pelanggan.

### 3. Alur Pelunasan Tagihan dan Cetak Invoice (User)
1. Buka halaman `http://localhost:3000/riwayat-booking`.
2. Klik tombol "Bayar Pelunasan" pada pesanan yang memerlukan pelunasan.
3. Di halaman `http://localhost:3000/pelunasan/[id]`, selesaikan sisa pembayaran via Midtrans Snap atau transfer manual.
4. Setelah transaksi lunas, klik tautan "Unduh Invoice" untuk membuka halaman `http://localhost:3000/invoice?bookingId=[id]` dan cetak tanda terima PDF resmi.

---

## 10. Daftar Script Perintah

Perintah yang tersedia pada file `package.json`:

```bash
# Menjalankan server development
npm run dev

# Kompilasi aplikasi untuk production
npm run build

# Menjalankan server production setelah build
npm start

# Pengecekan tipe TypeScript seluruh proyek
npm run type-check

# Menjalankan linter ESLint
npm run lint

# Generate Prisma Client
npm run prisma:generate

# Mendorong perubahan skema ke database Supabase
npm run prisma:push

# Mengisi data awal (seeding) ke database
npm run prisma:seed

# Membuka GUI Prisma Studio di browser (port 5555)
npm run prisma:studio

# Menjalankan instalasi database lengkap (generate + push + seed)
npm run db:setup
```

---

## 11. Lisensi dan Kontak

Proyek ini dikembangkan untuk sistem operasional RentalMobil Jogja.

- Alamat Operasional: Jl. Malioboro, Daerah Istimewa Yogyakarta, Indonesia
- Email Informasi: info@rentalmobil-jogja.com
- Layanan Pelanggan: Tersedia 24 Jam via Live Chat Website
