'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { ArrowRight, Star, ShieldCheck, Clock, Car, MapPin } from 'lucide-react';

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(target);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stats = [
  { label: 'Armada Mobil', value: 100, suffix: '+', icon: Car },
  { label: 'Pelanggan Puas', value: 5000, suffix: '+', icon: Star },
  { label: 'Cabang Aktif', value: 3, suffix: '', icon: MapPin },
];

const badges = [
  { icon: Star, text: 'Rating 4.9/5' },
  { icon: ShieldCheck, text: 'Terverifikasi Resmi' },
  { icon: Clock, text: 'Support 24/7' },
];

export function CatalogHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-32 px-4 overflow-hidden bg-slate-900">
      {/* Aceternity BackgroundBeams — full section */}
      <BackgroundBeams className="opacity-60" />

      {/* Subtle radial vignette to keep text readable */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(15,23,42,0.85) 100%)',
        }}
      />

      {/* HeroHighlight — tracks mouse on the entire hero */}
      <HeroHighlight
        containerClassName="absolute inset-0 z-[2] pointer-events-none"
        className="hidden"
      >
        <></>
      </HeroHighlight>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Trust badges */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-8">
          {badges.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-400/10 border border-sky-400/25 text-sky-300 backdrop-blur-sm"
            >
              <Icon size={13} className="text-sky-400" />
              {text}
            </span>
          ))}
        </motion.div>

        {/* Main Headline — with Aceternity Highlight on key phrase */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-4">
            <span className="text-white">Sewa Mobil </span>
            <br className="hidden md:block" />
            <Highlight className="text-white">
              <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-amber-400 bg-clip-text text-transparent">
                Premium Luxury
              </span>
            </Highlight>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Armada lengkap dengan{' '}
          <span className="text-sky-400 font-semibold">harga khusus mahasiswa</span>, proses
          verifikasi cepat, dan customer support 24/7 untuk perjalanan Anda di Yogyakarta.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-400 to-amber-400 text-slate-900 font-bold text-base rounded-xl overflow-hidden hover:shadow-[0_0_30px_rgba(56,189,248,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            <span>Lihat Katalog Mobil</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-sky-400/40 text-sky-300 font-semibold text-base hover:bg-sky-400/10 hover:border-sky-400/70 active:scale-[0.98] transition-all duration-200"
          >
            Tentang Kami
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative p-6 rounded-2xl overflow-hidden border border-sky-400/15 hover:border-sky-400/40 transition-all duration-300"
              style={{
                background:
                  'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, rgba(251,191,36,0.04) 100%)',
              }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10">
                <span className="text-sky-400 mb-2 block">
                  <stat.icon size={24} />
                </span>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent mb-1">
                  <AnimatedCounter target={stat.value} />
                  {stat.suffix}
                </div>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
