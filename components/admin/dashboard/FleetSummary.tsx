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
    { label: 'Available', value: available, percent: calculatePercentage(available), icon: CheckCircle, color: 'bg-teal-500', textColor: 'text-teal-500' },
    { label: 'Rented', value: rented, percent: calculatePercentage(rented), icon: Key, color: 'bg-amber-500', textColor: 'text-amber-500' },
    { label: 'Reserved', value: reserved, percent: calculatePercentage(reserved), icon: Car, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { label: 'Maintenance', value: maintenance, percent: calculatePercentage(maintenance), icon: Wrench, color: 'bg-red-500', textColor: 'text-red-500' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fleet Summary</CardTitle>
        <CardDescription>Current status of all vehicles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 mt-2">
          {items.map((item, idx) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.textColor}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="text-muted-foreground font-medium">{item.value} ({item.percent}%)</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full ${item.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
