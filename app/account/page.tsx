'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, CalendarCheck, Car, LogOut,
  CreditCard, AlertCircle, CheckCircle2, Clock,
  XCircle, ArrowRight, Loader2,
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  PENDING:       'bg-yellow-100 text-yellow-800 border-yellow-200',
  WAITING_DP:    'bg-orange-100 text-orange-800 border-orange-200',
  DP_CONFIRMED:  'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS:   'bg-emerald-100 text-emerald-800 border-emerald-200',
  WAITING_PAYMENT: 'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED:     'bg-zinc-100 text-zinc-700 border-zinc-200',
  CANCELLED:     'bg-red-100 text-red-800 border-red-200',
  REJECTED:      'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  PENDING:         'Menunggu Konfirmasi',
  WAITING_DP:      'Menunggu Pembayaran DP',
  DP_CONFIRMED:    'DP Dikonfirmasi',
  IN_PROGRESS:     'Sedang Berjalan',
  WAITING_PAYMENT: 'Menunggu Pelunasan',
  COMPLETED:       'Selesai',
  CANCELLED:       'Dibatalkan',
  REJECTED:        'Ditolak',
};

const StatusIcon = ({ status }: { status: string }) => {
  if (['COMPLETED'].includes(status))  return <CheckCircle2 size={14} className="text-zinc-500" />;
  if (['CANCELLED', 'REJECTED'].includes(status)) return <XCircle size={14} className="text-red-500" />;
  if (['IN_PROGRESS', 'DP_CONFIRMED'].includes(status)) return <CheckCircle2 size={14} className="text-emerald-500" />;
  return <Clock size={14} className="text-yellow-500" />;
};

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getOutstanding(booking: any): number {
  if (booking.fullPaid) return 0;
  const verified = booking.payments
    ?.filter((p: any) => p.status === 'VERIFIED')
    .reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
  return Math.max(0, booking.totalPrice - verified);
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');

  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (activeTab === 'bookings' && session) {
      setLoadingBookings(true);
      setBookingsError('');
      fetch('/api/booking')
        .then(r => r.json())
        .then(res => {
          if (res.success) setBookings(res.data);
          else setBookingsError(res.error || 'Gagal memuat riwayat booking.');
        })
        .catch(() => setBookingsError('Gagal terhubung ke server.'))
        .finally(() => setLoadingBookings(false));
    }
  }, [activeTab, session]);

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
              { id: 'profile',   label: 'Profil Saya',     icon: User },
              { id: 'bookings',  label: 'Riwayat Booking',  icon: CalendarCheck },
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

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
                <h3 className="font-bold text-zinc-900">Informasi Akun</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { icon: User,         label: 'Nama Lengkap',    value: user.name || '-' },
                  { icon: Mail,         label: 'Email',            value: user.email },
                  { icon: Phone,        label: 'Nomor Telepon',    value: user.phone || 'Belum diisi' },
                  { icon: CalendarCheck,label: 'Terdaftar Sejak',  value: 'Juli 2026' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                    <Icon size={16} className="text-zinc-400" />
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500">{label}</p>
                      <p className="font-bold text-zinc-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/booking" className="bg-zinc-900 text-white rounded-2xl p-6 hover:bg-zinc-800 transition-colors">
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

        {/* ── Bookings Tab ── */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Loading */}
            {loadingBookings && (
              <div className="flex items-center justify-center py-20 gap-3 text-zinc-500">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm font-medium">Memuat riwayat booking...</span>
              </div>
            )}

            {/* Error */}
            {bookingsError && !loadingBookings && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Gagal Memuat Data</p>
                  <p className="text-sm text-red-600 mt-1">{bookingsError}</p>
                </div>
              </div>
            )}

            {/* Empty */}
            {!loadingBookings && !bookingsError && bookings.length === 0 && (
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
            )}

            {/* Booking Cards */}
            {!loadingBookings && !bookingsError && bookings.map((booking) => {
              const outstanding = getOutstanding(booking);
              const carImage = booking.car?.images
                ? JSON.parse(booking.car.images)[0]
                : null;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={booking.status} />
                      <span className="font-mono text-xs text-zinc-400">{booking.id.slice(0, 12)}...</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[booking.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Car image */}
                      {carImage && (
                        <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                          <img src={carImage} alt={booking.car?.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 text-base leading-tight">
                          {booking.car?.name || 'Mobil tidak ditemukan'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 capitalize">
                          {booking.car?.category} • {booking.serviceType?.replace('_', ' ')}
                        </p>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                          <div>
                            <span className="text-zinc-400">Mulai Sewa</span>
                            <p className="font-semibold text-zinc-900">
                              {format(parseISO(booking.startDate), 'd MMM yyyy', { locale: localeId })}
                            </p>
                          </div>
                          <div>
                            <span className="text-zinc-400">Selesai Sewa</span>
                            <p className="font-semibold text-zinc-900">
                              {format(parseISO(booking.endDate), 'd MMM yyyy', { locale: localeId })}
                            </p>
                          </div>
                          <div>
                            <span className="text-zinc-400">Durasi</span>
                            <p className="font-semibold text-zinc-900">{booking.duration} hari</p>
                          </div>
                          <div>
                            <span className="text-zinc-400">Metode Bayar</span>
                            <p className="font-semibold text-zinc-900">{booking.paymentMethod || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-2 gap-3">
                      <div className="bg-zinc-50 rounded-xl p-3">
                        <p className="text-xs text-zinc-400">Total Tagihan</p>
                        <p className="font-black text-zinc-900 text-sm mt-0.5">
                          {formatIDR(booking.totalPrice)}
                        </p>
                      </div>
                      <div className={`rounded-xl p-3 ${outstanding > 0 ? 'bg-orange-50' : 'bg-emerald-50'}`}>
                        <p className={`text-xs ${outstanding > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {outstanding > 0 ? 'Sisa Tagihan' : 'Lunas'}
                        </p>
                        <p className={`font-black text-sm mt-0.5 ${outstanding > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>
                          {outstanding > 0 ? formatIDR(outstanding) : '✓ Terbayar'}
                        </p>
                      </div>
                    </div>

                    {/* Outstanding payment alert */}
                    {outstanding > 0 && ['PENDING', 'WAITING_DP'].includes(booking.status) && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-orange-600 shrink-0" />
                          <p className="text-xs text-orange-700 font-medium">
                            Menunggu pembayaran DP: <strong>{formatIDR(booking.dpAmount)}</strong>
                          </p>
                        </div>
                        <Link
                          href={`/booking?carId=${booking.carId}`}
                          className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1"
                        >
                          Bayar <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

          </motion.div>
        )}
      </div>
    </div>
  );
}
