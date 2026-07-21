'use client';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { mockBenefitsMovus } from '@/lib/mock-data-movus';

export function Benefits() {
  return (
    <section id="layanan" className="py-24 px-4 relative overflow-hidden bg-slate-950 text-white border-t border-slate-900">
      {/* Background Decor */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wider">
            <Gift className="w-3 h-3 inline-block mr-1" /> All-Inclusive Program
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Keuntungan Menakjubkan <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Yang Anda Dapatkan
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Kami menanggung seluruh biaya operasional penting. Anda cukup isi bensin dan nikmati perjalanan Anda dengan tenang.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBenefitsMovus.map((benefit, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/60 hover:border-blue-500/20 transition-all duration-300 flex flex-col gap-4"
            >
              {/* Icon Bubble */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Gradient border bottom */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom Callout banner */}
        <div className="mt-16 p-8 rounded-3xl border border-white/5 bg-slate-900/20 text-center max-w-3xl mx-auto">
          <p className="text-sm text-slate-300">
            * Seluruh syarat & ketentuan tertuang secara transparan di dalam akad kontrak sewa-beli legal yang disetujui di hadapan Notaris resmi. Tanpa biaya siluman tersembunyi.
          </p>
        </div>

      </div>
    </section>
  );
}
