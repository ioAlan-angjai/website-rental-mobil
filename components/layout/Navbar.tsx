'use client';

import { useState, useEffect } from 'react';
import { Menu, Car, LogIn, UserPlus, Home, BookOpen, Info, Phone } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Katalog', href: '#katalog', icon: BookOpen },
  { label: 'Tentang', href: '#about', icon: Info },
  { label: 'Kontak', href: '#hubungi', icon: Phone },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ['home', 'katalog', 'how-it-works', 'about', 'testimonials', 'hubungi'];
      let current = '#home';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = `#${id}`;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-slate-900/90 backdrop-blur-xl border-b border-sky-400/15 shadow-lg shadow-slate-900/50'
          : 'bg-slate-900/40 backdrop-blur-md border-b border-sky-400/10',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <a href="#home" className="flex items-center gap-2.5 group shrink-0">
          <div className="p-2 bg-gradient-to-br from-sky-400 to-amber-400 rounded-xl group-hover:shadow-lg group-hover:shadow-sky-400/40 transition-all duration-300 group-hover:scale-105">
            <Car size={22} className="text-slate-900" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
            RentalMobil
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'text-white bg-white/5'
                    : 'text-slate-300 hover:text-white hover:bg-white/5',
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-sky-400 to-amber-400 transition-all duration-300 rounded-full',
                    isActive ? 'w-4/5' : 'w-0 group-hover:w-4/5',
                  )}
                />
              </a>
            );
          })}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-sky-400 border border-sky-400/40 rounded-xl hover:bg-sky-400/10 hover:border-sky-400/70 transition-all duration-200 active:scale-95">
            <LogIn size={15} />
            Login
          </button>
          <button className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-slate-900 bg-gradient-to-r from-sky-400 to-amber-400 rounded-xl hover:shadow-lg hover:shadow-sky-400/40 hover:scale-[1.03] active:scale-95 transition-all duration-200">
            <UserPlus size={15} />
            Daftar
          </button>
        </div>

        {/* Mobile: Sheet Trigger */}
        <Sheet>
          <SheetTrigger>
            <button
              className="md:hidden p-2.5 rounded-xl border border-sky-400/20 text-sky-400 hover:bg-sky-400/10 hover:border-sky-400/50 transition-all duration-200 active:scale-95"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-80 border-l border-sky-400/20 bg-slate-900/95 backdrop-blur-xl text-white p-0"
            showCloseButton={false}
          >
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-sky-400/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-sky-400 to-amber-400 rounded-xl">
                    <Car size={20} className="text-slate-900" />
                  </div>
                  <SheetTitle className="text-lg font-black bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">
                    RentalMobil
                  </SheetTitle>
                </div>
                <SheetClose>
                  <button
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    aria-label="Tutup menu"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </SheetClose>
              </div>
            </SheetHeader>

            {/* Nav Links */}
            <div className="px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.href;
                return (
                  <SheetClose key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl font-medium group transition-all duration-200',
                        isActive
                          ? 'text-white bg-white/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/5',
                      )}
                    >
                      <span
                        className={cn(
                          'p-1.5 rounded-lg transition-colors duration-200',
                          isActive
                            ? 'bg-sky-400/20 text-sky-300'
                            : 'bg-sky-400/10 text-sky-400 group-hover:bg-sky-400/20',
                        )}
                      >
                        <Icon size={16} />
                      </span>
                      {item.label}
                    </a>
                  </SheetClose>
                );
              })}
            </div>

            {/* Auth Buttons in Sheet */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sky-400/10 flex flex-col gap-3">
              <p className="text-xs text-slate-500 font-medium text-center mb-1">
                Mulai perjalanan Anda hari ini
              </p>
              <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-sky-400 border border-sky-400/40 rounded-xl hover:bg-sky-400/10 hover:border-sky-400/70 transition-all duration-200">
                <LogIn size={16} />
                Login
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-900 bg-gradient-to-r from-sky-400 to-amber-400 rounded-xl hover:shadow-lg hover:shadow-sky-400/40 transition-all duration-200">
                <UserPlus size={16} />
                Daftar Gratis
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
