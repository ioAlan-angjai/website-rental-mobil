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
              'rounded-2xl border transition-all duration-300 overflow-hidden bg-[#FFFFFF]',
              isOpen
                ? 'border-[#1A1A1A] shadow-sm'
                : 'border-[#D7CDCC] hover:border-[#BFB3B1]'
            )}
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-[#1A1A1A] transition-colors cursor-pointer bg-transparent border-0"
            >
              <span className="text-sm md:text-base leading-snug">{faq.question}</span>
              <span className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                isOpen ? 'bg-[#1A1A1A] text-[#F8F7F6]' : 'bg-[#F8F7F6] text-[#756A68]'
              )}>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            <div
              className={cn(
                'transition-all duration-300 ease-in-out px-6 overflow-hidden text-xs md:text-sm text-[#504745] leading-relaxed',
                isOpen ? 'max-h-[300px] pb-5 border-t border-[#F0E6E4] pt-3.5' : 'max-h-0'
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

