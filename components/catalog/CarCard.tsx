'use client';

import { Users, Zap, Fuel, Gauge, ArrowRight, Car as CarIcon, GraduationCap } from 'lucide-react';
import type { Car } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CarCardProps {
  car: Car;
}

const CATEGORY_CONFIG: Record<string, { style: string; label: string }> = {
  mpv: { style: 'bg-card text-foreground border-border', label: 'MPV' },
  suv: { style: 'bg-card text-foreground border-border', label: 'SUV' },
  city_car: { style: 'bg-card text-foreground border-border', label: 'City Car' },
  hatchback: { style: 'bg-card text-foreground border-border', label: 'Hatchback' },
  luxury: { style: 'bg-foreground text-background border-foreground', label: 'Luxury' },
  pickup: { style: 'bg-card text-foreground border-border', label: 'Pickup' },
  minibus: { style: 'bg-card text-foreground border-border', label: 'Minibus' },
  elf: { style: 'bg-card text-foreground border-border', label: 'Minibus' },
  sedan: { style: 'bg-foreground text-background border-foreground', label: 'Luxury' },
  economy: { style: 'bg-card text-foreground border-border', label: 'City Car' },
  comfort: { style: 'bg-card text-foreground border-border', label: 'MPV' },
  premium: { style: 'bg-foreground text-background border-foreground', label: 'Luxury' },
};

const SPEC_ITEMS = (car: Car) => [
  { icon: Users, value: `${car.seats} penumpang` },
  { icon: Zap, value: car.transmission },
  { icon: Fuel, value: car.fuelType },
  { icon: Gauge, value: `${(car.mileage / 1000).toFixed(0)}k km` },
];

export function CarCard({ car }: CarCardProps) {
  const normKey = (car.category || '').toLowerCase().replace(/[- ]/g, '_');
  const cat = CATEGORY_CONFIG[normKey] ?? {
    style: 'bg-card text-foreground border-border',
    label: (car.category || 'Armada').toUpperCase(),
  };

  return (
    <div className="car-card group flex flex-col h-full rounded-xl sm:rounded-2xl border border-border overflow-hidden bg-card shadow-xs hover:border-foreground/30 hover:shadow-md transition-all duration-300">

      {/* Image */}
      <div className="relative w-full h-28 xs:h-36 sm:h-48 bg-muted overflow-hidden shrink-0">
        {car.images?.[0] ? (
          <>
            <img
              src={car.images[0]}
              alt={car.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <CarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-foreground/30" />
            <span className="text-foreground/60 text-[10px] sm:text-xs font-medium">{car.name}</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span
            className={cn(
              'inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-bold border shadow-xs',
              cat.style,
            )}
          >
            {cat.label}
          </span>
        </div>

        {/* Student discount badge */}
        {car.studentDiscount > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-xs font-bold bg-background/90 text-foreground border border-border shadow-xs backdrop-blur-xs">
              <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> -{car.studentDiscount}%
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col p-2.5 sm:p-5">
        {/* Title */}
        <div className="mb-2 sm:mb-4">
          <h3 className="font-bold text-xs sm:text-base text-foreground leading-tight line-clamp-1">{car.name}</h3>
          <p className="text-[9px] sm:text-xs text-foreground/50 mt-0.5 truncate">
            {car.model} &bull; {car.year}
          </p>
        </div>

        {/* Specs 2×2 */}
        <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-2 sm:mb-4 p-1.5 sm:p-3 bg-background rounded-lg sm:rounded-xl border border-border/70">
          {SPEC_ITEMS(car).map(({ icon: Icon, value }, i) => (
            <div key={i} className="flex items-center gap-1 sm:gap-2">
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground/70 shrink-0" />
              <span className="text-[9px] sm:text-[11px] text-foreground/80 truncate font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-border">
          <div className="flex items-baseline gap-0.5 sm:gap-1 mb-2 sm:mb-3">
            <span className="text-xs xs:text-sm sm:text-xl font-extrabold text-foreground">
              {formatCurrency(car.pricePerDay)}
            </span>
            <span className="text-[8px] sm:text-xs text-foreground/50 font-medium">/hari</span>
          </div>

          <Link href={`/booking?carId=${car.id}`}>
            <button className="w-full flex items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2.5 px-2 sm:px-4 bg-foreground text-background font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl hover:bg-foreground/90 transition-all shadow-xs cursor-pointer">
              <span>Pesan</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
