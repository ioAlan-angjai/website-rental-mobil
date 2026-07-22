'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, ExternalLink } from 'lucide-react';

export interface QuickOption {
  label: string;
  action: string;
  value?: string;
}

export interface MessageProps {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  options?: QuickOption[];
  whatsappUrl?: string;
  onOptionClick?: (option: QuickOption) => void;
}

export function ChatMessage({ sender, text, timestamp, options, whatsappUrl, onOptionClick }: MessageProps) {
  const isBot = sender === 'bot';

  return (
    <div className={cn('flex gap-2.5 items-start', !isBot && 'flex-row-reverse')}>
      {/* Avatar */}
      <Avatar className={cn(
        'w-8 h-8 shrink-0 border border-zinc-200 shadow-sm',
        isBot ? 'bg-zinc-900 text-white' : 'bg-blue-600 text-white'
      )}>
        <AvatarFallback className="bg-transparent text-xs font-bold">
          {isBot ? <Bot size={16} /> : <User size={16} />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1.5 max-w-[82%]', !isBot && 'items-end')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-line',
            isBot
              ? 'bg-white text-zinc-800 border border-zinc-200/80 rounded-tl-none'
              : 'bg-zinc-900 text-white rounded-tr-none font-medium'
          )}
        >
          {text}
        </div>

        {/* WhatsApp Link Button if escalation */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm w-fit"
          >
            Hubungi CS Via WhatsApp
            <ExternalLink size={14} />
          </a>
        )}

        {/* Quick Action Options */}
        {options && options.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onOptionClick && onOptionClick(opt)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 text-left"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-zinc-400 px-1">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
