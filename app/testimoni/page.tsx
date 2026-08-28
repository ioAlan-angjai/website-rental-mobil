'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setTestimonials(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#13112a]">
      <Navbar />

      {/* Header Banner */}
      <section className="relative pt-28 pb-10 px-4 border-b border-[#2a2548]/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#f97316]/[0.02] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-xs text-white/40">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white font-bold">Testimoni</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Testimoni Pelanggan
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Dengar langsung pengalaman mereka yang telah mempercayakan perjalanan bersama kami di Yogyakarta
          </p>
        </div>
      </section>

      {/* Intro Card */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="bg-[#1b1838] p-8 md:p-12 rounded-2xl border border-[#2a2548] text-center max-w-4xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#13112a] border border-[#2a2548] flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={28} className="text-[#f97316]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Kepuasan Pelanggan Adalah Prioritas Kami
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto leading-relaxed">
            Kami bangga melayani ribuan pelanggan dari berbagai daerah. Berikut testimoni mereka yang telah merasakan pelayanan terbaik RentalMobil Jogja.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12 pb-20 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-60 rounded-2xl bg-[#1b1838]/60 border border-[#2a2548] animate-pulse p-6" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-sm">
            Belum ada testimoni di database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, idx) => {
              const initials = t.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2);

              return (
                <motion.div
                  key={t.id || idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
                >
                  <div className="group relative p-6 rounded-2xl bg-[#1b1838] border border-[#2a2548] hover:border-[#f97316]/30 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1">
                    <Quote size={28} className="absolute top-5 right-5 text-white/[0.04] group-hover:text-[#f97316]/10 transition-colors duration-300" />

                    <div className="space-y-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={15}
                            className={
                              i < t.rating
                                ? 'text-[#f97316] fill-[#f97316]'
                                : 'text-white/20 fill-white/20'
                            }
                          />
                        ))}
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed italic">
                        "{t.comment || t.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-5 border-t border-[#2a2548]/50 mt-5 shrink-0">
                      <Avatar className="w-10 h-10 border border-[#2a2548]">
                        {t.avatar && <AvatarImage src={t.avatar} alt={t.name} />}
                        <AvatarFallback className="bg-[#13112a] text-[#f97316] font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-white">{t.name}</p>
                        <p className="text-xs text-white/50 mt-0.5">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
