'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-20 lg:py-28 overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Beams from Aceternity */}
      <BackgroundBeams className="opacity-40 dark:opacity-60" />

      {/* Geometric glow blurs */}
      <div className="geometric-glow top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 dark:bg-blue-600/5" />
      <div className="geometric-glow bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 dark:bg-amber-600/5" />

      {/* Hero Highlight wrapper for mouse-follow dot pattern */}
      <HeroHighlight
        containerClassName="absolute inset-0 z-[2] pointer-events-none"
        className="hidden"
      >
        <></>
      </HeroHighlight>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column - Copy */}
          <motion.div 
            className="lg:col-span-7 space-y-6 text-left"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                Sewa Mobil Jogja <br />
                <Highlight className="text-slate-900 dark:text-white">
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                    Lepas Kunci & Include Driver
                  </span>
                </Highlight>
              </h1>
              <h2 className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300">
                Nikmati perjalanan nyaman di Yogyakarta dengan armada terbaik kami
              </h2>
            </motion.div>

            <motion.p variants={fadeUp} className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Pilihan sewa mobil terpercaya dengan harga kompetitif. Layanan profesional untuk perjalanan wisata, 
              dinas, atau keperluan pribadi Anda di wilayah DIY dan sekitarnya.
            </motion.p>

            {/* Micro value props */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <MapPin size={16} className="text-blue-700 dark:text-blue-400" />
                </div>
                <span className="font-medium">Antar Jemput Gratis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <Clock size={16} className="text-blue-700 dark:text-blue-400" />
                </div>
                <span className="font-medium">Layanan 24 Jam</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <Shield size={16} className="text-blue-700 dark:text-blue-400" />
                </div>
                <span className="font-medium">Unit Terawat</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/armada">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
                  Lihat Armada
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/booking">
                <Button variant="outline" className="w-full sm:w-auto border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white dark:border-[#C9A84C] dark:text-[#C9A84C] dark:hover:bg-[#C9A84C] dark:hover:text-slate-900 font-semibold text-base px-8 py-6 rounded-xl transition-all duration-200">
                  Booking Sekarang
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Image/Visual */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glowing blur under car image */}
            <div className="geometric-glow top-[40%] left-[10%] w-[80%] h-[30%] bg-blue-600/20 dark:bg-blue-600/30" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-4 glass-panel shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80"
                alt="Sewa Mobil Jogja"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-card flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mulai dari</p>
                  <p className="text-lg font-black text-[#C9A84C]">Rp 300rb <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ hari</span></p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Small floating card: Verified */}
            <div className="absolute -top-6 -right-4 glass-card px-4 py-3 rounded-2xl shadow-xl hidden sm:flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-xl text-green-600 dark:text-green-400">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Terpercaya</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">1000+ Pelanggan</p>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
