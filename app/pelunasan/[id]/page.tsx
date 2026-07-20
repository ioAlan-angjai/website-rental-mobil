'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Building2, CheckCircle2, Clock,
  ArrowRight, ShieldCheck, Copy, Check, Upload,
  AlertCircle, ChevronLeft, Car, Calendar, FileText, Landmark
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatDuration, cn } from '@/lib/utils';

interface BankAccount {
  id: string;
  name: string;
  fullName: string;
  number: string;
  accountName: string;
  color: string;
  logo: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'BCA',
    name: 'BCA',
    fullName: 'Bank Central Asia',
    number: '8830-1234-5678',
    accountName: 'PT RENTAL MOBIL INDONESIA',
    color: 'bg-blue-600 text-white',
    logo: '🏦',
  },
  {
    id: 'MANDIRI',
    name: 'Mandiri',
    fullName: 'Bank Mandiri',
    number: '137-00-9876543-2',
    accountName: 'PT RENTAL MOBIL INDONESIA',
    color: 'bg-yellow-500 text-white',
    logo: '💳',
  },
  {
    id: 'BNI',
    name: 'BNI',
    fullName: 'Bank Negara Indonesia',
    number: '0123-4567-8901',
    accountName: 'PT RENTAL MOBIL INDONESIA',
    color: 'bg-orange-500 text-white',
    logo: '🏛️',
  },
  {
    id: 'QRIS',
    name: 'QRIS',
    fullName: 'QRIS Instant Payment (Semua E-Wallet / Mobile Banking)',
    number: 'ID1024354657689',
    accountName: 'RENTAL MOBIL OFFICIAL',
    color: 'bg-zinc-900 text-white',
    logo: '📱',
  },
];

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copied ? 'Tersalin!' : 'Salin'}
    </button>
  );
}

