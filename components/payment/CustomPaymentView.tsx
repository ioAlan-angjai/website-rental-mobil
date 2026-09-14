'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Building2,
  Copy,
  Check,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CorePaymentMethod } from '@/lib/payment-gateway';

interface CustomPaymentViewProps {
  bookingId: string;
  paymentType?: 'DP' | 'FULL_PAYMENT';
  amount: number;
  carName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PaymentSession {
  orderId: string;
  paymentMethod: CorePaymentMethod;
  amount: number;
  expiryTime?: string;
  qrImageUrl?: string;
  qrString?: string;
  vaNumber?: string;
  bankName?: string;
  billerCode?: string;
  billKey?: string;
}

const PAYMENT_METHODS: {
  id: CorePaymentMethod;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'QRIS',
    name: 'QRIS (Semua E-Wallet & Bank)',
    shortName: 'QRIS',
    badge: 'Instan',
    description: 'BCA Mobile, GoPay, OVO, Dana, ShopeePay, dll.',
    icon: 'qris',
  },
  {
    id: 'BCA_VA',
    name: 'BCA Virtual Account',
    shortName: 'BCA VA',
    badge: 'Otomatis',
    description: 'Transfer via BCA Mobile, KlikBCA, atau ATM BCA.',
    icon: 'bca',
  },
  {
    id: 'BNI_VA',
    name: 'BNI Virtual Account',
    shortName: 'BNI VA',
    badge: 'Otomatis',
    description: 'Transfer via BNI Mobile Banking atau ATM BNI.',
    icon: 'bni',
  },
  {
    id: 'BRI_VA',
    name: 'BRI Virtual Account',
    shortName: 'BRI VA',
    badge: 'Otomatis',
    description: 'Transfer via BRImo atau ATM BRI.',
    icon: 'bri',
  },
  {
    id: 'MANDIRI_BILL',
    name: 'Mandiri Bill Payment',
    shortName: 'Mandiri Bill',
    badge: 'Otomatis',
    description: 'Bayar via Livin by Mandiri atau ATM Mandiri.',
    icon: 'mandiri',
  },
];

