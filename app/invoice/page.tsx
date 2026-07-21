'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Printer, ArrowLeft, Car, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatDuration } from '@/lib/utils';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const bookingId = searchParams?.get('bookingId') || '';
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId || status !== 'authenticated') return;
    setLoading(true);
    fetch(`/api/invoice?bookingId=${bookingId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setInvoice(res.data);
        else setError(res.error || 'Invoice tidak ditemukan.');
      })
      .catch(() => setError('Gagal memuat invoice.'))
      .finally(() => setLoading(false));
  }, [bookingId, status]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-24">
          <div className="text-center max-w-sm">
            <p className="text-zinc-500 mb-4">{error || 'Invoice tidak ditemukan.'}</p>
            <Link href="/riwayat-booking">
              <Button variant="outline">Kembali ke Riwayat Booking</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const b = invoice.booking;
  const car = b.car;
  const user = b.user;
  const payments = b.payments || [];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>
      <BackgroundOrnaments />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-28 pb-16 relative z-10 print:pt-0">
        {/* Breadcrumb - hidden on print */}
        <div className="print:hidden flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-900">Beranda</Link>
          <span>/</span>
          <Link href="/riwayat-booking" className="hover:text-zinc-900">Riwayat Booking</Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold">Invoice</span>
        </div>

        {/* Header bar - hidden on print */}
        <div className="print:hidden flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900">Invoice</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Detail tagihan dan bukti sewa mobil</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer size={16} /> Print
            </Button>
            <Link href="/riwayat-booking">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} /> Kembali
              </Button>
            </Link>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden print:shadow-none print:border-none">
          {/* Invoice Header */}
          <div className="bg-zinc-900 text-white px-8 py-6 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight">RentalMobil</h2>
              <p className="text-zinc-400 text-xs mt-1">Solusi rental mobil premium Yogyakarta</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-zinc-400 uppercase tracking-wider">Invoice</p>
              <p className="font-mono text-lg font-bold">{invoice.invoiceNumber}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {invoice.createdAt ? format(parseISO(invoice.createdAt), 'dd MMMM yyyy', { locale: localeId }) : '-'}
              </p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Customer & Booking Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pelanggan</p>
                <p className="font-bold text-zinc-900">{user?.name || b.guestName || '-'}</p>
                <p className="text-sm text-zinc-600">{user?.email || b.guestEmail || '-'}</p>
                <p className="text-sm text-zinc-600">{user?.phone || b.guestPhone || '-'}</p>
                {user?.address && <p className="text-sm text-zinc-600">{user.address}, {user.city}, {user.province}</p>}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Booking</p>
                <p className="font-mono text-sm font-bold text-zinc-900">{b.id}</p>
                <p className="text-xs text-zinc-500 mt-1">Status: <span className="font-bold text-emerald-600">{b.status}</span></p>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Rental Details */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Detail Sewa</p>
              <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-zinc-200 rounded-lg">
                    <Car size={16} className="text-zinc-600" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{car?.brand} {car?.name}</p>
                    <p className="text-xs text-zinc-500 capitalize">{car?.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-zinc-400 flex items-center gap-1"><Calendar size={10} /> Mulai</p>
                    <p className="font-semibold text-zinc-900">
                      {b.startDateTime ? format(parseISO(b.startDateTime), 'dd MMM yyyy HH:mm', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 flex items-center gap-1"><Calendar size={10} /> Selesai</p>
                    <p className="font-semibold text-zinc-900">
                      {b.endDateTime ? format(parseISO(b.endDateTime), 'dd MMM yyyy HH:mm', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Durasi</p>
                    <p className="font-semibold text-zinc-900">{formatDuration(b.durationMinutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 flex items-center gap-1"><MapPin size={10} /> Lokasi</p>
                    <p className="font-semibold text-zinc-900">{b.pickupLocation || 'Kantor'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Payment Summary */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Ringkasan Pembayaran</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Biaya Sewa</span>
                  <span className="font-medium text-zinc-900">{formatIDR(invoice.subtotal)}</span>
                </div>
                {invoice.penalty > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Denda Keterlambatan</span>
                    <span className="font-medium text-red-600">{formatIDR(invoice.penalty)}</span>
                  </div>
                )}
                <div className="h-px bg-zinc-200 my-2" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-zinc-900">Total</span>
                  <span className="text-xl font-black text-zinc-900">{formatIDR(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <>
                <div className="h-px bg-zinc-100" />
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Riwayat Pembayaran</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200">
                          <th className="text-left py-2 font-bold text-zinc-500 text-xs">Tanggal</th>
                          <th className="text-left py-2 font-bold text-zinc-500 text-xs">Tipe</th>
                          <th className="text-left py-2 font-bold text-zinc-500 text-xs">Metode</th>
                          <th className="text-right py-2 font-bold text-zinc-500 text-xs">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p: any) => (
                          <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                            <td className="py-2 text-zinc-600 text-xs">
                              {p.createdAt ? format(parseISO(p.createdAt), 'dd MMM yyyy', { locale: localeId }) : '-'}
                            </td>
                            <td className="py-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.type === 'DP' ? 'bg-blue-100 text-blue-700' : p.type === 'FULL_PAYMENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {p.type === 'DP' ? 'DP' : p.type === 'FULL_PAYMENT' ? 'Pelunasan' : 'Denda'}
                              </span>
                            </td>
                            <td className="py-2 text-zinc-600 text-xs capitalize">{p.method?.replace('_', ' ')}</td>
                            <td className="py-2 text-right font-semibold text-zinc-900">{formatIDR(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Footer Note */}
            <div className="bg-zinc-50 rounded-xl p-4 text-xs text-zinc-500 text-center">
              Terima kasih telah menggunakan layanan RentalMobil. Dokumen ini merupakan bukti resmi pembayaran sewa.
            </div>
          </div>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block mt-8 text-center text-xs text-zinc-400">
          RentalMobil - rental mobil premium Yogyakarta
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          nav, footer, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
