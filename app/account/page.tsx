'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, CalendarCheck, LogOut, AlertCircle, CheckCircle2, Loader2, MapPin, Home, Globe, FileText, Save, Edit3, X } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { BackgroundOrnaments } from '@/components/landing/BackgroundOrnaments';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AccountPage() {
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');

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
          name: data.data.name || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          city: data.data.city || '',
          province: data.data.province || '',
          postalCode: data.data.postalCode || '',
        });
      }
    } catch (e) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
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
    } catch (e: any) {
      toast.error(e.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BackgroundOrnaments />
      <div className="pt-28 pb-8 px-4 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16"><AvatarFallback>{profile?.name?.[0] || 'U'}</AvatarFallback></Avatar>
          <div>
            <h1 className="text-2xl font-black">{profile?.name}</h1>
            <p className="text-zinc-500">{profile?.email}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">Informasi Akun</h2>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit3 className="mr-2" size={14}/> Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X className="mr-2" size={14}/> Batal</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" size={14}/>} Simpan</Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Nama', name: 'name' },
              { label: 'Telepon', name: 'phone' },
              { label: 'Alamat', name: 'address' },
              { label: 'Kota', name: 'city' },
              { label: 'Provinsi', name: 'province' },
              { label: 'Kode Pos', name: 'postalCode' },
            ].map(field => (
              <div key={field.name} className="space-y-1">
                <Label className="text-xs font-bold text-zinc-500">{field.label}</Label>
                {editing ? (
                  <Input value={(formData as any)[field.name]} onChange={e => setFormData({...formData, [field.name]: e.target.value})} />
                ) : (
                  <p className="font-bold text-sm h-9 p-2 bg-zinc-50 rounded-lg">{profile[field.name] || '-'}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}