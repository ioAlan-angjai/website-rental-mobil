'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  CalendarCheck,
  CreditCard,
  Ban,
  RotateCcw,
  User,
  AlertTriangle,
  FileText,
  ChevronDown,
} from 'lucide-react';

const faqData = [
  {
    id: 'booking',
    icon: CalendarCheck,
    label: 'Booking',
    items: [
      {
        q: 'Bagaimana cara melakukan booking mobil?',
        a: 'Pilih mobil yang diinginkan di halaman Armada, klik "Booking Sekarang", isi tanggal sewa dan durasi, lalu selesaikan pembayaran DP 50%. Setelah pembayaran diverifikasi, booking Anda akan dikonfirmasi.',
      },
      {
        q: 'Apakah bisa booking tanpa login?',
        a: 'Ya, Anda bisa booking tanpa login sebagai tamu. Namun kami sarankan untuk login agar dapat melacak riwayat booking dan mendapatkan notifikasi.',
      },
      {
        q: 'Berapa minimal durasi sewa?',
        a: 'Minimal durasi sewa adalah 24 jam (1 hari). Untuk durasi di bawah 24 jam, silakan hubungi customer service.',
      },
      {
        q: 'Bisakah saya mengubah jadwal booking?',
        a: 'Perubahan jadwal dapat dilakukan maksimal H-1 sebelum booking dimulai dengan menghubungi admin melalui halaman Kontak atau chat.',
      },
    ],
  },
  {
    id: 'pembayaran',
    icon: CreditCard,
    label: 'Pembayaran',
    items: [
      {
        q: 'Metode pembayaran apa saja yang tersedia?',
        a: 'Kami menerima pembayaran melalui QRIS, BCA Transfer, BNI Transfer, dan Mandiri Transfer. Pembayaran juga bisa dilakukan secara tunai di kantor.',
      },
      {
        q: 'Berapa DP yang harus dibayar?',
        a: 'DP (Down Payment) yang harus dibayar adalah 50% dari total harga sewa. Sisa pembayaran dilunasi saat pengambilan mobil.',
      },
      {
        q: 'Bagaimana cara upload bukti pembayaran?',
        a: 'Setelah melakukan transfer, upload bukti pembayaran melalui halaman detail booking. Admin akan memverifikasi pembayaran Anda dalam waktu 1x24 jam.',
      },
      {
        q: 'Apakah uang muka bisa dikembalikan?',
        a: 'DP yang sudah dibayarkan tidak dapat dikembalikan jika pembatalan dilakukan di luar ketentuan yang berlaku.',
      },
    ],
  },
  {
    id: 'pembatalan',
    icon: Ban,
    label: 'Pembatalan',
    items: [
      {
        q: 'Bagaimana cara membatalkan booking?',
        a: 'Pembatalan dapat dilakukan melalui halaman Riwayat Booking atau menghubungi admin. Pembatalan H-1 akan dikenakan biaya 50% dari DP.',
      },
      {
        q: 'Apakah ada biaya pembatalan?',
        a: 'Ya, pembatalan mendadak (kurang dari 24 jam sebelum sewa) akan dikenakan biaya 100% dari DP. Pembatalan H+1 dikenakan 50% dari DP.',
      },
      {
        q: 'Booking saya dibatalkan oleh sistem?',
        a: 'Booking akan otomatis dibatalkan jika pembayaran DP tidak dilakukan dalam waktu 24 jam setelah booking dibuat.',
      },
    ],
  },
  {
    id: 'pengembalian',
    icon: RotateCcw,
    label: 'Pengembalian',
    items: [
      {
        q: 'Bagaimana prosedur pengembalian mobil?',
        a: 'Kembalikan mobil ke lokasi yang telah disepakati tepat waktu. Admin akan melakukan pemeriksaan kondisi mobil. Jika semua baik, proses pengembalian selesai.',
      },
      {
        q: 'Apakah bisa mengembalikan mobil di lokasi berbeda?',
        a: 'Bisa, dengan tambahan biaya pengembalian di lokasi berbeda. Silakan informasikan saat booking atau hubungi admin.',
      },
      {
        q: 'Bagaimana jika terlambat mengembalikan mobil?',
        a: 'Keterlambatan akan dikenakan denda Rp50.000 per jam, maksimal denda setara 1 hari sewa. Pastikan Anda mengembalikan mobil tepat waktu.',
      },
    ],
  },
  {
    id: 'driver',
    icon: User,
    label: 'Driver',
    items: [
      {
        q: 'Apakah bisa menyewa dengan driver?',
        a: 'Ya, kami menyediakan layanan sewa dengan driver. Ada biaya tambahan untuk jasa driver per hari. Pilih opsi "Dengan Driver" saat booking.',
      },
      {
        q: 'Berapa biaya driver per hari?',
        a: 'Biaya driver adalah Rp150.000 per hari (untuk 12 jam kerja). Lembur dikenakan biaya tambahan Rp25.000 per jam.',
      },
    ],
  },
  {
    id: 'denda',
    icon: AlertTriangle,
    label: 'Denda',
    items: [
      {
        q: 'Apa saja yang dikenakan denda?',
        a: 'Denda dikenakan untuk: keterlambatan pengembalian (Rp50.000/jam), kerusakan mobil (biaya perbaikan), kehilangan STNK (Rp500.000), dan pelanggaran lalu lintas (biaya tilang).',
      },
      {
        q: 'Bagaimana jika terjadi kecelakaan?',
        a: 'Segera hubungi admin dan pihak berwajib. Kerusakan akibat kecelakaan akan ditanggung penyewa sesuai kesepakatan di kontrak.',
      },
    ],
  },
  {
    id: 'pelunasan',
    icon: FileText,
    label: 'Pelunasan',
    items: [
      {
        q: 'Kapan pelunasan dilakukan?',
        a: 'Pelunasan sisa pembayaran (50%) dilakukan saat pengambilan mobil. Pembayaran bisa dilakukan secara tunai atau transfer.',
      },
      {
        q: 'Apakah ada invoice setelah pelunasan?',
        a: 'Ya, setelah pelunasan lengkap, sistem akan otomatis membuat invoice yang bisa diunduh dalam format PDF.',
      },
    ],
  },
  {
    id: 'akun',
    icon: HelpCircle,
    label: 'Akun',
    items: [
      {
        q: 'Bagaimana cara mendaftar akun?',
        a: 'Klik tombol "Daftar" di halaman login, isi nama, email, dan password. Setelah registrasi, verifikasi email Anda melalui link yang dikirim.',
      },
      {
        q: 'Bagaimana jika lupa password?',
        a: 'Klik "Lupa Password" pada halaman login, masukkan email Anda, dan ikuti instruksi reset password yang dikirim ke email.',
      },
      {
        q: 'Apakah data saya aman?',
        a: 'Ya, data pribadi Anda dilindungi dan hanya digunakan untuk keperluan layanan. Dokumen KTP dan SIM hanya dapat dilihat oleh admin.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      <BackgroundOrnaments />

      {/* Header */}
      <section className="relative pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-xs font-bold text-zinc-700 mb-4">
              <HelpCircle size={14} />
              PUSAT BANTUAN
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Temukan jawaban untuk pertanyaan yang sering diajukan tentang layanan rental mobil kami.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqData.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white shadow-lg shadow-black/5 border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <category.icon size={16} className="text-zinc-600" />
                  </div>
                  <h2 className="font-bold text-zinc-900">{category.label}</h2>
                </div>
                <div className="p-1">
                  <Accordion className="w-full">
                    {category.items.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`${category.id}-${idx}`}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 transition-colors text-sm font-semibold text-zinc-800 data-[state=open]:text-zinc-900">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
