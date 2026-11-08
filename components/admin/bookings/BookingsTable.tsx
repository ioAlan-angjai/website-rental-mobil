'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Search, Eye, FilterX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface BookingsTableProps {
  bookings: any[];
  searchQuery: string;
  onView: (booking: any) => void;
  onEdit: (booking: any) => void;
}

export function BookingsTable({ bookings, searchQuery, onView, onEdit }: BookingsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Keep local search in sync with topbar search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setServiceFilter('ALL');
    setPaymentFilter('ALL');
    setLocalSearch('');
  };

  const getCleanCarName = (car: any) => {
    if (!car) return '-';
    const brand = car.brand || '';
    const name = car.name || '';
    if (name.toLowerCase().startsWith(brand.toLowerCase())) {
      return name;
    }
    return `${brand} ${name}`;
  };

  const getStatusLabel = (val: string) => {
    switch (val) {
      case 'PENDING': return 'Menunggu Konfirmasi';
      case 'WAITING_DP': return 'Menunggu DP';
      case 'DP_CONFIRMED': return 'DP Diverifikasi';
      case 'IN_PROGRESS': return 'Sedang Jalan';
      case 'COMPLETED': return 'Selesai';
      case 'CANCELLED': return 'Dibatalkan';
      default: return 'Semua Status';
    }
  };

  const getServiceLabel = (val: string) => {
    switch (val) {
      case 'LEPAS_KUNCI': return 'Lepas Kunci';
      case 'DENGAN_DRIVER': return 'Dengan Driver';
      default: return 'Semua Layanan';
    }
  };

  const getPaymentLabel = (val: string) => {
    switch (val) {
      case 'UNPAID': return 'Belum Bayar';
      case 'DP_PAID': return 'DP Terbayar';
      case 'FULL_PAID': return 'Lunas';
      default: return 'Semua Pembayaran';
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const customer = (b.guestName || b.user?.name || 'Guest').toLowerCase();
      const carName = getCleanCarName(b.car).toLowerCase();
      const bookingId = b.id.toLowerCase();
      const paymentMethod = (b.paymentMethod || '').toLowerCase();
      
      const query = localSearch.trim().toLowerCase();
      
      const matchesSearch = !query || customer.includes(query) || carName.includes(query) || bookingId.includes(query) || paymentMethod.includes(query);
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchesService = serviceFilter === 'ALL' || b.serviceType === serviceFilter;
      
      let matchesPayment = true;
      if (paymentFilter === 'FULL_PAID') matchesPayment = b.fullPaid;
      if (paymentFilter === 'DP_PAID') matchesPayment = b.dpPaid && !b.fullPaid;
      if (paymentFilter === 'UNPAID') matchesPayment = !b.dpPaid && !b.fullPaid;

      return matchesSearch && matchesStatus && matchesService && matchesPayment;
    });
  }, [bookings, localSearch, statusFilter, serviceFilter, paymentFilter]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">Menunggu Konfirmasi</span>;
      case 'WAITING_DP': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/80 whitespace-nowrap">Menunggu DP</span>;
      case 'DP_CONFIRMED': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 whitespace-nowrap">DP Diverifikasi</span>;
      case 'IN_PROGRESS': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap">Sedang Jalan</span>;
      case 'COMPLETED': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 whitespace-nowrap">Selesai</span>;
      case 'CANCELLED': 
      case 'REJECTED': 
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">Dibatalkan</span>;
      default: 
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 whitespace-nowrap">{status}</span>;
    }
  };

  const getPaymentBadge = (booking: any) => {
    if (booking.fullPaid) 
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">Lunas</span>;
    if (booking.dpPaid) 
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">DP Terbayar</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 whitespace-nowrap">Belum Bayar</span>;
  };

  return (
    <div className="space-y-3">
      {/* Filter Section */}
      <div className="flex flex-col gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Filter Pemesanan</h3>
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-7 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2">
            <FilterX className="h-3.5 w-3.5 mr-1" />
            Reset Filter
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Pencarian */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-600">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Cari ID, Pelanggan, Mobil..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-8 bg-zinc-50 border-zinc-200 h-9 text-xs rounded-xl focus:bg-white transition-all"
              />
            </div>
          </div>
          
          {/* Filter Status */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-600">Status Pesanan</label>
            <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
              <SelectTrigger className="h-9 w-full bg-zinc-50 border-zinc-200 text-xs rounded-xl">
                <span className="truncate">{getStatusLabel(statusFilter)}</span>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu Konfirmasi</SelectItem>
                <SelectItem value="WAITING_DP">Menunggu DP</SelectItem>
                <SelectItem value="DP_CONFIRMED">DP Diverifikasi</SelectItem>
                <SelectItem value="IN_PROGRESS">Sedang Jalan</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Layanan */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-600">Jenis Layanan</label>
            <Select value={serviceFilter} onValueChange={(val) => val && setServiceFilter(val)}>
              <SelectTrigger className="h-9 w-full bg-zinc-50 border-zinc-200 text-xs rounded-xl">
                <span className="truncate">{getServiceLabel(serviceFilter)}</span>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                <SelectItem value="ALL">Semua Layanan</SelectItem>
                <SelectItem value="LEPAS_KUNCI">Lepas Kunci</SelectItem>
                <SelectItem value="DENGAN_DRIVER">Dengan Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Pembayaran */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-600">Status Pembayaran</label>
            <Select value={paymentFilter} onValueChange={(val) => val && setPaymentFilter(val)}>
              <SelectTrigger className="h-9 w-full bg-zinc-50 border-zinc-200 text-xs rounded-xl">
                <span className="truncate">{getPaymentLabel(paymentFilter)}</span>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                <SelectItem value="ALL">Semua Pembayaran</SelectItem>
                <SelectItem value="UNPAID">Belum Bayar</SelectItem>
                <SelectItem value="DP_PAID">DP Terbayar</SelectItem>
                <SelectItem value="FULL_PAID">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs">
        <Table className="w-full text-xs">
          <TableHeader>
            <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 border-b border-zinc-200/80">
              <TableHead className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider py-2.5 px-3">Pelanggan</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider py-2.5 px-3">Mobil</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider py-2.5 px-3">Jadwal Sewa</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider py-2.5 px-2.5">Layanan</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider py-2.5 px-2.5">Status</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider py-2.5 px-2.5">Pembayaran</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider py-2.5 px-2 text-center w-14">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                    <Search className="h-6 w-6 text-zinc-300" />
                    <p className="text-xs font-semibold text-zinc-600">Tidak ada pemesanan yang ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map(b => {
                const customerName = b.guestName || b.user?.name || 'Guest';
                const carName = getCleanCarName(b.car);

                return (
                  <TableRow key={b.id} className="hover:bg-zinc-50/80 transition-colors border-b border-zinc-100">
                    {/* Pelanggan */}
                    <TableCell className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-zinc-200 shrink-0">
                          <AvatarImage src={b.user?.image || b.user?.avatar} />
                          <AvatarFallback className="bg-zinc-900 text-white font-bold text-[10px]">{customerName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-zinc-900 truncate max-w-[120px]">{customerName}</span>
                          <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[120px]">{b.id}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Mobil */}
                    <TableCell className="py-2.5 px-3">
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="font-bold text-xs text-zinc-900 leading-tight truncate max-w-[140px]">{carName}</span>
                        <span className="text-[10px] font-medium text-zinc-500 mt-0.5">{b.car?.category || b.car?.type || 'Minibus'}</span>
                      </div>
                    </TableCell>

                    {/* Jadwal Sewa */}
                    <TableCell className="py-2.5 px-3">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[11px] font-semibold text-zinc-900 whitespace-nowrap">
                          {format(parseISO(b.startDateTime), 'dd MMM yyyy', { locale: idLocale })}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                          s/d {format(parseISO(b.endDateTime), 'dd MMM yyyy', { locale: idLocale })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Layanan */}
                    <TableCell className="py-2.5 px-2.5">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap",
                        b.serviceType === 'DENGAN_DRIVER'
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-zinc-100 text-zinc-700 border-zinc-200"
                      )}>
                        {b.serviceType === 'DENGAN_DRIVER' ? 'Dengan Driver' : 'Lepas Kunci'}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2.5 px-2.5">{getStatusBadge(b.status)}</TableCell>

                    {/* Pembayaran */}
                    <TableCell className="py-2.5 px-2.5">{getPaymentBadge(b)}</TableCell>

                    {/* Aksi - Langsung Ikon Mata (Tanpa dropdown redundan) */}
                    <TableCell className="py-2.5 px-2 text-center w-14">
                      <button
                        type="button"
                        onClick={() => onView(b)}
                        title="Lihat Detail Pemesanan"
                        aria-label="Lihat Detail Pemesanan"
                        className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-zinc-100/80 hover:bg-zinc-200 border border-zinc-200/70 text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
