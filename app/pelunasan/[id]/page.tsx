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
  AlertCircle, Landmark, CheckCircle2, ArrowLeft, Clock, Calendar,
  Loader2, MapPin, Receipt, ChevronRight, QrCode, Sparkles, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatDuration } from '@/lib/utils';
import { formatCurrency } from '@/lib/booking-status';
import { motion } from 'framer-motion';
import { openSnapPayment } from '@/lib/snap';

const BANK_ACCOUNTS = [
  { id: 'BCA', name: 'BCA', fullName: 'Bank Central Asia', number: process.env.NEXT_PUBLIC_BANK_BCA_NUMBER || '1234567890', accountName: process.env.NEXT_PUBLIC_BANK_BCA_NAME || 'PT RentalMobil Jogja', color: 'bg-transparent', logo: <BcaLogo /> },
  { id: 'BNI', name: 'BNI', fullName: 'Bank Negara Indonesia', number: process.env.NEXT_PUBLIC_BANK_BNI_NUMBER || '0987654321', accountName: process.env.NEXT_PUBLIC_BANK_BNI_NAME || 'PT RentalMobil Jogja', color: 'bg-orange-600', logo: <Landmark className="w-5 h-5 text-white" /> },
  { id: 'MANDIRI', name: 'Mandiri', fullName: 'Bank Mandiri', number: process.env.NEXT_PUBLIC_BANK_MANDIRI_NUMBER || '1122334455', accountName: process.env.NEXT_PUBLIC_BANK_MANDIRI_NAME || 'PT RentalMobil Jogja', color: 'bg-yellow-600', logo: <Building2 className="w-5 h-5 text-white" /> },
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
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-[#2a2548] transition-colors text-zinc-400 hover:text-white" aria-label="Salin nomor rekening">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
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

  useEffect(() => {
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

    if (paymentMode === 'INSTANT') {
      try {
        const txRes = await fetch('/api/payment/create-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, paymentType: 'FULL_PAYMENT' }),
        });
        const txData = await txRes.json();
        if (txData.isGatewayActive && txData.token) {
          await openSnapPayment(txData.token, {
            onSuccess: async (result) => {
              try {
                await fetch('/api/payment/confirm', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ bookingId, paymentType: 'FULL_PAYMENT', result }),
                });
              } catch (err) {}
              setSubmitted(true);
            },
            onPending: () => {
              setSubmitted(true);
            },
            onError: () => {
              setSubmitError('Pembayaran belum selesai. Silakan coba kembali.');
            },
          });
          return;
        } else {
          setSubmitError(txData.error || 'Gagal menginisialisasi pembayaran instan.');
        }
      } catch (err) {
        setSubmitError('Terjadi kesalahan saat memproses pembayaran instan.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

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
      <div className="min-h-screen bg-[#13112a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-[#13112a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
            <p className="text-zinc-400 text-sm mb-6">{error}</p>
            <Button onClick={() => router.push('/riwayat-booking')} variant="outline">
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#13112a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1b1838] border border-[#2a2548] rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Bukti Pelunasan Terkirim!</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Bukti pembayaran pelunasan sebesar{' '}
              <span className="font-bold text-white">{formatCurrency(remainingAmount)}</span>{' '}
              telah kami terima. Tim Admin akan memverifikasi pembayaran Anda.
            </p>
            <div className="bg-[#13112a]/60 border border-[#2a2548] rounded-2xl px-6 py-4 mb-6 text-left space-y-2">
              <div>
                <p className="text-xs text-zinc-500">Booking ID</p>
                <p className="font-mono text-xs font-bold text-zinc-300">{booking.id}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Kendaraan</p>
                <p className="text-sm font-semibold text-white">{booking.car?.brand} {booking.car?.name}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/riwayat-booking')}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-12 rounded-xl">
                Lihat Riwayat Booking
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}
                className="w-full border-[#2a2548] text-zinc-300 hover:text-white hover:border-white h-12 rounded-xl">
                Kembali ke Beranda
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13112a] relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-28 pb-16 relative z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
          <ChevronRight size={10} />
          <Link href="/riwayat-booking" className="hover:text-white transition-colors">Riwayat Booking</Link>
          <ChevronRight size={10} />
          <span className="text-white font-bold">Pelunasan</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()}
            className="p-2 hover:bg-[#2a2548] rounded-xl transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Pelunasan Pembayaran</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Selesaikan pembayaran sisa tagihan sewa Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN — Booking Details + Cost Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Booking Details Card */}
            <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#13112a] rounded-xl"><Car size={16} className="text-zinc-300" /></div>
                <h2 className="font-bold text-white">Detail Pemesanan</h2>
              </div>

              {(() => {
                const carImages = booking.car?.images ? (() => { try { return JSON.parse(booking.car.images); } catch { return null; } })() : null;
                const firstImage = Array.isArray(carImages) ? carImages[0] : null;
                return firstImage ? (
                  <div className="mb-4 rounded-xl overflow-hidden bg-[#13112a] h-40">
                    <img src={firstImage} alt={booking.car.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl overflow-hidden bg-[#13112a] h-40 flex items-center justify-center text-zinc-600">
                    <Car size={40} />
                  </div>
                );
              })()}

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-500">Kendaraan</p>
                  <p className="font-bold text-white">{booking.car?.brand} {booking.car?.name}</p>
                  <p className="text-xs text-zinc-400 capitalize">{booking.car?.category?.toLowerCase()}</p>
                </div>
                <div className="h-px bg-[#2a2548]" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mb-0.5"><Calendar size={10} /> Mulai</p>
                    <p className="text-sm font-semibold text-white">{startDate ? format(startDate, 'dd MMM yyyy', { locale: localeId }) : '-'}</p>
                    <p className="text-xs text-zinc-400">{startDate ? format(startDate, 'HH:mm') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mb-0.5"><Calendar size={10} /> Selesai</p>
                    <p className="text-sm font-semibold text-white">{endDate ? format(endDate, 'dd MMM yyyy', { locale: localeId }) : '-'}</p>
                    <p className="text-xs text-zinc-400">{endDate ? format(endDate, 'HH:mm') : '-'}</p>
                  </div>
                </div>
                {booking.durationMinutes && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Clock size={13} className="text-zinc-500" />
                    <span>Durasi: {formatDuration(booking.durationMinutes)}</span>
                  </div>
                )}
                {booking.pickupLocation && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <MapPin size={13} className="text-zinc-500" />
                    <span>{booking.pickupLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Breakdown Card — clear, line-by-line */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#13112a] rounded-xl"><Receipt size={16} className="text-zinc-300" /></div>
                <h2 className="font-bold text-white">Rincian Biaya</h2>
              </div>

              <div className="space-y-2">
                {/* Base Price */}
                <div className="flex justify-between text-sm py-1">
                  <span className="text-zinc-400">Harga Sewa</span>
                  <span className="font-semibold text-white">{formatCurrency(booking.totalPrice || 0)}</span>
                </div>

                {/* Penalty (if any) */}
                {penaltyAmount > 0 && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-red-400">Denda</span>
                    <span className="font-semibold text-red-400">+ {formatCurrency(penaltyAmount)}</span>
                  </div>
                )}

                {/* Extra Cost (if any) */}
                {extraCost > 0 && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-zinc-400">Biaya Tambahan</span>
                    <span className="font-semibold text-white">+ {formatCurrency(extraCost)}</span>
                  </div>
                )}

                {/* Subtle divider before total gross */}
                <div className="h-px bg-[#2a2548] my-1" />

                {/* Total Bill */}
                <div className="flex justify-between text-sm py-1">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-semibold text-white">{formatCurrency(totalBill)}</span>
                </div>

                {/* DP Paid */}
                <div className="flex justify-between text-sm py-1">
                  <span className="text-zinc-400">DP Dibayar</span>
                  <span className="font-semibold text-emerald-400">- {formatCurrency(paidAmount)}</span>
                </div>

                {/* Strong divider before final */}
                <div className="h-px bg-[#f97316]/30 my-2" />

                {/* Remaining — bold hero callout */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-base font-bold text-white">Sisa Tagihan</span>
                  <span className="text-2xl font-black text-[#f97316]">{formatCurrency(remainingAmount)}</span>
                </div>
              </div>
            </motion.div>

            {/* Booking ID */}
            <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Booking ID</p>
                <p className="font-mono text-xs font-bold text-zinc-300">{booking.id}</p>
              </div>
              <CopyButton text={booking.id} />
            </div>
          </motion.div>

          {/* RIGHT COLUMN — Payment Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            {/* Payment Method Selector */}
            <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#13112a] rounded-xl"><CreditCard size={16} className="text-zinc-300" /></div>
                <h2 className="font-bold text-white">Metode Pelunasan</h2>
              </div>

              {/* Mode Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('INSTANT')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
                    paymentMode === 'INSTANT'
                      ? 'border-[#f97316] bg-[#13112a] shadow-md shadow-[#f97316]/10'
                      : 'border-[#2a2548] bg-[#13112a]/50 hover:border-[#f97316]/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f97316]/20 text-[#f97316]">
                      <Sparkles size={11} /> Instan
                    </span>
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      paymentMode === 'INSTANT' ? 'border-[#f97316] bg-[#f97316]' : 'border-[#2a2548]'
                    )}>
                      {paymentMode === 'INSTANT' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">QRIS & Virtual Account</p>
                  <p className="text-xs text-zinc-400 mt-1">Konfirmasi otomatis via Midtrans Snap tanpa upload bukti.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('MANUAL')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
                    paymentMode === 'MANUAL'
                      ? 'border-[#f97316] bg-[#13112a] shadow-md shadow-[#f97316]/10'
                      : 'border-[#2a2548] bg-[#13112a]/50 hover:border-[#f97316]/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-400">
                      Manual
                    </span>
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      paymentMode === 'MANUAL' ? 'border-[#f97316] bg-[#f97316]' : 'border-[#2a2548]'
                    )}>
                      {paymentMode === 'MANUAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">Transfer Rekening Bank</p>
                  <p className="text-xs text-zinc-400 mt-1">Transfer langsung ke rekening kami & upload struk.</p>
                </button>
              </div>

              {/* Conditional body */}
              {paymentMode === 'INSTANT' ? (
                <div className="p-4 rounded-xl bg-[#13112a] border border-[#2a2548] space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 size={15} />
                    <span>Pembayaran Instan Otomatis</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Klik tombol di bawah untuk membuka jendela pembayaran Midtrans. Anda bisa scan QRIS (GoPay, OVO, BCA, Mandiri) dan transaksi langsung terverifikasi secara instan.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Pilih Rekening Tujuan</p>
                    {BANK_ACCOUNTS.map((bank) => (
                      <button key={bank.id} type="button" onClick={() => setSelectedBank(bank.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left',
                          selectedBank === bank.id
                            ? 'border-[#f97316] bg-[#f97316]/10'
                            : 'border-[#2a2548] hover:border-zinc-500 bg-[#13112a]/60'
                        )}>
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bank.color, bank.id === 'BCA' ? 'bg-blue-500/20 border border-blue-500/30' : '')}>
                            {bank.logo}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{bank.fullName}</p>
                            <p className="text-xs text-zinc-400 font-mono">{bank.number}</p>
                            <p className="text-xs text-zinc-500">{bank.accountName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CopyButton text={bank.number} />
                          <div className={cn('w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center', selectedBank === bank.id ? 'border-[#f97316] bg-[#f97316]' : 'border-zinc-500')}>
                            {selectedBank === bank.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Transfer Amount Reminder */}
                  {selectedBank && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-[#f97316]/10 border border-[#f97316]/30 rounded-2xl px-5 py-4">
                      <p className="text-xs font-bold text-[#f97316] mb-1">Transfer tepat sejumlah:</p>
                      <p className="text-2xl font-black text-[#f97316]">{formatCurrency(remainingAmount)}</p>
                      <p className="text-xs text-[#f97316]/80 mt-1">
                        ke rekening {BANK_ACCOUNTS.find(b => b.id === selectedBank)?.fullName} &bull;{' '}
                        {BANK_ACCOUNTS.find(b => b.id === selectedBank)?.number}
                      </p>
                    </motion.div>
                  )}

                  {/* Upload Bukti Transfer */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Upload Bukti Transfer</p>
                    {!uploadedPreview ? (
                      <div {...getRootProps()}
                        className={cn(
                          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                          isDragActive ? 'border-[#f97316] bg-[#f97316]/10' : 'border-[#2a2548] hover:border-zinc-500 hover:bg-[#2a2548]/30'
                        )}>
                        <input {...getInputProps()} />
                        <ImageIcon className="mx-auto w-8 h-8 text-zinc-500 mb-3" />
                        <p className="text-sm font-semibold text-zinc-300">{isDragActive ? 'Letakkan file di sini' : 'Klik atau drag foto bukti transfer'}</p>
                        <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WebP - Maks. 10MB</p>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-[#2a2548]">
                        <img src={uploadedPreview} alt="Bukti transfer" className="w-full h-48 object-contain bg-[#13112a]" />
                        <button onClick={removeFile}
                          className="absolute top-2 right-2 p-1.5 bg-[#1b1838]/90 backdrop-blur rounded-full border border-[#2a2548] hover:bg-red-500/20 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all">
                          <X size={14} />
                        </button>
                        <div className="px-4 py-2 bg-[#13112a]/60 border-t border-[#2a2548] flex items-center gap-2">
                          <ImageIcon size={13} className="text-zinc-500" />
                          <span className="text-xs text-zinc-400 truncate">{uploadedFile?.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Catatan (opsional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Misal: transfer pada 12 Juli jam 14:00 dari BNI ..."
                      className="w-full rounded-xl border border-[#2a2548] bg-[#13112a]/60 text-sm text-zinc-200 placeholder:text-zinc-500 p-3 focus:outline-none focus:border-[#f97316] resize-none h-20" />
                  </div>
                </>
              )}
            </div>

            {/* Submit Error */}
            {submitError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300 font-medium">{submitError}</p>
              </motion.div>
            )}

            {/* CTA — Final Payment */}
            <Button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-lg shadow-lg shadow-[#f97316]/20">
              {submitting ? (
                <><Loader2 size={20} className="animate-spin" /> Memproses...</>
              ) : (
                <><CheckCircle2 size={20} /> Konfirmasi Pelunasan Sekarang</>
              )}
            </Button>

            <p className="text-center text-xs text-zinc-500">
              Dengan mengklik tombol di atas, Anda menyatakan telah melakukan pembayaran sisa tagihan
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
