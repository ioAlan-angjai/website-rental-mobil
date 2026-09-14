'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarCheck, Clock, TrendingUp, Car, 
  Wallet, AlertCircle, Users, 
  Key
} from 'lucide-react';
import { isToday, isThisMonth, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

// We can mock a SteeringWheel icon or use a different one from lucide-react if it doesn't exist. Let's use `CarFront` or `User` for driver.
import { CarFront, UserCheck } from 'lucide-react';

interface DashboardKPIsProps {
  bookings: any[];
  cars: any[];
  drivers: any[];
}

export function DashboardKPIs({ bookings, cars, drivers }: DashboardKPIsProps) {
  // KPI Calculations
  const totalBookings = bookings.length;
  
  const bookingsToday = bookings.filter(b => b.createdAt && isToday(parseISO(b.createdAt))).length;
  const bookingsThisMonth = bookings.filter(b => b.createdAt && isThisMonth(parseISO(b.createdAt))).length;

  const validRevenueStatuses = ['DP_CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
  
  const revenueToday = bookings
    .filter(b => b.createdAt && isToday(parseISO(b.createdAt)) && validRevenueStatuses.includes(b.status))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const revenueThisMonth = bookings
    .filter(b => b.createdAt && isThisMonth(parseISO(b.createdAt)) && validRevenueStatuses.includes(b.status))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const activeRentals = bookings.filter(b => b.status === 'IN_PROGRESS').length;
  const waitingVerification = bookings.filter(b => b.status === 'WAITING_DP' || b.status === 'PENDING').length;
  const waitingFinalPayment = bookings.filter(b => b.status === 'DP_CONFIRMED').length;

  const availableCars = cars.filter(c => c.status === 'AVAILABLE').length;
  const maintenanceCars = cars.filter(c => c.status === 'MAINTENANCE').length;

  const totalCustomers = new Set(bookings.map(b => b.guestName || b.userId)).size;

  const activeDrivers = drivers.filter(d => d.status === 'ON_DUTY').length;

  const kpis = [
    { title: 'Total Booking', value: totalBookings, icon: CalendarCheck },
    { title: 'Booking Today', value: bookingsToday, icon: Clock },
    { title: 'Booking This Month', value: bookingsThisMonth, icon: CalendarCheck },
    { title: 'Revenue Today', value: `Rp ${revenueToday.toLocaleString('id-ID')}`, icon: Wallet },
    { title: 'Revenue This Month', value: `Rp ${revenueThisMonth.toLocaleString('id-ID')}`, icon: TrendingUp },
    { title: 'Active Rentals', value: activeRentals, icon: Key },
    { title: 'Available Cars', value: availableCars, icon: Car },
    { title: 'In Maintenance', value: maintenanceCars, icon: AlertCircle },
    { title: 'Waiting Verify', value: waitingVerification, icon: AlertCircle },
    { title: 'Waiting Final Pay', value: waitingFinalPayment, icon: Wallet },
    { title: 'Total Customers', value: totalCustomers, icon: Users },
    { title: 'Active Drivers', value: activeDrivers, icon: UserCheck },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.03 }}
        >
          <div className="bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-1 sm:pb-2">
              <span className="text-[10px] sm:text-xs font-bold text-zinc-500 truncate">{kpi.title}</span>
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-zinc-100 border border-zinc-200/70 text-zinc-800 shrink-0 ml-1">
                <kpi.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-800" />
              </div>
            </div>
            <div className="text-sm sm:text-xl font-extrabold tracking-tight text-zinc-950 mt-1 truncate">{kpi.value}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
