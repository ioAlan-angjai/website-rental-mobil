'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Masukkan email Anda.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Gagal mengirim email reset password.');
      else setSuccess(true);
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F2F1] text-[#1A1A1A] flex items-center justify-center px-4 py-16 relative">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-[#2C2828] transition-colors">
              R
            </div>
            <span className="text-2xl font-black text-[#1A1A1A] tracking-tight">RentalMobil</span>
          </Link>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-4 text-center border-b border-[#F0E6E4]">
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-1">Lupa Password</h1>
            <p className="text-xs text-[#504745] leading-relaxed">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password.
            </p>
          </div>

          {success ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Tautan Terkirim</h2>
              <p className="text-xs text-[#504745] leading-relaxed">
                Tautan reset password telah dikirim ke <strong className="text-[#1A1A1A]">{email}</strong>. Silakan periksa folder inbox atau spam email Anda.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button className="rounded-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] text-xs font-semibold h-10 px-6 shadow-sm">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A]">Alamat Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="nama@email.com"
                  className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] font-bold h-11 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Mengirim Tautan...</> : <>Kirim Tautan Reset <ArrowRight size={14} /></>}
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs font-semibold text-[#504745] hover:text-[#1A1A1A] inline-flex items-center gap-1.5 transition-colors">
                  <ArrowLeft size={13} /> Kembali ke Halaman Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

