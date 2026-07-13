'use client';

import { useState } from 'react';
import { mockFAQS } from '@/lib/mock-data-movus';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-4 relative overflow-hidden bg-slate-950 text-white border-t border-slate-900">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wider">
            ❔ Pertanyaan Umum
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Tanya &{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Jawab
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Masih ragu mengenai cara kerja program Sewa Jadi Milik? Berikut penjelasan detailnya.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {mockFAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  'rounded-2xl border transition-all duration-300 overflow-hidden bg-slate-900/30',
                  isOpen ? 'border-blue-500/30 bg-slate-900/50' : 'border-white/5 hover:border-slate-800'
                )}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-white transition-colors duration-300"
                >
                  <span className="text-base md:text-lg">{faq.question}</span>
                  <span className="p-1 rounded-lg bg-slate-950 border border-white/5 text-blue-400 shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                
                {/* Expandable answer panel */}
                <div
                  className={cn(
                    'transition-all duration-300 ease-in-out px-6 overflow-hidden text-sm md:text-base text-slate-400 leading-relaxed',
                    isOpen ? 'max-h-[300px] pb-6 border-t border-slate-800/40 pt-4' : 'max-h-0'
                  )}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
