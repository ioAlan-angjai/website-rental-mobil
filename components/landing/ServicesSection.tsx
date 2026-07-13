'use client';

import { mockServicesJogja } from '@/lib/mock-data-jogja';
import { Key, Users, Plane, CheckCircle } from 'lucide-react';

const SERVICE_ICONS = [Key, Users, Plane];

export function ServicesSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      {/* Background Decor */}
      <div className="geometric-glow top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Layanan Kami
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Pilih Layanan <br />
            <span className="text-[#C9A84C]">
              Sesuai Kebutuhan
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
            Kami menyediakan dua pilihan layanan untuk kenyamanan perjalanan Anda
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServicesJogja.map((service, idx) => {
            const Icon = SERVICE_ICONS[idx];
            return (
              <div
                key={idx}
                className="bento-card group"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={26} className="text-blue-700 dark:text-blue-400" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Price Note */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-[#C9A84C]">
                      {service.priceNote}
                    </p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2 pt-2">
                    {service.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <CheckCircle size={14} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-blue-600 to-[#C9A84C] opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
