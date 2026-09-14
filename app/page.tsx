'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FAQ } from '@/components/landing/FAQ';
import { FleetPreview } from '@/components/landing/FleetPreview';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Star,
  Calendar,
  Search,
  MapPin,
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Users,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const featureCards = [
  {
    icon: Car,
    title: 'Pilihan Lengkap',
    desc: 'Puluhan unit armada keluaran terbaru mulai dari city car hemat bahan bakar hingga SUV & MPV mewah.',
  },
  {
    icon: Award,
    title: 'Harga Transparan',
    desc: 'Tarif sewa jujur tanpa biaya tersembunyi, sudah termasuk proteksi asuransi dan servis berkala.',
  },
  {
    icon: Clock,
    title: 'Layanan 24/7',
    desc: 'Dukungan pelanggan responsif dan bantuan darurat jalan raya siap melayani perjalanan Anda kapan saja.',
  },
  {
    icon: ShieldCheck,
    title: 'Kondisi Prima',
    desc: 'Setiap unit mobil melewati inspeksi 30 titik mekanik resmi, selalu bersih, harum, dan siap tempuh.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Pilih Mobil',
    desc: 'Tentukan unit yang tepat sesuai kapasitas penumpang dan preferensi rute perjalanan Anda.',
  },
  {
    num: '02',
    title: 'Tentukan Jadwal',
    desc: 'Pilih tanggal mulai, durasi sewa, serta lokasi antar jemput fleksibel di Yogyakarta.',
  },
  {
    num: '03',
    title: 'Lakukan Pembayaran',
    desc: 'Konfirmasi reservasi Anda dengan pembayaran uang muka (DP) aman secara instan via QRIS / Transfer.',
  },
  {
    num: '04',
    title: 'Mobil Siap Digunakan',
    desc: 'Armada kami antarkan tepat waktu ke lokasi Anda atau siap diambil di garasi kami.',
  },
];

const testimonials = [
  {
    name: 'Dimas Wicaksono',
    role: 'Pebisnis • Jakarta',
    rating: 5,
    text: 'Sangat terkesan dengan ketepatan waktu dan kebersihan unit Innova Zenix-nya. Driver sangat profesional, paham jalan tikus saat Jogja macet liburan.',
  },
  {
    name: 'Clarissa Maharani',
    role: 'Wisatawan • Surabaya',
    rating: 5,
    text: 'Sewa lepas kunci Fortuner untuk trip keluarga ke Gunungkidul sangat memuaskan. Mobil prima, ban tebal, AC dingin dan proses serah terima cepat.',
  },
  {
    name: 'Reza Pramudya',
    role: 'Event Organizer • Bandung',
    rating: 5,
    text: 'Rental mobil paling solutif untuk event dinas di Jogja. Harga transparan tanpa charge aneh-aneh. Pelayanan customer service sangat responsif!',
  },
  {
    name: 'dr. Sarah Nabila',
    role: 'Dokter • Semarang',
    rating: 5,
    text: 'Pelayanan jemput di Bandara YIA sangat on-time. Mobil Brio bersih, wangi, dan prosesnya cepat tidak sampai 5 menit. Sangat direkomendasikan!',
  },
];

