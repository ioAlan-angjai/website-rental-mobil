'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Target, Heart, Users, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#F8F2F1] text-[#1A1A1A]">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight mb-2 sm:mb-4">
            Tentang RentalMobil Jogja
          </h1>
          <p className="text-[#504745] max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Menghadirkan standar kenyamanan mobilitas tertinggi di Yogyakarta dengan armada modern dan transparansi penuh sejak 2020.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFFFFF] p-2 sm:p-3 border border-[#D7CDCC] shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80"
                alt="Armada RentalMobil Jogja"
                className="w-full h-auto object-cover rounded-xl sm:rounded-2xl"
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-3.5 sm:space-y-6"
          >
            <div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                Melayani Perjalanan Anda Dengan Standar Tanpa Kompromi
              </h2>
            </div>

            <div className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-[#504745] leading-relaxed">
              <p>
                <strong className="text-[#1A1A1A]">RentalMobil Jogja</strong> hadir untuk menjawab kebutuhan mobilitas berkualitas di Daerah Istimewa Yogyakarta. Baik untuk kunjungan dinas kenegaraan, kebutuhan korporat, maupun liburan keluarga berkesan.
              </p>
              <p>
                Kami percaya bahwa kepuasan perjalanan berawal dari unit kendaraan yang bersih, harum, terawat secara mekanis di bengkel resmi, serta kepastian jadwal yang tepat waktu.
              </p>
              <p>
                Didukung oleh pengemudi lokal berlisensi dan paham seluk-beluk Yogyakarta, kami siap menjadi partner perjalanan terpercaya Anda.
              </p>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-[#FFFFFF] rounded-xl sm:rounded-2xl border border-[#D7CDCC] shadow-xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1A1A1A] rounded-lg sm:rounded-xl flex items-center justify-center text-[#F8F7F6] shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Garansi Keamanan &amp; Kenyamanan</p>
                <p className="text-[10px] sm:text-[11px] text-[#756A68]">Unit pengganti 24 jam &amp; asuransi perjalanan</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visi, Misi & Nilai (2 Cols on Mobile) */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] border-y border-[#D7CDCC]/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
              Visi &amp; Komitmen Layanan
            </h2>
            <p className="text-xs sm:text-sm text-[#504745] mt-1.5">
              Prinsip integritas yang memandu seluruh operasional armada dan interaksi kami dengan pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
            {/* Visi */}
            <div className="bg-[#F8F7F6] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 space-y-2 sm:space-y-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-xs sm:text-lg font-bold text-[#1A1A1A]">Visi Utama</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-[#504745] leading-relaxed line-clamp-4 sm:line-clamp-none">
                Menjadi referensi utama penyedia layanan transportasi rental terdepan di Indonesia yang mengutamakan keselamatan dan kenyamanan.
              </p>
            </div>

            {/* Misi */}
            <div className="bg-[#F8F7F6] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 space-y-2 sm:space-y-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-xs sm:text-lg font-bold text-[#1A1A1A]">Misi Kami</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-[#504745] leading-relaxed line-clamp-4 sm:line-clamp-none">
                Menghadirkan unit kendaraan prima, sistem harga jujur tanpa biaya tersembunyi, serta keramahan pengemudi yang menyenangkan.
              </p>
            </div>

            {/* Nilai */}
            <div className="bg-[#F8F7F6] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 space-y-2 sm:space-y-4 col-span-2 md:col-span-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-xs sm:text-lg font-bold text-[#1A1A1A]">Nilai Kepercayaan</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-[#504745] leading-relaxed line-clamp-4 sm:line-clamp-none">
                Transparansi dalam setiap transaksi, kepedulian tulus terhadap kebutuhan pelanggan, dan komitmen cepat tanggap 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats (2 Cols on Mobile) */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Pencapaian Kemitraan Kami
          </h2>
          <p className="text-xs sm:text-sm text-[#504745] mt-1">
            Kepercayaan berkelanjutan dari ribuan pelanggan individu maupun instansi
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {[
            { icon: Users, value: '10.000+', label: 'Pelanggan Terlayani' },
            { icon: Award, value: '50+', label: 'Pilihan Unit Armada' },
            { icon: TrendingUp, value: '6+ Tahun', label: 'Pengalaman Operasional' },
            { icon: ShieldCheck, value: '99.4%', label: 'Tingkat Kepuasan' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl text-center shadow-xs">
                <CardContent className="p-3.5 sm:p-7 space-y-2 sm:space-y-3">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center mx-auto text-[#1A1A1A]">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-base sm:text-2xl lg:text-3xl font-black text-[#1A1A1A]">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-[#756A68] font-medium mt-0.5">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}

