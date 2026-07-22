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
      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 6 Months)</CardTitle>
          <CardDescription>Confirmed and completed bookings</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last6Months} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `Rp ${(value / 1000000)}M`}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <RechartsTooltip 
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Booking Trend Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Trend (Last 7 Days)</CardTitle>
          <CardDescription>Daily booking volume</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Rented Cars Bar Chart (Horizontal) */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Most Rented Cars</CardTitle>
          <CardDescription>By total number of bookings</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mostRentedCars} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" allowDecimals={false} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <RechartsTooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Booking Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Status Distribution</CardTitle>
          <CardDescription>Current status breakdown</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
