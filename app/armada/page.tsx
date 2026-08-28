'use client';

import { Suspense } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  Users, Zap, Fuel, Search, SlidersHorizontal, ArrowUpDown, ArrowRight,
  CheckCircle2, CalendarDays, Car, Eye, RotateCcw, X,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

/* ════════════════════════════════════════════════
   Skeleton Card — shown while data loads
   ════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="h-48 bg-[#13112a]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-5 w-40 bg-white/10 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-[#13112a] rounded-lg" />
          <div className="h-12 bg-[#13112a] rounded-lg" />
          <div className="h-12 bg-[#13112a] rounded-lg" />
        </div>
        <div className="border-t border-[#2a2548]/50 pt-3 flex items-center justify-between">
          <div className="h-6 w-28 bg-white/10 rounded" />
          <div className="h-9 w-20 bg-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Main Armada Content
   ════════════════════════════════════════════════ */
function ArmadaContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams?.get('category') || 'all';
  const startDateParam = searchParams?.get('startDate') || '';
  const endDateParam = searchParams?.get('endDate') || '';

  const buildBookingUrl = (carId: string) => {
    const p = new URLSearchParams();
    p.set('carId', carId);
    if (startDateParam) p.set('startDate', startDateParam);
    if (endDateParam) p.set('endDate', endDateParam);
    return `/booking?${p.toString()}`;
  };

  const [dbCars, setDbCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cars')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          const parsed = res.data.map((car: any) => {
            let imgs: string[] = [];
            try {
              imgs = typeof car.images === 'string' ? JSON.parse(car.images) : car.images;
            } catch {
              imgs = [car.images];
            }
            return { ...car, images: imgs };
          });
          setDbCars(parsed);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);

  // Compute price bounds once cars are loaded
  useEffect(() => {
    if (dbCars.length > 0 && !priceInitialized) {
      const prices = dbCars.map((c) => c.pricePerDay);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceRange([min, max]);
      setPriceInitialized(true);
    }
  }, [dbCars, priceInitialized]);

  const priceBounds = useMemo(() => {
    if (dbCars.length === 0) return { min: 0, max: 1000000 };
    const prices = dbCars.map((c) => c.pricePerDay);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [dbCars]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  // Category counts from full dataset
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dbCars.length };
    dbCars.forEach((car) => {
      const cat = car.category.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [dbCars]);

  const processedCars = useMemo(() => {
    let result = [...dbCars];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((car) => car.name.toLowerCase().includes(q) || car.brand.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') result = result.filter((car) => car.category.toLowerCase() === selectedCategory.toLowerCase());
    if (selectedTransmission !== 'all') result = result.filter((car) => car.transmission === selectedTransmission);
    if (priceInitialized) {
      result = result.filter((car) => car.pricePerDay >= priceRange[0] && car.pricePerDay <= priceRange[1]);
    }
    if (sortBy === 'price-asc') result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    else if (sortBy === 'newest') result.sort((a, b) => b.year - a.year);
    return result;
  }, [dbCars, searchQuery, selectedCategory, selectedTransmission, sortBy, priceRange, priceInitialized]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedTransmission !== 'all' || searchQuery !== '' || (priceInitialized && (priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max));

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTransmission('all');
    setSortBy('featured');
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds]);

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'suv', label: 'SUV' },
    { value: 'mpv', label: 'MPV' },
    { value: 'sedan', label: 'Sedan' },
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'elf', label: 'ELF / Bus' },
  ];

  return (
    <div className="min-h-screen bg-[#13112a]">
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#f97316]/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* ════════ HERO HEADER ════════ */}
      <section className="relative pt-28 pb-10 px-4 border-b border-[#2a2548]/50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <span>/</span>
              <span className="text-white font-bold">Armada Mobil</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
              Katalog Armada Lengkap
            </h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Temukan mobil yang sesuai dengan kebutuhan perjalanan Anda di Yogyakarta
            </p>

            {(startDateParam || endDateParam) && (
              <div className="inline-flex items-center gap-2.5 bg-[#f97316]/10 border border-[#f97316]/30 text-white text-sm font-semibold px-5 py-2.5 rounded-full mt-5">
                <CalendarDays size={16} className="text-[#f97316]" />
                {startDateParam && <span>Mulai: <strong>{startDateParam}</strong></span>}
                {startDateParam && endDateParam && <ArrowRight size={14} className="text-[#f97316]/60" />}
                {endDateParam && <span>Selesai: <strong>{endDateParam}</strong></span>}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ════════ MAIN CONTENT ════════ */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ─── Filter Sidebar ─── */}
          <div className="lg:col-span-3 space-y-5 bg-[#1b1838] border border-[#2a2548] rounded-2xl p-5 lg:sticky lg:top-28">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2548]">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#f97316]" />
                Filter Pencarian
              </span>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Pencarian</label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari merk atau model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-[#13112a] border border-[#2a2548] text-white text-xs placeholder:text-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316]/50 transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Kategori</label>
              <div className="flex flex-col gap-1.5">
                {categories.map((item) => {
                  const isActive = selectedCategory === item.value;
                  const count = categoryCounts[item.value] ?? 0;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setSelectedCategory(item.value)}
                      className={`w-full py-2.5 px-3.5 text-left rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 ${
                        isActive
                          ? 'bg-[#f97316] text-white border-transparent shadow-lg shadow-[#f97316]/20'
                          : 'bg-[#13112a] text-white/60 border-[#2a2548] hover:border-[#f97316]/30 hover:bg-[#f97316]/5 hover:text-white/80'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {isActive && <CheckCircle2 size={12} />}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Transmisi</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'Semua' },
                  { value: 'Manual', label: 'Manual' },
                  { value: 'Otomatis', label: 'Matic' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedTransmission(item.value)}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 ${
                      selectedTransmission === item.value
                        ? 'bg-[#f97316] text-white border-transparent shadow-lg shadow-[#f97316]/20'
                        : 'bg-[#13112a] text-white/60 border-[#2a2548] hover:border-[#f97316]/30 hover:bg-[#f97316]/5 hover:text-white/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            {priceInitialized && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">Rentang Harga / Hari</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-white/70">{formatCurrency(priceRange[0])}</span>
                    <span className="text-white/40">—</span>
                    <span className="text-white/70">{formatCurrency(priceRange[1])}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 w-8 shrink-0">Min</span>
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        step={25000}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val <= priceRange[1]) setPriceRange([val, priceRange[1]]);
                        }}
                        className="w-full h-1.5 bg-[#2a2548] rounded-lg appearance-none cursor-pointer accent-[#f97316] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 w-8 shrink-0">Max</span>
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        step={25000}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= priceRange[0]) setPriceRange([priceRange[0], val]);
                        }}
                        className="w-full h-1.5 bg-[#2a2548] rounded-lg appearance-none cursor-pointer accent-[#f97316] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reset Filter */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 rounded-xl hover:bg-[#f97316]/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
              >
                <RotateCcw size={13} />
                Reset Semua Filter
              </button>
            )}
          </div>

          {/* ─── RIGHT: Grid ─── */}
          <div className="lg:col-span-9 space-y-5">

            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-[#1b1838] border border-[#2a2548] rounded-2xl p-4 gap-3">
              <p className="text-sm text-white/50 font-medium">
                Menampilkan{' '}
                <span className="text-[#f97316] font-extrabold">{processedCars.length}</span> Mobil
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown size={11} />
                  Urutan:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#13112a] border border-[#2a2548] text-white text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 cursor-pointer"
                >
                  <option value="featured">Pilihan Utama</option>
                  <option value="price-asc">Termurah</option>
                  <option value="price-desc">Termahal</option>
                  <option value="newest">Terbaru</option>
                </select>
              </div>
            </div>

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : processedCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {processedCars.map((car, idx) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: (idx % 2) * 0.08 }}
                  >
                    <div className="group bg-[#1b1838] border border-[#2a2548] rounded-2xl overflow-hidden hover:border-[#f97316]/30 hover:-translate-y-1.5 transition-all duration-400 flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 bg-[#13112a] overflow-hidden">
                        <img
                          src={car.images[0]}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1838]/80 via-transparent to-transparent" />
                        {/* Category badge — NOT orange, informational style */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/40 backdrop-blur-md text-white/90 font-semibold text-[10px] px-2.5 py-1 rounded-lg capitalize border border-white/10">
                            {car.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                          {car.brand} &bull; {car.year}
                        </p>
                        <h3 className="text-base font-bold text-white mb-3 leading-tight">
                          {car.name}
                        </h3>

                        {/* Specs — bigger icons, better contrast */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="flex flex-col items-center py-2 rounded-lg bg-[#13112a] text-center">
                            <Users size={15} strokeWidth={2.5} className="text-[#f97316] mb-1" />
                            <span className="text-[11px] text-white/80 font-medium">{car.seats} Kursi</span>
                          </div>
                          <div className="flex flex-col items-center py-2 rounded-lg bg-[#13112a] text-center">
                            <Zap size={15} strokeWidth={2.5} className="text-[#f97316] mb-1" />
                            <span className="text-[11px] text-white/80 font-medium truncate px-1">{car.transmission}</span>
                          </div>
                          <div className="flex flex-col items-center py-2 rounded-lg bg-[#13112a] text-center">
                            <Fuel size={15} strokeWidth={2.5} className="text-[#f97316] mb-1" />
                            <span className="text-[11px] text-white/80 font-medium">{car.fuelType}</span>
                          </div>
                        </div>

                        {/* Price — dominant */}
                        <div className="mt-auto pt-3 border-t border-[#2a2548]/50">
                          <div className="flex items-end justify-between mb-3">
                            <div>
                              <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider mb-0.5">Per Hari</p>
                              <p className="text-xl font-black text-[#f97316] leading-none">{formatCurrency(car.pricePerDay)}</p>
                            </div>
                          </div>
                          {/* Split CTAs */}
                          <div className="flex items-center gap-2">
                            <Link href={`/armada/${car.id}`} className="flex-1">
                              <button className="w-full flex items-center justify-center gap-1.5 h-9 text-xs font-semibold rounded-xl border border-white/15 text-white/70 hover:bg-white/5 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/50">
                                <Eye size={13} />
                                Detail
                              </button>
                            </Link>
                            <Link href={buildBookingUrl(car.id)} className="flex-1">
                              <button className="w-full flex items-center justify-center gap-1.5 h-9 text-xs font-bold rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white transition-all shadow-lg shadow-[#f97316]/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/50">
                                Booking
                                <ArrowRight size={13} />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* ─── Empty State ─── */
              <div className="text-center py-20 bg-[#1b1838] border border-[#2a2548] rounded-2xl">
                <div className="w-20 h-20 rounded-full bg-[#13112a] border-2 border-[#2a2548] flex items-center justify-center mx-auto mb-5">
                  <Car size={36} className="text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tidak Ada Mobil Ditemukan</h3>
                <p className="text-white/50 text-sm max-w-sm mx-auto mb-1">
                  Tidak ada mobil yang sesuai dengan filter yang Anda pilih.
                </p>
                <p className="text-white/40 text-xs mb-6">
                  Coba ubah kategori, rentang harga, atau kata kunci pencarian Anda.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold h-10 px-6 rounded-xl transition-all shadow-lg shadow-[#f97316]/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
                >
                  <RotateCcw size={14} />
                  Reset Semua Filter
                </button>
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
      <div className="min-h-screen bg-[#13112a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/50 text-sm">Memuat...</p>
        </div>
      </div>
    }>
      <ArmadaContent />
    </Suspense>
  );
}
