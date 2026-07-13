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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="sticky top-24 p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-sky-400/20 backdrop-blur-md"
    >
      <h3 className="text-2xl font-bold text-white mb-6">Pesan Sekarang</h3>

      {/* Date Inputs */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Tanggal Mulai</label>
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg">
            <Calendar size={18} className="text-sky-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="flex-1 bg-transparent text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Tanggal Berakhir</label>
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg">
            <Calendar size={18} className="text-sky-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="flex-1 bg-transparent text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Duration Info */}
      {rentalDays > 0 && (
        <div className="flex items-center gap-2 p-3 bg-sky-500/10 border border-sky-400/20 rounded-lg mb-6">
          <Clock size={18} className="text-sky-400" />
          <span className="text-sm text-slate-300">Durasi: {rentalDays} hari</span>
        </div>
      )}

      {/* Price Breakdown */}
      {basePrice > 0 && (
        <div className="p-4 bg-slate-700/20 rounded-lg mb-6 space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Harga per hari:</span>
            <span>{formatCurrency(car.pricePerDay)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Total ({rentalDays} hari):</span>
            <span>{formatCurrency(basePrice)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-400 pt-2 border-t border-slate-600/50">
              <span>Diskon Mahasiswa ({car.studentDiscount}%):</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-slate-600/50">
            <span>Total Bayar:</span>
            <span className="bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!dateFrom || !dateTo}
        className="w-full py-3 bg-gradient-to-r from-sky-400 to-amber-400 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-sky-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {!dateFrom || !dateTo ? 'Pilih Tanggal Terlebih Dahulu' : 'Lanjut ke Checkout'}
      </motion.button>

      {/* Info */}
      <p className="text-xs text-slate-500 mt-4 text-center">
        Asuransi comprehensive & roadside assistance termasuk
      </p>
    </motion.div>
  );
}
