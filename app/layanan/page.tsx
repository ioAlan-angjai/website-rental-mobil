'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { servicesJogja } from '@/lib/site-content';
import { Key, Users, Plane, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SERVICE_ICONS = [Key, Users, Plane];

export default function LayananPage() {
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
            <span className="text-white font-bold">Layanan</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
            Layanan Sewa Mobil
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Pilih layanan yang sesuai dengan kebutuhan perjalanan Anda di Yogyakarta
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesJogja.map((service, idx) => {
            const Icon = SERVICE_ICONS[idx];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                className="relative bg-[#1b1838] rounded-3xl p-8 border border-[#2a2548] hover:border-white/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30 transition-all duration-500 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-[#13112a] border border-[#2a2548] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                    <Icon size={30} className="text-white" />
                  </div>

                  <div className="space-y-5">
                    <h2 className="text-2xl font-bold text-white group-hover:text-[#f97316] transition-colors duration-300">
                      {service.title}
                    </h2>
                    <p className="text-base text-white/50 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="p-4 rounded-2xl bg-[#13112a] border border-[#2a2548]">
                      <p className="text-sm font-bold text-white">
                        {service.priceNote}
                      </p>
                    </div>

                    <ul className="space-y-3 pt-2">
                      {service.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-3 text-sm text-white/50">
                          <CheckCircle size={16} className="text-white shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 bg-[#1b1838] border-t border-[#2a2548]">
        <div className="max-w-4xl mx-auto bg-[#13112a] p-8 md:p-12 rounded-3xl border border-[#2a2548]">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-[#2a2548]/50">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Informasi Penting
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Harap diperhatikan ketentuan berikut untuk kenyamanan bersama
              </p>
            </div>
          </div>

          <ul className="space-y-4 ml-16">
            <li className="flex items-start gap-3 text-sm text-white/50">
              <span className="inline-block w-2 h-2 bg-[#f97316] rounded-full mt-1.5 shrink-0" />
              <span>
                <strong className="font-bold text-white">BBM tidak termasuk</strong> dalam harga sewa. Mobil diserahkan dalam kondisi full tank dan harus dikembalikan dalam kondisi full tank.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm text-white/50">
              <span className="inline-block w-2 h-2 bg-[#f97316] rounded-full mt-1.5 shrink-0" />
              <span>
                <strong className="font-bold text-white">Sewa lepas kunci</strong> memerlukan KTP, SIM A valid, dan deposit jaminan sesuai kebijakan.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm text-white/50">
              <span className="inline-block w-2 h-2 bg-[#f97316] rounded-full mt-1.5 shrink-0" />
              <span>
                <strong className="font-bold text-white">Sewa dengan driver</strong> durasi 12 jam per hari (08.00 - 20.00 WIB). Overtime dikenakan biaya tambahan.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm text-white/50">
              <span className="inline-block w-2 h-2 bg-[#f97316] rounded-full mt-1.5 shrink-0" />
              <span>
                <strong className="font-bold text-white">Biaya tol, parkir, dan tiket wisata</strong> ditanggung oleh penyewa.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm text-white/50">
              <span className="inline-block w-2 h-2 bg-[#f97316] rounded-full mt-1.5 shrink-0" />
              <span>
                <strong className="font-bold text-white">Area operasional</strong> meliputi DIY dan sekitarnya. Untuk perjalanan luar kota jauh, konsultasikan dengan admin kami terlebih dahulu.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
