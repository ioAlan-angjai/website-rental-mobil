'use client';

import { stepsJogja } from '@/lib/site-content';
import { ArrowRight, Calendar, CreditCard, Car, Lightbulb } from 'lucide-react';

const STEP_ICONS = [Calendar, CreditCard, Car];

export function Steps() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-slate-950 text-white border-t border-slate-900">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-wider">
            <Lightbulb className="w-3 h-3 inline-block mr-1" /> Alur Pemesanan
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Cara Booking{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Sangat Mudah
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Proses cepat dan transparan. Ikuti 3 langkah sederhana untuk sewa mobil di Jogja.
          </p>
        </div>

        {/* Steps Horizontal / Grid Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-4 relative">
          
          {stepsJogja.map((step, idx) => {
            const Icon = STEP_ICONS[idx] || Car;
            return (
              <div key={idx} className="relative group">
                
                {/* Connector arrow (desktop only) */}
                {idx < stepsJogja.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-3 z-20 text-slate-700 group-hover:text-blue-500 transition-colors duration-300">
                    <ArrowRight size={18} />
                  </div>
                )}

                <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/35 hover:bg-slate-900/60 hover:border-blue-500/25 transition-all duration-300 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Number Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black bg-gradient-to-b from-blue-500/80 to-indigo-500/80 bg-clip-text text-transparent">
                        {step.number}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Icon size={16} />
                      </div>
                    </div>

                    {/* Step Title & Desc */}
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* bottom highlight line */}
                  <div className="h-[2px] w-12 bg-slate-800 group-hover:bg-blue-500 group-hover:w-full transition-all duration-350 mt-6" />
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
