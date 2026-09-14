'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'Semua' },
  { id: 'mpv', label: 'MPV' },
  { id: 'suv', label: 'SUV' },
  { id: 'city_car', label: 'City Car' },
  { id: 'hatchback', label: 'Hatchback' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'pickup', label: 'Pickup' },
  { id: 'minibus', label: 'Minibus' },
];

export function FleetPreview() {
  const [cars, setCars] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cars?status=AVAILABLE')
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const parsed = res.data.map((c: any) => {
            let imgs: string[] = [];
            try {
              imgs = typeof c.images === 'string' ? JSON.parse(c.images) : c.images;
            } catch {
              imgs = [c.images || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'];
            }
            return {
              ...c,
              images: imgs,
              services: c.services || ['Lepas Kunci', 'Dengan Driver'],
            };
          });
          setCars(parsed);
          setTotalCount(res.total || res.data.length);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCategoryBadge = (cat?: string) => {
    if (!cat) return 'UNIT';
    const c = cat.toLowerCase().replace(/[-_ ]/g, '');
    if (c === 'mpv') return 'MPV';
    if (c === 'suv') return 'SUV';
    if (c === 'citycar') return 'CITY CAR';
    if (c === 'hatchback') return 'HATCHBACK';
    if (c === 'luxury') return 'LUXURY';
    if (c === 'pickup') return 'PICKUP';
    if (c === 'minibus' || c === 'elf') return 'MINIBUS';
    return cat.toUpperCase();
  };

  const filteredCars = cars.filter((car) => {
    if (activeCategory === 'all') return true;
    const c = (car.category || '').toLowerCase().replace(/[-_ ]/g, '');
    const target = activeCategory.toLowerCase().replace(/[-_ ]/g, '');
    if (target === 'minibus') return c === 'minibus' || c === 'elf';
    if (target === 'luxury') return c === 'luxury' || c === 'sedan' || c === 'premium';
    return c === target;
  });

  const displayCars = filteredCars.slice(0, 4);

  return (
    <section id="armada" className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-[#F8F2F1] border-t border-[#D7CDCC]/60">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-7 gap-4">
          <div>
            <span className="block text-[9px] font-bold tracking-widest text-[#756A68] uppercase mb-1">
              ARMADA UNGGULAN
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1A1A1A] tracking-tight leading-tight">
              Mobil Pilihan
            </h2>
            <p className="text-xs sm:text-[13px] text-[#504745] mt-1 max-w-lg leading-relaxed">
              Armada kursi eksklusif untuk kenyamanan perjalanan bisnis dan liburan Anda dengan performa sempurna.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'h-[32px] px-3 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer outline-none border',
                  activeCategory === cat.id
                    ? 'bg-[#1A1A1A] text-[#F8F7F6] border-[#1A1A1A]'
                    : 'bg-[#FFFFFF] text-[#504745] hover:text-[#1A1A1A] border-[#D7CDCC] hover:bg-[#F8F7F6]'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cars Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-[350px] sm:h-[395px] rounded-xl bg-[#FFFFFF] border border-[#D7CDCC] p-2 sm:p-3 flex flex-col justify-between animate-pulse"
              >
                <div className="h-[105px] sm:h-[138px] bg-[#F8F7F6] rounded-lg" />
                <div className="space-y-1.5 py-2">
                  <div className="h-2.5 bg-[#F0E6E4] rounded w-1/3" />
                  <div className="h-4 bg-[#F0E6E4] rounded w-3/4" />
                </div>
                <div className="h-8 bg-[#F8F7F6] rounded" />
                <div className="h-7 bg-[#F0E6E4] rounded" />
              </div>
            ))}
          </div>
        ) : displayCars.length === 0 ? (
          <div className="text-center py-12 text-[#756A68] text-xs bg-[#FFFFFF] border border-[#D7CDCC] rounded-xl p-6">
            <p className="font-semibold text-[#1A1A1A] mb-1">Tidak ada armada ditemukan</p>
            <p className="text-[11px] text-[#756A68]">Belum ada armada untuk kategori ini atau sedang dalam masa sewa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {displayCars.map((car) => {
              const primaryImg = car.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800';

              return (
                <div
                  key={car.id}
                  className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-xl p-2 sm:p-3 flex flex-col justify-between min-h-[350px] sm:min-h-[395px] transition-all duration-200 hover:border-[#1A1A1A]/50 shadow-2xs hover:shadow-xs"
                >
                  {/* Top Section: Image + Brand/Year + Car Name */}
                  <div>
                    {/* 1. Car Image */}
                    <div className="relative w-full h-[105px] xs:h-[120px] sm:h-[138px] rounded-lg overflow-hidden bg-[#F8F7F6] mb-2">
                      <img
                        src={primaryImg}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay Badge Top Left: Kategori */}
                      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                        <span className="px-1.5 py-0.5 rounded-[3px] bg-[#FFFFFF]/95 text-[#1A1A1A] text-[7px] sm:text-[8px] font-bold uppercase tracking-wider shadow-xs border border-[#D7CDCC]/60">
                          {getCategoryBadge(car.category)}
                        </span>
                      </div>
                      {/* Overlay Badge Top Right: Status Tersedia */}
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                        <span className="px-1.5 py-0.5 rounded-[3px] bg-[#FFFFFF]/95 text-[#1A1A1A] text-[7px] sm:text-[8px] font-bold shadow-xs border border-[#D7CDCC]/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="hidden xs:inline">{car.status === 'AVAILABLE' ? 'Tersedia' : car.status || 'Tersedia'}</span>
                        </span>
                      </div>
                    </div>

                    {/* 2. Brand + Tahun */}
                    <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-bold tracking-wider text-[#756A68] uppercase mb-0.5 sm:mb-1">
                      <span className="truncate pr-1">{car.brand || 'MOBIL'}</span>
                      <span className="shrink-0">{car.year || '2024'}</span>
                    </div>

                    {/* 3. Nama Mobil */}
                    <h3 className="text-[12px] sm:text-[14px] font-bold text-[#1A1A1A] leading-tight line-clamp-2 min-h-[30px] sm:min-h-[36px]">
                      {car.name}
                    </h3>

                    {/* Thin Horizontal Divider */}
                    <div className="border-t border-[#E8E2E1] my-1.5 sm:my-2.5" />

                    {/* 4. Detail Spesifikasi (3 Kolom dengan Divider Vertikal) */}
                    <div className="grid grid-cols-3 divide-x divide-[#E8E2E1] py-0.5">
                      {/* Kolom 1: Transmisi */}
                      <div className="pr-1">
                        <p className="text-[7px] sm:text-[8px] font-bold text-[#756A68] uppercase tracking-wider">Transmisi</p>
                        <p className="text-[8px] sm:text-[9.5px] font-semibold text-[#1A1A1A] mt-0.5 truncate">
                          {car.transmission || 'Auto'}
                        </p>
                      </div>

                      {/* Kolom 2: Bahan Bakar */}
                      <div className="px-1 text-center">
                        <p className="text-[7px] sm:text-[8px] font-bold text-[#756A68] uppercase tracking-wider">Bahan Bakar</p>
                        <p className="text-[8px] sm:text-[9.5px] font-semibold text-[#1A1A1A] mt-0.5 truncate">
                          {car.fuelType || 'Bensin'}
                        </p>
                      </div>

                      {/* Kolom 3: Kapasitas */}
                      <div className="pl-1 text-right">
                        <p className="text-[7px] sm:text-[8px] font-bold text-[#756A68] uppercase tracking-wider">Kursi</p>
                        <p className="text-[8px] sm:text-[9.5px] font-semibold text-[#1A1A1A] mt-0.5 truncate">
                          {car.seats ? `${car.seats} Seat` : '5 Seat'}
                        </p>
                      </div>
                    </div>

                    {/* Thin Horizontal Divider */}
                    <div className="border-t border-[#E8E2E1] my-1.5 sm:my-2.5" />
                  </div>

                  {/* Bottom Section: Pricing + Action Buttons */}
                  <div>
                    {/* 5. Tarif Harian */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[7px] sm:text-[8px] font-bold text-[#756A68] uppercase leading-tight tracking-wider">
                        Tarif<br />Sewa
                      </div>
                      <div className="text-right">
                        <span className="text-[12.5px] xs:text-[14px] sm:text-[16px] font-bold text-[#1A1A1A] tracking-tight">
                          {formatCurrency(car.pricePerDay)}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-normal text-[#756A68]"> /hari</span>
                      </div>
                    </div>

                    {/* 6. Buttons */}
                    <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                      <Link href={`/armada/${car.id}`} className="w-full">
                        <button
                          type="button"
                          className="w-full h-[29px] sm:h-[34px] px-1 sm:px-2 rounded-lg bg-[#FFFFFF] border border-[#D7CDCC] text-[#1A1A1A] text-[8.5px] sm:text-[9.5px] font-semibold hover:bg-[#F8F7F6] transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
                      </Link>
                      <Link href={`/booking?carId=${car.id}`} className="w-full">
                        <button
                          type="button"
                          className="w-full h-[29px] sm:h-[34px] px-1 sm:px-2 rounded-lg bg-[#1A1A1A] border border-[#1A1A1A] text-[#F8F7F6] text-[8.5px] sm:text-[9.5px] font-semibold hover:bg-[#2C2828] transition-colors cursor-pointer"
                        >
                          Booking
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button CTA */}
        <div className="text-center mt-8">
          <Link href="/armada">
            <button
              type="button"
              className="w-full max-w-[260px] h-[36px] mx-auto rounded-[4px] border border-[#D7CDCC] bg-[#FFFFFF] hover:bg-[#F8F7F6] text-[#1A1A1A] font-semibold text-[10.5px] transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Jelajahi Semua Armada Eksklusif</span>
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
