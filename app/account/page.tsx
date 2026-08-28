'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, AlertCircle, CheckCircle2, Loader2, Save, Edit3, X } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
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
    <div className="min-h-screen bg-[#13112a] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#f97316]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#13112a]">
      <Navbar />
      <div className="pt-28 pb-8 px-4 max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-[#1b1838] border border-[#2a2548] rounded-2xl">
          <Avatar className="w-16 h-16 border-2 border-[#2a2548]">
            <AvatarImage src={profile?.image} alt={profile?.name} />
            <AvatarFallback className="bg-[#13112a] text-white font-bold">{profile?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{profile?.name}</h1>
            <p className="text-sm text-white/50 flex items-center gap-1.5 mt-0.5">
              <Mail size={12} /> {profile?.email}
            </p>
          </div>
          <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">Kembali</Link>
        </motion.div>

        {/* Info Card */}
        <div className="bg-[#1b1838] border border-[#2a2548] rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a2548]">
            <h2 className="font-bold text-white text-sm">Informasi Akun</h2>
            {!editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}
                className="text-[#f97316] hover:text-white hover:bg-[#f97316]/10 text-xs h-8">
                <Edit3 size={13} className="mr-1.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}
                  className="text-white/50 hover:text-white text-xs h-8">
                  <X size={13} className="mr-1.5" /> Batal
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs h-8">
                  {saving ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} className="mr-1.5" />} Simpan
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: 'Nama', name: 'name', icon: User },
              { label: 'Telepon', name: 'phone', icon: Phone },
              { label: 'Alamat', name: 'address' },
              { label: 'Kota', name: 'city' },
              { label: 'Provinsi', name: 'province' },
              { label: 'Kode Pos', name: 'postalCode' },
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {field.icon && <field.icon size={11} className="inline mr-1" />}
                  {field.label}
                </Label>
                {editing ? (
                  <Input
                    value={(formData as any)[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="bg-[#13112a] border-[#2a2548] text-white placeholder:text-white/20 rounded-xl h-10 text-sm focus:border-[#f97316]/50 focus:ring-0"
                  />
                ) : (
                  <p className="text-sm font-semibold text-white h-10 p-2.5 bg-[#13112a] rounded-xl border border-[#2a2548]">
                    {profile?.[field.name] || <span className="text-white/30">-</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
