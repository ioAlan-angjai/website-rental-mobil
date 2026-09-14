'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Loader2, Save, Edit3, X, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AccountPage() {
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: '', province: '', postalCode: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setFormData({
          name: data.data.name || '', phone: data.data.phone || '',
          address: data.data.address || '', city: data.data.city || '',
          province: data.data.province || '', postalCode: data.data.postalCode || '',
        });
      }
    } catch { toast.error('Gagal memuat profil'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/login');
    if (sessionStatus === 'authenticated') fetchProfile();
  }, [sessionStatus, router, fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data.data);
      setEditing(false);
      updateSession();
      toast.success('Profil berhasil disimpan');
    } catch (e: any) { toast.error(e.message || 'Gagal menyimpan profil'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-foreground mx-auto mb-2" size={28} />
        <p className="text-xs text-foreground/60">Memuat data akun...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-secondary selection:text-foreground">
      <Navbar />

      <div className="flex-1 pt-32 pb-16 px-4 sm:px-6 max-w-3xl mx-auto w-full space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-card border border-border rounded-2xl shadow-xs"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-border shadow-xs shrink-0">
              <AvatarImage src={profile?.image} alt={profile?.name} />
              <AvatarFallback className="bg-foreground text-background font-bold text-base sm:text-lg">
                {profile?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground truncate">{profile?.name}</h1>
              <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5 font-medium truncate">
                <Mail size={13} className="text-foreground/50 shrink-0" /> <span className="truncate">{profile?.email}</span>
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors font-medium sm:ml-auto"
          >
            <ArrowLeft size={13} />
            Beranda
          </Link>
        </motion.div>

        {/* Info Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card/60">
            <h2 className="font-bold text-foreground text-xs sm:text-sm tracking-wide">Informasi Profil Akun</h2>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="border-border bg-background text-foreground hover:bg-secondary text-xs h-7 sm:h-8 rounded-xl cursor-pointer"
              >
                <Edit3 size={12} className="mr-1 sm:mr-1.5" /> Edit Profil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                  className="text-foreground/60 hover:text-foreground text-xs h-7 sm:h-8 rounded-xl cursor-pointer"
                >
                  <X size={12} className="mr-1 sm:mr-1.5" /> Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-foreground hover:bg-foreground/90 text-background text-xs h-7 sm:h-8 rounded-xl shadow-xs cursor-pointer font-bold"
                >
                  {saving ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} className="mr-1 sm:mr-1.5" />} Simpan
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
            {[
              { label: 'Nama Lengkap', name: 'name', icon: User },
              { label: 'Nomor Telepon / WhatsApp', name: 'phone', icon: Phone },
              { label: 'Alamat Domisili', name: 'address' },
              { label: 'Kota / Kabupaten', name: 'city' },
              { label: 'Provinsi', name: 'province' },
              { label: 'Kode Pos', name: 'postalCode' },
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                  {field.icon && <field.icon size={11} className="inline mr-1 text-foreground/50" />}
                  {field.label}
                </Label>
                {editing ? (
                  <Input
                    value={(formData as any)[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-foreground/30 rounded-xl h-9 sm:h-10 text-xs sm:text-sm focus:border-foreground/50"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-foreground h-9 sm:h-10 px-3 py-2 bg-background rounded-xl border border-border flex items-center truncate">
                    {profile?.[field.name] || <span className="text-foreground/30 font-normal">Belum diisi</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
