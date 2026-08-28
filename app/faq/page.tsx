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
  { id: 'booking', icon: CalendarCheck, label: 'Booking', items: [
    { q: 'Bagaimana cara melakukan booking mobil?', a: 'Pilih mobil di halaman Armada, klik "Booking Sekarang", isi detail tanggal, upload dokumen KTP/SIM, dan selesaikan pembayaran DP 50%.' },
    { q: 'Apakah bisa booking tanpa login?', a: 'Untuk keamanan verifikasi dokumen (KTP & SIM) serta pelacakan status pesanan secara transparan, pelanggan wajib login atau mendaftar akun terlebih dahulu.' },
    { q: 'Berapa minimal durasi sewa?', a: 'Minimal durasi sewa adalah 24 jam (1 hari).' },
    { q: 'Bisakah saya mengubah jadwal booking?', a: 'Pengubahan jadwal dapat diajukan maksimal H-1 sebelum waktu sewa dimulai dengan menghubungi admin.' },
  ]},
  { id: 'pembayaran', icon: CreditCard, label: 'Pembayaran', items: [
    { q: 'Metode pembayaran apa saja yang didukung?', a: 'Transfer Bank (BCA, BNI, Mandiri), QRIS, dan Payment Gateway otomatis.' },
    { q: 'Berapa DP yang harus dibayar?', a: 'DP reservasi adalah 50% dari total nilai sewa armada.' },
    { q: 'Bagaimana cara upload bukti transfer?', a: 'Upload slip transfer pada form booking atau riwayat booking. Admin akan memverifikasi dalam waktu singkat.' },
    { q: 'Apakah DP bisa dikembalikan?', a: 'DP tidak dapat diuangkan kembali kecuali terjadi kendala ketersediaan unit dari pihak kami.' },
  ]},
  { id: 'pembatalan', icon: Ban, label: 'Pembatalan', items: [
    { q: 'Bagaimana cara membatalkan pesanan?', a: 'Hubungi admin melalui kontak WhatsApp atau menu Riwayat Booking sebelum jadwal sewa dimulai.' },
    { q: 'Apakah ada potongan biaya pembatalan?', a: 'Pembatalan H-1 dikenakan penalti 50% DP, dan pembatalan kurang dari 24 jam mengakibatkan DP hangus.' },
  ]},
  { id: 'pengembalian', icon: RotateCcw, label: 'Pengembalian', items: [
    { q: 'Bagaimana prosedur pengembalian kendaraan?', a: 'Mobil dikembalikan sesuai jam dan lokasi yang disepakati. Petugas akan melakukan pemeriksaan fisik kendaraan.' },
    { q: 'Apakah bisa pengembalian di lokasi berbeda?', a: 'Bisa, dengan kesepakatan awal dan biaya operasional penjemputan tambahan.' },
    { q: 'Bagaimana jika terlambat mengembalikan?', a: 'Keterlambatan pengembalian dikenakan denda sebesar 10% dari tarif sewa harian per jam keterlambatan.' },
  ]},
  { id: 'driver', icon: User, label: 'Driver', items: [
    { q: 'Apakah melayani sewa include driver?', a: 'Ya, kami menyediakan driver ramah, profesional, dan hafal rute wisata Yogyakarta.' },
    { q: 'Berapa tarif driver per hari?', a: 'Tarif driver adalah Rp150.000 per hari (belum termasuk akomodasi jika luar kota).' },
  ]},
  { id: 'denda', icon: AlertTriangle, label: 'Denda', items: [
    { q: 'Apa saja faktor yang dikenakan denda?', a: 'Keterlambatan jam kembali, kerusakan fisik kendaraan, BBM tidak sesuai awal serah terima, atau kehilangan kelengkapan mobil.' },
    { q: 'Jika terjadi insiden/kecelakaan?', a: 'Segera hubungi hotline darurat 24 jam kami untuk penanganan asuransi dan prosedur lapangan.' },
  ]},
  { id: 'pelunasan', icon: FileText, label: 'Pelunasan', items: [
    { q: 'Kapan pelunasan sisa tagihan dilakukan?', a: 'Pelunasan sisa tagihan (termasuk denda jika ada) dilakukan setelah kendaraan dikembalikan melalui halaman Pelunasan sistem.' },
    { q: 'Apakah penyewa mendapatkan invoice resmi?', a: 'Ya, invoice digital berformat resmi otomatis terbit dan dapat diunduh/dicetak dari sistem.' },
  ]},
  { id: 'akun', icon: HelpCircle, label: 'Akun', items: [
    { q: 'Bagaimana mendaftar?', a: 'Klik "Daftar", isi form, verifikasi email.' },
    { q: 'Lupa password?', a: 'Klik "Lupa Password" di halaman login.' },
    { q: 'Data aman?', a: 'Ya, data dilindungi dan hanya untuk keperluan layanan.' },
  ]},
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#13112a]">
      <Navbar />
      <section className="relative pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1838] rounded-full text-[10px] font-bold text-[#f97316] mb-4 border border-[#2a2548]">
              <HelpCircle size={14} /> PUSAT BANTUAN
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm">Temukan jawaban untuk pertanyaan yang sering diajukan tentang layanan kami.</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqData.map((category) => (
              <motion.div key={category.id} className="bg-[#1b1838] border border-[#2a2548] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2548] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#13112a] flex items-center justify-center border border-[#2a2548]">
                    <category.icon size={16} className="text-[#f97316]" />
                  </div>
                  <h2 className="font-bold text-white text-sm">{category.label}</h2>
                </div>
                <div className="p-1">
                  <Accordion className="w-full">
                    {category.items.map((item, idx) => (
                      <AccordionItem key={idx} value={`${category.id}-${idx}`} className="border-b border-[#2a2548] last:border-0">
                        <AccordionTrigger className="px-5 py-4 hover:no-underline text-xs sm:text-sm font-semibold text-white/80 data-[state=open]:text-[#f97316]">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-xs sm:text-sm text-white/50 leading-relaxed">
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
