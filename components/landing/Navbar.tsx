'use client';

import { useState, useEffect } from 'react';
import { Menu, ChevronDown, LogIn, User, LogOut, LayoutDashboard, CalendarDays, Sparkles } from 'lucide-react';
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
  { label: 'Armada', href: '/armada' },
  { label: 'Layanan', href: '/layanan' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Kontak', href: '/kontak' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
        isTransparent
          ? 'bg-transparent border-transparent text-white'
          : 'bg-[#F8F2F1]/95 backdrop-blur-md border-b border-[#D7CDCC]/70 shadow-xs text-[#1A1A1A]'
      )}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs transition-colors',
              isTransparent
                ? 'bg-white text-[#1A1A1A]'
                : 'bg-[#1A1A1A] text-[#F8F7F6] group-hover:bg-[#2C2828]'
            )}
          >
            R
          </div>
          <span
            className={cn(
              'text-base font-bold tracking-tight transition-colors',
              isTransparent
                ? 'text-white group-hover:text-white/85'
                : 'text-[#1A1A1A] group-hover:text-[#3B3433]'
            )}
          >
            RentalMobil
          </span>
        </Link>

        {/* Desktop Nav Links - Clean inline direct links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/armada' && pathname.startsWith('/armada'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-xs font-medium transition-colors py-1',
                  isTransparent
                    ? isActive
                      ? 'text-white font-bold'
                      : 'text-white/85 hover:text-white'
                    : isActive
                    ? 'text-[#1A1A1A] font-bold'
                    : 'text-[#504745] hover:text-[#1A1A1A]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {session && <UserNotifications />}

          {session && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border transition-all cursor-pointer outline-none shadow-xs',
                  isTransparent
                    ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white'
                    : 'border-[#D7CDCC] bg-[#FFFFFF] hover:bg-[#F8F7F6] text-[#1A1A1A]'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px]',
                    isTransparent ? 'bg-white text-[#1A1A1A]' : 'bg-[#1A1A1A] text-[#F8F7F6]'
                  )}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={12} />}
                </div>
                <span
                  className={cn(
                    'max-w-[110px] truncate text-xs font-semibold',
                    isTransparent ? 'text-white' : 'text-[#1A1A1A]'
                  )}
                >
                  {user?.name || 'Akun Saya'}
                </span>
                <ChevronDown
                  size={12}
                  className={isTransparent ? 'text-white/70' : 'text-[#756A68]'}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#FFFFFF] border border-[#D7CDCC] text-[#1A1A1A] min-w-[200px] p-1 shadow-lg rounded-xl mt-1">
                <div className="px-3 py-2 border-b border-[#E3DDDC] mb-1">
                  <p className="text-xs font-bold text-[#1A1A1A] truncate">{user?.name || 'Pengguna'}</p>
                  <p className="text-[11px] text-[#756A68] truncate">{user?.email}</p>
                </div>
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem className="p-0 focus:bg-[#F8F7F6] rounded-lg">
                    <Link href="/admin" className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A1A1A] font-medium">
                      <LayoutDashboard size={13} className="text-[#756A68]" />
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="p-0 focus:bg-[#F8F7F6] rounded-lg">
                  <Link href="/account" className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A1A1A] font-medium">
                    <User size={13} className="text-[#756A68]" />
                    Akun Saya
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0 focus:bg-[#F8F7F6] rounded-lg">
                  <Link href="/riwayat-booking" className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1A1A1A] font-medium">
                    <CalendarDays size={13} className="text-[#756A68]" />
                    Riwayat Booking
                  </Link>
                </DropdownMenuItem>
                <div className="border-t border-[#E3DDDC] my-1" />
                <DropdownMenuItem className="p-0 focus:bg-rose-50 rounded-lg">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium bg-transparent border-0 text-left cursor-pointer"
                  >
                    <LogOut size={13} />
                    Keluar
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className={cn(
                    'text-xs font-semibold rounded-lg px-3 h-8 transition-colors',
                    isTransparent
                      ? 'text-white hover:bg-white/15 hover:text-white'
                      : 'text-[#1A1A1A] hover:bg-[#FFFFFF] hover:text-[#1A1A1A]'
                  )}
                >
                  <LogIn size={13} className="mr-1" />
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className={cn(
                    'text-xs font-semibold rounded-lg px-3.5 h-8 shadow-xs transition-all',
                    isTransparent
                      ? 'bg-white text-[#1A1A1A] hover:bg-neutral-100'
                      : 'bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6]'
                  )}
                >
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {session && <UserNotifications />}
          <Sheet>
            <SheetTrigger
              className={cn(
                'p-2 rounded-lg border transition-all cursor-pointer',
                isTransparent
                  ? 'border-white/30 text-white bg-white/10 hover:bg-white/20'
                  : 'border-[#D7CDCC] text-[#1A1A1A] bg-[#FFFFFF] hover:bg-[#F8F7F6]'
              )}
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-xs border-l border-[#D7CDCC] bg-[#F8F2F1] text-[#1A1A1A] p-0 flex flex-col h-full"
              showCloseButton={false}
            >
              <SheetHeader className="px-4 pt-4 pb-3 border-b border-[#D7CDCC]/60 shrink-0 bg-[#FFFFFF]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] text-[#F8F7F6] flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <SheetTitle className="text-sm font-bold text-[#1A1A1A]">RentalMobil</SheetTitle>
                  </div>
                  <SheetClose className="p-1.5 rounded-lg text-[#756A68] hover:text-[#1A1A1A] hover:bg-[#F8F7F6] transition-all bg-transparent border-0 cursor-pointer" aria-label="Tutup menu">
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                      <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </SheetClose>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-3 px-3">
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href === '/armada' && pathname.startsWith('/armada'));
                    return (
                      <SheetClose key={item.href} className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all w-full',
                            isActive
                              ? 'text-[#1A1A1A] bg-[#FFFFFF] font-bold shadow-xs'
                              : 'text-[#504745] hover:text-[#1A1A1A] hover:bg-[#FFFFFF]/60'
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 border-t border-[#D7CDCC]/60 px-3.5 py-3 flex flex-col gap-2.5 bg-[#FFFFFF]">
                {session && user && (
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E3DDDC]">
                    <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-[#F8F7F6] font-bold text-xs shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1A1A1A] truncate leading-tight">{user?.name || 'Pengguna'}</p>
                      <p className="text-[10px] text-[#756A68] truncate leading-tight">{user?.email}</p>
                    </div>
                  </div>
                )}
                {session && user && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/account" className="w-full flex items-center justify-start gap-1.5 h-8 px-2.5 text-xs font-semibold rounded-lg border border-[#D7CDCC] text-[#2B2322] hover:bg-[#F8F7F6] transition-all">
                        <User size={12} className="text-[#756A68]" />
                        Akun
                      </Link>
                    </SheetClose>
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/riwayat-booking" className="w-full flex items-center justify-start gap-1.5 h-8 px-2.5 text-xs font-semibold rounded-lg border border-[#D7CDCC] text-[#2B2322] hover:bg-[#F8F7F6] transition-all">
                        <CalendarDays size={12} className="text-[#756A68]" />
                        Riwayat
                      </Link>
                    </SheetClose>
                    {user?.role === 'ADMIN' && (
                      <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer col-span-2">
                        <Link href="/admin" className="w-full flex items-center justify-start gap-1.5 h-8 px-2.5 text-xs font-semibold rounded-lg border border-[#D7CDCC] text-[#2B2322] hover:bg-[#F8F7F6] transition-all">
                          <LayoutDashboard size={12} className="text-[#756A68]" />
                          Dashboard Admin
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                )}
                {!session && (
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/login" className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-[#D7CDCC] bg-[#FFFFFF] hover:bg-[#F8F7F6] text-[#1A1A1A] font-semibold text-xs transition-all">
                        <LogIn size={12} />
                        Masuk
                      </Link>
                    </SheetClose>
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/register" className="w-full flex items-center justify-center h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#2C2828] text-[#F8F7F6] font-semibold text-xs transition-all shadow-xs">
                        Daftar
                      </Link>
                    </SheetClose>
                  </div>
                )}
                {session && (
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors bg-transparent border border-rose-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogOut size={12} />
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

