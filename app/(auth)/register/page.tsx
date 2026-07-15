'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, UserPlus, User, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Nama, email, dan password harus diisi.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal melakukan registrasi.');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2500);
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const passwordStrength = (() => {
    const p = formData.password;
    if (p.length === 0) return { level: 0, label: '', color: '' };
    if (p.length < 6) return { level: 1, label: 'Lemah', color: 'bg-red-400' };
    if (p.length < 10) return { level: 2, label: 'Sedang', color: 'bg-yellow-400' };
    return { level: 3, label: 'Kuat', color: 'bg-green-500' };
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
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
          <p className="mt-3 text-sm text-zinc-500">Buat akun baru untuk mulai menyewa</p>
        </div>

        {/* Success State */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-green-200 rounded-3xl shadow-xl shadow-zinc-900/5 p-10 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-50 rounded-full">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Registrasi Berhasil! 🎉</h2>
            <p className="text-sm text-zinc-500 mb-1">Akun Anda berhasil dibuat.</p>
            <p className="text-sm text-zinc-400">Mengarahkan ke halaman login...</p>
          </motion.div>
        ) : (
          /* Card */
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl shadow-zinc-900/5 overflow-hidden">
            {/* Card Header */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-8 pt-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 rounded-xl">
                  <UserPlus size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-zinc-900">Daftar Akun</h1>
                  <p className="text-xs text-zinc-500 mt-0.5">Gratis & mudah dalam 1 menit</p>
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

              {/* Nama */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <User size={14} className="text-zinc-600" />
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Contoh: Ahmad Fauzi"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 focus:border-zinc-900 focus:ring-0"
                />
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Mail size={14} className="text-zinc-600" />
                    Email <span className="text-red-500">*</span>
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
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Phone size={14} className="text-zinc-600" />
                    Nomor HP
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 focus:border-zinc-900 focus:ring-0"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Lock size={14} className="text-zinc-600" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimal 8 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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
                {/* Password Strength Bar */}
                {formData.password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.level ? passwordStrength.color : 'bg-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Kekuatan: <span className="font-semibold">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Lock size={14} className="text-zinc-600" />
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Ulangi password Anda"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`bg-zinc-50 border text-zinc-900 placeholder:text-zinc-400 rounded-xl h-12 pr-12 focus:ring-0 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 focus:border-red-400'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-300 focus:border-green-400'
                        : 'border-zinc-200 focus:border-zinc-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                    aria-label={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Password cocok
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                id="btn-register-submit"
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    Buat Akun
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>

              {/* Login link */}
              <p className="text-center text-sm text-zinc-500">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  id="link-to-login"
                  className="font-bold text-zinc-900 hover:underline underline-offset-4 transition-all"
                >
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>
        )}

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors inline-flex items-center gap-1.5"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
