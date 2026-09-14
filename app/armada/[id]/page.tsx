'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import {
  Users, Zap, Fuel, ArrowLeft, ArrowRight, CalendarDays, Car, Shield, MapPin, Star,
  CheckCircle2, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CarDetailPage() {
  const params = useParams();
  const carId = params?.id as string;

  const [car, setCar] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32 pb-20">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground/60 text-xs font-medium">Memuat detail unit armada...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32 pb-20 px-4">
          <div className="text-center bg-card border border-border p-8 rounded-2xl max-w-md w-full shadow-xs">
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4">
              <Car size={30} className="text-foreground/30" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1.5">Mobil Tidak Ditemukan</h2>
            <p className="text-foreground/60 text-xs mb-6">Unit armada yang Anda cari tidak tersedia atau sedang dinonaktifkan.</p>
            <Link href="/armada">
              <Button className="bg-foreground hover:bg-foreground/90 text-background font-bold rounded-xl px-5 text-xs shadow-xs">
                <ArrowLeft size={14} className="mr-1.5" />
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
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-secondary selection:text-foreground">
      <Navbar />

      {/* Breadcrumb & Navigation */}
      <section className="relative pt-24 sm:pt-32 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 border-b border-border/60 bg-card/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-foreground/50 mb-3 sm:mb-4 font-medium">
            <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/armada" className="hover:text-foreground transition-colors">Armada</Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[150px] sm:max-w-none">{car.name}</span>
          </div>

          <Link
            href="/armada"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Kembali ke Semua Mobil
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">

              {/* Left: Gallery (7 Cols) */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border shadow-xs aspect-4/3 sm:aspect-16/10">
                  <img
                    src={car.images[activeImageIndex] || car.images[0]}
                    alt={car.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4">
                    <span className="bg-background/90 backdrop-blur-md text-foreground font-bold text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg capitalize border border-border shadow-xs">
                      {car.category}
                    </span>
                  </div>
                  {car.images.length > 1 && (
                    <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 bg-background/80 backdrop-blur-md text-foreground text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-border">
                      {activeImageIndex + 1} / {car.images.length} Foto
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {car.images.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                    {car.images.map((img: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIndex(i)}
                        className={`rounded-lg sm:rounded-xl overflow-hidden bg-card border aspect-4/3 transition-all cursor-pointer ${
                          activeImageIndex === i
                            ? 'border-foreground ring-1 sm:ring-2 ring-foreground/20'
                            : 'border-border opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`${car.name} thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Description Box */}
                {car.description && (
                  <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs mt-4 sm:mt-6">
                    <h2 className="text-xs sm:text-sm font-bold text-foreground mb-2 sm:mb-3 uppercase tracking-wider">
                      Deskripsi Unit
                    </h2>
                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                      {car.description}
                    </p>
                  </div>
                )}

                {/* Features Box */}
                {car.features && car.features.length > 0 && (
                  <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs">
                    <h2 className="text-xs sm:text-sm font-bold text-foreground mb-2.5 sm:mb-3 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/70" />
                      Fitur &amp; Kelengkapan
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                      {car.features.map((feat: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-foreground/80 bg-background border border-border/70 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-foreground shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Info & Booking Action (5 Cols) */}
              <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:sticky lg:top-28">
                {/* Main Card */}
                <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-5 shadow-xs">
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-foreground/50 uppercase tracking-wider font-semibold mb-0.5 sm:mb-1">
                      {car.brand} &bull; Tahun {car.year}
                    </p>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
                      {car.name}
                    </h1>
                  </div>

                  {/* Price Box */}
                  <div className="bg-background rounded-xl p-3.5 sm:p-4 border border-border">
                    <p className="text-[9px] sm:text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-0.5 sm:mb-1">Tarif Sewa Reguler</p>
                    <div className="flex items-baseline gap-1 sm:gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-foreground leading-none">{formatCurrency(car.pricePerDay)}</span>
                      <span className="text-[10px] sm:text-xs text-foreground/50 font-medium">/ 24 Jam</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-foreground/60 mt-1.5 sm:mt-2 leading-relaxed">
                      Sudah termasuk unit bersih, wangi, &amp; asuransi standar.
                    </p>
                  </div>

                  {/* Specs Matrix */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div className="flex flex-col items-center py-2 sm:py-3 rounded-lg sm:rounded-xl bg-background border border-border/70 text-center">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/80 mb-0.5 sm:mb-1" />
                      <span className="text-[11px] sm:text-xs text-foreground font-bold">{car.seats} Kursi</span>
                      <span className="text-[9px] sm:text-[10px] text-foreground/50">Kapasitas</span>
                    </div>
                    <div className="flex flex-col items-center py-2 sm:py-3 rounded-lg sm:rounded-xl bg-background border border-border/70 text-center">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/80 mb-0.5 sm:mb-1" />
                      <span className="text-[11px] sm:text-xs text-foreground font-bold truncate max-w-full px-1">{car.transmission}</span>
                      <span className="text-[9px] sm:text-[10px] text-foreground/50">Transmisi</span>
                    </div>
                    <div className="flex flex-col items-center py-2 sm:py-3 rounded-lg sm:rounded-xl bg-background border border-border/70 text-center">
                      <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/80 mb-0.5 sm:mb-1" />
                      <span className="text-[11px] sm:text-xs text-foreground font-bold">{car.fuelType}</span>
                      <span className="text-[9px] sm:text-[10px] text-foreground/50">BBM</span>
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <Link href={`/booking?carId=${car.id}`} className="block">
                    <button className="w-full flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 text-xs sm:text-sm font-bold rounded-xl bg-foreground hover:bg-foreground/90 text-background transition-all shadow-xs cursor-pointer focus:outline-none">
                      <CalendarDays size={15} />
                      <span>Lanjutkan ke Pemesanan</span>
                      <ArrowRight size={15} />
                    </button>
                  </Link>
                </div>

                {/* Keunggulan Card */}
                <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
                  <h3 className="text-[10px] sm:text-xs font-bold text-foreground mb-2.5 sm:mb-3.5 uppercase tracking-wider">
                    Jaminan Layanan Kami
                  </h3>
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 text-xs text-foreground/80">
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-[11px] sm:text-xs">Asuransi Perjalanan</p>
                        <p className="text-foreground/60 text-[10px] sm:text-[11px]">Proteksi perlindungan selama masa sewa.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 text-xs text-foreground/80">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-[11px] sm:text-xs">Antar Jemput Fleksibel</p>
                        <p className="text-foreground/60 text-[10px] sm:text-[11px]">Gratis antar jemput di Stasiun &amp; Bandara YIA.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 text-xs text-foreground/80">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-[11px] sm:text-xs">Unit Terawat &amp; Bersih</p>
                        <p className="text-foreground/60 text-[10px] sm:text-[11px]">Diservis berkala di bengkel resmi terpercaya.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
