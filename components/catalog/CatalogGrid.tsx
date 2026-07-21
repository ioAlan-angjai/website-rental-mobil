'use client';

import { mockCars } from '@/lib/mock-data';
import { CarCard } from './CarCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, LayoutGrid, Leaf, Compass, Gem, Car } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const CATEGORIES = [
  { id: null, label: 'Semua', icon: LayoutGrid },
  { id: 'economy', label: 'Economy', icon: Leaf },
  { id: 'comfort', label: 'Comfort', icon: Compass },
  { id: 'premium', label: 'Premium', icon: Gem },
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
    <section className="py-20 px-4 relative">
      {/* Subtle top separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-sky-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-400/10 border border-sky-400/20 text-sky-300 mb-4">
            <Car className="w-3.5 h-3.5" /> Armada Terlengkap
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Pilih Mobil{' '}
            <span className="bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">
              Impian Anda
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            15+ mobil berkualitas dengan harga terjangkau dan layanan premium khusus untuk mahasiswa.
          </p>
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 p-5 rounded-2xl border border-slate-700/60 bg-slate-800/40"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search — shadcn Input style */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
                className="w-full pl-10 pr-10 py-2.5 bg-slate-700/40 border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-500 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/30 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Filter icon label */}
            <div className="flex items-center gap-2 text-slate-400 text-sm shrink-0">
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline font-medium">Filter</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={String(cat.id)}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-sky-400 to-amber-400 text-slate-900 border-transparent shadow-md shadow-sky-400/20'
                      : 'bg-slate-700/40 text-slate-300 border-slate-600/40 hover:border-sky-400/40 hover:text-sky-300',
                  )}
                >
                  <cat.icon size={14} className={isActive ? 'text-slate-900' : 'text-sky-400'} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Menampilkan{' '}
            <span className="text-sky-400 font-semibold">{filteredCars.length}</span> mobil
            {selectedCategory && (
              <> kategori <span className="text-amber-400 font-semibold capitalize">{selectedCategory}</span></>
            )}
            {searchQuery && (
              <> untuk "<span className="text-white">{searchQuery}</span>"</>
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <span className="text-5xl mb-4 block"><Search size={48} className="text-slate-400" /></span>
            <p className="text-slate-400 text-lg font-medium">
              Tidak ada mobil yang sesuai
            </p>
            <p className="text-slate-500 text-sm mt-1">Coba kata kunci atau kategori lain</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="mt-4 px-5 py-2 text-sm font-semibold text-sky-400 border border-sky-400/30 rounded-xl hover:bg-sky-400/10 transition-all duration-200"
            >
              Reset Filter
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
