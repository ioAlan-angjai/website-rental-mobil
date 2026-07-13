'use client';

import { Suspense } from 'react';
import { useState, useMemo } from 'react';
import { mockCarsJogja } from '@/lib/mock-data-jogja';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, Zap, Fuel, Search, SlidersHorizontal, ArrowUpDown, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { motion } from 'framer-motion';

function ArmadaContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams?.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const processedCars = useMemo(() => {
    let result = [...mockCarsJogja];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (car) =>
          car.name.toLowerCase().includes(q) ||
          car.brand.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((car) => car.category === selectedCategory);
    }

    if (selectedTransmission !== 'all') {
      result = result.filter((car) => car.transmission === selectedTransmission);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.year - a.year);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedTransmission, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTransmission('all');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />
      <BackgroundOrnaments />

      {/* Header Banner */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-zinc-200 bg-white">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-zinc-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-950 transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-zinc-950 font-bold">Armada Mobil</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Katalog Armada Lengkap
          </h1>
          <p className="text-zinc-600 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Temukan mobil yang sesuai dengan kebutuhan perjalanan Anda di Yogyakarta
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-250">
              <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-zinc-900" />
                Filter Pencarian
              </span>
              {(selectedCategory !== 'all' || selectedTransmission !== 'all' || searchQuery !== '') && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-zinc-900 hover:underline transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pencarian</label>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  name="search"
                  placeholder="Cari merk atau model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kategori</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: 'all', label: 'Semua Kategori' },
                  { value: 'suv', label: 'SUV' },
                  { value: 'mpv', label: 'MPV' },
                  { value: 'sedan', label: 'Sedan' },
                  { value: 'hatchback', label: 'Hatchback' },
                  { value: 'elf', label: 'ELF / Bus' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedCategory(item.value)}
                    className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-between ${
                      selectedCategory === item.value
                        ? 'bg-zinc-900 text-white border-transparent'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {item.label}
                    {selectedCategory === item.value && <CheckCircle2 size={13} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Transmisi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'Semua' },
                  { value: 'Manual', label: 'Manual' },
                  { value: 'Otomatis', label: 'Matic' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedTransmission(item.value)}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
                      selectedTransmission === item.value
                        ? 'bg-zinc-900 text-white border-transparent'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Grid & Sort */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-3xl border border-zinc-200 gap-4 shadow-sm">
              <p className="text-sm text-zinc-650 font-medium">
                Menampilkan{' '}
                <span className="text-zinc-900 font-extrabold">{processedCars.length}</span> Mobil
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown size={12} />
                  Urutan:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-zinc-200 text-zinc-900 text-xs font-bold py-2 px-3 rounded-xl focus:border-zinc-900 focus:outline-none"
                >
                  <option value="featured">Pilihan Utama</option>
                  <option value="price-asc">Termurah</option>
                  <option value="price-desc">Termahal</option>
                  <option value="newest">Terbaru</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {processedCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedCars.map((car, idx) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx % 3 * 0.1, ease: "easeOut" }}
                  >
                    <Card className="group overflow-hidden bg-white border border-zinc-200 hover:border-zinc-900 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-950/10 hover:-translate-y-2">
                      
                      <div className="relative h-48 bg-zinc-100 overflow-hidden">
                        <img
                          src={car.images[0]}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                      
                      <div className="absolute top-3.5 left-3.5">
                        <Badge className="bg-zinc-900 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md capitalize">
                          {car.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                          {car.brand} • {car.year}
                        </p>
                        <h3 className="text-base font-bold text-zinc-900 leading-tight">
                          {car.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 py-2.5 border-y border-zinc-100">
                        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 text-center">
                          <Users size={13} className="text-zinc-900 mb-0.5" />
                          <span className="text-[10px] text-zinc-700 font-medium">{car.seats}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 text-center">
                          <Zap size={13} className="text-zinc-900 mb-0.5" />
                          <span className="text-[10px] text-zinc-700 font-medium truncate max-w-[55px]">{car.transmission}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-50 text-center">
                          <Fuel size={13} className="text-zinc-900 mb-0.5" />
                          <span className="text-[10px] text-zinc-700 font-medium">{car.fuelType}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-zinc-500 uppercase font-semibold">Per Hari</p>
                          <p className="text-base font-black text-zinc-900">
                            {formatCurrency(car.pricePerDay)}
                          </p>
                        </div>
                        <Link href="/booking">
                          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg text-xs py-4 transition-all duration-200">
                            Booking
                          </Button>
                        </Link>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Tidak Ada Hasil</h3>
                <p className="text-zinc-500 text-sm mt-1">Coba kata kunci lain atau reset filter</p>
                <Button onClick={resetFilters} className="mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs px-5 py-4">
                  Reset Filter
                </Button>
              </div>
            )}

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ArmadaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Memuat...</p>
        </div>
      </div>
    }>
      <ArmadaContent />
    </Suspense>
  );
}
