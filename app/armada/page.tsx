'use client';

import { Suspense } from 'react';
import { useState, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import {
  Users, Zap, Fuel, Search, SlidersHorizontal, ArrowUpDown, ArrowRight,
  CheckCircle2, CalendarDays, Car, Eye, RotateCcw, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 w-24 bg-muted-foreground/15 rounded" />
        <div className="h-5 w-40 bg-muted-foreground/15 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
        </div>
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <div className="h-6 w-28 bg-muted-foreground/15 rounded" />
          <div className="h-9 w-20 bg-muted-foreground/15 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const normalizeCat = (cat: string) => {
    const c = (cat || '').toLowerCase().replace(/[-_ ]/g, '');
    if (c === 'mpv') return 'mpv';
    if (c === 'suv') return 'suv';
    if (c === 'citycar' || c === 'city_car') return 'city_car';
    if (c === 'hatchback') return 'hatchback';
    if (c === 'luxury' || c === 'sedan' || c === 'premium') return 'luxury';
    if (c === 'pickup' || c === 'pick_up') return 'pickup';
    if (c === 'minibus' || c === 'mini_bus' || c === 'elf' || c === 'bus') return 'minibus';
    return c;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['cars', selectedCategory, selectedTransmission, searchQuery, priceRange],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.append('page', String(pageParam));
      params.append('limit', '12');
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedTransmission && selectedTransmission !== 'all') params.append('transmission', selectedTransmission);
      if (searchQuery) params.append('search', searchQuery);
      params.append('minPrice', String(priceRange[0]));
      params.append('maxPrice', String(priceRange[1]));
      params.append('status', 'AVAILABLE');

      const response = await fetch(`/api/cars?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch cars');
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allCars = useMemo(() => {
    return (data?.pages || []).flatMap(page => 
      (page.data || []).map((car: any) => {
        let imgs: string[] = [];
        try {
          imgs = typeof car.images === 'string' ? JSON.parse(car.images) : car.images;
        } catch {
          imgs = [car.images];
        }
        return { ...car, images: imgs };
      })
    );
  }, [data]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCars.forEach((car) => {
      const cat = normalizeCat(car.category);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allCars]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedTransmission !== 'all' || searchQuery !== '' || (priceRange[0] !== 0 || priceRange[1] !== 5000000);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTransmission('all');
    setSortBy('featured');
    setPriceRange([0, 5000000]);
  }, []);

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'mpv', label: 'MPV' },
    { value: 'suv', label: 'SUV' },
    { value: 'city_car', label: 'City Car' },
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'minibus', label: 'Minibus' },
  ];

  const totalCount = data?.pages[0]?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-secondary selection:text-foreground">
      <Navbar />

      <section className="relative pt-32 pb-10 px-4 border-b border-border/80 bg-card/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 text-xs text-foreground/50 mb-3 font-medium">
              <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Armada Mobil</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-3">
              Katalog Armada Lengkap
            </h1>
            <p className="text-foreground/70 max-w-xl mx-auto text-sm sm:text-base">
              Temukan unit mobil prima dan terawat untuk kenyamanan mobilitas Anda di Yogyakarta.
            </p>

            {(startDateParam || endDateParam) && (
              <div className="inline-flex items-center gap-2.5 bg-background border border-border text-foreground text-xs sm:text-sm font-semibold px-4 py-2 rounded-full mt-5 shadow-xs">
                <CalendarDays size={15} className="text-foreground/70" />
                {startDateParam && <span>Mulai: <strong>{startDateParam}</strong></span>}
                {startDateParam && endDateParam && <ArrowRight size={13} className="text-foreground/40" />}
                {endDateParam && <span>Selesai: <strong>{endDateParam}</strong></span>}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <aside className="lg:col-span-3 space-y-6 bg-card border border-border rounded-2xl p-5 lg:sticky lg:top-28 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-foreground flex items-center gap-2 tracking-wide uppercase">
                <SlidersHorizontal size={14} className="text-foreground/80" />
                Filter Pencarian
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-foreground/60 hover:text-foreground transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Pencarian</label>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Cari merk atau model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-background border border-border text-foreground text-xs placeholder:text-foreground/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Kategori</label>
              <div className="flex flex-col gap-1.5">
                {categories.map((item) => {
                  const isActive = selectedCategory === item.value;
                  const count = item.value === 'all' ? totalCount : (categoryCounts[item.value] ?? 0);
                  return (
                    <button
                      key={item.value}
                      onClick={() => setSelectedCategory(item.value)}
                      className={`w-full py-2.5 px-3.5 text-left rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center justify-between cursor-pointer focus:outline-none ${
                        isActive
                          ? 'bg-foreground text-background border-transparent shadow-xs'
                          : 'bg-background text-foreground/80 border-border hover:border-foreground/30 hover:bg-card'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {isActive && <CheckCircle2 size={12} />}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-background/20 text-background' : 'bg-muted text-foreground/60'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Transmisi</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'all', label: 'Semua' },
                  { value: 'Manual', label: 'Manual' },
                  { value: 'Otomatis', label: 'Matic' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedTransmission(item.value)}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer focus:outline-none ${
                      selectedTransmission === item.value
                        ? 'bg-foreground text-background border-transparent shadow-xs'
                        : 'bg-background text-foreground/75 border-border hover:border-foreground/30 hover:bg-card'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Rentang Tarif / Hari</label>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold bg-background p-2 rounded-xl border border-border">
                  <span className="text-foreground">{formatCurrency(priceRange[0])}</span>
                  <span className="text-foreground/40">—</span>
                  <span className="text-foreground">{formatCurrency(priceRange[1])}</span>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-foreground/50 w-7 shrink-0 font-medium">Min</span>
                    <input
                      type="range"
                      min={0}
                      max={5000000}
                      step={25000}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= priceRange[1]) setPriceRange([val, priceRange[1]]);
                      }}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-foreground/50 w-7 shrink-0 font-medium">Max</span>
                    <input
                      type="range"
                      min={0}
                      max={5000000}
                      step={25000}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= priceRange[0]) setPriceRange([priceRange[0], val]);
                      }}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-foreground bg-secondary/30 hover:bg-secondary/50 border border-border rounded-xl transition-all cursor-pointer focus:outline-none"
              >
                <RotateCcw size={13} />
                Reset Semua Filter
              </button>
            )}
          </aside>

          <main className="lg:col-span-9 space-y-6">

            <div className="flex flex-col sm:flex-row items-center justify-between bg-card border border-border rounded-2xl p-4 gap-3 shadow-xs">
              <p className="text-xs sm:text-sm text-foreground/70 font-medium">
                Menampilkan{' '}
                <span className="text-foreground font-extrabold">{allCars.length}</span> dari <span className="text-foreground font-extrabold">{totalCount}</span> Armada Mobil
              </p>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown size={11} />
                  Urutkan:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background border border-border text-foreground text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer"
                >
                  <option value="featured">Pilihan Rekomendasi</option>
                  <option value="price-asc">Tarif Terendah</option>
                  <option value="price-desc">Tarif Tertinggi</option>
                  <option value="newest">Tahun Terbaru</option>
                </select>
              </div>
            </div>

            {isFetching && allCars.length === 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : allCars.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-6">
                  {allCars.map((car, idx) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.4, delay: (idx % 3) * 0.05 }}
                    >
                      <div className="group bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden hover:border-foreground/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                        <div className="relative h-28 xs:h-36 sm:h-48 bg-muted overflow-hidden">
                          <img
                            src={car.images[0]}
                            alt={car.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                            <span className="bg-background/90 backdrop-blur-md text-foreground font-bold text-[8px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg capitalize border border-border/70 shadow-xs">
                              {car.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 sm:p-5 flex flex-col flex-1">
                          <p className="text-[8px] sm:text-[10px] text-foreground/50 uppercase tracking-wider font-semibold mb-0.5 sm:mb-1">
                            {car.brand} &bull; {car.year}
                          </p>
                          <h3 className="text-xs sm:text-base font-bold text-foreground mb-2 sm:mb-3 leading-snug line-clamp-1 group-hover:text-foreground transition-colors">
                            {car.name}
                          </h3>

                          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-4">
                            <div className="flex flex-col items-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl bg-background border border-border/60 text-center">
                              <Users size={12} className="text-foreground/80 mb-0.5 sm:mb-1 sm:w-3.5 sm:h-3.5" />
                              <span className="text-[8.5px] sm:text-[11px] text-foreground/80 font-medium">{car.seats} Kursi</span>
                            </div>
                            <div className="flex flex-col items-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl bg-background border border-border/60 text-center">
                              <Zap size={12} className="text-foreground/80 mb-0.5 sm:mb-1 sm:w-3.5 sm:h-3.5" />
                              <span className="text-[8.5px] sm:text-[11px] text-foreground/80 font-medium truncate w-full px-0.5">{car.transmission}</span>
                            </div>
                            <div className="flex flex-col items-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl bg-background border border-border/60 text-center">
                              <Fuel size={12} className="text-foreground/80 mb-0.5 sm:mb-1 sm:w-3.5 sm:h-3.5" />
                              <span className="text-[8.5px] sm:text-[11px] text-foreground/80 font-medium">{car.fuelType}</span>
                            </div>
                          </div>

                          <div className="mt-auto pt-2 sm:pt-3 border-t border-border">
                            <div className="flex items-end justify-between mb-2 sm:mb-3">
                              <div>
                                <p className="text-[8px] sm:text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-0.5">Tarif Sewa</p>
                                <div className="flex items-baseline gap-0.5 sm:gap-1">
                                  <span className="text-xs xs:text-sm sm:text-lg font-extrabold text-foreground">{formatCurrency(car.pricePerDay)}</span>
                                  <span className="text-[8px] sm:text-[11px] text-foreground/50">/hari</span>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1 sm:gap-2">
                              <Link href={`/armada/${car.id}`} className="w-full">
                                <button className="w-full flex items-center justify-center gap-1 h-7 sm:h-9 text-[9px] sm:text-xs font-semibold rounded-lg sm:rounded-xl border border-border bg-background text-foreground/80 hover:bg-card hover:text-foreground transition-all cursor-pointer focus:outline-none">
                                  <Eye size={11} className="sm:w-3.5 sm:h-3.5" />
                                  <span>Detail</span>
                                </button>
                              </Link>
                              <Link href={buildBookingUrl(car.id)} className="w-full">
                                <button className="w-full flex items-center justify-center gap-1 h-7 sm:h-9 text-[9px] sm:text-xs font-bold rounded-lg sm:rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xs cursor-pointer focus:outline-none">
                                  <span>Booking</span>
                                  <ArrowRight size={11} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {hasNextPage && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        <>
                          Muat Lebih Banyak
                          <ChevronDown size={18} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4">
                  <Car size={30} className="text-foreground/30" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">Tidak Ada Mobil Ditemukan</h3>
                <p className="text-foreground/70 text-sm max-w-sm mx-auto mb-1">
                  Tidak ada unit yang sesuai dengan kombinasi filter Anda.
                </p>
                <p className="text-foreground/50 text-xs mb-6">
                  Coba ubah kategori, perluas rentang harga, atau reset filter.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-bold h-10 px-6 rounded-xl hover:bg-foreground/90 transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Reset Semua Filter
                </button>
              </div>
            )}

          </main>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ArmadaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-foreground/50 text-xs font-medium">Memuat katalog armada...</p>
        </div>
      </div>
    }>
      <ArmadaContent />
    </Suspense>
  );
}
