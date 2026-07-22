'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Edit, FileText, MoreHorizontal, FilterX, CheckCircle2, Car as CarIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">Menunggu Konfirmasi</span>;
      case 'WAITING_DP': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/80">Menunggu DP</span>;
      case 'DP_CONFIRMED': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">DP Diverifikasi</span>;
      case 'IN_PROGRESS': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">Sedang Jalan</span>;
      case 'COMPLETED': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">Selesai</span>;
      case 'CANCELLED': 
      case 'REJECTED': 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Dibatalkan</span>;
      default: 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">{status}</span>;
    }
  };

  const getPaymentBadge = (booking: any) => {
    if (booking.fullPaid) 
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Lunas</span>;
    if (booking.dpPaid) 
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">DP Terbayar</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">Belum Bayar</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Filter Pemesanan</h3>
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-8 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <FilterX className="h-3.5 w-3.5 mr-1.5" />
            Reset Filter
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari ID, Pelanggan, Mobil..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 bg-zinc-50 border-zinc-200 h-9.5 text-sm rounded-xl focus:bg-white transition-all"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
            <SelectTrigger className="h-9.5 bg-zinc-50 border-zinc-200 text-sm rounded-xl">
              <SelectValue placeholder="Status Pesanan" />
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

          <Select value={serviceFilter} onValueChange={(val) => val && setServiceFilter(val)}>
            <SelectTrigger className="h-9.5 bg-zinc-50 border-zinc-200 text-sm rounded-xl">
              <SelectValue placeholder="Jenis Layanan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg">
              <SelectItem value="ALL">Semua Layanan</SelectItem>
              <SelectItem value="LEPAS_KUNCI">Lepas Kunci</SelectItem>
              <SelectItem value="DENGAN_DRIVER">Dengan Driver</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={(val) => val && setPaymentFilter(val)}>
            <SelectTrigger className="h-9.5 bg-zinc-50 border-zinc-200 text-sm rounded-xl">
              <SelectValue placeholder="Status Pembayaran" />
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

      {/* Table Section */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 border-b border-zinc-200/80">
              <TableHead className="font-bold text-zinc-700 uppercase text-[11px] tracking-wider py-3.5">Pelanggan</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[11px] tracking-wider py-3.5">Mobil</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[11px] tracking-wider py-3.5">Jadwal Sewa</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[11px] tracking-wider py-3.5">Layanan</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[11px] tracking-wider py-3.5">Status</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[11px] tracking-wider py-3.5">Pembayaran</TableHead>
              <TableHead className="font-bold text-zinc-700 uppercase text-[11px] tracking-wider py-3.5 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-zinc-300" />
                    <p className="text-sm font-semibold text-zinc-600">Tidak ada pemesanan yang ditemukan.</p>
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
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-zinc-200 shrink-0">
                          <AvatarImage src={b.user?.image || b.user?.avatar} />
                          <AvatarFallback className="bg-zinc-900 text-white font-bold text-xs">{customerName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-zinc-900 truncate">{customerName}</span>
                          <span className="text-[11px] font-mono text-zinc-400 truncate">{b.id}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Mobil (Pure Text layout without image) */}
                    <TableCell className="py-3.5">
                      <div className="flex flex-col justify-center">
                        <span className="font-bold text-sm text-zinc-900 leading-tight">{carName}</span>
                        <span className="text-[11px] font-medium text-zinc-500 mt-0.5">{b.car?.category || b.car?.type || 'Minibus'}</span>
                      </div>
                    </TableCell>

                    {/* Jadwal Sewa */}
                    <TableCell className="py-3.5">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-900 whitespace-nowrap">
                          {format(parseISO(b.startDateTime), 'dd MMM yyyy', { locale: idLocale })}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                          s/d {format(parseISO(b.endDateTime), 'dd MMM yyyy', { locale: idLocale })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Layanan */}
                    <TableCell className="py-3.5">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                        b.serviceType === 'DENGAN_DRIVER'
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-zinc-100 text-zinc-700 border-zinc-200"
                      )}>
                        {b.serviceType === 'DENGAN_DRIVER' ? 'Dengan Driver' : 'Lepas Kunci'}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5">{getStatusBadge(b.status)}</TableCell>

                    {/* Pembayaran */}
                    <TableCell className="py-3.5">{getPaymentBadge(b)}</TableCell>

                    {/* Aksi */}
                    <TableCell className="py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 shadow-lg rounded-xl">
                          <DropdownMenuLabel className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView(b)} className="font-semibold cursor-pointer py-2 text-zinc-700">
                            <Eye className="mr-2 h-4 w-4 text-zinc-400" /> Lihat Detail
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
