'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { 
  CheckCircle2, AlertCircle, Clock, Wallet, 
  Car, XCircle, CalendarClock 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentActivityProps {
  bookings: any[];
}

export function RecentActivity({ bookings }: RecentActivityProps) {
  // Sort bookings by updatedAt or createdAt (newest first)
  const activities = [...bookings]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 10);

  const getActivityDetails = (booking: any) => {
    switch (booking.status) {
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-orange-500',
          bg: 'bg-orange-100/50',
          title: 'New Booking Request',
          description: `${booking.guestName || booking.user?.name} requested ${booking.car?.brand} ${booking.car?.name}`
        };
      case 'WAITING_DP':
      case 'PENDING_PAYMENT':
        return {
          icon: Wallet,
          color: 'text-yellow-500',
          bg: 'bg-yellow-100/50',
          title: 'Waiting for Payment',
          description: `Booking #${booking.id.slice(0, 8)} needs payment confirmation`
        };
      case 'DP_CONFIRMED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-500',
          bg: 'bg-emerald-100/50',
          title: 'Payment Confirmed',
          description: `DP verified for ${booking.guestName || booking.user?.name}`
        };
      case 'IN_PROGRESS':
        return {
          icon: Car,
          color: 'text-blue-500',
          bg: 'bg-blue-100/50',
          title: 'Car Picked Up',
          description: `${booking.car?.brand} ${booking.car?.name} is now on rent`
        };
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          color: 'text-zinc-500',
          bg: 'bg-zinc-100/50',
          title: 'Booking Completed',
          description: `Car returned by ${booking.guestName || booking.user?.name}`
        };
      case 'CANCELLED':
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-100/50',
          title: 'Booking Cancelled',
          description: `Booking #${booking.id.slice(0, 8)} was cancelled`
        };
      default:
        return {
          icon: CalendarClock,
          color: 'text-gray-500',
          bg: 'bg-gray-100/50',
          title: 'Booking Updated',
          description: `Status changed to ${booking.status}`
        };
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs text-zinc-950 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-extrabold text-zinc-950">Aktivitas Terbaru</h3>
        <p className="text-xs text-zinc-500">Log perubahan status dan transaksi sewa terkini</p>
      </div>
      <div className="h-[340px] overflow-y-auto pr-2 divide-y divide-zinc-100">
        {activities.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-400">
            Belum ada aktivitas baru tercatat.
          </div>
        ) : (
          activities.map((booking, idx) => {
            const details = getActivityDetails(booking);
            const dateObj = parseISO(booking.updatedAt || booking.createdAt);

            return (
              <motion.div 
                key={`${booking.id}-${booking.updatedAt}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="py-3 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 shrink-0 mt-0.5">
                  <details.icon className="w-4 h-4 text-zinc-800" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-900 truncate">{details.title}</p>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {formatDistanceToNow(dateObj, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{details.description}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
