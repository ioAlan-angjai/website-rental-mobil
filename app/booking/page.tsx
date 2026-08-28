'use client';

import { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarIcon, Clock, MapPin, User, Mail, Phone, Car,
  ChevronRight, ChevronLeft, CheckCircle2, CreditCard,
  Upload, ImageIcon, X, Building2, Copy, Check, AlertCircle, Landmark, AlertTriangle,
  FileText, ShieldCheck, ClipboardList, CircleDot, Search, Package, QrCode, Sparkles, Zap, Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BcaLogo } from '@/components/ui/bca-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency, getStatusMeta } from '@/lib/booking-status';
import { openSnapPayment } from '@/lib/snap';

// Bank info (in real app: from env/API)
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
      className="p-1.5 rounded-lg hover:bg-[#2a2548] transition-colors text-white/40 hover:text-white"
      aria-label="Salin nomor rekening"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

// ─── Step Configuration ───
const STEPS = [
  { num: 1, key: 'armada', label: 'Pilih Armada', icon: Car, desc: 'Pilih mobil & layanan' },
  { num: 2, key: 'detail', label: 'Detail', icon: Clock, desc: 'Waktu & lokasi' },
  { num: 3, key: 'data-rental', label: 'Data Rental', icon: FileText, desc: 'Informasi sewa' },
  { num: 4, key: 'data-penyewa', label: 'Data Penyewa', icon: User, desc: 'Identitas penyewa' },
  { num: 5, key: 'upload', label: 'Upload Dokumen', icon: ShieldCheck, desc: 'KTP & SIM' },
  { num: 6, key: 'ringkasan', label: 'Ringkasan', icon: ClipboardList, desc: 'Review pesanan' },
  { num: 7, key: 'pembayaran', label: 'Pembayaran DP', icon: CreditCard, desc: 'Bayar DP 50%' },
];

