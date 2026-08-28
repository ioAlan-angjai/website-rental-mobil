'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Car, Wrench, CheckCircle, Key } from 'lucide-react';

interface FleetSummaryProps {
  cars: any[];
  bookings: any[];
}

export function FleetSummary({ cars, bookings }: FleetSummaryProps) {
  const totalCars = cars.length || 1; // Prevent division by zero

  const available = cars.filter(c => c.status === 'AVAILABLE').length;
  const maintenance = cars.filter(c => c.status === 'MAINTENANCE').length;
  
  // Booked but not picked up (DP_CONFIRMED)
  // Rented out (IN_PROGRESS)
  const reserved = bookings.filter(b => b.status === 'DP_CONFIRMED').length;
  const rented = bookings.filter(b => b.status === 'IN_PROGRESS').length;

  // Let's normalize percentages (sometimes reserved + rented > totalCars if booking isn't 1:1 tied to car status yet)
  const calculatePercentage = (val: number) => Math.min(100, Math.round((val / totalCars) * 100));

  const items = [
    { label: 'Tersedia', value: available, percent: calculatePercentage(available), icon: CheckCircle, color: 'bg-zinc-900', textColor: 'text-zinc-900' },
    { label: 'Sedang Disewa', value: rented, percent: calculatePercentage(rented), icon: Key, color: 'bg-zinc-700', textColor: 'text-zinc-700' },
    { label: 'Dipesan (DP)', value: reserved, percent: calculatePercentage(reserved), icon: Car, color: 'bg-zinc-500', textColor: 'text-zinc-500' },
    { label: 'Servis / Perawatan', value: maintenance, percent: calculatePercentage(maintenance), icon: Wrench, color: 'bg-zinc-400', textColor: 'text-zinc-400' },
  ];

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs text-zinc-950 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-extrabold text-zinc-950">Ringkasan Armada</h3>
        <p className="text-xs text-zinc-500">Status ketersediaan seluruh unit mobil</p>
      </div>
      <div className="space-y-5 mt-1">
        {items.map((item, idx) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <item.icon className={`w-4 h-4 ${item.textColor}`} />
                <span className="font-bold text-zinc-800">{item.label}</span>
              </div>
              <span className="text-zinc-500 font-bold">{item.value} Unit ({item.percent}%)</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.percent}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`h-full ${item.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
