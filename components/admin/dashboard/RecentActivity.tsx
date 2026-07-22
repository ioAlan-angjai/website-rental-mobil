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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {activities.map((booking, idx) => {
              const details = getActivityDetails(booking);
              const dateObj = parseISO(booking.updatedAt || booking.createdAt);
              
              return (
                <motion.div 
                  key={`${booking.id}-${booking.updatedAt}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className={`p-2 rounded-full mt-1 ${details.bg}`}>
                    <details.icon className={`w-4 h-4 ${details.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{details.title}</p>
                    <p className="text-sm text-muted-foreground">{details.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(dateObj, { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
