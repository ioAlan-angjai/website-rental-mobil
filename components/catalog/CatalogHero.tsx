'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, ShieldCheck, Clock, Car, MapPin } from 'lucide-react';
import Link from 'next/link';

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
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stats = [
  { label: 'Armada Mobil', value: 100, suffix: '+', icon: Car },
  { label: 'Pelanggan Puas', value: 5000, suffix: '+', icon: Star },
  { label: 'Cabang Aktif', value: 3, suffix: '', icon: MapPin },
];

const badges = [
  { icon: Star, text: 'Rating 4.9/5' },
  { icon: ShieldCheck, text: 'Terverifikasi Resmi' },
  { icon: Clock, text: 'Layanan 24/7' },
];

export function CatalogHero() {
  return (
    <section className="relative py-24 px-4 bg-background text-foreground border-b border-border">
      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Headline */}
        <motion.div variants={itemVariants} className="mb-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
            Sewa Mobil Nyaman di Yogyakarta
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Armada lengkap, proses pemesanan praktis dan cepat, serta customer support responsif untuk menemani seluruh perjalanan Anda.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <Link
            href="/armada"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold text-sm rounded-xl hover:bg-foreground/90 transition-all shadow-xs"
          >
            <span>Lihat Semua Mobil</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/tentang-kami"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-background transition-all"
          >
            Tentang Kami
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl border border-border bg-card shadow-xs"
            >
              <span className="text-foreground/70 mb-2 inline-block">
                <stat.icon size={22} />
              </span>
              <div className="text-3xl font-black text-foreground mb-0.5">
                <AnimatedCounter target={stat.value} />
                {stat.suffix}
              </div>
              <p className="text-xs text-foreground/60 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
