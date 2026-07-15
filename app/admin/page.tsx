'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Car, CalendarCheck, Users, LogOut,
  TrendingUp, Clock, CheckCircle2, XCircle, AlertTriangle,
  Eye, Search, Bell, Settings,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';

// Mock stats for demo
const STATS = [
  { label: 'Total Booking', value: '24', icon: CalendarCheck, change: '+12%', up: true },
  { label: 'Pendapatan Bulan Ini', value: 'Rp 18.5jt', icon: TrendingUp, change: '+8%', up: true },
  { label: 'Unit Aktif', value: '6', icon: Car, change: '0%', up: true },
  { label: 'Menunggu Verifikasi', value: '3', icon: Clock, change: '', up: false },
];

const MOCK_BOOKINGS = [
  { id: 'BK-001', customer: 'Ahmad Fauzi', car: 'Toyota Avanza', date: '2026-07-15', status: 'PENDING', total: 900000 },
  { id: 'BK-002', customer: 'Rina Sari', car: 'Honda Brio', date: '2026-07-14', status: 'DP_CONFIRMED', total: 750000 },
  { id: 'BK-003', customer: 'Budi Santoso', car: 'Toyota Innova', date: '2026-07-13', status: 'IN_PROGRESS', total: 1350000 },
  { id: 'BK-004', customer: 'Maya Putri', car: 'Honda CR-V', date: '2026-07-12', status: 'COMPLETED', total: 1650000 },
  { id: 'BK-005', customer: 'Dimas Prayoga', car: 'Toyota Fortuner', date: '2026-07-11', status: 'CANCELLED', total: 1950000 },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DP_CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  WAITING_DP: 'bg-orange-100 text-orange-800 border-orange-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  DP_CONFIRMED: 'DP Dikonfirmasi',
  IN_PROGRESS: 'Sedang Berjalan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  WAITING_DP: 'Menunggu DP',
  REJECTED: 'Ditolak',
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'cars'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/account');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-zinc-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session || (session?.user as any)?.role !== 'ADMIN') {
    return null;
  }

  const filteredBookings = MOCK_BOOKINGS.filter(
    (b) =>
      b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.car.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
              { id: 'cars', label: 'Armada', icon: Car },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-zinc-100 rounded-xl">
                      <stat.icon size={18} className="text-zinc-700" />
                    </div>
                    {stat.change && (
                      <span className={`text-xs font-bold ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Booking Terbaru</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 text-left">
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Pelanggan</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Mobil</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {MOCK_BOOKINGS.slice(0, 3).map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-zinc-600">{booking.id}</td>
                        <td className="px-6 py-3 font-bold text-zinc-900">{booking.customer}</td>
                        <td className="px-6 py-3 text-zinc-600">{booking.car}</td>
                        <td className="px-6 py-3 text-zinc-500">{booking.date}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[booking.status]}`}>
                            {statusLabels[booking.status]}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-zinc-900 text-right">
                          Rp {booking.total.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari booking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 text-left">
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Pelanggan</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Mobil</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Total</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-zinc-600">{booking.id}</td>
                        <td className="px-6 py-3 font-bold text-zinc-900">{booking.customer}</td>
                        <td className="px-6 py-3 text-zinc-600">{booking.car}</td>
                        <td className="px-6 py-3 text-zinc-500">{booking.date}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[booking.status]}`}>
                            {statusLabels[booking.status]}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-zinc-900 text-right">
                          Rp {booking.total.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
                            <Eye size={14} className="text-zinc-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredBookings.length === 0 && (
                <div className="py-12 text-center text-sm text-zinc-400">
                  Tidak ada booking ditemukan.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Cars Tab */}
        {activeTab === 'cars' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <Car size={48} className="text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Manajemen Armada</h3>
              <p className="text-sm text-zinc-500">Halaman manajemen armada akan segera tersedia.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Logout Button (fixed bottom-right) */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="fixed bottom-6 right-6 p-3 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all z-50"
        title="Keluar"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
