'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { ChevronLeft, ChevronRight, Users, Fuel, Zap, Gauge, Calendar, ArrowRight } from 'lucide-react';
import { mockCarsJogja } from '@/lib/mock-data-jogja';
import Link from 'next/link';

interface CarDetailPageProps {
  params: { id: string };
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock: get car data from mockCarsJogja (in real app, fetch from API)
  const car = mockCarsJogja.find((c) => c.id === params.id) || mockCarsJogja[0];
  const images = car.images || [];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      <BackgroundOrnaments />

      <div className="max-w-7xl mx-auto px-4 pt-28 pb-12 relative z-10">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-center gap-2 text-sm text-zinc-500"
        >
          <Link href="/armada" className="hover:text-zinc-900 transition-colors">Armada</Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold">{car.name}</span>
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
            <div className="relative h-96 rounded-3xl overflow-hidden mb-4 bg-white border border-zinc-200">
              {images[selectedImageIndex] ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-zinc-400">
                  No image available
                </div>
              )}

            </div>

            {/* Car Title & Price */}
            <div className="mb-8 p-6 bg-white rounded-2xl border border-zinc-200">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">{car.name}</h1>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Harga Sewa Per Hari</p>
                  <p className="text-2xl font-black text-zinc-900">
                    Rp {car.pricePerDay.toLocaleString('id-ID')}
                  </p>
                </div>
                <Link 
                  href="/booking"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <Calendar size={18} />
                  Booking Sekarang
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
            >
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 text-center hover:border-zinc-900 transition-all">
                <Users size={28} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-2xl font-bold text-zinc-900">{car.seats}</p>
                <p className="text-xs text-zinc-500">Penumpang</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 text-center hover:border-zinc-900 transition-all">
                <Zap size={28} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-sm font-bold text-zinc-900">{car.transmission}</p>
                <p className="text-xs text-zinc-500">Transmisi</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 text-center hover:border-zinc-900 transition-all">
                <Fuel size={28} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-sm font-bold text-zinc-900">{car.fuelType}</p>
                <p className="text-xs text-zinc-500">Bahan Bakar</p>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-2xl bg-white border border-zinc-200"
            >
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">Deskripsi Kendaraan</h3>
              <p className="text-zinc-600 leading-relaxed">
                {car.name} adalah pilihan sempurna untuk perjalanan Anda di Yogyakarta. Dengan kondisi yang terawat, fitur modern, dan kenyamanan maksimal, kendaraan ini siap membawa Anda ke destinasi impian. Layanan kami mencakup asuransi, roadside assistance, dan customer support 24/7. Cocok untuk mahasiswa dan keluarga.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
