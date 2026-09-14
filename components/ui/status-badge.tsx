'use client';

import { cn } from '@/lib/utils';

type BookingStatus =
  | 'PENDING'
  | 'WAITING_DP'
  | 'DP_UPLOADED'
  | 'DP_CONFIRMED'
  | 'IN_PROGRESS'
  | 'WAITING_RETURN'
  | 'WAITING_PELUNASAN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REJECTED';

type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

const bookingStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Menunggu',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  WAITING_DP: {
    label: 'Menunggu DP',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  DP_UPLOADED: {
    label: 'DP Diupload',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  DP_CONFIRMED: {
    label: 'DP Dikonfirmasi',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  IN_PROGRESS: {
    label: 'Sedang Berjalan',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  WAITING_RETURN: {
    label: 'Menunggu Pengembalian',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  WAITING_PELUNASAN: {
    label: 'Menunggu Pelunasan',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  COMPLETED: {
    label: 'Selesai',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  EXPIRED: {
    label: 'Kedaluwarsa',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  REJECTED: {
    label: 'Ditolak',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Menunggu Verifikasi',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  VERIFIED: {
    label: 'Terverifikasi',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Ditolak',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'payment';
  className?: string;
  size?: 'sm' | 'default';
}

export function StatusBadge({
  status,
  type = 'booking',
  className,
  size = 'default',
}: StatusBadgeProps) {
  const config = type === 'payment'
    ? paymentStatusConfig[status]
    : bookingStatusConfig[status];

  if (!config) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border-gray-200",
        size === 'sm' && "px-2 py-px text-[10px]",
        className
      )}>
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        size === 'sm' && "px-2 py-px text-[10px]",
        className
      )}
    >
      {config.label}
    </span>
  );
}
