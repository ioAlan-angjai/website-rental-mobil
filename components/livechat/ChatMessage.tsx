'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';

export interface MessageProps {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export function ChatMessage({ sender, text, timestamp }: MessageProps) {
  const isBot = sender === 'bot';

  return (
    <div className={cn('flex gap-3 items-start', !isBot && 'flex-row-reverse')}>
      
      {/* Avatar */}
      <Avatar className={cn(
        'w-8 h-8 shrink-0',
        isBot ? 'bg-zinc-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
      )}>
        <AvatarFallback className="bg-transparent">
          {isBot ? <Bot size={16} /> : <User size={16} />}
        </AvatarFallback>
      </Avatar>

      {/* Message Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[75%]', !isBot && 'items-end')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isBot
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'
              : 'bg-zinc-800 text-white rounded-tr-none'
          )}
        >
          {text}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 px-2">
          {timestamp}
        </span>
      </div>
    </div>
  );
}
