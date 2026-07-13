'use client';

import { mockCarsJogja } from '@/lib/mock-data-jogja';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Zap, Fuel, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FleetPreview() {
  // Ambil 3 mobil pertama untuk preview
  const previewCars = mockCarsJogja.slice(0, 3);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="armada" className="py-24 px-4 relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Decor */}
      <div className="geometric-glow top-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 dark:bg-blue-600/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Armada Pilihan
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Mobil Rekomendasi <br />
              <span className="text-primary dark:text-blue-400">
                Terpopuler
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl text-base">
              Pilihan armada berkualitas dengan harga kompetitif untuk perjalanan Anda di Yogyakarta.
            </p>
          </div>
          <Link href="/armada" className="shrink-0">
            <Button variant="outline" className="border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-6 py-5 flex items-center gap-2">
              Lihat Semua Armada
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {previewCars.map((car) => (
            <Card key={car.id} className="overflow-hidden glass-card border-slate-200 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-3xl transition-all duration-300 hover:shadow-lg">
              
              {/* Image & Badges */}
              <div className="relative h-56 bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={car.images[0]}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground font-bold text-xs px-2.5 py-1 rounded-lg capitalize">
                    {car.category}
                  </Badge>
                </div>

                {/* Service Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {car.services.map((service) => (
                    <Badge key={service} className="bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 font-semibold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-6 space-y-5">
                
                {/* Brand & Name */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    {car.brand} • {car.year}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {car.name}
                  </h3>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                    <Users size={16} className="text-primary mb-1" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{car.seats} Kursi</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                    <Zap size={16} className="text-primary mb-1" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-full">{car.transmission}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                    <Fuel size={16} className="text-primary mb-1" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{car.fuelType}</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Mulai dari</p>
                    <p className="text-lg font-black text-[#C9A84C]">
                      {formatCurrency(car.pricePerDay)}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/hari</span>
                    </p>
                  </div>
                  
                  <Link href="/booking">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs py-5 transition-all duration-200">
                      Booking
                    </Button>
                  </Link>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="text-center mt-14">
          <Link href="/armada">
            <Button variant="outline" className="border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-8 py-6 font-bold text-sm transition-all duration-200">
              Lihat Seluruh Armada ({mockCarsJogja.length} Unit Tersedia)
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
