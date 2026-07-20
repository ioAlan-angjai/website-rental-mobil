'use client';

import { motion } from 'framer-motion';
import { KeyRound, Coins, FileCheck2, Map, Star } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const FEATURES = [
  {
    icon: KeyRound,
    title: 'Sewa 5 Tahun Jadi Milik',
    description: 'Bukan sekadar menyewa. Setelah masa kontrak 5 tahun selesai, mobil kami balik nama resmi atas nama Anda secara gratis.',
    gradient: 'from-blue-500 to-indigo-600',
    iconColor: 'text-blue-400',
  },
  {
    icon: Coins,
    title: 'Tanpa Biaya Awal',
    description: 'Anda tidak perlu membayar uang muka (DP) puluhan juta rupiah. Cukup bayar biaya sewa bulan pertama saat serah terima mobil.',
    gradient: 'from-indigo-500 to-purple-600',
    iconColor: 'text-indigo-400',
  },
  {
    icon: FileCheck2,
    title: 'Asuransi & Pajak Ditanggung',
    description: 'Kami menanggung penuh seluruh asuransi Comprehensive (All-Risk) dan biaya perpanjangan pajak STNK tahunan serta lima tahunan.',
    gradient: 'from-purple-500 to-pink-600',
    iconColor: 'text-purple-400',
  },
  {
    icon: Map,
    title: 'Bebas Keluar Kota',
    description: 'Gunakan mobil untuk kebutuhan bisnis, operasional driver online, maupun mudik keluarga ke luar kota tanpa batasan kilometer.',
    gradient: 'from-blue-500 to-emerald-500',
    iconColor: 'text-emerald-400',
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-slate-950 text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wider">
            <Star className="w-3.5 h-3.5" /> Keunggulan Utama
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Mengapa Memilih{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              RentalMobil?
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Kami menghadirkan solusi kepemilikan mobil masa kini yang fleksibel, terjangkau, dan 100% bebas repot.
          </p>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="group relative p-8 rounded-3xl border border-white/5 bg-slate-900/35 backdrop-blur-md hover:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1.5"
              >
                {/* Background Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                
                <div className="space-y-5 relative z-10">
                  {/* Icon Wrapper */}
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <Icon size={22} className={item.iconColor} />
                  </div>
                  
                  {/* Title & Desc */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Accent Line */}
                <div className="w-full h-[2px] bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500 mt-6 transition-all duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
