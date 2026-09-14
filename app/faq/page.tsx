'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import {
  HelpCircle, CalendarCheck, CreditCard, Ban, RotateCcw, User, AlertTriangle, FileText,
} from 'lucide-react';

const faqData = [
  { id: 'booking', icon: CalendarCheck, label: 'Booking & Reservasi', items: [
    { q: 'Bagaimana cara melakukan booking mobil?', a: 'Pilih armada di halaman Armada, klik "Sewa", pilih tanggal dan kebutuhan sopir, isi detail data diri, dan selesaikan verifikasi dokumen serta pembayaran DP.' },
    { q: 'Apakah bisa booking tanpa login?', a: 'Untuk keamanan verifikasi dokumen (KTP & SIM) serta pelacakan status pesanan secara transparan, pelanggan wajib login atau mendaftar akun terlebih dahulu.' },
    { q: 'Berapa minimal durasi sewa?', a: 'Minimal durasi sewa harian adalah 24 jam (1 hari).' },
    { q: 'Bisakah saya mengubah jadwal booking?', a: 'Pengubahan jadwal dapat diajukan maksimal H-1 sebelum waktu sewa dimulai dengan menghubungi admin WhatsApp kami.' },
  ]},
  { id: 'pembayaran', icon: CreditCard, label: 'Pembayaran & DP', items: [
    { q: 'Metode pembayaran apa saja yang didukung?', a: 'Transfer Bank (BCA, Mandiri, BNI), QRIS instan, dan Payment Gateway otomatis.' },
    { q: 'Berapa DP yang harus dibayar?', a: 'DP reservasi adalah 50% dari total nilai sewa armada untuk mengunci ketersediaan unit.' },
    { q: 'Bagaimana cara konfirmasi pembayaran?', a: 'Sistem kami terhubung otomatis dengan payment gateway, atau Anda dapat mengunggah bukti transfer pada menu Riwayat Booking.' },
    { q: 'Apakah DP bisa dikembalikan jika batal?', a: 'DP tidak dapat diuangkan kembali kecuali terjadi kendala ketersediaan unit dari pihak manajemen kami.' },
  ]},
  { id: 'pembatalan', icon: Ban, label: 'Kebijakan Pembatalan', items: [
    { q: 'Bagaimana cara membatalkan pesanan?', a: 'Hubungi admin melalui kontak layanan atau menu Riwayat Booking sebelum jadwal sewa dimulai.' },
    { q: 'Apakah ada potongan biaya pembatalan?', a: 'Pembatalan H-1 dikenakan penalti 50% DP, dan pembatalan kurang dari 24 jam mengakibatkan DP hangus.' },
  ]},
  { id: 'pengembalian', icon: RotateCcw, label: 'Serah Terima & Pengembalian', items: [
    { q: 'Bagaimana prosedur pengembalian kendaraan?', a: 'Mobil dikembalikan sesuai jam dan lokasi yang disepakati. Petugas akan melakukan pemeriksaan fisik kendaraan bersama penyewa.' },
    { q: 'Apakah bisa pengembalian di lokasi berbeda?', a: 'Bisa, dengan kesepakatan awal dan biaya operasional penjemputan tambahan yang wajar.' },
    { q: 'Bagaimana jika terlambat mengembalikan?', a: 'Keterlambatan pengembalian dikenakan denda proporsional sebesar 10% dari tarif sewa harian per jam keterlambatan.' },
  ]},
  { id: 'driver', icon: User, label: 'Layanan Pengemudi (Driver)', items: [
    { q: 'Apakah melayani sewa include driver?', a: 'Ya, kami menyediakan driver ramah, profesional, bersertifikat, dan menguasai rute wisata Yogyakarta & sekitarnya.' },
    { q: 'Berapa tarif driver per hari?', a: 'Tarif driver adalah Rp150.000 per hari (dalam kota). Untuk rute luar kota disesuaikan dengan akomodasi.' },
  ]},
  { id: 'denda', icon: AlertTriangle, label: 'Ketentuan & Denda', items: [
    { q: 'Apa saja faktor yang dikenakan denda?', a: 'Keterlambatan jam kembali, kerusakan fisik kendaraan, BBM tidak sesuai serah terima awal, atau kehilangan kelengkapan unit.' },
    { q: 'Jika terjadi kendala darurat di jalan?', a: 'Segera hubungi hotline darurat 24 jam kami untuk penanganan cepat dan pengiriman unit pengganti jika dibutuhkan.' },
  ]},
  { id: 'pelunasan', icon: FileText, label: 'Pelunasan & Invoice', items: [
    { q: 'Kapan pelunasan sisa tagihan dilakukan?', a: 'Pelunasan sisa tagihan dilakukan saat atau setelah kendaraan dikembalikan melalui halaman Pelunasan di website.' },
    { q: 'Apakah penyewa mendapatkan invoice resmi?', a: 'Ya, invoice digital resmi otomatis terbit dan dapat diunduh atau dicetak kapan saja dari akun Anda.' },
  ]},
  { id: 'akun', icon: HelpCircle, label: 'Akun & Keamanan Data', items: [
    { q: 'Bagaimana cara mendaftar akun?', a: 'Klik tombol "Daftar" di sudut kanan atas, isi nama, email, dan password Anda.' },
    { q: 'Apakah data pribadi saya aman?', a: 'Data identitas dan reservasi Anda dienkripsi serta hanya digunakan khusus untuk verifikasi operasional rental.' },
  ]},
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F8F2F1] text-[#1A1A1A]">
      <Navbar />

      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight mb-2 sm:mb-4">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-[#504745] max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
            Temukan panduan lengkap dan jawaban seputar pemesanan, pembayaran, serta syarat sewa kendaraan di RentalMobil Jogja.
          </p>
        </motion.div>
      </section>

      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-3.5 sm:space-y-6">
          {faqData.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs"
            >
              <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-[#F8F7F6] border-b border-[#F0E6E4] flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#FFFFFF] flex items-center justify-center border border-[#D7CDCC] text-[#1A1A1A] shadow-xs">
                  <category.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <h2 className="font-bold text-[#1A1A1A] text-xs sm:text-base">{category.label}</h2>
              </div>
              <div className="p-1 sm:p-3">
                <Accordion className="w-full">
                  {category.items.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`${category.id}-${idx}`}
                      className="border-b border-[#F0E6E4] last:border-0"
                    >
                      <AccordionTrigger className="px-3 sm:px-4 py-2.5 sm:py-3.5 hover:no-underline text-xs sm:text-sm font-bold text-[#1A1A1A] hover:text-[#504745] text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 text-[11px] sm:text-sm text-[#504745] leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

