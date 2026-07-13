# Product Requirements Document (PRD)
## Website Rental Mobil Premium dengan Penghitungan Denda Otomatis & Live Chat

---

## 1. Ringkasan Proyek (Project Overview)
Proyek ini bertujuan untuk membangun platform web rental mobil modern dan premium yang responsif, berfokus pada target pasar mahasiswa di Yogyakarta. Platform ini menawarkan harga khusus mahasiswa, layanan operasional 24/7, dan proses verifikasi dokumen yang cepat. Sistem ini juga dilengkapi dengan penghitungan denda keterlambatan otomatis secara progresif dan sistem komunikasi real-time terpadu.

## 2. Arsitektur Teknologi & Batasan Desain
*   **Framework Utama:** Next.js (App Router) dengan TypeScript.
*   **Styling:** Tailwind CSS dengan fondasi komponen visual dari **shadcn/ui**.
*   **Pustaka Komponen UI/UX:** Mengintegrasikan pola interaksi dari **21st.dev** (seperti Dropzone File Uploader, Bento Grid, DataTable, visual chart).
*   **Animasi (Motion UI):** Menggunakan **Framer Motion** untuk menghadirkan micro-interactions, scroll-linked animations (fade-in, slide-up, staggered delay), dan transisi halus antar-halaman (Shared Layout).

---

## 3. Fitur Utama & Kebutuhan Fungsional

### A. Autentikasi & Manajemen Pengguna (User Management)
*   Fitur Registrasi dan Login akun.
*   Halaman profil pengguna untuk mengelola data diri dan riwayat pemesanan.

### B. Antarmuka Pelanggan (Frontend & Customer Facing)
1.  **Landing Page & Katalog Mobil:**
    *   Tampilan hero modern menggunakan teks animasi premium (Magic UI style).
    *   Fitur pencarian armada dengan Pop-over Date-Range Picker.
    *   Katalog mobil berbasis Grid Layout yang menampilkan armada unggulan (Toyota Avanza, Honda HR-V, Mitsubishi Xpander, Daihatsu Ayla, dll).
2.  **Detail Mobil & Alur Checkout:**
    *   Galeri foto mobil dengan interaksi gulir dinamis (Sticky Parallax Canvas).
    *   Formulir Checkout interaktif yang menyertakan area unggah berkas (*Dropzone File Uploader*) untuk KTP, SIM, atau KTM.
    *   Micro-interaction berupa efek *pop-up snap* yang halus saat berkas berhasil diunggah.

### C. Live Chat Terpadu (Real-time Communication)
*   **Sisi Pengguna:** Widget obrolan melayang (*floating chat widget*) di pojok kanan bawah halaman.
*   **Sisi Admin:** Halaman penuh berbentuk *split-screen workspace layout* untuk mengelola obrolan masuk secara real-time.

### D. Sistem Manajemen & Dasbor Operasional (Back-Office)
1.  **Dasbor Admin:**
    *   Tabel pesanan (*DataTable*) yang dilengkapi fitur pencarian dan filter status.
    *   *Dynamic Badge Indicator:* Status pesanan dengan indikasi visual yang jelas (Hijau untuk Selesai, Kuning untuk Menunggu Verifikasi, dan Merah berkedip/pulsing untuk status *Overdue*/Keterlambatan).
    *   Halaman verifikasi dokumen dengan layout *split-view* atau *Image Lightbox* untuk memeriksa keaslian KTP/SIM/KTM.
2.  **Dasbor Owner (Analitik Finansial):**
    *   Grafik analitik visual (*Area Chart* atau *Bar Chart* berbasis Recharts) untuk membandingkan pendapatan dari sewa murni terhadap pendapatan yang dihasilkan dari akumulasi denda.

### E. Sistem Logika Denda Otomatis (Core Business Logic)
*   Sistem secara terjadwal melakukan pengecekan berkala terhadap transaksi sewa yang aktif.
*   **Aturan Denda:** Jika batas waktu sewa (`rental_end_time`) terlewati lebih dari 30 menit (*grace period*) dan status kendaraan belum dikembalikan, status otomatis berubah menjadi **Overdue**.
*   **Penghitungan Progresif:** Denda diakumulasikan sebesar Rp50.000 per jam. Jika keterlambatan melebihi 6 jam, akumulasi denda secara otomatis dikonversikan menjadi setara tarif sewa penuh 1 hari dari mobil yang bersangkutan.

---

## 4. Keamanan & Kepatuhan Data (Security & Privacy)
*   Seluruh dokumen identitas sensitif (KTP/SIM/KTM) yang diunggah oleh pelanggan harus disimpan secara privat di storage terlindung.
*   Akses visual dokumen untuk Admin wajib menggunakan URL bertenggat (*Presigned URL*) yang kedaluwarsa dalam waktu 5 menit untuk mencegah kebocoran data.

---

## 5. Rencana Tahapan Pengembangan (Development Phases)
*   **Fase 1 (Sekarang):** Fokus 100% pada struktur folder, UI/UX, tata letak antarmuka, Motion UI, dan interaksi visual halaman menggunakan *mock data*.
*   **Fase 2 (Mendatang):** Integrasi basis data, skema tabel, implementasi logika backend denda otomatis, dan koneksi WebSocket untuk live chat.
