'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan email Anda.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengirim email reset password.');
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
          <p className="mt-3 text-sm text-zinc-500">Reset password akun Anda</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl shadow-zinc-900/5 overflow-hidden">
          <div className="px-8 pt-8 pb-6 bg-zinc-50 border-b border-zinc-200">
            <h1 className="text-xl font-bold text-zinc-900">Lupa Password</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Masukkan email Anda dan kami akan mengirimkan link reset password.
            </p>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">Email Terkirim</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Link reset password telah dikirim ke <strong className="text-zinc-900">{email}</strong>.
                Silakan cek email Anda.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:underline"
              >
                <ArrowLeft size={14} />
                Kembali ke halaman login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
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
                <label htmlFor="email" className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Mail size={14} className="text-zinc-600" />
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="email@example.com"
                  className="bg-zinc-50 border-zinc-200 rounded-xl h-12 focus:border-zinc-900 focus:ring-0"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Link Reset
                    <ArrowRight size={16} />
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
