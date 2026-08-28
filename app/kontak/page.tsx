'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function KontakPage() {
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
            <span className="text-white font-bold">Kontak</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
            Hubungi Kami
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Kami siap melayani pertanyaan dan kebutuhan rental mobil Anda
          </p>
        </div>
      </section>

      {/* Contact Cards Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Phone */}
          <Card className="bg-[#1b1838] border border-[#2a2548] rounded-3xl overflow-hidden group hover:border-[#f97316] transition-all duration-300 hover:shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#2a2548]/50 border border-[#2a2548] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Phone size={28} className="text-[#f97316]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Telepon</h3>
                <a href="tel:+628****7890" className="text-sm text-white/50 hover:text-white transition-colors block">
                  +62 812-3456-7890
                </a>
                <a href="tel:+628****1234" className="text-sm text-white/50 hover:text-white transition-colors block">
                  +62 856-7890-1234
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="bg-[#1b1838] border border-[#2a2548] rounded-3xl overflow-hidden group hover:border-[#f97316] transition-all duration-300 hover:shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#2a2548]/50 border border-[#2a2548] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Mail size={28} className="text-[#f97316]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                <a href="mailto:info@rentalmobiljogja.com" className="text-sm text-white/50 hover:text-white transition-colors block break-all">
                  info@rentalmobiljogja.com
                </a>
                <a href="mailto:booking@rentalmobiljogja.com" className="text-sm text-white/50 hover:text-white transition-colors block break-all">
                  booking@rentalmobiljogja.com
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Office */}
          <Card className="bg-[#1b1838] border border-[#2a2548] rounded-3xl overflow-hidden group hover:border-[#f97316] transition-all duration-300 hover:shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#2a2548]/50 border border-[#2a2548] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <MapPin size={28} className="text-[#f97316]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Kantor</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Jl. Kaliurang KM 5.5, Sleman, Yogyakarta 55281
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="bg-[#1b1838] border border-[#2a2548] rounded-3xl overflow-hidden group hover:border-[#f97316] transition-all duration-300 hover:shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#2a2548]/50 border border-[#2a2548] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={28} className="text-[#f97316]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
                <p className="text-sm text-white/50">
                  Chat langsung dengan Customer Service kami
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Jam Operasional */}
      <section className="py-16 px-4 bg-[#1b1838] border-t border-[#2a2548]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#13112a] p-8 md:p-12 rounded-3xl border border-[#2a2548]">
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-[#2a2548]/50">
                <Clock size={28} className="text-[#f97316]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-serif mb-2">
                  Jam Operasional
                </h2>
                <p className="text-sm text-white/50">
                  Kami siap melayani Anda pada jam berikut
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Senin - Jumat */}
              <div className="p-6 rounded-2xl bg-[#1b1838] border border-[#2a2548]">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
                  Senin - Jumat
                </h3>
                <p className="text-lg font-black text-white">
                  08.00 - 21.00 WIB
                </p>
              </div>

              {/* Sabtu - Minggu */}
              <div className="p-6 rounded-2xl bg-[#1b1838] border border-[#2a2548]">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
                  Sabtu - Minggu
                </h3>
                <p className="text-lg font-black text-white">
                  08.00 - 21.00 WIB
                </p>
              </div>

            </div>

            <div className="mt-6 p-4 rounded-2xl bg-[#2a2548]/50 border border-[#2a2548]">
              <p className="text-xs text-white/50 leading-relaxed">
                <span className="font-bold">Layanan Darurat 24 Jam:</span> Untuk kebutuhan mendesak di luar jam operasional, hubungi kami via WhatsApp di +62 812-3456-7890
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-white font-serif">
            Butuh Bantuan Cepat?
          </h2>
          <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
            Hubungi kami langsung via WhatsApp untuk respon yang lebih cepat
          </p>
          <div className="pt-4">
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="px-8 py-4 bg-[#f97316] hover:bg-[#f97316]/80 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto">
                <MessageSquare size={20} />
                Chat via WhatsApp
              </button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
