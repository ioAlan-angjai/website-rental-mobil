'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Search, CircleDot, FileText, CheckCircle2, XCircle, Car, Clock, CreditCard, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function NotificationIcon({ type }: { type: string }) {
  const iconClass = "w-4 h-4 shrink-0";
  switch (type) {
    case 'BOOKING_CREATED': return <FileText className={cn(iconClass, "text-blue-500")} />;
    case 'PAYMENT_VERIFIED': return <CheckCircle2 className={cn(iconClass, "text-emerald-500")} />;
    case 'BOOKING_REJECTED': return <XCircle className={cn(iconClass, "text-red-500")} />;
    case 'RENTAL_STARTED': return <Car className={cn(iconClass, "text-sky-500")} />;
    case 'RENTAL_COMPLETED': return <PartyPopper className={cn(iconClass, "text-indigo-500")} />;
    default: return <CreditCard className={cn(iconClass, "text-muted-foreground")} />;
  }
}

export function AdminHeader({ searchQuery, onSearchChange }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnread(data.unreadCount || 0);
      }
    } catch (err) { }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (err) { }
  };

  return (
    <header className="flex h-14 lg:h-[60px] items-center justify-between gap-4 border-b bg-background px-6 pl-16 md:pl-6">
      <div className="flex-1" />

      {/* Notification Panel */}
      <DropdownMenu onOpenChange={(o) => { if (o) fetchNotifications(); }}>
        <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              >
                {unread}
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Notifikasi</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold text-sm">Notifikasi</span>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="h-auto p-0 text-xs text-primary">
                Tandai semua dibaca
              </Button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Tidak ada notifikasi baru
              </div>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem key={item.id} className="flex gap-3 p-3 cursor-pointer items-start">
                  <div className="mt-0.5">
                    <NotificationIcon type={item.type} />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-sm font-medium leading-none", !item.isRead && "text-primary")}>
                        {item.title}
                      </span>
                      {!item.isRead && <CircleDot className="h-2 w-2 text-primary fill-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{item.message}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
