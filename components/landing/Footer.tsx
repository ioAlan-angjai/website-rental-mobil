'use client';

import { Car, Phone, Mail, MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1: Brand details */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-zinc-900 text-white rounded-xl">
                <Car size={20} />
              </div>
              <span className="text-lg font-black text-zinc-900 tracking-tight">
                RentalMobil
              </span>
            </Link>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Jasa sewa mobil terpercaya di Yogyakarta. Melayani sewa lepas kunci dan dengan driver untuk kebutuhan wisata, dinas, dan pribadi.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-xl bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-all duration-200">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 rounded-xl bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-all duration-200">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-zinc-900 mb-4 text-sm uppercase tracking-wider">Halaman Utama</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/armada" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Armada Mobil
                </Link>
              </li>
              <li>
                <Link href="/layanan" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Layanan Kami
                </Link>
              </li>
              <li>
                <Link href="/testimoni" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Testimoni
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h4 className="font-bold text-zinc-900 mb-4 text-sm uppercase tracking-wider">Hubungi Kami</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">
                <Phone size={15} className="text-zinc-900 shrink-0 mt-0.5" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">
                <Mail size={15} className="text-zinc-900 shrink-0 mt-0.5" />
                <span>info@rentalmobiljogja.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer">
                <MapPin size={15} className="text-zinc-900 shrink-0 mt-0.5" />
                <span>Jl. Kaliurang KM 5.5, Sleman, Yogyakarta 55281</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Jam Operasional */}
          <div>
            <h4 className="font-bold text-zinc-900 mb-4 text-sm uppercase tracking-wider">Jam Operasional</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Clock size={15} className="text-zinc-900 shrink-0" />
                <span className="font-medium">Setiap Hari</span>
              </div>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <p className="text-xs text-zinc-900 font-bold">
                  08.00 - 21.00 WIB
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  (Customer Service & Booking)
                </p>
              </div>
              <p className="text-xs text-zinc-500">
                Layanan darurat 24 jam tersedia via WhatsApp
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="border-t border-zinc-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; 2026 RentalMobil Jogja. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-zinc-900 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
