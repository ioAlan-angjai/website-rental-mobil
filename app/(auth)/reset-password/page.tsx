'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
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
    if (!password || !confirmPassword) { setError('Semua kolom wajib diisi.'); return; }
    if (password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    if (password !== confirmPassword) { setError('Konfirmasi password tidak cocok.'); return; }
    if (!token) { setError('Token reset tidak valid.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Gagal reset password.');
      else setSuccess(true);
    } catch { setError('Terjadi kesalahan. Silakan coba lagi.'); }
    finally { setLoading(false); }
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
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-1">Reset Password</h1>
            <p className="text-xs text-[#504745] leading-relaxed">
              Masukkan kata sandi baru untuk akun Anda
            </p>
          </div>

          {success ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Password Berhasil Diperbarui</h2>
              <p className="text-xs text-[#504745] leading-relaxed">
                Kata sandi baru Anda telah tersimpan. Silakan login menggunakan kata sandi baru tersebut.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button className="rounded-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] text-xs font-semibold h-10 px-6 shadow-sm">
                    Masuk Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              {!token && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
                  Tautan atau token reset tidak ditemukan / sudah kedaluwarsa.
                </div>
              )}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A]">Password Baru</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                    placeholder="Minimal 8 karakter"
                    className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-11 pr-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756A68] hover:text-[#1A1A1A] cursor-pointer bg-transparent border-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A]">Konfirmasi Password Baru</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                  placeholder="Ketik ulang password baru"
                  className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] font-bold h-11 rounded-full text-xs transition-all shadow-sm mt-2 cursor-pointer"
              >
                {loading ? 'Memperbarui Password...' : 'Simpan Password Baru'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F2F1] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

