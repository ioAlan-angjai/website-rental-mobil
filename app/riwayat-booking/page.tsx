'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Car, CreditCard, CheckCircle2,
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
import { STATUS_STEPS, getStatusMeta } from '@/lib/booking-status';
import { openSnapPayment } from '@/lib/snap';

function getPaidAmount(booking: any): number {
  if (['COMPLETED'].includes(booking.status) || booking.fullPaid) {
    return booking.totalPrice + (booking.penaltyAmount || 0);
  }
  const verifiedPaymentTotal = booking.payments
    ?.filter((p: any) => p.status === 'VERIFIED')
    .reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
  if (verifiedPaymentTotal > 0) return verifiedPaymentTotal;
  if (['DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_RETURN', 'WAITING_PAYMENT'].includes(booking.status) || booking.dpPaid) {
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
  return Math.max(0, (booking.totalPrice + (booking.penaltyAmount || 0)) - paid);
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
          onSuccess: async (result) => {
            try {
              await fetch('/api/payment/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, paymentType: 'DP', result }),
              });
            } catch (err) {}
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

  const handlePayPelunasan = async (bookingId: string) => {
    setPayingBookingId(bookingId);
    setPayError(null);
    try {
      const res = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentType: 'FULL_PAYMENT' }),
      });
      const data = await res.json();
      if (data.isGatewayActive && data.token) {
        await openSnapPayment(data.token, {
          onSuccess: async (result) => {
            try {
              await fetch('/api/payment/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, paymentType: 'FULL_PAYMENT', result }),
              });
            } catch (err) {}
            fetchBookings();
          },
          onPending: () => {
            fetchBookings();
          },
          onError: () => {
            setPayError('Pembayaran pelunasan gagal atau dibatalkan.');
          },
        });
      } else {
        router.push(`/pelunasan/${bookingId}`);
      }
    } catch (e) {
      setPayError('Terjadi kesalahan saat memproses pelunasan.');
    } finally {
      setPayingBookingId(null);
    }
  };

  useEffect(() => {
    if (session) fetchBookings();
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-foreground animate-spin" />
          <p className="text-xs text-foreground/60 tracking-wide">Memuat data akun...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return ['PENDING', 'WAITING_DP', 'DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_RETURN', 'WAITING_PAYMENT'].includes(b.status);
    if (filterStatus === 'completed') return b.status === 'COMPLETED';
    if (filterStatus === 'cancelled') return ['CANCELLED', 'REJECTED'].includes(b.status);
    return b.status === filterStatus;
  });

  const activeCount = bookings.filter(b => ['PENDING', 'WAITING_DP', 'DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_PAYMENT'].includes(b.status)).length;
  const pendingPayCount = bookings.filter(b => getOutstanding(b) > 0 && !['CANCELLED', 'REJECTED', 'COMPLETED'].includes(b.status)).length;

  // ─── Status Timeline Component ───
  function StatusTimeline({ booking }: { booking: any }) {
    const meta = getStatusMeta(booking.status);
    const activeStep = meta.step;
    const isCancelled = ['CANCELLED', 'REJECTED'].includes(booking.status);

    return (
      <div className="relative">
        <div className="relative flex items-center justify-between mb-4 mt-2">
          {STATUS_STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = booking.status === 'COMPLETED' ? true : activeStep > stepNum;
            const isCurrent = booking.status === 'COMPLETED' ? (idx === STATUS_STEPS.length - 1) : (activeStep === stepNum);

            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={`absolute top-3.5 left-[50%] w-full h-[2px] -z-0 transition-colors duration-300 ${
                      isCancelled ? 'bg-red-200' : (isCompleted || booking.status === 'COMPLETED') ? 'bg-foreground' : 'bg-border'
                    }`}
                  />
                )}

                {/* Circle node */}
                <div
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-xs ${
                    isCancelled
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : isCompleted
                        ? 'bg-foreground border-foreground text-background shadow-xs'
                        : isCurrent
                          ? 'bg-background border-foreground text-foreground ring-2 ring-foreground/20'
                          : 'bg-background border-border text-foreground/30'
                  }`}
                >
                  {isCancelled ? (
                    <XCircle size={13} />
                  ) : isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-[10px] mt-2 text-center font-medium leading-tight max-w-[65px] ${
                    isCancelled
                      ? 'text-red-600'
                      : isCompleted
                        ? 'text-foreground font-semibold'
                        : isCurrent
                          ? 'text-foreground font-bold'
                          : 'text-foreground/40'
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
    <div className="min-h-screen bg-background text-foreground relative flex flex-col selection:bg-secondary selection:text-foreground">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-32 pb-20 relative z-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-foreground/50 mb-2 font-medium">
              <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
              <ChevronRight size={12} />
              <span className="text-foreground font-semibold">Riwayat Booking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Riwayat Sewa Mobil
            </h1>
            <p className="text-foreground/60 text-xs sm:text-sm mt-1">
              Pantau status pemesanan aktif, riwayat transaksi, dan bukti sewa Anda.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-foreground bg-card border border-border hover:bg-secondary active:scale-95 transition-all rounded-xl self-start md:self-auto cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Segarkan
          </button>
        </div>

        {/* ── Stats Strip ── */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6">
            {[
              { label: 'Total Pesanan', value: bookings.length, sub: 'semua status' },
              { label: 'Sedang Berjalan', value: activeCount, sub: 'dalam proses' },
              { label: 'Menunggu Pelunasan', value: pendingPayCount, sub: 'tagihan aktif' },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xs ${
                  i === 2 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <p className="text-[9px] sm:text-[10px] text-foreground/50 font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-lg sm:text-2xl font-black text-foreground mt-0.5">{s.value}</p>
                <p className="text-[9px] sm:text-[10px] text-foreground/60 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'active', label: 'Dalam Proses' },
            { id: 'completed', label: 'Selesai' },
            { id: 'cancelled', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-foreground text-background border-foreground shadow-xs'
                  : 'bg-card text-foreground/75 border-border hover:border-foreground/30 hover:bg-background'
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
            <div className="bg-card border border-border rounded-2xl py-16 flex flex-col items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-full border-2 border-border border-t-foreground animate-spin" />
              <p className="text-xs text-foreground/60 font-medium">Memuat riwayat booking...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-card border border-border rounded-2xl p-6 flex items-start gap-3.5 shadow-xs">
              <div className="p-2 bg-secondary rounded-xl shrink-0 text-foreground">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Gagal Mengambil Data</h4>
                <p className="text-xs text-foreground/60 mt-0.5">{error}</p>
                <button
                  onClick={fetchBookings}
                  className="mt-2 text-xs font-bold text-foreground hover:underline transition-colors cursor-pointer"
                >
                  Coba Lagi →
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredBookings.length === 0 && (
            <div className="bg-card border border-border rounded-2xl py-16 px-6 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto mb-3">
                <CalendarCheck size={24} className="text-foreground/40" />
              </div>
              <h3 className="text-base font-bold text-foreground">Belum Ada Riwayat Booking</h3>
              <p className="text-foreground/60 text-xs mt-1 max-w-xs mx-auto">
                Anda belum melakukan pemesanan atau tidak ada data pada kategori ini.
              </p>
              <Link href="/armada" className="inline-flex items-center gap-1.5 mt-5 bg-foreground hover:bg-foreground/90 text-background font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs">
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

            const carImages = booking.car?.images
              ? (typeof booking.car.images === 'string' ? JSON.parse(booking.car.images) : booking.car.images)
              : [];
            const carThumb = carImages[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800';

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/30 hover:shadow-sm transition-all duration-300 shadow-xs"
              >
                {/* ── Top Bar ── */}
                <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-border flex flex-wrap items-center justify-between gap-2.5 bg-card/70">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-secondary/50 text-foreground">
                      <FileText size={13} />
                    </div>
                    <div>
                      <p className="text-[9px] text-foreground/50 font-bold uppercase tracking-wider">ID Booking</p>
                      <p className="font-mono text-[11px] sm:text-xs font-bold text-foreground mt-0.5">{booking.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-secondary text-foreground border border-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                      {meta.label}
                    </span>

                    {/* Secondary badges */}
                    {booking.status === 'IN_PROGRESS' && outstanding > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-background text-foreground/80 border border-border">
                        <Clock size={10} />
                        Sisa Tagihan
                      </span>
                    )}
                    {booking.status === 'DP_CONFIRMED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-background text-foreground/80 border border-border">
                        <CheckCircle2 size={10} />
                        DP Diterima
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-3.5 sm:p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Col 1: Car Info */}
                    <div className="lg:col-span-4 space-y-2.5">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-background border border-border">
                        <img src={carThumb} alt={booking.car?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">{booking.car?.brand}</p>
                        <h4 className="text-base font-bold text-foreground mt-0.5 leading-tight">{booking.car?.name}</h4>
                        <span className="inline-block mt-1 bg-background text-foreground/70 text-[10px] font-medium px-2 py-0.5 rounded-md capitalize border border-border">
                          {booking.car?.category}
                        </span>
                      </div>
                    </div>

                    {/* Col 2: Booking Details */}
                    <div className="lg:col-span-4 space-y-3 border-t lg:border-t-0 lg:border-x border-border pt-4 lg:pt-0 lg:px-5 text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Detail Jadwal & Layanan</p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5 text-foreground/70">
                            <Calendar size={11} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-foreground">Jadwal Sewa</p>
                            <p className="text-[11px] text-foreground/70 mt-0.5 leading-relaxed">
                              {format(parseISO(booking.startDateTime || booking.startDate), 'd MMM yyyy', { locale: localeId })}
                              <span className="mx-1.5 text-foreground/40">→</span>
                              {format(parseISO(booking.endDateTime || booking.endDate), 'd MMM yyyy', { locale: localeId })}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-foreground bg-secondary/50 border border-border px-2 py-0.5 rounded-md">
                              {formatDuration(booking.durationMinutes ?? booking.duration)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5 text-foreground/70">
                            <Settings2 size={11} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-foreground">Tipe Layanan</p>
                            <p className="text-[11px] text-foreground/70 mt-0.5 capitalize">
                              {booking.serviceType?.replace('_', ' ').toLowerCase()}
                            </p>
                          </div>
                        </div>

                        {booking.pickupLocation && (
                          <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5 text-foreground/70">
                              <MapPin size={11} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-foreground">Titik Penjemputan</p>
                              <p className="text-[11px] text-foreground/70 mt-0.5">{booking.pickupLocation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 3: Payment Breakdown */}
                    <div className="lg:col-span-4 space-y-3 pt-4 lg:pt-0 text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Rincian Pembayaran</p>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-foreground/70">
                          <span>Sewa ({formatDuration(booking.durationMinutes ?? booking.duration)})</span>
                          <span>{formatRupiah(booking.basePrice)}</span>
                        </div>
                        {booking.discountAmount > 0 && (
                          <div className="flex justify-between text-foreground/70">
                            <span>Diskon Promo</span>
                            <span>−{formatRupiah(booking.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-foreground font-bold border-t border-border pt-1.5 text-xs">
                          <span>Total Tagihan</span>
                          <span>{formatRupiah(booking.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-foreground/70">
                          <span>DP Minimal (50%)</span>
                          <span>{formatRupiah(booking.dpAmount)}</span>
                        </div>
                      </div>

                      {/* Payment Progress Summary */}
                      <div className="border-t border-border pt-2.5 space-y-2">
                        <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2 border border-border">
                          <div>
                            <p className="text-[9px] text-foreground/50 font-bold uppercase tracking-wider">Sudah Terbayar</p>
                            <p className={`text-xs font-bold mt-0.5 ${paidAmount > 0 ? 'text-foreground' : 'text-foreground/40'}`}>
                              {formatRupiah(paidAmount)}
                            </p>
                          </div>
                          {paidAmount > 0 && (
                            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-foreground">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between rounded-xl px-3 py-2 border border-border bg-secondary/30">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">
                              {outstanding > 0 ? 'Sisa Tagihan' : 'Status Tagihan'}
                            </p>
                            <p className="text-xs font-black mt-0.5 text-foreground">
                              {outstanding > 0 ? formatRupiah(outstanding) : '✓ Lunas'}
                            </p>
                          </div>
                          {outstanding > 0 && ['WAITING_PAYMENT', 'IN_PROGRESS', 'DP_CONFIRMED'].includes(booking.status) && (
                            <Link href={`/pelunasan/${booking.id}`}>
                              <button className="text-[10px] font-bold bg-foreground hover:bg-foreground/90 text-background px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs">
                                Lunasi
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Status Timeline ── */}
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-3">
                      Tahapan Status Booking
                    </p>
                    <StatusTimeline booking={booking} />
                  </div>

                  {/* ── Action Banners ── */}

                  {/* 1. DP Pending — bukti sudah upload */}
                  {['PENDING', 'WAITING_DP'].includes(booking.status) && (() => {
                    const proofUrl = booking.paymentProof || booking.payments?.find((p: any) => p.proofImage)?.proofImage;
                    if (proofUrl) {
                      return (
                        <div className="mt-4 p-4 bg-background border border-border rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-foreground">
                              <Clock size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                Bukti DP ({formatRupiah(booking.dpAmount)}) Sudah Diunggah
                              </p>
                              <p className="text-[11px] text-foreground/60 mt-0.5">
                                Sedang diverifikasi oleh admin. Status akan berubah otomatis setelah disetujui.
                              </p>
                            </div>
                          </div>
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-card hover:bg-secondary text-foreground text-[10px] font-bold rounded-lg shrink-0 transition-colors border border-border"
                          >
                            Lihat Bukti
                          </a>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* 1b. DP Pending — belum bayar */}
                  {['PENDING', 'WAITING_DP'].includes(booking.status) && !(booking.paymentProof || booking.payments?.some((p: any) => p.proofImage)) && (
                    <div className="mt-4 p-4 bg-background border border-border rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-foreground">
                          <Landmark size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Silakan bayar DP sebesar <span className="font-extrabold text-foreground">{formatRupiah(booking.dpAmount)}</span> untuk konfirmasi pesanan
                          </p>
                          <p className="text-[11px] text-foreground/60 mt-0.5">
                            Metode: Pembayaran Instan Gateway (MIDTRANS QRIS/VA) atau Transfer Rekening
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePayDP(booking.id)}
                        disabled={payingBookingId === booking.id}
                        className="inline-flex items-center gap-1.5 bg-foreground hover:bg-foreground/90 text-background font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap disabled:opacity-50"
                      >
                        {payingBookingId === booking.id ? (
                          <><Loader2 size={12} className="animate-spin" /> Membuka Gateway...</>
                        ) : (
                          <><CreditCard size={12} /> Bayar DP Sekarang <ArrowRight size={12} /></>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 2. DP Confirmed */}
                  {booking.status === 'DP_CONFIRMED' && (
                    <div className="mt-4 p-4 bg-secondary/40 border border-border rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 text-foreground">
                          <CheckCircle2 size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            DP Berhasil Dikonfirmasi ({formatRupiah(booking.dpAmount)}) — Pesanan Telah Disetujui
                          </p>
                          <p className="text-[11px] text-foreground/60 mt-0.5">
                            Unit armada sedang disiapkan. Silakan ambil unit atau tunggu pengantaran sesuai jadwal pemesanan.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-foreground px-3 py-1 bg-card rounded-lg border border-border shrink-0">
                        Siap Diambil
                      </span>
                    </div>
                  )}

                  {/* 3. In Progress */}
                  {booking.status === 'IN_PROGRESS' && (
                    <div className="mt-4 p-4 bg-secondary/40 border border-border rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 text-foreground">
                          <Car size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Unit Sedang Digunakan (Masa Sewa Aktif)
                          </p>
                          <p className="text-[11px] text-foreground/60 mt-0.5">
                            Selamat menikmati perjalanan Anda! Pelunasan sisa tagihan dapat diselesaikan saat atau setelah pengembalian unit.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-foreground px-3 py-1 bg-card rounded-lg border border-border shrink-0">
                        Sewa Berjalan
                      </span>
                    </div>
                  )}

                  {/* 4. Waiting Payment */}
                  {(booking.status === 'WAITING_PAYMENT' || (outstanding > 0 && ['WAITING_RETURN', 'WAITING_PAYMENT'].includes(booking.status))) && (
                    <div className="mt-4 p-4 bg-background border border-border rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-foreground">
                          <Wallet size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Unit Selesai Digunakan — Sisa Tagihan Pelunasan: <span className="font-extrabold text-foreground">{formatRupiah(outstanding)}</span>
                          </p>
                          <p className="text-[11px] text-foreground/60 mt-0.5">
                            {booking.penaltyAmount > 0
                              ? `Termasuk penyesuaian biaya / denda keterlambatan. Silakan selesaikan pelunasan.`
                              : 'Pengembalian mobil telah diverifikasi oleh admin. Silakan selesaikan sisa pembayaran.'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePayPelunasan(booking.id)}
                        disabled={payingBookingId === booking.id}
                        className="inline-flex items-center gap-1.5 bg-foreground hover:bg-foreground/90 text-background font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap disabled:opacity-50"
                      >
                        {payingBookingId === booking.id ? (
                          <><Loader2 size={12} className="animate-spin" /> Membuka Gateway...</>
                        ) : (
                          <><CreditCard size={12} /> Bayar Pelunasan Sekarang <ArrowRight size={12} /></>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 5. Completed */}
                  {booking.status === 'COMPLETED' && (
                    <div className="mt-4 p-4 bg-secondary/30 border border-border rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 text-foreground">
                          <CheckCircle2 size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Transaksi Sewa Selesai & Lunas Sepenuhnya
                          </p>
                          <p className="text-[11px] text-foreground/60 mt-0.5">
                            Terima kasih telah mempercayakan perjalanan Anda kepada Rental Mobil!
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/invoice?bookingId=${booking.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-foreground text-background px-3.5 py-2 rounded-xl hover:bg-foreground/90 transition-colors shadow-xs shrink-0"
                      >
                        <FileText size={13} />
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
