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
      return <FileText className={cn(cls, 'text-[#1A1A1A]')} />;
    case 'PAYMENT_VERIFIED':
      return <CheckCircle2 className={cn(cls, 'text-emerald-600')} />;
    case 'BOOKING_REJECTED':
      return <XCircle className={cn(cls, 'text-rose-600')} />;
    case 'RENTAL_STARTED':
      return <Car className={cn(cls, 'text-[#1A1A1A]')} />;
    case 'RENTAL_NEAR_EXPIRY':
    case 'RENTAL_EXPIRED':
      return <Clock className={cn(cls, 'text-amber-600')} />;
    case 'SETTLEMENT_DUE':
    case 'PAYMENT_RECEIVED':
      return <CreditCard className={cn(cls, 'text-emerald-600')} />;
    case 'RENTAL_COMPLETED':
      return <PartyPopper className={cn(cls, 'text-indigo-600')} />;
    default:
      return <CreditCard className={cn(cls, 'text-[#756A68]')} />;
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
        className="relative p-2 rounded-full border border-[#D7CDCC] text-[#1A1A1A] bg-[#FFFFFF] hover:bg-[#F8F7F6] transition-all active:scale-95 cursor-pointer outline-none shadow-sm"
        aria-label="Notifikasi"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#1A1A1A] text-[#F8F7F6] text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[70vh] overflow-y-auto bg-[#FFFFFF] border border-[#D7CDCC] p-0 shadow-xl rounded-2xl mt-1"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3DDDC] sticky top-0 bg-[#FFFFFF] z-10">
          <span className="font-bold text-[#1A1A1A] text-xs">Notifikasi</span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={loading}
              className="text-[11px] font-semibold text-[#756A68] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0"
            >
              <CheckCheck size={13} /> Tandai dibaca
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell size={24} className="text-[#BFB3B1] mx-auto mb-2" />
            <p className="text-xs text-[#756A68]">Belum ada notifikasi</p>
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'flex gap-3 px-4 py-3 border-b border-[#F0E6E4] cursor-pointer focus:bg-[#F8F7F6] hover:bg-[#F8F7F6] transition-colors rounded-none',
                !item.isRead && 'bg-[#F8F2F1]/80 font-medium'
              )}
            >
              <div className="p-1.5 rounded-lg bg-[#F8F7F6] border border-[#E3DDDC] shrink-0 self-start mt-0.5">
                <NotificationIcon type={item.type} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-xs font-bold truncate', !item.isRead ? 'text-[#1A1A1A]' : 'text-[#504745]')}>
                    {item.title}
                  </p>
                  {!item.isRead && (
                    <CircleDot size={8} className="text-[#1A1A1A] shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[#756A68] mt-0.5 leading-snug line-clamp-2">{item.message}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

