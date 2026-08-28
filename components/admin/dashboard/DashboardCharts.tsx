'use client';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parseISO, startOfMonth, formatISO, subMonths } from 'date-fns';

interface DashboardChartsProps {
  bookings: any[];
  cars: any[];
}

export function DashboardCharts({ bookings, cars }: DashboardChartsProps) {
  // 1. Revenue Chart Data (Last 6 Months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return {
      month: format(d, 'MMM yyyy'),
      rawDate: startOfMonth(d),
      revenue: 0
    };
  });

  bookings.forEach(b => {
    if (b.createdAt && ['DP_CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status)) {
      const bDate = parseISO(b.createdAt);
      const monthStr = format(bDate, 'MMM yyyy');
      const target = last6Months.find(m => m.month === monthStr);
      if (target) {
        target.revenue += (b.totalPrice || 0);
      }
    }
  });

  // 2. Booking Trend Chart Data (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: format(d, 'EEE'),
      date: format(d, 'dd MMM'),
      bookings: 0
    };
  });

  bookings.forEach(b => {
    if (b.createdAt) {
      const bDate = parseISO(b.createdAt);
      const dateStr = format(bDate, 'dd MMM');
      const target = last7Days.find(d => d.date === dateStr);
      if (target) {
        target.bookings += 1;
      }
    }
  });

  // 3. Most Rented Cars Data
  const carRentals: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.car) {
      const carName = `${b.car.brand} ${b.car.name}`;
      carRentals[carName] = (carRentals[carName] || 0) + 1;
    }
  });
  
  const mostRentedCars = Object.entries(carRentals)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Booking Status Pie Chart Data
  const statusCounts: Record<string, number> = {};
  bookings.forEach(b => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6666', '#99CCFF'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Revenue Area Chart */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs text-zinc-950 flex flex-col">
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-zinc-950">Pendapatan Sewa (6 Bulan Terakhir)</h3>
          <p className="text-xs text-zinc-500">Total pendapatan dari booking terkonfirmasi dan selesai</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last6Months} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#a1a1aa" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => {
                  if (value === 0) return 'Rp 0';
                  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
                  return `Rp ${(value / 1000).toFixed(0)}rb`;
                }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <RechartsTooltip 
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Booking Trend Bar Chart */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs text-zinc-950 flex flex-col">
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-zinc-950">Tren Pemesanan (7 Hari Terakhir)</h3>
          <p className="text-xs text-zinc-500">Volume pemesanan armada harian</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{ fill: '#f4f4f5' }} 
                formatter={(value: number) => [`${value} Pesanan`, 'Total']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="bookings" fill="#18181b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Rented Cars Bar Chart (Horizontal) */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs text-zinc-950 flex flex-col">
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-zinc-950">Top 5 Armada Paling Sering Disewa</h3>
          <p className="text-xs text-zinc-500">Berdasarkan total pesanan unit</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mostRentedCars} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
              <XAxis type="number" allowDecimals={false} stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={120} />
              <RechartsTooltip 
                cursor={{ fill: '#f4f4f5' }} 
                formatter={(value: number) => [`${value} Kali`, 'Total Sewa']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#27272a" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Booking Status Pie Chart */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs text-zinc-950 flex flex-col">
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-zinc-950">Distribusi Status Pemesanan</h3>
          <p className="text-xs text-zinc-500">Proporsi status pesanan aktif saat ini</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length > 0 ? pieData : [{ name: 'Belum Ada', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => {
                  const monochromePalette = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#10b981', '#f59e0b'];
                  return (
                    <Cell key={`cell-${index}`} fill={monochromePalette[index % monochromePalette.length]} />
                  );
                })}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
