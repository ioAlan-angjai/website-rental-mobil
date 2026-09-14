'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { servicesJogja } from '@/lib/site-content';
import { Key, Users, Plane, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const SERVICE_ICONS = [Key, Users, Plane];

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-[#F8F2F1] text-[#1A1A1A]">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight mb-2 sm:mb-4">
            Layanan Sewa Mobil
          </h1>
          <p className="text-[#504745] max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
            Pilihan paket fleksibel untuk kebutuhan sewa lepas kunci, pendampingan sopir profesional, hingga penjemputan bandara.
          </p>
        </motion.div>
      </section>

      {/* Services Grid (2 Columns on Mobile) */}
      <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
          {servicesJogja.map((service, idx) => {
            const Icon = SERVICE_ICONS[idx] || Key;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#FFFFFF] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-[#D7CDCC] hover:border-[#1A1A1A]/50 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center mb-3 sm:mb-6 text-[#1A1A1A] shadow-xs">
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <h2 className="text-xs sm:text-xl lg:text-2xl font-bold text-[#1A1A1A] leading-tight">
                      {service.title}
                    </h2>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-[#504745] leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {service.description}
                    </p>

                    <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC]/80">
                      <p className="text-[10px] sm:text-xs font-bold text-[#1A1A1A] truncate">
                        {service.priceNote}
                      </p>
                    </div>

                    <ul className="space-y-1.5 sm:space-y-2.5 pt-1 sm:pt-2">
                      {service.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs lg:text-sm text-[#504745]">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#1A1A1A] shrink-0 mt-0.5" />
                          <span className="leading-tight">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 sm:pt-6 mt-3 sm:mt-6 border-t border-[#F0E6E4]">
                  <Link href="/armada" className="w-full block">
                    <Button className="w-full rounded-xl sm:rounded-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] text-[10px] sm:text-xs font-semibold h-8 sm:h-10 shadow-xs flex items-center justify-center gap-1.5 sm:gap-2">
                      <span>Pilih Mobil</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-[#FFFFFF] p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#D7CDCC] shadow-xs">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center text-[#1A1A1A] shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-xl font-extrabold text-[#1A1A1A] tracking-tight">
                Ketentuan Umum Rental
              </h3>
              <p className="text-[11px] sm:text-xs text-[#504745] mt-0.5">
                Informasi penting untuk menjaga kenyamanan dan transparansi selama masa sewa
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-16">
            <li className="flex items-start gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-[#504745]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] mt-1.5 shrink-0" />
              <span>
                <strong className="text-[#1A1A1A]">Bahan Bakar (BBM):</strong> Mobil diserahkan dengan indikator BBM tertentu dan wajib dikembalikan pada posisi yang sama.
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-[#504745]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] mt-1.5 shrink-0" />
              <span>
                <strong className="text-[#1A1A1A]">Persyaratan Lepas Kunci:</strong> Wajib melampirkan foto e-KTP, SIM A aktif, dan akun media sosial atau deposit jaminan.
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-[#504745]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] mt-1.5 shrink-0" />
              <span>
                <strong className="text-[#1A1A1A]">Sewa Dengan Sopir:</strong> Durasi standar 12 jam atau per hari kalender sesuai kesepakatan paket perjalanan.
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-[#504745]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] mt-1.5 shrink-0" />
              <span>
                <strong className="text-[#1A1A1A]">Biaya Operasional Jalan:</strong> Biaya tiket tol, parkir, dan retribusi tempat wisata ditanggung oleh pihak penyewa.
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-[#504745]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] mt-1.5 shrink-0" />
              <span>
                <strong className="text-[#1A1A1A]">Wilayah Operasional:</strong> Meliputi area D.I. Yogyakarta. Untuk rute antar kota (Solo, Semarang, dll) mohon konfirmasi terlebih dahulu.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}

