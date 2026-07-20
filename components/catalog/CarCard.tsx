'use client';

import { Users, Zap, Fuel, Gauge, ArrowRight, Car as CarIcon } from 'lucide-react';
import type { Car } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
}

const CATEGORY_CONFIG: Record<string, { style: string; label: string; dot: string }> = {
  economy: {
    style: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300',
    label: 'Economy',
    dot: 'bg-emerald-400',
  },
  comfort: {
    style: 'bg-sky-500/10 border-sky-400/30 text-sky-300',
    label: 'Comfort',
    dot: 'bg-sky-400',
  },
  premium: {
    style: 'bg-amber-500/10 border-amber-400/30 text-amber-300',
    label: 'Premium',
    dot: 'bg-amber-400',
  },
};

const SPEC_ITEMS = (car: Car) => [
  { icon: Users, color: 'text-sky-400', value: `${car.seats} penumpang` },
  { icon: Zap, color: 'text-amber-400', value: car.transmission },
  { icon: Fuel, color: 'text-sky-400', value: car.fuelType },
  { icon: Gauge, color: 'text-amber-400', value: `${(car.mileage / 1000).toFixed(0)}k km` },
];

export function CarCard({ car }: CarCardProps) {
  const cat = CATEGORY_CONFIG[car.category] ?? CATEGORY_CONFIG.premium;

  return (
    <div className="car-card group flex flex-col h-full rounded-2xl border border-slate-700/50 overflow-hidden bg-slate-800/50">

      {/* Image */}
      <div className="relative w-full h-52 bg-gradient-to-br from-slate-700/60 to-slate-800/80 overflow-hidden shrink-0">
        {car.images?.[0] ? (
          <>
            <img
              src={car.images[0]}
              alt={car.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <CarIcon className="w-12 h-12 text-slate-550" />
            <span className="text-slate-400 text-sm font-medium">{car.name}</span>
          </div>
        )}

        {/* Category badge — overlaid on image */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm',
              cat.style,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', cat.dot)} />
            {cat.label}
          </span>
        </div>

        {/* Student discount badge */}
        {car.studentDiscount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 backdrop-blur-sm">
              🎓 -{car.studentDiscount}%
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col p-5">
        {/* Title */}
        <div className="mb-4">
          <h3 className="font-black text-lg text-white leading-tight">{car.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {car.model} · {car.year}
          </p>
        </div>

        {/* Specs 2×2 */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-3.5 bg-slate-700/30 rounded-xl border border-slate-600/20">
          {SPEC_ITEMS(car).map(({ icon: Icon, color, value }, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon size={14} className={cn(color, 'shrink-0')} />
              <span className="text-xs text-slate-300 truncate">{value}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-2xl font-black bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">
              {formatCurrency(car.pricePerDay)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/hari</span>
          </div>

          {/* CTA Button */}
          <button className="w-full group/btn flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-sky-400 to-amber-400 text-slate-900 font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-sky-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Pesan Sekarang
            <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}
