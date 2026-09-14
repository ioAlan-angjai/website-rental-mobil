'use client';

import { Phone, Mail, MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#F8F2F1] border-t border-[#D7CDCC] text-[#1A1A1A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1 & 2: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group inline-block">
              <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-[#2C2828] transition-colors">
                R
              </div>
              <span className="text-base font-bold text-[#1A1A1A] tracking-tight">
                RentalMobil
              </span>
            </Link>
            <p className="text-xs text-[#504745] leading-relaxed max-w-sm">
              Solusi transportasi terpercaya di Yogyakarta. Menyediakan armada prima dengan layanan lepas kunci maupun pengemudi profesional untuk kenyamanan mobilitas Anda.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-[#504745]">
                <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center shrink-0 text-[#1A1A1A]">
                  <Phone size={11} />
                </div>
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#504745]">
                <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center shrink-0 text-[#1A1A1A]">
                  <Mail size={11} />
                </div>
                <span>info@rentalmobiljogja.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#504745]">
                <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center shrink-0 text-[#1A1A1A]">
                  <Clock size={11} />
                </div>
                <span>Setiap hari, 08.00 – 21.00 WIB</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#504745]">
                <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center shrink-0 text-[#1A1A1A] mt-0.5">
                  <MapPin size={11} />
                </div>
                <span>Jl. Kaliurang KM 5.5, Sleman, D.I. Yogyakarta 55281</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="#"
                className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center text-[#504745] hover:text-[#1A1A1A] hover:bg-[#F8F7F6] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={13} />
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#D7CDCC] flex items-center justify-center text-[#504745] hover:text-[#1A1A1A] hover:bg-[#F8F7F6] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={13} />
              </a>
            </div>
          </div>

          {/* Col 3: Link Cepat */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A] mb-3">
              Link Cepat
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Armada Mobil', href: '/armada' },
                { label: 'Layanan', href: '/layanan' },
                { label: 'Tentang Kami', href: '/tentang-kami' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Kontak', href: '/kontak' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-[#504745] hover:text-[#1A1A1A] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Layanan */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A] mb-3">
              Layanan Kami
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Rental Lepas Kunci', href: '/layanan#lepas-kunci' },
                { label: 'Rental Dengan Driver', href: '/layanan#dengan-driver' },
                { label: 'Antar Jemput Bandara', href: '/layanan#antar-jemput' },
                { label: 'Paket Wisata Jogja', href: '/layanan#wisata' },
                { label: 'Sewa Mobil Bulanan', href: '/layanan#korporat' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-[#504745] hover:text-[#1A1A1A] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#D7CDCC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#756A68]">
          <p>© {new Date().getFullYear()} RentalMobil Jogja. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-5">
            <Link href="/faq" className="hover:text-[#1A1A1A] transition-colors">
              Pusat Bantuan
            </Link>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

