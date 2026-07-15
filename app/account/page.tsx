'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, CalendarCheck, Car, LogOut,
  Clock, CheckCircle2, XCircle, CreditCard,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import Link from 'next/link';

// Mock user bookings for demo
const MOCK_USER_BOOKINGS = [
  { id: 'BK-001', car: 'Toyota Avanza', date: '2026-07-20', duration: 3, status: 'PENDING', total: 900000, dpPaid: false },
  { id: 'BK-003', car: 'Honda Brio', date: '2026-07-10', duration: 2, status: 'COMPLETED', total: 500000, dpPaid: true },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DP_CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  WAITING_DP: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  DP_CONFIRMED: 'DP Dikonfirmasi',
  IN_PROGRESS: 'Sedang Berjalan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  WAITING_DP: 'Menunggu DP',
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-zinc-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      <BackgroundOrnaments />

      {/* Header */}
      <section className="relative pt-28 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900">Halo, {user.name || 'Pengguna'}!</h1>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-zinc-200 bg-white sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'profile', label: 'Profil Saya', icon: User },
              { id: 'bookings', label: 'Riwayat Booking', icon: CalendarCheck },
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
                <h3 className="font-bold text-zinc-900">Informasi Akun</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                  <User size={16} className="text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500">Nama Lengkap</p>
                    <p className="font-bold text-zinc-900">{user.name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                  <Mail size={16} className="text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="font-bold text-zinc-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                  <Phone size={16} className="text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500">Nomor Telepon</p>
                    <p className="font-bold text-zinc-900">{user.phone || 'Belum diisi'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-3">
                  <CalendarCheck size={16} className="text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500">Terdaftar Sejak</p>
                    <p className="font-bold text-zinc-900">Juli 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/booking"
                className="bg-zinc-900 text-white rounded-2xl p-6 hover:bg-zinc-800 transition-colors"
              >
                <Car size={24} className="mb-3" />
                <h4 className="font-bold">Booking Baru</h4>
                <p className="text-xs text-zinc-400 mt-1">Sewa mobil sekarang</p>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-white border border-zinc-200 text-zinc-700 rounded-2xl p-6 hover:bg-zinc-50 transition-colors text-left"
              >
                <LogOut size={24} className="mb-3 text-red-500" />
                <h4 className="font-bold">Keluar</h4>
                <p className="text-xs text-zinc-400 mt-1">Sign out dari akun</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {MOCK_USER_BOOKINGS.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
                <CalendarCheck size={48} className="text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Belum Ada Booking</h3>
                <p className="text-sm text-zinc-500 mb-6">Mulai sewa mobil pertama Anda.</p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors"
                >
                  <Car size={16} /> Booking Sekarang
                </Link>
              </div>
            ) : (
              MOCK_USER_BOOKINGS.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">{booking.id}</p>
                      <h4 className="font-bold text-zinc-900 mt-1">{booking.car}</h4>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <CalendarCheck size={12} /> {booking.date}
                    </span>
                    <span>{booking.duration} hari</span>
                    <span className="font-bold text-zinc-900 ml-auto">
                      Rp {booking.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {booking.status === 'PENDING' && !booking.dpPaid && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-xs text-orange-700 font-medium flex items-center gap-1">
                        <CreditCard size={12} /> Menunggu pembayaran DP
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
