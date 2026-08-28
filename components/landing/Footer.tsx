'use client';

import { Car, Phone, Mail, MapPin, Instagram, Facebook, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative bg-[#0e0c20] border-t border-[#2a2548] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#f97316]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0">

        {/* Top Row Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Col 1: Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-[#f97316] text-white rounded-xl shadow-lg shadow-[#f97316]/20 group-hover:bg-[#f97316]/90 transition-colors">
                <Car size={20} />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                RentalMobil
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Jasa sewa mobil terpercaya di Yogyakarta. Melayani sewa lepas kunci dan dengan driver untuk kebutuhan wisata, dinas, dan pribadi.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-xl bg-[#1b1838] border border-[#2a2548] text-white/50 hover:text-[#f97316] hover:border-[#f97316]/40 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="p-2 rounded-xl bg-[#1b1838] border border-[#2a2548] text-white/50 hover:text-[#f97316] hover:border-[#f97316]/40 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-widest">Halaman Utama</h4>
            <ul className="space-y-3">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Armada Mobil', href: '/armada' },
                { label: 'Layanan Kami', href: '/layanan' },
                { label: 'Testimoni', href: '/testimoni' },
                { label: 'Kontak', href: '/kontak' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-1.5 text-sm text-white/50 hover:text-[#f97316] transition-colors duration-200"
                  >
                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-[#f97316]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-widest">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#f97316]/20 transition-colors">
                  <Phone size={13} className="text-[#f97316]" />
                </div>
                <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">+62 812-3456-7890</span>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#f97316]/20 transition-colors">
                  <Mail size={13} className="text-[#f97316]" />
                </div>
                <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">info@rentalmobiljogja.com</span>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#f97316]/20 transition-colors">
                  <MapPin size={13} className="text-[#f97316]" />
                </div>
                <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors leading-relaxed">Jl. Kaliurang KM 5.5, Sleman, Yogyakarta 55281</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Jam Operasional */}
          <div>
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-widest">Jam Operasional</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock size={14} className="text-[#f97316] shrink-0" />
                <span className="font-medium">Setiap Hari</span>
              </div>
              <div className="p-4 bg-[#1b1838] border border-[#2a2548] rounded-2xl">
                <p className="text-sm text-white font-bold">08.00 – 21.00 WIB</p>
                <p className="text-[11px] text-white/40 mt-1">Customer Service & Booking</p>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                Layanan darurat 24 jam tersedia via WhatsApp
              </p>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-[#2a2548]" />

        {/* Bottom Row */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© 2026 RentalMobil Jogja. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#f97316] transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-[#f97316] transition-colors">Syarat &amp; Ketentuan</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
