'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Car, Eye, EyeOff, ArrowLeft, UserPlus, CheckCircle2 } from 'lucide-react';
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
    if (p.length < 6) return { level: 1, label: 'Lemah', color: 'bg-red-400' };
    if (p.length < 10) return { level: 2, label: 'Sedang', color: 'bg-yellow-400' };
    return { level: 3, label: 'Kuat', color: 'bg-green-500' };
  })();

  return (
    <div className="min-h-screen bg-[#13112a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2.5 bg-[#f97316] text-white rounded-2xl transition-transform group-hover:scale-110">
              <Car size={22} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">RentalMobil</span>
          </Link>
          <p className="mt-3 text-sm text-white/50">Buat akun baru untuk mulai menyewa</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1b1838] border border-green-500/30 rounded-3xl shadow-2xl p-10 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Registrasi Berhasil</h2>
            <p className="text-sm text-white/50">Akun Anda berhasil dibuat. Silakan masuk.</p>
          </motion.div>
        ) : (
          <div className="bg-[#1b1838] border border-[#2a2548] rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#13112a]/50 border-b border-[#2a2548] px-8 pt-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f97316] rounded-xl"><UserPlus size={18} className="text-white" /></div>
                <div>
                  <h1 className="text-xl font-bold text-white">Daftar Akun</h1>
                  <p className="text-xs text-white/50 mt-0.5">Gratis & mudah dalam 1 menit</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Nama Lengkap</label>
                <Input name="name" placeholder="Contoh: Ahmad Fauzi" value={formData.name} onChange={handleChange}
                  className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-12 focus:border-[#f97316]/50 focus:ring-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Email</label>
                  <Input type="email" name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange}
                    className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-12 focus:border-[#f97316]/50 focus:ring-0" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Nomor HP</label>
                  <Input type="tel" name="phone" placeholder="08123456789" value={formData.phone} onChange={handleChange}
                    className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-12 focus:border-[#f97316]/50 focus:ring-0" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} name="password" placeholder="Minimal 8 karakter"
                    value={formData.password} onChange={handleChange}
                    className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-12 pr-12 focus:border-[#f97316]/50 focus:ring-0" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-[#2a2548]'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-white/50">Kekuatan: <span className="font-semibold">{passwordStrength.label}</span></p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Konfirmasi Password</label>
                <div className="relative">
                  <Input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Ulangi password"
                    value={formData.confirmPassword} onChange={handleChange}
                    className={`bg-[#13112a] text-white placeholder:text-white/20 rounded-xl h-12 pr-12 focus:ring-0 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500/50 focus:border-red-400'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-500/50 focus:border-green-400'
                        : 'border-[#2a2548] focus:border-[#f97316]/50'
                    }`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> Password cocok</p>
                )}
              </div>

              <Button type="submit" disabled={loading}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-12 rounded-xl transition-all duration-200 mt-2 disabled:opacity-60">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Mendaftarkan...</>
                ) : (<>Buat Akun <ArrowLeft size={16} className="rotate-180" /></>)}
              </Button>

              <p className="text-center text-sm text-white/50">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-bold text-[#f97316] hover:underline">Masuk di sini</Link>
              </p>
            </form>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
