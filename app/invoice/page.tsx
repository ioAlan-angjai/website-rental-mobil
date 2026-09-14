'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft, Car, Calendar, MapPin } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mb-2" />
          <p className="text-xs text-foreground/60">Memuat rincian invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
          <div className="text-center max-w-sm bg-card border border-border p-8 rounded-2xl shadow-xs">
            <p className="text-foreground/70 text-sm mb-4">{error || 'Invoice tidak ditemukan.'}</p>
            <Link href="/riwayat-booking">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary text-xs rounded-xl">
                Kembali ke Riwayat Booking
              </Button>
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col selection:bg-secondary selection:text-foreground">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-32 pb-16 relative z-10 print:p-0 print:m-0 print:max-w-none">
        {/* Breadcrumb - hidden on print */}
        <div className="print:hidden flex items-center gap-2 text-xs text-foreground/50 mb-6 font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/riwayat-booking" className="hover:text-foreground transition-colors">Riwayat Booking</Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Invoice</span>
        </div>

        {/* Header bar - hidden on print */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Invoice Pemesanan</h1>
            <p className="text-foreground/60 text-xs sm:text-sm mt-0.5">Detail tagihan dan bukti resmi penyewaan armada mobil</p>
          </div>
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs font-semibold rounded-xl border-border bg-card text-foreground hover:bg-secondary cursor-pointer"
            >
              <Printer size={14} /> Cetak / Unduh PDF
            </Button>
            <Link href="/riwayat-booking">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-xs font-semibold rounded-xl border-border bg-card text-foreground hover:bg-secondary cursor-pointer"
              >
                <ArrowLeft size={14} /> Riwayat
              </Button>
            </Link>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden print:shadow-none print:border-none print:bg-transparent">
          {/* Invoice Header Banner */}
          <div className="bg-foreground text-background px-4 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">Rental Mobil</h2>
              <p className="text-background/70 text-xs mt-0.5 sm:mt-1">Layanan Sewa Mobil Terpercaya Yogyakarta</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[9px] sm:text-[10px] text-background/60 uppercase tracking-widest font-bold">Nomor Invoice</p>
              <p className="font-mono text-sm sm:text-lg font-extrabold">{invoice.invoiceNumber}</p>
              <p className="text-[10px] sm:text-[11px] text-background/70 mt-0.5 sm:mt-1">
                {invoice.createdAt ? format(parseISO(invoice.createdAt), 'dd MMMM yyyy', { locale: localeId }) : '-'}
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
            {/* Customer & Booking Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2">Pelanggan</p>
                <p className="font-bold text-foreground text-sm">{user?.name || b.guestName || '-'}</p>
                <p className="text-xs text-foreground/70">{user?.email || b.guestEmail || '-'}</p>
                <p className="text-xs text-foreground/70">{user?.phone || b.guestPhone || '-'}</p>
                {user?.address && <p className="text-xs text-foreground/70">{user.address}, {user.city}, {user.province}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2">Pemesanan</p>
                <p className="font-mono text-xs font-bold text-foreground">{b.id}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-foreground/60">Status:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border">
                    {b.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Rental Details */}
            <div>
              <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-3">Detail Sewa</p>
              <div className="bg-background rounded-xl border border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-secondary/50 rounded-lg text-foreground">
                    <Car size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{car?.brand} {car?.name}</p>
                    <p className="text-xs text-foreground/60 capitalize">{car?.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] text-foreground/50 flex items-center gap-1 mb-0.5"><Calendar size={11} /> Mulai</p>
                    <p className="font-semibold text-foreground">
                      {b.startDateTime ? format(parseISO(b.startDateTime), 'dd MMM yyyy HH:mm', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-foreground/50 flex items-center gap-1 mb-0.5"><Calendar size={11} /> Selesai</p>
                    <p className="font-semibold text-foreground">
                      {b.endDateTime ? format(parseISO(b.endDateTime), 'dd MMM yyyy HH:mm', { locale: localeId }) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-foreground/50 mb-0.5">Durasi</p>
                    <p className="font-semibold text-foreground">{formatDuration(b.durationMinutes)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-foreground/50 flex items-center gap-1 mb-0.5"><MapPin size={11} /> Lokasi</p>
                    <p className="font-semibold text-foreground">{b.pickupLocation || 'Garasi Utama'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Payment Summary */}
            <div>
              <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-3">Rincian Tarif</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-foreground/70">Biaya Sewa Unit</span>
                  <span className="font-medium text-foreground">{formatIDR(invoice.subtotal)}</span>
                </div>
                {invoice.penalty > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-foreground/70">Denda / Keterlambatan</span>
                    <span className="font-medium text-red-600">{formatIDR(invoice.penalty)}</span>
                  </div>
                )}
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-foreground text-sm">Total Tagihan</span>
                  <span className="text-xl font-black text-foreground">{formatIDR(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-3">Riwayat Transaksi Pembayaran</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-bold text-foreground/60">Tanggal</th>
                          <th className="text-left py-2 font-bold text-foreground/60">Tipe</th>
                          <th className="text-left py-2 font-bold text-foreground/60">Metode</th>
                          <th className="text-right py-2 font-bold text-foreground/60">Nominal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p: any) => (
                          <tr key={p.id} className="border-b border-border/60 last:border-0">
                            <td className="py-2.5 text-foreground/70 font-mono">
                              {p.createdAt ? format(parseISO(p.createdAt), 'dd MMM yyyy', { locale: localeId }) : '-'}
                            </td>
                            <td className="py-2.5">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border">
                                {p.type === 'DP' ? 'Down Payment (DP)' : p.type === 'FULL_PAYMENT' ? 'Pelunasan' : 'Denda'}
                              </span>
                            </td>
                            <td className="py-2.5 text-foreground/80 capitalize">{p.method?.replace('_', ' ')}</td>
                            <td className="py-2.5 text-right font-bold text-foreground">{formatIDR(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Footer Note */}
            <div className="bg-background rounded-xl p-4 text-xs text-foreground/60 text-center border border-border">
              Terima kasih telah menggunakan layanan Rental Mobil. Dokumen ini merupakan bukti sah transaksi penyewaan armada.
            </div>
          </div>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block mt-8 text-center text-xs text-zinc-500">
          Rental Mobil Yogyakarta &bull; Dokumen Elektronik Resmi
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          nav, footer, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
