'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Zap, Fuel, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function FleetPreview() {
  const [previewCars, setPreviewCars] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cars?status=AVAILABLE')
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const parsed = res.data.slice(0, 3).map((c: any) => {
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
          setPreviewCars(parsed);
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

  return (
    <section id="armada" className="py-12 sm:py-16 md:py-24 px-4 relative overflow-hidden bg-[#13112a] border-t border-[#2a2548]/50">
      {/* Background Decor */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#f97316]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Mobil Rekomendasi <br className="hidden sm:inline" />
              <span className="text-[#f97316]">
                Terpopuler
              </span>
            </h2>
            <p className="text-white/50 max-w-xl text-xs sm:text-base">
              Pilihan armada berkualitas dengan harga kompetitif untuk perjalanan Anda di Yogyakarta.
            </p>
          </div>
          <Link href="/armada" className="shrink-0 self-start md:self-auto">
            <Button variant="outline" className="border border-[#2a2548] text-white hover:bg-[#1b1838] hover:border-[#f97316]/50 rounded-xl px-4 py-2 sm:px-6 sm:py-3 h-9 sm:h-auto text-xs sm:text-sm flex items-center gap-2">
              Lihat Semua Armada
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Button>
          </Link>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 sm:h-96 rounded-2xl sm:rounded-3xl bg-[#1b1838]/60 border border-[#2a2548] animate-pulse flex flex-col justify-between p-4 sm:p-6">
                <div className="h-36 sm:h-44 bg-[#13112a] rounded-xl sm:rounded-2xl" />
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-[#2a2548] rounded w-1/3" />
                  <div className="h-5 sm:h-6 bg-[#2a2548] rounded w-2/3" />
                  <div className="h-8 sm:h-10 bg-[#13112a] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : previewCars.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-sm bg-[#1b1838]/40 border border-[#2a2548] rounded-3xl">
            Belum ada armada yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {previewCars.map((car) => {
            const primaryImg = car.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800';
            const servicesList = Array.isArray(car.services) ? car.services : ['Lepas Kunci', 'Dengan Driver'];

            return (
              <Card key={car.id} className="overflow-hidden bg-[#1b1838] border-[#2a2548] hover:border-[#f97316]/50 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-[#f97316]/5 group flex flex-col justify-between">
                
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-40 sm:h-48 md:h-52 lg:h-56 bg-[#13112a] overflow-hidden shrink-0">
                    <img
                      src={primaryImg}
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b1838] via-transparent to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <Badge className="bg-[#f97316] text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg capitalize shadow-md">
                        {car.category}
                      </Badge>
                    </div>

                    {/* Service Badges */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-1 sm:gap-1.5">
                      {servicesList.map((service: string) => (
                        <Badge key={service} className="bg-[#13112a]/80 backdrop-blur-sm text-white/80 font-medium text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded sm:rounded-md border border-[#2a2548]">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 md:space-y-5">
                    
                    {/* Brand & Name */}
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider font-semibold">
                        {car.brand} • {car.year || '2024'}
                      </p>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-snug group-hover:text-[#f97316] transition-colors line-clamp-1">
                        {car.name}
                      </h3>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2 sm:py-3 border-y border-[#2a2548]">
                      <div className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-xl bg-[#13112a] border border-[#2a2548]">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f97316] mb-0.5 sm:mb-1" />
                        <span className="text-[10px] sm:text-xs font-medium text-white/70">{car.seats} Kursi</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-xl bg-[#13112a] border border-[#2a2548]">
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f97316] mb-0.5 sm:mb-1" />
                        <span className="text-[10px] sm:text-xs font-medium text-white/70 truncate max-w-full">{car.transmission}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-xl bg-[#13112a] border border-[#2a2548]">
                        <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f97316] mb-0.5 sm:mb-1" />
                        <span className="text-[10px] sm:text-xs font-medium text-white/70">{car.fuelType}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider font-semibold">Mulai dari</p>
                        <p className="text-base sm:text-lg font-black text-[#f97316]">
                          {formatCurrency(car.pricePerDay)}
                          <span className="text-[10px] sm:text-xs text-white/40 font-normal">/hari</span>
                        </p>
                      </div>
                      
                      <Link href={`/booking?carId=${car.id}`}>
                        <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-xl text-xs py-2 px-4 sm:py-2.5 sm:px-5 h-9 sm:h-10 transition-all duration-200 shadow-md shadow-[#f97316]/20">
                          Booking
                        </Button>
                      </Link>
                    </div>

                  </CardContent>
                </div>
              </Card>
            );
          })}
          </div>
        )}

        {/* Bottom Callout */}
        <div className="text-center mt-14">
          <Link href="/armada">
            <Button variant="outline" className="border border-[#2a2548] bg-[#1b1838] text-white hover:bg-[#2a2548] hover:border-[#f97316]/50 rounded-xl px-8 py-6 font-bold text-sm transition-all duration-200 shadow-md">
              Lihat Seluruh Armada ({totalCount} Unit Siap Jalan)
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
