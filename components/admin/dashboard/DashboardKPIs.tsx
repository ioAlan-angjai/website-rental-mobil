'use client';

import { isToday, isThisMonth, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

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
    { title: 'Total Booking', value: totalBookings },
    { title: 'Booking Today', value: bookingsToday },
    { title: 'Booking This Month', value: bookingsThisMonth },
    { title: 'Revenue Today', value: `Rp ${revenueToday.toLocaleString('id-ID')}` },
    { title: 'Revenue This Month', value: `Rp ${revenueThisMonth.toLocaleString('id-ID')}` },
    { title: 'Active Rentals', value: activeRentals },
    { title: 'Available Cars', value: availableCars },
    { title: 'In Maintenance', value: maintenanceCars },
    { title: 'Waiting Verify', value: waitingVerification },
    { title: 'Waiting Final Pay', value: waitingFinalPayment },
    { title: 'Total Customers', value: totalCustomers },
    { title: 'Active Drivers', value: activeDrivers },
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
          <div className="bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full min-h-[92px]">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 leading-snug whitespace-normal">
              {kpi.title}
            </span>
            <div className="text-base sm:text-xl font-extrabold tracking-tight text-zinc-950 mt-2 break-words">
              {kpi.value}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
