'use client';

import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      {/* Background Decor */}
      <div className="geometric-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/10 dark:bg-blue-600/5" />

      <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
        
        {/* Glow Line decoration */}
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-[#C9A84C] rounded-full mx-auto" />

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Siap Jelajahi Yogyakarta?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-base leading-relaxed">
            Hubungi kami sekarang untuk reservasi mobil atau konsultasi gratis mengenai paket perjalanan terbaik di wilayah DIY.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/booking" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl transition-all duration-200 hover:scale-[1.02]">
              Booking Sekarang
            </Button>
          </Link>
          <a 
            href="https://wa.me/6281234567890" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button 
              variant="outline"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-6 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-base rounded-xl transition-all duration-200"
            >
              <Phone size={18} className="text-green-600 dark:text-green-400" />
              Hubungi via WhatsApp
            </Button>
          </a>
        </div>

      </div>
    </section>
  );
}
