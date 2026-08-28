'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { FAQ } from '@/components/landing/FAQ';
import { FleetPreview } from '@/components/landing/FleetPreview';
import { motion } from 'framer-motion';
import {
  ArrowRight, Star, ChevronRight, HelpCircle, CalendarDays, Search,
} from 'lucide-react';
import {
  Reports as IconPrice,
  Car as IconCar,
  UserStar as IconDriver,
  CalendarCheck as IconBooking,
  Headset as IconSupport,
  ShieldCheck as IconShield,
} from 'iconoir-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const steps = [
  { num: '01', title: 'Pilih Armada', desc: 'Pilih kendaraan sesuai kebutuhan perjalanan Anda.' },
  { num: '02', title: 'Isi Form Rental', desc: 'Tentukan tanggal, durasi, dan lokasi penjemputan.' },
  { num: '03', title: 'Konfirmasi Pembayaran', desc: 'Lakukan pembayaran DP atau pelunasan.' },
  { num: '04', title: 'Mobil Siap Digunakan', desc: 'Armada siap digunakan sesuai jadwal.' },
];

const reasons = [
  { icon: IconPrice, title: 'Harga Transparan', desc: 'Tidak ada biaya tersembunyi.' },
  { icon: IconCar, title: 'Armada Terawat', desc: 'Diservis berkala dan selalu siap jalan.' },
  { icon: IconDriver, title: 'Driver Berpengalaman', desc: 'Profesional, ramah, dan hafal rute Jogja.' },
  { icon: IconBooking, title: 'Booking Mudah', desc: 'Pesan hanya dalam beberapa menit.' },
  { icon: IconSupport, title: 'Customer Support 24/7', desc: 'Respon cepat kapan saja.' },
  { icon: IconShield, title: 'Asuransi Perjalanan', desc: 'Perjalanan lebih aman dan nyaman.' },
];

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const buildBookingUrl = () => {
    const p = new URLSearchParams();
    if (startDate) p.set('startDate', startDate);
    if (endDate) p.set('endDate', endDate);
    return `/booking${p.toString() ? `?${p.toString()}` : ''}`;
  };

  return (
    <main className="relative min-h-screen bg-[#13112a] overflow-x-hidden font-sans">
      <Navbar />

      {/* ════════════ HERO ════════════ */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1920&q=80')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#13112a]/95 via-[#13112a]/80 to-[#13112a]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13112a]/90 via-transparent to-[#13112a]/40" />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-0">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center min-h-[75vh]">

            {/* ── LEFT ── */}
            <motion.div
              variants={stagger} initial="hidden" animate="visible"
              className="md:col-span-7 text-center md:text-left"
            >
              <motion.h1
                variants={fadeUp}
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight max-w-[700px]"
              >
                Sewa Mobil Jogja.<br />
                Perjalanan Nyaman,<br />
                <span className="text-[#f97316]">Unit Terawat.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-sm sm:text-base text-white/50 leading-relaxed max-w-[540px] mx-auto md:mx-0 mt-4 mb-6"
              >
                Temukan armada terbaik untuk perjalanan Anda di Yogyakarta dengan layanan lepas kunci atau include driver.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                <Link href={buildBookingUrl()}>
                  <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm px-7 py-4 rounded-full shadow-xl shadow-[#f97316]/20 hover:scale-105 active:scale-95 transition-all duration-300">
                    Booking Sekarang <ArrowRight size={16} className="ml-1.5" />
                  </Button>
                </Link>
                <Link href="/armada">
                  <Button variant="outline" className="text-white/90 border-[#2a2548] bg-[#1b1838] hover:bg-[#2a2548] hover:border-[#f97316]/50 hover:text-white font-medium text-sm px-7 py-4 rounded-full transition-all duration-300 shadow-md">
                    Lihat Armada
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Search Card ── */}
            <motion.div
              variants={stagger} initial="hidden" animate="visible"
              className="md:col-span-5 mt-6 md:mt-0"
            >
              <motion.div
                variants={fadeUp}
                className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-5 md:p-6 shadow-2xl"
              >
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CalendarDays size={15} className="text-[#f97316]" />
                  Cari Armada Tersedia
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5">Jenis Mobil</label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#13112a] border border-[#2a2548] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316]/50 transition-all cursor-pointer"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="hatchback">Hatchback / City Car</option>
                      <option value="suv">SUV</option>
                      <option value="mpv">MPV / Minivan</option>
                      <option value="sedan">Sedan</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-white/50 mb-1.5">Mulai Sewa</label>
                      <input
                        type="date" min={todayStr} value={startDate}
                        onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(''); }}
                        className="w-full px-3.5 py-2.5 bg-[#13112a] border border-[#2a2548] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316]/50 transition-all [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/50 mb-1.5">Selesai Sewa</label>
                      <input
                        type="date" min={startDate || todayStr} value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#13112a] border border-[#2a2548] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316]/50 transition-all [color-scheme:dark]" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const p = new URLSearchParams();
                      if (selectedCategory && selectedCategory !== 'all') p.set('category', selectedCategory);
                      if (startDate) p.set('startDate', startDate);
                      if (endDate) p.set('endDate', endDate);
                      router.push(`/armada${p.toString() ? `?${p.toString()}` : ''}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#f97316]/20"
                  >
                    <Search size={16} /> Cari Armada
                  </button>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#13112a] to-transparent z-10" />
      </section>

      {/* ════════════ ARMADA REKOMENDASI ════════════ */}
      <FleetPreview />

      {/* ════════════ KENAPA PILIH KAMI ════════════ */}
      <section className="relative py-24 sm:py-28 px-4 bg-[#13112a]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[#f97316]/[0.02] rounded-full blur-[150px]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <p className="text-xs font-bold tracking-[0.15em] text-[#f97316] mb-3">KENAPA PILIH KAMI</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Alasan ribuan pelanggan{' '}
              <span className="text-[#f97316]">mempercayai kami</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Alasan ribuan pelanggan mempercayakan perjalanan mereka kepada Rental Mobil Jogja.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.06 * i }}
                className="group bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6 sm:p-7 hover:border-[#f97316]/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#2a2548] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#f97316]/10 group-hover:scale-110 transition-all duration-300">
                  <r.icon strokeWidth={1.5} className="w-6 h-6 text-[#f97316]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">{r.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CARA BOOKING ════════════ */}
      <section className="relative py-24 sm:py-28 px-4 bg-[#13112a] border-t border-[#2a2548]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <p className="text-xs font-bold tracking-[0.15em] text-[#f97316] mb-3">CARA BOOKING</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Proses rental cepat dan mudah{' '}
              <span className="text-[#f97316]">hanya 4 langkah</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Proses rental cepat dan mudah hanya dalam beberapa langkah.
            </p>
          </motion.div>

          {/* Desktop Timeline */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 relative">
            <div className="absolute top-16 left-[12.5%] right-[12.5%] h-[2px] bg-[#2a2548] z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="relative z-10 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1b1838] border border-[#2a2548] flex items-center justify-center mx-auto mb-5 group-hover:border-[#f97316]/60 group-hover:shadow-lg group-hover:shadow-[#f97316]/10 transition-all duration-300">
                  <span className="text-lg font-extrabold text-[#f97316]">{step.num}</span>
                </div>
                <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6 group-hover:border-[#f97316]/30 transition-all duration-300">
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tablet / Mobile Timeline */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="flex gap-5 items-start group"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1b1838] border border-[#2a2548] flex items-center justify-center group-hover:border-[#f97316]/60 transition-all duration-300">
                  <span className="text-base font-extrabold text-[#f97316]">{step.num}</span>
                </div>
                <div className="bg-[#1b1838] border border-[#2a2548] rounded-xl p-4 flex-1 group-hover:border-[#f97316]/30 transition-all duration-300">
                  <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="relative py-20 sm:py-24 px-4 border-t border-[#2a2548]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 lg:mb-16"
          >
            <p className="text-xs font-bold tracking-[0.15em] text-[#f97316] mb-3">TESTIMONI</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Kata Mereka yang Sudah <span className="text-[#f97316]">Percaya</span>
            </h2>
            <p className="text-white/50 text-sm sm:text-base">Ribuan mahasiswa Jogja telah mempercayai kami untuk kebutuhan rental mobil mereka</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
            {[
              { name: 'Andi Raharjo', role: 'Mahasiswa UGM', text: 'Pelayanan sangat memuaskan! Mobilnya bersih dan terawat. Proses booking juga cepat, cocok banget buat mahasiswa yang butuh mobilitas tinggi.', initial: 'AR' },
              { name: 'Siti Pratiwi', role: 'Mahasiswa UNY', text: 'Harga terjangkau dan ada diskon mahasiswa! Puas banget sama pelayanannya. Ownernya baik dan responsif. Recommended!', initial: 'SP' },
              { name: 'Budi Wijaya', role: 'Mahasiswa UII', text: 'Pertama kali rental mobil dan pengalamannya sangat smooth. Mobilnya nyaman untuk trip ke Dieng. Worth it banget!', initial: 'BW' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 * i + 0.15 }}
                className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-5 sm:p-6 hover:border-[#2a2548]/80 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, si) => <Star key={si} className="w-3.5 h-3.5 fill-[#f97316] text-[#f97316]" />)}
                </div>
                <p className="text-white/70 mb-5 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#f97316] rounded-xl flex items-center justify-center text-white font-bold text-sm">{t.initial}</div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-white/50">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8 sm:mt-10"
          >
            <Link href="/testimoni" className="inline-flex items-center gap-2 text-white/50 hover:text-white font-medium transition-colors text-sm">
              Lihat Semua Testimoni <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section className="relative py-20 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#1b1838] border border-[#2a2548] rounded-2xl">
                <HelpCircle size={22} className="text-[#f97316]" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Pertanyaan Umum</h2>
            <p className="text-white/50 text-sm sm:text-base">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
          </motion.div>
          <FAQ />
        </div>
      </section>

      {/* ════════════ CTA BANNER ════════════ */}
      <section className="relative py-16 sm:py-20 px-4 bg-[#1b1838] border-t border-[#2a2548]/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Siap Memulai Perjalanan Anda?</h2>
            <p className="text-white/50 text-sm sm:text-base mb-8 max-w-xl mx-auto">
              Booking mobil impian Anda sekarang dan nikmati pengalaman rental yang berbeda
            </p>
            <Link href={buildBookingUrl()}>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base px-9 py-5 rounded-full shadow-xl shadow-[#f97316]/20 hover:scale-105 active:scale-95 transition-all duration-300">
                Mulai Booking <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="relative py-10 sm:py-12 px-4 border-t border-[#2a2548]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[#f97316] rounded-xl"><IconCar strokeWidth={1.5} className="w-5 h-5 text-white" /></div>
                <span className="text-lg font-bold text-white">RentalMobil</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">Solusi rental mobil terpercaya untuk mahasiswa Yogyakarta</p>
            </div>
            {[
              { title: 'Layanan', links: [{ label: 'Armada', href: '/armada' }, { label: 'Layanan', href: '/layanan' }, { label: 'Booking', href: '/booking' }] },
              { title: 'Perusahaan', links: [{ label: 'Tentang Kami', href: '/tentang-kami' }, { label: 'Testimoni', href: '/testimoni' }, { label: 'Kontak', href: '/kontak' }] },
              { title: 'Kontak', links: [{ label: 'WhatsApp: +62 812-3456-7890', href: '#' }, { label: 'Email: info@rentalmobil.com', href: '#' }, { label: 'Yogyakarta, Indonesia', href: '#' }] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2 text-sm text-white/50">
                  {col.links.map(link => (
                    <li key={link.label}><Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-[#2a2548]/50 text-center text-sm text-white/40">
            &copy; {new Date().getFullYear()} RentalMobil Premium. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>
    </main>
  );
}
