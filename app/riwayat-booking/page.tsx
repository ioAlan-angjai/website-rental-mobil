'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Car, CreditCard, AlertCircle, CheckCircle2,
  Clock, XCircle, ArrowRight, Loader2, MapPin, Settings2,
  Calendar, FileText, ChevronRight, RefreshCw, Landmark
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const statusColors: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Clock,
  },
  WAITING_DP: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: CreditCard,
  },
  DP_CONFIRMED: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: Car,
  },
  WAITING_PAYMENT: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: CreditCard,
  },
  COMPLETED: {
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    border: 'border-zinc-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: XCircle,
  },
  REJECTED: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: XCircle,
  },
};

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu Konfirmasi',
  WAITING_DP: 'Menunggu Pembayaran DP',
  DP_CONFIRMED: 'DP Terverifikasi',
  IN_PROGRESS: 'Sedang Disewa',
  WAITING_PAYMENT: 'Menunggu Pelunasan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  REJECTED: 'Ditolak',
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
  // If DP is not paid, outstanding is the whole totalPrice
  // If DP is paid, outstanding is totalPrice - dpAmount (or payments already verified)
  const verifiedPaymentTotal = booking.payments
    ?.filter((p: any) => p.status === 'VERIFIED')
    .reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
  
  return Math.max(0, booking.totalPrice - verifiedPaymentTotal);
}

