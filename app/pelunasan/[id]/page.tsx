'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { BcaLogo } from '@/components/ui/bca-logo';
import {
  Car, CreditCard, Upload, ImageIcon, X, Building2, Copy, Check,
  AlertCircle, Landmark, CheckCircle2, ArrowLeft, ArrowRight, Clock, Calendar,
  Loader2, MapPin, Receipt, ChevronRight, Sparkles, FileText, MessageSquare, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatDuration } from '@/lib/utils';
import { formatCurrency, getStatusMeta } from '@/lib/booking-status';
import { motion } from 'framer-motion';
import { CustomPaymentView } from '@/components/payment/CustomPaymentView';

const BANK_ACCOUNTS = [
  { id: 'BCA', name: 'BCA', fullName: 'Bank Central Asia', number: process.env.NEXT_PUBLIC_BANK_BCA_NUMBER || '1234567890', accountName: process.env.NEXT_PUBLIC_BANK_BCA_NAME || 'PT Rental Mobil Jogja', color: 'bg-transparent', logo: <BcaLogo /> },
  { id: 'BNI', name: 'BNI', fullName: 'Bank Negara Indonesia', number: process.env.NEXT_PUBLIC_BANK_BNI_NUMBER || '0987654321', accountName: process.env.NEXT_PUBLIC_BANK_BNI_NAME || 'PT Rental Mobil Jogja', color: 'bg-foreground/10', logo: <Landmark className="w-5 h-5 text-foreground" /> },
  { id: 'MANDIRI', name: 'Mandiri', fullName: 'Bank Mandiri', number: process.env.NEXT_PUBLIC_BANK_MANDIRI_NUMBER || '1122334455', accountName: process.env.NEXT_PUBLIC_BANK_MANDIRI_NAME || 'PT Rental Mobil Jogja', color: 'bg-foreground/10', logo: <Building2 className="w-5 h-5 text-foreground" /> },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground/50 hover:text-foreground cursor-pointer" aria-label="Salin nomor rekening">
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
    </button>
  );
}

function getPaidAmount(booking: any): number {
  if (['COMPLETED'].includes(booking.status) || booking.fullPaid) {
    return (booking.totalPrice || 0) + (booking.penaltyAmount || 0) + (booking.extraCost || 0);
  }
  const verifiedPaymentTotal = booking.payments?.filter((p: any) => p.status === 'VERIFIED').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) ?? 0;
  if (verifiedPaymentTotal > 0) return verifiedPaymentTotal;
  if (['DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_PAYMENT'].includes(booking.status)) {
    return booking.dpAmount || Math.floor((booking.totalPrice || 0) * 0.5);
  }
  return 0;
}

