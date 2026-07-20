'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, CalendarCheck,
  TrendingUp, Clock, Eye, Search, UserCheck, Pencil, Plus, Check, X,
  ShieldCheck, UserCog, DollarSign, Sliders, AlertCircle
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { formatDuration } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-250',
  DP_CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-250',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-250',
  COMPLETED: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-250',
  WAITING_DP: 'bg-orange-100 text-orange-800 border-orange-250',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-250',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu Konfirmasi',
  DP_CONFIRMED: 'DP Terverifikasi',
  IN_PROGRESS: 'Sewa Berjalan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  WAITING_DP: 'Menunggu DP',
  REJECTED: 'DP Ditolak',
};

// Initial Driver Roster Mock
const initialDrivers = [
  { id: 'DRV-001', name: 'Budi Santoso', phone: '081234567890', status: 'READY', experience: '5 Tahun', rating: 4.9, activeCar: '-' },
  { id: 'DRV-002', name: 'Agus Wijaya', phone: '085712345678', status: 'ON_DUTY', experience: '7 Tahun', rating: 5.0, activeCar: 'Toyota Fortuner' },
  { id: 'DRV-003', name: 'Rizky Pratama', phone: '089611223344', status: 'READY', experience: '3 Tahun', rating: 4.8, activeCar: '-' },
  { id: 'DRV-004', name: 'Dedi Kurniawan', phone: '082199887766', status: 'ON_DUTY', experience: '6 Tahun', rating: 4.9, activeCar: 'Mitsubishi Pajero' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'cars' | 'drivers'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Real DB Booking states
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Verify states
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Start & Return states
  const [isStartingSewa, setIsStartingSewa] = useState(false);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [actualReturnDate, setActualReturnDate] = useState('');
  const [returnPaymentMethod, setReturnPaymentMethod] = useState('CASH');

  // Real DB Cars states
  const [cars, setCars] = useState<any[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [isCreatingCar, setIsCreatingCar] = useState(false);
  const [isSavingCar, setIsSavingCar] = useState(false);
  const [carFormData, setCarFormData] = useState({
    name: '',
    brand: '',
    type: 'SUV',
    capacity: 5,
    transmission: 'Automatic',
    fuelType: 'Bensin',
    pricePerDay: 300000,
    image: '',
    status: 'AVAILABLE',
  });

  // Real Driver Fee states
  const [driverFeePerDay, setDriverFeePerDay] = useState(150000);
  const [editingDriverFeeInput, setEditingDriverFeeInput] = useState('150000');
  const [isSavingDriverFee, setIsSavingDriverFee] = useState(false);
  const [driverFeeMsg, setDriverFeeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [drivers, setDrivers] = useState(initialDrivers);

  const fetchBookings = () => {
    setLoadingBookings(true);
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setBookings(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingBookings(false));
  };

  const fetchCars = () => {
    setLoadingCars(true);
    fetch('/api/admin/cars')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setCars(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCars(false));
  };

  const fetchDriverFee = () => {
    fetch('/api/admin/driver')
      .then((r) => r.json())
      .then((res) => {
        if (res.driverFeePerDay !== undefined) {
          setDriverFeePerDay(res.driverFeePerDay);
          setEditingDriverFeeInput(res.driverFeePerDay.toString());
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchBookings();
    fetchCars();
    fetchDriverFee();
  }, []);

  // Calculate dynamic stats
  const stats = [
    {
      label: 'Total Booking',
      value: bookings.length.toString(),
      icon: CalendarCheck,
    },
    {
      label: 'Pendapatan Dikonfirmasi',
      value: `Rp ${bookings
        .filter((b) => ['DP_CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status))
        .reduce((sum, b) => sum + b.totalPrice, 0)
        .toLocaleString('id-ID')}`,
      icon: TrendingUp,
    },
    {
      label: 'Sedang Berjalan',
      value: bookings.filter((b) => b.status === 'IN_PROGRESS').length.toString(),
      icon: Car,
    },
    {
      label: 'Menunggu Verifikasi',
      value: bookings.filter((b) => b.status === 'WAITING_DP' || b.status === 'PENDING').length.toString(),
      icon: Clock,
    },
  ];

  const filteredBookings = bookings.filter((b) => {
    const customer = (b.guestName || b.user?.name || 'Guest').toLowerCase();
    const car = `${b.car?.brand || ''} ${b.car?.name || ''}`.toLowerCase();
    const id = b.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return customer.includes(query) || car.includes(query) || id.includes(query);
  });

  const filteredCars = cars.filter((c) => {
    const name = `${c.brand} ${c.name}`.toLowerCase();
    const type = (c.type || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || type.includes(query);
  });

  const handleVerify = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedBooking) return;
    if (action === 'REJECT' && !rejectReason.trim()) {
      alert('Silakan isi alasan penolakan terlebih dahulu.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectReason: action === 'REJECT' ? rejectReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Terjadi kesalahan saat memproses verifikasi.');
        return;
      }

      setSelectedBooking(null);
      setRejectReason('');
      setShowRejectForm(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi server.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartSewa = async () => {
    if (!selectedBooking) return;
    setIsStartingSewa(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/start`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal memulai sewa.');
        return;
      }

      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Gagal mengontak server.');
    } finally {
      setIsStartingSewa(false);
    }
  };

  const handleReturnSewa = async () => {
    if (!selectedBooking) return;
    if (!actualReturnDate) {
      alert('Silakan pilih waktu pengembalian terlebih dahulu.');
      return;
    }

    setIsProcessingReturn(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualReturnDate,
          paymentMethod: returnPaymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal memproses pengembalian.');
        return;
      }

      setSelectedBooking(null);
      setShowReturnForm(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Gagal mengontak server.');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  // Car Management actions
  const handleOpenEditCar = (car: any) => {
    setEditingCar(car);
    setCarFormData({
      name: car.name || '',
      brand: car.brand || '',
      type: car.type || 'SUV',
      capacity: car.capacity || 5,
      transmission: car.transmission || 'Automatic',
      fuelType: car.fuelType || 'Bensin',
      pricePerDay: car.pricePerDay || 300000,
      image: car.image || '',
      status: car.status || 'AVAILABLE',
    });
  };

  const handleOpenCreateCar = () => {
    setIsCreatingCar(true);
    setCarFormData({
      name: '',
      brand: '',
      type: 'SUV',
      capacity: 5,
      transmission: 'Automatic',
      fuelType: 'Bensin',
      pricePerDay: 300000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop',
      status: 'AVAILABLE',
    });
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCar(true);

    try {
      const isEdit = !!editingCar;
      const url = isEdit ? `/api/admin/cars/${editingCar.id}` : '/api/admin/cars';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menyimpan data mobil.');
        return;
      }

      setEditingCar(null);
      setIsCreatingCar(false);
      fetchCars();
    } catch (err) {
      console.error(err);
      alert('Gagal mengontak server.');
    } finally {
      setIsSavingCar(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mobil ini dari armada?')) return;

    try {
      const res = await fetch(`/api/admin/cars/${carId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menghapus mobil.');
        return;
      }
      fetchCars();
    } catch (err) {
      console.error(err);
      alert('Gagal mengontak server.');
    }
  };

  // Driver Fee Save Action
  const handleSaveDriverFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const feeNumber = parseInt(editingDriverFeeInput, 10);
    if (isNaN(feeNumber) || feeNumber < 0) {
      setDriverFeeMsg({ type: 'error', text: 'Tarif driver harus berupa angka valid.' });
      return;
    }

    setIsSavingDriverFee(true);
    setDriverFeeMsg(null);

    try {
      const res = await fetch('/api/admin/driver', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverFeePerDay: feeNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDriverFeeMsg({ type: 'error', text: data.error || 'Gagal menyimpan tarif driver.' });
        return;
      }

      setDriverFeePerDay(data.driverFeePerDay);
      setDriverFeeMsg({ type: 'success', text: 'Tarif driver harian berhasil diperbarui!' });
    } catch (err) {
      console.error(err);
      setDriverFeeMsg({ type: 'error', text: 'Gagal mengontak server.' });
    } finally {
      setIsSavingDriverFee(false);
    }
  };

  const calculatePenaltyPreview = (booking: any, returnDateStr: string) => {
    if (!booking || !returnDateStr) return 0;
    const returnTime = new Date(returnDateStr).getTime();
    const endTime = new Date(booking.endDateTime || booking.endDate).getTime();
    const diffTimeMs = returnTime - endTime;

    if (diffTimeMs <= 0) return 0;

    const diffHours = Math.ceil(diffTimeMs / (1000 * 60 * 60));
    if (diffHours <= 0) return 0;

    return Math.round(diffHours * 0.10 * booking.car.pricePerDay);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden text-zinc-900">
      <BackgroundOrnaments />
      <AdminHeader />

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-200 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
              { id: 'cars', label: 'Armada', icon: Car },
              { id: 'drivers', label: 'Driver', icon: UserCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-8 py-8 relative z-10">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-zinc-100 rounded-xl">
                      <stat.icon size={18} className="text-zinc-700" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-zinc-950 mb-1">{stat.value}</p>
                  <p className="text-xs text-zinc-500 font-semibold">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Summary Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Pemesanan Terbaru</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-zinc-700 hover:text-zinc-950 underline"
                >
                  Lihat Semua
                </button>
              </div>

              {loadingBookings ? (
                <div className="py-8 text-center text-sm text-zinc-400">Memuat data booking...</div>
              ) : bookings.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-400">Belum ada transaksi pemesanan.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                        <th className="pb-3 font-semibold">ID</th>
                        <th className="pb-3 font-semibold">Pelanggan</th>
                        <th className="pb-3 font-semibold">Mobil</th>
                        <th className="pb-3 font-semibold">Layanan</th>
                        <th className="pb-3 font-semibold">Total</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-50/50">
                          <td className="py-3 font-mono text-xs font-bold">{b.id}</td>
                          <td className="py-3 font-medium text-zinc-900">{b.guestName || b.user?.name || 'Guest'}</td>
                          <td className="py-3 text-zinc-650">{b.car?.brand} {b.car?.name}</td>
                          <td className="py-3 capitalize text-xs text-zinc-650">{b.serviceType === 'LEPAS_KUNCI' ? 'Lepas Kunci' : 'Dengan Driver'}</td>
                          <td className="py-3 font-bold text-zinc-950">Rp {b.totalPrice.toLocaleString('id-ID')}</td>
                          <td className="py-3">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColors[b.status]}`}>
                              {statusLabels[b.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 border border-zinc-200 rounded-2xl shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari ID, Nama Pelanggan, Mobil..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                />
              </div>

              <div className="text-xs text-zinc-500 font-medium">
                Menampilkan <span className="font-bold text-zinc-900">{filteredBookings.length}</span> dari {bookings.length} booking
              </div>
            </div>

            {loadingBookings ? (
              <div className="py-12 text-center text-sm text-zinc-400 bg-white rounded-2xl border">Memuat daftar booking...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-400 bg-white rounded-2xl border">Tidak ditemukan booking yang sesuai.</div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                        <th className="p-4">ID Pemesanan</th>
                        <th className="p-4">Pelanggan</th>
                        <th className="p-4">Mobil & Layanan</th>
                        <th className="p-4">Tanggal Sewa</th>
                        <th className="p-4">Total & DP</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-4 font-mono text-xs font-bold text-zinc-900">{b.id}</td>
                          <td className="p-4">
                            <p className="font-bold text-zinc-900">{b.guestName || b.user?.name || 'Guest'}</p>
                            <p className="text-xs text-zinc-500">{b.guestPhone || b.user?.phone || '-'}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-zinc-900">{b.car?.brand} {b.car?.name}</p>
                            <span className="text-[11px] text-zinc-500 capitalize bg-zinc-100 px-2 py-0.5 rounded-md font-medium">
                              {b.serviceType === 'LEPAS_KUNCI' ? 'Lepas Kunci' : 'Dengan Driver'}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-zinc-650">
                            <p>{new Date(b.startDateTime || b.startDate).toLocaleDateString('id-ID')} - {new Date(b.endDateTime || b.endDate).toLocaleDateString('id-ID')}</p>
                            <p className="text-zinc-400 mt-0.5">{formatDuration(b.durationMinutes || b.duration)}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-zinc-950">Rp {b.totalPrice.toLocaleString('id-ID')}</p>
                            <p className="text-xs text-emerald-600 font-semibold">DP: Rp {b.dpAmount.toLocaleString('id-ID')}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border inline-block ${statusColors[b.status]}`}>
                              {statusLabels[b.status]}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 ml-auto transition-all"
                            >
                              <Eye size={14} /> Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Armada (Cars) Tab */}
        {activeTab === 'cars' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 border border-zinc-200 rounded-2xl shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari armada, brand, tipe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                />
              </div>

              <button
                onClick={handleOpenCreateCar}
                className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Plus size={16} /> Tambah Mobil Baru
              </button>
            </div>

            {loadingCars ? (
              <div className="py-12 text-center text-sm text-zinc-400 bg-white rounded-2xl border">Memuat daftar armada...</div>
            ) : filteredCars.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-400 bg-white rounded-2xl border">Belum ada data mobil yang sesuai.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <motion.div
                    key={car.id}
                    layout
                    className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Car Image Banner */}
                      <div className="h-48 bg-zinc-100 relative overflow-hidden border-b border-zinc-100">
                        <img
                          src={car.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop'}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                              car.status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : car.status === 'BOOKED'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {car.status === 'AVAILABLE' ? 'Tersedia' : car.status === 'BOOKED' ? 'Tersewa' : 'Perawatan'}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-5 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{car.brand}</p>
                          <h4 className="text-lg font-bold text-zinc-950">{car.name}</h4>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
                          <span className="bg-zinc-100 px-2.5 py-1 rounded-lg font-medium">{car.type}</span>
                          <span className="bg-zinc-100 px-2.5 py-1 rounded-lg font-medium">{car.transmission}</span>
                          <span className="bg-zinc-100 px-2.5 py-1 rounded-lg font-medium">{car.capacity} Kursi</span>
                          <span className="bg-zinc-100 px-2.5 py-1 rounded-lg font-medium">{car.fuelType}</span>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 flex items-baseline justify-between">
                          <span className="text-xs text-zinc-400 font-medium">Harga Sewa / Hari</span>
                          <span className="text-lg font-extrabold text-zinc-950">
                            Rp {car.pricePerDay.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 flex gap-2">
                      <button
                        onClick={() => handleOpenEditCar(car)}
                        className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Pencil size={14} /> Edit Mobil & Harga
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="px-3 py-2.5 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition-all"
                        title="Hapus Mobil"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Driver Tab */}
        {activeTab === 'drivers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Driver Fee Config Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-zinc-200 border border-white/10">
                  <DollarSign size={14} className="text-emerald-400" />
                  Pengaturan Tarif Driver Tambahan
                </div>

                <h3 className="text-2xl font-bold">Kelola Biaya Sewa Driver</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Tentukan besaran jasa driver per hari. Tarif driver ini otomatis ditambahkan ke total harga pemesanan ketika penyewa memilih opsi <strong className="text-white">"Dengan Driver"</strong>.
                </p>

                <form onSubmit={handleSaveDriverFee} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={editingDriverFeeInput}
                      onChange={(e) => setEditingDriverFeeInput(e.target.value)}
                      placeholder="Contoh: 150000"
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-zinc-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">/ Hari</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingDriverFee}
                    className="px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingDriverFee ? 'Menyimpan...' : 'Simpan Tarif Driver'}
                  </button>
                </form>

                {driverFeeMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                      driverFeeMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-rose-500/20 text-rose-200 border-rose-500/30'
                    }`}
                  >
                    {driverFeeMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    {driverFeeMsg.text}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Explanation Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                  🚗
                </div>
                <h4 className="font-bold text-zinc-950 text-base">Tarif Lepas Kunci</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Penyewa mengemudikan sendiri unit mobil. Total harga murni diambil dari <strong className="text-zinc-900">Harga Sewa Mobil Per Hari × Jumlah Hari</strong>.
                </p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                  👨‍✈️
                </div>
                <h4 className="font-bold text-zinc-950 text-base">Tarif Dengan Driver</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Penyewa menyewa unit beserta driver. Total harga dihitung dari <strong className="text-zinc-900">(Harga Sewa Mobil + Rp {driverFeePerDay.toLocaleString('id-ID')} Tarif Driver) × Jumlah Hari</strong>.
                </p>
              </div>
            </div>

            {/* Driver Roster Management Table */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">Tim Driver Operasional</h3>
                  <p className="text-xs text-zinc-500">Daftar pengemudi aktif untuk penugasan booking Dengan Driver.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {drivers.filter(d => d.status === 'READY').length} Driver Ready
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-400 font-bold bg-zinc-50/50">
                      <th className="p-3">ID Driver</th>
                      <th className="p-3">Nama Pengemudi</th>
                      <th className="p-3">Kontak WA</th>
                      <th className="p-3">Pengalaman</th>
                      <th className="p-3">Penugasan Saat Ini</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {drivers.map((drv) => (
                      <tr key={drv.id} className="hover:bg-zinc-50/50">
                        <td className="p-3 font-mono text-xs font-bold text-zinc-900">{drv.id}</td>
                        <td className="p-3 font-bold text-zinc-900">{drv.name}</td>
                        <td className="p-3 text-xs text-zinc-650 font-mono">{drv.phone}</td>
                        <td className="p-3 text-xs text-zinc-600">{drv.experience}</td>
                        <td className="p-3 text-xs font-medium text-zinc-700">{drv.activeCar}</td>
                        <td className="p-3">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                              drv.status === 'READY'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {drv.status === 'READY' ? 'Ready / Standby' : 'Sedang Bertugas'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal Edit / Create Car */}
      <AnimatePresence>
        {(editingCar || isCreatingCar) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 border border-zinc-200 shadow-xl max-h-[90vh] overflow-y-auto text-zinc-950"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">
                    {editingCar ? 'Edit Detail & Harga Mobil' : 'Tambah Mobil Baru'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {editingCar ? `ID: ${editingCar.id}` : 'Isi atribut lengkap armada baru'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCar(null);
                    setIsCreatingCar(false);
                  }}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCar} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Nama Mobil</label>
                    <input
                      type="text"
                      required
                      value={carFormData.name}
                      onChange={(e) => setCarFormData({ ...carFormData, name: e.target.value })}
                      placeholder="Contoh: Avanza Veloz"
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Brand / Merek</label>
                    <input
                      type="text"
                      required
                      value={carFormData.brand}
                      onChange={(e) => setCarFormData({ ...carFormData, brand: e.target.value })}
                      placeholder="Contoh: Toyota"
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Kategori / Tipe</label>
                    <select
                      value={carFormData.type}
                      onChange={(e) => setCarFormData({ ...carFormData, type: e.target.value })}
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    >
                      <option value="SUV">SUV</option>
                      <option value="MPV">MPV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Compact">Compact / City Car</option>
                      <option value="Luxury">Luxury / Mewah</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Kapasitas (Penumpang)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={carFormData.capacity}
                      onChange={(e) => setCarFormData({ ...carFormData, capacity: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Transmisi</label>
                    <select
                      value={carFormData.transmission}
                      onChange={(e) => setCarFormData({ ...carFormData, transmission: e.target.value })}
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Bahan Bakar</label>
                    <input
                      type="text"
                      value={carFormData.fuelType}
                      onChange={(e) => setCarFormData({ ...carFormData, fuelType: e.target.value })}
                      placeholder="Bensin / Diesel"
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    />
                  </div>
                </div>

                {/* Harga Per Hari */}
                <div className="space-y-1 pt-2">
                  <label className="block text-xs font-bold text-zinc-900">
                    Harga Sewa Per Hari (Rp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={carFormData.pricePerDay}
                      onChange={(e) => setCarFormData({ ...carFormData, pricePerDay: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                {/* Status Mobil */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">Status Ketersediaan</label>
                  <select
                    value={carFormData.status}
                    onChange={(e) => setCarFormData({ ...carFormData, status: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 font-bold"
                  >
                    <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
                    <option value="BOOKED">Sedang Tersewa (BOOKED)</option>
                    <option value="MAINTENANCE">Perawatan / Service (MAINTENANCE)</option>
                  </select>
                </div>

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">URL Gambar Mobil</label>
                  <input
                    type="url"
                    value={carFormData.image}
                    onChange={(e) => setCarFormData({ ...carFormData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-zinc-100 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCar(null);
                      setIsCreatingCar(false);
                    }}
                    className="px-5 py-2.5 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs hover:bg-zinc-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCar}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                  >
                    {isSavingCar ? 'Memproses...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Verification Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative border border-zinc-200 shadow-xl max-h-[90vh] overflow-y-auto text-zinc-950"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div>
                  <span className="text-xs font-mono text-zinc-500 uppercase">Detail Booking</span>
                  <h3 className="text-lg font-bold text-zinc-900">{selectedBooking.id}</h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[selectedBooking.status]}`}>
                  {statusLabels[selectedBooking.status]}
                </span>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {/* Pelanggan */}
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-900 border-b pb-1">Informasi Pelanggan</h4>
                  <p><span className="text-zinc-500 font-medium">Nama:</span> {selectedBooking.guestName || selectedBooking.user?.name || 'Guest'}</p>
                  <p><span className="text-zinc-500 font-medium">No. WA:</span> {selectedBooking.guestPhone || '-'}</p>
                  <p><span className="text-zinc-500 font-medium">Email:</span> {selectedBooking.guestEmail || selectedBooking.user?.email || '-'}</p>
                </div>

                {/* Sewa */}
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-900 border-b pb-1">Detail Sewa</h4>
                  <p><span className="text-zinc-500 font-medium">Mobil:</span> {selectedBooking.car?.brand} {selectedBooking.car?.name}</p>
                  <p><span className="text-zinc-500 font-medium">Layanan:</span> {selectedBooking.serviceType === 'LEPAS_KUNCI' ? 'Lepas Kunci' : 'Dengan Driver'}</p>
                  <p><span className="text-zinc-500 font-medium">Tanggal:</span> {new Date(selectedBooking.startDateTime || selectedBooking.startDate).toLocaleDateString('id-ID')} s.d. {new Date(selectedBooking.endDateTime || selectedBooking.endDate).toLocaleDateString('id-ID')}</p>
                  <p><span className="text-zinc-500 font-medium">Durasi:</span> {formatDuration(selectedBooking.durationMinutes || selectedBooking.duration)}</p>
                  {selectedBooking.pickupLocation && <p><span className="text-zinc-500 font-medium">Lokasi:</span> {selectedBooking.pickupLocation}</p>}
                </div>
              </div>

              {/* Rincian Pembayaran */}
              <div className="space-y-3 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                <h4 className="text-sm font-bold text-zinc-950 uppercase tracking-wider mb-2">Rincian Pembayaran</h4>
                <div className="grid grid-cols-2 text-sm gap-y-2">
                  <div className="text-zinc-500">Harga Dasar:</div>
                  <div className="font-bold text-right text-zinc-900">Rp {selectedBooking.basePrice.toLocaleString('id-ID')}</div>
                  {selectedBooking.discountAmount > 0 && (
                    <>
                      <div className="text-zinc-500">Diskon:</div>
                      <div className="font-bold text-right text-green-600">Rp {selectedBooking.discountAmount.toLocaleString('id-ID')}</div>
                    </>
                  )}
                  {selectedBooking.penaltyAmount > 0 && (
                    <>
                      <div className="text-zinc-500 text-rose-600">Denda Keterlambatan:</div>
                      <div className="font-bold text-right text-rose-600">Rp {selectedBooking.penaltyAmount.toLocaleString('id-ID')}</div>
                    </>
                  )}
                  <div className="text-zinc-900 font-bold border-t pt-2">Total Biaya:</div>
                  <div className="font-extrabold text-right text-zinc-950 border-t pt-2">Rp {selectedBooking.totalPrice.toLocaleString('id-ID')}</div>
                  <div className="text-emerald-700 font-bold">DP Diterima (50%):</div>
                  <div className="font-bold text-right text-emerald-700">Rp {selectedBooking.dpAmount.toLocaleString('id-ID')}</div>
                </div>

                {selectedBooking.paymentMethod && (
                  <div className="pt-2 border-t mt-2 text-sm">
                    <p><span className="text-zinc-500">Metode Bayar DP:</span> <span className="font-bold">{selectedBooking.paymentMethod.replace('_', ' ')}</span></p>
                  </div>
                )}
              </div>

              {/* Bukti Pembayaran DP */}
              {(selectedBooking.status === 'WAITING_DP' || selectedBooking.status === 'PENDING') && (
                selectedBooking.paymentProof ? (
                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-900 text-sm">Bukti Pembayaran DP</h4>
                    <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center p-2">
                      <img
                        src={selectedBooking.paymentProof}
                        alt="Bukti Transfer"
                        className="max-h-80 w-auto object-contain rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
                        onClick={() => window.open(selectedBooking.paymentProof)}
                        title="Klik untuk memperbesar"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-50 text-zinc-500 text-center text-sm rounded-2xl border border-dashed">
                    Belum ada bukti pembayaran DP yang diunggah.
                  </div>
                )
              )}

              {/* Reject Reason Form */}
              {showRejectForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <label className="block text-sm font-bold text-rose-900">
                    Alasan Penolakan Pembayaran DP
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Bukti transfer buram / nominal kurang."
                    className="w-full p-3 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-zinc-900 placeholder:text-zinc-400"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason('');
                      }}
                      className="px-4 py-2 bg-transparent hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isVerifying || !rejectReason.trim()}
                      onClick={() => handleVerify('REJECT')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      Kirim Penolakan
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Return & Pelunasan Form */}
              {showReturnForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-200">
                  <h4 className="text-sm font-bold text-zinc-950 border-b pb-1">Form Pengembalian & Pelunasan</h4>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">
                      Waktu Aktual Pengembalian
                    </label>
                    <input
                      type="datetime-local"
                      value={actualReturnDate}
                      onChange={(e) => setActualReturnDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">
                      Metode Pembayaran Pelunasan
                    </label>
                    <select
                      value={returnPaymentMethod}
                      onChange={(e) => setReturnPaymentMethod(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                    >
                      <option value="CASH">CASH / Tunai</option>
                      <option value="BCA_TRANSFER">BCA Transfer</option>
                      <option value="BNI_TRANSFER">BNI Transfer</option>
                      <option value="MANDIRI_TRANSFER">Mandiri Transfer</option>
                      <option value="QRIS">QRIS</option>
                    </select>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-zinc-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sisa Sewa yang Belum Dibayar:</span>
                      <span className="font-bold">Rp {(selectedBooking.totalPrice - selectedBooking.dpAmount).toLocaleString('id-ID')}</span>
                    </div>
                    {calculatePenaltyPreview(selectedBooking, actualReturnDate) > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Denda Keterlambatan:</span>
                        <span>Rp {calculatePenaltyPreview(selectedBooking, actualReturnDate).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold border-t pt-2 text-zinc-900">
                      <span>Total Tagihan Pelunasan:</span>
                      <span>Rp {((selectedBooking.totalPrice - selectedBooking.dpAmount) + calculatePenaltyPreview(selectedBooking, actualReturnDate)).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReturnForm(false)}
                      className="px-4 py-2 bg-transparent hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingReturn}
                      onClick={handleReturnSewa}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      {isProcessingReturn ? 'Memproses...' : 'Konfirmasi Pengembalian'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBooking(null);
                    setShowRejectForm(false);
                    setShowReturnForm(false);
                    setRejectReason('');
                  }}
                  className="px-6 py-3 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-sm transition-all"
                >
                  Tutup
                </button>

                {(selectedBooking.status === 'WAITING_DP' || selectedBooking.status === 'PENDING') && selectedBooking.paymentProof && !showRejectForm && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-sm border border-rose-200 transition-all"
                    >
                      Tolak DP
                    </button>
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={() => handleVerify('APPROVE')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all"
                    >
                      {isVerifying ? 'Memproses...' : 'Konfirmasi & Setujui DP'}
                    </button>
                  </>
                )}

                {selectedBooking.status === 'DP_CONFIRMED' && (
                  <button
                    type="button"
                    disabled={isStartingSewa}
                    onClick={handleStartSewa}
                    className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    {isStartingSewa ? 'Memproses...' : 'Mulai Sewa (Serah Terima Unit)'}
                  </button>
                )}

                {selectedBooking.status === 'IN_PROGRESS' && !showReturnForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setActualReturnDate(new Date().toISOString().slice(0, 16));
                      setShowReturnForm(true);
                    }}
                    className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    Kembalikan Mobil & Pelunasan
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
