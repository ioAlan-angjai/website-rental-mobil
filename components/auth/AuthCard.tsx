'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Check, Star, CheckCircle2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface AuthCardProps {
  initialMode?: 'login' | 'register';
}

export function AuthCard({ initialMode = 'login' }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleTabChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setSuccess(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newMode === 'login' ? '/login' : '/register');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        setError('Email atau password salah');
        setLoading(false);
      } else {
        const session = await fetch('/api/auth/session').then((r) => r.json());
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Nama, email, dan password wajib diisi.');
      return;
    }
    if (registerData.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal melakukan registrasi.');
      } else {
        setSuccess(true);
        // Otomatis login atau alihkan ke tab login setelah 1.5 detik
        setTimeout(() => {
          setLoginEmail(registerData.email);
          setMode('login');
          setSuccess(false);
        }, 2000);
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-zinc-900 flex items-center justify-center p-3 sm:p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-zinc-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12"
      >
        {/* ═══ SISI KIRI (DARK BRAND PANEL) ═══ */}
        <div className="md:col-span-5 bg-[#111113] p-7 sm:p-9 md:p-10 flex flex-col justify-between text-white relative">
          <div>
            {/* Brand Logo & Name */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                R
              </div>
              <span className="font-bold text-lg text-white tracking-tight">RentalMobil</span>
            </Link>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-medium text-zinc-300 mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Solusi Transportasi Terpercaya</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight mt-5">
              Sewa mobil mudah, cepat, dan berkelas untuk perjalanan Anda.
            </h1>

            {/* Subtitle */}
            <p className="text-xs text-zinc-400 leading-relaxed mt-3.5">
              Dapatkan pengalaman berkendara nyaman dengan armada terawat, asuransi lengkap, dan customer support siaga 24 jam nonstop di seluruh kota besar.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3 mt-6">
              {[
                'Ratusan unit transmisi matic & manual terawat',
                'Lepas kunci atau dengan sopir profesional',
                'Konfirmasi instan tanpa ribet verifikasi berulang',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Review / Social Proof Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mt-8">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-white font-extrabold text-xs">4.9/5.0</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">10,000+ Pengguna Aktif</span>
            </div>
            <p className="text-[11px] text-zinc-300 italic leading-relaxed mt-2.5">
              &ldquo;Proses sewa mobil paling cepat dan unit Avanza &amp; Innova selalu wangi seperti baru keluar dari showroom!&rdquo;
            </p>
          </div>
        </div>

        {/* ═══ SISI KANAN (LIGHT AUTH FORM PANEL) ═══ */}
        <div className="md:col-span-7 bg-white p-7 sm:p-9 md:p-12 flex flex-col justify-between">
          <div>
            {/* Segmented Switcher Tab */}
            <div className="bg-zinc-100 p-1 rounded-2xl flex items-center max-w-sm mx-auto w-full mb-6 border border-zinc-200/50">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {/* Header Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
                {mode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {mode === 'login'
                  ? 'Silakan masukkan email dan password akun Anda'
                  : 'Lengkapi data diri untuk kemudahan sewa mobil'}
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800 font-semibold h-11 rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-zinc-400 uppercase font-semibold tracking-wider shrink-0">
                {mode === 'login' ? 'atau masuk dengan email' : 'atau daftar dengan email'}
              </span>
              <div className="border-t border-zinc-200 w-full" />
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Registrasi berhasil! Mengalihkan ke halaman masuk...</span>
              </div>
            )}

            {/* Form Section */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-3.5"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Email</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-700">Password</label>
                      <Link href="/forgot-password" className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
                        Lupa password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 pr-10 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-11 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Masuk Sekarang'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="Nama lengkap Anda"
                      className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">Nomor WhatsApp</label>
                      <input
                        type="text"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        placeholder="081234567890"
                        className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">Email</label>
                      <input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">Password</label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          placeholder="Min. 8 karakter"
                          className="w-full h-9 px-3 pr-8 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                        >
                          {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">Konfirmasi Password</label>
                      <input
                        type="password"
                        required
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        placeholder="Ulangi password"
                        className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-10 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Daftar Sekarang'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Bottom Link Switcher */}
            <div className="text-center mt-5">
              <p className="text-xs text-zinc-500">
                {mode === 'login' ? (
                  <>
                    Belum memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabChange('register')}
                      className="font-bold text-zinc-950 hover:underline cursor-pointer"
                    >
                      Daftar Akun Baru
                    </button>
                  </>
                ) : (
                  <>
                    Sudah memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabChange('login')}
                      className="font-bold text-zinc-950 hover:underline cursor-pointer"
                    >
                      Masuk ke Akun
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Copyright Footer */}
          <div className="text-center text-[11px] text-zinc-400 pt-6">
            © 2025 RentalMobil Indonesia. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

