'use client';

import { motion } from 'framer-motion';
import { Search, CalendarCheck, CarFront, ArrowRight, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Pilih Mobil',
    description:
      'Jelajahi katalog lengkap kami. Filter berdasarkan kategori, harga, dan fitur sesuai kebutuhan Anda.',
    gradient: 'from-sky-400 to-cyan-400',
    glow: 'group-hover:shadow-sky-400/25',
    iconBg: 'bg-sky-400/10 border-sky-400/20',
    iconColor: 'text-sky-400',
  },
  {
    step: '02',
    icon: CalendarCheck,
    title: 'Booking Online',
    description:
      'Tentukan tanggal sewa, upload dokumen (KTP/KTM), dan konfirmasi pemesanan. Proses cepat 5 menit.',
    gradient: 'from-amber-400 to-orange-400',
    glow: 'group-hover:shadow-amber-400/25',
    iconBg: 'bg-amber-400/10 border-amber-400/20',
    iconColor: 'text-amber-400',
  },
  {
    step: '03',
    icon: CarFront,
    title: 'Ambil & Jalan!',
    description:
      'Ambil kendaraan di lokasi atau gunakan layanan antar-jemput gratis. Nikmati perjalanan Anda!',
    gradient: 'from-emerald-400 to-teal-400',
    glow: 'group-hover:shadow-emerald-400/25',
    iconBg: 'bg-emerald-400/10 border-emerald-400/20',
    iconColor: 'text-emerald-400',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 mb-4">
            <Sparkles className="w-3 h-3 inline-block mr-1" /> Mudah & Cepat
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Cara{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Pemesanan
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Hanya 3 langkah mudah untuk memulai perjalanan Anda. Tanpa antri, tanpa ribet.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {STEPS.map(({ step, icon: Icon, title, description, gradient, glow, iconBg, iconColor }, i) => (
            <motion.div key={step} variants={fadeUp} className="relative">
              {/* Connector line (desktop only, between cards) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-14 -right-4 lg:-right-5 w-8 lg:w-10 z-20">
                  <ArrowRight size={20} className="text-slate-600" />
                </div>
              )}

              <div
                className={`group relative p-8 rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm
                  hover:border-slate-600/70 hover:bg-slate-800/50 transition-all duration-500 hover:shadow-2xl ${glow} h-full`}
              >
                {/* Step number watermark */}
                <span
                  className={`absolute top-4 right-6 text-7xl font-black bg-gradient-to-b ${gradient} bg-clip-text text-transparent opacity-[0.06] select-none pointer-events-none`}
                >
                  {step}
                </span>

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border ${iconBg} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={26} className={iconColor} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>

                {/* Bottom gradient line */}
                <div
                  className={`absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
