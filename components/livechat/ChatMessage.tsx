'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot, ExternalLink, UserCircle } from 'lucide-react';

export interface QuickOption {
  label: string;
  action: string;
  value?: string;
}

export interface MessageProps {
  sender: 'user' | 'bot' | 'admin';
  text: string;
  timestamp: string;
  options?: QuickOption[];
  whatsappUrl?: string;
  onOptionClick?: (option: QuickOption) => void;
}

export function ChatMessage({ sender, text, timestamp, options, whatsappUrl, onOptionClick }: MessageProps) {
  const isBot = sender === 'bot';
  const isAdmin = sender === 'admin';

  return (
    <div className={cn('flex gap-2 items-start', (isBot || isAdmin) ? '' : 'flex-row-reverse')}>
      {/* Avatar */}
      <Avatar className={cn(
        'w-7 h-7 md:w-8 md:h-8 shrink-0 border border-zinc-200 shadow-sm',
        isBot ? 'bg-zinc-900 text-white' : isAdmin ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-white'
      )}>
        <AvatarFallback className="bg-transparent text-xs font-bold">
          {isBot ? <Bot size={14} /> : isAdmin ? <UserCircle size={14} /> : <User size={14} />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 max-w-[85%] md:max-w-[75%]', (isBot || isAdmin) ? '' : 'items-end')}>
        {/* Label sender */}
        {isAdmin && (
          <span className="text-[10px] font-semibold text-blue-600 px-1">Admin CS</span>
        )}

        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-line',
            isBot
              ? 'bg-white text-zinc-800 border border-zinc-200/80 rounded-tl-none'
              : isAdmin
              ? 'bg-blue-600 text-white rounded-tl-none'
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
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm w-fit"
          >
            Hubungi CS Via WhatsApp
            <ExternalLink size={12} />
          </a>
        )}

        {/* Quick Action Options */}
        {options && options.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onOptionClick && onOptionClick(opt)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-[10px] font-semibold transition-all hover:scale-105 active:scale-95 text-left"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <span className="text-[9px] text-zinc-400 px-1">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
