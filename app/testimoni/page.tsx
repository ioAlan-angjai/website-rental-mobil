'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { mockTestimonialsJogja } from '@/lib/mock-data-jogja';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { motion } from 'framer-motion';

export default function TestimoniPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      <BackgroundOrnaments />

      {/* Header Banner */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-zinc-200 bg-white">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-zinc-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-950 transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-zinc-950 font-bold">Testimoni</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Testimoni Pelanggan
          </h1>
          <p className="text-zinc-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Dengar langsung pengalaman mereka yang telah mempercayakan perjalanan bersama kami
          </p>
        </div>
      </section>

      {/* Intro Card */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-zinc-200 text-center max-w-4xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={28} className="text-zinc-900" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 font-serif mb-4">
            Kepuasan Pelanggan Adalah Prioritas Kami
          </h2>
          <p className="text-zinc-650 max-w-2xl mx-auto leading-relaxed">
            Kami bangga melayani ribuan pelanggan dari berbagai daerah. Berikut sebagian testimoni mereka yang telah merasakan pelayanan terbaik RentalMobil Jogja.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTestimonialsJogja.map((t, idx) => {
            const initials = t.name.split(' ').map(n => n[0]).join('');
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx % 3 * 0.1, ease: "easeOut" }}
              >
                <div
                  className="group relative p-8 rounded-3xl bg-white border border-zinc-200 hover:border-zinc-900 transition-all duration-500 flex flex-col justify-between h-full hover:shadow-2xl hover:shadow-zinc-950/10 hover:-translate-y-2"
                >
                  {/* Quote Icon watermark */}
                  <Quote size={32} className="absolute top-6 right-6 text-zinc-200 group-hover:text-zinc-300 transition-colors duration-300" />

                  <div className="space-y-5">
                    {/* Rating Stars */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < t.rating
                              ? 'text-zinc-900 fill-zinc-900'
                              : 'text-zinc-200 fill-zinc-200'
                          }
                        />
                      ))}
                    </div>

                    {/* Testimony Text */}
                    <p className="text-zinc-700 text-base leading-relaxed">
                      {t.text}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 pt-6 border-t border-zinc-100 mt-6 shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-zinc-200">
                      <AvatarImage src={t.avatar} alt={t.name} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-750 font-bold text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-bold text-zinc-900 group-hover:text-zinc-950 transition-colors duration-300">{t.name}</p>
                      <p className="text-xs text-zinc-550 mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white border-t border-zinc-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-zinc-900 font-serif">
            Ingin Berbagi Pengalaman Anda?
          </h2>
          <p className="text-zinc-650 max-w-xl mx-auto leading-relaxed">
            Masukan dan testimoni Anda sangat berarti bagi kami untuk terus meningkatkan kualitas layanan
          </p>
          <div className="pt-4">
            <Link 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
                Hubungi Kami via WhatsApp
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
