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
  FileText, ShieldCheck, ClipboardList, Search, Package, QrCode, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BcaLogo } from '@/components/ui/bca-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { openSnapPayment } from '@/lib/snap';

// Bank info
const BANK_ACCOUNTS = [
  {
    id: 'BCA',
    name: 'BCA',
    fullName: 'Bank Central Asia',
    number: process.env.NEXT_PUBLIC_BANK_BCA_NUMBER || '1234567890',
    accountName: process.env.NEXT_PUBLIC_BANK_BCA_NAME || 'PT Rental Mobil Jogja',
    color: 'bg-transparent',
    logo: <BcaLogo />,
  },
  {
    id: 'BNI',
    name: 'BNI',
    fullName: 'Bank Negara Indonesia',
    number: process.env.NEXT_PUBLIC_BANK_BNI_NUMBER || '0987654321',
    accountName: process.env.NEXT_PUBLIC_BANK_BNI_NAME || 'PT Rental Mobil Jogja',
    color: 'bg-secondary',
    logo: <Landmark className="w-5 h-5 text-foreground" />,
  },
  {
    id: 'MANDIRI',
    name: 'Mandiri',
    fullName: 'Bank Mandiri',
    number: process.env.NEXT_PUBLIC_BANK_MANDIRI_NUMBER || '1122334455',
    accountName: process.env.NEXT_PUBLIC_BANK_MANDIRI_NAME || 'PT Rental Mobil Jogja',
    color: 'bg-secondary',
    logo: <Building2 className="w-5 h-5 text-foreground" />,
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
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground/50 hover:text-foreground cursor-pointer"
      aria-label="Salin nomor rekening"
    >
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
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

function StepWrapper({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}

function SectionDivider() {
  return <div className="border-t border-border my-6" />;
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

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.serviceType && !!formData.carId && !!date && !!endDate;
      case 2: return true;
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    const callbackUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname + window.location.search) : '/booking';
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-between selection:bg-secondary selection:text-foreground">
        <Navbar />
        <div className="py-32 px-4 max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mx-auto text-foreground shadow-xs">
            <User size={30} />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Login Diperlukan</h2>
          <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
            Anda harus masuk ke akun Anda terlebih dahulu sebelum dapat membuat reservasi mobil. Booking tanpa login tidak diperbolehkan.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href={`/login?callbackUrl=${callbackUrl}`}
              className="bg-foreground hover:bg-foreground/90 text-background font-bold h-12 rounded-xl flex items-center justify-center transition-all shadow-xs text-xs sm:text-sm"
            >
              Login Sekarang
            </Link>
            <Link
              href={`/register?callbackUrl=${callbackUrl}`}
              className="bg-card hover:bg-secondary text-foreground font-semibold h-12 rounded-xl flex items-center justify-center border border-border transition-all text-xs sm:text-sm"
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col selection:bg-secondary selection:text-foreground">
      <Navbar />

      {/* Header Banner */}
      <section className="relative pt-32 pb-10 px-4 overflow-hidden border-b border-border/80 bg-card/50">
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-3">
          <div className="flex justify-center items-center gap-2 text-xs text-foreground/50 font-medium">
            <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Booking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Form Pemesanan Sewa Mobil
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            Lengkapi 7 langkah mudah dan transparan untuk mereservasi unit mobil pilihan Anda
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full flex-1">

        {/* 7-Step Stepper */}
        <div className="mb-8 max-w-4xl mx-auto">
          {/* Desktop: horizontal stepper */}
          <div className="hidden lg:flex justify-between items-start relative">
            {/* Progress bar background */}
            <div className="absolute top-5 left-0 right-0 h-[2px] bg-border z-0" />
            {/* Progress bar fill */}
            <motion.div
              className="absolute top-5 left-0 h-[2px] bg-foreground z-0"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />

            {STEPS.map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              const Icon = s.icon;

              return (
                <div key={s.key} className="relative z-10 flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-foreground border-foreground text-background shadow-xs'
                      : isCurrent
                      ? 'bg-background border-foreground text-foreground ring-4 ring-foreground/15 shadow-xs'
                      : 'bg-card border-border text-foreground/40'
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Icon size={14} />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <span className={cn(
                      'block text-[11px] font-bold transition-colors duration-200',
                      isCompleted ? 'text-foreground' : isCurrent ? 'text-foreground' : 'text-foreground/40'
                    )}>
                      {s.label}
                    </span>
                    <span className={cn(
                      'block text-[9px] mt-0.5 transition-colors duration-200',
                      isCurrent ? 'text-foreground/70' : 'text-foreground/30'
                    )}>
                      {s.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile/Tablet: compact stepper */}
          <div className="flex lg:hidden items-center gap-3 bg-card border border-border p-3 rounded-2xl shadow-xs">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="p-1.5 rounded-xl bg-background border border-border text-foreground/60 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-colors shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1 relative">
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-foreground rounded-full"
                  animate={{ width: `${(step / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </div>
            </div>
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="p-1.5 rounded-xl bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/90 transition-colors shrink-0"
            >
              <ChevronRight size={16} />
            </button>
            <span className="text-xs font-bold text-foreground shrink-0 min-w-[3.5rem] text-right">
              {step} / {STEPS.length}
            </span>
          </div>

          {/* Step Title Indicator (Mobile) */}
          <div className="lg:hidden text-center mt-2.5">
            <span className="text-xs font-bold text-foreground">
              {STEPS[step - 1].label}
            </span>
            <span className="text-[11px] text-foreground/50 ml-1.5">
              &bull; {STEPS[step - 1].desc}
            </span>
          </div>
        </div>

        {/* Success State */}
        {bookingSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl shadow-xs p-8 sm:p-12 text-center relative z-10"
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-secondary/70 flex items-center justify-center text-foreground">
                <CheckCircle2 size={36} />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Booking Berhasil Dikirim!</h2>
            <p className="text-foreground/70 mb-1 text-xs sm:text-sm">
              Pesanan armada <strong>{selectedCarDetails?.name}</strong> telah berhasil didaftarkan.
            </p>
            <p className="text-foreground/50 text-xs sm:text-sm mb-8">
              Tim kami akan memverifikasi pembayaran DP dan menghubungi Anda via WhatsApp secepatnya.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/riwayat-booking">
                <Button className="bg-foreground hover:bg-foreground/90 text-background font-bold px-6 h-11 rounded-xl text-xs shadow-xs">
                  Lihat Riwayat Booking
                </Button>
              </Link>
              <Link href="/armada">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary font-bold px-6 h-11 rounded-xl text-xs">
                  Lihat Armada Lain
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <Card className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs relative z-10">
            <CardHeader className="bg-card/70 border-b border-border p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {STEPS[step - 1].label}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                    {step === 1 && 'Pilih jenis layanan, unit mobil, dan tentukan tanggal sewa Anda.'}
                    {step === 2 && 'Atur jam pengambilan, jam pengembalian, dan lokasi penjemputan.'}
                    {step === 3 && 'Periksa data rental yang sudah Anda pilih.'}
                    {step === 4 && 'Isi data diri Anda untuk keperluan verifikasi.'}
                    {step === 5 && 'Upload foto KTP dan SIM untuk verifikasi identitas.'}
                    {step === 6 && 'Review semua detail pesanan sebelum melakukan pembayaran.'}
                    {step === 7 && 'Pilih metode pembayaran DP 50% untuk konfirmasi pemesanan.'}
                  </p>
                </div>
                {/* Step badge */}
                <div className="hidden sm:flex items-center gap-1.5 bg-background border border-border rounded-xl px-3.5 py-1.5">
                  <span className="text-[11px] text-foreground/50">Langkah</span>
                  <span className="text-sm font-bold text-foreground">{step}</span>
                  <span className="text-[11px] text-foreground/50">/ {STEPS.length}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {/* ═══════════════════════════════════════════════════════
                   STEP 1: Pilih Armada
                   ═══════════════════════════════════════════════════════ */}
                {step === 1 && (
                  <StepWrapper step={step}>
                    {/* Service Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                        <Car size={13} className="text-foreground/70" /> Jenis Layanan <span className="text-red-600">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {[
                          { value: 'lepas-kunci', label: 'Lepas Kunci', desc: 'Tanpa driver, bebas', icon: Car },
                          { value: 'dengan-driver', label: 'Dengan Driver', desc: 'Termasuk sopir ramah', icon: User },
                        ].map((opt) => {
                          const selected = formData.serviceType === opt.value;
                          const OptIcon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => { setFormData(prev => ({ ...prev, serviceType: opt.value })); setSubmitError(''); }}
                              className={cn(
                                'w-full text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start gap-2 sm:gap-3.5 cursor-pointer',
                                selected
                                  ? 'border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs'
                                  : 'border-border bg-background hover:border-foreground/30'
                              )}
                            >
                              <div className="flex items-center justify-between w-full sm:w-auto">
                                <div className={cn(
                                  'w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border border-border',
                                  selected ? 'bg-foreground text-background' : 'bg-card text-foreground/60'
                                )}>
                                  <OptIcon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                                </div>
                                <div className={cn(
                                  'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 shrink-0 sm:hidden flex items-center justify-center',
                                  selected ? 'border-foreground bg-foreground' : 'border-border'
                                )}>
                                  {selected && <div className="w-1 h-1 rounded-full bg-background" />}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-xs sm:text-sm text-foreground block truncate">{opt.label}</span>
                                <p className="text-[10px] sm:text-[11px] text-foreground/60 mt-0.5 line-clamp-1 sm:line-clamp-none">{opt.desc}</p>
                              </div>
                              <div className={cn(
                                'w-4 h-4 rounded-full border-2 shrink-0 mt-1 hidden sm:flex items-center justify-center',
                                selected ? 'border-foreground bg-foreground' : 'border-border'
                              )}>
                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <SectionDivider />

                    {/* Car Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                        <Search size={13} className="text-foreground/70" /> Pilih Unit Mobil <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="carId" value={formData.carId} onChange={handleInputChange}
                        className="w-full h-9 sm:h-11 px-3 sm:px-3.5 bg-background border border-border text-foreground text-xs sm:text-sm rounded-xl focus:border-foreground/50 focus:outline-none appearance-none cursor-pointer"
                        disabled={loadingCars}
                      >
                        <option value="">
                          {loadingCars ? 'Memuat daftar armada...' : 'Pilih mobil yang Anda inginkan'}
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
                          className="mt-2.5 p-3 sm:p-4 bg-background border border-border rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 shadow-xs"
                        >
                          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                            {selectedCarDetails.image ? (
                              <img src={selectedCarDetails.image} alt={selectedCarDetails.name} className="w-full h-full object-cover" />
                            ) : (
                              <Car size={18} className="text-foreground/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground text-xs sm:text-sm truncate">{selectedCarDetails.name}</p>
                            <p className="text-[10px] sm:text-[11px] text-foreground/60">
                              Rp {selectedCarDetails.pricePerDay.toLocaleString('id-ID')} / 24 Jam
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <SectionDivider />

                    {/* Date Selection */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[11px] sm:text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide truncate">
                          <CalendarIcon size={12} className="text-foreground/70 shrink-0" /> Mulai <span className="text-red-600">*</span>
                        </label>
                        <Popover>
                          <PopoverTrigger className={cn(
                            'w-full justify-start text-left font-normal h-9 sm:h-11 rounded-xl border border-border bg-background text-foreground hover:bg-card px-2.5 sm:px-3.5 flex items-center transition-colors text-[11px] sm:text-sm cursor-pointer truncate',
                            !date && 'text-foreground/40'
                          )}>
                            <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 text-foreground/60 shrink-0" />
                            <span className="truncate">{date ? format(date, 'dd MMM yyyy', { locale: localeId }) : 'Pilih tgl'}</span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-md" align="start">
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

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[11px] sm:text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide truncate">
                          <CalendarIcon size={12} className="text-foreground/70 shrink-0" /> Selesai <span className="text-red-600">*</span>
                        </label>
                        <Popover>
                          <PopoverTrigger className={cn(
                            'w-full justify-start text-left font-normal h-9 sm:h-11 rounded-xl border border-border bg-background text-foreground hover:bg-card px-2.5 sm:px-3.5 flex items-center transition-colors text-[11px] sm:text-sm cursor-pointer truncate',
                            !endDate && 'text-foreground/40'
                          )}>
                            <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 text-foreground/60 shrink-0" />
                            <span className="truncate">{endDate ? format(endDate, 'dd MMM yyyy', { locale: localeId }) : 'Pilih tgl'}</span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-md" align="start">
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
                        className="p-2.5 sm:p-3 bg-secondary/30 border border-border rounded-xl flex items-center gap-2"
                      >
                        <Clock size={14} className="text-foreground/70 shrink-0" />
                        <span className="text-[11px] sm:text-xs text-foreground/80">
                          Total durasi sewa: <strong className="text-foreground">{formatDuration(parseInt(formData.duration))}</strong>
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
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[11px] sm:text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide truncate">
                          <Clock size={13} className="text-foreground/70 shrink-0" /> Jam Ambil <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="time" name="pickupTime"
                          value={formData.pickupTime} onChange={handleInputChange}
                          className="bg-background border-border text-foreground rounded-xl h-9 sm:h-11 text-xs sm:text-sm px-2.5"
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[11px] sm:text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide truncate">
                          <Clock size={13} className="text-foreground/70 shrink-0" /> Jam Kembali <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="time" name="returnTime"
                          value={formData.returnTime} onChange={handleInputChange}
                          className="bg-background border-border text-foreground rounded-xl h-9 sm:h-11 text-xs sm:text-sm px-2.5"
                        />
                      </div>
                    </div>

                    <SectionDivider />

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                        <MapPin size={13} className="text-foreground/70 shrink-0" /> Titik Penjemputan / Pengantaran Unit
                      </label>
                      <Input
                        type="text" name="pickupLocation"
                        placeholder="Contoh: Bandara YIA / Stasiun Tugu / Hotel"
                        value={formData.pickupLocation} onChange={handleInputChange}
                        className="bg-background border-border text-foreground placeholder:text-foreground/40 rounded-xl h-9 sm:h-11 text-xs sm:text-sm"
                      />
                      <p className="text-[10px] sm:text-[11px] text-foreground/50 mt-1">
                        Biarkan kosong jika Anda ingin mengambil langsung di garasi kami.
                      </p>
                    </div>

                    {/* Time validation hint */}
                    {date && endDate && formData.pickupTime && formData.returnTime && (
                      <div className="p-2.5 sm:p-3 bg-secondary/30 border border-border rounded-xl flex items-center gap-2">
                        <Clock size={14} className="text-foreground/70 shrink-0" />
                        <span className="text-[11px] sm:text-xs text-foreground/80 leading-tight">
                          Jadwal: <strong className="text-foreground">{format(date, 'dd MMM', { locale: localeId })} {formData.pickupTime}</strong> s/d <strong className="text-foreground">{format(endDate, 'dd MMM', { locale: localeId })} {formData.returnTime}</strong>
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
                    <div className="bg-background rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border space-y-2.5 shadow-xs">
                      <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/60 pb-2 border-b border-border flex items-center gap-2">
                        <Package size={13} className="text-foreground/70" /> Rangkuman Detail Sewa
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 text-[11px] sm:text-sm">
                        <div className="text-foreground/60">Tipe Layanan:</div>
                        <div className="font-bold text-foreground text-right capitalize">
                          {formData.serviceType === 'lepas-kunci' ? 'Lepas Kunci' : formData.serviceType === 'dengan-driver' ? 'Dengan Driver' : '-'}
                        </div>
                        <div className="text-foreground/60">Unit Mobil:</div>
                        <div className="font-bold text-foreground text-right truncate">{selectedCarDetails?.name || '-'}</div>
                        <div className="text-foreground/60">Tanggal Mulai:</div>
                        <div className="font-bold text-foreground text-right truncate">
                          {date ? format(date, 'PPP', { locale: localeId }) : '-'}
                        </div>
                        <div className="text-foreground/60">Jam Ambil:</div>
                        <div className="font-bold text-foreground text-right">{formData.pickupTime || '-'}</div>
                        <div className="text-foreground/60">Tanggal Selesai:</div>
                        <div className="font-bold text-foreground text-right truncate">
                          {endDate ? format(endDate, 'PPP', { locale: localeId }) : '-'}
                        </div>
                        <div className="text-foreground/60">Jam Kembali:</div>
                        <div className="font-bold text-foreground text-right">{formData.returnTime || '-'}</div>
                        <div className="text-foreground/60">Durasi Sewa:</div>
                        <div className="font-bold text-foreground text-right">{formatDuration(parseInt(formData.duration))}</div>
                        <div className="text-foreground/60">Lokasi:</div>
                        <div className="font-bold text-foreground text-right truncate">{formData.pickupLocation || 'Ambil di Garasi'}</div>
                      </div>
                    </div>

                    {selectedCarDetails && (
                      <div className="bg-background rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border space-y-2 shadow-xs">
                        <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/60 pb-2 border-b border-border flex items-center gap-2">
                          <CreditCard size={13} className="text-foreground/70" /> Estimasi Biaya Sewa
                        </h4>
                        <div className="flex justify-between items-center text-[11px] sm:text-xs text-foreground/70">
                          <span>Tarif Sewa Unit:</span>
                          <span className="font-semibold text-foreground">Rp {selectedCarDetails.pricePerDay.toLocaleString('id-ID')} / hari</span>
                        </div>
                        {formData.serviceType === 'dengan-driver' && (
                          <div className="flex justify-between items-center text-[11px] sm:text-xs text-foreground font-medium">
                            <span>Layanan Driver:</span>
                            <span className="font-semibold">+Rp {driverFeePerDay.toLocaleString('id-ID')} / hari</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[11px] sm:text-xs text-foreground/70 pt-2 border-t border-border">
                          <span>Total Hari Sewa:</span>
                          <span className="font-bold text-foreground">{rentalDays} Hari</span>
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
                    <div className="bg-secondary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border flex items-start gap-2.5 mb-2">
                      <AlertTriangle size={15} className="text-foreground/70 shrink-0 mt-0.5" />
                      <p className="text-[11px] sm:text-xs text-foreground/70 leading-relaxed">
                        Data diri Anda akan digunakan untuk keperluan verifikasi identitas dan konfirmasi penyerahan armada mobil.
                      </p>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                        <User size={13} className="text-foreground/70" /> Nama Lengkap Sesuai KTP <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="text" name="name"
                        placeholder="Contoh: Ahmad Fauzi"
                        value={formData.name} onChange={handleInputChange}
                        className="bg-background border-border text-foreground placeholder:text-foreground/40 rounded-xl h-9 sm:h-11 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                          <Phone size={13} className="text-foreground/70" /> Nomor WhatsApp <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="tel" name="phone"
                          placeholder="08123456789"
                          value={formData.phone} onChange={handleInputChange}
                          className="bg-background border-border text-foreground placeholder:text-foreground/40 rounded-xl h-9 sm:h-11 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                          <Mail size={13} className="text-foreground/70" /> Alamat Email
                        </label>
                        <Input
                          type="email" name="email"
                          placeholder="email@example.com"
                          value={formData.email} onChange={handleInputChange}
                          className="bg-background border-border text-foreground placeholder:text-foreground/40 rounded-xl h-9 sm:h-11 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Auto-fill info */}
                    {user && (
                      <div className="p-2.5 sm:p-3 bg-background border border-border rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span className="text-[11px] sm:text-xs text-foreground/70 truncate">
                          Tersinkron dari akun: <strong className="text-foreground">{user.email}</strong>
                        </span>
                      </div>
                    )}
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 5: Upload Dokumen (2 Cols on Mobile)
                   ═══════════════════════════════════════════════════════ */}
                {step === 5 && (
                  <StepWrapper step={step}>
                    <div className="bg-secondary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border flex items-start gap-2.5 mb-2">
                      <ShieldCheck size={15} className="text-foreground/70 shrink-0 mt-0.5" />
                      <p className="text-[11px] sm:text-xs text-foreground/70 leading-relaxed">
                        Unggah foto KTP dan SIM asli Anda untuk verifikasi identitas resmi.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                      {/* Upload Foto KTP */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Upload size={13} className="text-foreground/70" />
                          <h3 className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wide truncate">
                            Foto KTP <span className="text-red-600">*</span>
                          </h3>
                        </div>

                        {!ktpPreview ? (
                          <button
                            type="button"
                            onClick={() => handleDocumentUpload('ktp')}
                            className="border-2 border-dashed border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-6 text-center cursor-pointer hover:border-foreground/40 bg-background w-full transition-all flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px]"
                          >
                            <div className="p-2 sm:p-3 rounded-full bg-secondary text-foreground mb-1.5">
                              <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                            </div>
                            <p className="font-bold text-foreground text-[10px] sm:text-xs leading-tight">Upload KTP</p>
                            <p className="text-[9px] sm:text-[10px] text-foreground/50 mt-0.5">Maks 5MB</p>
                          </button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-background"
                          >
                            <img src={ktpPreview} alt="KTP" className="w-full h-28 sm:h-44 object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xs px-2 sm:px-3 py-1.5 border-t border-border flex items-center justify-between">
                              <span className="text-foreground text-[10px] sm:text-xs font-semibold truncate">KTP OK</span>
                              <button
                                type="button"
                                onClick={() => { setKtpFile(null); setKtpPreview(null); }}
                                className="p-0.5 rounded text-foreground/60 hover:text-foreground cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Upload Foto SIM */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Upload size={13} className="text-foreground/70" />
                          <h3 className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wide truncate">
                            Foto SIM A <span className="text-red-600">*</span>
                          </h3>
                        </div>

                        {!simPreview ? (
                          <button
                            type="button"
                            onClick={() => handleDocumentUpload('sim')}
                            className="border-2 border-dashed border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-6 text-center cursor-pointer hover:border-foreground/40 bg-background w-full transition-all flex flex-col items-center justify-center min-h-[120px] sm:min-h-[160px]"
                          >
                            <div className="p-2 sm:p-3 rounded-full bg-secondary text-foreground mb-1.5">
                              <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                            </div>
                            <p className="font-bold text-foreground text-[10px] sm:text-xs leading-tight">Upload SIM</p>
                            <p className="text-[9px] sm:text-[10px] text-foreground/50 mt-0.5">Maks 5MB</p>
                          </button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-background"
                          >
                            <img src={simPreview} alt="SIM" className="w-full h-28 sm:h-44 object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xs px-2 sm:px-3 py-1.5 border-t border-border flex items-center justify-between">
                              <span className="text-foreground text-[10px] sm:text-xs font-semibold truncate">SIM OK</span>
                              <button
                                type="button"
                                onClick={() => { setSimFile(null); setSimPreview(null); }}
                                className="p-0.5 rounded text-foreground/60 hover:text-foreground cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 6: Ringkasan
                   ═══════════════════════════════════════════════════════ */}
                {step === 6 && (
                  <StepWrapper step={step}>
                    {/* Data Penyewa */}
                    <div className="bg-background rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border space-y-2 shadow-xs">
                      <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/60 pb-1.5 border-b border-border flex items-center gap-1.5">
                        <User size={13} className="text-foreground/70" /> Identitas Penyewa
                      </h4>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px] sm:text-sm">
                        <div className="text-foreground/60">Nama:</div>
                        <div className="font-bold text-foreground text-right truncate">{formData.name || '-'}</div>
                        <div className="text-foreground/60">WhatsApp:</div>
                        <div className="font-bold text-foreground text-right truncate">{formData.phone || '-'}</div>
                        <div className="text-foreground/60">Email:</div>
                        <div className="font-bold text-foreground text-right truncate">{formData.email || '-'}</div>
                      </div>
                    </div>

                    {/* Detail Rental */}
                    <div className="bg-background rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border space-y-2 shadow-xs">
                      <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/60 pb-1.5 border-b border-border flex items-center gap-1.5">
                        <Car size={13} className="text-foreground/70" /> Detail Sewa Kendaraan
                      </h4>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px] sm:text-sm">
                        <div className="text-foreground/60">Layanan:</div>
                        <div className="font-bold text-foreground text-right capitalize">
                          {formData.serviceType === 'lepas-kunci' ? 'Lepas Kunci' : formData.serviceType === 'dengan-driver' ? 'Dengan Driver' : '-'}
                        </div>
                        <div className="text-foreground/60">Unit:</div>
                        <div className="font-bold text-foreground text-right truncate">{selectedCarDetails?.name || '-'}</div>
                        <div className="text-foreground/60">Mulai:</div>
                        <div className="font-bold text-foreground text-right truncate">
                          {date ? `${format(date, 'dd MMM yyyy', { locale: localeId })} ${formData.pickupTime}` : '-'}
                        </div>
                        <div className="text-foreground/60">Selesai:</div>
                        <div className="font-bold text-foreground text-right truncate">
                          {endDate ? `${format(endDate, 'dd MMM yyyy', { locale: localeId })} ${formData.returnTime}` : '-'}
                        </div>
                        <div className="text-foreground/60">Durasi:</div>
                        <div className="font-bold text-foreground text-right">{formatDuration(parseInt(formData.duration))}</div>
                        <div className="text-foreground/60">Lokasi:</div>
                        <div className="font-bold text-foreground text-right truncate">{formData.pickupLocation || 'Ambil di Garasi'}</div>
                        <div className="text-foreground/60">Dokumen:</div>
                        <div className="font-bold text-foreground text-right">
                          {ktpPreview && simPreview ? (
                            <span className="text-emerald-600 font-semibold">✓ Terlampir</span>
                          ) : (
                            <span className="text-amber-600">Belum Lengkap</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rincian Biaya */}
                    {selectedCarDetails && (
                      <div className="bg-background rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-border space-y-2 shadow-xs">
                        <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/60 pb-1.5 border-b border-border flex items-center gap-1.5">
                          <CreditCard size={13} className="text-foreground/70" /> Rincian Tarif
                        </h4>
                        <div className="flex justify-between items-center text-[11px] sm:text-sm text-foreground/70">
                          <span className="truncate">Sewa {selectedCarDetails.name}</span>
                          <span className="font-semibold text-foreground shrink-0">Rp {selectedCarDetails.pricePerDay.toLocaleString('id-ID')} × {rentalDays}h</span>
                        </div>
                        {formData.serviceType === 'dengan-driver' && (
                          <div className="flex justify-between items-center text-[11px] sm:text-sm text-foreground font-medium">
                            <span>Driver</span>
                            <span className="font-semibold">+Rp {driverFeePerDay.toLocaleString('id-ID')} × {rentalDays}h</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                          <span className="text-xs sm:text-sm font-bold text-foreground">Total</span>
                          <span className="text-base sm:text-xl font-black text-foreground">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}

                    {/* DP Banner */}
                    <div className="bg-foreground text-background rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center justify-between shadow-xs">
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-background/60 uppercase tracking-widest font-bold mb-0.5">Kewajiban DP (50%)</p>
                        <p className="text-xl sm:text-3xl font-black">Rp {dpAmount.toLocaleString('id-ID')}</p>
                      </div>
                      <CheckCircle2 className="w-7 h-7 sm:w-9 sm:h-9 text-background/80" />
                    </div>
                  </StepWrapper>
                )}

                {/* ═══════════════════════════════════════════════════════
                   STEP 7: Pembayaran DP (2 Cols on Mobile)
                   ═══════════════════════════════════════════════════════ */}
                {step === 7 && (
                  <StepWrapper step={step}>
                    {/* DP Amount Banner */}
                    <div className="bg-foreground text-background rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shadow-xs">
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-background/60 uppercase tracking-widest font-bold mb-0.5">Nominal Pembayaran DP</p>
                        <p className="text-xl sm:text-3xl font-black">Rp {dpAmount.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] sm:text-xs text-background/70 mt-0.5">50% dari total tagihan Rp {totalPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] sm:text-[10px] text-background/60 uppercase font-bold">Unit Terpilih</p>
                        <p className="font-bold text-xs sm:text-sm truncate">{selectedCarDetails?.name}</p>
                        <p className="text-[10px] sm:text-xs text-background/70">{formatDuration(parseInt(formData.duration))}</p>
                      </div>
                    </div>

                    {/* Pilih Metode Pembayaran */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-foreground/70" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                          Pilih Metode Pembayaran DP
                        </h3>
                      </div>

                      {/* Payment Mode Selector Tabs (2 Cols on Mobile) */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMode('INSTANT')}
                          className={cn(
                            'p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
                            paymentMode === 'INSTANT'
                              ? 'border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs'
                              : 'border-border bg-background hover:border-foreground/30'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-foreground text-background">
                              <Sparkles size={10} /> Instan
                            </span>
                            <div className={cn(
                              'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center',
                              paymentMode === 'INSTANT' ? 'border-foreground bg-foreground' : 'border-border'
                            )}>
                              {paymentMode === 'INSTANT' && <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-background" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <QrCode size={15} className="text-foreground shrink-0" />
                            <p className="text-[11px] sm:text-sm font-bold text-foreground truncate">QRIS &amp; VA</p>
                          </div>
                          <p className="text-[10px] text-foreground/60 leading-tight line-clamp-2">
                            QRIS, BCA VA, BNI VA, Mandiri. Instan!
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMode('MANUAL')}
                          className={cn(
                            'p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
                            paymentMode === 'MANUAL'
                              ? 'border-foreground bg-secondary/40 ring-1 ring-foreground/20 shadow-xs'
                              : 'border-border bg-background hover:border-foreground/30'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-secondary text-foreground border border-border">
                              Manual
                            </span>
                            <div className={cn(
                              'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center',
                              paymentMode === 'MANUAL' ? 'border-foreground bg-foreground' : 'border-border'
                            )}>
                              {paymentMode === 'MANUAL' && <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-background" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Building2 size={15} className="text-foreground shrink-0" />
                            <p className="text-[11px] sm:text-sm font-bold text-foreground truncate">Transfer Bank</p>
                          </div>
                          <p className="text-[10px] text-foreground/60 leading-tight line-clamp-2">
                            Transfer ke rekening &amp; upload struk bukti.
                          </p>
                        </button>
                      </div>

                      {/* Content based on payment mode */}
                      {paymentMode === 'INSTANT' ? (
                        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-background border border-border space-y-1.5">
                          <div className="flex items-center gap-2 text-foreground text-xs font-bold">
                            <CheckCircle2 size={14} />
                            <span>Gateway Pembayaran Otomatis Aktif</span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-foreground/70 leading-relaxed">
                            Popup pembayaran Midtrans Snap akan terbuka saat Anda menekan tombol di bawah. Anda dapat membayar dengan QRIS atau Virtual Account.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Pilih Bank */}
                          <div className="space-y-2 pt-1">
                            <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                              Pilih Rekening Tujuan Transfer
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {BANK_ACCOUNTS.map((bank) => (
                                <button
                                  key={bank.id}
                                  type="button"
                                  id={`bank-${bank.id.toLowerCase()}`}
                                  onClick={() => setSelectedBank(bank.id)}
                                  className={cn(
                                    'w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer',
                                    selectedBank === bank.id
                                      ? 'border-foreground bg-secondary/40 ring-1 ring-foreground/20'
                                      : 'border-border bg-background hover:border-foreground/30'
                                  )}
                                >
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-border">
                                    {bank.logo}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-[11px] sm:text-xs text-foreground block truncate">{bank.fullName}</span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="font-mono text-xs font-bold text-foreground truncate">
                                        {bank.number}
                                      </span>
                                      <CopyButton text={bank.number} />
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Upload Bukti Transfer */}
                          <div className="space-y-2 pt-1">
                            <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                              Upload Bukti Transfer Manual
                            </h4>

                            {!uploadedPreview ? (
                              <button
                                type="button"
                                id="upload-bukti-transfer"
                                onClick={handlePaymentProofUpload}
                                className="border-2 border-dashed border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:border-foreground/40 bg-background w-full transition-all group"
                              >
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="p-2 sm:p-3 rounded-full bg-secondary text-foreground">
                                    <ImageIcon size={20} />
                                  </div>
                                  <p className="font-bold text-foreground text-xs">Klik untuk upload bukti transfer</p>
                                  <p className="text-[10px] text-foreground/50">JPG, PNG, WEBP &bull; Maks 10MB</p>
                                </div>
                              </button>
                            ) : (
                              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-background">
                                <img
                                  src={uploadedPreview}
                                  alt="Preview bukti transfer"
                                  className="w-full max-h-48 object-contain"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xs px-3 py-2 border-t border-border flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    <span className="text-foreground text-[11px] font-semibold truncate max-w-40">
                                      {uploadedFile?.name || 'Bukti transfer'}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => { setUploadedFile(null); setUploadedPreview(null); }}
                                    className="p-1 rounded-lg hover:bg-secondary text-foreground/60 hover:text-foreground cursor-pointer"
                                    aria-label="Hapus file"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Info Penting */}
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-start gap-2.5">
                      <AlertTriangle size={15} className="text-foreground/70 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-foreground/70 leading-relaxed">
                          <strong className="text-foreground">Penting:</strong> Pastikan nominal transfer sesuai dengan jumlah DP di atas. Tim admin kami akan memverifikasi dan menyetujui pesanan Anda dalam 1×24 jam.
                        </p>
                      </div>
                    </div>
                  </StepWrapper>
                )}

                {/* Error from submit */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p className="text-xs font-semibold">{submitError}</p>
                  </motion.div>
                )}

                {/* ─── Navigation Buttons ─── */}
                <div className="flex justify-between items-center pt-6 border-t border-border">
                  {step > 1 ? (
                    <Button
                      type="button" onClick={prevStep}
                      className="bg-card border border-border text-foreground hover:bg-secondary font-bold px-5 h-11 rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer"
                    >
                      <ChevronLeft size={15} />
                      Kembali
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < 7 ? (
                    <Button
                      type="button" onClick={nextStep}
                      disabled={!canProceed()}
                      className="bg-foreground hover:bg-foreground/90 text-background font-bold px-6 h-11 rounded-xl flex items-center gap-1.5 ml-auto text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                    >
                      Lanjut
                      <ChevronRight size={15} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      id="btn-kirim-booking"
                      onClick={handleSubmit}
                      disabled={!canProceed() || submitting}
                      className="bg-foreground hover:bg-foreground/90 text-background font-bold px-7 h-11 rounded-xl ml-auto flex items-center gap-2 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                    >
                      {submitting ? (
                        <><div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" /> Memproses...</>
                      ) : (
                        <><CheckCircle2 size={16} /> Kirim Booking Sekarang</>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
