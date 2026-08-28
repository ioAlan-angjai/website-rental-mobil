'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Car, CreditCard, AlertCircle, CheckCircle2,
  Clock, XCircle, ArrowRight, Loader2, MapPin, Settings2,
  Calendar, FileText, ChevronRight, RefreshCw, Landmark,
  Wallet, AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatDuration, formatRupiah } from '@/lib/utils';
import { BOOKING_STATUS_MAP, STATUS_STEPS, getStatusMeta } from '@/lib/booking-status';
import { openSnapPayment } from '@/lib/snap';

function getPaidAmount(booking: any): number {
  if (['COMPLETED'].includes(booking.status) || booking.fullPaid) {
    return booking.totalPrice + (booking.penaltyAmount || 0);
  }
  const verifiedPaymentTotal = booking.payments
    ?.filter((p: any) => p.status === 'VERIFIED')
    .reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
  if (verifiedPaymentTotal > 0) return verifiedPaymentTotal;
  if (['DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_PAYMENT'].includes(booking.status)) {
    return booking.dpAmount || Math.floor(booking.totalPrice * 0.5);
  }
  const hasProof = !!(booking.paymentProof || booking.payments?.some((p: any) => p.proofImage));
  if (['PENDING', 'WAITING_DP'].includes(booking.status) && hasProof) {
    return booking.dpAmount || Math.floor(booking.totalPrice * 0.5);
  }
  return 0;
}

