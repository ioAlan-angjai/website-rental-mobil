'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Target, Heart, Users, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#13112a] relative overflow-hidden">
      <Navbar />

      {/* Header Banner */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-[#2a2548] bg-[#1b1838]">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#2a2548]/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-xs text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white font-bold">Tentang Kami</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
            Tentang RentalMobil Jogja
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Penyedia jasa rental mobil terpercaya di Yogyakarta sejak 2020
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#2a2548]/30 rounded-full blur-3xl animate-pulse" />
            <div className="relative overflow-hidden rounded-3xl bg-[#1b1838] p-4 border border-[#2a2548] shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-shadow duration-500 group">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
                alt="RentalMobil Jogja"
                className="w-full h-auto object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2a2548] text-white uppercase tracking-wider mb-4 border border-[#2a2548]">
                Sejarah Kami
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white leading-tight mb-4">
                Melayani Dengan Sepenuh Hati
              </h2>
            </div>

            <div className="space-y-4 text-white/50 text-base leading-relaxed">
              <p>
                <strong className="text-white font-bold">RentalMobil Jogja</strong> didirikan pada tahun 2020 dengan visi menjadi penyedia jasa sewa mobil terpercaya di wilayah Daerah Istimewa Yogyakarta dan sekitarnya.
              </p>
              <p>
                Kami memahami bahwa mobilitas adalah kunci kenyamanan perjalanan. Oleh karena itu, kami berkomitmen menyediakan armada berkualitas dengan harga yang kompetitif dan pelayanan profesional.
              </p>
              <p>
                Dengan pengalaman lebih dari 4 tahun melayani ribuan pelanggan dari berbagai daerah, kami terus berinovasi meningkatkan standar layanan demi kepuasan Anda.
              </p>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#1b1838] rounded-2xl border border-[#2a2548] hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="p-2 bg-[#2a2548] rounded-xl">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Terpercaya Sejak 2020</p>
                <p className="text-xs text-white/50">Lebih dari 1000+ pelanggan puas</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-16 px-4 bg-[#1b1838] border-t border-[#2a2548] relative z-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4">
              Visi & Misi
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Nilai-nilai yang menjadi landasan kami dalam melayani Anda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Visi */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              <Card className="bg-[#13112a] border border-[#2a2548] rounded-3xl overflow-hidden group hover:border-[#f97316] hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#1b1838] border border-[#2a2548] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Target size={26} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">Visi</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Menjadi penyedia jasa rental mobil terdepan di Yogyakarta yang dikenal dengan pelayanan prima, armada berkualitas, dan harga terjangkau.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Misi */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <Card className="bg-[#13112a] border border-[#2a2548] rounded-3xl overflow-hidden group hover:border-[#f97316] hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#1b1838] border border-[#2a2548] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Heart size={26} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">Misi</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Memberikan pengalaman sewa mobil yang mudah, aman, dan nyaman dengan standar layanan tertinggi untuk setiap pelanggan.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Nilai */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <Card className="bg-[#13112a] border border-[#2a2548] rounded-3xl overflow-hidden group hover:border-[#f97316] hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#1b1838] border border-[#2a2548] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <ShieldCheck size={26} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">Nilai Kami</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Integritas, transparansi, dan komitmen penuh dalam setiap layanan yang kami berikan kepada pelanggan.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-[#13112a] border-t border-[#2a2548]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4">
            Pencapaian Kami
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Angka yang membuktikan kepercayaan pelanggan terhadap kami
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Users, value: '1,000+', label: 'Pelanggan Puas' },
            { icon: Award, value: '250+', label: 'Unit Armada' },
            { icon: TrendingUp, value: '4+', label: 'Tahun Pengalaman' },
            { icon: ShieldCheck, value: '99.2%', label: 'Kepuasan Pelanggan' },
          ].map((stat, idx) => {
            const Icon = stat.icon;

            return (
              <Card key={idx} className="bg-[#1b1838] border border-[#2a2548] rounded-3xl overflow-hidden text-center group hover:border-[#f97316] transition-all duration-300 hover:shadow-md">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2a2548] border border-[#2a2548] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 text-white">
                    <Icon size={26} />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-white/50 font-medium">{stat.label}</p>
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
