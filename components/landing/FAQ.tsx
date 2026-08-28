'use client';

import { useState } from 'react';
import { faqJogja } from '@/lib/site-content';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqJogja.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={cn(
              'rounded-xl border transition-all duration-300 overflow-hidden',
              isOpen ? 'border-[#f97316]/30 bg-[#1b1838]' : 'border-[#2a2548] bg-[#1b1838] hover:border-[#f97316]/20'
            )}
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-white transition-colors duration-300"
            >
              <span className="text-sm md:text-base">{faq.question}</span>
              <span className={cn(
                'p-1 rounded-lg shrink-0 transition-colors',
                isOpen ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#2a2548] text-white/50'
              )}>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            <div
              className={cn(
                'transition-all duration-300 ease-in-out px-5 overflow-hidden text-sm text-white/60 leading-relaxed',
                isOpen ? 'max-h-[300px] pb-5 border-t border-[#2a2548] pt-4' : 'max-h-0'
              )}
            >
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
