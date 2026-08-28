'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Car, Eye, EyeOff, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#13112a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#f97316]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2.5 bg-[#f97316] text-white rounded-2xl">
            <Car size={24} />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">RentalMobil</span>
        </div>

        <div className="bg-[#1b1838] border border-[#2a2548] rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-[#13112a]/50 border-b border-[#2a2548] px-8 pt-8 pb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Masuk Akun</h1>
            <p className="text-white/50 text-sm">Selamat datang kembali, silahkan masuk.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-12 focus:border-[#f97316]/50 focus:ring-0"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-12 pr-12 focus:border-[#f97316]/50 focus:ring-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-12 rounded-xl transition-all duration-200"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Masuk Sekarang'}
            </Button>
          </form>

          <div className="px-8 pb-8 text-center text-sm">
            <p className="text-white/50">
              Belum punya akun?{' '}
              <Link href="/register" className="text-[#f97316] font-bold hover:underline">Daftar</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
