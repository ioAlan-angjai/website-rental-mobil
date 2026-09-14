'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setTestimonials(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F2F1] text-[#1A1A1A]">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1A1A1A] tracking-tight mb-4">
            Cerita &amp; Pengalaman Pelanggan
          </h1>
          <p className="text-[#504745] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Dengar langsung ulasan jujur dari wisatawan, profesional, dan keluarga yang telah mempercayakan perjalanannya kepada RentalMobil Jogja.
          </p>
        </motion.div>
      </section>

      {/* Testimonials Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 sm:h-64 rounded-2xl sm:rounded-3xl bg-[#FFFFFF] border border-[#D7CDCC] animate-pulse p-4 sm:p-6" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16 text-[#756A68] text-sm bg-[#FFFFFF] border border-[#D7CDCC] rounded-3xl max-w-lg mx-auto p-8">
            <p className="font-semibold text-[#1A1A1A] mb-1">Belum Ada Ulasan</p>
            <p className="text-xs text-[#756A68]">Ulasan pelanggan akan segera ditampilkan di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {testimonials.map((t, idx) => {
              const initials = (t.name || 'User')
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
                  transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
                  className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2.5 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5 sm:gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={
                              i < (t.rating || 5)
                                ? 'text-amber-400 fill-amber-400 sm:w-3.5 sm:h-3.5'
                                : 'text-[#E3DDDC] fill-[#E3DDDC] sm:w-3.5 sm:h-3.5'
                            }
                          />
                        ))}
                      </div>
                      <Quote size={16} className="text-[#D7CDCC] sm:w-5 sm:h-5 shrink-0" />
                    </div>

                    <p className="text-[10px] sm:text-sm text-[#2B2322] leading-relaxed italic line-clamp-4 sm:line-clamp-none">
                      &ldquo;{t.comment || t.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-5 border-t border-[#F0E6E4] mt-3 sm:mt-5">
                    <Avatar className="w-7 h-7 sm:w-10 sm:h-10 border border-[#D7CDCC] shrink-0">
                      {t.avatar && <AvatarImage src={t.avatar} alt={t.name} />}
                      <AvatarFallback className="bg-[#F8F7F6] text-[#1A1A1A] font-bold text-[10px] sm:text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm font-bold text-[#1A1A1A] truncate">{t.name}</p>
                      <p className="text-[9px] sm:text-[11px] text-[#756A68] truncate">{t.role || 'Pelanggan Terverifikasi'}</p>
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

