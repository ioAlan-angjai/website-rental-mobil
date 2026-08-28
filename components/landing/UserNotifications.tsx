'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, CircleDot, FileText, CheckCircle2, XCircle, Car, Clock, CreditCard, PartyPopper } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

function NotificationIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4 shrink-0';
  switch (type) {
    case 'BOOKING_CREATED':
    case 'BOOKING_CREATED_ADMIN':
      return <FileText className={cn(cls, 'text-blue-400')} />;
    case 'PAYMENT_VERIFIED':
      return <CheckCircle2 className={cn(cls, 'text-emerald-400')} />;
    case 'BOOKING_REJECTED':
      return <XCircle className={cn(cls, 'text-rose-400')} />;
    case 'RENTAL_STARTED':
      return <Car className={cn(cls, 'text-sky-400')} />;
    case 'RENTAL_NEAR_EXPIRY':
    case 'RENTAL_EXPIRED':
      return <Clock className={cn(cls, 'text-orange-400')} />;
    case 'SETTLEMENT_DUE':
    case 'PAYMENT_RECEIVED':
      return <CreditCard className={cn(cls, 'text-amber-400')} />;
    case 'RENTAL_COMPLETED':
      return <PartyPopper className={cn(cls, 'text-indigo-400')} />;
    default:
      return <CreditCard className={cn(cls, 'text-white/40')} />;
  }
}

export function UserNotifications() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        setUnread(data.unreadCount || 0);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
      setUnread((prev) => Math.max(0, prev - 1));
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id }),
        });
      } catch { /* silent */ }
    }
    setOpen(false);
    router.push(item.link || '/riwayat-booking');
  };

  return (
    <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchNotifications(); }}>
      <DropdownMenuTrigger
        className="relative p-2.5 rounded-xl border border-[#2a2548] text-white/70 hover:bg-white/5 hover:text-white transition-all active:scale-95 bg-transparent cursor-pointer"
        aria-label="Notifikasi"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[70vh] overflow-y-auto bg-[#1b1838] border-[#2a2548] p-0"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2548] sticky top-0 bg-[#1b1838] z-10">
          <span className="font-bold text-white text-sm">Notifikasi</span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={loading}
              className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CheckCheck size={13} /> Tandai dibaca
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell size={28} className="text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">Belum ada notifikasi</p>
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'flex gap-3 px-4 py-3 border-b border-[#2a2548]/40 cursor-pointer focus:bg-[#13112a] hover:bg-[#13112a]/80 transition-colors rounded-none',
                !item.isRead && 'bg-[#f97316]/[0.04] font-medium'
              )}
            >
              <NotificationIcon type={item.type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-xs font-bold truncate', !item.isRead ? 'text-white' : 'text-white/60')}>
                    {item.title}
                  </p>
                  {!item.isRead && (
                    <CircleDot size={8} className="text-[#f97316] shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-white/50 mt-0.5 leading-snug">{item.message}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
