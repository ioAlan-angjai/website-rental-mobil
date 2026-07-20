'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, LogOut, Globe, CheckCheck, CircleDot, ChevronDown, FileText, CheckCircle2, XCircle, Car, Clock, CreditCard, PartyPopper } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface AdminHeaderProps {
  onNavigate?: (tab: 'overview' | 'bookings' | 'cars' | 'drivers') => void;
}

function NotificationIcon({ type }: { type: string }) {
  const iconClass = "w-4 h-4 shrink-0";
  switch (type) {
    case 'BOOKING_CREATED':
    case 'BOOKING_CREATED_ADMIN':
      return <FileText className={cn(iconClass, "text-blue-400")} />;
    case 'PAYMENT_VERIFIED':
      return <CheckCircle2 className={cn(iconClass, "text-emerald-400")} />;
    case 'BOOKING_REJECTED':
      return <XCircle className={cn(iconClass, "text-rose-450")} />;
    case 'RENTAL_STARTED':
      return <Car className={cn(iconClass, "text-sky-400")} />;
    case 'RENTAL_NEAR_EXPIRY':
    case 'RENTAL_EXPIRED':
      return <Clock className={cn(iconClass, "text-orange-400")} />;
    case 'SETTLEMENT_DUE':
    case 'PAYMENT_RECEIVED':
      return <CreditCard className={cn(iconClass, "text-amber-400")} />;
    case 'RENTAL_COMPLETED':
      return <PartyPopper className={cn(iconClass, "text-indigo-400")} />;
    default:
      return <CreditCard className={cn(iconClass, "text-slate-500")} />;
  }
}

export function AdminHeader({ onNavigate }: AdminHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnread(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications for admin:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setLoadingNotifs(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // no id = mark all
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleNotifClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);
    if (onNavigate) {
      onNavigate('bookings');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 px-8 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-sky-400/10 backdrop-blur-md flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your rental fleet and orders</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={(o) => { setNotifOpen(o); if (o) fetchNotifications(); }}>
          <DropdownMenuTrigger className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer bg-transparent border-0 focus:outline-none">
            <Bell size={20} className={cn("transition-colors", unread > 0 ? "text-sky-400" : "text-slate-400 hover:text-sky-400")} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-h-[70vh] overflow-y-auto bg-slate-900 border border-slate-800 text-slate-200 mt-2 p-0 shadow-xl rounded-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 sticky top-0 bg-slate-900 z-10">
              <span className="font-bold text-white text-sm">Notifikasi Admin</span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loadingNotifs}
                  className="text-xs font-semibold text-slate-450 hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0"
                >
                  <CheckCheck size={13} /> Tandai dibaca
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={28} className="text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleNotifClick(item)}
                  className={cn(
                    'flex gap-3 px-4 py-3 border-b border-slate-800/30 cursor-pointer focus:bg-slate-800 focus:text-white transition-colors',
                    !item.isRead && 'bg-slate-800/30 font-medium'
                  )}
                >
                  <NotificationIcon type={item.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      {!item.isRead && (
                        <CircleDot size={8} className="text-sky-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-450 mt-0.5 leading-snug">{item.message}</p>
                    <span className="text-[9px] text-slate-500 block mt-1">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-all">
          <Settings size={20} className="text-slate-400 hover:text-sky-400 transition-colors" />
        </button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 pl-6 border-l border-slate-700 cursor-pointer focus:outline-none bg-transparent border-0 text-left">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-amber-400" />
            <div className="text-sm">
              <p className="font-semibold text-white flex items-center gap-1">
                Admin
                <ChevronDown size={14} className="text-slate-400" />
              </p>
              <p className="text-xs text-slate-400">Active</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-slate-900 border border-slate-800 text-slate-200 mt-2 p-1.5 shadow-xl rounded-2xl">
            <DropdownMenuItem 
              className="focus:bg-slate-800 focus:text-white text-slate-300 cursor-pointer rounded-xl px-3 py-2 flex items-center gap-2" 
              onClick={() => router.push('/')}
            >
              <Globe size={14} />
              <span>Lihat Website</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem 
              className="focus:bg-slate-800 focus:text-white text-red-405 focus:text-red-400 cursor-pointer rounded-xl px-3 py-2 flex items-center gap-2" 
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut size={14} />
              <span>Keluar (Logout)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
