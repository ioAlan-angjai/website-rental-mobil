'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import type { Car } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface CarDetailBookingProps {
  car: Car;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export function CarDetailBooking({
  car,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: CarDetailBookingProps) {
  const calculatePrice = () => {
    if (!dateFrom || !dateTo) return 0;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 0;
    const basePrice = car.pricePerDay * days;
    const discount = (basePrice * car.studentDiscount) / 100;
    return Math.max(0, basePrice - discount);
  };

  const rentalDays = dateFrom && dateTo
    ? Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = calculatePrice();
  const basePrice = dateFrom && dateTo ? car.pricePerDay * rentalDays : 0;
  const discount = car.studentDiscount > 0 ? basePrice * (car.studentDiscount / 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="sticky top-24 p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs"
    >
      <h3 className="text-xl font-bold text-foreground mb-6">Pesan Sekarang</h3>

      {/* Date Inputs */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Tanggal Mulai</label>
          <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
            <Calendar size={16} className="text-foreground/70" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="flex-1 bg-transparent text-foreground text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Tanggal Selesai</label>
          <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
            <Calendar size={16} className="text-foreground/70" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="flex-1 bg-transparent text-foreground text-xs font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Duration Info */}
      {rentalDays > 0 && (
        <div className="flex items-center gap-2 p-3 bg-secondary/40 border border-border rounded-xl mb-6 text-xs text-foreground font-semibold">
          <Clock size={16} className="text-foreground/70" />
          <span>Durasi Rental: {rentalDays} Hari</span>
        </div>
      )}

      {/* Price Breakdown */}
      {basePrice > 0 && (
        <div className="p-4 bg-background rounded-xl mb-6 space-y-2 text-xs border border-border">
          <div className="flex justify-between text-foreground/70">
            <span>Harga per hari:</span>
            <span>{formatCurrency(car.pricePerDay)}</span>
          </div>
          <div className="flex justify-between text-foreground/70">
            <span>Total ({rentalDays} hari):</span>
            <span>{formatCurrency(basePrice)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-foreground font-semibold pt-2 border-t border-border">
              <span>Diskon ({car.studentDiscount}%):</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-foreground font-bold text-sm pt-2 border-t border-border">
            <span>Total Bayar:</span>
            <span className="text-foreground font-black">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        disabled={!dateFrom || !dateTo}
        className="w-full py-3 bg-foreground text-background font-bold text-xs rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
      >
        {!dateFrom || !dateTo ? 'Pilih Tanggal Terlebih Dahulu' : 'Lanjut ke Pemesanan'}
      </button>

      {/* Info */}
      <p className="text-[11px] text-foreground/50 mt-4 text-center">
        Asuransi standar & bantuan operasional 24/7 termasuk.
      </p>
    </motion.div>
  );
}
