'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#13112a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2.5 bg-[#f97316] text-white rounded-2xl transition-transform group-hover:scale-110">
              <Car size={22} />
            </div>
            <span className="text-2xl font-black text-white">RentalMobil</span>
          </Link>
          <p className="mt-3 text-sm text-white/50">Reset password akun Anda</p>
        </div>

        <div className="bg-[#1b1838] border border-[#2a2548] rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 bg-[#13112a]/50 border-b border-[#2a2548]">
            <h1 className="text-xl font-bold text-white">Lupa Password</h1>
            <p className="text-xs text-white/50 mt-1">
              Masukkan email Anda dan kami akan mengirimkan link reset password.
            </p>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Email Terkirim</h2>
              <p className="text-sm text-white/50 mb-6">
                Link reset password telah dikirim ke <strong className="text-[#f97316]">{email}</strong>.
                Silakan cek email Anda.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#f97316] hover:underline">
                <ArrowLeft size={14} /> Kembali ke halaman login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Email</label>
                <Input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="email@example.com"
                  className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-12 focus:border-[#f97316]/50 focus:ring-0" />
              </div>

              <Button type="submit" disabled={loading}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</> : <>Kirim Link Reset <ArrowRight size={16} /></>}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-white/40 hover:text-white inline-flex items-center gap-1.5">
                  <ArrowLeft size={14} /> Kembali ke login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