export default function Home() {
  const router = useRouter();

  // Search & Filter State
  const [driverMode, setDriverMode] = useState<'with_driver' | 'self_drive'>('with_driver');
  const [areaScope, setAreaScope] = useState<'dalam_kota' | 'luar_kota'>('dalam_kota');
  const [pickupLocation, setPickupLocation] = useState('Kota Yogyakarta / Bandara YIA');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (driverMode === 'with_driver') params.set('driver', 'true');
    router.push(`/armada${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const buildBookingUrl = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return `/booking${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <main className="relative min-h-screen bg-[#F8F2F1] text-[#1A1A1A] font-sans selection:bg-[#D7CDCC] selection:text-[#1A1A1A]">
      <Navbar />

      {/* ════════════ 1. HERO SECTION ════════════ */}
      <section className="relative w-full pt-28 pb-12 sm:pt-32 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#1A1A1A] border-b border-[#2C2828]">
        {/* Full-width Tugu Jogja Background Image with Cinematic Dark Overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/tugu-jogja-hero.jpg"
            alt="Tugu Yogyakarta Night Scene"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/75 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/35" />
        </div>

        {/* Content Sitting In Front */}
        <div className="relative z-10 max-w-[1200px] mx-auto">
          {/* Header Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-3xl flex flex-col items-start justify-center space-y-4 mb-8 sm:mb-10"
          >
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.12]"
            >
              Eksplorasi Keindahan Jogja, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
                Nyaman, Aman &amp; Terpercaya.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xs sm:text-[14px] text-neutral-200 leading-relaxed max-w-2xl font-normal"
            >
              Layanan sewa mobil lepas kunci &amp; dengan sopir profesional di Yogyakarta. Siap melayani antar jemput Stasiun Tugu, Lempuyangan, Malioboro, hingga Bandara YIA dengan harga transparan tanpa biaya tersembunyi.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-xs">
                <ShieldCheck size={13} className="text-amber-300" />
                Asuransi Terproteksi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-xs">
                <Car size={13} className="text-amber-300" />
                Lepas Kunci &amp; Driver
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-xs">
                <MapPin size={13} className="text-amber-300" />
                Antar Jemput Stasiun &amp; YIA
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-xs">
                <Clock size={13} className="text-amber-300" />
                Layanan 24/7
              </span>
            </motion.div>
          </motion.div>

        {/* Search & Filter Box (Compact Panel Sits Comfortably in 1st Viewport) */}
        {/* Search & Filter Box (Compact 2-Row Mobile & 1-Row Desktop Layout) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm mb-6 sm:mb-10"
        >
          {/* Top Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 sm:pb-3.5 sm:mb-3.5 border-b border-[#F0E6E4]">
            {/* Service Mode Tabs */}
            <div className="flex items-center gap-1 bg-[#F8F7F6] p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-[#D7CDCC]">
              <button
                type="button"
                onClick={() => setDriverMode('self_drive')}
                className={cn(
                  'px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border-0 outline-none',
                  driverMode === 'self_drive'
                    ? 'bg-[#1A1A1A] text-[#F8F7F6] shadow-xs'
                    : 'bg-transparent text-[#504745] hover:text-[#1A1A1A]'
                )}
              >
                Lepas Kunci
              </button>
              <button
                type="button"
                onClick={() => setDriverMode('with_driver')}
                className={cn(
                  'px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border-0 outline-none',
                  driverMode === 'with_driver'
                    ? 'bg-[#1A1A1A] text-[#F8F7F6] shadow-xs'
                    : 'bg-transparent text-[#504745] hover:text-[#1A1A1A]'
                )}
              >
                Dengan Sopir
              </button>
            </div>

            {/* Scope / Extra Checkboxes */}
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-medium text-[#504745]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={areaScope === 'dalam_kota'}
                  onChange={() => setAreaScope('dalam_kota')}
                  className="accent-[#1A1A1A] cursor-pointer w-3.5 h-3.5"
                />
                <span>Dalam Kota Jogja</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={areaScope === 'luar_kota'}
                  onChange={() => setAreaScope('luar_kota')}
                  className="accent-[#1A1A1A] cursor-pointer w-3.5 h-3.5"
                />
                <span>Luar Kota</span>
              </label>
            </div>
          </div>

          {/* Search Inputs Grid (2 rows on mobile, 1 row on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-3 items-end">
            {/* Input 1: Lokasi */}
            <div className="col-span-1 lg:col-span-3">
              <label className="block text-[9px] sm:text-[10px] font-bold text-[#756A68] uppercase tracking-wider mb-1 truncate">
                Lokasi Penjemputan
              </label>
              <div className="relative">
                <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#756A68]" />
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Bandara / Stasiun..."
                  className="w-full h-8 sm:h-9 pl-7 pr-2 rounded-lg border border-[#D7CDCC] bg-[#F8F7F6] text-[11px] sm:text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            {/* Input 2: Kategori Mobil */}
            <div className="col-span-1 lg:col-span-3">
              <label className="block text-[9px] sm:text-[10px] font-bold text-[#756A68] uppercase tracking-wider mb-1 truncate">
                Kategori Mobil
              </label>
              <div className="relative">
                <Car size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#756A68]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-8 sm:h-9 pl-7 pr-2 rounded-lg border border-[#D7CDCC] bg-[#F8F7F6] text-[11px] sm:text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="mpv">MPV</option>
                  <option value="suv">SUV</option>
                  <option value="city_car">City Car</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="luxury">Luxury</option>
                  <option value="pickup">Pickup</option>
                  <option value="minibus">Minibus</option>
                </select>
              </div>
            </div>

            {/* Input 3: Tanggal Mulai */}
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-[9px] sm:text-[10px] font-bold text-[#756A68] uppercase tracking-wider mb-1 truncate">
                Mulai Sewa
              </label>
              <div className="relative">
                <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#756A68]" />
                <input
                  type="date"
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) setEndDate('');
                  }}
                  className="w-full h-8 sm:h-9 pl-7 pr-1.5 rounded-lg border border-[#D7CDCC] bg-[#F8F7F6] text-[11px] sm:text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            {/* Input 4: Tanggal Selesai */}
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-[9px] sm:text-[10px] font-bold text-[#756A68] uppercase tracking-wider mb-1 truncate">
                Selesai Sewa
              </label>
              <div className="relative">
                <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#756A68]" />
                <input
                  type="date"
                  min={startDate || todayStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-8 sm:h-9 pl-7 pr-1.5 rounded-lg border border-[#D7CDCC] bg-[#F8F7F6] text-[11px] sm:text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
            </div>

            {/* Button: Cari Mobil */}
            <div className="col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full h-8 sm:h-9 px-3 rounded-lg bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs cursor-pointer border-0"
              >
                <Search size={13} />
                <span>Cari Mobil</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

      {/* ════════════ 2. 4 VALUE CARDS ROW ════════════ */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {featureCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-xl p-4 sm:p-4.5 shadow-xs hover:border-[#1A1A1A]/30 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center text-[#1A1A1A] mb-3 group-hover:scale-105 transition-transform">
                <card.icon size={16} />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1A1A1A] mb-1">{card.title}</h3>
              <p className="text-[11px] text-[#504745] leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════ 3. MOBIL PILIHAN / FLEET PREVIEW ════════════ */}
      <FleetPreview />

      {/* ════════════ 4. CARA SEWA MUDAH & CEPAT ════════════ */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Cara Sewa Mobil Sederhana &amp; Cepat
          </h2>
          <p className="text-xs sm:text-[13px] text-[#504745] mt-1">
            Hanya 4 langkah praktis untuk mengamankan kendaraan idaman Anda tanpa proses berbelit-belit.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative bg-[#FFFFFF] border border-[#D7CDCC] rounded-xl p-3 sm:p-4.5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-xl sm:text-3xl font-black text-[#D7CDCC] select-none block mb-1.5 sm:mb-2.5">
                  {step.num}
                </span>
                <h3 className="text-[12px] sm:text-sm font-bold text-[#1A1A1A] mb-1 leading-tight">{step.title}</h3>
                <p className="text-[10px] sm:text-[11px] text-[#504745] leading-relaxed line-clamp-3 sm:line-clamp-none">{step.desc}</p>
              </div>
              <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-[#F0E6E4]">
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#756A68]">Langkah {idx + 1} dari 4</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════ 5. VALUE & TRUST SECTION ════════════ */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] border-y border-[#D7CDCC]/60">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: Cockpit Image with Floating Glass Badge */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[4/3] border border-[#D7CDCC]">
              <img
                src="/images/keunggulan-interior.jpg"
                alt="Interior Kendaraan Mewah & Bersih"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Glass Pill */}
            <div className="absolute -bottom-3 left-4 sm:left-6 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#D7CDCC] rounded-xl p-3 shadow-md flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center font-bold">
                <Star size={15} className="fill-amber-400 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">10rb+ Konsumen Puas</p>
                <p className="text-[10px] text-[#756A68]">Rating 4.9/5 di Google Reviews</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Content & Checklist */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-4"
          >
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
                Mengapa Eksekutif &amp; Wisatawan Mempercayakan Perjalanannya Kepada Kami
              </h2>
              <p className="text-xs sm:text-[13px] text-[#504745] mt-2 leading-relaxed">
                Kami memahami pentingnya ketenangan pikiran dalam perjalanan bisnis maupun liburan Anda. Setiap aspek layanan kami dirancang untuk menghadirkan kenyamanan tanpa kompromi.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Armada Bersih &amp; Terawat Sempurna</h4>
                  <p className="text-[11px] text-[#504745] mt-0.5 leading-relaxed">
                    Setiap unit dicuci dan disanitasi menyeluruh sebelum diserahkan, bebas bau rokok dan wangi segar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Pengemudi Berlisensi &amp; Berpengalaman</h4>
                  <p className="text-[11px] text-[#504745] mt-0.5 leading-relaxed">
                    Driver berseragam rapi, ramah, tidak merokok saat bertugas, dan menguasai rute wisata Jogja.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Pembatalan Fleksibel &amp; Garansi Pengganti</h4>
                  <p className="text-[11px] text-[#504745] mt-0.5 leading-relaxed">
                    Jaminan mobil pengganti setara secara cuma-cuma jika terjadi kendala teknis tak terduga.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href={buildBookingUrl()}>
                <Button className="rounded-xl px-4 py-2 h-9 bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] text-xs font-semibold shadow-xs inline-flex items-center gap-1.5">
                  <span>Konsultasi Sewa Mobil Sekarang</span>
                  <ArrowRight size={13} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════ 6. TESTIMONIALS SECTION ════════════ */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Pengalaman Kemitraan Mobilitas
          </h2>
          <p className="text-xs sm:text-[13px] text-[#504745] mt-1">
            Cerita asli dari pelanggan kami yang telah merasakan standar kenyamanan armada kami.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-xl p-3 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div>
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400 sm:w-3 sm:h-3" />
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs text-[#2B2322] leading-relaxed italic line-clamp-4 sm:line-clamp-none">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              <div className="pt-2.5 sm:pt-3.5 mt-2.5 sm:mt-3.5 border-t border-[#F0E6E4] flex items-center justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#1A1A1A] truncate">{item.name}</h4>
                  <p className="text-[9px] sm:text-[10px] text-[#756A68] truncate">{item.role}</p>
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center font-bold text-[10px] sm:text-xs text-[#1A1A1A] shrink-0">
                  {item.name.charAt(0)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/testimoni">
            <span className="text-xs font-medium text-[#504745] hover:text-[#1A1A1A] inline-flex items-center gap-1 transition-colors">
              Lihat Semua Cerita Pelanggan <ChevronRight size={12} />
            </span>
          </Link>
        </div>
      </section>

      {/* ════════════ 7. FAQ SECTION ════════════ */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-[#D7CDCC]/60">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs text-[#504745] mt-1">
            Jawaban lengkap seputar syarat sewa, pembayaran, durasi, dan layanan antar jemput.
          </p>
        </div>

        <FAQ />
      </section>

      {/* ════════════ 8. CTA BANNER (DARK CONTRAST) ════════════ */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <div className="relative rounded-2xl bg-[#1A1A1A] text-[#F8F7F6] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2.5">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F8F7F6] tracking-tight leading-tight">
                Siap Menjelajah Yogyakarta?
              </h2>
              <p className="text-xs sm:text-[13px] text-white/70 max-w-lg leading-relaxed">
                Pesan kendaraan Anda sekarang untuk mendapatkan harga promosi dan jaminan ketersediaan armada idaman tanpa antre.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-end">
              <Link href={buildBookingUrl()} className="w-full">
                <Button className="w-full h-10 rounded-xl bg-[#F8F7F6] hover:bg-white text-[#1A1A1A] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5">
                  <span>Booking Sekarang</span>
                  <ArrowRight size={13} />
                </Button>
              </Link>
              <Link href="/kontak" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-xl border-white/20 bg-transparent hover:bg-white/10 text-[#F8F7F6] font-semibold text-xs transition-all"
                >
                  Hubungi Customer Care
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ 9. FOOTER ════════════ */}
      <Footer />
    </main>
  );
}