export function CustomPaymentView({
  bookingId,
  paymentType = 'DP',
  amount,
  carName = 'Rental Mobil',
  onSuccess,
  onCancel,
}: CustomPaymentViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<CorePaymentMethod>('QRIS');
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [status, setStatus] = useState<
    'IDLE' | 'CHARGING' | 'WAITING' | 'CHECKING' | 'SUCCESS' | 'EXPIRED' | 'ERROR'
  >('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  // Handle Copy to clipboard
  const handleCopy = (text: string, keyName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success(`${keyName} berhasil disalin!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Charge transaction via Core API
  const handleCreateCharge = async (method: CorePaymentMethod) => {
    setSelectedMethod(method);
    setStatus('CHARGING');
    setErrorMessage('');

    try {
      const res = await fetch('/api/payment/core-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethod: method,
          paymentType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('ERROR');
        setErrorMessage(data.message || data.error || 'Gagal membuat sesi pembayaran di Midtrans.');
        return;
      }

      setSession({
        orderId: data.orderId,
        paymentMethod: method,
        amount: data.amount || amount,
        expiryTime: data.expiryTime,
        qrImageUrl: data.qrImageUrl,
        qrString: data.qrString,
        vaNumber: data.vaNumber,
        bankName: data.bankName,
        billerCode: data.billerCode,
        billKey: data.billKey,
      });

      if (data.expiryTime) {
        const expiryDate = new Date(data.expiryTime);
        const diffInSeconds = Math.max(0, Math.floor((expiryDate.getTime() - Date.now()) / 1000));
        setTimeLeft(diffInSeconds > 0 ? diffInSeconds : 15 * 60);
      } else {
        setTimeLeft(15 * 60);
      }

      setStatus('WAITING');
    } catch (err: any) {
      console.error('Charge API Exception:', err);
      setStatus('ERROR');
      setErrorMessage('Terjadi kendala jaringan saat menghubungi server pembayaran.');
    }
  };

  // Check Status from server / Midtrans
  const handleCheckStatus = useCallback(
    async (isManualClick = false) => {
      if (!session?.orderId) return;

      if (isManualClick) {
        setStatus('CHECKING');
      }

      try {
        const res = await fetch(`/api/payment/status/${encodeURIComponent(session.orderId)}`);
        const data = await res.json();

        if (data.isPaid || data.paymentStatus === 'VERIFIED') {
          setStatus('SUCCESS');
          toast.success('Pembayaran Berhasil Dikonfirmasi!');
          setTimeout(() => {
            onSuccess?.();
          }, 2000);
          return;
        }

        if (data.paymentStatus === 'EXPIRED' || data.transactionStatus === 'expire') {
          setStatus('EXPIRED');
          return;
        }

        if (isManualClick) {
          setStatus('WAITING');
          toast.info('Pembayaran belum terdeteksi. Jika sudah transfer, silakan tunggu beberapa saat.');
        }
      } catch (err) {
        if (isManualClick) {
          setStatus('WAITING');
          toast.error('Gagal mengecek status pembayaran.');
        }
      }
    },
    [session?.orderId, onSuccess]
  );

  // Auto polling status every 6 seconds when WAITING
  useEffect(() => {
    if (status !== 'WAITING' || !session?.orderId) return;

    const interval = setInterval(() => {
      handleCheckStatus(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [status, session?.orderId, handleCheckStatus]);

  // Countdown timer effect
  useEffect(() => {
    if (status !== 'WAITING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If amount is zero or negative, bill is settled
  if (amount <= 0) {
    return (
      <div className="w-full bg-card text-foreground rounded-2xl border border-border p-6 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Tagihan Ini Sudah Lunas</h3>
          <p className="text-xs text-foreground/60 mt-1 max-w-sm mx-auto">
            Tidak ada sisa pembayaran yang perlu diselesaikan untuk transaksi armada {carName}.
          </p>
        </div>
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all cursor-pointer"
          >
            Selesai
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full text-foreground space-y-4">
      {/* STATE 1: SELECTING PAYMENT METHOD */}
      {status === 'IDLE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles size={13} className="text-foreground/70" /> Pilih Channel Pembayaran Instan
              </p>
              <p className="text-[11px] text-foreground/60">
                Terhubung otomatis dengan Midtrans Sandbox Core API
              </p>
            </div>
            <span className="text-xs font-black text-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
              Rp {amount.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Payment Methods Grid — 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    'p-3.5 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group',
                    isSelected
                      ? 'border-foreground bg-secondary/40 shadow-xs ring-1 ring-foreground/20'
                      : 'border-border bg-card hover:border-foreground/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center text-foreground shrink-0">
                        {method.id === 'QRIS' ? <QrCode size={14} /> : <Building2 size={14} />}
                      </div>
                      <span className="text-xs font-bold text-foreground truncate">
                        {method.shortName}
                      </span>
                    </div>

                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? 'border-foreground bg-foreground' : 'border-border'
                      )}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-colors cursor-pointer text-center"
              >
                Batal
              </button>
            )}
            <button
              type="button"
              onClick={() => handleCreateCharge(selectedMethod)}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-foreground text-background font-bold text-xs sm:text-sm hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              Lanjutkan Pembayaran <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: CHARGING / LOADING */}
      {status === 'CHARGING' && (
        <div className="py-10 text-center space-y-3 bg-card border border-border rounded-2xl p-6 shadow-xs">
          <RefreshCw className="w-7 h-7 mx-auto animate-spin text-foreground" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">Menyiapkan Transaksi Midtrans Sandbox...</h3>
          <p className="text-[11px] text-foreground/60">Mohon tunggu beberapa detik...</p>
        </div>
      )}

      {/* STATE 3: WAITING PAYMENT & CHECKING */}
      {(status === 'WAITING' || status === 'CHECKING') && session && (
        <div className="space-y-4">
          {/* Expiry Bar */}
          <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Selesaikan Pembayaran</p>
                <p className="text-xs font-semibold text-foreground">Batas Waktu Transaksi</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-mono font-black text-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* METHOD: QRIS */}
          {session.paymentMethod === 'QRIS' && (
            <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-bold border border-border">
                <QrCode size={13} /> Scan QRIS Instan
              </div>

              <div className="flex flex-col items-center justify-center">
                {session.qrImageUrl ? (
                  <div className="p-3 bg-white border-2 border-border rounded-2xl shadow-xs">
                    <img
                      src={session.qrImageUrl}
                      alt="QRIS Midtrans"
                      className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                    />
                  </div>
                ) : session.qrString ? (
                  <div className="p-4 bg-white border border-border rounded-xl max-w-xs break-all text-[10px] font-mono text-zinc-900">
                    <p className="font-bold mb-1">QR String:</p>
                    {session.qrString}
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-secondary rounded-xl flex items-center justify-center text-xs text-foreground/60">
                    Memuat QR Code...
                  </div>
                )}
                <p className="text-xs text-foreground/70 mt-3 max-w-sm">
                  Buka aplikasi <strong>BCA Mobile, GoPay, OVO, Dana, ShopeePay</strong> atau mobile banking lainnya, lalu scan QR di atas.
                </p>
              </div>

              <div className="p-2.5 bg-secondary/50 rounded-xl text-[11px] text-foreground/70 border border-border flex items-center justify-between">
                <span className="text-[10px] text-foreground/50 uppercase font-bold">Order ID</span>
                <code className="font-mono font-bold text-foreground text-xs">{session.orderId}</code>
              </div>
            </div>
          )}

          {/* METHOD: BCA / BNI / BRI VA */}
          {['BCA_VA', 'BNI_VA', 'BRI_VA'].includes(session.paymentMethod) && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-foreground" />
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">
                    {session.paymentMethod === 'BCA_VA'
                      ? 'BCA Virtual Account'
                      : session.paymentMethod === 'BNI_VA'
                      ? 'BNI Virtual Account'
                      : 'BRI Virtual Account'}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Verifikasi Otomatis
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                  Nomor Virtual Account
                </p>
                <div className="flex items-center justify-between bg-secondary/50 border border-border rounded-xl p-3">
                  <span className="text-base sm:text-lg font-mono font-black text-foreground tracking-wider">
                    {session.vaNumber || 'Sedang memuat VA...'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(session.vaNumber || '', 'Nomor VA')}
                    className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'Nomor VA' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === 'Nomor VA' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              <div className="text-xs text-foreground/75 space-y-1.5 pt-1">
                <p className="font-bold text-foreground text-[11px]">Petunjuk Transfer:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-foreground/65">
                  <li>Buka aplikasi Mobile Banking / ATM ({session.paymentMethod.replace('_VA', '')}).</li>
                  <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</li>
                  <li>Masukkan nomor Virtual Account di atas.</li>
                  <li>Pastikan nominal tagihan sesuai (<strong>Rp {amount.toLocaleString('id-ID')}</strong>).</li>
                  <li>Konfirmasi PIN dan simpan resi pembayaran.</li>
                </ol>
              </div>
            </div>
          )}

          {/* METHOD: MANDIRI BILL PAYMENT */}
          {session.paymentMethod === 'MANDIRI_BILL' && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-foreground" />
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">Mandiri Bill Payment</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Verifikasi Otomatis
                </span>
              </div>

              {/* Biller Code */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                  Kode Perusahaan (Biller Code)
                </p>
                <div className="flex items-center justify-between bg-secondary/50 border border-border rounded-xl p-2.5">
                  <span className="text-sm sm:text-base font-mono font-bold text-foreground">
                    {session.billerCode || '70012'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(session.billerCode || '70012', 'Kode Perusahaan')}
                    className="px-2.5 py-1 rounded-md bg-foreground text-background text-[11px] font-bold cursor-pointer"
                  >
                    {copiedKey === 'Kode Perusahaan' ? <Check size={11} /> : <Copy size={11} />}
                    {copiedKey === 'Kode Perusahaan' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              {/* Bill Key */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">
                  Nomor Pembayaran (Bill Key)
                </p>
                <div className="flex items-center justify-between bg-secondary/50 border border-border rounded-xl p-2.5">
                  <span className="text-sm sm:text-base font-mono font-bold text-foreground">
                    {session.billKey || 'Sedang memuat...'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(session.billKey || '', 'Nomor Pembayaran')}
                    className="px-2.5 py-1 rounded-md bg-foreground text-background text-[11px] font-bold cursor-pointer"
                  >
                    {copiedKey === 'Nomor Pembayaran' ? <Check size={11} /> : <Copy size={11} />}
                    {copiedKey === 'Nomor Pembayaran' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              <div className="text-xs text-foreground/75 space-y-1 pt-1">
                <p className="font-bold text-foreground text-[11px]">Petunjuk Livin by Mandiri:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-foreground/65">
                  <li>Buka <strong>Livin by Mandiri</strong> &gt; Pilih <strong>Bayar</strong>.</li>
                  <li>Cari penyedia jasa dengan kode <strong>{session.billerCode}</strong>.</li>
                  <li>Masukkan Bill Key <strong>{session.billKey}</strong>.</li>
                  <li>Konfirmasi dan selesaikan pembayaran.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={status === 'CHECKING'}
              onClick={() => handleCheckStatus(true)}
              className="w-full py-3.5 rounded-xl bg-foreground text-background font-bold text-xs sm:text-sm hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn(status === 'CHECKING' && 'animate-spin')} />
              {status === 'CHECKING' ? 'Memverifikasi Pembayaran...' : 'Cek Status Pembayaran'}
            </button>

            <button
              type="button"
              onClick={() => setStatus('IDLE')}
              className="w-full py-2 text-center text-xs font-semibold text-foreground/60 hover:text-foreground cursor-pointer transition-colors"
            >
              Ganti Metode Pembayaran Lain
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: SUCCESS */}
      {status === 'SUCCESS' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-8 text-center space-y-4 bg-card border border-border rounded-2xl p-6 shadow-xs"
        >
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Pembayaran Berhasil Dikonfirmasi!</h3>
            <p className="text-xs text-foreground/65 mt-1 max-w-sm mx-auto">
              Transaksi Anda telah berhasil diverifikasi secara otomatis melalui gateway pembayaran.
            </p>
          </div>
          <div className="p-3 bg-secondary/50 border border-border rounded-xl max-w-xs mx-auto text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-foreground/60">Nominal:</span>
              <span className="font-bold text-foreground">Rp {amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-foreground/60">Status:</span>
              <span className="font-bold text-emerald-600">LUNAS / TERVERIFIKASI</span>
            </div>
          </div>
          {onSuccess && (
            <button
              type="button"
              onClick={onSuccess}
              className="px-6 py-3 rounded-xl bg-foreground text-background font-bold text-xs hover:bg-foreground/90 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Lanjutkan <ChevronRight size={14} />
            </button>
          )}
        </motion.div>
      )}

      {/* STATE 5: EXPIRED */}
      {status === 'EXPIRED' && (
        <div className="py-8 text-center space-y-3 bg-card border border-border rounded-2xl p-6 shadow-xs">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={26} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Waktu Pembayaran Telah Habis</h3>
          <p className="text-xs text-foreground/60 max-w-sm mx-auto">
            Batas waktu transaksi telah kedaluwarsa. Silakan buat sesi pembayaran baru.
          </p>
          <button
            type="button"
            onClick={() => setStatus('IDLE')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs hover:bg-foreground/90 cursor-pointer"
          >
            Buat Pembayaran Baru
          </button>
        </div>
      )}

      {/* STATE 6: ERROR */}
      {status === 'ERROR' && (
        <div className="py-8 text-center space-y-3 bg-card border border-border rounded-2xl p-6 shadow-xs">
          <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={26} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Gagal Memproses Pembayaran</h3>
          <p className="text-xs text-red-600 max-w-sm mx-auto">
            {errorMessage || 'Terjadi kesalahan sistem saat menghubungi gateway pembayaran.'}
          </p>
          <button
            type="button"
            onClick={() => setStatus('IDLE')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs hover:bg-foreground/90 cursor-pointer"
          >
            Coba Kembali
          </button>
        </div>
      )}
    </div>
  );
}