export default function RiwayatBookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/riwayat-booking');
    }
  }, [status, router]);

  const fetchBookings = () => {
    setLoading(true);
    setError('');
    fetch('/api/booking')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setBookings(res.data || []);
        } else {
          setError(res.error || 'Gagal memuat riwayat sewa.');
        }
      })
      .catch(() => setError('Gagal menghubungi server. Periksa koneksi internet Anda.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-zinc-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return ['PENDING', 'WAITING_DP', 'DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_PAYMENT'].includes(b.status);
    if (filterStatus === 'completed') return b.status === 'COMPLETED';
    if (filterStatus === 'cancelled') return ['CANCELLED', 'REJECTED'].includes(b.status);
    return b.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-between">
      <div>
        <Navbar />
        <BackgroundOrnaments />

        <div className="max-w-6xl mx-auto px-4 pt-28 pb-16 relative z-10">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <Link href="/" className="hover:text-zinc-950 transition-colors">Beranda</Link>
                <span>/</span>
                <span className="text-zinc-950 font-bold">Riwayat Booking</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">
                Riwayat Booking Mobil
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Pantau status pemesanan, tagihan pembayaran, dan detail armada Anda.
              </p>
            </div>

            <button
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 active:scale-95 transition-all rounded-xl self-start md:self-auto cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>

          {/* Quick Stats Banner */}
          {!loading && bookings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Pesanan</p>
                <p className="text-2xl font-black text-zinc-900 mt-1">{bookings.length}</p>
              </div>
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Sedang Aktif</p>
                <p className="text-2xl font-black text-amber-900 mt-1">
                  {bookings.filter(b => ['PENDING', 'WAITING_DP', 'DP_CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length}
                </p>
              </div>
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Menunggu Pembayaran</p>
                <p className="text-2xl font-black text-rose-900 mt-1">
                  {bookings.filter(b => getOutstanding(b) > 0 && !['CANCELLED', 'REJECTED', 'COMPLETED'].includes(b.status)).length}
                </p>
              </div>
            </div>
          )}

          {/* Filter Status */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {[
              { id: 'all', label: 'Semua Booking' },
              { id: 'active', label: 'Dalam Proses' },
              { id: 'completed', label: 'Selesai' },
              { id: 'cancelled', label: 'Dibatalkan/Ditolak' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-zinc-900 text-white border-transparent'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Area */}
          <div className="space-y-6">
            {/* Loading State */}
            {loading && (
              <div className="bg-white border border-zinc-200 rounded-2xl py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="animate-spin text-zinc-900" />
                <p className="text-sm font-semibold text-zinc-500">Memuat riwayat booking Anda...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                <AlertCircle size={24} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900">Gagal Mengambil Data</h4>
                  <p className="text-sm text-rose-700 mt-1">{error}</p>
                  <button
                    onClick={fetchBookings}
                    className="mt-3 text-xs font-bold text-rose-900 underline hover:text-rose-950 bg-transparent border-0 cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredBookings.length === 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl py-16 px-6 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck size={28} className="text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Belum Ada Riwayat Booking</h3>
                <p className="text-zinc-500 text-sm mt-1 max-w-sm mx-auto">
                  Anda belum melakukan pemesanan sewa mobil atau tidak ada pemesanan dengan filter ini.
                </p>
                <div className="mt-6">
                  <Link href="/armada">
                    <button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer">
                      Lihat Armada Mobil
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Bookings List */}
            {!loading && !error && filteredBookings.map((booking) => {
              const outstanding = getOutstanding(booking);
              const statusCfg = statusColors[booking.status] || {
                bg: 'bg-zinc-50',
                text: 'text-zinc-700',
                border: 'border-zinc-200',
                icon: Clock,
              };
              const StatusIcon = statusCfg.icon;

              const carImages = booking.car?.images
                ? (typeof booking.car.images === 'string'
                    ? JSON.parse(booking.car.images)
                    : booking.car.images)
                : [];
              const carThumb = carImages[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800';

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card Top bar */}
                  <div className="px-6 py-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-zinc-100 text-zinc-650">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none">ID Pemesanan</p>
                        <p className="font-mono text-xs font-bold text-zinc-950 mt-1">{booking.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                        <StatusIcon size={12} />
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Car Details & Thumbnail */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                          <img src={carThumb} alt={booking.car?.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{booking.car?.brand}</p>
                          <h4 className="font-serif text-lg font-bold text-zinc-900 mt-0.5">{booking.car?.name}</h4>
                          <span className="inline-block mt-1.5 bg-zinc-100 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded-md capitalize">
                            Kategori: {booking.car?.category}
                          </span>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="lg:col-span-4 space-y-4 border-t lg:border-t-0 lg:border-x border-zinc-100 pt-6 lg:pt-0 lg:px-6">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Detail Pemesanan</h5>

                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5 text-xs text-zinc-650">
                            <Calendar size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-zinc-900">Durasi Sewa</span>
                              <p className="mt-0.5">
                                {format(parseISO(booking.startDate), 'd MMMM yyyy', { locale: localeId })}
                                <span className="mx-1.5 text-zinc-400">s/d</span>
                                {format(parseISO(booking.endDate), 'd MMMM yyyy', { locale: localeId })}
                                <span className="ml-2 font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                                  {booking.duration} hari
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 text-xs text-zinc-650">
                            <Settings2 size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-zinc-900">Layanan</span>
                              <p className="mt-0.5 capitalize">{booking.serviceType?.replace('_', ' ').toLowerCase()}</p>
                            </div>
                          </div>

                          {booking.pickupLocation && (
                            <div className="flex items-start gap-2.5 text-xs text-zinc-650">
                              <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-zinc-900">Lokasi Penjemputan</span>
                                <p className="mt-0.5">{booking.pickupLocation}</p>
                              </div>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="flex items-start gap-2.5 text-xs text-zinc-650">
                              <FileText size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-zinc-900">Catatan Tambahan</span>
                                <p className="mt-0.5 italic">"{booking.notes}"</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Billing Details */}
                      <div className="lg:col-span-4 space-y-4 pt-6 lg:pt-0">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Rincian Pembayaran</h5>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between text-zinc-500">
                            <span>Sewa Mobil ({booking.duration} hari)</span>
                            <span>{formatIDR(booking.basePrice)}</span>
                          </div>
                          {booking.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Diskon</span>
                              <span>-{formatIDR(booking.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-zinc-800 font-bold border-t border-zinc-100 pt-2 text-sm">
                            <span>Total Tagihan</span>
                            <span>{formatIDR(booking.totalPrice)}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span>Down Payment (DP 50%)</span>
                            <span>{formatIDR(booking.dpAmount)}</span>
                          </div>

                          {/* Outstanding Balance Banner */}
                          <div className="mt-4 border-t border-zinc-150 pt-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase leading-none block">Sudah Terbayar</span>
                                <span className="text-xs font-black text-zinc-900 mt-1 block">
                                  {formatIDR(booking.totalPrice - outstanding)}
                                </span>
                              </div>
                              <div className={`rounded-xl p-3 border ${outstanding > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                <span className={`text-[10px] font-bold uppercase leading-none block ${outstanding > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                  {outstanding > 0 ? 'Sisa Tagihan' : 'Sisa Tagihan'}
                                </span>
                                <span className={`text-xs font-black mt-1 block ${outstanding > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                                  {outstanding > 0 ? formatIDR(outstanding) : '✓ Lunas'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Dynamic payment instruction banner for pending payment */}
                    {outstanding > 0 && ['PENDING', 'WAITING_DP'].includes(booking.status) && (
                      <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Landmark className="text-amber-600 shrink-0 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs font-bold text-amber-900">
                              Lakukan transfer sebesar <strong className="text-sm font-black">{formatIDR(booking.dpAmount)}</strong> untuk mengonfirmasi pesanan Anda
                            </p>
                            <p className="text-[10px] text-amber-700 mt-0.5">
                              Metode Pembayaran: Transfer Bank ({booking.paymentMethod || 'BCA'})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Link href={`/booking?carId=${booking.carId}`}>
                            <button className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer">
                              Bayar DP Sekarang
                              <ArrowRight size={12} />
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
