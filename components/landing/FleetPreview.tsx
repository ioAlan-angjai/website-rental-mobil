'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Zap, Fuel, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
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
    <section id="armada" className="py-24 px-4 relative overflow-hidden bg-[#13112a] border-t border-[#2a2548]/50">
      {/* Background Decor */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#f97316]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 uppercase tracking-wider">
              <Sparkles size={13} /> Armada Pilihan
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Mobil Rekomendasi <br />
              <span className="text-[#f97316]">
                Terpopuler
              </span>
            </h2>
            <p className="text-white/50 max-w-xl text-base">
              Pilihan armada berkualitas dengan harga kompetitif untuk perjalanan Anda di Yogyakarta.
            </p>
          </div>
          <Link href="/armada" className="shrink-0">
            <Button variant="outline" className="border border-[#2a2548] text-white hover:bg-[#1b1838] hover:border-[#f97316]/50 rounded-xl px-6 py-5 flex items-center gap-2">
              Lihat Semua Armada
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-[#1b1838]/60 border border-[#2a2548] animate-pulse flex flex-col justify-between p-6">
                <div className="h-44 bg-[#13112a] rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-4 bg-[#2a2548] rounded w-1/3" />
                  <div className="h-6 bg-[#2a2548] rounded w-2/3" />
                  <div className="h-10 bg-[#13112a] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : previewCars.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-sm bg-[#1b1838]/40 border border-[#2a2548] rounded-3xl">
            Belum ada armada yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {previewCars.map((car) => {
            const primaryImg = car.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800';
            const servicesList = Array.isArray(car.services) ? car.services : ['Lepas Kunci', 'Dengan Driver'];

            return (
              <Card key={car.id} className="overflow-hidden bg-[#1b1838] border-[#2a2548] hover:border-[#f97316]/50 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-[#f97316]/5 group">
                
                {/* Image & Badges */}
                <div className="relative h-56 bg-[#13112a] overflow-hidden shrink-0">
                  <img
                    src={primaryImg}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b1838] via-transparent to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#f97316] text-white font-bold text-xs px-2.5 py-1 rounded-lg capitalize shadow-md">
                      {car.category}
                    </Badge>
                  </div>

                  {/* Service Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                    {servicesList.map((service: string) => (
                      <Badge key={service} className="bg-[#13112a]/80 backdrop-blur-sm text-white/80 font-medium text-[10px] px-2 py-0.5 rounded-md border border-[#2a2548]">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <CardContent className="p-6 space-y-5">
                  
                  {/* Brand & Name */}
                  <div className="space-y-1">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                      {car.brand} • {car.year || '2024'}
                    </p>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-[#f97316] transition-colors">
                      {car.name}
                    </h3>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#2a2548]">
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#13112a] border border-[#2a2548]">
                      <Users size={16} className="text-[#f97316] mb-1" />
                      <span className="text-xs font-medium text-white/70">{car.seats} Kursi</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#13112a] border border-[#2a2548]">
                      <Zap size={16} className="text-[#f97316] mb-1" />
                      <span className="text-xs font-medium text-white/70 truncate max-w-full">{car.transmission}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#13112a] border border-[#2a2548]">
                      <Fuel size={16} className="text-[#f97316] mb-1" />
                      <span className="text-xs font-medium text-white/70">{car.fuelType}</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Mulai dari</p>
                      <p className="text-lg font-black text-[#f97316]">
                        {formatCurrency(car.pricePerDay)}
                        <span className="text-xs text-white/40 font-normal">/hari</span>
                      </p>
                    </div>
                    
                    <Link href={`/booking?carId=${car.id}`}>
                      <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-xl text-xs py-5 px-5 transition-all duration-200 shadow-md shadow-[#f97316]/20">
                        Booking
                      </Button>
                    </Link>
                  </div>

                </CardContent>
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
