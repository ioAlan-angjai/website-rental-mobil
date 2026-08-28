'use client';

import { useState, useEffect } from 'react';
import { Menu, Car, ChevronDown, LogIn, User, LogOut, LayoutDashboard, CalendarDays } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserNotifications } from '@/components/landing/UserNotifications';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Armada', href: '/armada', isDropdown: true },
  { label: 'Layanan', href: '/layanan' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Kontak', href: '/kontak' },
];

const categories = [
  { label: 'SUV', href: '/armada?category=suv' },
  { label: 'MPV', href: '/armada?category=mpv' },
  { label: 'Sedan', href: '/armada?category=sedan' },
  { label: 'Hatchback', href: '/armada?category=hatchback' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-[#13112a]/90 backdrop-blur-xl border-b border-[#2a2548]/50 shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: '84px' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <span className="text-xl font-black text-white tracking-tight hover:text-[#f97316] transition-colors">
            RentalMobil
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            if (item.isDropdown) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-3.5 py-2.5 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 bg-transparent border-0 cursor-pointer">
                    {item.label}
                    <ChevronDown size={14} className="text-white/40" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#13112a] border-[#2a2548] text-white/80">
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.label} className="p-0">
                        <Link
                          href={cat.href}
                          className="w-full block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer rounded-md"
                        >
                          {cat.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  pathname === item.href
                    ? 'text-[#f97316] bg-[#f97316]/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {session && user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 bg-transparent border-0 cursor-pointer">
                <div className="w-7 h-7 bg-[#f97316] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span className="max-w-[120px] truncate text-white/80">{user?.name || 'Pengguna'}</span>
                <ChevronDown size={14} className="text-white/40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#13112a] border-[#2a2548] text-white/80 min-w-[200px] p-1 shadow-xl">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Pengguna'}</p>
                  <p className="text-[11px] text-white/50 truncate">{user?.email}</p>
                </div>
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem className="p-0">
                    <Link href="/admin" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer rounded-md font-medium">
                      <LayoutDashboard size={14} />
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="p-0">
                  <Link href="/account" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer rounded-md font-medium">
                    <User size={14} />
                    Akun Saya
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <Link href="/riwayat-booking" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 cursor-pointer rounded-md font-medium">
                    <CalendarDays size={14} />
                    Riwayat Booking
                  </Link>
                </DropdownMenuItem>
                <div className="border-t border-white/10 my-1" />
                <DropdownMenuItem className="p-0">
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer rounded-md font-medium bg-transparent border-0 text-left">
                    <LogOut size={14} />
                    Keluar
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {session && <UserNotifications />}
          {!session && (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 font-medium rounded-xl text-sm">
                  <LogIn size={16} />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#f97316]/25">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {session && <UserNotifications />}
          <Sheet>
            <SheetTrigger
              className="p-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 bg-transparent cursor-pointer"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-xs border-l border-[#2a2548] bg-[#13112a] text-white/80 p-0 flex flex-col h-full"
              showCloseButton={false}
            >
              <SheetHeader className="px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-base font-black text-white">RentalMobil</SheetTitle>
                  <SheetClose className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 bg-transparent border-0 cursor-pointer" aria-label="Tutup menu">
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </SheetClose>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-3 px-3">
                <div className="flex flex-col gap-0.5">
                  {navItems.map((item) => {
                    if (item.isDropdown) {
                      return (
                        <div key={item.label} className="pt-2 pb-1">
                          <SheetClose className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                            <Link href={item.href} className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all w-full', pathname === item.href ? 'text-[#f97316] bg-[#f97316]/10' : 'text-white/70 hover:text-white hover:bg-white/5')}>
                              {item.label}
                            </Link>
                          </SheetClose>
                          <div className="flex flex-col gap-0.5 pl-3 mt-0.5 ml-3 border-l-2 border-white/10">
                            {categories.map((cat) => (
                              <SheetClose key={cat.label} className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                                <Link href={cat.href} className="block px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                  {cat.label}
                                </Link>
                              </SheetClose>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <SheetClose key={item.href} className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                        <Link href={item.href} className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all w-full', pathname === item.href ? 'text-[#f97316] bg-[#f97316]/10 font-semibold' : 'text-white/70 hover:text-white hover:bg-white/5')}>
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 px-4 py-4 flex flex-col gap-3 bg-[#13112a]">
                {session && user && (
                  <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-[#f97316] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate leading-tight">{user?.name || 'Pengguna'}</p>
                        <p className="text-[11px] text-white/50 truncate leading-tight">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                {session && user && (
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/account" className="w-full flex items-center justify-start gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all">
                        <User size={13} />
                        Akun Saya
                      </Link>
                    </SheetClose>
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/riwayat-booking" className="w-full flex items-center justify-start gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all">
                        <CalendarDays size={13} />
                        Riwayat
                      </Link>
                    </SheetClose>
                    {user?.role === 'ADMIN' && (
                      <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer col-span-2">
                        <Link href="/admin" className="w-full flex items-center justify-start gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all">
                          <LayoutDashboard size={13} />
                          Dashboard Admin
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                )}
                {!session && (
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/login" className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all">
                        <LogIn size={15} />
                        Login
                      </Link>
                    </SheetClose>
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/register" className="w-full flex items-center justify-center h-10 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm transition-all">
                        Daftar
                      </Link>
                    </SheetClose>
                  </div>
                )}
                {session && (
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors bg-transparent border border-red-500/30 cursor-pointer flex items-center justify-center gap-2">
                    <LogOut size={13} />
                    Keluar
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
