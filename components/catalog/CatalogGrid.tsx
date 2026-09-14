'use client';

import { mockCars } from '@/lib/mock-data';
import { CarCard } from './CarCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, LayoutGrid, Leaf, Compass, Gem, Car, Truck, Users, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CATEGORIES = [
  { id: null, label: 'Semua', icon: LayoutGrid },
  { id: 'mpv', label: 'MPV', icon: Car },
  { id: 'suv', label: 'SUV', icon: Compass },
  { id: 'city_car', label: 'City Car', icon: Leaf },
  { id: 'hatchback', label: 'Hatchback', icon: Car },
  { id: 'luxury', label: 'Luxury', icon: Sparkles },
  { id: 'pickup', label: 'Pickup', icon: Truck },
  { id: 'minibus', label: 'Minibus', icon: Users },
];

export function CatalogGrid() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCars = useMemo(
    () =>
      mockCars.filter((car) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          car.name.toLowerCase().includes(q) || car.model.toLowerCase().includes(q);
        const matchesCategory = !selectedCategory || car.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [searchQuery, selectedCategory],
  );

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
            Pilih Mobil Impian Anda
          </h2>
          <p className="text-foreground/70 max-w-xl mx-auto text-sm sm:text-base">
            Unit mobil berkualitas dengan harga transparan dan layanan prima di Yogyakarta.
          </p>
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="mb-8 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X size={15} />
                </button>
              )}
              <input
                type="text"
                placeholder="Cari nama atau model mobil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 focus:outline-none transition-all"
              />
            </div>

            {/* Filter icon label */}
            <div className="hidden sm:flex items-center gap-2 text-foreground/60 text-xs shrink-0 font-medium">
              <SlidersHorizontal size={14} />
              <span>Filter Kategori</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/70">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={String(cat.id)}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-foreground text-background border-foreground shadow-xs'
                      : 'bg-background text-foreground/75 border-border hover:border-foreground/30 hover:bg-card',
                  )}
                >
                  <cat.icon size={13} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between text-xs sm:text-sm text-foreground/70">
          <p>
            Menampilkan{' '}
            <span className="text-foreground font-bold">{filteredCars.length}</span> armada
            {selectedCategory && (
              <> kategori <span className="font-semibold capitalize text-foreground">{selectedCategory}</span></>
            )}
            {searchQuery && (
              <> untuk &ldquo;<span className="text-foreground font-semibold">{searchQuery}</span>&rdquo;</>
            )}
          </p>
        </div>

        {/* Grid */}
        {filteredCars.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            {filteredCars.map((car) => (
              <motion.div key={car.id} variants={cardVariants}>
                <CarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
            <Search size={36} className="text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground font-bold text-base">
              Tidak ada mobil yang sesuai
            </p>
            <p className="text-foreground/60 text-xs mt-1">Coba kata kunci atau kategori lain</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="mt-4 px-4 py-2 text-xs font-bold text-foreground bg-secondary/40 border border-border rounded-xl hover:bg-secondary transition-all"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
