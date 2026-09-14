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

          <div className="p-5 sm:p-8 space-y-4 sm:space-y-5">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#D7CDCC] hover:bg-[#F8F7F6] text-[#1A1A1A] font-semibold h-11 rounded-2xl text-xs transition-all shadow-sm hover:border-[#1A1A1A] cursor-pointer"
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
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#E3DDDC] w-full" />
              <span className="bg-[#FFFFFF] px-3 text-[11px] text-[#756A68] uppercase font-semibold tracking-wider shrink-0">
                atau masuk dengan email
              </span>
              <div className="border-t border-[#E3DDDC] w-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] font-bold h-10 sm:h-11 rounded-full text-xs transition-all shadow-sm cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Masuk Sekarang'}
              </Button>
            </form>
          </div>

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

