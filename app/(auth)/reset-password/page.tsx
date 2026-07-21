'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    if (!token) {
      setError('Token reset tidak valid.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal reset password.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2.5 bg-zinc-900 text-white rounded-xl transition-transform group-hover:scale-110">
              <Car size={22} />
            </div>
            <span className="text-2xl font-black text-zinc-900">RentalMobil</span>
          </Link>
          <p className="mt-3 text-sm text-zinc-500">Atur ulang password akun Anda</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl shadow-zinc-900/5 overflow-hidden">
          <div className="px-8 pt-8 pb-6 bg-zinc-50 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-xl">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Reset Password</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Masukkan password baru Anda</p>
              </div>
            </div>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">Password Berhasil Diubah</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Password Anda telah berhasil diperbarui. Silakan login dengan password baru.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft size={14} />
                Masuk Sekarang
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {!token && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
                >
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">Token reset tidak ditemukan. Silakan minta link reset ulang.</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
                >
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Lock size={14} className="text-zinc-600" />
                  Password Baru
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                    placeholder="Minimal 8 karakter"
                    className="bg-zinc-50 border-zinc-200 rounded-xl h-12 pr-12 focus:border-zinc-900 focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Lock size={14} className="text-zinc-600" />
                  Konfirmasi Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                  placeholder="Ulangi password baru"
                  className="bg-zinc-50 border-zinc-200 rounded-xl h-12 focus:border-zinc-900 focus:ring-0"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowLeft size={16} />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-zinc-500 hover:text-zinc-700 inline-flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  Kembali ke login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