export default function PelunasanPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedBank, setSelectedBank] = useState('BCA');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    setLoading(true);
    fetch(`/api/booking/${bookingId}/pelunasan`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBooking(data.data);
        } else {
          setError(data.error || 'Pemesanan tidak ditemukan');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Gagal terhubung ke server.');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPelunasan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking/${booking.id}/pelunasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selectedBank,
          paymentProof: proofPreview || null,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal memproses pelunasan');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/riwayat-booking');
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses pelunasan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-zinc-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-between">
        <Navbar />
        <BackgroundOrnaments />
        <div className="max-w-2xl mx-auto px-4 pt-32 pb-20 relative z-10 text-center">
          <div className="bg-white border border-rose-200 rounded-3xl p-8 shadow-sm">
            <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-zinc-900">Tagihan Tidak Ditemukan</h2>
            <p className="text-sm text-zinc-500 mt-1">{error || 'ID Tagihan tidak valid'}</p>
            <Link href="/riwayat-booking" className="inline-block mt-6 px-6 py-2.5 bg-zinc-900 text-white font-bold text-xs rounded-xl">
              Kembali ke Riwayat Booking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Hitung komponen tagihan
  const verifiedPaymentTotal = booking.payments
    ?.filter((p: any) => p.status === 'VERIFIED')
    .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  const dpPaidAmount = verifiedPaymentTotal > 0
    ? verifiedPaymentTotal
    : (['DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_PAYMENT', 'COMPLETED'].includes(booking.status) || booking.paymentProof)
    ? booking.dpAmount
    : 0;

  const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
  const remainingAmount = Math.max(0, totalBill - dpPaidAmount);
  const activeBank = BANK_ACCOUNTS.find((b) => b.id === selectedBank) || BANK_ACCOUNTS[0];

  const carImages = booking.car?.images
    ? (typeof booking.car.images === 'string'
        ? JSON.parse(booking.car.images)
        : booking.car.images)
    : [];
  const carThumb = carImages[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800';

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-between text-zinc-900">
      <div>
        <Navbar />
        <BackgroundOrnaments />

        <div className="max-w-6xl mx-auto px-4 pt-28 pb-16 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <Link href="/riwayat-booking" className="hover:text-zinc-950 flex items-center gap-1 transition-colors">
                  <ChevronLeft size={14} /> Riwayat Booking
                </Link>
                <span>/</span>
                <span className="text-zinc-950 font-bold">Penagihan Pelunasan</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">
                Form Pelunasan Sisa Tagihan
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Selesaikan pembayaran sisa sewa mobil Anda secara aman dan instan.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2 text-amber-900 text-xs font-bold self-start md:self-auto">
              <Clock size={16} className="text-amber-600 shrink-0" />
              ID Pemesanan: <span className="font-mono">{booking.id}</span>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-emerald-500 text-white rounded-3xl shadow-lg flex items-center gap-4"
              >
                <CheckCircle2 size={36} className="shrink-0" />
                <div>
                  <h3 className="text-lg font-bold">Pembayaran Pelunasan Berhasil Dikirim!</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Terima kasih telah melunasi tagihan sewa. Anda akan dialihkan ke halaman Riwayat Booking...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Pembayaran (Left 7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Alert Info Pelunasan */}
              <div className="p-5 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                  <Landmark size={18} className="text-emerald-600" />
                  Instruksi Pelunasan Tagihan
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Penyewaan unit mobil ini telah selesai atau sedang dalam tahap pengembalian. Silakan transfer nominal sisa pelunasan di bawah ke salah satu rekening resmi kami.
                </p>
              </div>

              {/* 1. Pilih Rekening */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Building2 size={18} className="text-zinc-900" />
                  <h3 className="text-sm font-bold text-zinc-900">
                    1. Pilih Rekening Tujuan Transfer
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {BANK_ACCOUNTS.map((bank) => (
                    <motion.button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      className={cn(
                        'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 cursor-pointer',
                        selectedBank === bank.id
                          ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      )}
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0', bank.color)}>
                        {bank.logo}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-xs">{bank.fullName}</span>
                          {selectedBank === bank.id && (
                            <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-full font-bold">Dipilih</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-sm font-bold text-zinc-900 tracking-wider">
                            {bank.number}
                          </span>
                          <CopyButton text={bank.number} />
                        </div>
                        <p className="text-[10px] text-zinc-400">a.n. {bank.accountName}</p>
                      </div>

                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center',
                        selectedBank === bank.id ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300'
                      )}>
                        {selectedBank === bank.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Account details panel */}
                <div className="mt-4 p-4 rounded-2xl bg-zinc-900 text-white space-y-2">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Nominal yang Harus Ditransfer</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white">{formatIDR(remainingAmount)}</span>
                    <CopyButton text={remainingAmount.toString()} />
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                    Transfer ke <strong className="text-white">{activeBank.fullName}</strong> ({activeBank.number}) a.n. {activeBank.accountName}
                  </p>
                </div>
              </div>

              {/* 2. Upload Bukti Pelunasan */}
              <form onSubmit={handleSubmitPelunasan} className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Upload size={18} className="text-zinc-900" />
                  <h3 className="text-sm font-bold text-zinc-900">
                    2. Unggah Bukti Pelunasan Transfer
                  </h3>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-zinc-700">
                    Foto / Screenshot Bukti Transfer <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-2xl p-6 text-center bg-zinc-50/50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {proofPreview ? (
                      <div className="space-y-3">
                        <img
                          src={proofPreview}
                          alt="Preview Bukti Transfer"
                          className="max-h-48 mx-auto rounded-xl border border-zinc-200 shadow-sm object-contain"
                        />
                        <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 size={14} /> Bukti transfer terpilih
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto">
                          <Upload size={20} />
                        </div>
                        <p className="text-xs font-bold text-zinc-900">Klik atau seret foto bukti transfer di sini</p>
                        <p className="text-[10px] text-zinc-400">Format: JPG, PNG, WEBP (Maks 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">Catatan Pelunasan (Opsional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Pelunasan via Mobile Banking BCA a.n Budi"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      'Memproses Pelunasan...'
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Kirim Bukti Pelunasan ({formatIDR(remainingAmount)})
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Resume Card (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-5 shadow-sm sticky top-28">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
                  Ringkasan Tagihan & Unit
                </h3>

                {/* Mobil Details */}
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-16 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                    <img src={carThumb} alt={booking.car?.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">{booking.car?.brand}</p>
                    <h4 className="font-bold text-zinc-900 text-sm">{booking.car?.name}</h4>
                    <span className="text-[10px] bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded-md font-medium capitalize">
                      {booking.serviceType?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Dates & Duration */}
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-xs space-y-2 text-zinc-650">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold mb-1">
                    <Calendar size={14} className="text-zinc-500" /> Periode Sewa
                  </div>
                  <div className="flex justify-between">
                    <span>Mulai:</span>
                    <span className="font-semibold text-zinc-900">
                      {format(parseISO(booking.startDateTime || booking.startDate), 'd MMM yyyy', { locale: localeId })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selesai:</span>
                    <span className="font-semibold text-zinc-900">
                      {format(parseISO(booking.endDateTime || booking.endDate), 'd MMM yyyy', { locale: localeId })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-2">
                    <span>Durasi Total:</span>
                    <span className="font-bold text-zinc-950">{formatDuration(booking.durationMinutes ?? booking.duration)}</span>
                  </div>
                </div>

                {/* Rincian Perhitungan Total */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Sewa Dasar Unit</span>
                    <span>{formatIDR(booking.basePrice)}</span>
                  </div>

                  {booking.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Diskon</span>
                      <span>-{formatIDR(booking.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-900 font-bold border-t border-zinc-100 pt-2">
                    <span>Total Biaya Sewa</span>
                    <span>{formatIDR(booking.totalPrice)}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>DP (50%) Terbayar</span>
                    <span>-{formatIDR(dpPaidAmount)}</span>
                  </div>

                  {booking.penaltyAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      <span>Denda Keterlambatan</span>
                      <span>+{formatIDR(booking.penaltyAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Big Total Box */}
                <div className="bg-zinc-900 text-white rounded-2xl p-5 space-y-1 shadow-lg">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Sisa Pelunasan</p>
                  <p className="text-3xl font-black text-white">{formatIDR(remainingAmount)}</p>
                  <p className="text-[10px] text-zinc-400">Termasuk seluruh tagihan sisa & denda keterlambatan (jika ada).</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
