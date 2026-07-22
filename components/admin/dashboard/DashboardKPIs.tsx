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
    { title: 'Total Booking', value: totalBookings, icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-100/50' },
    { title: 'Booking Today', value: bookingsToday, icon: Clock, color: 'text-cyan-500', bg: 'bg-cyan-100/50' },
    { title: 'Booking This Month', value: bookingsThisMonth, icon: CalendarCheck, color: 'text-indigo-500', bg: 'bg-indigo-100/50' },
    { title: 'Revenue Today', value: `Rp ${revenueToday.toLocaleString('id-ID')}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100/50' },
    { title: 'Revenue This Month', value: `Rp ${revenueThisMonth.toLocaleString('id-ID')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
    { title: 'Active Rentals', value: activeRentals, icon: Key, color: 'text-amber-500', bg: 'bg-amber-100/50' },
    { title: 'Available Cars', value: availableCars, icon: Car, color: 'text-teal-500', bg: 'bg-teal-100/50' },
    { title: 'In Maintenance', value: maintenanceCars, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100/50' },
    { title: 'Waiting Verify', value: waitingVerification, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100/50' },
    { title: 'Waiting Final Pay', value: waitingFinalPayment, icon: Wallet, color: 'text-yellow-500', bg: 'bg-yellow-100/50' },
    { title: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100/50' },
    { title: 'Active Drivers', value: activeDrivers, icon: UserCheck, color: 'text-rose-500', bg: 'bg-rose-100/50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold tracking-tight">{kpi.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
