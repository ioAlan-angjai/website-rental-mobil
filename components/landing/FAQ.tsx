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
    <div className="space-y-3">
      {mockFAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={cn(
              'rounded-xl border transition-all duration-300 overflow-hidden',
              isOpen ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300 bg-white'
            )}
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 transition-colors duration-300"
            >
              <span className="text-sm md:text-base">{faq.question}</span>
              <span className={cn(
                'p-1 rounded-lg shrink-0 transition-colors',
                isOpen ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-100 text-zinc-400'
              )}>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            <div
              className={cn(
                'transition-all duration-300 ease-in-out px-5 overflow-hidden text-sm text-zinc-600 leading-relaxed',
                isOpen ? 'max-h-[300px] pb-5 border-t border-zinc-100 pt-4' : 'max-h-0'
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
