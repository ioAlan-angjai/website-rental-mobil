// Booking Status Mapping — terpusat, mudah dibaca frontend & backend
// Database tetap pakai string English, display layer pakai mapping ini

export type BookingStatus =
  | "PENDING"
  | "WAITING_DP"
  | "DP_CONFIRMED"
  | "IN_PROGRESS"
  | "WAITING_RETURN"
  | "WAITING_PAYMENT"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
  dot: string;
  icon: string;
  step: number;
}

export const BOOKING_STATUS_MAP: Record<BookingStatus, StatusMeta> = {
  PENDING: {
    label: "Menunggu Verifikasi",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    icon: "Clock",
    step: 1,
  },
  WAITING_DP: {
    label: "Menunggu Pembayaran DP",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    dot: "bg-orange-400",
    icon: "CreditCard",
    step: 1,
  },
  DP_CONFIRMED: {
    label: "DP Terverifikasi",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    icon: "CheckCircle2",
    step: 2,
  },
  IN_PROGRESS: {
    label: "Sedang Digunakan",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    dot: "bg-sky-400",
    icon: "Car",
    step: 3,
  },
  WAITING_RETURN: {
    label: "Menunggu Pengembalian",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    dot: "bg-purple-400",
    icon: "RotateCcw",
    step: 3,
  },
  WAITING_PAYMENT: {
    label: "Menunggu Pelunasan",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    icon: "Receipt",
    step: 3,
  },
  COMPLETED: {
    label: "Selesai",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    icon: "PartyPopper",
    step: 4,
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "text-red-400",
    bg: "bg-red-500/10",
    dot: "bg-red-400",
    icon: "XCircle",
    step: 0,
  },
  REJECTED: {
    label: "Ditolak",
    color: "text-red-400",
    bg: "bg-red-500/10",
    dot: "bg-red-400",
    icon: "Ban",
    step: 0,
  },
};

export const STATUS_STEPS = [
  { key: "PENDING", label: "Verifikasi" },
  { key: "DP_CONFIRMED", label: "DP Dibayar" },
  { key: "IN_PROGRESS", label: "Mobil Digunakan" },
  { key: "COMPLETED", label: "Selesai" },
] as const;

export function getStatusMeta(status: string): StatusMeta {
  return BOOKING_STATUS_MAP[status as BookingStatus] || {
    label: status,
    color: "text-white/60",
    bg: "bg-white/5",
    dot: "bg-white/30",
    icon: "HelpCircle",
    step: 0,
  };
}

export function getActiveStep(status: string): number {
  return getStatusMeta(status).step;
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}
