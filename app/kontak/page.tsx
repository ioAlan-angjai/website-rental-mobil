'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-[#F8F2F1] text-[#1A1A1A]">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight mb-2 sm:mb-4">
            Hubungi Tim Kami
          </h1>
          <p className="text-[#504745] max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
            Tim customer support kami siap melayani pertanyaan, konsultasi rute, serta kebutuhan sewa armada Anda 24/7.
          </p>
        </motion.div>
      </section>

      {/* Contact Cards Grid (2 Cols on Mobile) */}
      <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {/* Phone */}
          <Card className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl overflow-hidden group hover:border-[#1A1A1A]/40 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-3.5 sm:p-7 text-center space-y-2 sm:space-y-4">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center mx-auto text-[#1A1A1A] group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-bold text-[#1A1A1A] mb-1">Telepon</h3>
                <a href="tel:+6281234567890" className="text-[10px] sm:text-xs text-[#504745] hover:text-[#1A1A1A] transition-colors block truncate">
                  +62 812-3456-7890
                </a>
                <a href="tel:+6285678901234" className="text-[10px] sm:text-xs text-[#504745] hover:text-[#1A1A1A] transition-colors block mt-0.5 truncate">
                  +62 856-7890-1234
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl overflow-hidden group hover:border-[#1A1A1A]/40 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-3.5 sm:p-7 text-center space-y-2 sm:space-y-4">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center mx-auto text-[#1A1A1A] group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-bold text-[#1A1A1A] mb-1">Email</h3>
                <a href="mailto:info@rentalmobiljogja.com" className="text-[9px] sm:text-xs text-[#504745] hover:text-[#1A1A1A] transition-colors block break-all leading-tight">
                  info@rentalmobiljogja.com
                </a>
                <a href="mailto:booking@rentalmobiljogja.com" className="text-[9px] sm:text-xs text-[#504745] hover:text-[#1A1A1A] transition-colors block break-all mt-1 leading-tight">
                  booking@rentalmobiljogja.com
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Office */}
          <Card className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl overflow-hidden group hover:border-[#1A1A1A]/40 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-3.5 sm:p-7 text-center space-y-2 sm:space-y-4">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center mx-auto text-[#1A1A1A] group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-bold text-[#1A1A1A] mb-1">Garasi &amp; Kantor</h3>
                <p className="text-[10px] sm:text-xs text-[#504745] leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Jl. Kaliurang KM 5.5, Sleman, Yogyakarta
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl overflow-hidden group hover:border-[#1A1A1A]/40 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-3.5 sm:p-7 text-center space-y-2 sm:space-y-4">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center mx-auto text-[#1A1A1A] group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-bold text-[#1A1A1A] mb-1">Live Chat</h3>
                <p className="text-[10px] sm:text-xs text-[#504745] leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Widget chat instan di pojok kanan bawah layar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Jam Operasional */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-[#FFFFFF] p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[#D7CDCC] shadow-xs">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC] flex items-center justify-center text-[#1A1A1A] shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
                Jam Operasional Reservasi
              </h2>
              <p className="text-[11px] sm:text-xs text-[#504745] mt-0.5">
                Layanan booking dan penjemputan unit beroperasi setiap hari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC]/70">
              <h3 className="text-[10px] sm:text-xs font-bold text-[#756A68] uppercase tracking-wider mb-1">
                Senin - Jumat
              </h3>
              <p className="text-xs sm:text-base font-black text-[#1A1A1A]">
                08.00 - 21.00 WIB
              </p>
            </div>

            <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#F8F7F6] border border-[#D7CDCC]/70">
              <h3 className="text-[10px] sm:text-xs font-bold text-[#756A68] uppercase tracking-wider mb-1 truncate">
                Sabtu - Minggu &amp; Libur
              </h3>
              <p className="text-xs sm:text-base font-black text-[#1A1A1A]">
                08.00 - 21.00 WIB
              </p>
            </div>
          </div>

          <div className="mt-3.5 sm:mt-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F8F2F1] border border-[#D7CDCC]">
            <p className="text-[11px] sm:text-xs text-[#504745] leading-relaxed">
              <strong className="text-[#1A1A1A]">Layanan Darurat 24 Jam:</strong> Untuk insiden jalan raya atau kondisi darurat, hotline WhatsApp kami tetap siaga 24 jam non-stop.
            </p>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-[#1A1A1A] text-[#F8F7F6] shadow-xl">
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2 sm:mb-3 text-white">
            Butuh Respon Cepat?
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed mb-4 sm:mb-6">
            Hubungi customer care kami langsung via WhatsApp untuk ketersediaan unit dadakan atau penawaran paket khusus.
          </p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-full bg-[#F8F7F6] hover:bg-[#FFFFFF] text-[#1A1A1A] text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <MessageSquare size={15} />
            <span>Chat via WhatsApp Official</span>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

