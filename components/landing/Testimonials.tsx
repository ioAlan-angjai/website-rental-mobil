'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTestimonials(res.data.slice(0, 6));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-[#13112a] border-t border-[#2a2548]/50">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f97316]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 uppercase tracking-wider">
            <MessageSquare size={13} /> Testimoni Nyata
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Apa Kata <br />
            <span className="text-[#f97316]">
              Pelanggan Kami
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-base">
            Kepercayaan dan kepuasan pelanggan adalah prioritas utama setiap layanan kami.
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-[#1b1838]/60 border border-[#2a2548] animate-pulse p-7" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-sm">
            Belum ada ulasan saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => {
              const initials = t.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2);

              return (
                <motion.div
                  key={t.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative p-7 rounded-3xl bg-[#1b1838] border border-[#2a2548] hover:border-[#f97316]/40 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f97316]/5"
                >
                  <Quote size={28} className="absolute top-6 right-6 text-[#2a2548] group-hover:text-[#f97316]/30 transition-colors duration-300" />

                  <div className="space-y-4">
                    {/* Rating Stars */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < t.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-[#2a2548] fill-[#2a2548]'
                          }
                        />
                      ))}
                    </div>

                    {/* Testimony Text */}
                    <p className="text-white/80 text-sm leading-relaxed italic">
                      "{t.comment}"
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 pt-6 mt-4 border-t border-[#2a2548]">
                    <Avatar className="w-10 h-10 border border-[#2a2548]">
                      {t.avatar && <AvatarImage src={t.avatar} alt={t.name} />}
                      <AvatarFallback className="bg-[#13112a] text-[#f97316] text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {t.name}
                      </h4>
                      <p className="text-xs text-white/40 mt-0.5">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
