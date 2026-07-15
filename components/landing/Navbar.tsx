'use client';

import { useState, useEffect } from 'react';
import { Menu, Car, ChevronDown, CalendarDays, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react';
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
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Armada', href: '/armada', isDropdown: true },
  { label: 'Layanan', href: '/layanan' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Testimoni', href: '/testimoni' },
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
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-lg shadow-zinc-900/5'
          : 'bg-white/80 backdrop-blur-md border-b border-zinc-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="p-2 bg-zinc-900 text-white rounded-xl transition-all duration-300 group-hover:scale-105">
            <Car size={20} />
          </div>
          <span className="text-xl font-black text-zinc-900 tracking-tight">
            RentalMobil
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.isDropdown) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all duration-200 bg-transparent border-0 cursor-pointer">
                    {item.label}
                    <ChevronDown size={14} className="text-zinc-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-zinc-200">
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.label} className="p-0">
                        <Link
                          href={cat.href}
                          className="w-full block px-4 py-2 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer rounded-md"
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
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  pathname === item.href
                    ? 'text-zinc-900 bg-zinc-100 font-semibold'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all duration-200 bg-transparent border-0 cursor-pointer">
                <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="max-w-[120px] truncate">{user?.name || 'Akun'}</span>
                <ChevronDown size={14} className="text-zinc-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-zinc-200 min-w-[180px]">
                <DropdownMenuItem className="p-0">
                  <Link
                    href={user?.role === 'ADMIN' ? '/admin' : '/account'}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer rounded-md"
                  >
                    <LayoutDashboard size={14} />
                    {user?.role === 'ADMIN' ? 'Dashboard Admin' : 'Profil Saya'}
                  </Link>
                </DropdownMenuItem>
                {user?.role !== 'ADMIN' && (
                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/riwayat-booking"
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer rounded-md"
                    >
                      <CalendarDays size={14} />
                      Riwayat Booking
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="p-0">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-md bg-transparent border-0 text-left"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition-all duration-200"
            >
              <LogIn size={15} />
              Masuk
            </Link>
          )}
          <Link href="/booking">
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center gap-2">
              <CalendarDays size={16} />
              Booking Sekarang
            </Button>
          </Link>
        </div>

        {/* Mobile: Menu Toggle & Sheet */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet>
            <SheetTrigger
              className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 hover:bg-zinc-100 transition-all duration-200 active:scale-95 bg-transparent cursor-pointer"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-80 border-l border-zinc-200 bg-white text-zinc-900 p-0"
              showCloseButton={false}
            >
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-zinc-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-900 text-white rounded-xl">
                      <Car size={20} />
                    </div>
                    <SheetTitle className="text-lg font-black text-zinc-900">
                      RentalMobil
                    </SheetTitle>
                  </div>
                  <SheetClose className="p-2 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 transition-all duration-200 bg-transparent border-0 cursor-pointer" aria-label="Tutup menu">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </SheetClose>
                </div>
              </SheetHeader>

              {/* Nav Links */}
              <div className="px-4 py-6 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                {navItems.map((item) => {
                  if (item.isDropdown) {
                    return (
                      <div key={item.label} className="py-2 px-4">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                          Kategori {item.label}
                        </p>
                        <div className="flex flex-col gap-1 pl-2 border-l border-zinc-200">
                          {categories.map((cat) => (
                            <SheetClose key={cat.label} className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                              <Link
                                href={cat.href}
                                className="block py-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                              >
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
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 w-full',
                          pathname === item.href
                            ? 'text-zinc-900 bg-zinc-100 border border-zinc-200/50'
                            : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-55',
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>

              {/* Mobile Action Buttons in Sheet */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-200 bg-white flex flex-col gap-3">
                <SheetClose className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                  <Link href="/booking" className="w-full">
                    <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl py-5 font-bold">
                      Booking Sekarang
                    </Button>
                  </Link>
                </SheetClose>
                 {session ? (
                  <>
                    <div className="flex gap-2">
                      <SheetClose className="p-0 border-0 bg-transparent text-left w-full cursor-pointer flex-1">
                        <Link href={user?.role === 'ADMIN' ? '/admin' : '/account'} className="w-full">
                          <Button className="w-full bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl py-5 font-bold flex items-center justify-center gap-2 text-xs">
                            <LayoutDashboard size={14} />
                            {user?.role === 'ADMIN' ? 'Admin' : 'Profil'}
                          </Button>
                        </Link>
                      </SheetClose>
                      {user?.role !== 'ADMIN' && (
                        <SheetClose className="p-0 border-0 bg-transparent text-left w-full cursor-pointer flex-1">
                          <Link href="/riwayat-booking" className="w-full">
                            <Button className="w-full bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl py-5 font-bold flex items-center justify-center gap-2 text-xs">
                              <CalendarDays size={14} />
                              Riwayat
                            </Button>
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </>
                ) : (
                  <SheetClose className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                    <Link href="/login" className="w-full">
                      <Button className="w-full bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl py-5 font-bold flex items-center justify-center gap-2">
                        <LogIn size={16} />
                        Masuk / Daftar
                      </Button>
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