// ─── Animated step content wrapper — animates ONLY on step change ───
function StepWrapper({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}

// ─── Section divider ───
function SectionDivider() {
  return <div className="border-t border-[#2a2548] my-6" />;
}

// Form booking
function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const user = session?.user as any;

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/booking';
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [status, router]);

  // Read pre-fill values from URL query params
  const carIdParam = searchParams?.get('carId') || '';
  const startDateParam = searchParams?.get('startDate') || '';
  const endDateParam = searchParams?.get('endDate') || '';

  // Today at midnight for date validation
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    try { return parseISO(dateStr); } catch { return undefined; }
  };

  // Fetch cars from database
  const [dbCars, setDbCars] = useState<any[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    fetch('/api/cars?status=AVAILABLE')
      .then(r => r.json())
      .then(res => {
        if (res.data) setDbCars(res.data);
      })
      .catch(console.error)
      .finally(() => setLoadingCars(false));
  }, []);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(parseDate(startDateParam));
  const [endDate, setEndDate] = useState<Date | undefined>(parseDate(endDateParam));
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    duration: '1',
    serviceType: '',
    carId: carIdParam,
    pickupLocation: '',
    pickupTime: '09:00',
    returnTime: '18:00',
  });
  const [paymentMode, setPaymentMode] = useState<'INSTANT' | 'MANUAL'>('INSTANT');
  const [selectedBank, setSelectedBank] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [simFile, setSimFile] = useState<File | null>(null);
  const [simPreview, setSimPreview] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Auto-fill user identity when session resolves
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (date && endDate) {
      const startDateTime = new Date(date);
      const [pickupHours, pickupMinutes] = (formData.pickupTime || '09:00').split(':');
      startDateTime.setHours(parseInt(pickupHours), parseInt(pickupMinutes), 0, 0);

      const endDateTime = new Date(endDate);
      const [returnHours, returnMinutes] = (formData.returnTime || '18:00').split(':');
      endDateTime.setHours(parseInt(returnHours), parseInt(returnMinutes), 0, 0);

      const diffTime = endDateTime.getTime() - startDateTime.getTime();
      const diffMinutes = Math.round(diffTime / (1000 * 60));
      const calculatedDuration = diffMinutes <= 0 ? 60 : diffMinutes;
      setFormData(prev => ({ ...prev, duration: calculatedDuration.toString() }));
    } else {
      setFormData(prev => ({ ...prev, duration: '60' }));
    }
  }, [date, endDate, formData.pickupTime, formData.returnTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (submitError) setSubmitError('');
  };

  // Clear submitError when dates change
  useEffect(() => {
    setSubmitError('');
  }, [date, endDate]);

  const nextStep = () => {
    if (step === 2) {
      if (date && endDate) {
        const startDateTime = new Date(date);
        const [pickupHours, pickupMinutes] = (formData.pickupTime || '09:00').split(':');
        startDateTime.setHours(parseInt(pickupHours), parseInt(pickupMinutes), 0, 0);

        const endDateTime = new Date(endDate);
        const [returnHours, returnMinutes] = (formData.returnTime || '18:00').split(':');
        endDateTime.setHours(parseInt(returnHours), parseInt(returnMinutes), 0, 0);

        if (startDateTime >= endDateTime) {
          setSubmitError('Waktu pengembalian harus setelah waktu pengambilan.');
          return;
        }
      }
      setSubmitError('');
    }
    if (step < 7) setStep(step + 1);
  };

  const prevStep = () => {
    if (submitError) setSubmitError('');
    if (step > 1) setStep(step - 1);
  };

  // Fetch driver fee from API
  const [driverFeePerDay, setDriverFeePerDay] = useState(150000);
  useEffect(() => {
    fetch('/api/driver-fee')
      .then(r => r.json())
      .then(res => {
        if (res.driverFeePerDay) setDriverFeePerDay(res.driverFeePerDay);
      })
      .catch(console.error);
  }, []);

  const selectedCarDetails = dbCars.find(c => c.id === formData.carId);
  const rentalDays = Math.max(1, Math.ceil(parseInt(formData.duration) / (60 * 24)));
  const effectiveDriverFee = formData.serviceType === 'dengan-driver' ? driverFeePerDay : 0;
  const dailyRate = selectedCarDetails ? (selectedCarDetails.pricePerDay + effectiveDriverFee) : 0;
  const totalPrice = rentalDays * dailyRate;
  const dpAmount = Math.floor(totalPrice * 0.5);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('Ukuran file bukti transfer maksimal 10MB.');
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setUploadedPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  // Native file input handler for payment proof (consistent with KTP/SIM approach)
  const handlePaymentProofUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('Ukuran file maksimal 10MB.');
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
  };

  // KTP & SIM upload handlers using native input
  const handleDocumentUpload = (type: 'ktp' | 'sim') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Ukuran file maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (type === 'ktp') {
          setKtpFile(file);
          setKtpPreview(ev.target?.result as string);
        } else {
          setSimFile(file);
          setSimPreview(ev.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const apiPaymentMethod = paymentMode === 'INSTANT' ? 'MIDTRANS' : (selectedBank ? `${selectedBank}_TRANSFER` : null);

      let startDateTime: Date | null = null;
      if (date) {
        startDateTime = new Date(date);
        const [hours, minutes] = (formData.pickupTime || '09:00').split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      let endDateTime: Date | null = null;
      if (endDate) {
        endDateTime = new Date(endDate);
        const [hours, minutes] = (formData.returnTime || '18:00').split(':');
        endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      const payload: any = {
        carId: formData.carId,
        startDate: startDateTime?.toISOString(),
        endDate: endDateTime?.toISOString(),
        serviceType: formData.serviceType === 'lepas-kunci' ? 'LEPAS_KUNCI' : 'DENGAN_DRIVER',
        pickupLocation: formData.pickupLocation || null,
        paymentMethod: apiPaymentMethod,
        guestName: formData.name,
        guestEmail: formData.email || null,
        guestPhone: formData.phone,
        ktpBookingImage: ktpPreview || null,
        simBookingImage: simPreview || null,
      };

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Terjadi kesalahan saat membuat booking.');
        return;
      }

      // If INSTANT mode with Midtrans, create transaction and open Snap popup
      if (paymentMode === 'INSTANT' && data.booking?.id) {
        try {
          const txRes = await fetch('/api/payment/create-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: data.booking.id, paymentType: 'DP' }),
          });

          const txData = await txRes.json();

          if (txData.isGatewayActive && txData.token) {
            await openSnapPayment(txData.token, {
              onSuccess: async (result) => {
                try {
                  await fetch('/api/payment/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: data.booking.id, paymentType: 'DP', result }),
                  });
                } catch (err) {}
                router.push('/riwayat-booking?success=1');
              },
              onPending: () => {
                router.push('/riwayat-booking');
              },
              onError: () => {
                setSubmitError('Pembayaran belum selesai. Anda dapat melanjutkannya dari Riwayat Booking.');
                router.push('/riwayat-booking');
              },
              onClose: () => {
                setBookingSuccess(true);
              },
            });
            return;
          }
        } catch (snapErr) {
          console.error('Midtrans Snap error:', snapErr);
        }
      }

      // Upload proof image if uploadedPreview exists (manual mode)
      if (uploadedPreview && data.booking && data.booking.id) {
        const formDataPayload = new FormData();
        formDataPayload.append('proofImage', uploadedPreview);
        if (apiPaymentMethod) {
          formDataPayload.append('paymentMethod', apiPaymentMethod);
        }

        const paymentRes = await fetch(`/api/booking/${data.booking.id}/payment`, {
          method: 'POST',
          body: formDataPayload,
        });

        const paymentData = await paymentRes.json();
        if (!paymentRes.ok) {
          setSubmitError(paymentData.error || 'Booking berhasil dibuat, tetapi gagal mengupload bukti pembayaran.');
          return;
        }
      }

      setBookingSuccess(true);
    } catch {
      setSubmitError('Gagal terhubung ke server. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Helper: Check if current step data is valid for navigation ───
  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.serviceType && !!formData.carId && !!date && !!endDate;
      case 2: return true; // Optional fields
      case 3: return true;
      case 4: return !!formData.name && !!formData.phone;
      case 5: return !!ktpPreview && !!simPreview;
      case 6: return true;
      case 7:
        if (paymentMode === 'INSTANT') return true;
        return !!selectedBank && !!uploadedPreview;
      default: return false;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#13112a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    const callbackUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname + window.location.search) : '/booking';
    return (
      <div className="min-h-screen bg-[#13112a] relative overflow-hidden flex flex-col justify-between">
        <Navbar />
        <div className="py-24 px-4 max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mx-auto text-[#f97316]">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Login Diperlukan</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Anda harus login ke akun Anda terlebih dahulu sebelum dapat membuat reservasi mobil. Booking tanpa login (Guest) tidak diperbolehkan.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href={`/login?callbackUrl=${callbackUrl}`}
              className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-bold h-12 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-[#f97316]/20"
            >
              Login Sekarang
            </Link>
            <Link
              href={`/register?callbackUrl=${callbackUrl}`}
              className="bg-[#1b1838] hover:bg-[#2a2548] text-white/80 font-semibold h-12 rounded-xl flex items-center justify-center border border-[#2a2548] transition-all"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13112a] relative overflow-hidden">
      <Navbar />

      {/* Header Banner */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-[#2a2548] bg-[#1b1838]">
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-xs text-white/50">
            <Link href="/" className="hover:text-[#f97316] transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white font-bold">Booking</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
            Form Booking
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Lengkapi 7 langkah mudah untuk reservasi mobil Anda
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-10 px-4 max-w-4xl mx-auto">

        {/* Premium 7-Step Stepper */}
        <div className="mb-10 max-w-4xl mx-auto">
          {/* Desktop: horizontal stepper */}
          <div className="hidden lg:flex justify-between items-start relative">
            {/* Progress bar background */}
            <div className="absolute top-6 left-0 right-0 h-[3px] bg-[#2a2548] z-0 rounded-full" />
            {/* Progress bar fill */}
            <motion.div
              className="absolute top-6 left-0 h-[3px] bg-gradient-to-r from-[#f97316] via-[#f97316] to-[#f97316]/60 z-0 rounded-full"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />

            {STEPS.map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              const Icon = s.icon;

              return (
                <div key={s.key} className="relative z-10 flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-500',
                    isCompleted
                      ? 'bg-[#f97316] border-[#f97316] text-white shadow-lg shadow-[#f97316]/30'
                      : isCurrent
                      ? 'bg-[#f97316] border-[#f97316] text-white ring-4 ring-[#f97316]/30 shadow-lg shadow-[#f97316]/20'
                      : 'bg-[#1b1838] border-[#2a2548] text-white/40 group-hover:border-[#f97316]/50'
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-white" />
                    ) : (
                      <Icon size={16} className={isCurrent ? 'text-white' : 'text-white/40'} />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2.5 text-center">
                    <span className={cn(
                      'block text-[11px] font-bold transition-colors duration-300',
                      isCompleted ? 'text-[#f97316]' : isCurrent ? 'text-white' : 'text-white/40'
                    )}>
                      {s.label}
                    </span>
                    <span className={cn(
                      'block text-[9px] mt-0.5 transition-colors duration-300',
                      isCurrent ? 'text-white/50' : 'text-white/20'
                    )}>
                      {s.desc}
                    </span>
                  </div>

                  {/* Step number badge */}
                  {isCurrent && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#f97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {s.num}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile/Tablet: compact stepper */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="p-2 rounded-xl bg-[#1b1838] border border-[#2a2548] text-white/60 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2a2548] transition-colors shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1 relative">
              <div className="h-2 bg-[#2a2548] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#f97316] to-[#f97316]/70 rounded-full"
                  animate={{ width: `${(step / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
            </div>
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="p-2 rounded-xl bg-[#f97316] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f97316]/90 transition-colors shrink-0"
            >
              <ChevronRight size={18} />
            </button>
            <span className="text-xs font-bold text-white/60 shrink-0 min-w-[4rem] text-right">
              {step} / {STEPS.length}
            </span>
          </div>

          {/* Step Title Indicator (Mobile) */}
          <div className="lg:hidden text-center mt-3">
            <span className="text-sm font-bold text-white">
              {STEPS[step - 1].label}
            </span>
            <span className="text-xs text-white/40 ml-2">
              — {STEPS[step - 1].desc}
            </span>
          </div>
        </div>

        {/* Success State */}
        {bookingSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1b1838] border border-[#2a2548] rounded-3xl shadow-sm p-12 text-center relative z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-green-500/10 rounded-full">
                <CheckCircle2 size={48} className="text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Terkirim!</h2>
            <p className="text-white/50 mb-1 text-sm">
              Pesanan Anda untuk <strong>{selectedCarDetails?.name}</strong> telah kami terima.
            </p>
            <p className="text-white/50 text-sm mb-8">
              Tim kami akan menghubungi Anda via WhatsApp dalam 1×24 jam untuk konfirmasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-bold px-8 h-12 rounded-xl">
                  Kembali ke Beranda
                </Button>
              </Link>
              <Link href="/armada">
                <Button className="bg-transparent border border-[#2a2548] text-white/60 hover:bg-[#2a2548] font-bold px-8 h-12 rounded-xl">
                  Lihat Armada Lain
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <Card className="bg-[#1b1838] border border-[#2a2548] rounded-3xl overflow-hidden shadow-sm relative z-10">
            <CardHeader className="bg-[#13112a] border-b border-[#2a2548] p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white font-serif">
                    {STEPS[step - 1].label}
                  </CardTitle>
                  <p className="text-sm text-white/50 mt-2">
                    {step === 1 && 'Pilih jenis layanan, unit mobil, dan tentukan tanggal sewa Anda.'}
                    {step === 2 && 'Atur jam pengambilan, jam pengembalian, dan lokasi penjemputan.'}
                    {step === 3 && 'Periksa data rental yang sudah Anda pilih.'}
                    {step === 4 && 'Isi data diri Anda untuk keperluan verifikasi.'}
                    {step === 5 && 'Upload foto KTP dan SIM untuk verifikasi identitas.'}
                    {step === 6 && 'Review semua detail pesanan sebelum melakukan pembayaran.'}
                    {step === 7 && 'Transfer DP 50% dan upload bukti pembayaran.'}
                  </p>
                </div>
                {/* Step badge */}
                <div className="hidden sm:flex items-center gap-2 bg-[#1b1838] border border-[#2a2548] rounded-xl px-4 py-2">
                  <span className="text-xs text-white/40">Langkah</span>
                  <span className="text-lg font-bold text-[#f97316]">{step}</span>
                  <span className="text-xs text-white/40">/ {STEPS.length}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">

                {/* ═══════════════════════════════════════════════════════
                   STEP 1: Pilih Armada
                   ═══════════════════════════════════════════════════════ */}
                {step === 1 && (
                  <StepWrapper step={step}>
                    {/* Service Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <Car size={14} className="text-[#f97316]" /> Jenis Layanan <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: 'lepas-kunci', label: 'Sewa Lepas Kunci', desc: 'Tanpa driver, bawa sendiri', icon: Car },
                          { value: 'dengan-driver', label: 'Sewa Dengan Driver', desc: 'Termasuk driver profesional', icon: User },
                        ].map((opt) => {
                          const selected = formData.serviceType === opt.value;
                          const OptIcon = opt.icon;
                          return (
                            <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setFormData(prev => ({ ...prev, serviceType: opt.value })); setSubmitError(''); }}
                            className={cn(
                              'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4',
                              selected
                                ? 'border-[#f97316] bg-[#13112a] shadow-md shadow-[#f97316]/20'
                                : 'border-[#2a2548] bg-[#1b1838] hover:border-[#f97316]/50'
                            )}
                            >
                              <div className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                selected ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#13112a] text-white/40'
                              )}>
                                <OptIcon size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={cn('font-bold text-sm', selected ? 'text-white' : 'text-white/70')}>{opt.label}</span>
                                <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
                              </div>
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 shrink-0 mt-1 transition-all duration-200 flex items-center justify-center',
                                selected
                                  ? 'border-[#f97316] bg-[#f97316]'
                                  : 'border-[#2a2548] bg-[#1b1838]'
                              )}>
                                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <SectionDivider />

                    {/* Car Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <Search size={14} className="text-[#f97316]" /> Pilih Unit Mobil <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="carId" value={formData.carId} onChange={handleInputChange}
                        className="w-full h-12 px-4 bg-[#13112a] border border-[#2a2548] text-white rounded-xl focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]/30 appearance-none cursor-pointer"
                        disabled={loadingCars}
                      >
                        <option value="">
                          {loadingCars ? 'Memuat daftar mobil...' : 'Pilih mobil yang Anda inginkan'}
                        </option>
                        {dbCars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.name} - Rp {car.pricePerDay.toLocaleString('id-ID')}/hari
                          </option>
                        ))}
                      </select>

                      {/* Selected car preview */}
                      {selectedCarDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 p-4 bg-[#13112a] border border-[#2a2548] rounded-2xl flex items-center gap-4"
                        >
                          <div className="w-14 h-14 rounded-xl bg-[#1b1838] border border-[#2a2548] flex items-center justify-center overflow-hidden shrink-0">
                            {selectedCarDetails.image ? (
                              <img src={selectedCarDetails.image} alt={selectedCarDetails.name} className="w-full h-full object-cover" />
                            ) : (
                              <Car size={24} className="text-white/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">{selectedCarDetails.name}</p>
                            <p className="text-xs text-white/50">
                              Rp {selectedCarDetails.pricePerDay.toLocaleString('id-ID')} / hari
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <SectionDivider />

                    {/* Date Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <CalendarIcon size={14} className="text-[#f97316]" /> Tanggal Mulai <span className="text-red-500">*</span>
                        </label>
                        <Popover>
                          <PopoverTrigger className={cn(
                            'w-full justify-start text-left font-normal h-12 rounded-xl border border-[#2a2548] bg-[#13112a] text-white hover:bg-[#2a2548] px-4 flex items-center transition-colors',
                            !date && 'text-white/40'
                          )}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#f97316]" />
                            {date ? format(date, 'PPP', { locale: localeId }) : <span>Pilih tanggal mulai</span>}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#1b1838] border border-[#2a2548]" align="start">
                            <Calendar
                              mode="single" selected={date}
                              onSelect={(d) => {
                                setDate(d);
                                if (endDate && d && endDate < d) setEndDate(undefined);
                              }}
                              disabled={(d) => d < todayMidnight}
                              className="rounded-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <CalendarIcon size={14} className="text-[#f97316]" /> Tanggal Selesai <span className="text-red-500">*</span>
                        </label>
                        <Popover>
                          <PopoverTrigger className={cn(
                            'w-full justify-start text-left font-normal h-12 rounded-xl border border-[#2a2548] bg-[#13112a] text-white hover:bg-[#2a2548] px-4 flex items-center transition-colors',
                            !endDate && 'text-white/40'
                          )}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#f97316]" />
                            {endDate ? format(endDate, 'PPP', { locale: localeId }) : <span>Pilih tanggal selesai</span>}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#1b1838] border border-[#2a2548]" align="start">
                            <Calendar
                              mode="single" selected={endDate}
                              onSelect={setEndDate}
                              disabled={(d) => d < (date ?? todayMidnight)}
                              className="rounded-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Duration hint */}
                    {date && endDate && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 bg-[#13112a] border border-[#2a2548] rounded-2xl flex items-center gap-3"
                      >
                        <Clock size={16} className="text-[#f97316] shrink-0" />
                        <span className="text-sm text-white/70">
                          Durasi sewa: <strong className="text-white">{formatDuration(parseInt(formData.duration))}</strong>
                        </span>
                      </motion.div>
                    )}
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 2: Detail (Waktu & Lokasi)
                   ═══════════════════════════════════════════════════════ */}
                {step === 2 && (
                  <StepWrapper step={step}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Clock size={14} className="text-[#f97316]" /> Jam Pengambilan <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="time" name="pickupTime"
                          value={formData.pickupTime} onChange={handleInputChange}
                          className="bg-[#13112a] border-[#2a2548] text-white rounded-xl h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Clock size={14} className="text-[#f97316]" /> Jam Pengembalian <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="time" name="returnTime"
                          value={formData.returnTime} onChange={handleInputChange}
                          className="bg-[#13112a] border-[#2a2548] text-white rounded-xl h-12"
                        />
                      </div>
                    </div>

                    <SectionDivider />

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin size={14} className="text-[#f97316]" /> Lokasi Penjemputan / Pengantaran
                      </label>
                      <Input
                        type="text" name="pickupLocation"
                        placeholder="Contoh: Bandara YIA / Stasiun Tugu / Hotel"
                        value={formData.pickupLocation} onChange={handleInputChange}
                        className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/50 rounded-xl h-12"
                      />
                      <p className="text-xs text-white/40 mt-1">
                        Kosongkan jika ambil di kantor kami
                      </p>
                    </div>

                    {/* Time validation hint */}
                    {date && endDate && formData.pickupTime && formData.returnTime && (
                      <div className="p-3 bg-[#13112a] border border-[#2a2548] rounded-2xl flex items-center gap-3">
                        <Clock size={16} className="text-[#f97316] shrink-0" />
                        <span className="text-sm text-white/70">
                          {date && endDate && (
                            <>Sewa dari <strong className="text-white">{format(date, 'dd MMM', { locale: localeId })} {formData.pickupTime}</strong> sampai <strong className="text-white">{format(endDate, 'dd MMM', { locale: localeId })} {formData.returnTime}</strong></>
                          )}
                        </span>
                      </div>
                    )}
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 3: Data Rental
                   ═══════════════════════════════════════════════════════ */}
                {step === 3 && (
                  <StepWrapper step={step}>
                    <div className="bg-[#13112a] rounded-2xl p-6 border border-[#2a2548] space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white/50 pb-2 border-b border-[#2a2548] flex items-center gap-2">
                        <Package size={14} className="text-[#f97316]" /> Detail Rental
                      </h4>
                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div className="text-white/50">Layanan:</div>
                        <div className="font-bold text-white text-right capitalize">
                          {formData.serviceType === 'lepas-kunci' ? 'Sewa Lepas Kunci' : formData.serviceType === 'dengan-driver' ? 'Sewa Dengan Driver' : '-'}
                        </div>
                        <div className="text-white/50">Unit Mobil:</div>
                        <div className="font-bold text-white text-right">{selectedCarDetails?.name || '-'}</div>
                        <div className="text-white/50">Tanggal Mulai:</div>
                        <div className="font-bold text-white text-right font-sans">
                          {date ? format(date, 'PPP', { locale: localeId }) : '-'}
                        </div>
                        <div className="text-white/50">Jam Ambil:</div>
                        <div className="font-bold text-white text-right">{formData.pickupTime || '-'}</div>
                        <div className="text-white/50">Tanggal Selesai:</div>
                        <div className="font-bold text-white text-right font-sans">
                          {endDate ? format(endDate, 'PPP', { locale: localeId }) : '-'}
                        </div>
                        <div className="text-white/50">Jam Kembali:</div>
                        <div className="font-bold text-white text-right">{formData.returnTime || '-'}</div>
                        <div className="text-white/50">Durasi:</div>
                        <div className="font-bold text-white text-right">{formatDuration(parseInt(formData.duration))}</div>
                        <div className="text-white/50">Lokasi:</div>
                        <div className="font-bold text-white text-right">{formData.pickupLocation || 'Ambil di Kantor'}</div>
                      </div>
                    </div>

                    {selectedCarDetails && (
                      <div className="bg-[#13112a] rounded-2xl p-6 border border-[#2a2548] space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white/50 pb-2 border-b border-[#2a2548] flex items-center gap-2">
                          <CreditCard size={14} className="text-[#f97316]" /> Estimasi Biaya
                        </h4>
                        <div className="flex justify-between items-center text-xs text-white/50">
                          <span>Harga Sewa ({selectedCarDetails.name}):</span>
                          <span className="font-semibold text-white">Rp {selectedCarDetails.pricePerDay.toLocaleString('id-ID')} / hari</span>
                        </div>
                        {formData.serviceType === 'dengan-driver' && (
                          <div className="flex justify-between items-center text-xs text-emerald-400 font-medium">
                            <span>Layanan Driver:</span>
                            <span className="font-semibold">+Rp {driverFeePerDay.toLocaleString('id-ID')} / hari</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs text-white/50 pt-2 border-t border-[#2a2548]">
                          <span>Durasi:</span>
                          <span className="font-semibold text-white">{rentalDays} Hari</span>
                        </div>
                      </div>
                    )}
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 4: Data Penyewa
                   ═══════════════════════════════════════════════════════ */}
                {step === 4 && (
                  <StepWrapper step={step}>
                    <div className="bg-[#13112a] rounded-2xl p-5 border border-[#2a2548] flex items-start gap-3 mb-2">
                      <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-white/50 leading-relaxed">
                        Data diri Anda akan digunakan untuk verifikasi identitas dan komunikasi pemesanan. Pastikan data yang dimasukkan valid.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <User size={14} className="text-[#f97316]" /> Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text" name="name"
                        placeholder="Contoh: Ahmad Fauzi"
                        value={formData.name} onChange={handleInputChange}
                        className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/50 rounded-xl h-12 focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Phone size={14} className="text-[#f97316]" /> Nomor WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel" name="phone"
                          placeholder="08123456789"
                          value={formData.phone} onChange={handleInputChange}
                          className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/50 rounded-xl h-12 focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white flex items-center gap-2">
                          <Mail size={14} className="text-[#f97316]" /> Email
                        </label>
                        <Input
                          type="email" name="email"
                          placeholder="email@example.com"
                          value={formData.email} onChange={handleInputChange}
                          className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/50 rounded-xl h-12 focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/30"
                        />
                      </div>
                    </div>

                    {/* Auto-fill info */}
                    {user && (
                      <div className="p-3 bg-[#13112a] border border-[#2a2548] rounded-2xl flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                        <span className="text-xs text-white/50">
                          Data diisi otomatis dari akun Anda. <strong className="text-white/70">{user.email}</strong>
                        </span>
                      </div>
                    )}
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 5: Upload Dokumen (KTP & SIM)
                   ═══════════════════════════════════════════════════════ */}
                {step === 5 && (
                  <StepWrapper step={step}>
                    <div className="bg-[#13112a] rounded-2xl p-5 border border-[#2a2548] flex items-start gap-3 mb-2">
                      <ShieldCheck size={16} className="text-[#f97316] shrink-0 mt-0.5" />
                      <p className="text-xs text-white/50 leading-relaxed">
                        Upload foto KTP dan SIM Anda untuk verifikasi identitas. File akan dienkripsi dan hanya digunakan untuk keperluan verifikasi sewa.
                      </p>
                    </div>

                    {/* Upload Foto KTP */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Upload size={16} className="text-[#f97316]" />
                        <h3 className="text-sm font-bold text-white">
                          Upload Foto KTP <span className="text-red-500">*</span>
                        </h3>
                      </div>

                      {!ktpPreview ? (
                        <button
                          type="button"
                          onClick={() => handleDocumentUpload('ktp')}
                          className="border-2 border-dashed border-[#2a2548] rounded-2xl p-8 text-center cursor-pointer hover:border-[#f97316] hover:bg-[#13112a] w-full transition-all duration-200 group"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-full bg-[#13112a] group-hover:bg-[#1b1838] transition-colors">
                              <ImageIcon size={28} className="text-white/40 group-hover:text-white/60" />
                            </div>
                            <p className="font-bold text-white text-sm">Klik untuk upload foto KTP</p>
                            <p className="text-xs text-white/30">Format: JPG, PNG, WEBP • Maksimal 10 MB</p>
                          </div>
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative rounded-2xl overflow-hidden border-2 border-green-500/30 bg-green-500/10"
                        >
                          <img src={ktpPreview} alt="KTP" className="w-full max-h-56 object-contain" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-green-400" />
                              <span className="text-white text-xs font-medium">KTP terupload</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setKtpFile(null); setKtpPreview(null); }}
                              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            >
                              <X size={14} className="text-white" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Upload Foto SIM */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Upload size={16} className="text-[#f97316]" />
                        <h3 className="text-sm font-bold text-white">
                          Upload Foto SIM <span className="text-red-500">*</span>
                        </h3>
                      </div>

                      {!simPreview ? (
                        <button
                          type="button"
                          onClick={() => handleDocumentUpload('sim')}
                          className="border-2 border-dashed border-[#2a2548] rounded-2xl p-8 text-center cursor-pointer hover:border-[#f97316] hover:bg-[#13112a] w-full transition-all duration-200 group"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-full bg-[#13112a] group-hover:bg-[#1b1838] transition-colors">
                              <ImageIcon size={28} className="text-white/40 group-hover:text-white/60" />
                            </div>
                            <p className="font-bold text-white text-sm">Klik untuk upload foto SIM</p>
                            <p className="text-xs text-white/30">Format: JPG, PNG, WEBP • Maksimal 10 MB</p>
                          </div>
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative rounded-2xl overflow-hidden border-2 border-green-500/30 bg-green-500/10"
                        >
                          <img src={simPreview} alt="SIM" className="w-full max-h-56 object-contain" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-green-400" />
                              <span className="text-white text-xs font-medium">SIM terupload</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setSimFile(null); setSimPreview(null); }}
                              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            >
                              <X size={14} className="text-white" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 6: Ringkasan
                   ═══════════════════════════════════════════════════════ */}
                {step === 6 && (
                  <StepWrapper step={step}>
                    {/* Data Penyewa */}
                    <div className="bg-[#13112a] rounded-2xl p-6 border border-[#2a2548] space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white/50 pb-2 border-b border-[#2a2548] flex items-center gap-2">
                        <User size={14} className="text-[#f97316]" /> Data Penyewa
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                        <div className="text-white/50">Nama:</div>
                        <div className="font-bold text-white text-right">{formData.name || '-'}</div>
                        <div className="text-white/50">WhatsApp:</div>
                        <div className="font-bold text-white text-right">{formData.phone || '-'}</div>
                        <div className="text-white/50">Email:</div>
                        <div className="font-bold text-white text-right">{formData.email || '-'}</div>
                      </div>
                    </div>

                    {/* Detail Rental */}
                    <div className="bg-[#13112a] rounded-2xl p-6 border border-[#2a2548] space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white/50 pb-2 border-b border-[#2a2548] flex items-center gap-2">
                        <Car size={14} className="text-[#f97316]" /> Detail Rental
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                        <div className="text-white/50">Layanan:</div>
                        <div className="font-bold text-white text-right capitalize">
                          {formData.serviceType === 'lepas-kunci' ? 'Lepas Kunci' : formData.serviceType === 'dengan-driver' ? 'Dengan Driver' : '-'}
                        </div>
                        <div className="text-white/50">Unit:</div>
                        <div className="font-bold text-white text-right">{selectedCarDetails?.name || '-'}</div>
                        <div className="text-white/50">Mulai:</div>
                        <div className="font-bold text-white text-right font-sans">
                          {date ? `${format(date, 'dd MMM yyyy', { locale: localeId })} ${formData.pickupTime}` : '-'}
                        </div>
                        <div className="text-white/50">Selesai:</div>
                        <div className="font-bold text-white text-right font-sans">
                          {endDate ? `${format(endDate, 'dd MMM yyyy', { locale: localeId })} ${formData.returnTime}` : '-'}
                        </div>
                        <div className="text-white/50">Durasi:</div>
                        <div className="font-bold text-white text-right">{formatDuration(parseInt(formData.duration))}</div>
                        <div className="text-white/50">Lokasi:</div>
                        <div className="font-bold text-white text-right">{formData.pickupLocation || 'Ambil di Kantor'}</div>
                        <div className="text-white/50">Dokumen:</div>
                        <div className="font-bold text-white text-right">
                          {ktpPreview && simPreview ? (
                            <span className="text-green-400">✓ KTP & SIM</span>
                          ) : (
                            <span className="text-amber-400">Belum lengkap</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rincian Biaya */}
                    {selectedCarDetails && (
                      <div className="bg-[#13112a] rounded-2xl p-6 border border-[#2a2548] space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white/50 pb-2 border-b border-[#2a2548] flex items-center gap-2">
                          <CreditCard size={14} className="text-[#f97316]" /> Rincian Biaya
                        </h4>
                        <div className="flex justify-between items-center text-sm text-white/70">
                          <span>Sewa {selectedCarDetails.name}</span>
                          <span className="font-semibold text-white">Rp {selectedCarDetails.pricePerDay.toLocaleString('id-ID')} × {rentalDays} hr</span>
                        </div>
                        {formData.serviceType === 'dengan-driver' && (
                          <div className="flex justify-between items-center text-sm text-emerald-400">
                            <span>Layanan Driver</span>
                            <span className="font-semibold">+Rp {driverFeePerDay.toLocaleString('id-ID')} × {rentalDays} hr</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-[#2a2548]">
                          <span className="text-sm font-bold text-white">Total Harga Sewa</span>
                          <span className="text-xl font-black text-white">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}

                    {/* DP Banner */}
                    <div className="bg-gradient-to-r from-[#f97316] to-[#f97316]/80 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-[#f97316]/20">
                      <div>
                        <p className="text-xs text-white/70 uppercase tracking-wider mb-1">DP yang Harus Dibayar (50%)</p>
                        <p className="text-3xl font-black">Rp {dpAmount.toLocaleString('id-ID')}</p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-white/80" />
                    </div>

                    {/* Terms */}
                    <div className="p-4 rounded-2xl bg-[#13112a] border border-[#2a2548]">
                      <p className="text-xs text-white/50 leading-relaxed">
                        <span className="font-bold text-white">Catatan:</span> Dengan melanjutkan, Anda menyetujui syarat & ketentuan rental mobil kami. Setelah pembayaran DP 50% dikonfirmasi, pesanan Anda akan diproses.
                      </p>
                    </div>
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 7: Pembayaran DP
                   ═══════════════════════════════════════════════════════ */}
                {step === 7 && (
                  <StepWrapper step={step}>
                    {/* DP Amount Banner */}
                    <div className="bg-gradient-to-r from-[#f97316] to-[#f97316]/80 text-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-[#f97316]/20">
                      <div>
                        <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Jumlah DP yang Harus Dibayar</p>
                        <p className="text-3xl font-black">Rp {dpAmount.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-white/70 mt-1">50% dari total Rp {totalPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-white/70">Unit</p>
                        <p className="font-bold text-sm">{selectedCarDetails?.name}</p>
                        <p className="text-xs text-white/70">{formatDuration(parseInt(formData.duration))}</p>
                      </div>
                    </div>

                    {/* Pilih Metode Pembayaran */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-[#f97316]" />
                        <h3 className="text-sm font-bold text-white">
                          Pilih Metode Pembayaran DP
                        </h3>
                      </div>

                      {/* Payment Mode Selector Tabs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMode('INSTANT')}
                          className={cn(
                            'p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden',
                            paymentMode === 'INSTANT'
                              ? 'border-[#f97316] bg-[#13112a] shadow-lg shadow-[#f97316]/10'
                              : 'border-[#2a2548] bg-[#1b1838] hover:border-[#f97316]/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f97316]/20 text-[#f97316]">
                              <Sparkles size={11} /> Rekomendasi
                            </span>
                            <div className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                              paymentMode === 'INSTANT' ? 'border-[#f97316] bg-[#f97316]' : 'border-[#2a2548]'
                            )}>
                              {paymentMode === 'INSTANT' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <QrCode size={18} className="text-[#f97316]" />
                            <p className="text-sm font-bold text-white">Instan (QRIS & VA Bank)</p>
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed">
                            QRIS (GoPay, OVO, ShopeePay), BCA VA, Mandiri VA, BNI VA. Konfirmasi otomatis tanpa upload struk!
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMode('MANUAL')}
                          className={cn(
                            'p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden',
                            paymentMode === 'MANUAL'
                              ? 'border-[#f97316] bg-[#13112a] shadow-lg shadow-[#f97316]/10'
                              : 'border-[#2a2548] bg-[#1b1838] hover:border-[#f97316]/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/60">
                              Manual
                            </span>
                            <div className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                              paymentMode === 'MANUAL' ? 'border-[#f97316] bg-[#f97316]' : 'border-[#2a2548]'
                            )}>
                              {paymentMode === 'MANUAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 size={18} className="text-[#f97316]" />
                            <p className="text-sm font-bold text-white">Transfer Bank Manual</p>
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed">
                            Transfer langsung ke rekening BCA / BNI / Mandiri kami dan upload struk transfer untuk diverifikasi admin.
                          </p>
                        </button>
                      </div>

                      {/* Content based on payment mode */}
                      {paymentMode === 'INSTANT' ? (
                        <div className="p-5 rounded-2xl bg-[#13112a] border border-[#2a2548] space-y-3">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 size={16} />
                            <span>Pembayaran Otomatis Aktif</span>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed">
                            Setelah Anda menekan tombol <span className="text-[#f97316] font-bold">Kirim Booking</span> di bawah, jendela pembayaran aman Midtrans Snap akan muncul. Anda dapat langsung scan QRIS dengan aplikasi m-banking atau e-wallet pilihan Anda.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Pilih Bank */}
                          <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">
                              Pilih Rekening Tujuan Transfer
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {BANK_ACCOUNTS.map((bank) => (
                                <motion.button
                                  key={bank.id}
                                  type="button"
                                  id={`bank-${bank.id.toLowerCase()}`}
                                  onClick={() => setSelectedBank(bank.id)}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  className={cn(
                                    'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4',
                                    selectedBank === bank.id
                                      ? 'border-[#f97316] bg-[#13112a] shadow-md shadow-[#f97316]/20'
                                      : 'border-[#2a2548] bg-[#1b1838] hover:border-[#f97316]/50 hover:bg-[#13112a]'
                                  )}
                                >
                                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0', bank.color)}>
                                    {bank.logo}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white">{bank.fullName}</span>
                                      {selectedBank === bank.id && (
                                        <span className="text-xs bg-[#f97316] text-white px-2 py-0.5 rounded-full font-bold">Dipilih</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="font-mono text-base font-bold text-white tracking-widest">
                                        {bank.number}
                                      </span>
                                      <CopyButton text={bank.number} />
                                    </div>
                                    <p className="text-xs text-white/50">a.n. {bank.accountName}</p>
                                  </div>

                                  <div className={cn(
                                    'w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-200 flex items-center justify-center',
                                    selectedBank === bank.id
                                      ? 'border-[#f97316] bg-[#f97316]'
                                      : 'border-[#2a2548] bg-[#1b1838]'
                                  )}>
                                    {selectedBank === bank.id && (
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Upload Bukti Transfer */}
                          <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">
                              Upload Bukti Transfer Manual
                            </h4>

                            {!uploadedPreview ? (
                              <button
                                type="button"
                                id="upload-bukti-transfer"
                                onClick={handlePaymentProofUpload}
                                className="border-2 border-dashed border-[#2a2548] rounded-2xl p-8 text-center cursor-pointer hover:border-[#f97316] hover:bg-[#13112a] w-full transition-all duration-200 group"
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <div className="p-4 rounded-full bg-[#13112a] group-hover:bg-[#1b1838] transition-colors">
                                    <ImageIcon size={28} className="text-white/40 group-hover:text-[#f97316] transition-colors" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-sm">Klik untuk upload bukti transfer</p>
                                    <p className="text-xs text-white/40 mt-1">Format: JPG, PNG, WEBP • Maksimal 10 MB</p>
                                  </div>
                                  <span className="text-xs bg-[#f97316] text-white font-bold px-4 py-1.5 rounded-xl mt-1">
                                    Pilih File
                                  </span>
                                </div>
                              </button>
                            ) : (
                              <div className="relative rounded-2xl overflow-hidden border-2 border-green-500/30 bg-green-500/10">
                                <img
                                  src={uploadedPreview}
                                  alt="Preview bukti transfer"
                                  className="w-full max-h-64 object-contain"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-400" />
                                    <span className="text-white text-xs font-medium truncate max-w-48">
                                      {uploadedFile?.name || 'Bukti transfer'}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => { setUploadedFile(null); setUploadedPreview(null); }}
                                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                                    aria-label="Hapus file"
                                  >
                                    <X size={14} className="text-white" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Info Penting */}
                    <div className="p-4 rounded-2xl bg-[#13112a] border border-[#2a2548] flex items-start gap-3">
                      <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          <span className="font-bold text-white">Penting:</span> Pastikan jumlah transfer sesuai dengan nominal DP di atas. Tim admin akan memverifikasi bukti transfer Anda dalam 1×24 jam.
                        </p>
                      </div>
                    </div>
                  </StepWrapper>
                )}


                {/* Error from submit */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl"
                  >
                    <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-400 font-medium">{submitError}</p>
                  </motion.div>
                )}

                {/* ─── Navigation Buttons ─── */}
                <div className="flex justify-between items-center pt-6 border-t border-[#2a2548]">
                  {step > 1 ? (
                    <Button
                      type="button" onClick={prevStep}
                      className="bg-transparent border border-[#2a2548] text-white/60 hover:bg-[#2a2548] font-bold px-6 h-12 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <ChevronLeft size={16} />
                      Kembali
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < 7 ? (
                    <Button
                      type="button" onClick={nextStep}
                      disabled={!canProceed()}
                      className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-bold px-8 h-12 rounded-xl flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#f97316]/20"
                    >
                      Lanjut
                      <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      id="btn-kirim-booking"
                      onClick={handleSubmit}
                      disabled={!canProceed() || submitting}
                      className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-bold px-8 h-12 rounded-xl ml-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#f97316]/20"
                    >
                      {submitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                      ) : (
                        <><CheckCircle2 size={16} /> Kirim Booking</>
                      )}
                    </Button>
                  )}
                </div>

              </AnimatePresence>
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#13112a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