export default function PelunasanPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'INSTANT' | 'MANUAL'>('INSTANT');
  const [selectedBank, setSelectedBank] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push(`/login?callbackUrl=/pelunasan/${bookingId}`);
  }, [status, router, bookingId]);

  const fetchBookingData = useCallback(() => {
    if (!bookingId || !session) return;
    setLoading(true);
    fetch(`/api/booking/${bookingId}/pelunasan`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBooking(res.data);
        else setError(res.error || 'Gagal memuat data tagihan.');
      })
      .catch(() => setError('Gagal menghubungi server.'))
      .finally(() => setLoading(false));
  }, [bookingId, session]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setUploadedPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  const removeFile = () => { setUploadedFile(null); setUploadedPreview(null); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    // Manual Mode
    if (!selectedBank) { setSubmitError('Pilih rekening tujuan terlebih dahulu.'); setSubmitting(false); return; }
    if (!uploadedFile && !uploadedPreview) { setSubmitError('Upload bukti transfer terlebih dahulu.'); setSubmitting(false); return; }

    try {
      let paymentProofUrl = uploadedPreview;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        try {
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            paymentProofUrl = uploadData?.url || uploadedPreview;
          }
        } catch { /* use base64 preview as fallback */ }
      }

      const res = await fetch(`/api/booking/${bookingId}/pelunasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedBank + '_TRANSFER', paymentProof: paymentProofUrl, notes }),
      });
      const data = await res.json();
      if (res.ok && data.success) setSubmitted(true);
      else setSubmitError(data.error || 'Gagal memproses pelunasan. Silakan coba lagi.');
    } catch { setSubmitError('Terjadi kesalahan koneksi. Silakan coba lagi.'); }
    finally { setSubmitting(false); }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mb-2" />
          <p className="text-xs text-foreground/60">Memuat rincian pelunasan...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
          <div className="text-center max-w-sm bg-card border border-border p-8 rounded-2xl shadow-xs">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-1">Terjadi Kesalahan</h2>
            <p className="text-foreground/60 text-xs mb-5">{error}</p>
            <Button onClick={() => router.push('/riwayat-booking')} variant="outline" className="border-border text-foreground hover:bg-secondary text-xs rounded-xl">
              Kembali ke Riwayat Booking
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) return null;

  const paidAmount = getPaidAmount(booking);
  const penaltyAmount = booking.penaltyAmount || 0;
  const extraCost = booking.extraCost || 0;
  const totalBill = (booking.totalPrice || 0) + penaltyAmount + extraCost;
  const remainingAmount = Math.max(0, totalBill - paidAmount);
  const startDate = booking.startDateTime ? parseISO(booking.startDateTime) : null;
  const endDate = booking.endDateTime ? parseISO(booking.endDateTime) : null;

  const isFullyPaid = remainingAmount <= 0 || booking.fullPaid || booking.status === 'COMPLETED';
  const isWaitingPayment = booking.status === 'WAITING_PAYMENT';
  const isEarlyPhase = !isFullyPaid && !isWaitingPayment;

  // 1. STATE: SUBMITTED SUCCESS
  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-secondary selection:text-foreground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-16 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl shadow-sm max-w-md w-full p-8 text-center">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-2">Pelunasan Berhasil Diproses!</h2>
            <p className="text-foreground/70 text-xs sm:text-sm mb-6 leading-relaxed">
              Pelunasan pembayaran sejumlah{' '}
              <span className="font-extrabold text-foreground">{formatCurrency(remainingAmount)}</span>{' '}
              telah kami catat. Tim Admin akan memverifikasi status pembayaran Anda secepatnya.
            </p>
            <div className="bg-background border border-border rounded-2xl px-5 py-4 mb-6 text-left space-y-2">
              <div>
                <p className="text-[10px] text-foreground/50 uppercase font-bold">Booking ID</p>
                <p className="font-mono text-xs font-bold text-foreground">{booking.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/50 uppercase font-bold">Armada Kendaraan</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground">{booking.car?.brand} {booking.car?.name}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <Button onClick={() => router.push('/riwayat-booking')}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold h-11 rounded-xl text-xs shadow-xs">
                Lihat Riwayat Booking
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}
                className="w-full border-border text-foreground hover:bg-secondary h-11 rounded-xl text-xs">
                Kembali ke Beranda
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // 2. STATE: FULLY PAID (SUDAH LUNAS — NO ACTIVE BILLING)
  if (isFullyPaid) {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col selection:bg-secondary selection:text-foreground">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-32 pb-16 relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
          >
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Status: Pembayaran Lunas
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Sewa Kendaraan Telah Lunas
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-md mx-auto">
                Seluruh kewajiban pembayaran untuk pemesanan ini telah selesai diverifikasi. Tidak ada tagihan yang tertunda.
              </p>
            </div>

            {/* Car & Booking Snapshot */}
            <div className="bg-secondary/40 border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
              {(() => {
                const carImages = booking.car?.images ? (() => { try { return JSON.parse(booking.car.images); } catch { return null; } })() : null;
                const firstImage = Array.isArray(carImages) ? carImages[0] : null;
                return firstImage ? (
                  <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-background border border-border shrink-0">
                    <img src={firstImage} alt={booking.car.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full sm:w-32 h-24 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/40 shrink-0">
                    <Car size={28} />
                  </div>
                );
              })()}

              <div className="flex-1 text-center sm:text-left space-y-1">
                <h3 className="font-bold text-foreground text-sm sm:text-base">
                  {booking.car?.brand} {booking.car?.name}
                </h3>
                <p className="text-xs text-foreground/60 capitalize">
                  {booking.serviceType === 'LEPAS_KUNCI' ? 'Lepas Kunci' : 'Dengan Driver'} &bull; {booking.durationMinutes ? formatDuration(booking.durationMinutes) : '1 Hari'}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-[11px] text-foreground/70">
                  <span>ID: {booking.id}</span>
                  <CopyButton text={booking.id} />
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                <Receipt size={15} /> Ringkasan Pembayaran
              </h4>
              <div className="space-y-2 text-xs divide-y divide-border/60">
                <div className="flex justify-between pt-1">
                  <span className="text-foreground/70">Harga Sewa Pokok</span>
                  <span className="font-semibold text-foreground">{formatCurrency(booking.totalPrice || 0)}</span>
                </div>
                {penaltyAmount > 0 && (
                  <div className="flex justify-between pt-2 text-red-600">
                    <span>Denda Keterlambatan</span>
                    <span className="font-semibold">+ {formatCurrency(penaltyAmount)}</span>
                  </div>
                )}
                {extraCost > 0 && (
                  <div className="flex justify-between pt-2 text-foreground/70">
                    <span>Biaya Tambahan</span>
                    <span className="font-semibold">+ {formatCurrency(extraCost)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-foreground/70">Total Terbayar</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(totalBill)}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="font-bold text-foreground">Sisa Tagihan</span>
                  <span className="font-black text-emerald-600 text-lg">Rp 0 (LUNAS)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => router.push(`/invoice?bookingId=${booking.id}`)}
                className="flex-1 bg-foreground hover:bg-foreground/90 text-background font-bold h-12 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <FileText size={15} /> Lihat &amp; Cetak Invoice Resmi
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/riwayat-booking')}
                className="flex-1 border-border text-foreground hover:bg-secondary h-12 rounded-xl text-xs font-bold"
              >
                Kembali ke Riwayat Booking
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // 3. STATE: EARLY PHASE (PELUNASAN DITAGIHKAN SAAT PENGEMBALIAN OLEH ADMIN)
  if (isEarlyPhase) {
    const statusMeta = getStatusMeta(booking.status);
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col selection:bg-secondary selection:text-foreground">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-32 pb-16 relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-7"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-secondary text-foreground rounded-full flex items-center justify-center mx-auto border border-border">
                <Clock size={32} />
              </div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary text-foreground border border-border">
                {statusMeta.label}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Pelunasan Ditagihkan Saat Pengembalian Mobil
              </h1>
              <p className="text-xs sm:text-sm text-foreground/70 max-w-md mx-auto leading-relaxed">
                Sesuai prosedur rental, penagihan pelunasan akan diterbitkan oleh <strong>Admin saat proses pengembalian kendaraan</strong> untuk memperhitungkan durasi pemakaian aktual dan denda keterlambatan (jika ada).
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-secondary/40 border border-border rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck size={16} /> Alur Pembayaran &amp; Penyewaan:
              </div>
              <ul className="space-y-2 text-foreground/70 list-disc list-inside leading-relaxed text-[11px] sm:text-xs">
                <li><strong>DP 50%:</strong> Telah dibayarkan / diverifikasi pada tahap awal pemesanan.</li>
                <li><strong>Masa Sewa:</strong> Mobil digunakan sesuai jadwal yang telah dikonfirmasi.</li>
                <li><strong>Pengembalian &amp; Pelunasan:</strong> Saat pengembalian mobil, Admin akan memverifikasi kondisi unit, waktu pengembalian aktual, dan menerbitkan tagihan pelunasan akhir.</li>
              </ul>
            </div>

            {/* Unit Details */}
            <div className="bg-background border border-border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-foreground/50 uppercase font-bold">Armada Kendaraan</p>
                <p className="font-bold text-foreground text-sm">{booking.car?.brand} {booking.car?.name}</p>
                <p className="text-xs text-foreground/60 mt-0.5">DP Dibayar: {formatCurrency(paidAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-foreground/50 uppercase font-bold">Booking ID</p>
                <p className="font-mono text-xs font-bold text-foreground">{booking.id}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => router.push('/riwayat-booking')}
                className="flex-1 bg-foreground hover:bg-foreground/90 text-background font-bold h-12 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ArrowLeft size={15} /> Kembali ke Riwayat Booking
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // 4. STATE: WAITING_PAYMENT (ADMIN HAS BILLED SETTLEMENT + PENALTIES)
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col selection:bg-secondary selection:text-foreground">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-32 pb-16 relative z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-foreground/50 mb-6 font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
          <ChevronRight size={11} />
          <Link href="/riwayat-booking" className="hover:text-foreground transition-colors">Riwayat Booking</Link>
          <ChevronRight size={11} />
          <span className="text-foreground font-semibold">Pelunasan</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-xl transition-colors text-foreground/60 hover:text-foreground cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Pelunasan Pembayaran</h1>
            <p className="text-foreground/60 text-xs sm:text-sm mt-0.5">Selesaikan tagihan pelunasan akhir yang telah diterbitkan admin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN — Booking Details + Cost Breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Booking Details Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-secondary/50 rounded-xl text-foreground"><Car size={16} /></div>
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">Detail Pemesanan</h2>
              </div>

              {(() => {
                const carImages = booking.car?.images ? (() => { try { return JSON.parse(booking.car.images); } catch { return null; } })() : null;
                const firstImage = Array.isArray(carImages) ? carImages[0] : null;
                return firstImage ? (
                  <div className="mb-4 rounded-xl overflow-hidden bg-background h-44 border border-border">
                    <img src={firstImage} alt={booking.car.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl overflow-hidden bg-background h-44 flex items-center justify-center text-foreground/30 border border-border">
                    <Car size={36} />
                  </div>
                );
              })()}

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] text-foreground/50 uppercase font-bold">Unit Armada</p>
                  <p className="font-bold text-foreground text-sm">{booking.car?.brand} {booking.car?.name}</p>
                  <p className="text-xs text-foreground/60 capitalize">{booking.car?.category?.toLowerCase()}</p>
                </div>
                <div className="h-px bg-border" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-foreground/50 flex items-center gap-1 mb-0.5"><Calendar size={11} /> Mulai</p>
                    <p className="font-semibold text-foreground">{startDate ? format(startDate, 'dd MMM yyyy', { locale: localeId }) : '-'}</p>
                    <p className="text-foreground/50">{startDate ? format(startDate, 'HH:mm') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-foreground/50 flex items-center gap-1 mb-0.5"><Calendar size={11} /> Selesai</p>
                    <p className="font-semibold text-foreground">{endDate ? format(endDate, 'dd MMM yyyy', { locale: localeId }) : '-'}</p>
                    <p className="text-foreground/50">{endDate ? format(endDate, 'HH:mm') : '-'}</p>
                  </div>
                </div>
                {booking.durationMinutes && (
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <Clock size={13} className="text-foreground/50" />
                    <span>Durasi Sewa: {formatDuration(booking.durationMinutes)}</span>
                  </div>
                )}
                {booking.pickupLocation && (
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <MapPin size={13} className="text-foreground/50" />
                    <span>Lokasi: {booking.pickupLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Breakdown Card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-secondary/50 rounded-xl text-foreground"><Receipt size={16} /></div>
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">Rincian Biaya</h2>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                {/* Base Price */}
                <div className="flex justify-between py-1">
                  <span className="text-foreground/70">Harga Sewa</span>
                  <span className="font-semibold text-foreground">{formatCurrency(booking.totalPrice || 0)}</span>
                </div>

                {/* Penalty */}
                {penaltyAmount > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-red-600 font-semibold">Denda Keterlambatan</span>
                    <span className="font-bold text-red-600">+ {formatCurrency(penaltyAmount)}</span>
                  </div>
                )}

                {/* Extra Cost */}
                {extraCost > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-foreground/70">Biaya Tambahan</span>
                    <span className="font-semibold text-foreground">+ {formatCurrency(extraCost)}</span>
                  </div>
                )}

                <div className="h-px bg-border my-1" />

                {/* Total Bill */}
                <div className="flex justify-between py-1">
                  <span className="text-foreground/70">Total Tagihan</span>
                  <span className="font-semibold text-foreground">{formatCurrency(totalBill)}</span>
                </div>

                {/* DP Paid */}
                <div className="flex justify-between py-1">
                  <span className="text-foreground/70">DP yang Telah Dibayar</span>
                  <span className="font-semibold text-emerald-600">- {formatCurrency(paidAmount)}</span>
                </div>

                <div className="h-px bg-border my-2" />

                {/* Remaining */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold text-foreground">Sisa yang Harus Dilunasi</span>
                  <span className="text-2xl font-black text-foreground">{formatCurrency(remainingAmount)}</span>
                </div>
              </div>
            </motion.div>

            {/* Booking ID */}
            <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] text-foreground/50 uppercase font-bold">Booking ID</p>
                <p className="font-mono text-xs font-bold text-foreground">{booking.id}</p>
              </div>
              <CopyButton text={booking.id} />
            </div>
          </motion.div>

          {/* RIGHT COLUMN — Payment Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            {/* Payment Method Selector Card */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-secondary/50 rounded-xl text-foreground"><CreditCard size={16} /></div>
                  <div>
                    <h2 className="font-bold text-foreground text-xs sm:text-sm uppercase tracking-wide">Metode Pelunasan</h2>
                    <p className="text-[11px] text-foreground/60">Pilih opsi pembayaran pelunasan</p>
                  </div>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMode('INSTANT')}
                  className={cn(
                    'p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
                    paymentMode === 'INSTANT'
                      ? 'border-foreground bg-secondary/40 shadow-xs ring-1 ring-foreground/20'
                      : 'border-border bg-background hover:border-foreground/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-foreground text-background">
                      <Sparkles size={9} /> Instan
                    </span>
                    <div className={cn(
                      'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0',
                      paymentMode === 'INSTANT' ? 'border-foreground bg-foreground' : 'border-border'
                    )}>
                      {paymentMode === 'INSTANT' && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">QRIS &amp; Virtual Account</p>
                  <p className="text-[10px] text-foreground/60 mt-0.5">Otomatis via Midtrans Sandbox.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('MANUAL')}
                  className={cn(
                    'p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
                    paymentMode === 'MANUAL'
                      ? 'border-foreground bg-secondary/40 shadow-xs ring-1 ring-foreground/20'
                      : 'border-border bg-background hover:border-foreground/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-secondary text-foreground border border-border">
                      Manual
                    </span>
                    <div className={cn(
                      'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0',
                      paymentMode === 'MANUAL' ? 'border-foreground bg-foreground' : 'border-border'
                    )}>
                      {paymentMode === 'MANUAL' && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">Transfer Rekening</p>
                  <p className="text-[10px] text-foreground/60 mt-0.5">Upload struk / bukti transfer.</p>
                </button>
              </div>

              {/* Conditional body */}
              {paymentMode === 'INSTANT' ? (
                <div className="pt-1">
                  <CustomPaymentView
                    bookingId={bookingId}
                    paymentType="FULL_PAYMENT"
                    amount={remainingAmount}
                    carName={booking.car?.name}
                    onSuccess={() => setSubmitted(true)}
                  />
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {/* Pilih Bank */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider">
                      Pilih Rekening Tujuan Transfer
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {BANK_ACCOUNTS.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={cn(
                            'p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer',
                            selectedBank === bank.id
                              ? 'border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs'
                              : 'border-border bg-background hover:border-foreground/30'
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-background">
                            {bank.logo}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-foreground block truncate">{bank.fullName}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="font-mono text-xs font-bold text-foreground truncate">{bank.number}</span>
                              <CopyButton text={bank.number} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Bukti */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider">
                      Upload Bukti Transfer Manual
                    </p>

                    {!uploadedPreview ? (
                      <div
                        {...getRootProps()}
                        className={cn(
                          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
                          isDragActive ? 'border-foreground bg-secondary/40' : 'border-border bg-background hover:border-foreground/40'
                        )}
                      >
                        <input {...getInputProps()} />
                        <div className="p-3 bg-secondary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-foreground">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-bold text-foreground">Klik atau Tarik Foto Bukti Transfer</p>
                        <p className="text-[10px] text-foreground/50 mt-0.5">JPG, PNG, WEBP (Maks 10MB)</p>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-border bg-background">
                        <img src={uploadedPreview} alt="Bukti Transfer" className="w-full max-h-48 object-contain" />
                        <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xs px-3 py-2 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span className="text-foreground text-[11px] font-semibold truncate max-w-40">
                              {uploadedFile?.name || 'Bukti transfer'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-1 rounded-lg hover:bg-secondary text-foreground/60 hover:text-foreground cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Catatan */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-foreground/60 uppercase tracking-wider">
                      Catatan Pembayaran (Opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Ditransfer via mobile banking BCA atas nama ..."
                      className="w-full rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-foreground/40 p-3 focus:outline-none focus:border-foreground/50 resize-none h-20"
                    />
                  </div>

                  {/* Submit Error */}
                  {submitError && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p className="text-xs font-semibold">{submitError}</p>
                    </motion.div>
                  )}

                  {/* CTA — Final Payment */}
                  <Button onClick={handleSubmit} disabled={submitting}
                    className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm shadow-xs cursor-pointer">
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Mengirim Bukti Transfer...</>
                    ) : (
                      <><CreditCard size={16} /> Konfirmasi Pembayaran Manual <ArrowRight size={16} /></>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <p className="text-center text-[11px] text-foreground/50">
              Dengan mengklik konfirmasi, Anda menyatakan data pembayaran yang dimasukkan sudah benar.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
