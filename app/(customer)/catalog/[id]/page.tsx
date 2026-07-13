'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { ChevronLeft, ChevronRight, Users, Fuel, Zap, Gauge } from 'lucide-react';
import { CarDetailBooking } from '@/components/detail/CarDetailBooking';
import { mockCars } from '@/lib/mock-data';

interface CarDetailPageProps {
  params: { id: string };
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Mock: get car data from mockCars (in real app, fetch from API)
  const car = mockCars.find((c) => c.id === params.id) || mockCars[0];
  const images = car.images || [];

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400"
        >
          <a href="#katalog" className="hover:text-sky-400 transition-colors">Katalog</a>
          <span>/</span>
          <span className="text-sky-400">{car.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Main Image */}
            <div className="relative h-96 rounded-3xl overflow-hidden mb-4 bg-slate-800/50 border border-sky-400/20">
              {images[selectedImageIndex] ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-slate-400">
                  No image available
                </div>
              )}

              {/* Navigation Buttons */}
              <button
                onClick={goToPreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all"
              >
                <ChevronRight size={24} />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 rounded-full text-white text-xs">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === selectedImageIndex
                      ? 'border-sky-400'
                      : 'border-sky-400/20 hover:border-sky-400/50'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-sky-400/20 text-center hover:border-sky-400/40 transition-all">
                <Users size={28} className="mx-auto mb-2 text-sky-400" />
                <p className="text-2xl font-bold text-white">{car.seats}</p>
                <p className="text-xs text-slate-400">Penumpang</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-sky-400/20 text-center hover:border-sky-400/40 transition-all">
                <Zap size={28} className="mx-auto mb-2 text-amber-400" />
                <p className="text-sm font-bold text-white">{car.transmission}</p>
                <p className="text-xs text-slate-400">Transmisi</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-sky-400/20 text-center hover:border-sky-400/40 transition-all">
                <Fuel size={28} className="mx-auto mb-2 text-sky-400" />
                <p className="text-sm font-bold text-white">{car.fuelType}</p>
                <p className="text-xs text-slate-400">Bahan Bakar</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-sky-400/20 text-center hover:border-sky-400/40 transition-all">
                <Gauge size={28} className="mx-auto mb-2 text-amber-400" />
                <p className="text-2xl font-bold text-white">{(car.mileage / 1000).toFixed(0)}k</p>
                <p className="text-xs text-slate-400">Kilometer</p>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 p-8 rounded-2xl bg-slate-800/40 border border-sky-400/20"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Deskripsi Kendaraan</h3>
              <p className="text-slate-300 leading-relaxed">
                {car.name} adalah pilihan sempurna untuk perjalanan Anda. Dengan kondisi yang terawat, fitur modern, dan kenyamanan maksimal, kendaraan ini siap membawa Anda ke destinasi impian. Layanan kami mencakup asuransi comprehensive, roadside assistance, dan customer support 24/7.
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Booking Sticky Panel */}
          <CarDetailBooking
            car={car}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        </div>
      </div>
    </div>
  );
}
