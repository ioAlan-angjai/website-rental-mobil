'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, CalendarCheck,
  TrendingUp, Clock, Eye, Search,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'cars'>('overview');
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

  useEffect(() => {
    fetchBookings();
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
    const car = `${b.car.brand} ${b.car.name}`.toLowerCase();
    const id = b.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return customer.includes(query) || car.includes(query) || id.includes(query);
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

      // Success
      setSelectedBooking(null);
      setRejectReason('');
      setShowRejectForm(false);
      fetchBookings(); // refresh list
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
      alert('Gagal menghubungi server.');
    } finally {
      setIsStartingSewa(false);
    }
  };

  const handleReturnSewa = async () => {
    if (!selectedBooking) return;
    if (!actualReturnDate) {
      alert('Silakan pilih tanggal pengembalian terlebih dahulu.');
      return;
    }

    setIsProcessingReturn(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualReturnDate: new Date(actualReturnDate).toISOString(),
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
      alert('Gagal menghubungi server.');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const calculatePenaltyPreview = (booking: any, returnDateStr: string) => {
    if (!booking || !returnDateStr) return 0;
    const returnTime = new Date(returnDateStr).getTime();
    const endTime = new Date(booking.endDate).getTime();
    const diffTimeMs = returnTime - endTime;

    const diffMinutes = Math.floor(diffTimeMs / (1000 * 60));
    if (diffMinutes <= 30) return 0; // grace period (30 mins)

    const diffHours = Math.ceil(diffTimeMs / (1000 * 60 * 60));
    if (diffHours >= 6) { // threshold hours (6 hours)
      return booking.car.pricePerDay; // full day equivalent denda
    }
    return diffHours * 50000; // penalty rate per hour (50k)
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
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id
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

      {/* Content */}
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
                  <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Booking Terbaru</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 text-left border-b border-zinc-200">
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Pelanggan</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Mobil</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Tanggal Mulai</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Total</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400">
                          Memuat data...
                        </td>
                      </tr>
                    ) : bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-zinc-650">{booking.id}</td>
                        <td className="px-6 py-3 font-bold text-zinc-900">
                          {booking.guestName || booking.user?.name || 'Guest'}
                        </td>
                        <td className="px-6 py-3 text-zinc-600">
                          {booking.car.brand} {booking.car.name}
                        </td>
                        <td className="px-6 py-3 text-zinc-500">
                          {new Date(booking.startDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColors[booking.status]}`}>
                            {statusLabels[booking.status]}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-zinc-900 text-right">
                          Rp {booking.totalPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                          >
                            <Eye size={14} className="text-zinc-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari booking berdasarkan nama, mobil, atau ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 text-left border-b border-zinc-200">
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Pelanggan</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Mobil</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Tanggal Mulai</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Total</th>
                      <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="animate-spin h-6 w-6 border-2 border-zinc-900 border-t-transparent rounded-full mx-auto" />
                          <span className="text-xs text-zinc-400 mt-2 block">Memuat data booking...</span>
                        </td>
                      </tr>
                    ) : filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-zinc-650">{booking.id}</td>
                        <td className="px-6 py-3 font-bold text-zinc-900">
                          {booking.guestName || booking.user?.name || 'Guest'}
                        </td>
                        <td className="px-6 py-3 text-zinc-650">
                          {booking.car.brand} {booking.car.name}
                        </td>
                        <td className="px-6 py-3 text-zinc-500">
                          {new Date(booking.startDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColors[booking.status]}`}>
                            {statusLabels[booking.status]}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-zinc-900 text-right">
                          Rp {booking.totalPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Detail & Verifikasi"
                          >
                            <Eye size={14} className="text-zinc-550" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredBookings.length === 0 && !loadingBookings && (
                <div className="py-12 text-center text-sm text-zinc-400">
                  Tidak ada booking ditemukan.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Cars Tab */}
        {activeTab === 'cars' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center shadow-sm">
              <Car size={48} className="text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Manajemen Armada</h3>
              <p className="text-sm text-zinc-500">Gunakan Prisma Studio untuk menambah atau mengubah data mobil Anda secara instan.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Verification Modal */}
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
                  <p><span className="text-zinc-500 font-medium">Mobil:</span> {selectedBooking.car.brand} {selectedBooking.car.name}</p>
                  <p><span className="text-zinc-500 font-medium">Layanan:</span> {selectedBooking.serviceType === 'LEPAS_KUNCI' ? 'Lepas Kunci' : 'Dengan Driver'}</p>
                  <p><span className="text-zinc-500 font-medium">Tanggal:</span> {new Date(selectedBooking.startDate).toLocaleDateString('id-ID')} s.d. {new Date(selectedBooking.endDate).toLocaleDateString('id-ID')}</p>
                  <p><span className="text-zinc-500 font-medium">Durasi:</span> {selectedBooking.duration} Hari</p>
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
                  <div className="text-zinc-500">Total Harga:</div>
                  <div className="font-bold text-right text-zinc-900">Rp {selectedBooking.totalPrice.toLocaleString('id-ID')}</div>
                  <div className="text-zinc-900 font-bold border-t pt-2">DP Terbayar (50%):</div>
                  <div className="font-bold text-right text-zinc-900 border-t pt-2">Rp {selectedBooking.dpAmount.toLocaleString('id-ID')}</div>
                  <div className="text-zinc-900 font-bold">Sisa Pembayaran:</div>
                  <div className="font-black text-right text-lg text-zinc-950">
                    Rp {selectedBooking.status === 'COMPLETED' ? '0 (LUNAS)' : (selectedBooking.totalPrice - selectedBooking.dpAmount - selectedBooking.penaltyAmount).toLocaleString('id-ID')}
                  </div>
                </div>

                {selectedBooking.paymentMethod && (
                  <div className="pt-2 border-t mt-2 text-sm">
                    <p><span className="text-zinc-500">Metode Bayar DP:</span> <span className="font-bold">{selectedBooking.paymentMethod.replace('_', ' ')}</span></p>
                  </div>
                )}
              </div>

              {/* Bukti Pembayaran DP (Jika belum dikonfirmasi) */}
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

                  {/* Return Date Input */}
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

                  {/* Payment Method Selector */}
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

                  {/* Calculations Preview */}
                  <div className="bg-white p-4 rounded-xl border border-zinc-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sisa Sewa yang Belum Dibayar:</span>
                      <span className="font-bold">Rp {(selectedBooking.totalPrice - selectedBooking.dpAmount).toLocaleString('id-ID')}</span>
                    </div>
                    {calculatePenaltyPreview(selectedBooking, actualReturnDate) > 0 && (
                      <div className="flex justify-between text-rose-605 text-rose-600 font-bold">
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
                      onClick={() => {
                        setShowReturnForm(false);
                      }}
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

                {/* Status: WAITING_DP / PENDING */}
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

                {/* Status: DP_CONFIRMED (Ready to start) */}
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

                {/* Status: IN_PROGRESS (Ready to return) */}
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
