'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const TESTIMONIALS = [
  {
    name: 'Budi Santoso',
    role: 'Mahasiswa UGM',
    avatar: 'BS',
    rating: 5,
    text: 'Proses bookingnya super cepat, cuma 5 menit! Diskon mahasiswanya bikin kantong aman. Sudah 3 kali sewa di sini dan selalu puas.',
    color: 'sky',
  },
  {
    name: 'Siti Nurhaliza',
    role: 'Mahasiswi UII',
    avatar: 'SN',
    rating: 5,
    text: 'Mobilnya terawat semua, bersih dan wangi. Customer service-nya ramah banget, respon cepat lewat WhatsApp. Recommended!',
    color: 'amber',
  },
  {
    name: 'Raka Wijaya',
    role: 'Mahasiswa UNY',
    avatar: 'RW',
    rating: 5,
    text: 'Harga paling terjangkau dibanding rental lain di Jogja. Bisa antar-jemput gratis lagi. Cocok banget buat mahasiswa!',
    color: 'emerald',
  },
  {
    name: 'Maya Putri',
    role: 'Mahasiswi UAD',
    avatar: 'MP',
    rating: 4,
    text: 'Sewa Innova buat mudik bareng temen, perjalanan lancar dan nyaman. Sistemnya transparan, nggak ada biaya tersembunyi.',
    color: 'rose',
  },
];

const AVATAR_COLORS: Record<string, string> = {
  sky: 'from-sky-400 to-cyan-400',
  amber: 'from-amber-400 to-orange-400',
  emerald: 'from-emerald-400 to-teal-400',
  rose: 'from-rose-400 to-pink-400',
};

const BORDER_COLORS: Record<string, string> = {
  sky: 'hover:border-sky-400/30',
  amber: 'hover:border-amber-400/30',
  emerald: 'hover:border-emerald-400/30',
  rose: 'hover:border-rose-400/30',
};

export function Testimonials() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-400/10 border border-amber-400/20 text-amber-300 mb-4">
            💬 Kata Mereka
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Dipercaya{' '}
            <span className="bg-gradient-to-r from-amber-400 to-sky-400 bg-clip-text text-transparent">
              5000+ Mahasiswa
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Bergabung dengan ribuan mahasiswa Yogyakarta yang sudah merasakan layanan premium kami.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={fadeUp}>
              <div
                className={`group relative p-7 rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm
                  ${BORDER_COLORS[t.color]} hover:bg-slate-800/50 transition-all duration-500 h-full`}
              >
                {/* Quote icon */}
                <Quote
                  size={32}
                  className="absolute top-6 right-7 text-slate-700/40 group-hover:text-slate-600/60 transition-colors duration-300"
                />

                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < t.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600 fill-slate-600'
                      }
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[t.color]} flex items-center justify-center`}
                  >
                    <span className="text-xs font-black text-slate-900">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
