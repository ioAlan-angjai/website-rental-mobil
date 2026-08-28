'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import {
  Users, Zap, Fuel, ArrowLeft, ArrowRight, CalendarDays, Car, Shield, MapPin, Star,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CarDetailPage() {
  const params = useParams();
  const carId = params?.id as string;

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    if (!carId) return;
    fetch(`/api/cars/${carId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          let imgs: string[] = [];
          try {
            imgs = typeof res.data.images === 'string' ? JSON.parse(res.data.images) : res.data.images;
          } catch {
            imgs = [res.data.images];
          }
          let feats: string[] = [];
          try {
            feats = typeof res.data.features === 'string' ? JSON.parse(res.data.features) : (res.data.features || []);
          } catch {
            feats = [];
          }
          setCar({ ...res.data, images: imgs, features: feats });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [carId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#13112a]">
        <Navbar />
        <div className="flex items-center justify-center pt-40 pb-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm font-medium">Memuat detail mobil...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-[#13112a]">
        <Navbar />
        <div className="flex items-center justify-center pt-40 pb-20">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#1b1838] border-2 border-[#2a2548] flex items-center justify-center mx-auto mb-5">
              <Car size={36} className="text-white/20" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Mobil Tidak Ditemukan</h2>
            <p className="text-white/50 text-sm mb-6">Mobil yang Anda cari tidak tersedia atau sudah dihapus.</p>
            <Link href="/armada">
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-xl px-6">
                <ArrowLeft size={15} />
                Kembali ke Katalog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13112a]">
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#f97316]/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* Breadcrumb */}
      <section className="relative pt-28 pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/armada" className="hover:text-white transition-colors">Armada</Link>
            <span>/</span>
            <span className="text-white font-bold truncate">{car.name}</span>
          </div>

          <Link href="/armada" className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} />
            Kembali ke Katalog
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Left: Image */}
              <div className="lg:col-span-3">
                <div className="relative rounded-2xl overflow-hidden bg-[#1b1838] border border-[#2a2548]">
                  <img
                    src={car.images[0]}
                    alt={car.name}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/40 backdrop-blur-md text-white/90 font-semibold text-xs px-3 py-1.5 rounded-lg capitalize border border-white/10">
                      {car.category}
                    </span>
                  </div>
                </div>

                {/* Additional images */}
                {car.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {car.images.slice(1, 4).map((img: string, i: number) => (
                      <div key={i} className="rounded-xl overflow-hidden bg-[#1b1838] border border-[#2a2548]">
                        <img src={img} alt={`${car.name} ${i + 2}`} className="w-full h-20 sm:h-24 object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {/* Car Info Card */}
                <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6 flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                      {car.brand} &bull; {car.year}
                    </p>
                    <h1 className="text-2xl font-bold text-white leading-tight">
                      {car.name}
                    </h1>
                  </div>

                  {/* Price */}
                  <div className="bg-[#13112a] rounded-xl p-4 border border-[#2a2548]">
                    <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider mb-1">Harga Sewa Per Hari</p>
                    <p className="text-2xl font-black text-[#f97316] leading-none">{formatCurrency(car.pricePerDay)}</p>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center py-3 rounded-xl bg-[#13112a] border border-[#2a2548] text-center">
                      <Users size={18} strokeWidth={2.5} className="text-[#f97316] mb-1.5" />
                      <span className="text-xs text-white/80 font-semibold">{car.seats} Kursi</span>
                    </div>
                    <div className="flex flex-col items-center py-3 rounded-xl bg-[#13112a] border border-[#2a2548] text-center">
                      <Zap size={18} strokeWidth={2.5} className="text-[#f97316] mb-1.5" />
                      <span className="text-xs text-white/80 font-semibold">{car.transmission}</span>
                    </div>
                    <div className="flex flex-col items-center py-3 rounded-xl bg-[#13112a] border border-[#2a2548] text-center">
                      <Fuel size={18} strokeWidth={2.5} className="text-[#f97316] mb-1.5" />
                      <span className="text-xs text-white/80 font-semibold">{car.fuelType}</span>
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <Link href={`/booking?carId=${car.id}`} className="block">
                    <button className="w-full flex items-center justify-center gap-2 h-12 text-sm font-bold rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white transition-all shadow-lg shadow-[#f97316]/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f97316]/50">
                      <CalendarDays size={16} />
                      Booking Sekarang
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>

                {/* Keunggulan */}
                <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Keunggulan</h3>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <Shield size={14} className="text-[#f97316] shrink-0" />
                      <span>Asuransi All Risk</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <MapPin size={14} className="text-[#f97316] shrink-0" />
                      <span>Antar Jemput Area Yogyakarta</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <Star size={14} className="text-[#f97316] shrink-0" />
                      <span>Mobil Terawat & Bersih</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description + Features */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                {car.description && (
                  <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-3">Deskripsi</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{car.description}</p>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                {car.features && car.features.length > 0 && (
                  <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-3">Fitur</h3>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feat: string, i: number) => (
                        <span key={i} className="text-[11px] font-medium text-white/70 bg-[#13112a] border border-[#2a2548] px-3 py-1.5 rounded-lg">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
