'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, CircleDot, FileText, CheckCircle2, XCircle, Car, Clock, CreditCard, PartyPopper } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
  const iconClass = "w-4 h-4 shrink-0";
  switch (type) {
    case 'BOOKING_CREATED':
    case 'BOOKING_CREATED_ADMIN':
      return <FileText className={cn(iconClass, "text-blue-500")} />;
    case 'PAYMENT_VERIFIED':
      return <CheckCircle2 className={cn(iconClass, "text-emerald-500")} />;
    case 'BOOKING_REJECTED':
      return <XCircle className={cn(iconClass, "text-rose-500")} />;
    case 'RENTAL_STARTED':
      return <Car className={cn(iconClass, "text-sky-500")} />;
    case 'RENTAL_NEAR_EXPIRY':
    case 'RENTAL_EXPIRED':
      return <Clock className={cn(iconClass, "text-orange-500")} />;
    case 'SETTLEMENT_DUE':
    case 'PAYMENT_RECEIVED':
      return <CreditCard className={cn(iconClass, "text-amber-500")} />;
    case 'RENTAL_COMPLETED':
      return <PartyPopper className={cn(iconClass, "text-indigo-500")} />;
    default:
      return <CreditCard className={cn(iconClass, "text-zinc-550")} />;
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
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh tiap 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // no id = mark all
      });
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnread(0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    // Mark read locally immediately for snappy UX
    if (!item.isRead) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
      setUnread((prev) => Math.max(0, prev - 1));
      // Persist to DB so it stays read across page navigations
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id }),
        });
      } catch {
        // silent — local state already updated
      }
    }

    setOpen(false);

    if (item.link) {
      router.push(item.link);
    } else if (item.type === 'SETTLEMENT_DUE') {
      router.push('/riwayat-booking');
    } else {
      router.push('/riwayat-booking');
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchNotifications(); }}>
      <DropdownMenuTrigger
        className="relative p-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-all duration-200 active:scale-95 bg-transparent cursor-pointer"
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
        className="w-80 max-h-[70vh] overflow-y-auto bg-white border-zinc-200 p-0"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 sticky top-0 bg-white z-10">
          <span className="font-bold text-zinc-900 text-sm">Notifikasi</span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={loading}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CheckCheck size={13} /> Tandai dibaca
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell size={28} className="text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">Belum ada notifikasi</p>
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'flex gap-3 px-4 py-3 border-b border-zinc-50 cursor-pointer focus:bg-zinc-100 hover:bg-zinc-50 transition-colors',
                !item.isRead && 'bg-zinc-50/80 font-medium'
              )}
            >
              <NotificationIcon type={item.type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-zinc-900 truncate">{item.title}</p>
                  {!item.isRead && (
                    <CircleDot size={8} className="text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug">{item.message}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
