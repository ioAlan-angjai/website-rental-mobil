'use client';

import { useState, useCallback, Suspense, useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { BcaLogo } from '@/components/ui/bca-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

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
      className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700"
      aria-label="Salin nomor rekening"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

// Form booking
function BookingForm() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user as any;

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
  const [selectedBank, setSelectedBank] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
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
    if (submitError) setSubmitError('');
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
    if (step < 4) setStep(step + 1);
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

  // Dropzone for upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setUploadedPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const apiPaymentMethod = selectedBank ? `${selectedBank}_TRANSFER` : null;

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

      // Upload proof image if uploadedPreview exists and booking was created
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

  const stepLabels = ['Identitas', 'Layanan & Unit', 'Konfirmasi', 'Pembayaran'];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      <BackgroundOrnaments />

      {/* Header Banner */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-950 transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-zinc-950 font-bold">Booking</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
            Form Booking
          </h1>
          <p className="text-zinc-650 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Isi formulir di bawah untuk melakukan reservasi mobil Anda
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">

        {/* Step Indicator */}
        <div className="mb-10 max-w-lg mx-auto">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-zinc-200 z-0" />
            <div
              className="absolute top-5 left-0 h-1 bg-zinc-900 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            {stepLabels.map((label, index) => (
              <div key={label} className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300',
                  step > index + 1
                    ? 'bg-zinc-900 border-zinc-900 text-white'
                    : step === index + 1
                    ? 'bg-zinc-900 border-zinc-900 text-white ring-4 ring-zinc-900/10'
                    : 'bg-white border-zinc-200 text-zinc-400'
                )}>
                  {step > index + 1 ? <CheckCircle2 size={18} /> : index + 1}
                </div>
                <span className="text-[11px] font-bold text-zinc-900 mt-2 bg-slate-50 px-1 text-center whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Success State */}
        {bookingSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-12 text-center relative z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-green-50 rounded-full">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Booking Terkirim!</h2>
            <p className="text-zinc-500 mb-1 text-sm">
              Pesanan Anda untuk <strong>{selectedCarDetails?.name}</strong> telah kami terima.
            </p>
            <p className="text-zinc-400 text-sm mb-8">
              Tim kami akan menghubungi Anda via WhatsApp dalam 1×24 jam untuk konfirmasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-12 rounded-xl">
                  Kembali ke Beranda
                </Button>
              </Link>
              <Link href="/armada">
                <Button className="bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold px-8 h-12 rounded-xl">
                  Lihat Armada Lain
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <Card className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm relative z-10">
            <CardHeader className="bg-zinc-50 border-b border-zinc-200 p-8">
              <CardTitle className="text-2xl font-bold text-zinc-900 font-serif">
                {step === 1 && 'Data Diri Penyewa'}
                {step === 2 && 'konfirmasi Detail Sewa & Armada'}
                {step === 3 && 'Review & Konfirmasi Booking'}
                {step === 4 && 'Pembayaran DP'}
              </CardTitle>
              <p className="text-sm text-zinc-500 mt-2">
                {step === 1 && 'Harap isi informasi kontak valid untuk proses verifikasi.'}
                {step === 2 && 'Pilih jenis layanan sewa dan unit armada yang Anda inginkan.'}
                {step === 3 && 'Periksa kembali data pesanan Anda sebelum melanjutkan ke pembayaran.'}
                {step === 4 && 'Transfer DP 50% ke salah satu rekening di bawah, lalu upload bukti transfer.'}
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >

                  {/* ─── STEP 1: Identitas ─── */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <User size={14} /> Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text" name="name"
                          placeholder="Contoh: Ahmad Fauzi"
                          value={formData.name} onChange={handleInputChange}
                          className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <Phone size={14} /> Nomor WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="tel" name="phone"
                            placeholder="08123456789"
                            value={formData.phone} onChange={handleInputChange}
                            className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <Mail size={14} /> Email
                          </label>
                          <Input
                            type="email" name="email"
                            placeholder="email@example.com"
                            value={formData.email} onChange={handleInputChange}
                            className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── STEP 2: Layanan & Unit ─── */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Car size={14} /> Jenis Layanan <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="serviceType" value={formData.serviceType} onChange={handleInputChange}
                          className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:border-zinc-900 focus:outline-none"
                        >
                          <option value="">Pilih jenis layanan</option>
                          <option value="lepas-kunci">Sewa Lepas Kunci</option>
                          <option value="dengan-driver">Sewa Dengan Driver</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Car size={14} /> Pilih Unit Mobil <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="carId" value={formData.carId} onChange={handleInputChange}
                          className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:border-zinc-900 focus:outline-none"
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
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <CalendarIcon size={14} /> Tanggal Mulai <span className="text-red-500">*</span>
                          </label>
                          <Popover>
                            <PopoverTrigger className={cn(
                              'w-full justify-start text-left font-normal h-12 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 px-4 flex items-center',
                              !date && 'text-zinc-400'
                            )}>
                              <CalendarIcon className="mr-2 h-4 w-4 text-zinc-900" />
                              {date ? format(date, 'PPP', { locale: localeId }) : <span>Pilih tanggal mulai</span>}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white border border-zinc-200" align="start">
                              <Calendar
                                mode="single" selected={date}
                                onSelect={(d) => {
                                  setDate(d);
                                  // Reset end date if it's before new start date
                                  if (endDate && d && endDate < d) setEndDate(undefined);
                                }}
                                disabled={(d) => d < todayMidnight}
                                className="rounded-xl"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <CalendarIcon size={14} /> Tanggal Selesai <span className="text-red-500">*</span>
                          </label>
                          <Popover>
                            <PopoverTrigger className={cn(
                              'w-full justify-start text-left font-normal h-12 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 px-4 flex items-center',
                              !endDate && 'text-zinc-400'
                            )}>
                              <CalendarIcon className="mr-2 h-4 w-4 text-zinc-900" />
                              {endDate ? format(endDate, 'PPP', { locale: localeId }) : <span>Pilih tanggal selesai</span>}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white border border-zinc-200" align="start">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <Clock size={14} /> Jam Pengambilan <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="time" name="pickupTime"
                            value={formData.pickupTime} onChange={handleInputChange}
                            className="bg-zinc-50 border-zinc-200 text-zinc-900 rounded-xl h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <Clock size={14} /> Jam Pengembalian <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="time" name="returnTime"
                            value={formData.returnTime} onChange={handleInputChange}
                            className="bg-zinc-50 border-zinc-200 text-zinc-900 rounded-xl h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <MapPin size={14} /> Lokasi Penjemputan / Pengantaran
                        </label>
                        <Input
                          type="text" name="pickupLocation"
                          placeholder="Contoh: Bandara YIA / Stasiun Tugu / Hotel"
                          value={formData.pickupLocation} onChange={handleInputChange}
                          className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12"
                        />
                      </div>
                    </div>
                  )}

                  {/* ─── STEP 3: Konfirmasi ─── */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 pb-2 border-b border-zinc-200">
                          Resume Pesanan
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                          <div className="text-zinc-500">Nama Penyewa:</div>
                          <div className="font-bold text-zinc-900 text-right">{formData.name || '-'}</div>
                          <div className="text-zinc-500">WhatsApp:</div>
                          <div className="font-bold text-zinc-900 text-right">{formData.phone || '-'}</div>
                          <div className="text-zinc-500">Email:</div>
                          <div className="font-bold text-zinc-900 text-right">{formData.email || '-'}</div>
                          <div className="text-zinc-500">Layanan:</div>
                          <div className="font-bold text-zinc-900 capitalize text-right">{formData.serviceType || '-'}</div>
                          <div className="text-zinc-500">Unit Mobil:</div>
                          <div className="font-bold text-zinc-900 text-right">{selectedCarDetails?.name || '-'}</div>
                          <div className="text-zinc-500">Tanggal Mulai:</div>
                          <div className="font-bold text-zinc-900 text-right font-sans">
                            {date ? `${format(date, 'PPP', { locale: localeId })} pukul ${formData.pickupTime}` : '-'}
                          </div>
                          <div className="text-zinc-500">Tanggal Selesai:</div>
                          <div className="font-bold text-zinc-900 text-right font-sans">
                            {endDate ? `${format(endDate, 'PPP', { locale: localeId })} pukul ${formData.returnTime}` : '-'}
                          </div>
                          <div className="text-zinc-500">Durasi:</div>
                          <div className="font-bold text-zinc-900 text-right">{formatDuration(parseInt(formData.duration))}</div>
                          <div className="text-zinc-500">Lokasi:</div>
                          <div className="font-bold text-zinc-900 text-right">{formData.pickupLocation || 'Ambil di Kantor'}</div>
                        </div>
                      </div>

                      {selectedCarDetails && (
                        <div className="space-y-3">
                          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-2">
                            <div className="flex justify-between items-center text-xs text-zinc-500">
                              <span>Sewa Mobil ({selectedCarDetails.name}):</span>
                              <span className="font-semibold text-zinc-800">Rp {selectedCarDetails.pricePerDay.toLocaleString('id-ID')} / hari</span>
                            </div>
                            {formData.serviceType === 'dengan-driver' && (
                              <div className="flex justify-between items-center text-xs text-emerald-600 font-medium">
                                <span>Layanan Driver Tambahan:</span>
                                <span className="font-semibold">+Rp {driverFeePerDay.toLocaleString('id-ID')} / hari</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-xs text-zinc-500 pt-1 border-t border-zinc-200">
                              <span>Durasi Total ({rentalDays} Hari):</span>
                              <span className="font-semibold text-zinc-800">{rentalDays} × Rp {dailyRate.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                              <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold">Total Harga Sewa</p>
                              <p className="text-xl font-bold text-zinc-900">
                                Rp {totalPrice.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <div className="bg-zinc-900 text-white rounded-2xl p-5 flex justify-between items-center shadow-lg">
                            <div>
                              <p className="text-xs text-zinc-400 uppercase tracking-wide">DP yang Harus Dibayar (50%)</p>
                              <p className="text-2xl font-bold">
                                Rp {dpAmount.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200">
                        <p className="text-xs text-zinc-700 leading-relaxed">
                          <span className="font-bold">Catatan:</span> Dengan melanjutkan, Anda menyetujui syarat & ketentuan rental mobil kami. Langkah berikutnya adalah pembayaran DP 50%.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ─── STEP 4: Pembayaran ─── */}
                  {step === 4 && (
                    <div className="space-y-8">

                      {/* DP Amount Banner */}
                      <div className="bg-zinc-900 text-white rounded-2xl p-6 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Jumlah DP yang Harus Dibayar</p>
                          <p className="text-3xl font-black">Rp {dpAmount.toLocaleString('id-ID')}</p>
                          <p className="text-xs text-zinc-400 mt-1">50% dari total Rp {totalPrice.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-400">Unit</p>
                          <p className="font-bold text-sm">{selectedCarDetails?.name}</p>
                          <p className="text-xs text-zinc-400">{formatDuration(parseInt(formData.duration))}</p>
                        </div>
                      </div>

                      {/* Pilih Bank */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-zinc-700" />
                          <h3 className="text-sm font-bold text-zinc-900">
                            1. Pilih Rekening Tujuan Transfer
                          </h3>
                        </div>

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
                                  ? 'border-zinc-900 bg-zinc-50 shadow-md shadow-zinc-900/5'
                                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                              )}
                            >
                              {/* Bank icon / color strip */}
                              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0', bank.color)}>
                                {bank.logo}
                              </div>

                              {/* Bank info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-900">{bank.fullName}</span>
                                  {selectedBank === bank.id && (
                                    <span className="text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-full font-bold">Dipilih</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-lg font-bold text-zinc-900 tracking-widest">
                                    {bank.number}
                                  </span>
                                  <CopyButton text={bank.number} />
                                </div>
                                <p className="text-xs text-zinc-500">a.n. {bank.accountName}</p>
                              </div>

                              {/* Radio indicator */}
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-200 flex items-center justify-center',
                                selectedBank === bank.id
                                  ? 'border-zinc-900 bg-zinc-900'
                                  : 'border-zinc-300 bg-white'
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Upload size={16} className="text-zinc-700" />
                          <h3 className="text-sm font-bold text-zinc-900">
                            2. Upload Bukti Transfer
                          </h3>
                        </div>

                        {!uploadedPreview ? (
                          <div
                            {...getRootProps()}
                            id="upload-bukti-transfer"
                            className={cn(
                              'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
                              isDragActive
                                ? 'border-zinc-900 bg-zinc-50'
                                : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                            )}
                          >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-3">
                              <div className={cn(
                                'p-4 rounded-full transition-all duration-200',
                                isDragActive ? 'bg-zinc-200' : 'bg-zinc-100'
                              )}>
                                <ImageIcon size={28} className="text-zinc-500" />
                              </div>
                              <div>
                                <p className="font-bold text-zinc-900 text-sm">
                                  {isDragActive ? 'Lepaskan file di sini' : 'Drag & drop atau klik untuk memilih'}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  Format: JPG, PNG, WEBP • Maksimal 5 MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-6 h-10 rounded-xl text-sm mt-1"
                              >
                                Pilih File
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-2xl overflow-hidden border-2 border-green-200 bg-green-50"
                          >
                            {/* Preview */}
                            <img
                              src={uploadedPreview}
                              alt="Preview bukti transfer"
                              className="w-full max-h-72 object-contain"
                            />
                            {/* Overlay info bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-400" />
                                <span className="text-white text-xs font-medium truncate max-w-48">
                                  {uploadedFile?.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={removeFile}
                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                                aria-label="Hapus file"
                              >
                                <X size={14} className="text-white" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200">
                        <p className="text-xs text-zinc-700 leading-relaxed">
                          <span className="font-bold inline-flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Penting:</span> Pastikan jumlah transfer sesuai dengan nominal DP di atas. Tim admin akan memverifikasi bukti transfer Anda dalam 1×24 jam.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error from submit */}
                  {submitError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-700 font-medium">{submitError}</p>
                    </div>
                  )}

                  {/* ─── Navigation Buttons ─── */}
                  <div className="flex justify-between items-center pt-6 border-t border-zinc-100">
                    {step > 1 ? (
                      <Button
                        type="button" onClick={prevStep}
                        className="bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold px-6 h-12 rounded-xl flex items-center gap-2"
                      >
                        <ChevronLeft size={16} />
                        Kembali
                      </Button>
                    ) : (
                      <div />
                    )}

                    {step < 4 ? (
                      <Button
                        type="button" onClick={nextStep}
                        disabled={
                          (step === 1 && (!formData.name || !formData.phone)) ||
                      (step === 2 && (!formData.serviceType || !formData.carId || !date || !endDate))
                        }
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-12 rounded-xl flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Lanjut
                        <ChevronRight size={16} />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        id="btn-kirim-booking"
                        onClick={handleSubmit}
                        disabled={!selectedBank || submitting}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-12 rounded-xl ml-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                        ) : (
                          <><CheckCircle2 size={16} /> Kirim Booking</>
                        )}
                      </Button>
                    )}
                  </div>

                </motion.div>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
