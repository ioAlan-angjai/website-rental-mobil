'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Email atau password salah');
      setLoading(false);
    } else {
      // Redirect based on role
      const session = await fetch('/api/auth/session').then(r => r.json());
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    }
  };

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

        {/* Card */}
        <div className="bg-[#FFFFFF] border border-[#D7CDCC] rounded-3xl shadow-xl overflow-hidden">
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 text-center border-b border-[#F0E6E4]">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-1">Masuk ke Akun</h1>
            <p className="text-[#504745] text-xs leading-relaxed">
              Silakan masukkan email dan password akun Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1A1A]">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-10 sm:h-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1A1A]">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-[#756A68] hover:text-[#1A1A1A]">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#F8F7F6] border-[#D7CDCC] text-[#1A1A1A] placeholder:text-[#9A8E8C] rounded-2xl h-10 sm:h-11 pr-11 focus:border-[#1A1A1A] focus:ring-0 text-xs"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] font-bold h-10 sm:h-11 rounded-full text-xs transition-all shadow-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Masuk Sekarang'}
            </Button>
          </form>

          <div className="px-5 sm:px-8 pb-6 sm:pb-8 text-center text-xs border-t border-[#F0E6E4] pt-4 sm:pt-5">
            <p className="text-[#504745]">
              Belum memiliki akun?{' '}
              <Link href="/register" className="text-[#1A1A1A] font-bold hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

