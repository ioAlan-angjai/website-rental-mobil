'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { motion } from 'framer-motion';
import { Car, Shield, Sparkles, ArrowRight, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const buildBookingUrl = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return `/booking?${params.toString()}`;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }
    router.push(`/armada?${params.toString()}`);
  };

  return (
    <main className="relative min-h-screen bg-white overflow-x-hidden">

      <Navbar />

      {/* Hero Section - Split Layout Monochrome */}
      <section className="relative pt-24 pb-16 px-6 min-h-screen flex items-center bg-slate-50 overflow-hidden">
        {/* Background Decorative Elements */}
        <BackgroundOrnaments />

        <div className="max-w-7xl mx-auto w-full relative z-20">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT COLUMN - Text & Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Headline */}
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-900 leading-[1.1] mb-6 tracking-tight">
                Sewa Mobil Jogja.
                <br />
                Perjalanan Nyaman,
                <br />
                Unit Terawat.
              </h1>

              {/* Sub-headline */}
              <p className="text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed max-w-xl">
                Temukan armada terbaik untuk perjalanan Anda di Yogyakarta dengan layanan lepas kunci atau dengan sopir.
              </p>

              {/* Quick Search Form */}
              <div className="bg-white rounded-2xl shadow-lg shadow-zinc-900/5 p-6 md:p-8 border border-zinc-100">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide mb-5">
                  Cari Armada Tersedia
                </h3>

                <div className="space-y-4">
                  {/* Car Type Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Jenis Mobil
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="hatchback">Hatchback / City Car</option>
                      <option value="suv">SUV</option>
                      <option value="mpv">MPV / Minivan</option>
                      <option value="sedan">Sedan</option>
                      <option value="elf">ELF / Bus Mini</option>
                    </select>
                  </div>

                  {/* Date Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Mulai Sewa
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        min={todayStr}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          // Enforce end date to be at least 1 day after start date if it's currently invalid
                          if (e.target.value) {
                            const newStart = new Date(e.target.value);
                            const minEnd = new Date(newStart.getTime() + 24 * 60 * 60 * 1000);
                            const minEndStr = minEnd.toISOString().split('T')[0];
                            if (!endDate || endDate <= e.target.value) {
                              setEndDate(minEndStr);
                            }
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Selesai Sewa
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate ? (() => {
                          const start = new Date(startDate);
                          const nextDay = new Date(start.getTime() + 24 * 60 * 60 * 1000);
                          return nextDay.toISOString().split('T')[0];
                        })() : todayStr}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all duration-300 group"
                  >
                    Cari Armada
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN - Floating Mockup Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              {/* Main Mockup Card */}
              <div className="relative group/mockup">
                {/* Floating Card - Available Car */}
                <div className="bg-white rounded-3xl shadow-xl shadow-zinc-900/5 hover:shadow-2xl hover:shadow-zinc-950/15 p-8 border border-zinc-150 max-w-md transform hover:-translate-y-3 transition-all duration-500 ease-out">

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-250">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Available Now
                    </span>
                    <Sparkles className="w-5 h-5 text-zinc-400 group-hover/mockup:text-zinc-900 transition-colors duration-300" />
                  </div>

                  {/* Car Image Placeholder */}
                  <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl h-48 mb-6 flex items-center justify-center overflow-hidden relative">
                    <Car className="w-24 h-24 text-zinc-400 group-hover/mockup:scale-110 group-hover/mockup:rotate-3 transition-transform duration-500 ease-out" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Car Info */}
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">
                    Toyota Avanza 2023
                  </h3>
                  <p className="text-sm text-zinc-500 mb-6">
                    7 Penumpang • Manual • Bensin
                  </p>

                  {/* Price */}
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-bold text-zinc-900">
                      Rp 250K
                    </span>
                    <span className="text-zinc-500 mb-1">/hari</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8 pb-8 border-b border-zinc-100">
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Shield className="w-4 h-4 text-zinc-400" />
                      <span>Asuransi Lengkap</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Star className="w-4 h-4 text-zinc-400" />
                      <span>Unit Terawat & Bersih</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Car className="w-4 h-4 text-zinc-400" />
                      <span>Lepas Kunci / Dengan Sopir</span>
                    </div>
                  </div>

                  {/* Booking Button */}
                  <Link
                    href={buildBookingUrl()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    Booking Sekarang
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Small Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="absolute -bottom-8 -left-8 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-xl"
                >
                  <div className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
                    Ready to Rent
                  </div>
                  <div className="text-2xl font-bold">15+ Units</div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Kategori Armada - Bento Grid */}
      <section className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
              Pilih Kategori Armada
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Dari ekonomis hingga premium, kami punya mobil yang sempurna untuk setiap kebutuhan Anda
            </p>
          </motion.div>

          {/* Bento Grid - 3 Column Cards */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Card 1: Economy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="group relative bg-zinc-50 rounded-2xl p-8 border border-zinc-200 hover:border-zinc-900 hover:-translate-y-2 hover:shadow-2xl hover:shadow-zinc-900/5 transition-all duration-500 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/0 to-zinc-950/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Car className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                  Ekonomis & Hemat
                </h3>

                <p className="text-zinc-600 mb-6 leading-relaxed">
                  Mobil city car dan compact yang irit BBM, cocok untuk perjalanan dalam kota dengan budget terbatas.
                </p>

                <div className="mb-6 space-y-2">
                  <div className="text-sm text-zinc-700">✓ Mulai dari Rp 150.000/hari</div>
                  <div className="text-sm text-zinc-700">✓ Hemat BBM</div>
                  <div className="text-sm text-zinc-700">✓ Mudah parkir</div>
                </div>
              </div>

              <div className="relative z-10 pt-4">
                <Link
                  href="/armada?kategori=ekonomis"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full bg-transparent hover:bg-zinc-900 text-zinc-900 hover:text-white font-medium rounded-lg border border-zinc-900 transition-all duration-300 group-hover:shadow-md"
                >
                  Lihat Mobil
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Card 2: Comfort */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="group relative bg-zinc-50 rounded-2xl p-8 border border-zinc-200 hover:border-zinc-900 hover:-translate-y-2 hover:shadow-2xl hover:shadow-zinc-900/5 transition-all duration-500 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/0 to-zinc-950/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                  Kenyamanan Maksimal
                </h3>

                <p className="text-zinc-600 mb-6 leading-relaxed">
                  Sedan dan MPV dengan interior nyaman, ideal untuk perjalanan jauh atau rombongan keluarga.
                </p>

                <div className="mb-6 space-y-2">
                  <div className="text-sm text-zinc-700">✓ Mulai dari Rp 250.000/hari</div>
                  <div className="text-sm text-zinc-700">✓ AC dingin & audio premium</div>
                  <div className="text-sm text-zinc-700">✓ Kapasitas 5-7 penumpang</div>
                </div>
              </div>

              <div className="relative z-10 pt-4">
                <Link
                  href="/armada?kategori=comfort"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full bg-transparent hover:bg-zinc-900 text-zinc-900 hover:text-white font-medium rounded-lg border border-zinc-900 transition-all duration-300 group-hover:shadow-md"
                >
                  Lihat Mobil
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Card 3: Premium */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="group relative bg-zinc-50 rounded-2xl p-8 border border-zinc-200 hover:border-zinc-900 hover:-translate-y-2 hover:shadow-2xl hover:shadow-zinc-900/5 transition-all duration-500 flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/0 to-zinc-950/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                  Premium & Mewah
                </h3>

                <p className="text-zinc-600 mb-6 leading-relaxed">
                  SUV dan mobil premium untuk kebutuhan bisnis, acara spesial, atau perjalanan dengan gaya.
                </p>

                <div className="mb-6 space-y-2">
                  <div className="text-sm text-zinc-700">✓ Mulai dari Rp 400.000/hari</div>
                  <div className="text-sm text-zinc-700">✓ Fitur lengkap & teknologi terkini</div>
                  <div className="text-sm text-zinc-700">✓ Performa & kenyamanan terbaik</div>
                </div>
              </div>

              <div className="relative z-10 pt-4">
                <Link
                  href="/armada?kategori=premium"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full bg-transparent hover:bg-zinc-900 text-zinc-900 hover:text-white font-medium rounded-lg border border-zinc-900 transition-all duration-300 group-hover:shadow-md"
                >
                  Lihat Mobil
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-6 bg-[#F5F3EF]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kata Mereka yang Sudah Percaya
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ribuan mahasiswa Jogja telah mempercayai kami untuk kebutuhan rental mobil mereka
            </p>
          </motion.div>

          {/* Testimonial Grid */}
          <div className="grid md:grid-cols-3 gap-8">

            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "Pelayanan sangat memuaskan! Mobilnya bersih dan terawat. Proses booking juga cepat, cocok banget buat mahasiswa yang butuh mobilitas tinggi."
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  AR
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Andi Raharjo</div>
                  <div className="text-sm text-gray-500">Mahasiswa UGM</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "Harga terjangkau dan ada diskon mahasiswa! Puas banget sama pelayanannya. Ownernya baik dan responsif. Recommended!"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  SP
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Siti Pratiwi</div>
                  <div className="text-sm text-gray-500">Mahasiswa UNY</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "Pertama kali rental mobil dan pengalamannya sangat smooth. Mobilnya nyaman untuk trip ke Dieng. Worth it banget!"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                  BW
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Budi Wijaya</div>
                  <div className="text-sm text-gray-500">Mahasiswa UII</div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* CTA Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              href="/testimoni"
              className="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-blue-600 transition-colors"
            >
              Lihat Semua Testimoni
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-20 px-6 bg-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Memulai Perjalanan Anda?
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Booking mobil impian Anda sekarang dan nikmati pengalaman rental yang berbeda
            </p>
            <Link
              href={buildBookingUrl()}
              className="inline-flex items-center gap-2 px-10 py-5 bg-white hover:bg-zinc-100 text-zinc-900 text-lg font-semibold rounded-xl transition-all"
            >
              Mulai Booking
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">RentalMobil</span>
              </div>
              <p className="text-sm text-zinc-400">
                Solusi rental mobil terpercaya untuk mahasiswa Yogyakarta
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/armada" className="hover:text-white transition-colors">Armada</Link></li>
                <li><Link href="/layanan" className="hover:text-white transition-colors">Layanan</Link></li>
                <li><Link href="/booking" className="hover:text-white transition-colors">Booking</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/tentang-kami" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                <li><Link href="/testimoni" className="hover:text-white transition-colors">Testimoni</Link></li>
                <li><Link href="/kontak" className="hover:text-white transition-colors">Kontak</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>WhatsApp: +62 812-3456-7890</li>
                <li>Email: info@rentalmobil.com</li>
                <li>Yogyakarta, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
            © 2026 RentalMobil Premium. All rights reserved.
          </div>
        </div>
      </footer>

    </main>
  );
}
