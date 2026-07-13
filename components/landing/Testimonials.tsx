'use client';

import { mockTestimonialsJogja } from '@/lib/mock-data-jogja';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Decor */}
      <div className="geometric-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-600/5 dark:bg-amber-600/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 uppercase tracking-wider">
            Testimoni Pelanggan
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Apa Kata <br />
            <span className="text-primary dark:text-blue-400">
              Pelanggan Kami
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
            Kepercayaan dan kepuasan pelanggan adalah prioritas utama kami
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTestimonialsJogja.map((t, idx) => {
            const initials = t.name.split(' ').map(n => n[0]).join('');
            return (
              <div
                key={idx}
                className="group relative p-7 rounded-3xl glass-card border-slate-200 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Quote Icon watermark */}
                <Quote size={28} className="absolute top-6 right-6 text-slate-200 dark:text-slate-800/60 group-hover:text-slate-300 dark:group-hover:text-slate-700 transition-colors duration-300" />

                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < t.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700 fill-slate-300 dark:fill-slate-700'
                        }
                      />
                    ))}
                  </div>

                  {/* Testimony Text */}
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {t.text}
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6 shrink-0">
                  <Avatar className="w-10 h-10 border-2 border-blue-200 dark:border-blue-900/40">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors duration-300">{t.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
