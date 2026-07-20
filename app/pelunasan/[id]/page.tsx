'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { Button } from '@/components/ui/button';
import { BcaLogo } from '@/components/ui/bca-logo';
import {
  Car, CreditCard, Upload, ImageIcon, X, Building2, Copy, Check,
  AlertCircle, Landmark, CheckCircle2, ArrowLeft, Clock, Calendar,
  Loader2, MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatDuration } from '@/lib/utils';
import { motion } from 'framer-motion';

const BANK_ACCOUNTS = [
  {
    id: 'BCA',
    name: 'BCA',
    fullName: 'Bank Central Asia',
    number: process.env.NEXT_PUBLIC_BANK_BCA_NUMBER || '1234567890',
    accountName: process.env.NEXT_PUBLIC_BANK_BCA_NAME || 'PT RentalMobil Jogja',
    color: 'bg-transparent',
    logo: <BcaLogo />,
  },
  {
    id: 'BNI',
    name: 'BNI',
    fullName: 'Bank Negara Indonesia',
    number: process.env.NEXT_PUBLIC_BANK_BNI_NUMBER || '0987654321',
    accountName: process.env.NEXT_PUBLIC_BANK_BNI_NAME || 'PT RentalMobil Jogja',
    color: 'bg-orange-600',
    logo: <Landmark className="w-5 h-5 text-white" />,
  },
  {
    id: 'MANDIRI',
    name: 'Mandiri',
    fullName: 'Bank Mandiri',
    number: process.env.NEXT_PUBLIC_BANK_MANDIRI_NUMBER || '1122334455',
    accountName: process.env.NEXT_PUBLIC_BANK_MANDIRI_NAME || 'PT RentalMobil Jogja',
    color: 'bg-yellow-600',
    logo: <Building2 className="w-5 h-5 text-white" />,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700"
      aria-label="Salin nomor rekening"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getPaidAmount(booking: any): number {
  if (['COMPLETED'].includes(booking.status) || booking.fullPaid) {
    return booking.totalPrice + (booking.penaltyAmount || 0);
  }
  const verifiedPaymentTotal =
    booking.payments
      ?.filter((p: any) => p.status === 'VERIFIED')
      .reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;

  if (verifiedPaymentTotal > 0) return verifiedPaymentTotal;

  if (['DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_PAYMENT'].includes(booking.status)) {
    return booking.dpAmount || Math.floor(booking.totalPrice * 0.5);
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

  const [selectedBank, setSelectedBank] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/pelunasan/${bookingId}`);
    }
  }, [status, router, bookingId]);

  useEffect(() => {
    if (!bookingId || !session) return;
    setLoading(true);
    fetch(`/api/booking/${bookingId}/pelunasan`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setBooking(res.data);
        } else {
          setError(res.error || 'Gagal memuat data tagihan.');
        }
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
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
  };

  const handleSubmit = async () => {
    if (!selectedBank) {
      setSubmitError('Pilih metode pembayaran terlebih dahulu.');
      return;
    }
    if (!uploadedFile) {
      setSubmitError('Upload bukti transfer terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      let paymentProofUrl = uploadedPreview;
      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          paymentProofUrl = uploadData?.url || uploadedPreview;
        }
      } catch {
        // use base64 preview as fallback
      }

      const res = await fetch(`/api/booking/${bookingId}/pelunasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selectedBank + '_TRANSFER',
          paymentProof: paymentProofUrl,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(data.error || 'Gagal memproses pelunasan. Silakan coba lagi.');
      }
    } catch {
      setSubmitError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-zinc-500 text-sm mb-6">{error}</p>
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
  const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
  const remainingAmount = Math.max(0, totalBill - paidAmount);
  const startDate = booking.startDateTime ? parseISO(booking.startDateTime) : null;
  const endDate = booking.endDateTime ? parseISO(booking.endDateTime) : null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <BackgroundOrnaments />
        <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-zinc-200 rounded-3xl shadow-xl max-w-md w-full p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Pelunasan Berhasil!</h2>
            <p className="text-zinc-500 text-sm mb-6">
              Terima kasih! Pembayaran pelunasan sebesar{' '}
              <span className="font-bold text-zinc-900">{formatIDR(remainingAmount)}</span>{' '}
              telah kami terima dan sedang diproses.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 mb-6 text-left space-y-2">
              <div>
                <p className="text-xs text-zinc-500">Booking ID</p>
                <p className="font-mono text-xs font-bold text-zinc-700">{booking.id}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Kendaraan</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {booking.car?.brand} {booking.car?.name}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push('/riwayat-booking')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl"
              >
                Lihat Riwayat Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full border-zinc-200 text-zinc-700 h-12 rounded-xl"
              >
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      <Navbar />
      <BackgroundOrnaments />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-28 pb-16 relative z-10">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-900 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/riwayat-booking" className="hover:text-zinc-900 transition-colors">Riwayat Booking</Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold">Pelunasan</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400 hover:text-zinc-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900">Pelunasan Pembayaran</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Selesaikan pembayaran sisa tagihan sewa Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-900 rounded-xl">
                  <Car size={16} className="text-white" />
                </div>
                <h2 className="font-bold text-zinc-900">Detail Pemesanan</h2>
              </div>

              {booking.car?.images?.[0] && (
                <div className="mb-4 rounded-xl overflow-hidden bg-zinc-100 h-40">
                  <img
                    src={booking.car.images[0]}
                    alt={booking.car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-400">Kendaraan</p>
                  <p className="font-bold text-zinc-900">
                    {booking.car?.brand} {booking.car?.name}
                  </p>
                  <p className="text-xs text-zinc-500 capitalize">{booking.car?.category?.toLowerCase()}</p>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mb-0.5">
                      <Calendar size={10} /> Mulai
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">
                      {startDate ? format(startDate, 'dd MMM yyyy', { locale: localeId }) : '-'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {startDate ? format(startDate, 'HH:mm') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mb-0.5">
                      <Calendar size={10} /> Selesai
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">
                      {endDate ? format(endDate, 'dd MMM yyyy', { locale: localeId }) : '-'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {endDate ? format(endDate, 'HH:mm') : '-'}
                    </p>
                  </div>
                </div>

                {booking.durationMinutes && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                    <Clock size={13} className="text-zinc-400" />
                    <span>Durasi: {formatDuration(booking.durationMinutes)}</span>
                  </div>
                )}

                {booking.pickupLocation && (
                  <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                    <MapPin size={13} className="text-zinc-400" />
                    <span>{booking.pickupLocation}</span>
                  </div>
                )}

                <div className="h-px bg-zinc-100" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Total Tagihan</span>
                    <span className="font-semibold text-zinc-900">{formatIDR(totalBill)}</span>
                  </div>
                  {(booking.penaltyAmount > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Denda</span>
                      <span className="font-semibold text-red-600">{formatIDR(booking.penaltyAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Sudah Dibayar (DP)</span>
                    <span className="font-semibold text-emerald-600">- {formatIDR(paidAmount)}</span>
                  </div>
                  <div className="h-px bg-zinc-100" />
                  <div className="flex justify-between">
                    <span className="font-bold text-zinc-900">Sisa Tagihan</span>
                    <span className="text-xl font-black text-zinc-900">{formatIDR(remainingAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Booking ID</p>
                <p className="font-mono text-xs font-bold text-zinc-700">{booking.id}</p>
              </div>
              <CopyButton text={booking.id} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-900 rounded-xl">
                  <CreditCard size={16} className="text-white" />
                </div>
                <h2 className="font-bold text-zinc-900">Metode Pembayaran</h2>
              </div>

              <div className="space-y-3">
                {BANK_ACCOUNTS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBank(bank.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left',
                      selectedBank === bank.id
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bank.color, bank.id === 'BCA' ? 'bg-blue-50 border border-blue-100' : '')}>
                        {bank.logo}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{bank.fullName}</p>
                        <p className="text-xs text-zinc-500 font-mono">{bank.number}</p>
                        <p className="text-xs text-zinc-400">{bank.accountName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyButton text={bank.number} />
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center',
                        selectedBank === bank.id ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300'
                      )}>
                        {selectedBank === bank.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedBank && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4"
              >
                <p className="text-xs font-bold text-amber-800 mb-1">Transfer tepat sejumlah:</p>
                <p className="text-2xl font-black text-amber-900">{formatIDR(remainingAmount)}</p>
                <p className="text-xs text-amber-700 mt-1">
                  ke rekening {BANK_ACCOUNTS.find(b => b.id === selectedBank)?.fullName} &bull;{' '}
                  {BANK_ACCOUNTS.find(b => b.id === selectedBank)?.number}
                </p>
              </motion.div>
            )}

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-900 rounded-xl">
                  <Upload size={16} className="text-white" />
                </div>
                <h2 className="font-bold text-zinc-900">Bukti Transfer</h2>
              </div>

              {!uploadedPreview ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                    isDragActive ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50'
                  )}
                >
                  <input {...getInputProps()} />
                  <ImageIcon className="mx-auto w-8 h-8 text-zinc-400 mb-3" />
                  <p className="text-sm font-semibold text-zinc-700">
                    {isDragActive ? 'Letakkan file di sini' : 'Klik atau drag foto bukti transfer'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">JPG, PNG, WebP - Maks. 5MB</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-zinc-200">
                  <img src={uploadedPreview} alt="Bukti transfer" className="w-full h-48 object-contain bg-zinc-50" />
                  <button
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full border border-zinc-200 hover:bg-red-50 hover:border-red-200 text-zinc-500 hover:text-red-500 transition-all"
                  >
                    <X size={14} />
                  </button>
                  <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2">
                    <ImageIcon size={13} className="text-zinc-400" />
                    <span className="text-xs text-zinc-600 truncate">{uploadedFile?.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <label className="text-sm font-semibold text-zinc-700 block mb-2">Catatan (opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: transfer pada 12 Juli jam 14:00 dari BNI ..."
                className="w-full rounded-xl border border-zinc-200 text-sm text-zinc-700 placeholder:text-zinc-400 p-3 focus:outline-none focus:border-zinc-900 resize-none h-20"
              />
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
              >
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{submitError}</p>
              </motion.div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Konfirmasi Pelunasan
                </>
              )}
            </Button>

            <p className="text-center text-xs text-zinc-400">
              Dengan mengklik tombol di atas, Anda menyatakan telah melakukan pembayaran sisa tagihan
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}