function getOutstanding(booking: any): number {
  if (['COMPLETED'].includes(booking.status) || booking.fullPaid) return 0;
  const paid = getPaidAmount(booking);
  return Math.max(0, booking.totalPrice - paid);
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

  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    setError('');
    fetch('/api/booking')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBookings(res.data || []);
        else setError(res.error || 'Gagal memuat riwayat sewa.');
      })
      .catch(() => setError('Gagal menghubungi server. Periksa koneksi internet Anda.'))
      .finally(() => setLoading(false));
  };

  const handlePayDP = async (bookingId: string) => {
    setPayingBookingId(bookingId);
    setPayError(null);
    try {
      const res = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentType: 'DP' }),
      });
      const data = await res.json();
      if (data.isGatewayActive && data.token) {
        await openSnapPayment(data.token, {
          onSuccess: () => {
            fetchBookings();
          },
          onPending: () => {
            fetchBookings();
          },
          onError: () => {
            setPayError('Pembayaran gagal atau dibatalkan.');
          },
        });
      } else {
        setPayError(data.error || 'Gagal memuat gateway pembayaran.');
      }
    } catch (e) {
      setPayError('Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setPayingBookingId(null);
    }
  };

  useEffect(() => {
    if (session) fetchBookings();
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#13112a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#2a2548] border-t-amber-400 animate-spin" />
          <p className="text-sm text-zinc-300 tracking-wide">Memuat...</p>
        </div>
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

  const activeCount = bookings.filter(b => ['PENDING', 'WAITING_DP', 'DP_CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
  const pendingPayCount = bookings.filter(b => getOutstanding(b) > 0 && !['CANCELLED', 'REJECTED', 'COMPLETED'].includes(b.status)).length;

  // ─── Status Timeline Component ───
  function StatusTimeline({ booking }: { booking: any }) {
    const meta = getStatusMeta(booking.status);
    const activeStep = meta.step;
    const isCancelled = ['CANCELLED', 'REJECTED'].includes(booking.status);

    return (
      <div className="relative">
        {/* Timeline horizontal bar */}
        <div className="relative flex items-center justify-between mb-8 mt-2">
          {STATUS_STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = activeStep > stepNum;
            const isCurrent = activeStep === stepNum;
            // For COMPLETED booking, the last step shows as completed
            const isFinalCompleted = isCompleted || (activeStep === 7 && idx === STATUS_STEPS.length - 1);

            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-[55%] w-full h-0.5 -z-0 transition-colors duration-500 ${
                      isCancelled ? 'bg-red-500/20' : isFinalCompleted ? 'bg-emerald-500/60' : 'bg-[#2a2548]'
                    }`}
                  />
                )}

                {/* Circle node */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCancelled
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : isFinalCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : isCurrent
                          ? 'bg-[#1b1838] border-amber-500 text-amber-400 shadow-sm shadow-amber-500/10'
                          : 'bg-[#13112a] border-[#2a2548] text-zinc-600'
                  }`}
                >
                  {isCancelled ? (
                    <XCircle size={14} />
                  ) : isFinalCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isCurrent ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-[10px] mt-2 text-center font-medium leading-tight max-w-[60px] ${
                    isCancelled
                      ? 'text-red-400'
                      : isFinalCompleted || isCurrent
                        ? meta.color
                        : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13112a] relative flex flex-col">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-28 pb-20 relative z-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-2 tracking-wide">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <ChevronRight size={12} className="text-zinc-500" />
              <span className="text-zinc-200">Riwayat Booking</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Riwayat <span className="text-amber-400">Sewa Mobil</span>
            </h1>
            <p className="text-zinc-300 text-sm mt-2">
              Pantau status pemesanan, tagihan, dan detail armada Anda.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-200 bg-[#1b1838] border border-[#2a2548] hover:border-zinc-400 hover:text-white active:scale-95 transition-all rounded-xl self-start md:self-auto cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Segarkan
          </button>
        </div>

        {/* ── Stats Strip ── */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total Pesanan', value: bookings.length, sub: 'semua status' },
              { label: 'Aktif', value: activeCount, sub: 'sedang berjalan' },
              { label: 'Menunggu Bayar', value: pendingPayCount, sub: 'perlu pelunasan' },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-[#1b1838]/80 border border-[#2a2548] rounded-2xl p-4 backdrop-blur-sm"
              >
                <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-black text-white mt-1">{s.value}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'active', label: 'Dalam Proses' },
            { id: 'completed', label: 'Selesai' },
            { id: 'cancelled', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-amber-500 text-[#13112a] border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-[#1b1838] text-zinc-300 border-[#2a2548] hover:border-zinc-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div className="space-y-5">

          {/* Loading */}
          {loading && (
            <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl py-20 flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#2a2548] border-t-amber-400 animate-spin" />
              <p className="text-sm text-zinc-300">Memuat riwayat booking...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6 flex items-start gap-4">
              <div className="p-2 bg-zinc-800 rounded-xl shrink-0">
                <AlertTriangle size={16} className="text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Gagal Mengambil Data</h4>
                <p className="text-xs text-zinc-300 mt-1">{error}</p>
                <button
                  onClick={fetchBookings}
                  className="mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Coba Lagi →
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredBookings.length === 0 && (
            <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1b1838] border border-[#2a2548] flex items-center justify-center mx-auto mb-4">
                <CalendarCheck size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-base font-bold text-white">Belum Ada Riwayat Booking</h3>
              <p className="text-zinc-300 text-xs mt-2 max-w-xs mx-auto">
                Anda belum melakukan pemesanan atau tidak ada data dengan filter ini.
              </p>
              <Link href="/armada" className="inline-flex items-center gap-1.5 mt-6 bg-amber-500 hover:bg-amber-400 text-[#13112a] font-bold text-xs px-5 py-2.5 rounded-xl transition-all">
                Lihat Armada Mobil
                <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Booking Cards */}
          {!loading && !error && filteredBookings.map((booking, idx) => {
            const paidAmount = getPaidAmount(booking);
            const outstanding = getOutstanding(booking);
            const meta = getStatusMeta(booking.status);
            const StatusIcon = Car; // fallback icon

            const carImages = booking.car?.images
              ? (typeof booking.car.images === 'string' ? JSON.parse(booking.car.images) : booking.car.images)
              : [];
            const carThumb = carImages[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800';

            const needsAction = outstanding > 0 && ['WAITING_PAYMENT', 'IN_PROGRESS', 'DP_CONFIRMED', 'PENDING', 'WAITING_DP'].includes(booking.status);

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-[#1b1838] border border-[#2a2548] rounded-2xl overflow-hidden hover:border-[#3a3570] transition-all duration-300"
              >
                {/* ── Top Bar ── */}
                <div className="px-5 py-3.5 border-b border-[#2a2548]/50 flex flex-wrap items-center justify-between gap-3 bg-[#13112a]/80">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#2a2548]/50">
                      <FileText size={13} className="text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-widest">ID Pemesanan</p>
                      <p className="font-mono text-xs font-bold text-white mt-0.5">{booking.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge — from booking-status.ts */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${meta.bg} ${meta.color} border-current/20`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
                      {meta.label}
                    </span>

                    {/* Secondary badges */}
                    {booking.status === 'IN_PROGRESS' && outstanding > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold bg-[#13112a] text-zinc-200 border border-[#2a2548]">
                        <Clock size={10} />
                        Sisa Tagihan
                      </span>
                    )}
                    {booking.status === 'DP_CONFIRMED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold bg-[#13112a] text-zinc-200 border border-[#2a2548]">
                        <CheckCircle2 size={10} />
                        DP Terbayar
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Col 1: Car */}
                    <div className="lg:col-span-4 space-y-3">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#13112a]">
                        <img src={carThumb} alt={booking.car?.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#13112a]/60 to-transparent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{booking.car?.brand}</p>
                        <h4 className="text-base font-bold text-white mt-0.5 leading-tight">{booking.car?.name}</h4>
                        <span className="inline-block mt-1.5 bg-[#13112a] text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md capitalize border border-[#2a2548]">
                          {booking.car?.category}
                        </span>
                      </div>
                    </div>

                    {/* Col 2: Booking Details */}
                    <div className="lg:col-span-4 space-y-3 border-t lg:border-t-0 lg:border-x border-[#2a2548]/50 pt-5 lg:pt-0 lg:px-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">Detail Pemesanan</p>
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-[#13112a] flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar size={11} className="text-zinc-300" />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-white">Durasi Sewa</p>
                            <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                              {format(parseISO(booking.startDateTime || booking.startDate), 'd MMM yyyy', { locale: localeId })}
                              <span className="mx-1.5 text-zinc-400">→</span>
                              {format(parseISO(booking.endDateTime || booking.endDate), 'd MMM yyyy', { locale: localeId })}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              {formatDuration(booking.durationMinutes ?? booking.duration)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-[#13112a] flex items-center justify-center shrink-0 mt-0.5">
                            <Settings2 size={11} className="text-zinc-300" />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-white">Layanan</p>
                            <p className="text-[11px] text-zinc-300 mt-0.5 capitalize">
                              {booking.serviceType?.replace('_', ' ').toLowerCase()}
                            </p>
                          </div>
                        </div>

                        {booking.pickupLocation && (
                          <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-[#13112a] flex items-center justify-center shrink-0 mt-0.5">
                              <MapPin size={11} className="text-zinc-300" />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-white">Penjemputan</p>
                              <p className="text-[11px] text-zinc-300 mt-0.5">{booking.pickupLocation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 3: Payment / Timeline */}
                    <div className="lg:col-span-4 space-y-3 pt-5 lg:pt-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">Rincian Pembayaran</p>

                      <div className="space-y-2 text-[11px]">
                        <div className="flex justify-between text-zinc-300">
                          <span>Sewa ({formatDuration(booking.durationMinutes ?? booking.duration)})</span>
                          <span>{formatRupiah(booking.basePrice)}</span>
                        </div>
                        {booking.discountAmount > 0 && (
                          <div className="flex justify-between text-zinc-300">
                            <span>Diskon</span>
                            <span>−{formatRupiah(booking.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-white font-bold border-t border-[#2a2548] pt-2 text-xs">
                          <span>Total Tagihan</span>
                          <span>{formatRupiah(booking.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-300">
                          <span>DP (50%)</span>
                          <span>{formatRupiah(booking.dpAmount)}</span>
                        </div>
                      </div>

                      {/* Payment Progress */}
                      <div className="border-t border-[#2a2548]/50 pt-3 space-y-2">
                        <div className="flex items-center justify-between bg-[#13112a] rounded-xl px-3.5 py-2.5 border border-[#2a2548]/50">
                          <div>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Sudah Terbayar</p>
                            <p className={`text-xs font-black mt-0.5 ${paidAmount > 0 ? 'text-white' : 'text-zinc-400'}`}>
                              {formatRupiah(paidAmount)}
                            </p>
                          </div>
                          {paidAmount > 0 && (
                            <div className="w-5 h-5 rounded-full bg-[#13112a] flex items-center justify-center">
                              <CheckCircle2 size={11} className="text-zinc-300" />
                            </div>
                          )}
                        </div>

                        <div className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border ${
                          outstanding > 0
                            ? 'bg-amber-500/5 border-amber-500/15'
                            : 'bg-[#13112a] border-[#2a2548]/50'
                        }`}>
                          <div>
                            <p className={`text-[9px] font-bold uppercase tracking-widest ${outstanding > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                              {outstanding > 0 ? 'Sisa Tagihan' : 'Status Bayar'}
                            </p>
                            <p className={`text-xs font-black mt-0.5 ${outstanding > 0 ? 'text-amber-200' : 'text-zinc-300'}`}>
                              {outstanding > 0 ? formatRupiah(outstanding) : '✓ Lunas'}
                            </p>
                          </div>
                          {outstanding > 0 && ['WAITING_PAYMENT', 'IN_PROGRESS', 'DP_CONFIRMED'].includes(booking.status) && (
                            <Link href={`/pelunasan/${booking.id}`}>
                              <button className="text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-[#13112a] px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm">
                                Bayar
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Status Timeline ── */}
                  <div className="mt-5 pt-5 border-t border-[#2a2548]/50">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300 mb-3">
                      Status Timeline
                    </p>
                    <StatusTimeline booking={booking} />
                  </div>

                  {/* ── Action Banners ── */}

                  {/* DP Pending — bukti sudah upload */}
                  {['PENDING', 'WAITING_DP'].includes(booking.status) && (() => {
                    const proofUrl = booking.paymentProof || booking.payments?.find((p: any) => p.proofImage)?.proofImage;
                    if (proofUrl) {
                      return (
                        <div className="mt-4 p-4 bg-[#13112a] border border-[#2a2548] rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-[#13112a] flex items-center justify-center shrink-0">
                              <Clock size={13} className="text-zinc-200" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">
                                Bukti DP ({formatRupiah(booking.dpAmount)}) Berhasil Diunggah
                              </p>
                              <p className="text-[10px] text-zinc-300 mt-0.5">
                                Sedang diverifikasi oleh admin. Status berubah setelah disetujui.
                              </p>
                            </div>
                          </div>
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#13112a] hover:bg-[#1b1838] text-zinc-300 text-[10px] font-semibold rounded-lg shrink-0 transition-colors border border-[#2a2548]"
                          >
                            Lihat Bukti
                          </a>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* DP Pending — belum upload */}
                  {['PENDING', 'WAITING_DP'].includes(booking.status) && !(booking.paymentProof || booking.payments?.some((p: any) => p.proofImage)) && (
                    <div className="mt-4 p-4 bg-[#13112a] border border-[#2a2548] rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
                          <Landmark size={13} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Transfer DP sebesar <span className="font-black text-amber-300">{formatRupiah(booking.dpAmount)}</span> untuk konfirmasi pesanan
                          </p>
                          <p className="text-[10px] text-zinc-300 mt-0.5">
                            Metode: Transfer Bank ({booking.paymentMethod || 'BCA'})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePayDP(booking.id)}
                        disabled={payingBookingId === booking.id}
                        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-[#13112a] font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-amber-500/20 whitespace-nowrap disabled:opacity-50"
                      >
                        {payingBookingId === booking.id ? (
                          <><Loader2 size={12} className="animate-spin" /> Membuka Pembayaran...</>
                        ) : (
                          <><CreditCard size={12} /> Bayar DP Sekarang <ArrowRight size={12} /></>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Pelunasan Banner */}
                  {outstanding > 0 && ['WAITING_PAYMENT', 'IN_PROGRESS', 'DP_CONFIRMED'].includes(booking.status) && (
                    <div className="mt-4 p-4 bg-[#13112a] border border-[#2a2548] rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
                          <Wallet size={13} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Tagihan pelunasan tersedia sebesar <span className="font-black text-amber-300">{formatRupiah(outstanding)}</span>
                          </p>
                          <p className="text-[10px] text-zinc-300 mt-0.5">
                            {booking.penaltyAmount > 0
                              ? `Termasuk denda keterlambatan ${formatRupiah(booking.penaltyAmount)}.`
                              : 'Mobil telah dikembalikan. Silakan lakukan pelunasan.'}
                          </p>
                        </div>
                      </div>
                      <Link href={`/pelunasan/${booking.id}`}>
                        <button className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-[#13112a] font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shadow-amber-500/20 whitespace-nowrap">
                          Bayar Pelunasan
                          <ArrowRight size={12} />
                        </button>
                      </Link>
                    </div>
                  )}

                  {/* Invoice (Completed) */}
                  {booking.status === 'COMPLETED' && (
                    <div className="mt-4 pt-4 border-t border-[#2a2548]/50 flex items-center justify-between">
                      <p className="text-[10px] text-zinc-400">Pemesanan selesai</p>
                      <Link
                        href={`/invoice?bookingId=${booking.id}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200 hover:text-amber-400 transition-colors"
                      >
                        <FileText size={12} />
                        Unduh Invoice
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
