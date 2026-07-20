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
import { UserNotifications } from '@/components/landing/UserNotifications';
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
          {session && user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-all duration-200 bg-transparent border-0 cursor-pointer">
                <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span className="max-w-[120px] truncate font-semibold">{user?.name || 'Pengguna'}</span>
                <ChevronDown size={14} className="text-zinc-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-zinc-200 min-w-[200px] p-1 shadow-lg">
                <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">{user?.name || 'Pengguna'}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                </div>

                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/admin"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer rounded-md font-medium"
                    >
                      <LayoutDashboard size={14} />
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="p-0">
                  <Link
                    href="/account"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer rounded-md font-medium"
                  >
                    <User size={14} />
                    Akun Saya
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="p-0">
                  <Link
                    href="/riwayat-booking"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer rounded-md font-medium"
                  >
                    <CalendarDays size={14} />
                    Riwayat Booking
                  </Link>
                </DropdownMenuItem>

                <div className="border-t border-zinc-100 my-1" />

                <DropdownMenuItem className="p-0">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-md font-medium bg-transparent border-0 text-left"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {session && (
            <UserNotifications />
          )}
          {!session && (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 font-semibold rounded-xl text-sm"
                >
                  <LogIn size={16} />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-sm">
                  Daftar
                </Button>
              </Link>
            </>
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
              className="w-[85vw] max-w-xs border-l border-zinc-200 bg-white text-zinc-900 p-0 flex flex-col h-full"
              showCloseButton={false}
            >
              {/* ── Header ── */}
              <SheetHeader className="px-5 pt-5 pb-4 border-b border-zinc-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-zinc-900 text-white rounded-xl">
                      <Car size={18} />
                    </div>
                    <SheetTitle className="text-base font-black text-zinc-900">
                      RentalMobil
                    </SheetTitle>
                  </div>
                  <SheetClose className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all duration-200 bg-transparent border-0 cursor-pointer" aria-label="Tutup menu">
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </SheetClose>
                </div>
              </SheetHeader>

              {/* ── Scrollable Nav Links ── */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                <div className="flex flex-col gap-0.5">
                  {navItems.map((item) => {
                    if (item.isDropdown) {
                      return (
                        <div key={item.label} className="pt-2 pb-1">
                          {/* Armada parent link */}
                          <SheetClose className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all w-full',
                                pathname === item.href
                                  ? 'text-zinc-900 bg-zinc-100'
                                  : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
                              )}
                            >
                              {item.label}
                            </Link>
                          </SheetClose>
                          {/* Sub-categories */}
                          <div className="flex flex-col gap-0.5 pl-3 mt-0.5 ml-3 border-l-2 border-zinc-100">
                            {categories.map((cat) => (
                              <SheetClose key={cat.label} className="p-0 border-0 bg-transparent text-left w-full cursor-pointer">
                                <Link
                                  href={cat.href}
                                  className="block px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
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
                            'flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all w-full',
                            pathname === item.href
                              ? 'text-zinc-900 bg-zinc-100 font-semibold'
                              : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </div>

              {/* ── Bottom Action Area ── always visible, not overlapping ── */}
              <div className="shrink-0 border-t border-zinc-100 px-4 py-4 flex flex-col gap-3 bg-white">
                {/* User info + notif */}
                {session && user && (
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate leading-tight">{user?.name || 'Pengguna'}</p>
                        <p className="text-[11px] text-zinc-500 truncate leading-tight">{user?.email}</p>
                      </div>
                    </div>
                    <UserNotifications />
                  </div>
                )}

                {/* Quick links for logged-in user */}
                {session && user && (
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/account" className="w-full">
                        <Button variant="outline" className="w-full justify-start text-xs font-semibold rounded-xl gap-1.5 h-9">
                          <User size={13} />
                          Akun Saya
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/riwayat-booking" className="w-full">
                        <Button variant="outline" className="w-full justify-start text-xs font-semibold rounded-xl gap-1.5 h-9">
                          <CalendarDays size={13} />
                          Riwayat
                        </Button>
                      </Link>
                    </SheetClose>
                    {user?.role === 'ADMIN' && (
                      <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer col-span-2">
                        <Link href="/admin" className="w-full">
                          <Button variant="outline" className="w-full justify-start text-xs font-semibold rounded-xl gap-1.5 h-9">
                            <LayoutDashboard size={13} />
                            Dashboard Admin
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                )}

                {/* Login / Register for guests */}
                {!session && (
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/login" className="w-full">
                        <Button className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl h-10 font-bold flex items-center justify-center gap-2">
                          <LogIn size={15} />
                          Login
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                      <Link href="/register" className="w-full">
                        <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-10 font-bold">
                          Daftar
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}

                {/* Booking CTA */}
                <SheetClose className="p-0 border-0 bg-transparent w-full cursor-pointer">
                  <Link href="/booking" className="w-full">
                    <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 font-bold text-sm flex items-center justify-center gap-2">
                      <CalendarDays size={15} />
                      Booking Sekarang
                    </Button>
                  </Link>
                </SheetClose>

                {/* Logout */}
                {session && (
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors bg-transparent border border-red-200 cursor-pointer flex items-center justify-center gap-2"
                  >
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
