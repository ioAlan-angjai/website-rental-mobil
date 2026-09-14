'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
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
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password }),
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

  const passwordStrength = (() => {
    const p = formData.password;
    if (p.length === 0) return { level: 0, label: '', color: '' };
    if (p.length < 6) return { level: 1, label: 'Lemah', color: 'bg-rose-500' };
    if (p.length < 10) return { level: 2, label: 'Sedang', color: 'bg-amber-500' };
    return { level: 3, label: 'Kuat', color: 'bg-emerald-500' };
  })();

  return (
    <div className="min-h-screen bg-[#F8F2F1] text-[#1A1A1A] flex items-center justify-center px-4 py-16 relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-[#2C2828] transition-colors">
              R
            </div>
            <span className="text-2xl font-black text-[#1A1A1A] tracking-tight">RentalMobil</span>
          </Link>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FFFFFF] border border-emerald-200 rounded-3xl shadow-xl p-10 text-center"
          >
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A] mb-2">Registrasi Berhasil!</h2>
            <p className="text-xs text-[#504745] leading-relaxed">
              Akun Anda telah berhasil dibuat. Mengalihkan Anda ke halaman login...
            </p>
          </motion.div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-3xl shadow-xl overflow-hidden">
            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 text-center border-b border-[#F0E6E4]">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-1">Daftar Akun Baru</h1>
              <p className="text-[#504745] text-xs leading-relaxed">
                Bergabung untuk kemudahan booking armada di Jogja
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-3.5 sm:space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A]">Nama Lengkap</label>
                <Input
                  name="name"
                  placeholder="Nama sesuai KTP"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-10 sm:h-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1A1A]">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-10 sm:h-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1A1A]">Nomor WhatsApp</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-10 sm:h-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A]">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimal 8 karakter"
                    value={formData.password}
                    onChange={handleChange}
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
                {formData.password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.level ? passwordStrength.color : 'bg-[#E3DDDC]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-[#756A68]">
                      Kekuatan kata sandi: <span className="font-semibold text-[#1A1A1A]">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A1A]">Ulangi Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Ketik ulang password Anda"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`bg-[#F8F7F6] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-11 pr-11 focus:ring-0 text-xs ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-rose-400 focus:border-rose-500'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-emerald-400 focus:border-emerald-500'
                        : 'border-[#D7CDCC] focus:border-[#1A1A1A]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756A68] hover:text-[#1A1A1A] cursor-pointer bg-transparent border-0"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 size={12} /> Password cocok
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] font-bold h-11 rounded-full text-xs transition-all shadow-sm mt-2 cursor-pointer"
              >
                {loading ? 'Mendaftarkan Akun...' : 'Buat Akun Sekarang'}
              </Button>
            </form>

            <div className="px-8 pb-8 text-center text-xs border-t border-[#F0E6E4] pt-5">
              <p className="text-[#504745]">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-[#1A1A1A] font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-[#756A68] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-1.5 font-medium">
            <ArrowLeft size={13} /> Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

