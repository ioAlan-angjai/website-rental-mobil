'use client';

import { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '';
  const { data: session } = useSession();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email dan password harus diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else {
        // Fetch session to get role, then redirect
        const res = await fetch('/api/auth/session');
        const sessionData = await res.json();
        const role = sessionData?.user?.role;

        // If there's a callbackUrl and it's not the admin page, respect it
        // This allows anyone (including admin) to complete booking before going to dashboard
        if (callbackUrl && !callbackUrl.startsWith('/admin') && !callbackUrl.startsWith('/login')) {
          router.push(callbackUrl);
        } else if (role === 'ADMIN') {
          // Redirect admin ke dashboard admin
          router.push('/admin');
        } else {
          router.push('/account');
        }
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-100/50 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2.5 bg-zinc-900 text-white rounded-xl transition-transform duration-300 group-hover:scale-110">
              <Car size={22} />
            </div>
            <span className="text-2xl font-black text-zinc-900 tracking-tight">
              RentalMobil
            </span>
          </Link>
          <p className="mt-3 text-sm text-zinc-500">Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl shadow-zinc-900/5 overflow-hidden">
          {/* Card Header */}
          <div className="bg-zinc-50 border-b border-zinc-200 px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-xl">
                <LogIn size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Masuk Akun</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Selamat datang kembali!</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Error Alert */}
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

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Mail size={14} className="text-zinc-600" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 focus:border-zinc-900 focus:ring-0"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Lock size={14} className="text-zinc-600" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Masukkan password Anda"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 pr-12 focus:border-zinc-900 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              id="btn-login-submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight size={16} />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-zinc-400">atau</span>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-1 cursor-pointer"
                />
                <span className="text-xs font-medium text-zinc-600">Ingat saya</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-zinc-700 hover:text-zinc-900 underline-offset-4 hover:underline transition-all"
              >
                Lupa Password?
              </Link>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-zinc-500">
              Belum punya akun?{' '}
              <Link
                href="/register"
                id="link-to-register"
                className="font-bold text-zinc-900 hover:underline underline-offset-4 transition-all"
              >
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
