'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockCarsJogja } from '@/lib/mock-data-jogja';
import { CalendarIcon, Clock, MapPin, User, Mail, Phone, Car, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    duration: '1',
    serviceType: '',
    carId: '',
    pickupLocation: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedCarDetails = mockCarsJogja.find(c => c.id === formData.carId);

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
        
        {/* Step Indicator Progress Bar */}
        <div className="mb-10 max-w-md mx-auto">
          <div className="flex justify-between items-center relative">
            
            {/* Line Behind */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-zinc-900 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                step >= 1 ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-400"
              )}>
                1
              </div>
              <span className="text-[11px] font-bold text-zinc-900 mt-2 bg-slate-50 px-2">Identitas</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                step >= 2 ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-400"
              )}>
                2
              </div>
              <span className="text-[11px] font-bold text-zinc-900 mt-2 bg-slate-50 px-2">Layanan & Unit</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                step >= 3 ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-400"
              )}>
                3
              </div>
              <span className="text-[11px] font-bold text-zinc-900 mt-2 bg-slate-50 px-2">Konfirmasi</span>
            </div>

          </div>
        </div>

        <Card className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm relative z-10">
          <CardHeader className="bg-zinc-50 border-b border-zinc-200 p-8">
            <CardTitle className="text-2xl font-bold text-zinc-900 font-serif">
              {step === 1 && "Data Diri Penyewa"}
              {step === 2 && "Detail Sewa & Armada"}
              {step === 3 && "Review & Konfirmasi Booking"}
            </CardTitle>
            <p className="text-sm text-zinc-500 mt-2">
              {step === 1 && "Harap isi informasi kontak valid untuk proses verifikasi."}
              {step === 2 && "Pilih jenis layanan sewa dan unit armada yang Anda inginkan."}
              {step === 3 && "Periksa kembali data pesanan Anda sebelum mengirim permintaan booking."}
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                
                {/* STEP 1: Identitas */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Nama Lengkap */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <User size={14} className="text-zinc-900" />
                        Nama Lengkap
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Contoh: Ahmad Fauzi"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-450 rounded-xl h-12"
                      />
                    </div>

                    {/* Grid 2 Kolom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Nomor Telepon */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Phone size={14} className="text-zinc-900" />
                          Nomor Telepon (WhatsApp)
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          placeholder="Contoh: 08123456789"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-450 rounded-xl h-12"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Mail size={14} className="text-zinc-900" />
                          Email
                        </label>
                        <Input
                          type="email"
                          name="email"
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-450 rounded-xl h-12"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Layanan & Unit */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Jenis Layanan */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <Car size={14} className="text-zinc-900" />
                        Jenis Layanan
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:border-zinc-900 focus:outline-none"
                      >
                        <option value="">Pilih jenis layanan</option>
                        <option value="lepas-kunci">Sewa Lepas Kunci</option>
                        <option value="dengan-driver">Sewa Dengan Driver</option>
                      </select>
                    </div>

                    {/* Pilih Mobil */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <Car size={14} className="text-zinc-900" />
                        Pilih Unit Mobil
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="carId"
                        value={formData.carId}
                        onChange={handleInputChange}
                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:border-zinc-900 focus:outline-none"
                      >
                        <option value="">Pilih mobil yang Anda inginkan</option>
                        {mockCarsJogja.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.name} - Rp {car.pricePerDay.toLocaleString('id-ID')}/hari
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grid Tanggal & Durasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Tanggal Mulai */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <CalendarIcon size={14} className="text-zinc-900" />
                          Tanggal Mulai Sewa
                          <span className="text-red-500">*</span>
                        </label>
                        <Popover>
                          <PopoverTrigger
                            className={cn(
                              'w-full justify-start text-left font-normal h-12 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 px-4 flex items-center',
                              !date && 'text-zinc-400'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-zinc-900" />
                            {date ? format(date, 'PPP', { locale: localeId }) : <span>Pilih tanggal</span>}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border border-zinc-200" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) => date < new Date()}
                              className="rounded-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Durasi */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Clock size={14} className="text-zinc-900" />
                          Durasi Sewa
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:border-zinc-900 focus:outline-none"
                        >
                          <option value="1">1 Hari</option>
                          <option value="2">2 Hari</option>
                          <option value="3">3 Hari</option>
                          <option value="5">5 Hari</option>
                          <option value="7">1 Minggu</option>
                          <option value="14">2 Minggu</option>
                          <option value="30">1 Bulan</option>
                        </select>
                      </div>
                    </div>

                    {/* Lokasi Penjemputan */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <MapPin size={14} className="text-zinc-900" />
                        Lokasi Penjemputan / Pengantaran
                      </label>
                      <Input
                        type="text"
                        name="pickupLocation"
                        placeholder="Contoh: Bandara YIA / Stasiun Tugu / Hotel"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-450 rounded-xl h-12"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Konfirmasi */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 pb-2 border-b border-zinc-200">
                        Resume Pesanan
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div className="text-zinc-500">Nama Penyewa:</div>
                        <div className="font-bold text-zinc-900 text-right">{formData.name || "-"}</div>

                        <div className="text-zinc-500">WhatsApp:</div>
                        <div className="font-bold text-zinc-900 text-right">{formData.phone || "-"}</div>

                        <div className="text-zinc-500">Email:</div>
                        <div className="font-bold text-zinc-900 text-right">{formData.email || "-"}</div>

                        <div className="text-zinc-500">Layanan:</div>
                        <div className="font-bold text-zinc-900 capitalize text-right">{formData.serviceType || "-"}</div>

                        <div className="text-zinc-500">Unit Mobil:</div>
                        <div className="font-bold text-zinc-900 text-right">{selectedCarDetails?.name || "-"}</div>

                        <div className="text-zinc-500">Tanggal Mulai:</div>
                        <div className="font-bold text-zinc-900 text-right">
                          {date ? format(date, 'PPP', { locale: localeId }) : "-"}
                        </div>

                        <div className="text-zinc-500">Durasi:</div>
                        <div className="font-bold text-zinc-900 text-right">{formData.duration} Hari</div>

                        <div className="text-zinc-500">Lokasi:</div>
                        <div className="font-bold text-zinc-900 text-right">{formData.pickupLocation || "Ambil di Kantor"}</div>
                      </div>
                    </div>

                    {/* Total Price Estimasi */}
                    {selectedCarDetails && (
                      <div className="bg-zinc-900 text-white rounded-2xl p-6 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-zinc-400 uppercase tracking-wide">Estimasi Total</p>
                          <p className="text-2xl font-bold">
                            Rp {(selectedCarDetails.pricePerDay * parseInt(formData.duration)).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200">
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        <span className="font-bold">Catatan Verifikasi:</span> Dengan mengirim pesanan ini, Anda menyetujui syarat & ketentuan rental mobil kami. Tim admin kami akan segera menghubungi Anda melalui WhatsApp untuk verifikasi identitas (KTP/SIM A) dan pembayaran deposit.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Nav Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-zinc-100">
                  {step > 1 ? (
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      className="bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold px-6 h-12 rounded-xl flex items-center gap-2"
                    >
                      <ChevronLeft size={16} />
                      Kembali
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={step === 1 && (!formData.name || !formData.phone)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-12 rounded-xl flex items-center gap-2 ml-auto"
                    >
                      Lanjut
                      <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button 
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-10 h-12 rounded-xl ml-auto"
                    >
                      Kirim Reservasi via WA
                    </Button>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
